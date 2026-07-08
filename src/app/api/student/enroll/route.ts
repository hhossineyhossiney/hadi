import { db } from "@/db";
import { registrations, courses, institutes, users, telegramChats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifyNewRegistration } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Instant enroll for already-authenticated students.
 * No OTP required again — the student's phone was already verified
 * when their account/session was created.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser?.id) {
      return NextResponse.json({ error: "ابتدا وارد حساب کاربری خود شوید" }, { status: 401 });
    }

    const { courseId, notes } = await request.json();
    if (!courseId) {
      return NextResponse.json({ error: "دوره را انتخاب کنید" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, Number(sessionUser.id))).then((r) => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

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
      .then((r) => r[0]);

    if (!courseDetails) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });

    // Prevent duplicate active enrollment in the same course
    const existing = await db
      .select()
      .from(registrations)
      .where(eq(registrations.userId, user.id))
      .then((rows) => rows.find((r) => r.courseId === courseId));

    if (existing) {
      return NextResponse.json({ error: "شما قبلاً در این دوره ثبت‌نام کرده‌اید" }, { status: 409 });
    }

    const [result] = await db
      .insert(registrations)
      .values({
        userId: user.id,
        courseId: courseDetails.id,
        instituteId: courseDetails.instituteId,
        fullName: user.name,
        phone: user.phone,
        email: user.email,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    try {
      const activeChats = await db
        .select({ chatId: telegramChats.chatId, instituteId: telegramChats.instituteId })
        .from(telegramChats);
      const targetChatIds = activeChats
        .filter((c) => !c.instituteId || c.instituteId === courseDetails.instituteId)
        .map((c) => c.chatId);

      notifyNewRegistration(
        {
          fullName: user.name,
          phone: user.phone,
          email: user.email,
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
      console.error(e);
    }

    return NextResponse.json({ ok: true, registration: result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
