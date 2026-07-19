import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { institutes, users } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";

const ADMIN_PHONES = new Set(["09159513179", "09150000000"]);

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const current = session?.user as { id?: string; role?: string; phone?: string } | undefined;
  const isAdmin = current?.role === "admin" || ADMIN_PHONES.has(normalizePhone(current?.phone || ""));
  if (!current?.id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  try {
    const [instituteRows, userRows] = await Promise.all([
      db.select().from(institutes).where(eq(institutes.isActive, true)).orderBy(asc(institutes.name)),
      db.select({ id: users.id, name: users.name, phone: users.phone, avatar: users.avatar, role: users.role }).from(users),
    ]);
    const userById = new Map(userRows.map((user) => [user.id, user]));
    const userByPhone = new Map(userRows.map((user) => [normalizePhone(user.phone || ""), user]));

    const isValidManager = (candidate: (typeof userRows)[number] | undefined) => !!candidate
      && candidate.id !== Number(current.id)
      && candidate.role !== "admin"
      && !ADMIN_PHONES.has(normalizePhone(candidate.phone || ""));

    const contacts = instituteRows.map((institute) => {
      const linkedCandidate = institute.userId ? userById.get(institute.userId) : undefined;
      const linked = isValidManager(linkedCandidate) ? linkedCandidate : undefined;
      const phoneMatch = [institute.mobile, institute.phone]
        .filter(Boolean)
        .map((value) => userByPhone.get(normalizePhone(String(value))))
        .find(isValidManager);
      const manager = linked || phoneMatch;
      return {
        instituteId: institute.id,
        instituteName: institute.name,
        instituteSlug: institute.slug,
        managerUserId: manager?.id || null,
        managerName: manager?.name || institute.managerName || "مدیر آموزشگاه",
        phone: manager?.phone || institute.mobile || institute.phone || null,
        avatar: institute.profilePhoto || institute.logo || manager?.avatar || null,
        isVerified: !!institute.isVerified,
        canChat: !!manager?.id,
      };
    });

    return NextResponse.json({ contacts, total: contacts.length });
  } catch (error) {
    console.error("chat contacts error", error);
    return NextResponse.json({ contacts: [], total: 0 });
  }
}
