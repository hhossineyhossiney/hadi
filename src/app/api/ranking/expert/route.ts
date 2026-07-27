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

  let baseRows: any[] = [];
  try {
    baseRows = rowsOf(await db.execute(sql`
      SELECT COALESCE(ar.id, 0) AS id, i.id AS academy_id, ${year}::int AS year,
        COALESCE(ar.status, 'not_started') AS status, COALESCE(ar.score, 0) AS score,
        ar.rank, ar.rank_label, ar.submitted_at, ar.reviewed_at, ar.published_at,
        COALESCE(ar.updated_at, i.created_at) AS updated_at,
        i.name AS academy_name, i.slug, i.user_id AS manager_user_id, rg.name AS city,
        COALESCE(sd.status, 'not_started') AS declaration_status,
        COALESCE(sd.physical, '{}'::jsonb) AS physical,
        COALESCE(sd.books, '[]'::jsonb) AS books,
        COALESCE(sd.seminars, '[]'::jsonb) AS seminars,
        COALESCE(sd.honors, '[]'::jsonb) AS honors,
        COALESCE(sd.documents, '[]'::jsonb) AS documents,
        (SELECT COUNT(*)::int FROM registrations reg WHERE reg.institute_id = i.id AND COALESCE(reg.notes, '') <> '__FAV__') AS total_students,
        (SELECT COUNT(*)::int FROM courses course WHERE course.institute_id = i.id) AS courses_count,
        COALESCE((SELECT previous.score FROM academy_rankings previous WHERE previous.academy_id = i.id AND previous.year < ${year} ORDER BY previous.year DESC LIMIT 1), 0) AS previous_score
      FROM institutes i
      LEFT JOIN regions rg ON rg.id = i.region_id
      LEFT JOIN academy_rankings ar ON ar.academy_id = i.id AND ar.year = ${year}
      LEFT JOIN self_declarations sd ON sd.academy_id = i.id AND sd.year = ${year}
      WHERE i.is_active = TRUE
      ORDER BY i.name
    `));
  } catch (error) {
    console.error("ranking expert institute list", error);
    return NextResponse.json({ error: "خطا در دریافت فهرست آموزشگاه‌ها؛ لطفاً دوباره تلاش کنید." }, { status: 500 });
  }

  const passRates = new Map<number, number>();
  try {
    const gradeRows = rowsOf(await db.execute(sql`
      SELECT institute_id,
        COALESCE(ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'passed') / NULLIF(COUNT(*) FILTER (WHERE status IN ('passed','failed')), 0), 1), 0) AS pass_rate
      FROM grades GROUP BY institute_id
    `));
    gradeRows.forEach((row: any) => passRates.set(Number(row.institute_id), Number(row.pass_rate || 0)));
  } catch (error) {
    console.error("ranking expert pass rates", error);
  }

  const asObject = (value: any) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const asArray = (value: any) => Array.isArray(value) ? value : [];
  const items = baseRows.map((row: any) => {
    const physical = asObject(row.physical);
    const books = asArray(row.books);
    const seminars = asArray(row.seminars);
    const honors = asArray(row.honors);
    const documents = asArray(row.documents);
    const physicalFields = [physical.area, physical.classrooms, physical.workshops, physical.systems].filter((value) => String(value || "").trim()).length;
    const completion = Math.min(100,
      physicalFields * 10
      + (documents.length > 0 ? 20 : 0)
      + (books.length > 0 ? 15 : 0)
      + (seminars.length > 0 ? 15 : 0)
      + (honors.length > 0 ? 10 : 0)
    );
    const missingItems: string[] = [];
    if (physicalFields < 4) missingItems.push("اطلاعات امکانات فیزیکی");
    if (documents.length === 0) missingItems.push("تصاویر و مستندات");
    if (books.length === 0) missingItems.push("کتاب‌ها یا فعالیت علمی");
    if (seminars.length === 0) missingItems.push("سمینارها و رویدادها");
    if (honors.length === 0) missingItems.push("افتخارات و دستاوردها");
    const status = String(row.status || "not_started");
    const submittedAt = row.submitted_at ? new Date(row.submitted_at) : null;
    const priority = status === "submitted" && submittedAt && Date.now() - submittedAt.getTime() > 2 * 86400000
      ? "urgent"
      : status === "needs_correction"
        ? "high"
        : ["not_started", "draft"].includes(status)
          ? "incomplete"
          : documents.length === 0
            ? "documents"
            : "normal";
    return {
      ...row,
      physical_fields: physicalFields,
      books_count: books.length,
      seminars_count: seminars.length,
      honors_count: honors.length,
      documents_count: documents.length,
      completion_percent: completion,
      missing_items: missingItems,
      priority,
      pass_rate: passRates.get(Number(row.academy_id)) || 0,
    };
  });

  const finalItems = items.filter((item: any) => ["approved", "published"].includes(item.status));
  const average = (values: number[]) => values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10 : 0;
  const currentAverage = average(finalItems.map((item: any) => Number(item.score || 0)));
  const previousScores = finalItems.map((item: any) => Number(item.previous_score || 0)).filter((value: number) => value > 0);
  const previousAverage = average(previousScores);
  const growth = previousAverage > 0 ? Math.round(((currentAverage - previousAverage) / previousAverage) * 1000) / 10 : 0;
  const today = new Date().toDateString();
  const isToday = (value: any) => value && new Date(value).toDateString() === today;

  const cityMap = new Map<string, { city: string; cases: number; scores: number[] }>();
  items.forEach((item: any) => {
    const city = item.city || "بدون منطقه";
    const entry: { city: string; cases: number; scores: number[] } = cityMap.get(city) || { city, cases: 0, scores: [] };
    entry.cases += 1;
    if (["approved", "published"].includes(item.status)) entry.scores.push(Number(item.score || 0));
    cityMap.set(city, entry);
  });
  const cityStats = [...cityMap.values()].map((entry) => ({ city: entry.city, cases: entry.cases, average: average(entry.scores) })).sort((a, b) => b.average - a.average);

  const rankOrder = ["A+", "A", "B", "C", "D"];
  const distribution = rankOrder.map((rank) => ({ rank, count: finalItems.filter((item: any) => item.rank === rank).length }));

  const trendMap = new Map<string, number>();
  finalItems.forEach((item: any) => {
    const date = new Date(item.reviewed_at || item.updated_at);
    if (Number.isNaN(date.getTime())) return;
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    trendMap.set(month, (trendMap.get(month) || 0) + 1);
  });
  const trend = [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([month, count]) => ({ month, count }));

  const incompleteDocuments = items.filter((item: any) => Number(item.documents_count || 0) === 0).length;
  const incompleteDeclarations = items.filter((item: any) => Number(item.completion_percent || 0) < 100).length;
  const stats = {
    totalAcademies: items.length,
    activeCases: items.filter((item: any) => ["submitted", "under_review", "needs_correction", "approved"].includes(item.status)).length,
    waiting: items.filter((item: any) => item.status === "submitted").length,
    reviewed: finalItems.length,
    approved: finalItems.length,
    needsCorrection: items.filter((item: any) => item.status === "needs_correction").length,
    excellent: finalItems.filter((item: any) => item.rank === "A+").length,
    averageScore: currentAverage,
    growth,
    todayCases: items.filter((item: any) => isToday(item.submitted_at)).length,
    urgent: items.filter((item: any) => item.priority === "urgent").length,
    incompleteDocuments,
    incompleteDeclarations,
    notStarted: items.filter((item: any) => ["not_started", "draft"].includes(item.status)).length,
    todayApproved: finalItems.filter((item: any) => isToday(item.reviewed_at)).length,
    todayReturned: items.filter((item: any) => item.status === "needs_correction" && isToday(item.reviewed_at)).length,
    todayReviewed: finalItems.filter((item: any) => isToday(item.reviewed_at)).length,
  };

  return NextResponse.json({ items, stats, year, trend, cityStats, distribution });
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
