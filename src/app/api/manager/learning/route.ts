import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

async function findInstitute() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  if (!u?.id) return null;
  let inst = await db.select().from(institutes).where(eq(institutes.userId, Number(u.id))).then(r => r[0]);
  if (inst) return inst;
  if (u.phone) {
    const clean = normalizePhone(String(u.phone));
    const all = await db.select().from(institutes);
    const cand = all.find((i: any) => {
      const ph = [normalizePhone(i.mobile || ""), normalizePhone(i.phone || "")];
      return ph.includes(clean) && (!i.userId || i.userId === Number(u.id));
    });
    if (cand) {
      const [linked] = await db.update(institutes).set({ userId: Number(u.id) }).where(eq(institutes.id, cand.id)).returning();
      if (u.role !== "institute") { try { await db.update(users).set({ role: "institute" as any }).where(eq(users.id, Number(u.id))); } catch {} }
      return linked;
    }
  }
  return null;
}

export async function GET(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "assignments";

  try {
    if (kind === "assignments") {
      const rows = await db.execute(sql`
        SELECT a.*, c.title AS course_title,
               (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id) AS submissions_count,
               (SELECT COUNT(*)::int FROM assignment_submissions WHERE assignment_id = a.id AND status = 'pending') AS pending_count
        FROM assignments a
        LEFT JOIN courses c ON c.id = a.course_id
        WHERE a.institute_id = ${inst.id}
        ORDER BY a.created_at DESC
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "quizzes") {
      const rows = await db.execute(sql`
        SELECT q.*, c.title AS course_title,
               (SELECT COUNT(*)::int FROM quiz_attempts WHERE quiz_id = q.id) AS attempts_count,
               (SELECT COUNT(*)::int FROM quiz_attempts WHERE quiz_id = q.id AND passed = true) AS passed_count
        FROM quizzes q
        LEFT JOIN courses c ON c.id = q.course_id
        WHERE q.institute_id = ${inst.id}
        ORDER BY q.created_at DESC
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "live") {
      const rows = await db.execute(sql`
        SELECT l.*, c.title AS course_title
        FROM live_classes l
        LEFT JOIN courses c ON c.id = l.course_id
        WHERE l.institute_id = ${inst.id}
        ORDER BY l.scheduled_at DESC
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "submissions") {
      const assignmentId = url.searchParams.get("assignmentId");
      if (!assignmentId) return NextResponse.json({ items: [] });
      const rows = await db.execute(sql`
        SELECT s.*, u.name AS user_name, u.phone AS user_phone
        FROM assignment_submissions s
        LEFT JOIN users u ON u.id = s.user_id
        WHERE s.assignment_id = ${Number(assignmentId)}
        ORDER BY s.submitted_at DESC
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    return NextResponse.json({ items: [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const body = await req.json();
  const { action } = body;

  try {
    // === ASSIGNMENTS ===
    if (action === "createAssignment") {
      const { courseId, title, description, dueDate, maxScore } = body;
      const [a] = await db.execute(sql`
        INSERT INTO assignments (course_id, institute_id, title, description, due_date, max_score)
        VALUES (${Number(courseId)}, ${inst.id}, ${title}, ${description || null},
                ${dueDate ? new Date(dueDate) : null}, ${Number(maxScore || 100)})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, item: a });
    }
    if (action === "deleteAssignment") {
      await db.execute(sql`DELETE FROM assignment_submissions WHERE assignment_id = ${Number(body.id)}`);
      await db.execute(sql`DELETE FROM assignments WHERE id = ${Number(body.id)} AND institute_id = ${inst.id}`);
      return NextResponse.json({ ok: true });
    }
    if (action === "reviewSubmission") {
      const { submissionId, score, feedback, status } = body;
      await db.execute(sql`
        UPDATE assignment_submissions
        SET score = ${Number(score || 0)}, feedback = ${feedback || null},
            status = ${status || "reviewed"}, reviewed_at = NOW()
        WHERE id = ${Number(submissionId)}
      `);
      return NextResponse.json({ ok: true });
    }

    // === QUIZZES ===
    if (action === "createQuiz") {
      const { courseId, title, description, durationMinutes, passingScore, questions } = body;
      const [q] = await db.execute(sql`
        INSERT INTO quizzes (course_id, institute_id, title, description, duration_minutes, passing_score, questions)
        VALUES (${Number(courseId)}, ${inst.id}, ${title}, ${description || null},
                ${Number(durationMinutes || 30)}, ${Number(passingScore || 60)},
                ${JSON.stringify(questions || [])}::jsonb)
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, item: q });
    }
    if (action === "deleteQuiz") {
      await db.execute(sql`DELETE FROM quiz_attempts WHERE quiz_id = ${Number(body.id)}`);
      await db.execute(sql`DELETE FROM quizzes WHERE id = ${Number(body.id)} AND institute_id = ${inst.id}`);
      return NextResponse.json({ ok: true });
    }

    // === LIVE CLASSES ===
    if (action === "createLive") {
      const { courseId, title, description, meetingUrl, provider, meetingId, password, scheduledAt, durationMinutes } = body;
      const [l] = await db.execute(sql`
        INSERT INTO live_classes (course_id, institute_id, title, description, meeting_url, provider, meeting_id, password, scheduled_at, duration_minutes)
        VALUES (${Number(courseId)}, ${inst.id}, ${title}, ${description || null},
                ${meetingUrl}, ${provider || "skyroom"}, ${meetingId || null},
                ${password || null}, ${new Date(scheduledAt)}, ${Number(durationMinutes || 60)})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, item: l });
    }
    if (action === "updateLiveStatus") {
      const { id, status, recordingUrl } = body;
      await db.execute(sql`
        UPDATE live_classes
        SET status = ${status}, recording_url = ${recordingUrl || null}
        WHERE id = ${Number(id)} AND institute_id = ${inst.id}
      `);
      return NextResponse.json({ ok: true });
    }
    if (action === "deleteLive") {
      await db.execute(sql`DELETE FROM live_classes WHERE id = ${Number(body.id)} AND institute_id = ${inst.id}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
