import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, courses } from "@/db/schema";
import { eq, count, asc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const ADMIN_PHONES = ["09159513179", "09150000000"];
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { phone?: string; role?: string } | undefined;
  return user?.role === "admin" || (user?.phone && ADMIN_PHONES.includes(user.phone));
}

function slugify(t: string) {
  return t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\u0600-\u06FFa-z0-9-]/g, "") + "-" + Math.random().toString(36).substring(2, 6);
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const rows = await db.select().from(categories).orderBy(asc(categories.name));
  const enriched = await Promise.all(
    rows.map(async (c) => {
      const cnt = await db.select({ n: count() }).from(courses).where(eq(courses.categoryId, c.id)).then(r => r[0]?.n || 0);
      return { ...c, courseCount: cnt };
    })
  );
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { name, description, icon, color, slug } = await req.json();
  if (!name) return NextResponse.json({ error: "نام رشته الزامی است" }, { status: 400 });
  const [row] = await db.insert(categories).values({
    name, slug: slug || slugify(name), description: description || null,
    icon: icon || null, color: color || null,
  }).returning();
  return NextResponse.json({ ok: true, category: row });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  delete fields.courseCount;
  await db.update(categories).set(fields).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const cnt = await db.select({ n: count() }).from(courses).where(eq(courses.categoryId, id)).then(r => r[0]?.n || 0);
  if (cnt > 0) return NextResponse.json({ error: `این رشته دارای ${cnt} دوره فعال است و قابل حذف نیست` }, { status: 400 });
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ ok: true });
}
