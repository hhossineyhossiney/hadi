import { db } from "@/db";
import { chatThreads, chatMessages } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function currentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id?: string; phone?: string; role?: string } | undefined;
}

/** GET /api/chat/messages?threadId=1 */
export async function GET(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const threadId = Number(searchParams.get("threadId"));
  if (!threadId) return NextResponse.json([]);
  try {
    // Verify user is participant
    const t = await db.select().from(chatThreads).where(eq(chatThreads.id, threadId)).then(r => r[0]);
    const uid = Number(u.id);
    if (!t || (t.participantAId !== uid && t.participantBId !== uid)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const rows = await db.select().from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(asc(chatMessages.createdAt));
    // Mark all messages from other as read
    await db.update(chatMessages).set({ isRead: true })
      .where(and(eq(chatMessages.threadId, threadId), sql`${chatMessages.senderId} != ${uid}`));
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

/** POST /api/chat/messages — send new message */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  try {
    const { threadId, body, attachmentUrl } = await req.json();
    if (!threadId || !body || !String(body).trim()) return NextResponse.json({ error: "threadId & body required" }, { status: 400 });
    const t = await db.select().from(chatThreads).where(eq(chatThreads.id, threadId)).then(r => r[0]);
    if (!t || (t.participantAId !== uid && t.participantBId !== uid)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const [row] = await db.insert(chatMessages).values({
      threadId: Number(threadId), senderId: uid, senderRole: u.role || "student",
      body: String(body).trim(), attachmentUrl: attachmentUrl || null,
    }).returning();
    // Update thread lastMessageAt
    await db.update(chatThreads).set({ lastMessageAt: new Date() }).where(eq(chatThreads.id, threadId));
    return NextResponse.json({ ok: true, message: row });
  } catch (e) { return NextResponse.json({ error: "err" }, { status: 500 }); }
}
