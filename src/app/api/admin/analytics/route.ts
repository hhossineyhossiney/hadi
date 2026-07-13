import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

const ADMIN_PHONES = ["09159513179", "09150000000"];

async function isAdmin() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  return u?.role === "admin" || (u?.phone && ADMIN_PHONES.includes(u.phone));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauth" }, { status: 401 });

  try {
    // Top-level stats
    const totals = await db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE role != 'admin') AS total_users,
        (SELECT COUNT(*)::int FROM users WHERE role != 'admin' AND created_at >= NOW() - INTERVAL '30 days') AS users_month,
        (SELECT COUNT(*)::int FROM users WHERE role != 'admin' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') AS users_prev_month,
        (SELECT COUNT(*)::int FROM courses WHERE status='approved') AS active_courses,
        (SELECT COUNT(*)::int FROM institutes WHERE status='approved') AS active_insts,
        (SELECT COUNT(*)::int FROM registrations WHERE status='approved') AS approved_regs,
        (SELECT COALESCE(SUM(amount), 0)::text FROM sellable_purchases WHERE status='paid') AS shop_revenue,
        (SELECT COALESCE(SUM(amount), 0)::text FROM sellable_purchases WHERE status='paid' AND created_at >= NOW() - INTERVAL '30 days') AS shop_revenue_month,
        (SELECT COALESCE(SUM(amount), 0)::text FROM sellable_purchases WHERE status='paid' AND created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') AS shop_revenue_prev_month,
        (SELECT COUNT(*)::int FROM support_tickets WHERE status IN ('open','in_progress')) AS open_tickets
    `);
    const t = ((totals as any).rows || totals)[0] || {};

    // Revenue chart — last 12 weeks (approx monthly buckets)
    const revChart = await db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS bucket,
        COALESCE(SUM(amount), 0)::text AS revenue,
        COUNT(*)::int AS orders
      FROM sellable_purchases
      WHERE status = 'paid' AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1
    `);

    // Course distribution by category
    const categoryChart = await db.execute(sql`
      SELECT COALESCE(cat.name, 'بدون رشته') AS name, COUNT(c.id)::int AS count
      FROM courses c
      LEFT JOIN categories cat ON cat.id = c.category_id
      WHERE c.status = 'approved'
      GROUP BY cat.name
      ORDER BY count DESC LIMIT 8
    `);

    // Latest activities
    const activities = await db.execute(sql`
      (SELECT 'ثبت‌نام دوره' AS action, r.full_name AS user_name, c.title AS description, r.created_at, NULL::text AS amount, r.id AS ref_id
       FROM registrations r LEFT JOIN courses c ON c.id = r.course_id
       ORDER BY r.created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'خرید دوره آنلاین' AS action, u.name AS user_name, c.title AS description, p.created_at, p.amount::text AS amount, p.id AS ref_id
       FROM sellable_purchases p LEFT JOIN users u ON u.id = p.user_id LEFT JOIN sellable_courses c ON c.id = p.course_id
       WHERE p.status = 'paid' ORDER BY p.created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'پرداخت شهریه' AS action, u.name AS user_name, pf.title AS description, pf.paid_at AS created_at, pf.amount::text AS amount, pf.id AS ref_id
       FROM payment_fees pf LEFT JOIN users u ON u.id = pf.user_id
       WHERE pf.status = 'paid' ORDER BY pf.paid_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 15
    `);

    // Growth calculations
    const growthUsers = Number(t.users_prev_month) > 0
      ? Math.round(((Number(t.users_month) - Number(t.users_prev_month)) / Number(t.users_prev_month)) * 100)
      : Number(t.users_month) > 0 ? 100 : 0;
    const growthRev = Number(t.shop_revenue_prev_month) > 0
      ? Math.round(((Number(t.shop_revenue_month) - Number(t.shop_revenue_prev_month)) / Number(t.shop_revenue_prev_month)) * 100)
      : Number(t.shop_revenue_month) > 0 ? 100 : 0;

    return NextResponse.json({
      totals: {
        totalUsers: t.total_users,
        activeCourses: t.active_courses,
        activeInstitutes: t.active_insts,
        approvedRegs: t.approved_regs,
        shopRevenue: Number(t.shop_revenue || 0),
        shopRevenueMonth: Number(t.shop_revenue_month || 0),
        openTickets: t.open_tickets,
        growthUsers,
        growthRev,
      },
      revenueChart: ((revChart as any).rows || revChart),
      categoryChart: ((categoryChart as any).rows || categoryChart),
      activities: ((activities as any).rows || activities),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
