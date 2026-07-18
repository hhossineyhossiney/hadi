import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sellableCourses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureSubscriptionEntitlementsSchema } from "@/lib/subscription-entitlements";

async function isAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { role?: string; phone?: string } | undefined;
  return user?.role === "admin" || user?.phone === "09159513179" || user?.phone === "09150000000";
}

// Read-only online-sales entitlements. Limits and commission come exclusively
// from each institute's active subscription plan.
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    await ensureSubscriptionEntitlementsSchema();
    const rows = await db.execute(sql`
      SELECT
        i.id, i.name, i.slug, i.mobile,
        s.id AS subscription_id, s.status AS subscription_status, s.expires_at,
        p.id AS plan_id, p.name AS plan_name, p.slug AS plan_slug,
        COALESCE(p.max_shop_courses, 0)::int AS max_courses,
        COALESCE(p.commission_percent, 0)::text AS commission_percent,
        COALESCE(p.online_sales_enabled, false)
          AND s.id IS NOT NULL
          AND (s.expires_at IS NULL OR s.expires_at > NOW()) AS is_enabled,
        COALESCE(p.online_sales_enabled, false)
          AND COALESCE(p.max_shop_courses, 0) = 0 AS is_unlimited,
        CASE WHEN s.id IS NULL THEN 'بدون اشتراک فعال' ELSE 'خودکار از پلن ' || p.name END AS permission_source,
        (SELECT COUNT(*)::int FROM sellable_courses sc WHERE sc.institute_id = i.id) AS current_count,
        (SELECT COUNT(*)::int FROM sellable_courses sc WHERE sc.institute_id = i.id AND sc.is_published = true) AS published_count
      FROM institutes i
      LEFT JOIN LATERAL (
        SELECT active_sub.*
        FROM institute_subscriptions active_sub
        WHERE active_sub.institute_id = i.id
          AND active_sub.status IN ('active', 'trial')
        ORDER BY active_sub.created_at DESC
        LIMIT 1
      ) s ON true
      LEFT JOIN subscription_plans p ON p.id = s.plan_id
      ORDER BY i.name
    `);

    const courseRows = await db.execute(sql`
      SELECT sc.id, sc.title, sc.is_featured, sc.is_published, sc.status,
             sc.rating, sc.rating_count,
             (SELECT COUNT(*)::int FROM sellable_purchases sp WHERE sp.course_id = sc.id AND sp.status = 'paid') AS students_count,
             i.name AS institute_name
      FROM sellable_courses sc
      LEFT JOIN institutes i ON i.id = sc.institute_id
      ORDER BY sc.is_featured DESC, sc.created_at DESC
    `);
    return NextResponse.json({
      institutes: (rows as any).rows || rows,
      courses: (courseRows as any).rows || courseRows,
      source: "subscription_plans",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}

// The only manual control left here is the platform-owned "featured" badge.
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (body.action !== "toggleFeatured") {
      return NextResponse.json({
        error: "سقف فروش، وضعیت دسترسی و کمیسیون از پلن اشتراک تعیین می‌شود و تنظیم دستی ندارد",
      }, { status: 400 });
    }
    const courseId = Number(body.courseId || 0);
    const course = await db.select().from(sellableCourses).where(eq(sellableCourses.id, courseId)).then((items) => items[0]);
    if (!course) return NextResponse.json({ error: "دوره آنلاین یافت نشد" }, { status: 404 });
    const [updated] = await db.update(sellableCourses).set({
      isFeatured: !!body.isFeatured,
      updatedAt: new Date(),
    }).where(eq(sellableCourses.id, courseId)).returning();
    return NextResponse.json({ ok: true, course: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}
