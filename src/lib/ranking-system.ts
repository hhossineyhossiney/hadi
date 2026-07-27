import { db } from "@/db";
import { sql } from "drizzle-orm";

export const RANKING_CRITERIA = [
  { code: "students", title: "تعداد هنرجویان", maxScore: 30, group: "education" },
  { code: "exam_success", title: "قبولی آزمون", maxScore: 30, group: "education" },
  { code: "experience", title: "سابقه فعالیت", maxScore: 15, group: "experience" },
  { code: "facilities", title: "امکانات و فضای آموزشی", maxScore: 15, group: "facilities" },
  { code: "science", title: "فعالیت علمی و آموزشی", maxScore: 10, group: "science" },
] as const;

export type RankingStatus = "draft" | "submitted" | "under_review" | "needs_correction" | "approved" | "published";

function rowsOf<T = any>(result: any): T[] {
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result?.rows)) return result.rows as T[];
  return [];
}

export function currentRankingYear() {
  const value = new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric" }).format(new Date());
  return Number(value.replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))) || new Date().getFullYear() - 621;
}

export function rankFromScore(score: number) {
  const normalized = Math.max(0, Math.min(100, Math.round(score * 100) / 100));
  if (normalized >= 90) return { code: "A+", label: "ممتاز", color: "emerald" };
  if (normalized >= 80) return { code: "A", label: "عالی", color: "cyan" };
  if (normalized >= 70) return { code: "B", label: "خوب", color: "blue" };
  if (normalized >= 60) return { code: "C", label: "قابل قبول", color: "amber" };
  return { code: "D", label: "نیازمند ارتقا", color: "rose" };
}

async function initializeRankingSystem() {
  await db.execute(sql.raw(`
    DO $$ BEGIN
      ALTER TYPE role ADD VALUE IF NOT EXISTS 'expert';
    EXCEPTION WHEN undefined_object THEN NULL;
    END $$;

    CREATE TABLE IF NOT EXISTS ranking_criteria (
      id SERIAL PRIMARY KEY,
      code VARCHAR(60) NOT NULL UNIQUE,
      title VARCHAR(255) NOT NULL,
      max_score NUMERIC(6,2) NOT NULL,
      weight NUMERIC(6,2) NOT NULL DEFAULT 1,
      group_code VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS academy_rankings (
      id SERIAL PRIMARY KEY,
      academy_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      score NUMERIC(6,2) NOT NULL DEFAULT 0,
      rank VARCHAR(10),
      rank_label VARCHAR(60),
      status VARCHAR(30) NOT NULL DEFAULT 'draft',
      expert_id INTEGER REFERENCES users(id),
      strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
      improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
      submitted_at TIMESTAMP,
      reviewed_at TIMESTAMP,
      published_at TIMESTAMP,
      valid_until TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(academy_id, year)
    );

    CREATE TABLE IF NOT EXISTS ranking_scores (
      id SERIAL PRIMARY KEY,
      ranking_id INTEGER NOT NULL REFERENCES academy_rankings(id) ON DELETE CASCADE,
      criteria_id INTEGER NOT NULL REFERENCES ranking_criteria(id),
      system_score NUMERIC(6,2) NOT NULL DEFAULT 0,
      expert_score NUMERIC(6,2) NOT NULL DEFAULT 0,
      expert_comment TEXT,
      deduction_reason TEXT,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(ranking_id, criteria_id)
    );

    CREATE TABLE IF NOT EXISTS self_declarations (
      id SERIAL PRIMARY KEY,
      academy_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      physical JSONB NOT NULL DEFAULT '{}'::jsonb,
      books JSONB NOT NULL DEFAULT '[]'::jsonb,
      seminars JSONB NOT NULL DEFAULT '[]'::jsonb,
      honors JSONB NOT NULL DEFAULT '[]'::jsonb,
      content_activities JSONB NOT NULL DEFAULT '[]'::jsonb,
      documents JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(30) NOT NULL DEFAULT 'draft',
      submitted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(academy_id, year)
    );

    CREATE TABLE IF NOT EXISTS ranking_documents (
      id SERIAL PRIMARY KEY,
      academy_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
      ranking_id INTEGER REFERENCES academy_rankings(id) ON DELETE CASCADE,
      type VARCHAR(60) NOT NULL,
      file_path TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ranking_assignments (
      id SERIAL PRIMARY KEY,
      academy_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
      expert_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      year INTEGER NOT NULL,
      assigned_by INTEGER REFERENCES users(id),
      status VARCHAR(30) NOT NULL DEFAULT 'assigned',
      assigned_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(academy_id, expert_id, year)
    );

    CREATE TABLE IF NOT EXISTS ranking_audit_logs (
      id SERIAL PRIMARY KEY,
      ranking_id INTEGER REFERENCES academy_rankings(id) ON DELETE SET NULL,
      academy_id INTEGER REFERENCES institutes(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action VARCHAR(100) NOT NULL,
      details JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rankings_academy_year ON academy_rankings(academy_id, year DESC);
    CREATE INDEX IF NOT EXISTS idx_rankings_status ON academy_rankings(status);
    CREATE INDEX IF NOT EXISTS idx_assignments_expert ON ranking_assignments(expert_id, year);
  `));

  for (const criterion of RANKING_CRITERIA) {
    await db.execute(sql`
      INSERT INTO ranking_criteria (code, title, max_score, weight, group_code)
      VALUES (${criterion.code}, ${criterion.title}, ${criterion.maxScore}, 1, ${criterion.group})
      ON CONFLICT (code) DO UPDATE SET title = EXCLUDED.title, max_score = EXCLUDED.max_score,
        group_code = EXCLUDED.group_code, is_active = TRUE
    `);
  }
}

