import { db } from "@/db";
import { chatThreads, chatMessages } from "@/db/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_ATTACHMENT_DATA_LENGTH = 3_000_000; // ~2 MB source file after base64 encoding
const ALLOWED_ATTACHMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

type IncomingAttachment = {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
};

async function currentUser() {
  const session = await getServerSession(authOptions);
  return session?.user as { id?: string; phone?: string; role?: string } | undefined;
}

function prepareAttachment(input: IncomingAttachment | null | undefined, legacyUrl?: string | null) {
  const url = String(input?.url || legacyUrl || "");
  if (!url) return { stored: null, error: null };
  if (url.length > MAX_ATTACHMENT_DATA_LENGTH) {
    return { stored: null, error: "حجم فایل باید کمتر از ۲ مگابایت باشد" };
  }

  const dataMatch = /^data:([^;,]+);base64,/i.exec(url);
  const mime = String(input?.type || dataMatch?.[1] || "").toLowerCase();
  if (!dataMatch || !ALLOWED_ATTACHMENT_TYPES.has(mime)) {
    return { stored: null, error: "نوع فایل مجاز نیست" };
  }

  const safeName = String(input?.name || (mime.startsWith("image/") ? "تصویر" : "فایل"))
    .replace(/[<>"'`]/g, "")
    .slice(0, 120);
  const size = Math.max(0, Number(input?.size) || 0);
  return {
    stored: JSON.stringify({ url, name: safeName, type: mime, size }),
    error: null,
  };
}

/** GET /api/chat/messages?threadId=1 */
export async function GET(req: Request) {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const threadId = Number(searchParams.get("threadId"));
  if (!threadId) return NextResponse.json([]);
  try {
    const thread = await db.select().from(chatThreads).where(eq(chatThreads.id, threadId)).then((rows) => rows[0]);
    const userId = Number(user.id);
    if (!thread || (thread.participantAId !== userId && thread.participantBId !== userId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const rows = await db.select().from(chatMessages)
      .where(eq(chatMessages.threadId, threadId))
      .orderBy(asc(chatMessages.createdAt));
    await db.update(chatMessages).set({ isRead: true })
      .where(and(eq(chatMessages.threadId, threadId), sql`${chatMessages.senderId} != ${userId}`));
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([]);
  }
}

/** POST /api/chat/messages — send text, image or document */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const userId = Number(user.id);
  try {
    const { threadId, body, attachment, attachmentUrl } = await req.json();
    const text = String(body || "").trim();
    const prepared = prepareAttachment(attachment as IncomingAttachment | undefined, attachmentUrl);
    if (prepared.error) return NextResponse.json({ error: prepared.error }, { status: 400 });
    if (!threadId || (!text && !prepared.stored)) {
      return NextResponse.json({ error: "متن یا فایل برای ارسال لازم است" }, { status: 400 });
    }

    const thread = await db.select().from(chatThreads).where(eq(chatThreads.id, Number(threadId))).then((rows) => rows[0]);
    if (!thread || (thread.participantAId !== userId && thread.participantBId !== userId)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const fallbackBody = prepared.stored ? `📎 ${(attachment as IncomingAttachment | undefined)?.name || "فایل پیوست"}` : "";
    const [row] = await db.insert(chatMessages).values({
      threadId: Number(threadId),
      senderId: userId,
      senderRole: user.role || "student",
      body: text || fallbackBody,
      attachmentUrl: prepared.stored,
    }).returning();

    await db.update(chatThreads).set({ lastMessageAt: new Date() }).where(eq(chatThreads.id, Number(threadId)));
    return NextResponse.json({ ok: true, message: row });
  } catch {
    return NextResponse.json({ error: "خطا در ارسال پیام" }, { status: 500 });
  }
}
