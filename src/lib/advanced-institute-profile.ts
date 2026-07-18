import { db } from "@/db";
import { sql } from "drizzle-orm";

export type MediaItem = {
  id: string;
  title: string;
  description?: string;
  image?: string;
  video?: string;
  kind?: string;
  isSample?: boolean;
};

export type SuccessStory = {
  id: string;
  name: string;
  title: string;
  story: string;
  image?: string;
  video?: string;
  result?: string;
  isSample?: boolean;
};

export type InstituteNews = {
  id: string;
  title: string;
  summary: string;
  date?: string;
  kind?: string;
  image?: string;
  isSample?: boolean;
};

export type AdvancedInstituteProfile = {
  version: number;
  slogan: string;
  coverImage: string;
  introVideoUrl: string;
  virtualTourUrl: string;
  history: string;
  mission: string;
  vision: string;
  historicalStudents: number;
  graduateCount: number;
  employmentCount: number;
  advantages: string[];
  facilities: { id: string; name: string; available: boolean; note?: string; isSample?: boolean }[];
  locationDetails: { parking: string; bus: string; metro: string; distance: string };
  social: { whatsapp: string; telegram: string; instagram: string };
  portfolio: MediaItem[];
  successStories: SuccessStory[];
  news: InstituteNews[];
  faqs: { id: string; question: string; answer: string; isSample?: boolean }[];
  certificates: { id: string; title: string; issuer?: string; year?: string; image?: string; isSample?: boolean }[];
  partners: { id: string; name: string; logo?: string; url?: string; isSample?: boolean }[];
  quality: { education: number; satisfaction: number; jobMarket: number; passRate: number; employment: number; isSample?: boolean };
  advisors: { id: string; name: string; specialty?: string; image?: string; days?: string; hours?: string; isSample?: boolean }[];
};

let ensurePromise: Promise<void> | null = null;

function rowsOf<T = Record<string, unknown>>(result: unknown): T[] {
  const value = result as { rows?: T[] } | T[];
  return Array.isArray(value) ? value : value.rows || [];
}

function sampleImage(category: string, index = 0) {
  const text = category.toLocaleLowerCase("fa-IR");
  if (/زیبایی|آرایش|مراقبت|پوست|مو/.test(text)) return index ? "/images/cat-beauty.jpg" : "/images/cat-beauty.jpg";
  if (/خیاط|دوخت|لباس|طراحی/.test(text)) return "/images/cat-tailoring.jpg";
  if (/آشپز|شیرینی|کیک|نان/.test(text)) return "/images/cat-culinary.jpg";
  if (/کامپیوتر|icdl|فناوری|هوش|برنامه/.test(text)) return "/images/cat-computer.jpg";
  return "/images/cat-education.jpg";
}

