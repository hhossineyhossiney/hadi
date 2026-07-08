import { NextResponse } from "next/server";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, true))
      .orderBy(asc(faqs.sortOrder), asc(faqs.id));
    return NextResponse.json(rows);
  } catch (e) {
    console.error("GET /api/faqs", e);
    return NextResponse.json([]);
  }
}
