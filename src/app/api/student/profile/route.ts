import { db } from "@/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب کاربری شوید", status: 401 as const };
  return { userId: Number(user.id) };
}

async function fetchUserSafe(userId: number) {
  try {
    const res: any = await db.execute(sql`
      SELECT id, name, phone, email, role, avatar,
             first_name, last_name, national_id, birth_date, gender,
             address, education, bio, wallet_balance, notifications_enabled
      FROM users WHERE id = ${userId} LIMIT 1
    `);
    return res.rows?.[0] || null;
  } catch {
    const res: any = await db.execute(sql`
      SELECT id, name, phone, email, role, avatar
      FROM users WHERE id = ${userId} LIMIT 1
    `);
    return res.rows?.[0] || null;
  }
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const u = await fetchUserSafe(auth.userId);
  if (!u) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  return NextResponse.json({
    id: u.id,
    name: u.name || "",
    firstName: u.first_name || "",
    lastName: u.last_name || "",
    phone: u.phone || "",
    email: u.email || "",
    nationalId: u.national_id || "",
    birthDate: u.birth_date || "",
    gender: u.gender || "",
    address: u.address || "",
    education: u.education || "",
    bio: u.bio || "",
    avatar: u.avatar || null,
    walletBalance: Number(u.wallet_balance || 0),
    notificationsEnabled: u.notifications_enabled !== false,
    role: u.role,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const {
    firstName, lastName, name, nationalId, birthDate, gender,
    address, education, bio, email, avatar, notificationsEnabled,
    currentPassword, newPassword,
  } = body;

  // Password change branch
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "برای تغییر رمز، رمز فعلی الزامی است" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "رمز جدید حداقل ۶ کاراکتر" }, { status: 400 });
    }
    const res: any = await db.execute(sql`SELECT password FROM users WHERE id = ${auth.userId} LIMIT 1`);
    const u = res.rows?.[0];
    if (!u?.password || !(await bcrypt.compare(currentPassword, u.password))) {
      return NextResponse.json({ error: "رمز فعلی نادرست است" }, { status: 400 });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.execute(sql`UPDATE users SET password = ${hashed} WHERE id = ${auth.userId}`);
    return NextResponse.json({ ok: true, passwordChanged: true });
  }

  // Combined name from firstName+lastName
  const fn = firstName !== undefined ? String(firstName).trim() : null;
  const ln = lastName !== undefined ? String(lastName).trim() : null;
  const combinedName = (fn || ln) ? `${fn ?? ""} ${ln ?? ""}`.trim() : null;
  const finalName = (name ? String(name).trim() : null) || combinedName;

  // National ID validation
  const nid = nationalId !== undefined
    ? String(nationalId).replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()).replace(/[^\d]/g, "")
    : undefined;
  if (nid && !/^\d{10}$/.test(nid)) {
    return NextResponse.json({ error: "کد ملی باید ۱۰ رقم باشد" }, { status: 400 });
  }

  // Try the "full" update first (uses all extended columns). If it fails (columns don't exist),
  // fall back to updating only the core columns.
  try {
    await db.execute(sql`
      UPDATE users SET
        name = COALESCE(${finalName ?? null}, name),
        email = COALESCE(${email !== undefined ? (String(email).trim() || null) : null}::text, email),
        avatar = COALESCE(${avatar !== undefined ? (avatar || null) : null}::text, avatar),
        first_name = COALESCE(${fn}::varchar, first_name),
        last_name = COALESCE(${ln}::varchar, last_name),
        national_id = COALESCE(${nid ?? null}::varchar, national_id),
        birth_date = COALESCE(${birthDate !== undefined ? String(birthDate).trim() || null : null}::varchar, birth_date),
        gender = COALESCE(${gender !== undefined ? String(gender).trim() || null : null}::varchar, gender),
        address = COALESCE(${address !== undefined ? String(address).trim() || null : null}::text, address),
        education = COALESCE(${education !== undefined ? String(education).trim() || null : null}::varchar, education),
        bio = COALESCE(${bio !== undefined ? String(bio).trim() || null : null}::text, bio),
        notifications_enabled = COALESCE(${notificationsEnabled !== undefined ? !!notificationsEnabled : null}::boolean, notifications_enabled)
      WHERE id = ${auth.userId}
    `);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // Fallback: extended columns don't exist yet
    console.error("Full profile UPDATE failed, falling back to core-only:", e?.message);
    try {
      if (finalName) {
        await db.execute(sql`UPDATE users SET name = ${finalName} WHERE id = ${auth.userId}`);
      }
      if (email !== undefined) {
        await db.execute(sql`UPDATE users SET email = ${String(email).trim() || null} WHERE id = ${auth.userId}`);
      }
      if (avatar !== undefined) {
        await db.execute(sql`UPDATE users SET avatar = ${avatar || null} WHERE id = ${auth.userId}`);
      }
      return NextResponse.json({
        ok: true,
        warning: "فقط اطلاعات پایه ذخیره شد. برای فعال شدن سایر فیلدها، migration را در پنل ادمین اجرا کنید.",
      });
    } catch (e2: any) {
      console.error("Core UPDATE also failed:", e2);
      return NextResponse.json({ error: "خطا در ذخیره: " + (e2?.message || "unknown") }, { status: 500 });
    }
  }
}
