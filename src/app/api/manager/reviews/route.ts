import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { institutes } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  ensureReviewSystem,
  refreshReviewAggregates,
  seedSampleReviews,
} from "@/lib/review-system";
import { normalizePhone } from "@/lib/phone";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

async function findInstitute() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string | number; phone?: string } | undefined;
  const userId = Number(user?.id || 0);
  if (!userId) return null;
  const linked = await db.select().from(institutes).where(eq(institutes.userId, userId)).then((items) => items[0]);
  if (linked) return linked;
  if (user?.phone) {
    const phone = normalizePhone(user.phone);
    const all = await db.select().from(institutes);
    const candidate = all.find((item) => !item.userId && [item.phone, item.mobile].filter(Boolean).some((value) => normalizePhone(String(value)) === phone));
    if (candidate) {
      const updated = await db.update(institutes).set({ userId }).where(eq(institutes.id, candidate.id)).returning();
      return updated[0] || candidate;
    }
  }
  return null;
}

async function getOwnedReview(reviewId: number, instituteId: number) {
  const result = await db.execute(sql`
    SELECT id, institute_id, course_id, sellable_course_id
    FROM reviews WHERE id = ${reviewId} AND institute_id = ${instituteId} LIMIT 1
  `);
  return rowsOf<{ id: number; institute_id: number; course_id: number | null; sellable_course_id: number | null }>(result)[0];
}

async function verifyTarget(instituteId: number, courseId: number | null, sellableCourseId: number | null) {
  if (courseId && sellableCourseId) return false;
  if (courseId) {
    const result = await db.execute(sql`SELECT id FROM courses WHERE id = ${courseId} AND institute_id = ${instituteId} LIMIT 1`);
    return rowsOf(result).length > 0;
  }
  if (sellableCourseId) {
    const result = await db.execute(sql`SELECT id FROM sellable_courses WHERE id = ${sellableCourseId} AND institute_id = ${instituteId} LIMIT 1`);
    return rowsOf(result).length > 0;
  }
  return true;
}