function makeSampleProfile(row: { id: number; name: string; category_name?: string | null; course_title?: string | null; phone?: string | null; mobile?: string | null }): AdvancedInstituteProfile {
  const category = row.category_name || row.course_title || "مهارت‌آموزی";
  const image = sampleImage(category);
  const shortName = String(row.name).replace(/^آموزشگاه\s+/, "");
  return {
    version: 2,
    slogan: `یادگیری حرفه‌ای ${category} برای ورود مطمئن‌تر به بازار کار`,
    coverImage: image,
    introVideoUrl: "",
    virtualTourUrl: "",
    history: `این متن نمونه برای معرفی تاریخچه آموزشگاه ${shortName} است. مدیر آموزشگاه می‌تواند سابقه فعالیت، سال‌های تجربه و مسیر رشد مجموعه را از پنل ویرایش کند.`,
    mission: `نمونه: آموزش مهارت‌های کاربردی با تمرکز بر تمرین عملی، کیفیت یادگیری و آمادگی بازار کار.`,
    vision: `نمونه: تبدیل‌شدن به یکی از مراکز قابل اعتماد مهارت‌آموزی در شهرستان زبرخان.`,
    historicalStudents: 0,
    graduateCount: 0,
    employmentCount: 0,
    advantages: ["مدرک معتبر", "آموزش پروژه‌محور", "پرداخت اقساط", "پشتیبانی آموزشی", "مشاوره مسیر یادگیری"],
    facilities: [
      { id: `facility-${row.id}-1`, name: "اینترنت پرسرعت", available: true, isSample: true },
      { id: `facility-${row.id}-2`, name: "فضای آموزشی مجهز", available: true, isSample: true },
      { id: `facility-${row.id}-3`, name: "دسترسی‌پذیری", available: false, note: "وضعیت را مدیر مشخص کند", isSample: true },
      { id: `facility-${row.id}-4`, name: "پارکینگ", available: false, note: "وضعیت را مدیر مشخص کند", isSample: true },
    ],
    locationDetails: { parking: "اطلاعات پارکینگ توسط مدیر تکمیل شود", bus: "نزدیک‌ترین ایستگاه توسط مدیر ثبت شود", metro: "در این منطقه مترو فعال نیست", distance: "فاصله از مرکز شهر توسط مدیر تکمیل شود" },
    social: { whatsapp: row.mobile || row.phone || "", telegram: "", instagram: "" },
    portfolio: [
      { id: `portfolio-${row.id}-1`, title: `نمونه فعالیت هنرجویان ${category}`, description: "نمونه آموزشی؛ تصویر و توضیح واقعی را جایگزین کنید.", image, kind: "project", isSample: true },
      { id: `portfolio-${row.id}-2`, title: "پشت صحنه کلاس", description: "نمونه آموزشی برای معرفی فضای کلاس.", image, kind: "class", isSample: true },
    ],
    successStories: [
      { id: `success-${row.id}-1`, name: "هنرجوی نمونه", title: `موفقیت پس از دوره ${row.course_title || category}`, story: "این یک داستان موفقیت نمونه است. مدیر می‌تواند تجربه واقعی استخدام، درآمد یا راه‌اندازی کسب‌وکار هنرجو را جایگزین کند.", image, result: "نمونه قابل ویرایش", isSample: true },
    ],
    news: [
      { id: `news-${row.id}-1`, title: `شروع ثبت‌نام دوره ${row.course_title || category}`, summary: "اطلاعیه نمونه؛ تاریخ شروع، ظرفیت و شرایط ثبت‌نام را ویرایش کنید.", kind: "registration", image, isSample: true },
      { id: `news-${row.id}-2`, title: "کارگاه آشنایی با بازار کار", summary: "رویداد نمونه برای نمایش نحوه انتشار اخبار و سمینارهای آموزشگاه.", kind: "event", image, isSample: true },
    ],
    faqs: [
      { id: `faq-${row.id}-1`, question: "مدرک پایان دوره چگونه صادر می‌شود؟", answer: "این پاسخ نمونه است؛ مدیر آموزشگاه جزئیات مدرک و شرایط دریافت آن را تکمیل کند.", isSample: true },
      { id: `faq-${row.id}-2`, question: "آیا امکان پرداخت اقساطی وجود دارد؟", answer: "این پاسخ نمونه است؛ شرایط اقساط هر آموزشگاه می‌تواند متفاوت باشد.", isSample: true },
    ],
    certificates: [
      { id: `certificate-${row.id}-1`, title: "مجوز فعالیت آموزشگاه", issuer: "سازمان آموزش فنی و حرفه‌ای", year: "نمونه", isSample: true },
    ],
    partners: [
      { id: `partner-${row.id}-1`, name: "همکار نمونه بازار کار", isSample: true },
      { id: `partner-${row.id}-2`, name: "مجموعه همکار محلی", isSample: true },
    ],
    quality: { education: 90, satisfaction: 88, jobMarket: 82, passRate: 91, employment: 76, isSample: true },
    advisors: [
      { id: `advisor-${row.id}-1`, name: "مشاور آموزشگاه", specialty: `مشاوره انتخاب دوره ${category}`, days: "شنبه تا پنجشنبه", hours: "۹ تا ۱۷", isSample: true },
    ],
  };
}

