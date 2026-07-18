import { db } from "@/db";
import { sql } from "drizzle-orm";

let schemaPromise: Promise<void> | null = null;

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

export type SubscriptionEntitlement = {
  subscriptionId: number | null;
  planId: number | null;
  planName: string | null;
  planSlug: string | null;
  status: string | null;
  expiresAt: string | Date | null;
  isActive: boolean;
  onlineSalesEnabled: boolean;
  maxShopCourses: number;
  unlimitedShopCourses: boolean;
  commissionPercent: string;
  maxCourses: number;
  unlimitedCourses: boolean;
  maxStudents: number;
  unlimitedStudents: boolean;
};

export async function ensureSubscriptionEntitlementsSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.execute(sql.raw(`
        ALTER TABLE subscription_plans
          ADD COLUMN IF NOT EXISTS online_sales_enabled BOOLEAN NOT NULL DEFAULT false;

        UPDATE subscription_plans
        SET online_sales_enabled = true, updated_at = NOW()
        WHERE online_sales_enabled = false
          AND (
            max_shop_courses > 0
            OR slug IN ('premium', 'gold', 'basic')
            OR features::text ILIKE '%فروش آنلاین%'
          );
      `));
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

export async function getInstituteEntitlement(instituteId: number): Promise<SubscriptionEntitlement> {
  await ensureSubscriptionEntitlementsSchema();
  const result = await db.execute(sql`
    SELECT
      s.id AS subscription_id,
      s.plan_id,
      s.status,
      s.expires_at,
      p.name AS plan_name,
      p.slug AS plan_slug,
      p.max_courses,
      p.max_students,
      p.max_shop_courses,
      p.commission_percent,
      p.online_sales_enabled
    FROM institute_subscriptions s
    JOIN subscription_plans p ON p.id = s.plan_id
    WHERE s.institute_id = ${instituteId}
      AND s.status IN ('active', 'trial')
    ORDER BY s.created_at DESC
    LIMIT 1
  `);
  const row = rowsOf<any>(result)[0];
  if (!row) {
    return {
      subscriptionId: null,
      planId: null,
      planName: null,
      planSlug: null,
      status: null,
      expiresAt: null,
      isActive: false,
      onlineSalesEnabled: false,
      maxShopCourses: 0,
      unlimitedShopCourses: false,
      commissionPercent: "0.00",
      maxCourses: 0,
      unlimitedCourses: false,
      maxStudents: 0,
      unlimitedStudents: false,
    };
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  const isActive = !expiresAt || expiresAt.getTime() > Date.now();
  const onlineSalesEnabled = isActive && !!row.online_sales_enabled;
  const maxShopCourses = Math.max(0, Number(row.max_shop_courses || 0));
  const maxCourses = Math.max(0, Number(row.max_courses || 0));
  const maxStudents = Math.max(0, Number(row.max_students || 0));

  return {
    subscriptionId: Number(row.subscription_id),
    planId: Number(row.plan_id),
    planName: row.plan_name,
    planSlug: row.plan_slug,
    status: row.status,
    expiresAt: row.expires_at,
    isActive,
    onlineSalesEnabled,
    maxShopCourses,
    unlimitedShopCourses: onlineSalesEnabled && maxShopCourses === 0,
    commissionPercent: String(row.commission_percent || "0.00"),
    maxCourses,
    unlimitedCourses: maxCourses === 0,
    maxStudents,
    unlimitedStudents: maxStudents === 0,
  };
}

/**
 * Keeps the legacy permission table synchronized for integrations that still
 * read it, while the active subscription remains the single source of truth.
 */
export async function syncLegacySellablePermission(instituteId: number, approvedBy?: number | null) {
  const entitlement = await getInstituteEntitlement(instituteId);
  await db.execute(sql`
    INSERT INTO sellable_permissions (
      institute_id, max_courses, is_enabled, commission_percent,
      approved_by, approved_at, notes, updated_at
    ) VALUES (
      ${instituteId}, ${entitlement.maxShopCourses}, ${entitlement.onlineSalesEnabled},
      ${entitlement.commissionPercent}, ${approvedBy || null}, NOW(),
      ${entitlement.planName ? `خودکار از پلن ${entitlement.planName}` : "بدون اشتراک فعال"}, NOW()
    )
    ON CONFLICT (institute_id) DO UPDATE SET
      max_courses = EXCLUDED.max_courses,
      is_enabled = EXCLUDED.is_enabled,
      commission_percent = EXCLUDED.commission_percent,
      approved_by = COALESCE(EXCLUDED.approved_by, sellable_permissions.approved_by),
      approved_at = NOW(),
      notes = EXCLUDED.notes,
      updated_at = NOW()
  `);
  return entitlement;
}
