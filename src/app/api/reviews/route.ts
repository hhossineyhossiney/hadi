import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import {
  ensureReviewSystem,
  getPublicReviews,
  getReviewSummary,
  refreshReviewAggregates,
  seedSampleReviews,
} from "@/lib/review-system";
import { sql } from "drizzle-orm";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

function targetFromUrl(url: URL) {
  const instituteId = Number(url.searchParams.get("instituteId") || 0);
  const courseId = Number(url.searchParams.get("courseId") || 0) || null;
  const sellableCourseId = Number(url.searchParams.get("sellableCourseId") || 0) || null;
  return { instituteId, courseId, sellableCourseId };
}

export async function GET(request: Request) {
  try {
    await seedSampleReviews();
    const target = targetFromUrl(new URL(request.url));
    if (!target.instituteId) return NextResponse.json({ error: "instituteId الزامی است" }, { status: 400 });
    const [reviews, summary] = await Promise.all([
      getPublicReviews(target),
      getReviewSummary(target),
    ]);
    return NextResponse.json({ reviews, ...summary });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در دریافت نظرات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureReviewSystem();
    const session = await getServerSession(authOptions);
    const user = session?.user as { id?: string | number; phone?: string; role?: string; name?: string } | undefined;
    const userId = Number(user?.id || 0);
    if (!userId) return NextResponse.json({ error: "برای ثبت نظر ابتدا وارد حساب هنرجویی شوید" }, { status: 401 });
    if (user?.role && user.role !== "student") {
      return NextResponse.json({ error: "ثبت نظر عمومی فقط با حساب هنرجو انجام می‌شود" }, { status: 403 });
    }

    const body = await request.json();
    const instituteId = Number(body.instituteId || 0);
    const courseId = Number(body.courseId || 0) || null;
    const sellableCourseId = Number(body.sellableCourseId || 0) || null;
    const rating = Number(body.rating || 0);
    const comment = String(body.comment || "").trim();

    if (!instituteId || (courseId && sellableCourseId)) {
      return NextResponse.json({ error: "هدف نظر نامعتبر است" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "امتیاز باید بین ۱ تا ۵ باشد" }, { status: 400 });
    }
    if (comment.length < 10 || comment.length > 1500) {
      return NextResponse.json({ error: "متن نظر باید بین ۱۰ تا ۱۵۰۰ کاراکتر باشد" }, { status: 400 });
    }

    if (courseId) {
      const owned = await db.execute(sql`SELECT id FROM courses WHERE id = ${courseId} AND institute_id = ${instituteId} LIMIT 1`);
      if (!rowsOf(owned).length) return NextResponse.json({ error: "دوره متعلق به این آموزشگاه نیست" }, { status: 400 });
    }
    if (sellableCourseId) {
      const owned = await db.execute(sql`SELECT id FROM sellable_courses WHERE id = ${sellableCourseId} AND institute_id = ${instituteId} LIMIT 1`);
      if (!rowsOf(owned).length) return NextResponse.json({ error: "دوره آنلاین متعلق به این آموزشگاه نیست" }, { status: 400 });
    }

    const phone = normalizePhone(String(user?.phone || ""));
    let eligibility;
    if (courseId) {
      eligibility = await db.execute(sql`
        SELECT 1 FROM registrations
        WHERE institute_id = ${instituteId} AND course_id = ${courseId} AND status = 'approved'
          AND (user_id = ${userId} OR phone = ${phone})
        LIMIT 1
      `);
    } else if (sellableCourseId) {
      eligibility = await db.execute(sql`
        SELECT 1 FROM sellable_purchases
        WHERE institute_id = ${instituteId} AND course_id = ${sellableCourseId}
          AND user_id = ${userId} AND status = 'paid'
        LIMIT 1
      `);
    } else {
      eligibility = await db.execute(sql`
        SELECT 1 FROM (
          SELECT id FROM registrations
          WHERE institute_id = ${instituteId} AND status = 'approved'
            AND (user_id = ${userId} OR phone = ${phone})
          UNION ALL
          SELECT id FROM sellable_purchases
          WHERE institute_id = ${instituteId} AND user_id = ${userId} AND status = 'paid'
        ) eligible
        LIMIT 1
      `);
    }
    if (!rowsOf(eligibility).length) {
      return NextResponse.json({
        error: courseId || sellableCourseId
          ? "فقط هنرجوی تأییدشده یا خریدار این دوره می‌تواند نظر ثبت کند"
          : "برای ثبت نظر باید هنرجوی تأییدشده این آموزشگاه باشید",
      }, { status: 403 });
    }

    const authorResult = await db.execute(sql`SELECT name FROM users WHERE id = ${userId} LIMIT 1`);
    const authorName = String(rowsOf<{ name: string }>(authorResult)[0]?.name || user?.name || "هنرجو").slice(0, 255);
    const existingResult = await db.execute(sql`
      SELECT id FROM reviews
      WHERE user_id = ${userId}
        AND institute_id = ${instituteId}
        AND COALESCE(course_id, 0) = ${courseId || 0}
        AND COALESCE(sellable_course_id, 0) = ${sellableCourseId || 0}
      LIMIT 1
    `);
    const existing = rowsOf<{ id: number }>(existingResult)[0];

    if (existing) {
      await db.execute(sql`
        UPDATE reviews
        SET rating = ${rating}, comment = ${comment}, author_name = ${authorName},
            status = 'pending', is_sample = false, is_verified = true, updated_at = NOW()
        WHERE id = ${Number(existing.id)}
      `);
    } else {
      await db.execute(sql`
        INSERT INTO reviews (
          user_id, institute_id, course_id, sellable_course_id, author_name,
          rating, comment, status, is_sample, is_verified, created_at, updated_at
        ) VALUES (
          ${userId}, ${instituteId}, ${courseId}, ${sellableCourseId}, ${authorName},
          ${rating}, ${comment}, 'pending', false, true, NOW(), NOW()
        )
      `);
    }

    await refreshReviewAggregates(instituteId, courseId, sellableCourseId);
    return NextResponse.json({ ok: true, message: "نظر شما ثبت شد و پس از بررسی آموزشگاه منتشر می‌شود" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در ثبت نظر" }, { status: 500 });
  }
}
