import { db } from "@/db";
import { categories } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await db.select().from(categories).orderBy(categories.name);
  return NextResponse.json(data);
}
