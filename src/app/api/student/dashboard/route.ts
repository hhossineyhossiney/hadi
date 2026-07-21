import { db } from "@/db";
import {
  registrations, courses, institutes, categories, users,
  courseSessions, walletTransactions, studentDocuments, notifications, chatThreads
} from "@/db/schema";
import { eq, or, desc, and, sql, inArray, count as sqlCount } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "برای مشاهده پنل باید وارد حساب کاربری شوید" }, { status: 401 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(sessionUser.id)))
    .then((res) => res[0]);

  if (!user) {
    return NextResponse.json({ error: "حساب کاربری پیدا نشد" }, { status: 404 });
  }

  const cleanPhone = normalizePhone(user.phone || "");

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
      cleanPhone
        ? or(eq(registrations.userId, user.id), eq(registrations.phone, cleanPhone))
        : eq(registrations.userId, user.id)
    )
    .orderBy(desc(registrations.createdAt));

  // Filter out favorite-only records (they use notes='__FAV__' marker)
  const realRegs = userRegs.filter((r) => r.notes !== "__FAV__");

  // Aggregates
  const activeRegs = realRegs.filter((r) => r.status === "approved");
  const totalHours = activeRegs.reduce((sum, r) => {
    const m = String(r.duration || "").match(/(\d+)/);
    return sum + (m ? parseInt(m[1]) : 0);
  }, 0);
  const certificatesCount = realRegs.filter((r) => r.certificateUrl).length;

  // Wallet balance — try users.wallet_balance first, fallback to latest tx
  let walletBalance = 0;
  if (user) {
    try {
      const res: any = await db.execute(sql`SELECT wallet_balance FROM users WHERE id = ${user.id} LIMIT 1`);
      if (res?.rows?.[0]?.wallet_balance !== undefined && res.rows[0].wallet_balance !== null) {
        walletBalance = Number(res.rows[0].wallet_balance);
      } else {
        throw new Error("no wallet_balance column");
      }
    } catch {
      try {
        const tx = await db
          .select({ balanceAfter: walletTransactions.balanceAfter })
          .from(walletTransactions)
          .where(eq(walletTransactions.userId, user.id))
          .orderBy(desc(walletTransactions.createdAt))
          .limit(1);
        walletBalance = tx[0] ? Number(tx[0].balanceAfter || 0) : 0;
      } catch {
        walletBalance = 0;
      }
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
    registrations: realRegs,
    stats: {
      activeCourses: activeRegs.length,
      totalHours,
      certificates: certificatesCount,
      walletBalance,
      pendingCount: realRegs.filter((r) => r.status === "pending").length,
      completedCount: realRegs.filter((r) => (r.progress || 0) >= 100).length,
      notificationsUnread: notifCount,
    },
    upcomingSessions,
  });
}
