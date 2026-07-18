import { db } from "@/db";
import { sql } from "drizzle-orm";

let schemaPromise: Promise<void> | null = null;
let seedPromise: Promise<void> | null = null;

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

/**
 * Keeps the live database backward compatible. The project already had a
 * minimal reviews table; these columns turn it into a moderated review system
 * for institutes, in-person courses, and online courses.
 */
export async function ensureReviewSystem() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await db.execute(sql.raw(`
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS course_id INTEGER;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS sellable_course_id INTEGER;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS author_name VARCHAR(255);
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'published';
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_sample BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS manager_reply TEXT;
        ALTER TABLE reviews ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
        CREATE INDEX IF NOT EXISTS reviews_institute_status_idx ON reviews (institute_id, status);
        CREATE INDEX IF NOT EXISTS reviews_course_status_idx ON reviews (course_id, status);
        CREATE INDEX IF NOT EXISTS reviews_sellable_status_idx ON reviews (sellable_course_id, status);
        CREATE INDEX IF NOT EXISTS reviews_user_target_idx
          ON reviews (
            user_id,
            institute_id,
            COALESCE(course_id, 0),
            COALESCE(sellable_course_id, 0)
          )
          WHERE user_id IS NOT NULL;
        CREATE UNIQUE INDEX IF NOT EXISTS reviews_sample_author_unique
          ON reviews (institute_id, author_name)
          WHERE is_sample = true;
      `));
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  return schemaPromise;
}

const SAMPLE_NAMES = [
  "مریم حسینی",
  "علی رضایی",
  "زهرا محمدی",
  "امیرحسین کریمی",
  "فاطمه احمدی",
  "محمد صادقی",
  "نرگس موسوی",
  "رضا حیدری",
  "سمیه اکبری",
  "حسین جعفری",
  "الهام عباسی",
  "سجاد یوسفی",
];

