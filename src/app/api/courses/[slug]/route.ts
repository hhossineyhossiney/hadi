import { db } from "@/db";
import { courses, institutes, categories, regions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getPublicReviews, getReviewSummary, seedSampleReviews } from "@/lib/review-system";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await seedSampleReviews();

  const runQuery = (withNew: boolean) => {
    const fields: any = {
      id: courses.id,
      instituteId: courses.instituteId,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      fullDescription: courses.fullDescription,
      duration: courses.duration,
      price: courses.price,
      capacity: courses.capacity,
      enrolledCount: sql<number>`(SELECT COUNT(*)::int FROM registrations reg WHERE reg.course_id = ${courses.id} AND reg.status = 'approved')`,
      instructor: courses.instructor,
      requirements: courses.requirements,
      schedule: courses.schedule,
      startDate: courses.startDate,
      image: courses.image,
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
      fields.scheduleDays = (courses as any).scheduleDays;
      fields.scheduleTime = (courses as any).scheduleTime;
      fields.sessionDuration = (courses as any).sessionDuration;
      fields.totalHours = (courses as any).totalHours;
      fields.endDate = (courses as any).endDate;
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

  const [reviews, summary] = await Promise.all([
    getPublicReviews({ instituteId: Number(course.instituteId), courseId: Number(course.id) }),
    getReviewSummary({ instituteId: Number(course.instituteId), courseId: Number(course.id) }),
  ]);

  return NextResponse.json({ ...course, reviews, rating: summary.rating, reviewCount: summary.reviewCount });
}
