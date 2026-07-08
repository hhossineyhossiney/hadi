import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

/** GET: list institutes with manager info + telegram access code */
export async function GET() {
  const list = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      accessCode: institutes.accessCode,
      userId: institutes.userId,
      managerPhone: users.phone,
      managerName: users.name,
    })
    .from(institutes)
    .leftJoin(users, eq(institutes.userId, users.id))
    .orderBy(institutes.id);

  return NextResponse.json(list);
}

/** POST: create or reset an institute manager account */
export async function POST(request: Request) {
  try {
    const { instituteId, phone, password, name } = await request.json();
    const cleanPhone = normalizePhone(phone || "");

    if (!instituteId || !/^09\d{9}$/.test(cleanPhone) || !password || password.length < 6) {
      return NextResponse.json(
        { error: "شناسه آموزشگاه، موبایل ۱۱ رقمی و رمز حداقل ۶ کاراکتری الزامی است" },
        { status: 400 }
      );
    }

    const inst = await db.select().from(institutes).where(eq(institutes.id, instituteId)).then((r) => r[0]);
    if (!inst) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });

    const hashed = await bcrypt.hash(password, 10);

    // Find or create manager user
    let manager = await db.select().from(users).where(eq(users.phone, cleanPhone)).then((r) => r[0]);
    if (manager) {
      [manager] = await db
        .update(users)
        .set({ password: hashed, role: "institute", name: name || manager.name })
        .where(eq(users.id, manager.id))
        .returning();
    } else {
      [manager] = await db
        .insert(users)
        .values({
          name: name || `مدیر ${inst.name}`,
          phone: cleanPhone,
          password: hashed,
          role: "institute",
        })
        .returning();
    }

    // Ensure access code exists then link manager to institute
    const accessCode =
      inst.accessCode || Math.random().toString(36).substring(2, 8).toUpperCase();
    await db
      .update(institutes)
      .set({ userId: manager.id, accessCode })
      .where(eq(institutes.id, instituteId));

    return NextResponse.json({
      ok: true,
      manager: { id: manager.id, phone: manager.phone, name: manager.name },
      accessCode,
      telegramLink: `https://t.me/amoozeshghah_bot?start=${accessCode}`,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
