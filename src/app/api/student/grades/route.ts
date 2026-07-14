import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

// Student's carnama (report card)
export async function GET() {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });

  try {
    const rows = await db.execute(sql`
      SELECT g.id, g.subject, g.theoretical_score, g.practical_score, g.final_score,
             g.max_score, g.passing_score, g.status, g.description, g.graded_at,
             c.title AS course_title, c.slug AS course_slug,
             i.name AS institute_name, ins.name AS instructor_name
      FROM grades g
      LEFT JOIN courses c ON c.id = g.course_id
      LEFT JOIN institutes i ON i.id = g.institute_id
      LEFT JOIN instructors ins ON ins.id = g.instructor_id
      WHERE g.user_id = ${uid}
      ORDER BY g.graded_at DESC
    `);
    const items = ((rows as any).rows || rows) as any[];

    // Compute stats
    const totalGrades = items.length;
    const passed = items.filter(g => g.status === "passed").length;
    const failed = items.filter(g => g.status === "failed").length;
    const scores = items.filter(g => g.final_score != null).map(g => Number(g.final_score));
    const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScoresList = items.filter(g => g.max_score).map(g => Number(g.max_score));
    const avgMax = maxScoresList.length > 0 ? maxScoresList.reduce((a, b) => a + b, 0) / maxScoresList.length : 20;

    return NextResponse.json({
      items,
      stats: {
        total: totalGrades,
        passed,
        failed,
        pending: totalGrades - passed - failed,
        average: Number(avg.toFixed(2)),
        averageOutOf: Math.round(avgMax),
        passRate: totalGrades > 0 ? Math.round((passed / totalGrades) * 100) : 0,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
