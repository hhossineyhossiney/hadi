import { db } from "@/db";
import { courseSessions, courses, institutes } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireManager() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "unauthorized", status: 401 as const };

  const inst = await db.select().from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);
  if (!inst) return { error: "no institute linked", status: 403 as const };

  return { userId: Number(user.id), instituteId: inst.id };
}

async function ensureCourseOwnership(courseId: number, instituteId: number) {
  const c = await db.select().from(courses).where(eq(courses.id, courseId)).then((r) => r[0]);
  if (!c) return { error: "course not found", status: 404 as const };
  if (c.instituteId !== instituteId) return { error: "not your course", status: 403 as const };
  return { course: c };
}

/** GET /api/manager/sessions?courseId=X — list all sessions of a course */
export async function GET(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const courseId = Number(searchParams.get("courseId"));
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const own = await ensureCourseOwnership(courseId, auth.instituteId);
  if ("error" in own) return NextResponse.json({ error: own.error }, { status: own.status });

  const rows = await db.select().from(courseSessions)
    .where(eq(courseSessions.courseId, courseId))
    .orderBy(asc(courseSessions.sessionNumber));

  return NextResponse.json(rows);
}

/** POST /api/manager/sessions — create new session */
export async function POST(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { courseId, sessionNumber, title, sessionDate, sessionTime, duration, isOnline, meetingUrl } = body;

  if (!courseId || !title) return NextResponse.json({ error: "courseId و title الزامی است" }, { status: 400 });

  const own = await ensureCourseOwnership(Number(courseId), auth.instituteId);
  if ("error" in own) return NextResponse.json({ error: own.error }, { status: own.status });

  // Auto-assign sessionNumber if not provided
  let sNum = Number(sessionNumber);
  if (!sNum || sNum <= 0) {
    const last = await db.select().from(courseSessions)
      .where(eq(courseSessions.courseId, Number(courseId)))
      .orderBy(asc(courseSessions.sessionNumber));
    sNum = (last[last.length - 1]?.sessionNumber || 0) + 1;
  }

  const [row] = await db.insert(courseSessions).values({
    courseId: Number(courseId),
    sessionNumber: sNum,
    title: String(title).slice(0, 255),
    sessionDate: sessionDate || null,
    sessionTime: sessionTime || null,
    duration: duration || null,
    isOnline: !!isOnline,
    meetingUrl: meetingUrl || null,
  }).returning();

  return NextResponse.json({ ok: true, session: row });
}

/** PATCH — update a session */
export async function PATCH(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verify ownership via session -> course
  const sess = await db.select().from(courseSessions).where(eq(courseSessions.id, Number(id))).then((r) => r[0]);
  if (!sess) return NextResponse.json({ error: "session not found" }, { status: 404 });
  const own = await ensureCourseOwnership(sess.courseId, auth.instituteId);
  if ("error" in own) return NextResponse.json({ error: own.error }, { status: own.status });

  const updates: any = {};
  if (fields.sessionNumber !== undefined) updates.sessionNumber = Number(fields.sessionNumber);
  if (fields.title !== undefined) updates.title = String(fields.title).slice(0, 255);
  if (fields.sessionDate !== undefined) updates.sessionDate = fields.sessionDate || null;
  if (fields.sessionTime !== undefined) updates.sessionTime = fields.sessionTime || null;
  if (fields.duration !== undefined) updates.duration = fields.duration || null;
  if (fields.isOnline !== undefined) updates.isOnline = !!fields.isOnline;
  if (fields.meetingUrl !== undefined) updates.meetingUrl = fields.meetingUrl || null;

  const [row] = await db.update(courseSessions).set(updates)
    .where(eq(courseSessions.id, Number(id))).returning();
  return NextResponse.json({ ok: true, session: row });
}

/** DELETE */
export async function DELETE(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sess = await db.select().from(courseSessions).where(eq(courseSessions.id, Number(id))).then((r) => r[0]);
  if (!sess) return NextResponse.json({ ok: true });
  const own = await ensureCourseOwnership(sess.courseId, auth.instituteId);
  if ("error" in own) return NextResponse.json({ error: own.error }, { status: own.status });

  await db.delete(courseSessions).where(eq(courseSessions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
