import { db } from "@/db";
import { registrations, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/registrations
 * Returns all course IDs the logged-in user has ALREADY registered for (any status,
 * excluding favorite-only records).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ registered: [] });

  const rows = await db
    .select({
      courseId: registrations.courseId,
      status: registrations.status,
      notes: registrations.notes,
      courseSlug: courses.slug,
      courseTitle: courses.title,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .where(eq(registrations.userId, Number(user.id)));

  // Exclude favorite-only records
  const real = rows.filter((r) => r.notes !== "__FAV__");

  return NextResponse.json({
    registered: real.map((r) => ({
      courseId: r.courseId,
      courseSlug: r.courseSlug,
      courseTitle: r.courseTitle,
      status: r.status,
    })),
  });
}
