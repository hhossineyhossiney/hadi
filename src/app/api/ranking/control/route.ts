import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { addRankingAudit, ensureRankingSystem, rowsOf } from "@/lib/ranking-system";

export const dynamic = "force-dynamic";

async function rankingExpert() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return user?.id && user.role === "expert" ? user : null;
}

export async function GET() {
  const user = await rankingExpert();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس رتبه‌بندی لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const rankings = rowsOf(await db.execute(sql`
    SELECT ar.*, i.name AS academy_name, i.slug
    FROM academy_rankings ar
    JOIN institutes i ON i.id = ar.academy_id
    ORDER BY ar.year DESC, ar.updated_at DESC
  `));
  return NextResponse.json({
    rankings,
    stats: {
      total: rankings.length,
      waiting: rankings.filter((row: any) => row.status === "submitted").length,
      approved: rankings.filter((row: any) => row.status === "approved").length,
      published: rankings.filter((row: any) => row.status === "published").length,
    },
  });
}

export async function POST(request: Request) {
  const user = await rankingExpert();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس رتبه‌بندی لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const body = await request.json();
  if (!["publish", "unpublish"].includes(body.action)) return NextResponse.json({ error: "عملیات نامعتبر است" }, { status: 400 });

  const rankingId = Number(body.rankingId);
  const ranking = rowsOf(await db.execute(sql`SELECT * FROM academy_rankings WHERE id = ${rankingId} LIMIT 1`))[0] as any;
  if (!ranking) return NextResponse.json({ error: "پرونده یافت نشد" }, { status: 404 });
  if (body.action === "publish" && !["approved", "published"].includes(ranking.status)) {
    return NextResponse.json({ error: "ابتدا ارزیابی پرونده را تکمیل و تایید کنید" }, { status: 409 });
  }

  const nextStatus = body.action === "publish" ? "published" : "approved";
  await db.execute(sql`
    UPDATE academy_rankings SET status = ${nextStatus}, published_at = ${body.action === "publish" ? new Date() : null},
      valid_until = ${body.action === "publish" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : null}, updated_at = NOW()
    WHERE id = ${rankingId}
  `);
  await addRankingAudit({
    rankingId,
    academyId: Number(ranking.academy_id),
    userId: Number(user.id),
    action: body.action === "publish" ? "ranking_published" : "ranking_unpublished",
  });
  return NextResponse.json({ ok: true });
}
