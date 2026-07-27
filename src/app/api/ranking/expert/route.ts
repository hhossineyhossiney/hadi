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
    if (!(await mayReview(user, academyId, year))) return NextResponse.json({ error: "دسترسی به پرونده مجاز نیست" }, { status: 403 });
    return NextResponse.json(await getRankingBundle(academyId, year));
  }

  const [result, totalsResult, trendResult, cityResult, distributionResult] = await Promise.all([
    db.execute(sql`
      SELECT COALESCE(ar.id, 0) AS id, i.id AS academy_id, ${year}::int AS year,
        COALESCE(ar.status, 'not_started') AS status, COALESCE(ar.score, 0) AS score,
        ar.rank, ar.rank_label, ar.submitted_at, ar.reviewed_at, ar.published_at,
        COALESCE(ar.updated_at, i.created_at) AS updated_at,
        i.name AS academy_name, i.slug, i.user_id AS manager_user_id, rg.name AS city,
        COALESCE(sd.status, 'not_started') AS declaration_status,
        COALESCE(jsonb_object_length(COALESCE(sd.physical, '{}'::jsonb)), 0)::int AS physical_fields,
        COALESCE(jsonb_array_length(COALESCE(sd.books, '[]'::jsonb)), 0)::int AS books_count,
        COALESCE(jsonb_array_length(COALESCE(sd.seminars, '[]'::jsonb)), 0)::int AS seminars_count,
        COALESCE(jsonb_array_length(COALESCE(sd.honors, '[]'::jsonb)), 0)::int AS honors_count,
        COALESCE(jsonb_array_length(COALESCE(sd.documents, '[]'::jsonb)), 0)::int AS documents_count,
        (CASE WHEN COALESCE(jsonb_object_length(COALESCE(sd.physical, '{}'::jsonb)), 0) >= 4 THEN 40 ELSE COALESCE(jsonb_object_length(COALESCE(sd.physical, '{}'::jsonb)), 0) * 10 END
          + CASE WHEN COALESCE(jsonb_array_length(COALESCE(sd.documents, '[]'::jsonb)), 0) > 0 THEN 20 ELSE 0 END
          + CASE WHEN COALESCE(jsonb_array_length(COALESCE(sd.books, '[]'::jsonb)), 0) > 0 THEN 15 ELSE 0 END
          + CASE WHEN COALESCE(jsonb_array_length(COALESCE(sd.seminars, '[]'::jsonb)), 0) > 0 THEN 15 ELSE 0 END
          + CASE WHEN COALESCE(jsonb_array_length(COALESCE(sd.honors, '[]'::jsonb)), 0) > 0 THEN 10 ELSE 0 END)::int AS completion_percent,
        (SELECT COUNT(*)::int FROM registrations reg WHERE reg.institute_id = i.id AND COALESCE(reg.notes, '') <> '__FAV__') AS total_students,
        COALESCE((SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE g.status = 'passed') / NULLIF(COUNT(*) FILTER (WHERE g.status IN ('passed','failed')), 0), 1) FROM grades g WHERE g.institute_id = i.id), 0) AS pass_rate,
        COALESCE((SELECT previous.score FROM academy_rankings previous WHERE previous.academy_id = i.id AND previous.year < ${year} ORDER BY previous.year DESC LIMIT 1), 0) AS previous_score,
        CASE
          WHEN ar.status = 'submitted' AND ar.submitted_at < NOW() - INTERVAL '2 days' THEN 'urgent'
          WHEN ar.status = 'needs_correction' THEN 'high'
          WHEN ar.id IS NULL OR ar.status = 'draft' THEN 'incomplete'
          WHEN COALESCE(jsonb_array_length(COALESCE(sd.documents, '[]'::jsonb)), 0) = 0 THEN 'documents'
          ELSE 'normal'
        END AS priority
      FROM institutes i
      LEFT JOIN regions rg ON rg.id = i.region_id
      LEFT JOIN academy_rankings ar ON ar.academy_id = i.id AND ar.year = ${year}
      LEFT JOIN self_declarations sd ON sd.academy_id = i.id AND sd.year = ${year}
      WHERE i.is_active = TRUE
      ORDER BY CASE COALESCE(ar.status, 'not_started') WHEN 'submitted' THEN 1 WHEN 'under_review' THEN 2 WHEN 'needs_correction' THEN 3 WHEN 'not_started' THEN 4 WHEN 'draft' THEN 5 ELSE 6 END, COALESCE(ar.updated_at, i.created_at) DESC
    `),
    db.execute(sql`
      SELECT
        (SELECT COUNT(*)::int FROM institutes WHERE is_active = TRUE) AS total_academies,
        COUNT(*) FILTER (WHERE status IN ('submitted','under_review','needs_correction','approved'))::int AS active_cases,
        COUNT(*) FILTER (WHERE status = 'submitted')::int AS waiting,
        COUNT(*) FILTER (WHERE status IN ('approved','published'))::int AS approved,
        COUNT(*) FILTER (WHERE status = 'needs_correction')::int AS needs_correction,
        COUNT(*) FILTER (WHERE rank = 'A+' AND status IN ('approved','published'))::int AS excellent,
        COUNT(*) FILTER (WHERE status = 'submitted' AND submitted_at::date = CURRENT_DATE)::int AS today_cases,
        COUNT(*) FILTER (WHERE status = 'submitted' AND submitted_at < NOW() - INTERVAL '2 days')::int AS urgent,
        COUNT(*) FILTER (WHERE status IN ('approved','published') AND reviewed_at::date = CURRENT_DATE)::int AS today_approved,
        COUNT(*) FILTER (WHERE status = 'needs_correction' AND reviewed_at::date = CURRENT_DATE)::int AS today_returned,
        COUNT(*) FILTER (WHERE status IN ('approved','published') AND reviewed_at::date = CURRENT_DATE)::int AS today_reviewed,
        COALESCE(ROUND(AVG(score) FILTER (WHERE status IN ('approved','published')), 1), 0) AS average_score,
        COALESCE(ROUND(AVG(score) FILTER (WHERE year = ${year} AND status IN ('approved','published')), 1), 0) AS current_average,
        COALESCE(ROUND(AVG(score) FILTER (WHERE year = ${year - 1} AND status IN ('approved','published')), 1), 0) AS previous_average
      FROM academy_rankings
    `),
    db.execute(sql`
      SELECT TO_CHAR(DATE_TRUNC('month', COALESCE(reviewed_at, updated_at)), 'YYYY-MM') AS month,
        COUNT(*)::int AS count
      FROM academy_rankings
      WHERE status IN ('approved','published') AND COALESCE(reviewed_at, updated_at) >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', COALESCE(reviewed_at, updated_at))
      ORDER BY DATE_TRUNC('month', COALESCE(reviewed_at, updated_at))
    `),
    db.execute(sql`
      SELECT COALESCE(rg.name, 'بدون منطقه') AS city, COUNT(ar.id)::int AS cases,
        COALESCE(ROUND(AVG(ar.score) FILTER (WHERE ar.status IN ('approved','published')), 1), 0) AS average
      FROM institutes i
      LEFT JOIN regions rg ON rg.id = i.region_id
      LEFT JOIN academy_rankings ar ON ar.academy_id = i.id
      WHERE i.is_active = TRUE
      GROUP BY rg.name ORDER BY average DESC, city
    `),
    db.execute(sql`
      SELECT COALESCE(rank, 'بدون رتبه') AS rank, COUNT(*)::int AS count
      FROM academy_rankings WHERE status IN ('approved','published')
      GROUP BY rank ORDER BY CASE rank WHEN 'A+' THEN 1 WHEN 'A' THEN 2 WHEN 'B' THEN 3 WHEN 'C' THEN 4 WHEN 'D' THEN 5 ELSE 6 END
    `),
  ]);
  const items = rowsOf(result).map((item: any) => {
    const missingItems: string[] = [];
    if (Number(item.physical_fields || 0) < 4) missingItems.push("اطلاعات امکانات فیزیکی");
    if (Number(item.documents_count || 0) === 0) missingItems.push("تصاویر و مستندات");
    if (Number(item.books_count || 0) === 0) missingItems.push("کتاب‌ها یا فعالیت علمی");
    if (Number(item.seminars_count || 0) === 0) missingItems.push("سمینارها و رویدادها");
    if (Number(item.honors_count || 0) === 0) missingItems.push("افتخارات و دستاوردها");
    return { ...item, missing_items: missingItems };
  });
  const total = rowsOf(totalsResult)[0] as any || {};
  const currentAverage = Number(total.current_average || 0);
  const previousAverage = Number(total.previous_average || 0);
  const growth = previousAverage > 0 ? Math.round(((currentAverage - previousAverage) / previousAverage) * 1000) / 10 : 0;
  const incompleteDocuments = items.filter((item: any) => Number(item.documents_count || 0) === 0).length;
  const incompleteDeclarations = items.filter((item: any) => Number(item.completion_percent || 0) < 100).length;
  const notStarted = items.filter((item: any) => ["not_started", "draft"].includes(item.status)).length;
  const stats = {
    totalAcademies: Number(total.total_academies || 0),
    activeCases: Number(total.active_cases || 0),
    waiting: Number(total.waiting || 0),
    reviewed: Number(total.approved || 0),
    approved: Number(total.approved || 0),
    needsCorrection: Number(total.needs_correction || 0),
    excellent: Number(total.excellent || 0),
    averageScore: Number(total.average_score || 0),
    growth,
    todayCases: Number(total.today_cases || 0),
    urgent: Number(total.urgent || 0),
    incompleteDocuments,
    incompleteDeclarations,
    notStarted,
    todayApproved: Number(total.today_approved || 0),
    todayReturned: Number(total.today_returned || 0),
    todayReviewed: Number(total.today_reviewed || 0),
  };
  return NextResponse.json({
    items, stats, year,
    trend: rowsOf(trendResult),
    cityStats: rowsOf(cityResult),
    distribution: rowsOf(distributionResult),
  });
}

