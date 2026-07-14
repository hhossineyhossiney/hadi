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
  const courseId = url.searchParams.get("courseId");
  const date = url.searchParams.get("date");
  const userId = url.searchParams.get("userId");
  try {
    let where = sql`a.course_id IN (SELECT id FROM courses WHERE institute_id = ${inst.id})`;
    if (courseId) where = sql`${where} AND a.course_id = ${Number(courseId)}`;
    if (date) where = sql`${where} AND a.session_date = ${date}`;
    if (userId) where = sql`${where} AND a.user_id = ${Number(userId)}`;
    const rows = await db.execute(sql`
      SELECT a.*, u.name AS user_name
      FROM attendance a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE ${where}
      ORDER BY a.session_date DESC, a.created_at DESC
    `);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const s = await getServerSession(authOptions);
  const markedBy = Number((s?.user as any)?.id);
  const body = await req.json();
  const { action } = body;
  try {
    if (action === "bulkMark") {
      const { courseId, sessionDate, records } = body;
      if (!courseId || !sessionDate || !Array.isArray(records)) return NextResponse.json({ error: "params" }, { status: 400 });
      let count = 0;
      for (const rec of records) {
        if (!rec.userId || !rec.registrationId) continue;
        // upsert (delete existing for that user+date+course, insert new)
        await db.execute(sql`
          DELETE FROM attendance WHERE user_id = ${Number(rec.userId)} AND course_id = ${Number(courseId)} AND session_date = ${sessionDate}
        `);
        await db.execute(sql`
          INSERT INTO attendance (registration_id, user_id, course_id, session_date, status, notes, marked_by)
          VALUES (${Number(rec.registrationId)}, ${Number(rec.userId)}, ${Number(courseId)}, ${sessionDate}, ${rec.status}, ${rec.notes || null}, ${markedBy || null})
        `);
        count++;
      }
      return NextResponse.json({ ok: true, count });
    }
    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
