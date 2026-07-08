import { db } from "@/db";
import { chatThreads, chatMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const u = session?.user as { id?: string; role?: string } | undefined;
  if (!u?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = Number(u.id);
  const { threadId } = await req.json();
  const t = await db.select().from(chatThreads).where(eq(chatThreads.id, Number(threadId))).then(r => r[0]);
  if (!t || (t.participantAId !== uid && t.participantBId !== uid)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await db.delete(chatMessages).where(eq(chatMessages.threadId, Number(threadId)));
  return NextResponse.json({ ok: true });
}
