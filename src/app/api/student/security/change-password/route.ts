import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "برای تغییر رمز ابتدا وارد شوید" }, { status: 401 });
  try {
    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) return NextResponse.json({ error: "رمز فعلی و جدید الزامی است" }, { status: 400 });
    if (String(newPassword).length < 6) return NextResponse.json({ error: "رمز جدید حداقل ۶ کاراکتر باید باشد" }, { status: 400 });
    const user = await db.select().from(users).where(eq(users.id, uid)).then(r => r[0]);
    if (!user || !user.password) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return NextResponse.json({ error: "رمز عبور فعلی اشتباه است" }, { status: 400 });
    const hash = await bcrypt.hash(String(newPassword), 10);
    await db.update(users).set({ password: hash }).where(eq(users.id, uid));
    return NextResponse.json({ ok: true });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
