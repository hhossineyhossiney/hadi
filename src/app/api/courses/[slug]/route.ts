import { db } from "@/db";
import { courses, institutes, categories, regions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const runQuery = (withNew: boolean) => {
    const fields: any = {
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      fullDescription: courses.fullDescription,
      duration: courses.duration,
      price: courses.price,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      requirements: courses.requirements,
      schedule: courses.schedule,
      startDate: courses.startDate,
      bannerImages: courses.bannerImages,
      totalSessions: courses.totalSessions,
      level: courses.level,
      instructorTitle: courses.instructorTitle,
      originalPrice: courses.originalPrice,
      categoryName: categories.name,
      categorySlug: categories.slug,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      institutePhone: institutes.phone,
      instituteMobile: institutes.mobile,
      instituteAddress: institutes.address,
      regionName: regions.name,
    };
    if (withNew) {
      fields.registrationClosed = courses.registrationClosed;
      fields.registrationEnded = courses.registrationEnded;
    }
    return db
      .select(fields)
      .from(courses)
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(regions, eq(institutes.regionId, regions.id))
      .where(eq(courses.slug, slug))
      .then((res: any[]) => res[0]);
  };

  let course: any;
  try {
    course = await runQuery(true);
  } catch (e: any) {
    console.error("Fallback query in course/[slug]:", e?.message);
    course = await runQuery(false);
    if (course) {
      course.registrationClosed = false;
      course.registrationEnded = false;
    }
  }

  if (!course) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}
