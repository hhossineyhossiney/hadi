import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const ADMINS = ["09159513179", "09150000000"];
async function isAdmin() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  return u?.role === "admin" || (u?.phone && ADMINS.includes(u.phone));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  try {
    if (scope === "subscriptions") {
      if (!(await isAdmin())) return NextResponse.json({ error: "unauth" }, { status: 401 });
      const rows = await db.execute(sql`
        SELECT s.*, p.name AS plan_name, p.color AS plan_color, i.name AS institute_name
        FROM institute_subscriptions s
        LEFT JOIN subscription_plans p ON p.id = s.plan_id
        LEFT JOIN institutes i ON i.id = s.institute_id
        ORDER BY s.created_at DESC
      `);
      return NextResponse.json({ items: ((rows as any).rows || rows) });
    }
    // Public: list plans
    const rows = await db.execute(sql`SELECT * FROM subscription_plans WHERE is_active = true ORDER BY sort_order, price`);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const s = await getServerSession(authOptions);
  const adminId = Number((s?.user as any)?.id);
  const body = await req.json();
  const { action } = body;

  try {
    if (action === "createPlan") {
      const { name, slug, description, price, priceYearly, durationDays, maxCourses, maxStudents, maxShopCourses, commissionPercent, features, color, isPopular, sortOrder } = body;
      if (!name || !slug || price == null) return NextResponse.json({ error: "نام، slug و قیمت الزامی" }, { status: 400 });
      const [p] = await db.execute(sql`
        INSERT INTO subscription_plans (name, slug, description, price, price_yearly, duration_days, max_courses, max_students, max_shop_courses, commission_percent, features, color, is_popular, sort_order)
        VALUES (${name}, ${slug}, ${description || null}, ${String(price)}, ${priceYearly ? String(priceYearly) : null},
                ${Number(durationDays || 30)}, ${Number(maxCourses || 0)}, ${Number(maxStudents || 0)}, ${Number(maxShopCourses || 0)},
                ${String(commissionPercent || "10.00")}, ${JSON.stringify(features || [])}::jsonb,
                ${color || "primary"}, ${!!isPopular}, ${Number(sortOrder || 0)})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      return NextResponse.json({ ok: true, plan: p });
    }
    if (action === "updatePlan") {
      const { id, name, description, price, priceYearly, durationDays, maxCourses, maxStudents, maxShopCourses, commissionPercent, features, color, isPopular, isActive, sortOrder } = body;
      await db.execute(sql`
        UPDATE subscription_plans SET
          name = ${name},
          description = ${description || null},
          price = ${String(price)},
          price_yearly = ${priceYearly ? String(priceYearly) : null},
          duration_days = ${Number(durationDays || 30)},
          max_courses = ${Number(maxCourses || 0)},
          max_students = ${Number(maxStudents || 0)},
          max_shop_courses = ${Number(maxShopCourses || 0)},
          commission_percent = ${String(commissionPercent || "10.00")},
          features = ${JSON.stringify(features || [])}::jsonb,
          color = ${color || "primary"},
          is_popular = ${!!isPopular},
          is_active = ${isActive !== false},
          sort_order = ${Number(sortOrder || 0)},
          updated_at = NOW()
        WHERE id = ${Number(id)}
      `);
      return NextResponse.json({ ok: true });
    }
    if (action === "deletePlan") {
      await db.execute(sql`DELETE FROM subscription_plans WHERE id = ${Number(body.id)}`);
      return NextResponse.json({ ok: true });
    }
    if (action === "assignPlan") {
      const { instituteId, planId, durationDays, notes } = body;
      const pRow = await db.execute(sql`SELECT duration_days, price, commission_percent, max_courses, max_shop_courses FROM subscription_plans WHERE id = ${Number(planId)}`);
      const p = ((pRow as any).rows || pRow)[0];
      if (!p) return NextResponse.json({ error: "پلن یافت نشد" }, { status: 404 });
      const days = Number(durationDays || p.duration_days || 30);
      const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000);
      // Deactivate previous
      await db.execute(sql`UPDATE institute_subscriptions SET status = 'cancelled', updated_at = NOW() WHERE institute_id = ${Number(instituteId)} AND status = 'active'`);
      // Insert new
      const [sub] = await db.execute(sql`
        INSERT INTO institute_subscriptions (institute_id, plan_id, status, started_at, expires_at, price, activated_by, notes)
        VALUES (${Number(instituteId)}, ${Number(planId)}, 'active', NOW(), ${expiresAt.toISOString()}, ${p.price}, ${adminId}, ${notes || null})
        RETURNING *
      `).then((r: any) => (r.rows || r));
      // Also sync sellable_permissions
      try {
        await db.execute(sql`
          INSERT INTO sellable_permissions (institute_id, max_courses, is_enabled, commission_percent, approved_by, approved_at)
          VALUES (${Number(instituteId)}, ${Number(p.max_shop_courses || 0)}, ${Number(p.max_shop_courses || 0) > 0}, ${p.commission_percent}, ${adminId}, NOW())
          ON CONFLICT (institute_id) DO UPDATE SET
            max_courses = ${Number(p.max_shop_courses || 0)},
            is_enabled = ${Number(p.max_shop_courses || 0) > 0},
            commission_percent = ${p.commission_percent},
            updated_at = NOW()
        `);
      } catch {}
      return NextResponse.json({ ok: true, subscription: sub });
    }
    return NextResponse.json({ error: "action نامعتبر" }, { status: 400 });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
