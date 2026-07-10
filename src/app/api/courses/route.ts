import { db } from "@/db";
import { courses, institutes, categories, regions } from "@/db/schema";
import { sql, eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");

  const conditions = [];

  if (category) {
    conditions.push(eq(categories.slug, category));
  }
  if (q) {
    conditions.push(
      sql`${courses.title} ILIKE ${"%" + q + "%"}`
    );
  }
  if (featured === "true") {
    conditions.push(eq(courses.isFeatured, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const runQuery = (withNew: boolean) => {
    const baseFields: any = {
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      duration: courses.duration,
      price: courses.price,
      originalPrice: courses.originalPrice,
      level: courses.level,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      startDate: courses.startDate,
      image: courses.image,
      fullDescription: courses.fullDescription,
      categoryName: categories.name,
      categorySlug: categories.slug,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      regionName: regions.name,
    };
    if (withNew) {
      baseFields.registrationClosed = courses.registrationClosed;
      baseFields.registrationEnded = courses.registrationEnded;
    }
    return db
      .select(baseFields)
      .from(courses)
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(regions, eq(institutes.regionId, regions.id))
      .where(whereClause)
      .orderBy(sql`${courses.createdAt} DESC`);
  };

  try {
    const data = await runQuery(true);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("Falling back to legacy query:", e?.message);
    const data = await runQuery(false);
    return NextResponse.json(
      data.map((d: any) => ({ ...d, registrationClosed: false, registrationEnded: false }))
    );
  }
}
