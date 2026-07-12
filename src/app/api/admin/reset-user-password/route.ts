import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";

const ADMINS = ["09159513179", "09150000000"];

async function isAdmin() {
  const s = await getServerSession(authOptions);
  const u = s?.user as any;
  return u?.role === "admin" || (u?.phone && ADMINS.includes(u.phone));
}

// POST { phone, newPassword }  — reset password for any user (admin-only)
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const { phone, newPassword } = await req.json();
    if (!phone || !newPassword) return NextResponse.json({ error: "phone & newPassword required" }, { status: 400 });
    const cleanPhone = normalizePhone(String(phone));
    const user = await db.select().from(users).where(eq(users.phone, cleanPhone)).then(r => r[0]);
    if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    const hash = await bcrypt.hash(String(newPassword), 10);
    await db.update(users).set({ password: hash }).where(eq(users.id, user.id));
    return NextResponse.json({ ok: true, userId: user.id, name: user.name, phone: user.phone });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
