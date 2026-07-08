import { db } from "@/db";
import { registrations, courses, institutes, users, telegramChats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";
import { notifyNewRegistration } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error:
            "دیتابیس سایت متصل نیست. لطفاً متغیر DATABASE_URL را در تنظیمات هاست (Vercel → Settings → Environment Variables) وارد کنید.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { courseId, fullName, phone, email, notes, password } = body;

    if (!courseId || !fullName || !phone) {
      return NextResponse.json(
        { error: "لطفاً همه فیلدهای ضروری را پر کنید" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(phone);
    if (!/^09\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "شماره موبایل باید دقیقاً ۱۱ رقم و با ۰۹ شروع شود" },
        { status: 400 }
      );
    }

    if (password && String(password).length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    // OTP verification required (verified within last 15 minutes)
    const { otpCodes } = await import("@/db/schema");
    const { and, gt, desc: descFn } = await import("drizzle-orm");
    const verifiedOtp = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, cleanPhone),
          eq(otpCodes.verified, true),
          gt(otpCodes.createdAt, new Date(Date.now() - 15 * 60 * 1000))
        )
      )
      .orderBy(descFn(otpCodes.createdAt))
      .then((r) => r[0]);

    if (!verifiedOtp) {
      return NextResponse.json(
        { error: "ابتدا شماره موبایل خود را با کد پیامکی تأیید کنید" },
        { status: 403 }
      );
    }

    // Check course & institute details
    const courseDetails = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        startDate: courses.startDate,
        schedule: courses.schedule,
        instituteId: courses.instituteId,
        instituteName: institutes.name,
        institutePhone: institutes.phone,
        instituteMobile: institutes.mobile,
      })
      .from(courses)
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .where(eq(courses.id, courseId))
      .then((res) => res[0]);

    if (!courseDetails) {
      return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
    }

    // Find or create/update user account
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .then((res) => res[0]);

    const passToHash = password || cleanPhone;
    const hashedPassword = await bcrypt.hash(passToHash, 10);

    if (!user) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          name: fullName,
          phone: cleanPhone,
          email: email || null,
          password: hashedPassword,
          role: "student",
        })
        .returning();
      user = newUser;
    } else {
      // User exists — update password and name if provided
      if (password) {
        await db
          .update(users)
          .set({
            password: hashedPassword,
            name: fullName,
            email: email || user.email,
          })
          .where(eq(users.id, user.id));
      }
    }

    // Create registration
    const result = await db
      .insert(registrations)
      .values({
        userId: user.id,
        courseId: courseDetails.id,
        instituteId: courseDetails.instituteId,
        fullName,
        phone: cleanPhone,
        email: email || null,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    // Send real-time Telegram notification:
    // - platform admins/subscribers (no institute link) get everything
    // - institute-linked chats only get their own institute's registrations
    try {
      const activeChats = await db
        .select({ chatId: telegramChats.chatId, instituteId: telegramChats.instituteId })
        .from(telegramChats);

      const targetChatIds = activeChats
        .filter((c) => !c.instituteId || c.instituteId === courseDetails.instituteId)
        .map((c) => c.chatId);

      notifyNewRegistration(
        {
          fullName,
          phone: cleanPhone,
          email: email || null,
          courseTitle: courseDetails.title,
          instituteName: courseDetails.instituteName || "نامشخص",
          institutePhone: courseDetails.institutePhone,
          instituteMobile: courseDetails.instituteMobile,
          startDate: courseDetails.startDate,
          schedule: courseDetails.schedule,
          price: courseDetails.price,
          notes: notes || null,
        },
        targetChatIds
      ).catch((e) => console.error("Telegram notify error:", e));
    } catch (e) {
      console.error("Failed to query telegramChats:", e);
    }

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}