const rankingGlobal = globalThis as typeof globalThis & { __fanixoRankingReady?: Promise<void> };
export function ensureRankingSystem() {
  if (!rankingGlobal.__fanixoRankingReady) {
    rankingGlobal.__fanixoRankingReady = initializeRankingSystem().catch((error) => {
      rankingGlobal.__fanixoRankingReady = undefined;
      throw error;
    });
  }
  return rankingGlobal.__fanixoRankingReady;
}

export async function getManagerInstitute(userId: number) {
  const result = await db.execute(sql`
    SELECT i.* FROM institutes i WHERE i.user_id = ${userId} LIMIT 1
  `);
  return rowsOf(result)[0] || null;
}

function englishDigits(value: unknown) {
  return String(value || "").replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\D/g, "");
}

export async function getAutomaticMetrics(academyId: number) {
  await ensureRankingSystem();
  const instituteResult = await db.execute(sql`
    SELECT i.id, i.name, i.slug, i.license_number, i.established_year, i.created_at,
      i.description, i.address, i.phone, i.mobile, i.manager_name, i.manager_title,
      r.name AS city
    FROM institutes i LEFT JOIN regions r ON r.id = i.region_id
    WHERE i.id = ${academyId} LIMIT 1
  `);
  const institute = rowsOf(instituteResult)[0];
  if (!institute) return null;

  const baseResult = await db.execute(sql`
    SELECT
      COUNT(DISTINCT reg.id) FILTER (WHERE COALESCE(reg.notes, '') <> '__FAV__')::int AS total_students,
      COUNT(DISTINCT reg.id) FILTER (WHERE reg.certificate_url IS NOT NULL AND reg.certificate_url <> '')::int AS certified_students,
      COUNT(DISTINCT c.id)::int AS courses_held,
      COUNT(DISTINCT c.category_id)::int AS active_fields
    FROM institutes i
    LEFT JOIN registrations reg ON reg.institute_id = i.id
    LEFT JOIN courses c ON c.institute_id = i.id
    WHERE i.id = ${academyId}
  `);
  const base = rowsOf(baseResult)[0] || {};

  let examsTaken = 0;
  let passed = 0;
  try {
    const examResult = await db.execute(sql`
      SELECT
        COUNT(DISTINCT registration_id) FILTER (WHERE status IN ('passed','failed'))::int AS exams_taken,
        COUNT(DISTINCT registration_id) FILTER (WHERE status = 'passed')::int AS passed
      FROM grades WHERE institute_id = ${academyId}
    `);
    const exam = rowsOf(examResult)[0] || {};
    examsTaken = Number(exam.exams_taken || 0);
    passed = Number(exam.passed || 0);
  } catch {}

  const yearDigits = englishDigits(institute.established_year);
  const establishedYear = Number(yearDigits.slice(0, 4)) || null;
  const currentYear = currentRankingYear();
  const activityYears = establishedYear ? Math.max(0, currentYear - establishedYear) : Math.max(0, new Date().getFullYear() - new Date(institute.created_at).getFullYear());
  const totalStudents = Number(base.total_students || 0);
  const passRate = examsTaken > 0 ? Math.round((passed / examsTaken) * 10000) / 100 : 0;

  return {
    academyId,
    name: institute.name,
    slug: institute.slug,
    academyCode: institute.license_number || `FNX-${String(academyId).padStart(4, "0")}`,
    city: institute.city || "زبرخان",
    description: institute.description || "توضیحی برای آموزشگاه ثبت نشده است.",
    address: institute.address || "ثبت نشده",
    phone: institute.phone || "ثبت نشده",
    mobile: institute.mobile || "ثبت نشده",
    managerName: institute.manager_name || "ثبت نشده",
    managerTitle: institute.manager_title || "مدیر آموزشگاه",
    establishedYear: establishedYear || "ثبت نشده",
    activityYears,
    totalStudents,
    certifiedStudents: Number(base.certified_students || 0),
    examsTaken,
    passed,
    passRate,
    coursesHeld: Number(base.courses_held || 0),
    activeFields: Number(base.active_fields || 0),
  };
}

