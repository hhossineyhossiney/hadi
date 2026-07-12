import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sellablePermissions, institutes, sellableCourses } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function isAdmin() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  return u?.role === "admin" || u?.phone === "09159513179" || u?.phone === "09150000000";
}

// GET: list all institutes with their shop permissions
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const rows = await db.execute(sql`
      SELECT i.id, i.name, i.slug, i.mobile,
             p.max_courses, p.is_enabled, p.commission_percent, p.approved_at, p.notes,
             (SELECT COUNT(*) FROM sellable_courses WHERE institute_id = i.id) AS current_count,
             (SELECT COUNT(*) FROM sellable_courses WHERE institute_id = i.id AND is_published = true) AS published_count
      FROM institutes i
      LEFT JOIN sellable_permissions p ON p.institute_id = i.id
      ORDER BY i.name
    `);
    const list = (rows as any).rows || rows;
    return NextResponse.json({ institutes: list });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}

// POST: grant/update permission for an institute
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const s = await getServerSession(authOptions);
    const adminId = Number((s?.user as any)?.id) || null;
    const body = await req.json();
    const { instituteId, maxCourses, isEnabled, commissionPercent, notes } = body;
    if (!instituteId) return NextResponse.json({ error: "instituteId required" }, { status: 400 });

    const inst = await db.select().from(institutes).where(eq(institutes.id, Number(instituteId))).then(r => r[0]);
    if (!inst) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });

    const existing = await db.select().from(sellablePermissions).where(eq(sellablePermissions.instituteId, Number(instituteId))).then(r => r[0]);

    if (existing) {
      const [updated] = await db.update(sellablePermissions).set({
        maxCourses: maxCourses !== undefined ? Number(maxCourses) : existing.maxCourses,
        isEnabled: isEnabled !== undefined ? !!isEnabled : existing.isEnabled,
        commissionPercent: commissionPercent !== undefined ? String(commissionPercent) : existing.commissionPercent,
        notes: notes !== undefined ? notes : existing.notes,
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(sellablePermissions.id, existing.id)).returning();
      return NextResponse.json({ ok: true, permission: updated });
    } else {
      const [created] = await db.insert(sellablePermissions).values({
        instituteId: Number(instituteId),
        maxCourses: Number(maxCourses ?? 0),
        isEnabled: !!isEnabled,
        commissionPercent: String(commissionPercent ?? "10.00"),
        notes: notes ?? null,
        approvedBy: adminId,
        approvedAt: new Date(),
      }).returning();
      return NextResponse.json({ ok: true, permission: created });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "خطا" }, { status: 500 });
  }
}
