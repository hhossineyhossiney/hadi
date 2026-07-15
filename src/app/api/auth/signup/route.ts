import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, password } = body;

    if (!name || !phone || !password) {
      return NextResponse.json(
        { error: "نام، شماره موبایل و رمز عبور الزامی است." },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    if (!cleanPhone) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست." },
        { status: 400 }
      );
    }

    // Check if phone already registered — reject duplicates (any role)
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .then((res) => res[0]);

    if (existing) {
      const roleLabel =
        existing.role === "admin"
          ? "مدیر کل"
          : existing.role === "institute"
          ? "مدیر آموزشگاه"
          : "هنرجو";
      return NextResponse.json(
        {
          error: `این شماره موبایل قبلاً به عنوان «${roleLabel}» ثبت‌نام شده است. لطفاً وارد حساب کاربری خود شوید یا از شماره دیگری استفاده کنید.`,
          code: "PHONE_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        phone: cleanPhone,
        email: email ? email.trim() : null,
        password: hashedPassword,
        role: "student",
      })
      .returning();
    const user = newUser;

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "خطا در ایجاد حساب کاربری" },
      { status: 500 }
    );
  }
}
