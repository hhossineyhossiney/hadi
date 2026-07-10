import { db } from "@/db";
import { courseSessions, registrations, courses, institutes } from "@/db/schema";
import { eq, and, inArray, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/schedule
 * Returns all sessions of courses the logged-in user is enrolled in (approved),
 * enriched with course/institute info.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json([]);

  const userId = Number(user.id);

  // Get approved course IDs of this user
  const approvedRegs = await db
    .select({
      courseId: registrations.courseId,
      progress: registrations.progress,
      sessionsAttended: registrations.sessionsAttended,
    })
    .from(registrations)
    .where(and(eq(registrations.userId, userId), eq(registrations.status, "approved")));

  const courseIds = Array.from(new Set(approvedRegs.map((r) => r.courseId).filter(Boolean))) as number[];
  if (courseIds.length === 0) return NextResponse.json([]);

  // Get sessions of those courses with course/institute info
  const rows = await db
    .select({
      id: courseSessions.id,
      courseId: courseSessions.courseId,
      sessionNumber: courseSessions.sessionNumber,
      title: courseSessions.title,
      sessionDate: courseSessions.sessionDate,
      sessionTime: courseSessions.sessionTime,
      duration: courseSessions.duration,
      isOnline: courseSessions.isOnline,
      meetingUrl: courseSessions.meetingUrl,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      totalSessions: courses.totalSessions,
    })
    .from(courseSessions)
    .leftJoin(courses, eq(courseSessions.courseId, courses.id))
    .leftJoin(institutes, eq(courses.instituteId, institutes.id))
    .where(inArray(courseSessions.courseId, courseIds))
    .orderBy(asc(courseSessions.sessionDate), asc(courseSessions.sessionNumber));

  // Attach attendance info per session
  const enriched = rows.map((s) => {
    const reg = approvedRegs.find((r) => r.courseId === s.courseId);
    const attended = (reg?.sessionsAttended || 0) >= (s.sessionNumber || 0);
    return { ...s, attended };
  });

  return NextResponse.json(enriched);
}
