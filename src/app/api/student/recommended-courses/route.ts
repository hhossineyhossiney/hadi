import { db } from "@/db";
import { siteSettings, courses, institutes, categories, registrations } from "@/db/schema";
import { eq, inArray, and, notInArray, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/recommended-courses
 * Returns admin-curated recommended courses, EXCLUDING those the user is already registered for.
 * If admin hasn't set any, falls back to most popular courses.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  // Get admin-curated recommended course IDs
  let recommendedIds: number[] = [];
  try {
    const setting = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.key, "recommended_courses"))
      .then((r) => r[0]);
    recommendedIds = ((setting?.value as number[]) || []);
  } catch {}

  // Get user's already-registered course IDs (to exclude)
  let excludeIds: number[] = [];
  if (user?.id) {
    try {
      const regs = await db
        .select({ courseId: registrations.courseId, notes: registrations.notes })
        .from(registrations)
        .where(eq(registrations.userId, Number(user.id)));
      // Exclude both real registrations and favorite-only markers
      excludeIds = regs.map((r) => r.courseId).filter(Boolean) as number[];
    } catch {}
  }

  // Build course query
  const conditions: any[] = [];
  if (recommendedIds.length > 0) {
    conditions.push(inArray(courses.id, recommendedIds));
  }
  if (excludeIds.length > 0) {
    conditions.push(notInArray(courses.id, excludeIds));
  }
  // Only show approved courses that aren't closed/ended
  conditions.push(eq(courses.status, "approved"));

  let list: any[] = [];
  try {
    // Try with new columns
    list = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        price: courses.price,
        duration: courses.duration,
        instructor: courses.instructor,
        capacity: courses.capacity,
        enrolledCount: courses.enrolledCount,
        image: courses.image,
        registrationClosed: courses.registrationClosed,
        registrationEnded: courses.registrationEnded,
        categoryName: categories.name,
        instituteName: institutes.name,
        instituteSlug: institutes.slug,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt))
      .limit(6);
  } catch {
    // Fallback without new columns
    list = await db
      .select({
        id: courses.id,
        title: courses.title,
        slug: courses.slug,
        description: courses.description,
        price: courses.price,
        duration: courses.duration,
        instructor: courses.instructor,
        capacity: courses.capacity,
        enrolledCount: courses.enrolledCount,
        image: courses.image,
        categoryName: categories.name,
        instituteName: institutes.name,
        instituteSlug: institutes.slug,
      })
      .from(courses)
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .where(and(...conditions))
      .orderBy(desc(courses.createdAt))
      .limit(6);
    list = list.map((c) => ({ ...c, registrationClosed: false, registrationEnded: false }));
  }

  // Filter out full/closed courses in JS
  const available = list.filter((c) => {
    if (c.registrationClosed || c.registrationEnded) return false;
    if (c.capacity && c.capacity > 0 && (c.enrolledCount || 0) >= c.capacity) return false;
    return true;
  });

  // If admin curated none, fall back to random popular ones (excluding user's registrations)
  if (recommendedIds.length === 0 && available.length === 0) {
    return NextResponse.json([]);
  }

  return NextResponse.json(available.slice(0, 4));
}
