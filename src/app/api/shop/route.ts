import { NextResponse } from "next/server";
import { db } from "@/db";
import { sellableCourses, institutes, categories } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { seedSampleReviews } from "@/lib/review-system";

// GET /api/shop?featured=1&limit=6  or ?all=1
export async function GET(req: Request) {
  await seedSampleReviews();
  const url = new URL(req.url);
  const featured = url.searchParams.get("featured");
  const limit = Math.min(Number(url.searchParams.get("limit") || 100), 200);
  const q = url.searchParams.get("q") || "";

  try {
    const rows = await db.execute(sql`
      SELECT sc.id, sc.slug, sc.title, sc.subtitle, sc.description, sc.cover_image,
             sc.instructor, sc.instructor_title, sc.instructor_avatar,
             sc.level, sc.price, sc.original_price, sc.discount_percent,
             sc.total_lessons, sc.total_chapters, sc.total_duration,
             (SELECT COUNT(*)::int FROM sellable_purchases sp WHERE sp.course_id = sc.id AND sp.status = 'paid') AS students_count,
             sc.rating, sc.rating_count,
             sc.is_featured, sc.has_certificate, sc.has_support, sc.lifetime_access,
             sc.published_at, sc.features,
             i.id AS institute_id, i.name AS institute_name, i.slug AS institute_slug,
             c.name AS category_name
      FROM sellable_courses sc
      LEFT JOIN institutes i ON i.id = sc.institute_id
      LEFT JOIN categories c ON c.id = sc.category_id
      WHERE sc.is_published = true AND sc.status = 'published'
        ${featured === "1" ? sql`AND sc.is_featured = true` : sql``}
        ${q ? sql`AND (sc.title ILIKE ${'%' + q + '%'} OR sc.subtitle ILIKE ${'%' + q + '%'})` : sql``}
      ORDER BY sc.is_featured DESC, sc.published_at DESC NULLS LAST
      LIMIT ${limit}
    `);
    const list = ((rows as any).rows || rows) as any[];
    // Replace Base64 cover_image with lightweight API URL
    const pruned = list.map((c: any) => {
      if (typeof c.cover_image === "string" && c.cover_image.startsWith("data:") && c.cover_image.length > 200) {
        c.cover_image = `/api/media/shop_course/${c.id}?field=cover`;
      }
      return c;
    });
    return NextResponse.json({ courses: pruned });
  } catch (e: any) {
    return NextResponse.json({ courses: [], error: e?.message }, { status: 200 });
  }
}
