import { NextResponse } from "next/server";
import { db } from "@/db";
import { regions, institutes } from "@/db/schema";
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
  const rows = await db.select().from(regions).orderBy(asc(regions.name));
  const enriched = await Promise.all(rows.map(async (r) => {
    const cnt = await db.select({ n: count() }).from(institutes).where(eq(institutes.regionId, r.id)).then(x => x[0]?.n || 0);
    return { ...r, instituteCount: cnt };
  }));
  return NextResponse.json(enriched);
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { name, slug } = await req.json();
  if (!name) return NextResponse.json({ error: "نام منطقه الزامی است" }, { status: 400 });
  const [row] = await db.insert(regions).values({
    name, slug: slug || slugify(name),
  }).returning();
  return NextResponse.json({ ok: true, region: row });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  delete fields.instituteCount;
  await db.update(regions).set(fields).where(eq(regions.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const cnt = await db.select({ n: count() }).from(institutes).where(eq(institutes.regionId, id)).then(x => x[0]?.n || 0);
  if (cnt > 0) return NextResponse.json({ error: `این منطقه دارای ${cnt} آموزشگاه است` }, { status: 400 });
  await db.delete(regions).where(eq(regions.id, id));
  return NextResponse.json({ ok: true });
}
