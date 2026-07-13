import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const url = new URL(req.url);
  const kind = url.searchParams.get("kind") || "assignments";

  try {
    // find enrolled courses for this user
    const enrolledRows = await db.execute(sql`
      SELECT course_id FROM registrations WHERE user_id = ${uid} AND status = 'approved'
    `);
    const enrolledIds = (((enrolledRows as any).rows || enrolledRows) as any[]).map(r => Number(r.course_id));
    if (enrolledIds.length === 0) return NextResponse.json({ items: [] });

    const idsList = enrolledIds.join(",");
    if (kind === "assignments") {
      const rows = await db.execute(sql.raw(`
        SELECT a.*, c.title AS course_title, i.name AS institute_name,
               s.id AS submission_id, s.status AS sub_status, s.score, s.feedback, s.submitted_at
        FROM assignments a
        LEFT JOIN courses c ON c.id = a.course_id
        LEFT JOIN institutes i ON i.id = a.institute_id
        LEFT JOIN assignment_submissions s ON s.assignment_id = a.id AND s.user_id = ${uid}
        WHERE a.course_id IN (${idsList})
        ORDER BY a.due_date ASC NULLS LAST, a.created_at DESC
      `));
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "quizzes") {
      const rows = await db.execute(sql.raw(`
        SELECT q.id, q.title, q.description, q.duration_minutes, q.passing_score, q.max_attempts,
               q.scheduled_at, q.available_until,
               c.title AS course_title,
               (SELECT COUNT(*)::int FROM quiz_attempts WHERE quiz_id = q.id AND user_id = ${uid}) AS my_attempts,
               (SELECT MAX(percent) FROM quiz_attempts WHERE quiz_id = q.id AND user_id = ${uid}) AS best_score
        FROM quizzes q
        LEFT JOIN courses c ON c.id = q.course_id
        WHERE q.course_id IN (${idsList})
        ORDER BY q.scheduled_at DESC NULLS LAST
      `));
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "live") {
      const rows = await db.execute(sql.raw(`
        SELECT l.*, c.title AS course_title, i.name AS institute_name
        FROM live_classes l
        LEFT JOIN courses c ON c.id = l.course_id
        LEFT JOIN institutes i ON i.id = l.institute_id
        WHERE l.course_id IN (${idsList})
        ORDER BY l.scheduled_at DESC
      `));
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    if (kind === "points") {
      const rows = await db.execute(sql`
        SELECT COALESCE(SUM(points), 0)::int AS total_points,
               (SELECT COUNT(*)::int FROM user_points WHERE user_id = ${uid}) AS entries
      `);
      const list = await db.execute(sql`
        SELECT * FROM user_points WHERE user_id = ${uid} ORDER BY created_at DESC LIMIT 20
      `);
      return NextResponse.json({
        total: (((rows as any).rows || rows)[0]?.total_points) || 0,
        history: ((list as any).rows || list),
      });
    }
    return NextResponse.json({ items: [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const body = await req.json();
  const { action } = body;

  try {
    if (action === "submitAssignment") {
      const { assignmentId, submissionText, fileUrl } = body;
      // upsert
      await db.execute(sql`
        INSERT INTO assignment_submissions (assignment_id, user_id, submission_text, file_url, status, submitted_at)
        VALUES (${Number(assignmentId)}, ${uid}, ${submissionText || null}, ${fileUrl || null}, 'pending', NOW())
        ON CONFLICT (user_id, assignment_id) DO UPDATE
        SET submission_text = EXCLUDED.submission_text,
            file_url = EXCLUDED.file_url,
            status = 'pending',
            submitted_at = NOW()
      `);
      // award points
      await db.execute(sql`
        INSERT INTO user_points (user_id, points, reason, ref_type, ref_id)
        VALUES (${uid}, 10, 'assignment_submit', 'assignment', ${Number(assignmentId)})
      `);
      return NextResponse.json({ ok: true });
    }

    if (action === "attemptQuiz") {
      const { quizId, answers } = body;
      // fetch quiz to grade
      const qRow = await db.execute(sql`SELECT questions, passing_score FROM quizzes WHERE id = ${Number(quizId)}`);
      const q = ((qRow as any).rows || qRow)[0];
      if (!q) return NextResponse.json({ error: "آزمون یافت نشد" }, { status: 404 });
      const questions = (q.questions || []) as any[];
      let score = 0, maxScore = 0;
      questions.forEach((question: any, i: number) => {
        const pts = Number(question.points || 1);
        maxScore += pts;
        if (Number(answers?.[i]) === Number(question.correctIndex)) score += pts;
      });
      const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      const passed = percent >= Number(q.passing_score || 60);

      await db.execute(sql`
        INSERT INTO quiz_attempts (quiz_id, user_id, score, max_score, percent, passed, answers, submitted_at)
        VALUES (${Number(quizId)}, ${uid}, ${score}, ${maxScore}, ${percent}, ${passed}, ${JSON.stringify(answers || [])}::jsonb, NOW())
      `);
      if (passed) {
        await db.execute(sql`
          INSERT INTO user_points (user_id, points, reason, ref_type, ref_id)
          VALUES (${uid}, 30, 'quiz_pass', 'quiz', ${Number(quizId)})
        `);
      }
      return NextResponse.json({ ok: true, score, maxScore, percent, passed });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
