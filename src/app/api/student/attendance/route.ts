import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const s = await getServerSession(authOptions);
  const uid = Number((s?.user as any)?.id);
  if (!uid) return NextResponse.json({ error: "unauth" }, { status: 401 });
  try {
    const rows = await db.execute(sql`
      SELECT a.*, c.title AS course_title
      FROM attendance a
      LEFT JOIN courses c ON c.id = a.course_id
      WHERE a.user_id = ${uid}
      ORDER BY a.session_date DESC, a.created_at DESC
    `);
    return NextResponse.json({ items: ((rows as any).rows || rows) });
  } catch (e: any) { return NextResponse.json({ error: e?.message }, { status: 500 }); }
}