/** Inserts three clearly-labelled training examples for every institute. */
export async function seedSampleReviews() {
  await ensureReviewSystem();
  if (!seedPromise) {
    seedPromise = (async () => {
      const markerResult = await db.execute(sql.raw(`SELECT key FROM site_settings WHERE key = 'review_sample_seed_v2' LIMIT 1`));
      if (rowsOf(markerResult).length > 0) return;

      const result = await db.execute(sql.raw(`
        SELECT
          i.id,
          i.name,
          COALESCE(r.name, 'زبرخان') AS region_name,
          (SELECT c.id FROM courses c WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS course_id,
          (SELECT c.title FROM courses c WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS course_title,
          (SELECT sc.id FROM sellable_courses sc WHERE sc.institute_id = i.id ORDER BY sc.created_at LIMIT 1) AS sellable_course_id,
          (SELECT sc.title FROM sellable_courses sc WHERE sc.institute_id = i.id ORDER BY sc.created_at LIMIT 1) AS sellable_title
        FROM institutes i
        LEFT JOIN regions r ON r.id = i.region_id
        ORDER BY i.id
      `));
      const institutes = rowsOf<{
        id: number;
        name: string;
        region_name: string;
        course_id: number | null;
        course_title: string | null;
        sellable_course_id: number | null;
        sellable_title: string | null;
      }>(result);

      for (const institute of institutes) {
        const offset = (Number(institute.id) * 3) % SAMPLE_NAMES.length;
        const courseTitle = institute.course_title || institute.sellable_title || "دوره‌های مهارتی";
        const instituteDisplayName = String(institute.name || "").replace(/^آموزشگاه\s+/, "");
        const samples = [
          {
            author: SAMPLE_NAMES[offset % SAMPLE_NAMES.length],
            rating: 5,
            courseId: institute.course_id,
            sellableCourseId: null,
            comment: `نحوه توضیح مطالب در دوره «${courseTitle}» منظم و قابل فهم بود و تمرین‌ها کمک کرد مطالب را بهتر یاد بگیرم.`,
          },
          {
            author: SAMPLE_NAMES[(offset + 1) % SAMPLE_NAMES.length],
            rating: 4,
            courseId: null,
            sellableCourseId: institute.sellable_course_id,
            comment: `پاسخ‌گویی و پیگیری آموزشگاه ${instituteDisplayName} خوب بود. اطلاعات برنامه کلاس و مراحل ثبت‌نام را شفاف توضیح دادند.`,
          },
          {
            author: SAMPLE_NAMES[(offset + 2) % SAMPLE_NAMES.length],
            rating: 5,
            courseId: null,
            sellableCourseId: null,
            comment: `محیط آموزشی مناسب و برخورد مدیریت محترمانه بود. برای یادگیری مهارت و ورود به بازار کار در منطقه ${institute.region_name} انتخاب خوبی است.`,
          },
        ];

        for (const sample of samples) {
          await db.execute(sql`
            INSERT INTO reviews (
              user_id, institute_id, course_id, sellable_course_id,
              author_name, rating, comment, status, is_sample, is_verified,
              created_at, updated_at
            )
            VALUES (
              NULL, ${Number(institute.id)}, ${sample.courseId}, ${sample.sellableCourseId},
              ${sample.author}, ${sample.rating}, ${sample.comment}, 'published', true, false,
              NOW() - ((${sample.rating + Number(institute.id)} % 18) || ' days')::interval, NOW()
            )
            ON CONFLICT DO NOTHING
          `);
        }
        await refreshReviewAggregates(Number(institute.id));
      }
      await db.execute(sql.raw(`
        UPDATE reviews
        SET comment = REPLACE(comment, 'آموزشگاه آموزشگاه ', 'آموزشگاه '), updated_at = NOW()
        WHERE is_sample = true AND comment LIKE '%آموزشگاه آموزشگاه %';

        UPDATE sellable_courses sc
        SET
          rating = COALESCE((
            SELECT ROUND(AVG(r.rating)::numeric, 2)
            FROM reviews r
            WHERE r.sellable_course_id = sc.id AND r.status = 'published'
          ), 0),
          rating_count = (
            SELECT COUNT(*)::int
            FROM reviews r
            WHERE r.sellable_course_id = sc.id AND r.status = 'published'
          ),
          students_count = (
            SELECT COUNT(*)::int
            FROM sellable_purchases sp
            WHERE sp.course_id = sc.id AND sp.status = 'paid'
          ),
          updated_at = NOW();

        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('review_sample_seed_v2', '{"done":true}'::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `));
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  return seedPromise;
}

export async function refreshReviewAggregates(
  instituteId: number,
  courseId?: number | null,
  sellableCourseId?: number | null,
) {
  await ensureReviewSystem();
  await db.execute(sql`
    UPDATE institutes i
    SET
      rating = COALESCE((
        SELECT ROUND(AVG(r.rating)::numeric, 1)
        FROM reviews r
        WHERE r.institute_id = ${instituteId} AND r.status = 'published'
      ), 0),
      review_count = (
        SELECT COUNT(*)::int
        FROM reviews r
        WHERE r.institute_id = ${instituteId} AND r.status = 'published'
      )
    WHERE i.id = ${instituteId}
  `);

  if (sellableCourseId) {
    await db.execute(sql`
      UPDATE sellable_courses sc
      SET
        rating = COALESCE((
          SELECT ROUND(AVG(r.rating)::numeric, 2)
          FROM reviews r
          WHERE r.sellable_course_id = ${sellableCourseId} AND r.status = 'published'
        ), 0),
        rating_count = (
          SELECT COUNT(*)::int
          FROM reviews r
          WHERE r.sellable_course_id = ${sellableCourseId} AND r.status = 'published'
        ),
        updated_at = NOW()
      WHERE sc.id = ${sellableCourseId}
    `);
  }

  // In-person course ratings are intentionally aggregated at query time because
  // the legacy courses table has no rating columns.
  void courseId;
}

export type PublicReview = {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string;
  managerReply: string | null;
  isSample: boolean;
  isVerified: boolean;
  createdAt: string | Date | null;
};

export async function getPublicReviews(filters: {
  instituteId: number;
  courseId?: number | null;
  sellableCourseId?: number | null;
}) {
  await ensureReviewSystem();
  const targetCondition = filters.sellableCourseId
    ? sql`r.sellable_course_id = ${filters.sellableCourseId}`
    : filters.courseId
      ? sql`r.course_id = ${filters.courseId}`
      : sql`r.institute_id = ${filters.instituteId}`;

  const result = await db.execute(sql`
    SELECT
      r.id,
      r.rating,
      r.comment,
      COALESCE(NULLIF(r.author_name, ''), u.name, 'هنرجو') AS author_name,
      r.manager_reply,
      r.is_sample,
      r.is_verified,
      r.created_at
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.institute_id = ${filters.instituteId}
      AND r.status = 'published'
      AND ${targetCondition}
    ORDER BY r.is_sample ASC, r.created_at DESC
  `);

  return rowsOf<{
    id: number;
    rating: number;
    comment: string | null;
    author_name: string;
    manager_reply: string | null;
    is_sample: boolean;
    is_verified: boolean;
    created_at: string | Date | null;
  }>(result).map((row) => ({
    id: Number(row.id),
    rating: Number(row.rating),
    comment: row.comment,
    authorName: row.author_name || "هنرجو",
    managerReply: row.manager_reply,
    isSample: !!row.is_sample,
    isVerified: !!row.is_verified,
    createdAt: row.created_at,
  }));
}

export async function getReviewSummary(filters: {
  instituteId: number;
  courseId?: number | null;
  sellableCourseId?: number | null;
}) {
  await ensureReviewSystem();
  const targetCondition = filters.sellableCourseId
    ? sql`r.sellable_course_id = ${filters.sellableCourseId}`
    : filters.courseId
      ? sql`r.course_id = ${filters.courseId}`
      : sql`r.institute_id = ${filters.instituteId}`;
  const result = await db.execute(sql`
    SELECT COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0)::text AS rating,
           COUNT(*)::int AS review_count
    FROM reviews r
    WHERE r.institute_id = ${filters.instituteId}
      AND r.status = 'published'
      AND ${targetCondition}
  `);
  const row = rowsOf<{ rating: string; review_count: number }>(result)[0];
  return { rating: row?.rating || "0", reviewCount: Number(row?.review_count || 0) };
}
