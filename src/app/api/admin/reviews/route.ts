import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { ensureReviewSystem, refreshReviewAggregates, seedSampleReviews } from "@/lib/review-system";
import { sql } from "drizzle-orm";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

async function isAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; phone?: string } | undefined;
  return user?.role === "admin" || user?.phone === "09159513179" || user?.phone === "09150000000";
}

async function getReview(reviewId: number) {
  const result = await db.execute(sql`
    SELECT id, institute_id, course_id, sellable_course_id
    FROM reviews WHERE id = ${reviewId} LIMIT 1
  `);
  return rowsOf<{ id: number; institute_id: number; course_id: number | null; sellable_course_id: number | null }>(result)[0];
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await seedSampleReviews();
    const result = await db.execute(sql`
      SELECT
        r.id, r.user_id, r.institute_id, r.course_id, r.sellable_course_id,
        COALESCE(NULLIF(r.author_name, ''), u.name, 'هنرجو') AS author_name,
        r.rating, r.comment, r.status, r.is_sample, r.is_verified,
        r.manager_reply, r.created_at, r.updated_at,
        i.name AS institute_name,
        COALESCE(c.title, sc.title, i.name) AS target_title,
        CASE WHEN r.course_id IS NOT NULL THEN 'course'
             WHEN r.sellable_course_id IS NOT NULL THEN 'online'
             ELSE 'institute' END AS target_type
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      LEFT JOIN institutes i ON i.id = r.institute_id
      LEFT JOIN courses c ON c.id = r.course_id
      LEFT JOIN sellable_courses sc ON sc.id = r.sellable_course_id
      ORDER BY CASE r.status WHEN 'pending' THEN 0 WHEN 'published' THEN 1 ELSE 2 END,
               r.created_at DESC
    `);
    const reviews = rowsOf<any>(result).map((row) => ({
      id: Number(row.id), instituteId: Number(row.institute_id), courseId: row.course_id ? Number(row.course_id) : null,
      sellableCourseId: row.sellable_course_id ? Number(row.sellable_course_id) : null,
      authorName: row.author_name, rating: Number(row.rating), comment: row.comment,
      status: row.status, isSample: !!row.is_sample, isVerified: !!row.is_verified,
      managerReply: row.manager_reply, instituteName: row.institute_name,
      targetTitle: row.target_title, targetType: row.target_type,
      createdAt: row.created_at, updatedAt: row.updated_at,
    }));
    return NextResponse.json({
      reviews,
      stats: {
        total: reviews.length,
        pending: reviews.filter((item) => item.status === "pending").length,
        published: reviews.filter((item) => item.status === "published").length,
        samples: reviews.filter((item) => item.isSample).length,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await ensureReviewSystem();
    const body = await request.json();
    const action = String(body.action || "");
    if (action === "seedSamples") {
      await seedSampleReviews();
      return NextResponse.json({ ok: true });
    }
    const reviewId = Number(body.reviewId || 0);
    const review = await getReview(reviewId);
    if (!review) return NextResponse.json({ error: "نظر یافت نشد" }, { status: 404 });

    if (action === "delete") {
      await db.execute(sql`DELETE FROM reviews WHERE id = ${reviewId}`);
    } else if (action === "status") {
      const status = ["pending", "published", "rejected"].includes(body.status) ? body.status : null;
      if (!status) return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
      await db.execute(sql`UPDATE reviews SET status = ${status}, updated_at = NOW() WHERE id = ${reviewId}`);
    } else if (action === "update") {
      const rating = Number(body.rating || 0);
      const authorName = String(body.authorName || "").trim().slice(0, 255);
      const comment = String(body.comment || "").trim().slice(0, 1500);
      const managerReply = String(body.managerReply || "").trim().slice(0, 1500) || null;
      const status = ["pending", "published", "rejected"].includes(body.status) ? body.status : "published";
      if (!authorName || comment.length < 10 || rating < 1 || rating > 5) return NextResponse.json({ error: "اطلاعات نظر معتبر نیست" }, { status: 400 });
      await db.execute(sql`
        UPDATE reviews SET author_name = ${authorName}, rating = ${rating}, comment = ${comment},
          manager_reply = ${managerReply}, status = ${status}, updated_at = NOW()
        WHERE id = ${reviewId}
      `);
    } else {
      return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });
    }
    await refreshReviewAggregates(review.institute_id, review.course_id, review.sellable_course_id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}
