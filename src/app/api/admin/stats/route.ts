import { db } from "@/db";
import { registrations, institutes, courses } from "@/db/schema";
import { count, eq, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const [totalRegs, totalInsts, totalCourses, pending] = await Promise.all([
    db.select({ count: count() }).from(registrations),
    db.select({ count: count() }).from(institutes),
    db.select({ count: count() }).from(courses),
    db
      .select({ count: count() })
      .from(registrations)
      .where(eq(registrations.status, "pending")),
  ]);

  const approved = await db
    .select({ count: count() })
    .from(registrations)
    .where(eq(registrations.status, "approved"));

  // Today's registrations
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = await db
    .select({ count: count() })
    .from(registrations)
    .where(gte(registrations.createdAt, todayStart))
    .then((r) => r[0]?.count || 0);

  // Total revenue from approved registrations
  const approvedRegs = await db
    .select({ courseId: registrations.courseId })
    .from(registrations)
    .where(eq(registrations.status, "approved"));

  let totalRevenue = 0;
  if (approvedRegs.length > 0) {
    const allCourses = await db.select({ id: courses.id, price: courses.price }).from(courses);
    const priceMap = new Map(allCourses.map((c) => [c.id, Number(c.price) || 0]));
    totalRevenue = approvedRegs.reduce((sum, r) => sum + (priceMap.get(r.courseId) || 0), 0);
  }

  return NextResponse.json({
    totalRegistrations: totalRegs[0]?.count || 0,
    totalInstitutes: totalInsts[0]?.count || 0,
    totalCourses: totalCourses[0]?.count || 0,
    pendingCount: pending[0]?.count || 0,
    approvedCount: approved[0]?.count || 0,
    todayCount,
    totalRevenue,
  });
}
