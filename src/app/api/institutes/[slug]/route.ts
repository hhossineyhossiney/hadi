import { db } from "@/db";
import { institutes, regions, courses, categories, reviews, users } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const institute = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      description: institutes.description,
      address: institutes.address,
      phone: institutes.phone,
      mobile: institutes.mobile,
      email: institutes.email,
      website: institutes.website,
      rating: institutes.rating,
      reviewCount: institutes.reviewCount,
      isVerified: institutes.isVerified,
      isFeatured: institutes.isFeatured,
      lat: institutes.lat,
      lng: institutes.lng,
      regionName: regions.name,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(institutes.slug, slug))
    .then((res) => res[0]);

  if (!institute) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const courseList = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      duration: courses.duration,
      price: courses.price,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      categoryName: categories.name,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.instituteId, institute.id));

  const reviewList = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.instituteId, institute.id))
    .orderBy(reviews.createdAt);

  return NextResponse.json({
    ...institute,
    courses: courseList,
    reviews: reviewList,
  });
}