export function normalizeAdvancedProfile(value: unknown): AdvancedInstituteProfile {
  const base = makeSampleProfile({ id: 0, name: "آموزشگاه", category_name: "مهارت‌آموزی" });
  if (!value || typeof value !== "object" || Array.isArray(value)) return base;
  const data = value as Partial<AdvancedInstituteProfile>;
  return {
    ...base,
    ...data,
    advantages: Array.isArray(data.advantages) ? data.advantages : base.advantages,
    facilities: Array.isArray(data.facilities) ? data.facilities : base.facilities,
    locationDetails: { ...base.locationDetails, ...(data.locationDetails || {}) },
    social: { ...base.social, ...(data.social || {}) },
    portfolio: Array.isArray(data.portfolio) ? data.portfolio : base.portfolio,
    successStories: Array.isArray(data.successStories) ? data.successStories : base.successStories,
    news: Array.isArray(data.news) ? data.news : base.news,
    faqs: Array.isArray(data.faqs) ? data.faqs : base.faqs,
    certificates: Array.isArray(data.certificates) ? data.certificates : base.certificates,
    partners: Array.isArray(data.partners) ? data.partners : base.partners,
    quality: { ...base.quality, ...(data.quality || {}) },
    advisors: Array.isArray(data.advisors) ? data.advisors : base.advisors,
  };
}

export async function ensureAdvancedInstituteProfiles() {
  if (!ensurePromise) {
    ensurePromise = (async () => {
      await db.execute(sql.raw(`
        ALTER TABLE institutes ADD COLUMN IF NOT EXISTS advanced_profile JSONB NOT NULL DEFAULT '{}'::jsonb;
        CREATE TABLE IF NOT EXISTS institute_leads (
          id SERIAL PRIMARY KEY,
          institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
          course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
          type VARCHAR(30) NOT NULL DEFAULT 'registration',
          full_name VARCHAR(255) NOT NULL,
          phone VARCHAR(30) NOT NULL,
          preferred_date VARCHAR(30),
          preferred_time VARCHAR(30),
          advisor VARCHAR(255),
          notes TEXT,
          status VARCHAR(30) NOT NULL DEFAULT 'new',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS institute_leads_institute_idx ON institute_leads(institute_id, status, created_at DESC);
      `));

      const missingResult = await db.execute(sql.raw(`
        SELECT i.id, i.name, i.phone, i.mobile,
               (SELECT c.title FROM courses c WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS course_title,
               (SELECT cat.name FROM courses c JOIN categories cat ON cat.id = c.category_id WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS category_name
        FROM institutes i
        WHERE i.advanced_profile IS NULL OR i.advanced_profile = '{}'::jsonb
      `));
      const missing = rowsOf<{ id: number; name: string; phone: string | null; mobile: string | null; course_title: string | null; category_name: string | null }>(missingResult);
      for (const institute of missing) {
        const profile = makeSampleProfile(institute);
        await db.execute(sql`UPDATE institutes SET advanced_profile = ${JSON.stringify(profile)}::jsonb WHERE id = ${institute.id}`);
      }

      const upgradeResult = await db.execute(sql.raw(`
        SELECT i.id, i.name, i.phone, i.mobile, i.advanced_profile,
               (SELECT c.title FROM courses c WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS course_title,
               (SELECT cat.name FROM courses c JOIN categories cat ON cat.id = c.category_id WHERE c.institute_id = i.id ORDER BY c.created_at LIMIT 1) AS category_name
        FROM institutes i
        WHERE COALESCE((i.advanced_profile->>'version')::int, 0) < 2
      `));
      const upgrades = rowsOf<any>(upgradeResult);
      for (const institute of upgrades) {
        const current = normalizeAdvancedProfile(institute.advanced_profile);
        const sample = makeSampleProfile(institute);
        const upgraded = { ...current, version: 2, coverImage: current.coverImage || sample.coverImage };
        await db.execute(sql`UPDATE institutes SET advanced_profile = ${JSON.stringify(upgraded)}::jsonb WHERE id = ${Number(institute.id)}`);
      }
    })().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }
  return ensurePromise;
}

export async function getAdvancedInstituteProfile(instituteId: number) {
  await ensureAdvancedInstituteProfiles();
  const result = await db.execute(sql`SELECT advanced_profile FROM institutes WHERE id = ${instituteId} LIMIT 1`);
  const value = rowsOf<{ advanced_profile: unknown }>(result)[0]?.advanced_profile;
  return normalizeAdvancedProfile(value);
}
