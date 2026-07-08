import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { normalizePhone } from "@/lib/phone";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/lookup-user?phone=09... — returns { userId } if a user exists with this phone
export async function GET(req: Request) {
  // Only logged-in users can look up
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });
  const clean = normalizePhone(phone);
  const row = await db
    .select({ id: users.id, name: users.name, phone: users.phone })
    .from(users)
    .where(or(eq(users.phone, clean), eq(users.email, clean)))
    .then((r) => r[0] || null);
  if (!row) return NextResponse.json({ userId: null, error: "not_found" });
  return NextResponse.json({ userId: row.id, name: row.name, phone: row.phone });
}
