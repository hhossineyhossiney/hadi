import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_PHONES = new Set(["09159513179", "09150000000"]);

async function getAdminUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return null;
  if (user.role === "admin" || ADMIN_PHONES.has(String(user.phone || ""))) return user;
  return null;
}

function unauthorized() {
  return NextResponse.json(
    { error: "دسترسی غیرمجاز؛ فقط مدیر کل می‌تواند حساب مدیر آموزشگاه را تغییر دهد" },
    { status: 401 },
  );
}

/** GET: list institutes with manager info + telegram access code */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return unauthorized();

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
    const admin = await getAdminUser();
    if (!admin) return unauthorized();

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

    // Check if phone already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .then((r) => r[0]);

    let manager;
    if (existing) {
      // Existing user — allow only if they are unassigned student, or already
      // the manager of THIS specific institute. Reject if admin or another institute.
      if (existing.role === "admin") {
        return NextResponse.json(
          { error: "این شماره متعلق به مدیر کل سامانه است و نمی‌تواند مدیر آموزشگاه شود." },
          { status: 409 }
        );
      }
      if (existing.role === "institute") {
        // Check if they're already linked to a DIFFERENT institute
        const otherInst = await db
          .select()
          .from(institutes)
          .where(eq(institutes.userId, existing.id))
          .then((r) => r[0]);
        if (otherInst && otherInst.id !== instituteId) {
          return NextResponse.json(
            {
              error: `این شماره در حال حاضر مدیر آموزشگاه «${otherInst.name}» است. هر شماره تنها می‌تواند مدیر یک آموزشگاه باشد.`,
            },
            { status: 409 }
          );
        }
      }
      // Existing student or unlinked institute → promote and update password
      [manager] = await db
        .update(users)
        .set({ password: hashed, role: "institute", name: name || existing.name })
        .where(eq(users.id, existing.id))
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
