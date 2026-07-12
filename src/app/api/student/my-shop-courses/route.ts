import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

// GET: list all shop courses the logged-in student has purchased
// includes chapters + lessons with videoUrl (since user has access)
export async function GET() {
  try {
    const s = await getServerSession(authOptions);
    const uid = Number((s?.user as any)?.id);
    if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    // 1) purchases (paid) with course info
    const purRows = await db.execute(sql`
      SELECT p.id AS purchase_id, p.amount, p.payment_method, p.status,
             p.access_expires_at, p.progress AS purchase_progress,
             p.last_lesson_id, p.created_at AS purchased_at,
             c.id AS course_id, c.slug, c.title, c.subtitle, c.description,
             c.cover_image, c.instructor, c.instructor_title, c.instructor_avatar,
             c.level, c.total_duration, c.total_lessons, c.total_chapters,
             c.rating, c.rating_count, c.has_certificate, c.lifetime_access,
             c.published_at,
             i.name AS institute_name, i.slug AS institute_slug, i.phone AS institute_phone
      FROM sellable_purchases p
      JOIN sellable_courses c ON c.id = p.course_id
      LEFT JOIN institutes i ON i.id = p.institute_id
      WHERE p.user_id = ${uid} AND p.status = 'paid'
      ORDER BY p.created_at DESC
    `);
    const purchases = ((purRows as any).rows || purRows) as any[];
    if (purchases.length === 0) return NextResponse.json({ purchases: [] });

    // 2) For each purchase, fetch chapters + lessons
    const enriched = await Promise.all(purchases.map(async (p: any) => {
      const chRows = await db.execute(sql`
        SELECT id, course_id, title, description, cover_image, order_index, is_free
        FROM sellable_chapters WHERE course_id = ${p.course_id} ORDER BY order_index
      `);
      const chapters = ((chRows as any).rows || chRows) as any[];

      const lRows = await db.execute(sql`
        SELECT id, chapter_id, course_id, title, type, description, cover_image,
               video_url, video_provider, video_duration, content,
               is_free, order_index
        FROM sellable_lessons WHERE course_id = ${p.course_id} ORDER BY order_index
      `);
      const lessons = ((lRows as any).rows || lRows) as any[];

      // Progress per lesson
      const prgRows = await db.execute(sql`
        SELECT lesson_id, is_completed, watched_seconds, completed_at
        FROM sellable_lesson_progress WHERE user_id = ${uid} AND purchase_id = ${p.purchase_id}
      `);
      const progressMap = new Map<number, any>();
      for (const r of ((prgRows as any).rows || prgRows) as any[]) {
        progressMap.set(Number(r.lesson_id), r);
      }

      const chaptersWithLessons = chapters.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        description: ch.description,
        coverImage: ch.cover_image,
        orderIndex: ch.order_index,
        isFree: ch.is_free,
        lessons: lessons
          .filter((l: any) => l.chapter_id === ch.id)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            type: l.type,
            description: l.description,
            coverImage: l.cover_image,
            videoUrl: l.video_url,           // ← full access
            videoProvider: l.video_provider,
            videoDuration: l.video_duration,
            content: l.content,
            isFree: l.is_free,
            orderIndex: l.order_index,
            isCompleted: !!progressMap.get(l.id)?.is_completed,
            watchedSeconds: progressMap.get(l.id)?.watched_seconds || 0,
          })),
      }));

      const totalLessons = lessons.length;
      const completedLessons = Array.from(progressMap.values()).filter((p: any) => p.is_completed).length;
      const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        purchaseId: p.purchase_id,
        purchasedAt: p.purchased_at,
        amount: p.amount,
        paymentMethod: p.payment_method,
        accessExpiresAt: p.access_expires_at,
        lifetimeAccess: p.lifetime_access,
        progress: progressPct,
        completedLessons,
        totalLessons,
        lastLessonId: p.last_lesson_id,
        course: {
          id: p.course_id,
          slug: p.slug,
          title: p.title,
          subtitle: p.subtitle,
          description: p.description,
          coverImage: p.cover_image,
          instructor: p.instructor,
          instructorTitle: p.instructor_title,
          instructorAvatar: p.instructor_avatar,
          level: p.level,
          totalDuration: p.total_duration,
          totalLessons: p.total_lessons,
          totalChapters: p.total_chapters,
          hasCertificate: p.has_certificate,
        },
        institute: {
          name: p.institute_name,
          slug: p.institute_slug,
          phone: p.institute_phone,
        },
        chapters: chaptersWithLessons,
      };
    }));

    return NextResponse.json({ purchases: enriched });
  } catch (e: any) {
    console.error("[my-shop-courses] error:", e?.message);
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}

// POST: mark a lesson complete / update progress
export async function POST(req: Request) {
  try {
    const s = await getServerSession(authOptions);
    const uid = Number((s?.user as any)?.id);
    if (!uid) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { purchaseId, lessonId, isCompleted, watchedSeconds } = await req.json();
    if (!purchaseId || !lessonId) return NextResponse.json({ error: "params required" }, { status: 400 });

    // verify ownership
    const ownRow = await db.execute(sql`
      SELECT id FROM sellable_purchases WHERE id = ${Number(purchaseId)} AND user_id = ${uid} AND status = 'paid' LIMIT 1
    `);
    if (((ownRow as any).rows || ownRow).length === 0) {
      return NextResponse.json({ error: "دسترسی به این دوره ندارید" }, { status: 403 });
    }

    // upsert progress
    await db.execute(sql`
      INSERT INTO sellable_lesson_progress (user_id, purchase_id, lesson_id, is_completed, watched_seconds, completed_at)
      VALUES (${uid}, ${Number(purchaseId)}, ${Number(lessonId)},
              ${!!isCompleted}, ${Number(watchedSeconds ?? 0)},
              ${isCompleted ? new Date().toISOString() : null})
      ON CONFLICT (user_id, lesson_id) DO UPDATE SET
        is_completed = EXCLUDED.is_completed,
        watched_seconds = GREATEST(sellable_lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
        completed_at = CASE WHEN EXCLUDED.is_completed THEN COALESCE(sellable_lesson_progress.completed_at, NOW()) ELSE NULL END
    `);

    // update purchase overall progress
    const totalRow = await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM sellable_lessons WHERE course_id = (SELECT course_id FROM sellable_purchases WHERE id = ${Number(purchaseId)})
    `);
    const total = Number(((totalRow as any).rows || totalRow)[0]?.total || 0);
    const doneRow = await db.execute(sql`
      SELECT COUNT(*)::int AS done FROM sellable_lesson_progress WHERE purchase_id = ${Number(purchaseId)} AND is_completed = true
    `);
    const done = Number(((doneRow as any).rows || doneRow)[0]?.done || 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await db.execute(sql`
      UPDATE sellable_purchases SET progress = ${progress}, last_lesson_id = ${Number(lessonId)}, updated_at = NOW()
      WHERE id = ${Number(purchaseId)}
    `);

    return NextResponse.json({ ok: true, progress });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
