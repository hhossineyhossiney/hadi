import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_PHONES = ["09159513179", "09150000000"];
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { phone?: string; role?: string } | undefined;
  return user?.role === "admin" || (user?.phone && ADMIN_PHONES.includes(user.phone));
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { question, answer, sortOrder } = await req.json();
  if (!question || !answer) return NextResponse.json({ error: "سوال و پاسخ الزامی است" }, { status: 400 });
  const [row] = await db.insert(faqs).values({
    question, answer, sortOrder: Number(sortOrder) || 0, isActive: true,
  }).returning();
  return NextResponse.json({ ok: true, faq: row });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.update(faqs).set({ ...fields, updatedAt: new Date() }).where(eq(faqs.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(faqs).where(eq(faqs.id, id));
  return NextResponse.json({ ok: true });
}
