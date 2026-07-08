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

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if phone already registered
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .then((res) => res[0]);

    if (user) {
      // Update password for existing user so they can log in
      const [updated] = await db
        .update(users)
        .set({ password: hashedPassword, name, email: email ? email.trim() : user.email })
        .where(eq(users.id, user.id))
        .returning();
      user = updated;
    } else {
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
      user = newUser;
    }

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
