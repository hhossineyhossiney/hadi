import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { institutes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import {
  ensureAdvancedInstituteProfiles,
  getAdvancedInstituteProfile,
  normalizeAdvancedProfile,
} from "@/lib/advanced-institute-profile";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

async function findInstitute() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: number | string; phone?: string; role?: string } | undefined;
  const userId = Number(user?.id || 0);
  if (!userId) return null;
  const linked = await db.select().from(institutes).where(eq(institutes.userId, userId)).then((items) => items[0]);
  if (linked) return linked;
  if (!user?.phone) return null;
  const phone = normalizePhone(user.phone);
  const all = await db.select().from(institutes);
  const candidate = all.find((item) => !item.userId && [item.phone, item.mobile].filter(Boolean).some((value) => normalizePhone(String(value)) === phone));
  if (!candidate) return null;
  const [updated] = await db.update(institutes).set({ userId }).where(eq(institutes.id, candidate.id)).returning();
  if (user.role !== "institute") {
    try { await db.update(users).set({ role: "institute" as any }).where(eq(users.id, userId)); } catch {}
  }
  return updated || candidate;
}

export async function GET() {
  try {
    const institute = await findInstitute();
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 403 });
    await ensureAdvancedInstituteProfiles();
    const [profile, leadsResult] = await Promise.all([
      getAdvancedInstituteProfile(institute.id),
      db.execute(sql`
        SELECT l.id, l.type, l.full_name, l.phone, l.preferred_date, l.preferred_time,
               l.advisor, l.notes, l.status, l.created_at, c.title AS course_title
        FROM institute_leads l
        LEFT JOIN courses c ON c.id = l.course_id
        WHERE l.institute_id = ${institute.id}
        ORDER BY CASE l.status WHEN 'new' THEN 0 WHEN 'contacted' THEN 1 ELSE 2 END, l.created_at DESC
        LIMIT 100
      `),
    ]);
    return NextResponse.json({
      institute: { id: institute.id, name: institute.name, slug: institute.slug },
      profile,
      leads: rowsOf(leadsResult),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const institute = await findInstitute();
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 403 });
    await ensureAdvancedInstituteProfiles();
    const body = await request.json();
    const profile = normalizeAdvancedProfile(body.profile);
    const serialized = JSON.stringify(profile);
    if (serialized.length > 4_500_000) return NextResponse.json({ error: "حجم اطلاعات و رسانه‌های پروفایل بیشتر از حد مجاز است" }, { status: 400 });
    await db.execute(sql`UPDATE institutes SET advanced_profile = ${serialized}::jsonb WHERE id = ${institute.id}`);
    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در ذخیره پروفایل" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const institute = await findInstitute();
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 403 });
    await ensureAdvancedInstituteProfiles();
    const body = await request.json();
    const leadId = Number(body.leadId || 0);
    const status = ["new", "contacted", "scheduled", "completed", "cancelled"].includes(body.status) ? body.status : null;
    if (!leadId || !status) return NextResponse.json({ error: "اطلاعات درخواست نامعتبر است" }, { status: 400 });
    const result = await db.execute(sql`
      UPDATE institute_leads SET status = ${status}, updated_at = NOW()
      WHERE id = ${leadId} AND institute_id = ${institute.id}
      RETURNING id
    `);
    if (!rowsOf(result).length) return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا" }, { status: 500 });
  }
}
