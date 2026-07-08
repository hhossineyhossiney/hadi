import { db } from "@/db";
import { institutes, courses, registrations } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const allInstitutes = await db.select({ id: institutes.id, name: institutes.name }).from(institutes);

  const breakdown = await Promise.all(
    allInstitutes.map(async (inst) => {
      const regs = await db
        .select({
          status: registrations.status,
          courseId: registrations.courseId,
        })
        .from(registrations)
        .where(eq(registrations.instituteId, inst.id));

      const courseList = await db
        .select({ id: courses.id, price: courses.price })
        .from(courses)
        .where(eq(courses.instituteId, inst.id));

      const priceMap = new Map(courseList.map((c) => [c.id, Number(c.price) || 0]));

      const approvedRevenue = regs
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + (priceMap.get(r.courseId) || 0), 0);

      const pendingRevenue = regs
        .filter((r) => r.status === "pending")
        .reduce((sum, r) => sum + (priceMap.get(r.courseId) || 0), 0);

      return {
        instituteId: inst.id,
        instituteName: inst.name,
        studentCount: regs.length,
        courseCount: courseList.length,
        approvedRevenue,
        pendingRevenue,
      };
    })
  );

  const totalRevenue = breakdown.reduce((sum, b) => sum + b.approvedRevenue, 0);
  const totalPending = breakdown.reduce((sum, b) => sum + b.pendingRevenue, 0);
  const totalApprovedRegs = breakdown.reduce((sum, b) => sum + b.studentCount, 0);

  return NextResponse.json({
    totalRevenue,
    totalPending,
    totalApprovedRegs,
    breakdown: breakdown.sort((a, b) => b.approvedRevenue - a.approvedRevenue),
  });
}