export async function GET() {
  try {
    const institute = await findInstitute();
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 403 });
    await seedSampleReviews();

    const [reviewResult, courseResult, onlineResult] = await Promise.all([
      db.execute(sql`
        SELECT
          r.id, r.user_id, r.institute_id, r.course_id, r.sellable_course_id,
          COALESCE(NULLIF(r.author_name, ''), u.name, 'هنرجو') AS author_name,
          r.rating, r.comment, r.status, r.is_sample, r.is_verified,
          r.manager_reply, r.created_at, r.updated_at,
          COALESCE(c.title, sc.title, ${institute.name}) AS target_title,
          CASE WHEN r.course_id IS NOT NULL THEN 'course'
               WHEN r.sellable_course_id IS NOT NULL THEN 'online'
               ELSE 'institute' END AS target_type
        FROM reviews r
        LEFT JOIN users u ON u.id = r.user_id
        LEFT JOIN courses c ON c.id = r.course_id
        LEFT JOIN sellable_courses sc ON sc.id = r.sellable_course_id
        WHERE r.institute_id = ${institute.id}
        ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END,
                 r.created_at DESC
      `),
      db.execute(sql`SELECT id, title FROM courses WHERE institute_id = ${institute.id} ORDER BY created_at DESC`),
      db.execute(sql`SELECT id, title FROM sellable_courses WHERE institute_id = ${institute.id} ORDER BY created_at DESC`),
    ]);

    const reviews = rowsOf<any>(reviewResult).map((row) => ({
      id: Number(row.id),
      userId: row.user_id ? Number(row.user_id) : null,
      instituteId: Number(row.institute_id),
      courseId: row.course_id ? Number(row.course_id) : null,
      sellableCourseId: row.sellable_course_id ? Number(row.sellable_course_id) : null,
      authorName: row.author_name,
      rating: Number(row.rating),
      comment: row.comment,
      status: row.status,
      isSample: !!row.is_sample,
      isVerified: !!row.is_verified,
      managerReply: row.manager_reply,
      targetTitle: row.target_title,
      targetType: row.target_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({
      institute: { id: institute.id, name: institute.name },
      reviews,
      courses: rowsOf<{ id: number; title: string }>(courseResult),
      onlineCourses: rowsOf<{ id: number; title: string }>(onlineResult),
      stats: {
        total: reviews.length,
        pending: reviews.filter((item) => item.status === "pending").length,
        published: reviews.filter((item) => item.status === "published").length,
        samples: reviews.filter((item) => item.isSample).length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در دریافت نظرات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const institute = await findInstitute();
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 403 });
    await ensureReviewSystem();
    const body = await request.json();
    const action = String(body.action || "");

    if (action === "seedSamples") {
      await seedSampleReviews();
      return NextResponse.json({ ok: true });
    }

    if (action === "create") {
      const courseId = Number(body.courseId || 0) || null;
      const sellableCourseId = Number(body.sellableCourseId || 0) || null;
      const rating = Number(body.rating || 0);
      const authorName = String(body.authorName || "").trim().slice(0, 255);
      const comment = String(body.comment || "").trim().slice(0, 1500);
      const status = ["pending", "published", "rejected"].includes(body.status) ? body.status : "published";
      if (!(await verifyTarget(institute.id, courseId, sellableCourseId))) return NextResponse.json({ error: "هدف نظر معتبر نیست" }, { status: 400 });
      if (!authorName || comment.length < 10 || rating < 1 || rating > 5) return NextResponse.json({ error: "نام، امتیاز و متن معتبر الزامی است" }, { status: 400 });
      await db.execute(sql`
        INSERT INTO reviews (
          user_id, institute_id, course_id, sellable_course_id, author_name,
          rating, comment, status, is_sample, is_verified, manager_reply,
          created_at, updated_at
        ) VALUES (
          NULL, ${institute.id}, ${courseId}, ${sellableCourseId}, ${authorName},
          ${rating}, ${comment}, ${status}, true, false, ${body.managerReply || null},
          NOW(), NOW()
        )
      `);
      await refreshReviewAggregates(institute.id, courseId, sellableCourseId);
      return NextResponse.json({ ok: true });
    }

    const reviewId = Number(body.reviewId || 0);
    const review = await getOwnedReview(reviewId, institute.id);
    if (!review) return NextResponse.json({ error: "نظر یافت نشد" }, { status: 404 });

    if (action === "delete") {
      await db.execute(sql`DELETE FROM reviews WHERE id = ${reviewId}`);
      await refreshReviewAggregates(institute.id, review.course_id, review.sellable_course_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "status") {
      const status = ["pending", "published", "rejected"].includes(body.status) ? body.status : null;
      if (!status) return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
      await db.execute(sql`UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${reviewId}`);
      await refreshReviewAggregates(institute.id, review.course_id, review.sellable_course_id);
      return NextResponse.json({ ok: true });
    }

    if (action === "update") {
      const rating = Number(body.rating || 0);
      const authorName = String(body.authorName || "").trim().slice(0, 255);
      const comment = String(body.comment || "").trim().slice(0, 1500);
      const managerReply = String(body.managerReply || "").trim().slice(0, 1500) || null;
      const status = ["pending", "published", "rejected"].includes(body.status) ? body.status : "published";
      if (!authorName || comment.length < 10 || rating < 1 || rating > 5) return NextResponse.json({ error: "نام، امتیاز و متن معتبر الزامی است" }, { status: 400 });
      await db.execute(sql`
        UPDATE reviews
        SET author_name = ${authorName}, rating = ${rating}, comment = ${comment},
            manager_reply = ${managerReply}, status = ${status}, updated_at = NOW()
        WHERE id = ${reviewId}
      `);
      await refreshReviewAggregates(institute.id, review.course_id, review.sellable_course_id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در مدیریت نظر" }, { status: 500 });
  }
}
