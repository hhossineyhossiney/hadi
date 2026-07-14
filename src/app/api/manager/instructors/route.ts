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

export async function GET() {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  try {
    const rows = await db.execute(sql`SELECT * FROM instructors WHERE institute_id = ${inst.id} ORDER BY created_at DESC`);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  const inst = await findInstitute();
  if (!inst) return NextResponse.json({ error: "unauth" }, { status: 403 });
  const body = await req.json();
  const { action } = body;
  try {
    if (action === "create") {
      const { name, title, bio, phone, email, avatar, specialties, yearsExperience, isActive } = body;
      if (!name) return NextResponse.json({ error: "نام الزامی است" }, { status: 400 });
      const [ins] = await db.execute(sql`
        INSERT INTO instructors (institute_id, name, title, bio, phone, email, avatar, specialties, years_experience, is_active)
        VALUES (${inst.id}, ${String(name).slice(0,255)}, ${title || null}, ${bio || null},
                ${phone || null}, ${email || null}, ${avatar || null},
                ${JSON.stringify(specialties || [])}::jsonb, ${Number(yearsExperience || 0)}, ${isActive !== false})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, item: ins });
    }
    if (action === "update") {
      const { id, name, title, bio, phone, email, avatar, specialties, yearsExperience, isActive } = body;
      const ownRow = await db.execute(sql`SELECT institute_id FROM instructors WHERE id = ${Number(id)}`);
      const own = ((ownRow as any).rows || ownRow)[0];
      if (!own || Number(own.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      await db.execute(sql`
        UPDATE instructors SET
          name = ${name}, title = ${title || null}, bio = ${bio || null},
          phone = ${phone || null}, email = ${email || null}, avatar = ${avatar || null},
          specialties = ${JSON.stringify(specialties || [])}::jsonb,
          years_experience = ${Number(yearsExperience || 0)},
          is_active = ${isActive !== false},
          updated_at = NOW()
        WHERE id = ${Number(id)}
      `);
      return NextResponse.json({ ok: true });
    }
    if (action === "delete") {
      const ownRow = await db.execute(sql`SELECT institute_id FROM instructors WHERE id = ${Number(body.id)}`);
      const own = ((ownRow as any).rows || ownRow)[0];
      if (!own || Number(own.institute_id) !== Number(inst.id)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
      await db.execute(sql`DELETE FROM instructors WHERE id = ${Number(body.id)}`);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
