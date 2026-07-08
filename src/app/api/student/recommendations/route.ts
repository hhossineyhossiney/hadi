import { db } from "@/db";
import { siteSettings, institutes, courses, categories } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const setting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, "recommended_institutes"))
    .then((r) => r[0]);

  const ids = ((setting?.value as number[]) || []).slice(0, 2);
  if (ids.length === 0) return NextResponse.json([]);

  const list = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      address: institutes.address,
      rating: institutes.rating,
    })
    .from(institutes)
    .where(inArray(institutes.id, ids));

  const withCourses = await Promise.all(
    list.map(async (inst) => {
      const courseList = await db
        .select({
          id: courses.id,
          title: courses.title,
          slug: courses.slug,
          price: courses.price,
          categoryName: categories.name,
        })
        .from(courses)
        .leftJoin(categories, eq(courses.categoryId, categories.id))
        .where(eq(courses.instituteId, inst.id))
        .limit(3);
      return { ...inst, courses: courseList };
    })
  );

  return NextResponse.json(withCourses);
}
