import { db } from "@/db";
import { chatThreads, chatMessages, users, institutes } from "@/db/schema";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizePhone } from "@/lib/phone";

const ADMIN_PHONES = new Set(["09159513179", "09150000000"]);

export const dynamic = "force-dynamic";

async function currentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id?: string; phone?: string; role?: string; name?: string } | undefined;
}

/** GET /api/chat/threads?filter=active|archived|team|support&search=... */
export async function GET(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "active";
  const search = (searchParams.get("search") || "").toLowerCase().trim();

  try {
    let rows = await db.select().from(chatThreads)
      .where(or(eq(chatThreads.participantAId, uid), eq(chatThreads.participantBId, uid)))
      .orderBy(desc(chatThreads.isPinned), desc(chatThreads.lastMessageAt));

    // Filter
    if (filter === "archived") rows = rows.filter(t => t.isArchived === true);
    else if (filter === "active") rows = rows.filter(t => t.isArchived !== true);
    // team/support are subtypes for future

    const enriched = await Promise.all(rows.map(async (t) => {
      const otherId = t.participantAId === uid ? t.participantBId : t.participantAId;
      const otherRole = t.participantAId === uid ? t.participantBRole : t.participantARole;
      let other = await db.select({ id: users.id, name: users.name, phone: users.phone, avatar: users.avatar, role: users.role })
        .from(users).where(eq(users.id, otherId)).then(r => r[0] || null);
      let instituteInfo: { id: number; name: string; slug: string; profilePhoto: string | null } | null = null;
      if (otherRole === "institute") {
        instituteInfo = await db.select({
          id: institutes.id,
          name: institutes.name,
          slug: institutes.slug,
          profilePhoto: institutes.profilePhoto,
        }).from(institutes).where(
          t.contextType === "institute" && t.contextId
            ? eq(institutes.id, t.contextId)
            : eq(institutes.userId, otherId),
        ).then(r => r[0] || null);
        if (other && instituteInfo) {
          other = { ...other, name: instituteInfo.name, avatar: instituteInfo.profilePhoto || other.avatar };
        }
      }
      const last = await db.select().from(chatMessages)
        .where(eq(chatMessages.threadId, t.id))
        .orderBy(desc(chatMessages.createdAt)).limit(1).then(r => r[0] || null);
      const unread = await db.select({ n: sql<number>`count(*)::int` }).from(chatMessages)
        .where(and(eq(chatMessages.threadId, t.id), eq(chatMessages.isRead, false), sql`${chatMessages.senderId} != ${uid}`))
        .then(r => Number(r[0]?.n || 0));
      // Online: last activity < 5 min ago
      const isOnline = last ? (Date.now() - new Date(last.createdAt as any).getTime()) < 5 * 60 * 1000 : false;
      return { ...t, other, otherRole, institute: instituteInfo, lastMessage: last, unread, isOnline };
    }));

    // Search
    const filtered = search
      ? enriched.filter(t => (t.other?.name || "").toLowerCase().includes(search) || (t.lastMessage?.body || "").toLowerCase().includes(search))
      : enriched;

    return NextResponse.json(filtered);
  } catch (e) { console.error(e); return NextResponse.json([]); }
}

/** POST /api/chat/threads — create or return existing */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  const effectiveRole = u.role === "admin" || ADMIN_PHONES.has(normalizePhone(u.phone || "")) ? "admin" : (u.role || "student");
  try {
    const { otherUserId, otherRole, contextType, contextId } = await req.json();
    if (!otherUserId) return NextResponse.json({ error: "otherUserId required" }, { status: 400 });
    const oid = Number(otherUserId);
    if (!oid || oid === uid) return NextResponse.json({ error: "invalid chat target" }, { status: 400 });
    const targetUser = await db.select({ id: users.id }).from(users).where(eq(users.id, oid)).then(r => r[0]);
    if (!targetUser) return NextResponse.json({ error: "chat target not found" }, { status: 404 });
    const existing = await db.select().from(chatThreads)
      .where(or(
        and(eq(chatThreads.participantAId, uid), eq(chatThreads.participantBId, oid)),
        and(eq(chatThreads.participantAId, oid), eq(chatThreads.participantBId, uid)),
      )).then(r => r[0] || null);
    if (existing) {
      // Re-opening a contact also repairs legacy threads that did not store their institute context.
      const patch: Partial<typeof chatThreads.$inferInsert> = {};
      if (existing.isArchived) patch.isArchived = false;
      if (existing.participantAId === uid && existing.participantARole !== effectiveRole) patch.participantARole = effectiveRole;
      if (existing.participantBId === uid && existing.participantBRole !== effectiveRole) patch.participantBRole = effectiveRole;
      if (contextType && !existing.contextType) patch.contextType = contextType;
      if (contextId && !existing.contextId) patch.contextId = Number(contextId);
      if (Object.keys(patch).length) await db.update(chatThreads).set(patch).where(eq(chatThreads.id, existing.id));
      return NextResponse.json({ ok: true, thread: { ...existing, ...patch, isArchived: false } });
    }
    const [row] = await db.insert(chatThreads).values({
      participantAId: uid, participantARole: effectiveRole,
      participantBId: oid, participantBRole: otherRole || "institute",
      contextType: contextType || "general", contextId: contextId || null,
    }).returning();
    return NextResponse.json({ ok: true, thread: row });
  } catch (e) { console.error(e); return NextResponse.json({ error: "err" }, { status: 500 }); }
}

/** PATCH /api/chat/threads — archive / unarchive / pin / unpin */
export async function PATCH(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  try {
    const { threadId, action } = await req.json();
    if (!threadId || !action) return NextResponse.json({ error: "threadId & action required" }, { status: 400 });
    const t = await db.select().from(chatThreads).where(eq(chatThreads.id, Number(threadId))).then(r => r[0]);
    if (!t || (t.participantAId !== uid && t.participantBId !== uid)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (action === "archive") await db.update(chatThreads).set({ isArchived: true }).where(eq(chatThreads.id, t.id));
    else if (action === "unarchive") await db.update(chatThreads).set({ isArchived: false }).where(eq(chatThreads.id, t.id));
    else if (action === "pin") await db.update(chatThreads).set({ isPinned: true }).where(eq(chatThreads.id, t.id));
    else if (action === "unpin") await db.update(chatThreads).set({ isPinned: false }).where(eq(chatThreads.id, t.id));
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "err" }, { status: 500 }); }
}

/** DELETE — permanently delete a thread and all its messages */
export async function DELETE(req: Request) {
  const u = await currentUser();
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  try {
    const { threadId } = await req.json();
    if (!threadId) return NextResponse.json({ error: "threadId required" }, { status: 400 });
    const t = await db.select().from(chatThreads).where(eq(chatThreads.id, Number(threadId))).then(r => r[0]);
    if (!t || (t.participantAId !== uid && t.participantBId !== uid)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    // Messages cascade automatically via FK
    await db.delete(chatThreads).where(eq(chatThreads.id, t.id));
    return NextResponse.json({ ok: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "err" }, { status: 500 }); }
}
