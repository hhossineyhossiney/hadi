import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users, notifications } from "@/db/schema";
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
  const courseId = url.searchParams.get("courseId");

  try {
    let where = sql`g.institute_id = ${inst.id}`;
    if (courseId) where = sql`${where} AND g.course_id = ${Number(courseId)}`;
    const rows = await db.execute(sql`
      SELECT g.*, r.full_name AS student_name, r.phone AS student_phone,
             c.title AS course_title, i.name AS instructor_name
      FROM grades g
      LEFT JOIN registrations r ON r.id = g.registration_id
      LEFT JOIN courses c ON c.id = g.course_id
      LEFT JOIN instructors i ON i.id = g.instructor_id
      WHERE ${where}
      ORDER BY g.graded_at DESC
    `);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      const { registrationId, subject, theoreticalScore, practicalScore, finalScore, maxScore, passingScore, instructorId, description } = body;
      // Verify registration belongs to institute
      const regRow = await db.execute(sql`SELECT id, user_id, course_id, institute_id FROM registrations WHERE id = ${Number(registrationId)} LIMIT 1`);
      const reg = ((regRow as any).rows || regRow)[0];
      if (!reg || Number(reg.institute_id) !== Number(inst.id)) {
        return NextResponse.json({ error: "ثبت‌نام متعلق به آموزشگاه شما نیست" }, { status: 403 });
      }
      const fs = Number(finalScore || 0);
      const ps = Number(passingScore || 10);
      const status = fs >= ps ? "passed" : "failed";
      const [g] = await db.execute(sql`
        INSERT INTO grades (registration_id, user_id, course_id, institute_id, instructor_id, subject,
                            theoretical_score, practical_score, final_score, max_score, passing_score,
                            status, description, graded_by, graded_at)
        VALUES (${Number(registrationId)}, ${Number(reg.user_id)}, ${Number(reg.course_id)}, ${inst.id},
                ${instructorId ? Number(instructorId) : null}, ${subject || null},
                ${theoreticalScore != null ? Number(theoreticalScore) : null},
                ${practicalScore != null ? Number(practicalScore) : null},
                ${fs}, ${Number(maxScore || 20)}, ${ps},
                ${status}, ${description || null}, ${uid || null}, NOW())
        RETURNING *
      `).then((r: any) => (r.rows || r));

      // Notify student
      if (reg.user_id) {
        try {
          await db.insert(notifications).values({
            userId: Number(reg.user_id),
            userRole: "student",
            title: status === "passed" ? "🎉 نمره جدید — قبول شدید" : "📊 نمره جدید ثبت شد",
            body: `${subject || "دوره"}: ${fs}/${maxScore || 20}`,
            type: status === "passed" ? "success" : "info",
            link: "/dashboard?tab=grades",
          });
        } catch {}
      }
      return NextResponse.json({ ok: true, grade: g });
    }

    if (action === "update") {
      const { id, subject, theoreticalScore, practicalScore, finalScore, maxScore, passingScore, description } = body;
      const gRow = await db.execute(sql`SELECT institute_id FROM grades WHERE id = ${Number(id)}`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g || Number(g.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      const fs = Number(finalScore || 0);
      const ps = Number(passingScore || 10);
      const status = fs >= ps ? "passed" : "failed";
      await db.execute(sql`
        UPDATE grades SET
          subject = ${subject || null},
          theoretical_score = ${theoreticalScore != null ? Number(theoreticalScore) : null},
          practical_score = ${practicalScore != null ? Number(practicalScore) : null},
          final_score = ${fs},
          max_score = ${Number(maxScore || 20)},
          passing_score = ${ps},
          status = ${status},
          description = ${description || null},
          graded_at = NOW()
        WHERE id = ${Number(id)}
      `);
      return NextResponse.json({ ok: true });
    }

    if (action === "delete") {
      const gRow = await db.execute(sql`SELECT institute_id FROM grades WHERE id = ${Number(body.id)}`);
      const g = ((gRow as any).rows || gRow)[0];
      if (!g || Number(g.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      await db.execute(sql`DELETE FROM grades WHERE id = ${Number(body.id)}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
