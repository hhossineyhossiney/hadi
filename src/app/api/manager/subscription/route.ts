import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { ensureSubscriptionEntitlementsSchema, getInstituteEntitlement } from "@/lib/subscription-entitlements";

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
    await ensureSubscriptionEntitlementsSchema();
    // Current active subscription (or last one)
    const activeRow = await db.execute(sql`
      SELECT s.*, p.name AS plan_name, p.description AS plan_description, p.color AS plan_color,
             p.features, p.max_courses, p.max_students, p.max_shop_courses, p.online_sales_enabled, p.commission_percent, p.duration_days
      FROM institute_subscriptions s
      LEFT JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.institute_id = ${inst.id}
      ORDER BY s.status = 'active' DESC, s.created_at DESC
      LIMIT 1
    `);
    const current = ((activeRow as any).rows || activeRow)[0] || null;

    // Usage
    const [coursesCnt, studentsCnt, shopCnt] = await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int AS c FROM courses WHERE institute_id = ${inst.id}`),
      db.execute(sql`SELECT COUNT(*)::int AS c FROM registrations WHERE institute_id = ${inst.id}`),
      db.execute(sql`SELECT COUNT(*)::int AS c FROM sellable_courses WHERE institute_id = ${inst.id}`),
    ]);

    // History
    const historyRow = await db.execute(sql`
      SELECT s.*, p.name AS plan_name
      FROM institute_subscriptions s
      LEFT JOIN subscription_plans p ON p.id = s.plan_id
      WHERE s.institute_id = ${inst.id}
      ORDER BY s.created_at DESC LIMIT 20
    `);

    const entitlement = await getInstituteEntitlement(inst.id);

    return NextResponse.json({
      institute: { id: inst.id, name: inst.name },
      current,
      entitlement,
      usage: {
        courses: Number(((coursesCnt as any).rows || coursesCnt)[0]?.c || 0),
        students: Number(((studentsCnt as any).rows || studentsCnt)[0]?.c || 0),
        shopCourses: Number(((shopCnt as any).rows || shopCnt)[0]?.c || 0),
      },
      history: ((historyRow as any).rows || historyRow),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
