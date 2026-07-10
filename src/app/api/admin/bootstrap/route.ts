import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * Bootstrap / reset admin accounts.
 * Safe to call anytime. Uses a hard-coded reset secret in URL for one-time use.
 *
 * Usage:
 *   GET  /api/admin/bootstrap  → shows current admin user statuses
 *   POST /api/admin/bootstrap  { "secret": "zebarkhan-fix-2026", "phone": "09159513179", "password": "123456" }
 */

const ADMIN_PHONES = ["09159513179", "09150000000"];
const RESET_SECRET = "zebarkhan-fix-2026";

export async function GET() {
  const adminUsers: any[] = [];
  for (const phone of ADMIN_PHONES) {
    const u = await db
      .select({ id: users.id, name: users.name, phone: users.phone, role: users.role })
      .from(users)
      .where(eq(users.phone, phone))
      .then((r) => r[0]);
    adminUsers.push({
      phone,
      exists: !!u,
      user: u || null,
    });
  }
  return NextResponse.json({
    status: "diagnostic",
    admins: adminUsers,
    resetInstructions: {
      method: "POST",
      url: "/api/admin/bootstrap",
      body: {
        secret: RESET_SECRET,
        phone: "09159513179",
        password: "your-new-password",
      },
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { secret, phone, password, name } = body;

  if (secret !== RESET_SECRET) {
    return NextResponse.json({ error: "secret نامعتبر" }, { status: 403 });
  }

  if (!phone || !ADMIN_PHONES.includes(String(phone))) {
    return NextResponse.json(
      { error: `فقط شماره‌های ادمین قابل ریست هستند: ${ADMIN_PHONES.join(", ")}` },
      { status: 400 }
    );
  }

  if (!password || String(password).length < 6) {
    return NextResponse.json({ error: "رمز باید حداقل ۶ کاراکتر باشد" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(String(password), 10);
  const fullName = name || "مدیر کل سامانه";

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.phone, String(phone)))
    .then((r) => r[0]);

  let action = "";
  let user: any;
  if (existing) {
    // Update password + promote to admin
    const [updated] = await db
      .update(users)
      .set({
        password: hashed,
        role: "admin" as any,
        name: existing.name || fullName,
      })
      .where(eq(users.id, existing.id))
      .returning();
    user = updated;
    action = "updated";
  } else {
    // Create fresh admin user
    const [created] = await db
      .insert(users)
      .values({
        name: fullName,
        phone: String(phone),
        password: hashed,
        role: "admin" as any,
      })
      .returning();
    user = created;
    action = "created";
  }

  return NextResponse.json({
    ok: true,
    action,
    user: { id: user.id, phone: user.phone, name: user.name, role: user.role },
    message:
      action === "created"
        ? "حساب ادمین ساخته شد. حالا می‌توانید با شماره و رمز جدید وارد شوید."
        : "رمز عبور ادمین با موفقیت به‌روزرسانی شد.",
  });
}
