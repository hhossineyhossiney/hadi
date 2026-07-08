import { db } from "@/db";
import {
  registrations, courses, institutes, categories, users,
  courseSessions, walletTransactions, studentDocuments, notifications, chatThreads
} from "@/db/schema";
import { eq, or, desc, and, sql, inArray, count as sqlCount } from "drizzle-orm";
import { NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawPhone = searchParams.get("phone");

  if (!rawPhone) {
    return NextResponse.json({ error: "شماره موبایل الزامی است" }, { status: 400 });
  }

  const cleanPhone = normalizePhone(rawPhone);

  const user = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, cleanPhone), eq(users.email, cleanPhone)))
    .then((res) => res[0]);

  const userRegs = await db
    .select({
      id: registrations.id,
      fullName: registrations.fullName,
      phone: registrations.phone,
      status: registrations.status,
      createdAt: registrations.createdAt,
      notes: registrations.notes,
      certificateUrl: registrations.certificateUrl,
      progress: registrations.progress,
      sessionsAttended: registrations.sessionsAttended,
      isFavorite: registrations.isFavorite,
      courseId: registrations.courseId,
      courseTitle: courses.title,
      courseSlug: courses.slug,
      courseImage: courses.image,
      duration: courses.duration,
      price: courses.price,
      totalSessions: courses.totalSessions,
      instructor: courses.instructor,
      instructorTitle: courses.instructorTitle,
      schedule: courses.schedule,
      startDate: courses.startDate,
      level: courses.level,
      categoryName: categories.name,
      instituteId: registrations.instituteId,
      instituteUserId: institutes.userId,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      institutePhone: institutes.phone,
      instituteMobile: institutes.mobile,
      instituteAddress: institutes.address,
    })
    .from(registrations)
    .leftJoin(courses, eq(registrations.courseId, courses.id))
    .leftJoin(institutes, eq(registrations.instituteId, institutes.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(
      user
        ? or(eq(registrations.userId, user.id), eq(registrations.phone, cleanPhone))
        : eq(registrations.phone, cleanPhone)
    )
    .orderBy(desc(registrations.createdAt));

  // Aggregates
  const activeRegs = userRegs.filter((r) => r.status === "approved");
  const totalHours = activeRegs.reduce((sum, r) => {
    const m = String(r.duration || "").match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);
  const certificatesCount = userRegs.filter((r) => r.certificateUrl).length;

  // Wallet balance
  let walletBalance = 0;
  if (user) {
    try {
      const tx = await db
        .select()
        .from(walletTransactions)
        .where(eq(walletTransactions.userId, user.id))
        .orderBy(desc(walletTransactions.createdAt))
        .limit(1);
      walletBalance = tx[0] ? Number(tx[0].balanceAfter || 0) : 0;
    } catch {
      walletBalance = 0;
    }
  }

  // Upcoming sessions (best-effort — fetch sessions of enrolled courses)
  let upcomingSessions: any[] = [];
  const courseIds = activeRegs.map((r) => r.courseId).filter(Boolean) as number[];
  if (courseIds.length > 0) {
    try {
      const rows = await db
        .select()
        .from(courseSessions)
        .where(inArray(courseSessions.courseId, courseIds))
        .orderBy(courseSessions.sessionDate);
      upcomingSessions = rows.map((s) => {
        const reg = activeRegs.find((r) => r.courseId === s.courseId);
        return { ...s, courseTitle: reg?.courseTitle, instituteName: reg?.instituteName };
      }).slice(0, 10);
    } catch { upcomingSessions = []; }
  }

  // Notifications unread count
  let notifCount = 0;
  if (user) {
    try {
      const nrows = await db.select({ n: sqlCount() }).from(notifications)
        .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));
      notifCount = Number(nrows[0]?.n || 0);
    } catch {}
  }

  return NextResponse.json({
    user: user
      ? { id: user.id, name: user.name, phone: user.phone, email: user.email, avatar: user.avatar }
      : null,
    registrations: userRegs,
    stats: {
      activeCourses: activeRegs.length,
      totalHours,
      certificates: certificatesCount,
      walletBalance,
      pendingCount: userRegs.filter((r) => r.status === "pending").length,
      completedCount: userRegs.filter((r) => (r.progress || 0) >= 100).length,
      notificationsUnread: notifCount,
    },
    upcomingSessions,
  });
}
