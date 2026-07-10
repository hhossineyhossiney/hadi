import { db } from "@/db";
import { registrations, institutes, notifications, courses } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function requireManager() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "unauthorized", status: 401 as const };

  const inst = await db.select().from(institutes)
    .where(eq(institutes.userId, Number(user.id)))
    .then((r) => r[0]);
  if (!inst) return { error: "no institute", status: 403 as const };
  return { userId: Number(user.id), instituteId: inst.id, instituteName: inst.name };
}

/** PATCH — update progress and/or sessionsAttended for a registration */
export async function PATCH(request: Request) {
  const auth = await requireManager();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const { registrationId, progress, sessionsAttended, notifyStudent } = body;

  if (!registrationId) return NextResponse.json({ error: "registrationId required" }, { status: 400 });

  const reg = await db.select().from(registrations)
    .where(and(eq(registrations.id, Number(registrationId)), eq(registrations.instituteId, auth.instituteId)))
    .then((r) => r[0]);
  if (!reg) return NextResponse.json({ error: "ثبت‌نام متعلق به آموزشگاه شما نیست" }, { status: 403 });

  const updates: any = {};
  if (progress !== undefined) {
    const p = Math.max(0, Math.min(100, Number(progress)));
    if (isNaN(p)) return NextResponse.json({ error: "درصد نامعتبر است" }, { status: 400 });
    updates.progress = p;
  }
  if (sessionsAttended !== undefined) {
    const s = Math.max(0, Number(sessionsAttended));
    if (isNaN(s)) return NextResponse.json({ error: "تعداد جلسات نامعتبر است" }, { status: 400 });
    updates.sessionsAttended = s;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "هیچ فیلدی برای به‌روزرسانی وجود ندارد" }, { status: 400 });
  }

  const [updated] = await db.update(registrations).set(updates)
    .where(eq(registrations.id, Number(registrationId))).returning();

  // Send notification to student if requested (or always on progress change)
  if (reg.userId && notifyStudent !== false) {
    try {
      const courseInfo = await db.select({ title: courses.title }).from(courses)
        .where(eq(courses.id, reg.courseId)).then((r) => r[0]);
      let title = "📊 پیشرفت شما به‌روزرسانی شد";
      let bodyText = `${auth.instituteName}: دوره «${courseInfo?.title || "دوره"}»`;
      if (progress !== undefined) {
        bodyText += ` — پیشرفت: ${updates.progress}%`;
        if (updates.progress >= 100) title = "🎉 دوره شما با موفقیت به اتمام رسید";
      }
      if (sessionsAttended !== undefined) {
        bodyText += ` — جلسات شرکت‌کرده: ${updates.sessionsAttended}`;
      }
      await db.insert(notifications).values({
        userId: reg.userId,
        userRole: "student",
        title,
        body: bodyText,
        type: updates.progress >= 100 ? "success" : "info",
        link: "/dashboard",
      });
    } catch (e) { console.error("notify failed:", e); }
  }

  return NextResponse.json({ ok: true, registration: updated });
}
