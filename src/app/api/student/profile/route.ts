import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { normalizePhone } from "@/lib/phone";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user?.id) return { error: "ابتدا وارد حساب کاربری شوید", status: 401 as const };
  return { userId: Number(user.id) };
}

// Fault-tolerant SELECT (works even if extended columns don't exist yet)
async function selectUserSafe(userId: number) {
  try {
    const [u] = await db.select().from(users).where(eq(users.id, userId));
    return u;
  } catch (e: any) {
    // Fallback: minimal columns
    const [u] = await db
      .select({
        id: users.id,
        name: users.name,
        phone: users.phone,
        email: users.email,
        role: users.role,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, userId));
    return u as any;
  }
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const u = await selectUserSafe(auth.userId);
  if (!u) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  // Never return password
  const { password: _, ...safe } = u as any;
  return NextResponse.json({
    id: safe.id,
    name: safe.name || "",
    firstName: safe.firstName || "",
    lastName: safe.lastName || "",
    phone: safe.phone || "",
    email: safe.email || "",
    nationalId: safe.nationalId || "",
    birthDate: safe.birthDate || "",
    gender: safe.gender || "",
    address: safe.address || "",
    education: safe.education || "",
    bio: safe.bio || "",
    avatar: safe.avatar || null,
    walletBalance: Number(safe.walletBalance || 0),
    notificationsEnabled: safe.notificationsEnabled !== false,
    role: safe.role,
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

  const updates: any = {};

  // Combined name from firstName+lastName if provided
  if (firstName !== undefined) updates.firstName = String(firstName).trim() || null;
  if (lastName !== undefined) updates.lastName = String(lastName).trim() || null;
  if (firstName !== undefined || lastName !== undefined) {
    const fn = (firstName ?? "").toString().trim();
    const ln = (lastName ?? "").toString().trim();
    if (fn || ln) updates.name = `${fn} ${ln}`.trim();
  }
  if (name !== undefined && name.trim()) updates.name = String(name).trim();

  if (nationalId !== undefined) updates.nationalId = String(nationalId).trim() || null;
  if (birthDate !== undefined) updates.birthDate = String(birthDate).trim() || null;
  if (gender !== undefined) updates.gender = String(gender).trim() || null;
  if (address !== undefined) updates.address = String(address).trim() || null;
  if (education !== undefined) updates.education = String(education).trim() || null;
  if (bio !== undefined) updates.bio = String(bio).trim() || null;
  if (email !== undefined) updates.email = String(email).trim() || null;
  if (avatar !== undefined) updates.avatar = avatar || null;
  if (notificationsEnabled !== undefined) updates.notificationsEnabled = !!notificationsEnabled;

  // National ID validation
  if (updates.nationalId && !/^\d{10}$/.test(updates.nationalId.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString()))) {
    return NextResponse.json({ error: "کد ملی باید ۱۰ رقم باشد" }, { status: 400 });
  }

  // Password change
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "برای تغییر رمز، رمز فعلی الزامی است" }, { status: 400 });
    }
    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: "رمز جدید حداقل ۶ کاراکتر" }, { status: 400 });
    }
    const [u] = await db.select().from(users).where(eq(users.id, auth.userId));
    if (!u?.password || !(await bcrypt.compare(currentPassword, u.password))) {
      return NextResponse.json({ error: "رمز فعلی نادرست است" }, { status: 400 });
    }
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  try {
    await db.update(users).set(updates).where(eq(users.id, auth.userId));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Profile update error:", e);
    return NextResponse.json({ error: "خطا در ذخیره: " + (e?.message || "unknown") }, { status: 500 });
  }
}
