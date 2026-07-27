import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { authOptions } from "@/lib/auth";
import { addRankingAudit, currentRankingYear, ensureRankingSystem, getRankingBundle, rankFromScore, rowsOf } from "@/lib/ranking-system";

export const dynamic = "force-dynamic";

async function userContext() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  return user?.id && user.role === "expert" ? user : null;
}

async function mayReview(user: any, academyId: number, year: number) {
  if (user.role !== "expert" || !academyId || !year) return false;
  return true;
}

export async function GET(request: Request) {
  const user = await userContext();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const url = new URL(request.url);
  const academyId = Number(url.searchParams.get("academyId"));
  const year = Number(url.searchParams.get("year")) || currentRankingYear();
  if (academyId) {
    if (!(await mayReview(user, academyId, year))) return NextResponse.json({ error: "این آموزشگاه به شما تخصیص داده نشده است" }, { status: 403 });
    return NextResponse.json(await getRankingBundle(academyId, year));
  }

  const filter = sql``;
  const result = await db.execute(sql`
    SELECT ar.id, ar.academy_id, ar.year, ar.status, ar.score, ar.rank, ar.rank_label,
      ar.submitted_at, ar.updated_at, i.name AS academy_name, i.slug, rg.name AS city
    FROM academy_rankings ar
    JOIN institutes i ON i.id = ar.academy_id
    LEFT JOIN regions rg ON rg.id = i.region_id
    LEFT JOIN ranking_assignments ra ON ra.academy_id = ar.academy_id AND ra.year = ar.year
    WHERE ar.status <> 'draft' ${filter}
    ORDER BY CASE ar.status WHEN 'submitted' THEN 1 WHEN 'under_review' THEN 2 WHEN 'needs_correction' THEN 3 ELSE 4 END, ar.updated_at DESC
  `);
  const items = rowsOf(result);
  const stats = {
    waiting: items.filter((item: any) => item.status === "submitted").length,
    reviewed: items.filter((item: any) => ["approved", "published"].includes(item.status)).length,
    approved: items.filter((item: any) => ["approved", "published"].includes(item.status)).length,
    needsCorrection: items.filter((item: any) => item.status === "needs_correction").length,
  };
  return NextResponse.json({ items, stats, year });
}

export async function POST(request: Request) {
  const user = await userContext();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const body = await request.json();
  const academyId = Number(body.academyId);
  const year = Number(body.year) || currentRankingYear();
  if (!academyId || !(await mayReview(user, academyId, year))) return NextResponse.json({ error: "دسترسی به پرونده مجاز نیست" }, { status: 403 });

  const bundle = await getRankingBundle(academyId, year);
  if (bundle.ranking.status === "published" && user.role !== "admin") return NextResponse.json({ error: "رتبه منتشرشده قابل تغییر نیست" }, { status: 409 });
  const incoming = Array.isArray(body.scores) ? body.scores : [];
  for (const criterion of bundle.scores) {
    const scoreInput = incoming.find((item: any) => item.code === criterion.code) || {};
    const expertScore = Math.max(0, Math.min(criterion.maxScore, Number(scoreInput.expertScore ?? criterion.systemScore ?? 0)));
    await db.execute(sql`
      INSERT INTO ranking_scores (ranking_id, criteria_id, system_score, expert_score, expert_comment, deduction_reason, updated_at)
      SELECT ${bundle.ranking.id}, id, ${criterion.systemScore}, ${expertScore}, ${String(scoreInput.comment || "")}, ${String(scoreInput.deductionReason || "")}, NOW()
      FROM ranking_criteria WHERE code = ${criterion.code}
      ON CONFLICT (ranking_id, criteria_id) DO UPDATE SET system_score = EXCLUDED.system_score,
        expert_score = EXCLUDED.expert_score, expert_comment = EXCLUDED.expert_comment,
        deduction_reason = EXCLUDED.deduction_reason, updated_at = NOW()
    `);
  }

  const requestedStatus = ["under_review", "needs_correction", "approved"].includes(body.status) ? body.status : "under_review";
  const status = requestedStatus === "approved" ? "published" : requestedStatus;
  const refreshed = await getRankingBundle(academyId, year);
  const finalScore = refreshed.scores.reduce((sum: number, item: any) => sum + Number(item.expertScore ?? item.systemScore ?? 0), 0);
  const rank = rankFromScore(finalScore);
  const strengths = Array.isArray(body.strengths) ? body.strengths.slice(0, 20) : [];
  const improvements = Array.isArray(body.improvements) ? body.improvements.slice(0, 20) : [];

  await db.execute(sql`
    UPDATE academy_rankings SET expert_id = ${Number(user.id)}, status = ${status}, score = ${finalScore},
      rank = ${rank.code}, rank_label = ${rank.label}, strengths = ${JSON.stringify(strengths)}::jsonb,
      improvements = ${JSON.stringify(improvements)}::jsonb,
      reviewed_at = ${["published", "needs_correction"].includes(status) ? new Date() : null},
      published_at = ${status === "published" ? new Date() : bundle.ranking.publishedAt},
      valid_until = ${status === "published" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : bundle.ranking.validUntil},
      updated_at = NOW()
    WHERE id = ${bundle.ranking.id}
  `);
  await db.execute(sql`
    INSERT INTO ranking_assignments (academy_id, expert_id, year, assigned_by, status)
    VALUES (${academyId}, ${Number(user.id)}, ${year}, ${Number(user.id)}, ${status})
    ON CONFLICT (academy_id, expert_id, year) DO UPDATE SET status = EXCLUDED.status
  `);
  await addRankingAudit({ rankingId: bundle.ranking.id, academyId, userId: Number(user.id), action: `expert_${status}`, details: { score: finalScore, rank: rank.code } });

  const institute = rowsOf(await db.execute(sql`SELECT user_id, name FROM institutes WHERE id = ${academyId}`))[0] as any;
  if (institute?.user_id) {
    await db.execute(sql`
      INSERT INTO notifications (user_id, user_role, title, body, type, link)
      VALUES (${Number(institute.user_id)}, 'institute', ${status === "needs_correction" ? "پرونده رتبه‌بندی نیازمند اصلاح است" : status === "published" ? "رتبه آموزشگاه تایید و منتشر شد" : "بررسی رتبه‌بندی آغاز شد"},
        ${status === "needs_correction" ? "کارشناس مواردی را برای اصلاح ثبت کرده است." : `امتیاز فعلی آموزشگاه ${finalScore} از ۱۰۰ است.`}, ${status === "needs_correction" ? "warning" : "success"}, '/panel')
    `);
  }
  return NextResponse.json({ ok: true, bundle: await getRankingBundle(academyId, year) });
}
