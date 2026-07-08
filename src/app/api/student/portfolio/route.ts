import { db } from "@/db";
import { studentPortfolio } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json([]);
  try {
    const rows = await db.select().from(studentPortfolio)
      .where(eq(studentPortfolio.userId, Number(userId)))
      .orderBy(desc(studentPortfolio.createdAt));
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const { userId, title, description, imageUrl, link, tags } = await req.json();
    if (!userId || !title) return NextResponse.json({ error: "userId & title required" }, { status: 400 });
    const [row] = await db.insert(studentPortfolio).values({
      userId: Number(userId), title, description: description || null,
      imageUrl: imageUrl || null, link: link || null,
      tags: Array.isArray(tags) ? tags : [],
    }).returning();
    return NextResponse.json({ ok: true, item: row });
  } catch { return NextResponse.json({ error: "err" }, { status: 500 }); }
}

export async function PATCH(req: Request) {
  try {
    const { id, userId, ...fields } = await req.json();
    if (!id || !userId) return NextResponse.json({ error: "id & userId" }, { status: 400 });
    await db.update(studentPortfolio).set(fields).where(eq(studentPortfolio.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "err" }, { status: 500 }); }
}

export async function DELETE(req: Request) {
  try {
    const { id, userId } = await req.json();
    if (!id || !userId) return NextResponse.json({ error: "id & userId" }, { status: 400 });
    await db.delete(studentPortfolio).where(eq(studentPortfolio.id, Number(id)));
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "err" }, { status: 500 }); }
}
