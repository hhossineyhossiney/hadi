import { db } from "@/db";
import { registrations, courses, institutes, users, telegramChats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";
import { notifyNewRegistration } from "@/lib/telegram";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // ================ Check if user is already logged in ================
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    const isAuthenticated = !!sessionUser?.id;

    const body = await request.json();
    let { courseId, fullName, phone, email, notes, password } = body;

    // If authenticated, use session data (no need for re-entered credentials or OTP)
    if (isAuthenticated) {
      // Load full user profile from DB to get authoritative data
      const currentUser = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(sessionUser.id)))
        .then((r) => r[0]);
      if (currentUser) {
        fullName = fullName || currentUser.name;
        phone = phone || currentUser.phone;
        email = email || currentUser.email;
      }
    }

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

    // ================ OTP verification only for NEW users (not authenticated) ================
    if (!isAuthenticated) {
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

      // If not authenticated AND phone already belongs to an EXISTING account, they must log in first
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.phone, cleanPhone))
        .then((r) => r[0]);

      if (existingUser && !verifiedOtp) {
        return NextResponse.json(
          {
            error:
              "این شماره قبلاً در سایت ثبت‌نام شده است. لطفاً ابتدا وارد حساب کاربری خود شوید و سپس ثبت‌نام در دوره را انجام دهید.",
            requiresLogin: true,
          },
          { status: 401 }
        );
      }

      if (!verifiedOtp) {
        return NextResponse.json(
          { error: "ابتدا شماره موبایل خود را با کد پیامکی تأیید کنید" },
          { status: 403 }
        );
      }
    }

    // Check course & institute details
    const courseDetails = await db
      .select({
        id: courses.id,
        title: courses.title,
        price: courses.price,
        capacity: courses.capacity,
        enrolledCount: courses.enrolledCount,
        status: courses.status,
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

    // Check capacity — block if full or registrations disabled
    if (courseDetails.status === "rejected") {
      return NextResponse.json(
        { error: "ثبت‌نام در این دوره توسط مدیر آموزشگاه متوقف شده است." },
        { status: 403 }
      );
    }
    if (
      courseDetails.capacity !== null &&
      courseDetails.capacity > 0 &&
      (courseDetails.enrolledCount || 0) >= courseDetails.capacity
    ) {
      return NextResponse.json(
        { error: "ظرفیت این دوره تکمیل شده است." },
        { status: 403 }
      );
    }

    // Find or create/update user account
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phone, cleanPhone))
      .then((res) => res[0]);

    // If authenticated & already exists, don't touch password/name
    if (!user) {
      const passToHash = password || cleanPhone;
      const hashedPassword = await bcrypt.hash(passToHash, 10);
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
    } else if (!isAuthenticated && password) {
      // Only update password/name for non-authenticated flow (OTP verified newuser)
      const hashedPassword = await bcrypt.hash(password, 10);
      await db
        .update(users)
        .set({
          password: hashedPassword,
          name: fullName,
          email: email || user.email,
        })
        .where(eq(users.id, user.id));
    }

    // Prevent duplicate registrations for same course
    const { and: andOp } = await import("drizzle-orm");
    const duplicate = await db
      .select()
      .from(registrations)
      .where(
        andOp(
          eq(registrations.userId, user.id),
          eq(registrations.courseId, courseDetails.id)
        )
      )
      .then((r) => r[0]);
    if (duplicate) {
      return NextResponse.json(
        {
          error: "شما قبلاً در این دوره ثبت‌نام کرده‌اید.",
          duplicate: true,
          registrationId: duplicate.id,
        },
        { status: 409 }
      );
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

    // Increment enrolled count
    try {
      await db
        .update(courses)
        .set({ enrolledCount: (courseDetails.enrolledCount || 0) + 1 })
        .where(eq(courses.id, courseDetails.id));
    } catch (e) {
      console.error("Failed to increment enrolledCount:", e);
    }

    // Send real-time Telegram notification
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

    return NextResponse.json({ ...result[0], authenticated: isAuthenticated }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در ثبت‌نام" }, { status: 500 });
  }
}
