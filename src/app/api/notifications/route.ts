import { db } from "@/db";
import { notifications, registrations, users, courses, institutes } from "@/db/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/notifications
 *   - Authenticated user gets their own notifications
 *   - Or ?userId=X for legacy compatibility (must be self or admin)
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;

  const { searchParams } = new URL(req.url);
  const queriedUserId = searchParams.get("userId");
  const unreadOnly = searchParams.get("unread") === "1";

  let targetUserId: number | null = null;
  if (sessionUser?.id) {
    targetUserId = Number(sessionUser.id);
  } else if (queriedUserId) {
    targetUserId = Number(queriedUserId);
  }

  if (!targetUserId) return NextResponse.json([]);

  try {
    const where = unreadOnly
      ? and(eq(notifications.userId, targetUserId), eq(notifications.isRead, false))
      : eq(notifications.userId, targetUserId);
    const rows = await db.select().from(notifications).where(where).orderBy(desc(notifications.createdAt)).limit(100);
    return NextResponse.json(rows);
  } catch (e) {
    console.error("notifications GET error:", e);
    return NextResponse.json([]);
  }
}

/**
 * POST /api/notifications
 * Body variants:
 *   { title, body, type?, link? }  → send to self
 *   { title, body, targetUserIds: [1,2,3] }  → admin/manager broadcast
 *   { title, body, targetCourseId }  → manager sends to all approved students of a course
 *   { title, body, targetAll: true, targetRole?: "student" }  → admin only, broadcast to all
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user as any;
    if (!sessionUser?.id) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

    const body = await req.json();
    const { title, body: msgBody, type, link, targetUserIds, targetCourseId, targetAll, targetRole } = body;

    if (!title) return NextResponse.json({ error: "title الزامی است" }, { status: 400 });

    const senderId = Number(sessionUser.id);
    const senderRole = sessionUser.role;
    const isAdmin = senderRole === "admin" || sessionUser.phone === "09159513179" || sessionUser.phone === "09150000000";

    // Determine recipient list
    let recipients: Array<{ id: number; role: string }> = [];

    if (targetCourseId) {
      // Manager wants to notify all enrolled students of a course
      // Verify the course belongs to sender's institute
      const c = await db.select().from(courses).where(eq(courses.id, Number(targetCourseId))).then((r) => r[0]);
      if (!c) return NextResponse.json({ error: "دوره یافت نشد" }, { status: 404 });
      const inst = await db.select().from(institutes).where(eq(institutes.id, c.instituteId)).then((r) => r[0]);
      if (!inst) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });
      const allowed = isAdmin || inst.userId === senderId;
      if (!allowed) return NextResponse.json({ error: "شما مدیر این دوره نیستید" }, { status: 403 });

      const regs = await db.select({ userId: registrations.userId })
        .from(registrations)
        .where(and(eq(registrations.courseId, Number(targetCourseId)), eq(registrations.status, "approved")));
      const uids = Array.from(new Set(regs.map((r) => r.userId).filter(Boolean))) as number[];
      recipients = uids.map((id) => ({ id, role: "student" }));
    } else if (Array.isArray(targetUserIds) && targetUserIds.length > 0) {
      if (!isAdmin && senderRole !== "institute") {
        return NextResponse.json({ error: "دسترسی ندارید" }, { status: 403 });
      }
      recipients = targetUserIds.map((id: any) => ({ id: Number(id), role: "student" }));
    } else if (targetAll) {
      if (!isAdmin) return NextResponse.json({ error: "فقط ادمین" }, { status: 403 });
      const list = targetRole
        ? await db.select({ id: users.id, role: users.role }).from(users).where(eq(users.role, targetRole as any))
        : await db.select({ id: users.id, role: users.role }).from(users);
      recipients = list.map((u) => ({ id: u.id, role: u.role || "student" }));
    } else {
      // Default: send to self (used for local notifications like read confirmations)
      recipients = [{ id: senderId, role: senderRole || "student" }];
    }

    if (recipients.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "هیچ گیرنده‌ای پیدا نشد" });
    }

    // Deduplicate by userId
    const seen = new Set<number>();
    const unique = recipients.filter((r) => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    // Bulk insert
    const rows = await db.insert(notifications).values(
      unique.map((r) => ({
        userId: r.id,
        userRole: r.role,
        title: String(title).slice(0, 250),
        body: msgBody ? String(msgBody).slice(0, 2000) : null,
        type: type || "info",
        link: link || null,
      }))
    ).returning();

    return NextResponse.json({ ok: true, sent: rows.length });
  } catch (e: any) {
    console.error("notifications POST error:", e);
    return NextResponse.json({ error: "خطا: " + (e?.message || "unknown") }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;

  const body = await req.json();
  const { id, markAllRead } = body;
  const userId = Number(sessionUser?.id || body.userId);
  if (!userId) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  try {
    if (markAllRead) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    } else if (id) {
      await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, Number(id)), eq(notifications.userId, userId)));
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: "err" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) return NextResponse.json({ error: "not authenticated" }, { status: 401 });

  const body = await req.json();
  const { id, deleteAll } = body;

  try {
    if (deleteAll) {
      await db.delete(notifications).where(eq(notifications.userId, Number(sessionUser.id)));
    } else if (id) {
      await db.delete(notifications).where(and(eq(notifications.id, Number(id)), eq(notifications.userId, Number(sessionUser.id))));
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "err" }, { status: 500 }); }
}
