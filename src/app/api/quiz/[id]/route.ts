import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const qRow = await db.execute(sql`SELECT id, title, description, duration_minutes, passing_score, max_attempts, questions, course_id FROM quizzes WHERE id = ${Number(id)}`);
  const q = ((qRow as any).rows || qRow)[0];
  if (!q) return NextResponse.json({ error: "یافت نشد" }, { status: 404 });

  // Check enrollment
  const enroll = await db.execute(sql`SELECT id FROM registrations WHERE user_id = ${uid} AND course_id = ${q.course_id} AND status='approved' LIMIT 1`);
  if (((enroll as any).rows || enroll).length === 0) {
    return NextResponse.json({ error: "شما در این دوره ثبت‌نام ندارید" }, { status: 403 });
  }

  // Strip correctIndex from questions before sending (student shouldn't see)
  const questions = (q.questions || []).map((qq: any) => ({ q: qq.q, options: qq.options, points: qq.points }));
  return NextResponse.json({ ...q, questions });
}
