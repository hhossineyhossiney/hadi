import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json([]);
  try {
    const rows = await db.select().from(notifications)
      .where(eq(notifications.userId, Number(userId)))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const { userId, userRole, title, body, type, link } = await req.json();
    if (!userId || !title) return NextResponse.json({ error: "userId & title required" }, { status: 400 });
    const [row] = await db.insert(notifications).values({
      userId: Number(userId), userRole: userRole || "student",
      title, body: body || null, type: type || "info", link: link || null,
    }).returning();
    return NextResponse.json({ ok: true, notification: row });
  } catch (e) { return NextResponse.json({ error: "err" }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  const { id, userId, markAllRead } = await req.json();
  try {
    if (markAllRead && userId) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, Number(userId)));
    } else if (id) {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, Number(id)));
    }
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "err" }, { status: 500 }); }
}
