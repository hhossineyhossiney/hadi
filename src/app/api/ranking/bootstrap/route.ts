import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { ensureRankingSystem, rowsOf } from "@/lib/ranking-system";
import { normalizePhone } from "@/lib/phone";

async function bootstrapAdmin() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return user?.id && (user.role === "admin" || ["09159513179", "09150000000"].includes(normalizePhone(user.phone || ""))) ? user : null;
}

export async function GET() {
  const user = await bootstrapAdmin();
  if (!user) return NextResponse.json({ error: "ورود مالک سامانه برای راه‌اندازی اولیه لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const count = Number((rowsOf(await db.execute(sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'expert'`))[0] as any)?.count || 0);
  return NextResponse.json({ canSetup: count === 0, expertCount: count });
}

export async function POST(request: Request) {
  const user = await bootstrapAdmin();
  if (!user) return NextResponse.json({ error: "دسترسی راه‌اندازی اولیه مجاز نیست" }, { status: 401 });
  await ensureRankingSystem();
  const count = Number((rowsOf(await db.execute(sql`SELECT COUNT(*)::int AS count FROM users WHERE role = 'expert'`))[0] as any)?.count || 0);
  if (count > 0) return NextResponse.json({ error: "حساب کارشناس قبلاً ساخته شده و ادامه مدیریت فقط از پنل کارشناس انجام می‌شود." }, { status: 409 });
  const body = await request.json();
  const phone = normalizePhone(body.phone || "");
  if (!body.name?.trim() || !/^09\d{9}$/.test(phone) || String(body.password || "").length < 6) return NextResponse.json({ error: "نام، موبایل معتبر و رمز حداقل ۶ کاراکتری الزامی است" }, { status: 400 });
  const existing = rowsOf(await db.execute(sql`SELECT id, role FROM users WHERE phone = ${phone} LIMIT 1`))[0] as any;
  if (existing && ["admin", "institute"].includes(existing.role)) return NextResponse.json({ error: "این شماره به حساب مدیریتی دیگری متصل است" }, { status: 409 });
  const hash = await bcrypt.hash(String(body.password), 10);
  if (existing) await db.execute(sql`UPDATE users SET name = ${String(body.name)}, password = ${hash}, role = 'expert' WHERE id = ${Number(existing.id)}`);
  else await db.execute(sql`INSERT INTO users (name, phone, password, role) VALUES (${String(body.name)}, ${phone}, ${hash}, 'expert')`);
  return NextResponse.json({ ok: true, loginUrl: "/login?callbackUrl=/expert" });
}
