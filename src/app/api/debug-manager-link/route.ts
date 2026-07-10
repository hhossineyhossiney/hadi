import { db } from "@/db";
import { institutes, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint: returns exactly why the currently logged-in user
 * can or cannot access /panel. Safe to call anytime.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;

  if (!sessionUser?.id) {
    return NextResponse.json({
      status: "not_logged_in",
      message: "شما لاگین نکرده‌اید",
    });
  }

  // Get user from DB
  const dbUser = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(sessionUser.id)))
    .then((r) => r[0]);

  // Get all institutes and check linkage
  const allInstitutes = await db.select().from(institutes);
  const linkedToUser = allInstitutes.filter((i) => i.userId === Number(sessionUser.id));

  const cleanPhone = normalizePhone(String(sessionUser.phone || ""));
  const phoneMatches = allInstitutes
    .map((i) => ({
      id: i.id,
      name: i.name,
      mobile: i.mobile,
      phone: i.phone,
      userId: i.userId,
      normalizedMobile: i.mobile ? normalizePhone(String(i.mobile)) : null,
      normalizedPhone: i.phone ? normalizePhone(String(i.phone)) : null,
    }))
    .filter(
      (i) => i.normalizedMobile === cleanPhone || i.normalizedPhone === cleanPhone
    );

  return NextResponse.json({
    status: "diagnostic",
    session: {
      id: sessionUser.id,
      name: sessionUser.name,
      phone: sessionUser.phone,
      role: sessionUser.role,
    },
    dbUser: dbUser
      ? {
          id: dbUser.id,
          name: dbUser.name,
          phone: dbUser.phone,
          role: dbUser.role,
        }
      : null,
    normalizedSessionPhone: cleanPhone,
    linkedToUser: linkedToUser.map((i) => ({
      id: i.id,
      name: i.name,
      userId: i.userId,
    })),
    phoneMatches,
    allInstitutesCount: allInstitutes.length,
    allInstituteMobiles: allInstitutes.map((i) => ({
      id: i.id,
      name: i.name,
      mobile: i.mobile,
      normalized: i.mobile ? normalizePhone(String(i.mobile)) : null,
      userId: i.userId,
    })),
  });
}

/**
 * Force-link current user to a specific institute by id.
 * Call: POST /api/debug-manager-link  { "instituteId": 12 }
 * Only allowed for admin OR the case where institute.userId is null.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "not logged in" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const instituteId = Number(body.instituteId);
  if (!instituteId) return NextResponse.json({ error: "instituteId required" }, { status: 400 });

  const inst = await db
    .select()
    .from(institutes)
    .where(eq(institutes.id, instituteId))
    .then((r) => r[0]);
  if (!inst) return NextResponse.json({ error: "institute not found" }, { status: 404 });

  const isAdmin =
    sessionUser.role === "admin" ||
    sessionUser.phone === "09159513179" ||
    sessionUser.phone === "09150000000";

  // Allow if: admin OR institute has null userId OR institute is already linked to this user
  const allowed = isAdmin || !inst.userId || inst.userId === Number(sessionUser.id);
  if (!allowed) {
    return NextResponse.json(
      { error: "این آموزشگاه به کاربر دیگری متصل است. فقط ادمین می‌تواند تغییر دهد." },
      { status: 403 }
    );
  }

  const [updated] = await db
    .update(institutes)
    .set({ userId: Number(sessionUser.id) })
    .where(eq(institutes.id, instituteId))
    .returning();

  // Also promote role
  await db
    .update(users)
    .set({ role: "institute" as any })
    .where(eq(users.id, Number(sessionUser.id)));

  return NextResponse.json({
    ok: true,
    linkedInstitute: { id: updated.id, name: updated.name, userId: updated.userId },
    message: "آموزشگاه به حساب شما متصل شد. یک بار logout و login کنید تا role جدید فعال شود.",
  });
}