export function suggestedScores(metrics: any, declaration?: any) {
  const physical = declaration?.physical || {};
  const students = Math.min(30, Math.round(Math.sqrt(Math.max(0, Number(metrics?.totalStudents || 0))) * 3.5 * 100) / 100);
  const examSuccess = Math.min(30, Math.round((Number(metrics?.passRate || 0) / 100) * 30 * 100) / 100);
  const experience = Math.min(15, Math.round(Number(metrics?.activityYears || 0) * 1.5 * 100) / 100);
  const facilitySignals = [Number(physical.area) >= 100, Number(physical.classrooms) > 0, Number(physical.workshops) > 0,
    Number(physical.systems) > 0, Boolean(physical.specialEquipment), Boolean(physical.waitingArea)].filter(Boolean).length;
  const facilities = Math.round((facilitySignals / 6) * 15 * 100) / 100;
  const scienceCount = (declaration?.books?.length || 0) + (declaration?.seminars?.length || 0) +
    (declaration?.honors?.length || 0) + (declaration?.contentActivities?.length || 0);
  const science = Math.min(10, scienceCount * 2);
  return { students, exam_success: examSuccess, experience, facilities, science };
}

async function ensureRankingRows(academyId: number, year: number) {
  const [ranking] = rowsOf(await db.execute(sql`
    INSERT INTO academy_rankings (academy_id, year) VALUES (${academyId}, ${year})
    ON CONFLICT (academy_id, year) DO UPDATE SET updated_at = academy_rankings.updated_at
    RETURNING *
  `));
  const [declaration] = rowsOf(await db.execute(sql`
    INSERT INTO self_declarations (academy_id, year) VALUES (${academyId}, ${year})
    ON CONFLICT (academy_id, year) DO UPDATE SET updated_at = self_declarations.updated_at
    RETURNING *
  `));
  return { ranking, declaration };
}

function parsedJson(value: any, fallback: any) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value;
}

export async function getRankingBundle(academyId: number, year = currentRankingYear()) {
  await ensureRankingSystem();
  const { ranking, declaration } = await ensureRankingRows(academyId, year);
  const metrics = await getAutomaticMetrics(academyId);
  const normalizedDeclaration = {
    id: declaration.id,
    status: declaration.status,
    submittedAt: declaration.submitted_at,
    physical: parsedJson(declaration.physical, {}),
    books: parsedJson(declaration.books, []),
    seminars: parsedJson(declaration.seminars, []),
    honors: parsedJson(declaration.honors, []),
    contentActivities: parsedJson(declaration.content_activities, []),
    documents: parsedJson(declaration.documents, []),
  };
  const scoreRows = rowsOf(await db.execute(sql`
    SELECT c.code, c.title, c.max_score, c.group_code, s.system_score, s.expert_score,
      s.expert_comment, s.deduction_reason
    FROM ranking_criteria c
    LEFT JOIN ranking_scores s ON s.criteria_id = c.id AND s.ranking_id = ${ranking.id}
    WHERE c.is_active = TRUE ORDER BY c.id
  `));
  const suggestions = suggestedScores(metrics, normalizedDeclaration);
  const scores = scoreRows.map((row: any) => ({
    code: row.code, title: row.title, maxScore: Number(row.max_score), group: row.group_code,
    systemScore: row.system_score == null ? Number((suggestions as any)[row.code] || 0) : Number(row.system_score),
    expertScore: row.expert_score == null ? null : Number(row.expert_score),
    comment: row.expert_comment || "", deductionReason: row.deduction_reason || "",
  }));
  return {
    year, metrics, declaration: normalizedDeclaration,
    ranking: {
      id: ranking.id, status: ranking.status, score: Number(ranking.score || 0), rank: ranking.rank,
      rankLabel: ranking.rank_label, expertId: ranking.expert_id,
      strengths: parsedJson(ranking.strengths, []), improvements: parsedJson(ranking.improvements, []),
      submittedAt: ranking.submitted_at, reviewedAt: ranking.reviewed_at,
      publishedAt: ranking.published_at, validUntil: ranking.valid_until,
    },
    scores,
  };
}

export async function addRankingAudit(input: { rankingId?: number | null; academyId: number; userId?: number | null; action: string; details?: any }) {
  await db.execute(sql`
    INSERT INTO ranking_audit_logs (ranking_id, academy_id, user_id, action, details)
    VALUES (${input.rankingId || null}, ${input.academyId}, ${input.userId || null}, ${input.action}, ${JSON.stringify(input.details || {})}::jsonb)
  `);
}

export async function getPublishedRanking(identifier: string) {
  await ensureRankingSystem();
  const numericId = /^\d+$/.test(identifier) ? Number(identifier) : null;
  const result = await db.execute(sql`
    SELECT ar.*, i.name AS academy_name, i.slug, i.logo, i.license_number, i.established_year,
      r.name AS city
    FROM academy_rankings ar
    JOIN institutes i ON i.id = ar.academy_id
    LEFT JOIN regions r ON r.id = i.region_id
    WHERE ((${numericId}::int IS NOT NULL AND i.id = ${numericId}) OR (${numericId}::int IS NULL AND i.slug = ${identifier}))
      AND ar.status = 'published'
    ORDER BY ar.year DESC LIMIT 1
  `);
  const ranking = rowsOf(result)[0];
  if (!ranking) return null;
  const bundle = await getRankingBundle(Number(ranking.academy_id), Number(ranking.year));
  return { ...bundle, public: ranking };
}

export { rowsOf };