export async function POST(request: Request) {
  const user = await userContext();
  if (!user) return NextResponse.json({ error: "دسترسی کارشناس لازم است" }, { status: 401 });
  await ensureRankingSystem();
  const body = await request.json();
  const academyId = Number(body.academyId);
  const year = Number(body.year) || currentRankingYear();
  if (!academyId || !(await mayReview(user, academyId, year))) return NextResponse.json({ error: "دسترسی به پرونده مجاز نیست" }, { status: 403 });

  if (body.action === "send_reminder") {
    const institute = rowsOf(await db.execute(sql`SELECT user_id, name FROM institutes WHERE id = ${academyId} LIMIT 1`))[0] as any;
    if (!institute) return NextResponse.json({ error: "آموزشگاه یافت نشد" }, { status: 404 });
    if (!institute.user_id) return NextResponse.json({ error: "مدیر این آموزشگاه هنوز حساب کاربری فعال ندارد و امکان ارسال اعلان وجود ندارد" }, { status: 409 });
    const severity = body.severity === "warning" ? "warning" : "info";
    const title = severity === "warning" ? "⚠ هشدار تکمیل پرونده رتبه‌بندی" : "📌 یادآوری تکمیل پرونده رتبه‌بندی";
    const message = String(body.message || "لطفاً اطلاعات خوداظهاری و مستندات رتبه‌بندی آموزشگاه را تکمیل و برای بررسی کارشناس ارسال کنید.").slice(0, 1200);
    await db.execute(sql`
      INSERT INTO notifications (user_id, user_role, title, body, type, link)
      VALUES (${Number(institute.user_id)}, 'institute', ${title}, ${message}, ${severity}, '/panel')
    `);
    await addRankingAudit({ academyId, userId: Number(user.id), action: severity === "warning" ? "expert_warning_sent" : "expert_reminder_sent", details: { year, message } });
    return NextResponse.json({ ok: true, sentTo: institute.name });
  }

  const bundle = await getRankingBundle(academyId, year);
  if (bundle.ranking.status === "published") return NextResponse.json({ error: "برای ویرایش، ابتدا از بخش کنترل انتشار، انتشار رتبه را لغو کنید" }, { status: 409 });
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
