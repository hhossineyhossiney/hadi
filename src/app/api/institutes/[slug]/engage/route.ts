import { NextResponse } from "next/server";
import { db } from "@/db";
import { institutes, notifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { ensureAdvancedInstituteProfiles } from "@/lib/advanced-institute-profile";

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    await ensureAdvancedInstituteProfiles();
    const { slug: rawSlug } = await params;
    const slug = decodeURIComponent(rawSlug);
    const institute = await db.select().from(institutes).where(eq(institutes.slug, slug)).then((items) => items[0]);
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });
    const body = await request.json();
    const type = body.type === "consultation" ? "consultation" : "registration";
    const fullName = String(body.fullName || "").trim().slice(0, 255);
    const phone = normalizePhone(String(body.phone || ""));
    const courseId = Number(body.courseId || 0) || null;
    if (!fullName || !/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "نام و شماره موبایل معتبر الزامی است" }, { status: 400 });
    }
    if (courseId) {
      const courseResult = await db.execute(sql`SELECT id FROM courses WHERE id = ${courseId} AND institute_id = ${institute.id} LIMIT 1`);
      if (!rowsOf(courseResult).length) return NextResponse.json({ error: "دوره انتخاب‌شده معتبر نیست" }, { status: 400 });
    }
    if (type === "registration" && !courseId) return NextResponse.json({ error: "انتخاب دوره الزامی است" }, { status: 400 });

    const duplicateResult = await db.execute(sql`
      SELECT id FROM institute_leads
      WHERE institute_id = ${institute.id} AND phone = ${phone} AND type = ${type}
        AND created_at > NOW() - INTERVAL '12 hours'
      LIMIT 1
    `);
    if (rowsOf(duplicateResult).length) return NextResponse.json({ error: "درخواست شما قبلاً ثبت شده و در حال پیگیری است" }, { status: 409 });

    const result = await db.execute(sql`
      INSERT INTO institute_leads (
        institute_id, course_id, type, full_name, phone,
        preferred_date, preferred_time, advisor, notes, status,
        created_at, updated_at
      ) VALUES (
        ${institute.id}, ${courseId}, ${type}, ${fullName}, ${phone},
        ${String(body.preferredDate || "").slice(0, 30) || null},
        ${String(body.preferredTime || "").slice(0, 30) || null},
        ${String(body.advisor || "").slice(0, 255) || null},
        ${String(body.notes || "").slice(0, 1500) || null},
        'new', NOW(), NOW()
      ) RETURNING id
    `);

    if (institute.userId) {
      try {
        await db.insert(notifications).values({
          userId: institute.userId,
          userRole: "institute",
          title: type === "consultation" ? "📅 رزرو مشاوره جدید" : "⚡ درخواست ثبت‌نام سریع",
          body: `${fullName} — ${phone}`,
          type: "enrollment",
          link: "/panel",
        });
      } catch {}
    }
    return NextResponse.json({ ok: true, id: rowsOf<{ id: number }>(result)[0]?.id, message: "درخواست شما ثبت شد؛ آموزشگاه برای هماهنگی تماس می‌گیرد" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "خطا در ثبت درخواست" }, { status: 500 });
  }
}
