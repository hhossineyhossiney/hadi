import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ADMIN_PHONES = ["09159513179", "09150000000"];

// Idempotent SQL — safe to run multiple times
const MIGRATIONS: { name: string; sql: string }[] = [
  // 1) Extend institutes table
  {
    name: "users_extended_fields",
    sql: `
      ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS education VARCHAR(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,0) DEFAULT 0;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
    `,
  },
  {
    name: "institutes_new_fields",
    sql: `
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS is_year_award BOOLEAN DEFAULT false;
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS manager_title VARCHAR(100);
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS license_number VARCHAR(100);
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE institutes ADD COLUMN IF NOT EXISTS established_year VARCHAR(20);
    `,
  },
  // 2) Extend courses table
  {
    name: "courses_new_fields",
    sql: `
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS syllabus JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS original_price DECIMAL(12,0);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_title VARCHAR(150);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(30);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_sessions INTEGER DEFAULT 0;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS registration_closed BOOLEAN DEFAULT FALSE;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS registration_ended BOOLEAN DEFAULT FALSE;
    `,
  },
  // 3) Extend registrations
  {
    name: "registrations_new_fields",
    sql: `
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS sessions_attended INTEGER DEFAULT 0;
      ALTER TABLE registrations ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
    `,
  },
  // 4) FAQs
  {
    name: "faqs_table",
    sql: `
      CREATE TABLE IF NOT EXISTS faqs (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `,
  },
  // 5) Chat threads & messages
  {
    name: "chat_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS chat_threads (
        id SERIAL PRIMARY KEY,
        participant_a_id INTEGER NOT NULL,
        participant_a_role VARCHAR(30) NOT NULL,
        participant_b_id INTEGER NOT NULL,
        participant_b_role VARCHAR(30) NOT NULL,
        context_type VARCHAR(30),
        context_id INTEGER,
        last_message_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_chat_threads_participants
        ON chat_threads(participant_a_id, participant_b_id);

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        sender_id INTEGER NOT NULL,
        sender_role VARCHAR(30) NOT NULL,
        body TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_chat_messages_thread ON chat_messages(thread_id);
    `,
  },
  // 6) Notifications
  {
    name: "notifications_table",
    sql: `
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_role VARCHAR(30) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT,
        type VARCHAR(50) DEFAULT 'info',
        link TEXT,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
    `,
  },
  // 7) Portfolios
  {
    name: "portfolio_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS student_portfolio (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT,
        link TEXT,
        tags JSONB DEFAULT '[]'::jsonb,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS institute_portfolio (
        id SERIAL PRIMARY KEY,
        institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `,
  },
  // 8) Wallet
  {
    name: "wallet_table",
    sql: `
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        amount DECIMAL(12,0) NOT NULL,
        type VARCHAR(30) NOT NULL,
        description TEXT,
        registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
        balance_after DECIMAL(12,0),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_transactions(user_id);
    `,
  },
  // 9) Course sessions
  {
    name: "course_sessions_table",
    sql: `
      CREATE TABLE IF NOT EXISTS course_sessions (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        session_number INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        session_date VARCHAR(30),
        session_time VARCHAR(30),
        duration VARCHAR(30),
        is_online BOOLEAN DEFAULT false,
        meeting_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_course_sessions_course ON course_sessions(course_id);
    `,
  },
  // 9.5) Payment fees (installments + extra fees)
  {
    name: "payment_fees_table",
    sql: `
      CREATE TABLE IF NOT EXISTS payment_fees (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'installment',
        installment_number INTEGER DEFAULT 0,
        total_installments INTEGER DEFAULT 0,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 0) NOT NULL,
        due_date VARCHAR(30),
        status VARCHAR(20) DEFAULT 'pending',
        paid_at TIMESTAMP,
        paid_amount DECIMAL(12, 0),
        payment_method VARCHAR(30),
        payment_ref_id VARCHAR(100),
        transaction_id INTEGER,
        is_optional BOOLEAN DEFAULT false,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_payment_fees_registration ON payment_fees(registration_id);
      CREATE INDEX IF NOT EXISTS idx_payment_fees_user ON payment_fees(user_id);
      CREATE INDEX IF NOT EXISTS idx_payment_fees_status ON payment_fees(status);
    `,
  },
  // 10a) Extend chat_threads with archive/pin/block
  {
    name: "chat_threads_flags",
    sql: `
      ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
      ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
      ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_blocked_by_a BOOLEAN DEFAULT false;
      ALTER TABLE chat_threads ADD COLUMN IF NOT EXISTS is_blocked_by_b BOOLEAN DEFAULT false;
    `,
  },
  // 10) Seed default FAQs (only if table empty)
  {
    name: "seed_faqs",
    sql: `
      INSERT INTO faqs (question, answer, sort_order)
      SELECT * FROM (VALUES
        ('آیا مدارک صادره از آموزشگاه‌های شبکه زبرخان معتبر و بین‌المللی است؟',
         'بله! تمام آموزشگاه‌های معرفی شده در این سامانه دارای پروانه تاسیس رسمی از سازمان آموزش فنی و حرفه‌ای کشور هستند و مدرک پایان دوره آن‌ها دارای کد بین‌المللی ISCO-08 بوده و در بیش از ۱۷۰ کشور عضو سازمان جهانی کار (ILO) معتبر است.', 1),
        ('چگونه می‌توانم در دوره‌ها ثبت‌نام کنم و آیا پرداخت اقساطی امکان‌پذیر است؟',
         'برای ثبت‌نام کافی است روی دکمه «ثبت‌نام سریع» در صفحه‌ی هر دوره کلیک کنید. پس از تأیید توسط آموزشگاه، برای هماهنگی و پرداخت (نقدی یا اقساطی) با شما تماس گرفته می‌شود.', 2),
        ('آیا پس از دریافت مدرک، امکان دریافت وام اشتغال‌زایی وجود دارد؟',
         'بله. با ارائه مدرک فنی‌وحرفه‌ای معتبر، می‌توانید از تسهیلات وام خوداشتغالی و مشاغل خانگی بانک‌های عامل بهره‌مند شوید.', 3),
        ('چگونه می‌توانم اصالت یک آموزشگاه یا مدرک را استعلام بگیرم؟',
         'با مراجعه به بخش «استعلام آنلاین مجوزها» در همین سایت و وارد کردن شماره پروانه، وضعیت آن به‌صورت لحظه‌ای بررسی می‌شود. اصالت مدارک نیز در سایت portaltvto.com قابل استعلام است.', 4),
        ('مدیر آموزشگاه هستم، چگونه آموزشگاه خود را در این سامانه ثبت کنم؟',
         'با شماره ۰۹۱۵۹۵۱۳۱۷۹ (کارشناس نظارت) تماس بگیرید یا از دکمه «ثبت آموزشگاه رایگان» در پایین صفحه اقدام نمایید.', 5)
      ) AS v(question, answer, sort_order)
      WHERE NOT EXISTS (SELECT 1 FROM faqs);
    `,
  },
];

async function isAuthorized(req: Request): Promise<boolean> {
  // Allow via session (admin logged in)
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as { phone?: string; role?: string } | undefined;
    if (user?.role === "admin" || (user?.phone && ADMIN_PHONES.includes(user.phone))) {
      return true;
    }
  } catch {}
  // Or via secret token header (for one-off runs)
  const secret = process.env.NEXTAUTH_SECRET;
  const headerSecret = req.headers.get("x-migrate-secret");
  if (secret && headerSecret && secret === headerSecret) return true;
  return false;
}

export async function GET(req: Request) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });
  }
  const pool = new Pool({ connectionString: databaseUrl });
  const results: { name: string; ok: boolean; error?: string }[] = [];
  try {
    for (const m of MIGRATIONS) {
      try {
        await pool.query(m.sql);
        results.push({ name: m.name, ok: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ name: m.name, ok: false, error: msg });
      }
    }
  } finally {
    await pool.end();
  }
  const ok = results.every((r) => r.ok);
  return NextResponse.json({ ok, migrations: results }, { status: ok ? 200 : 500 });
}

export async function POST(req: Request) {
  return GET(req);
}
