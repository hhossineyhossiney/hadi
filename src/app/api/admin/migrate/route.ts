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
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule_days JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS schedule_time VARCHAR(30);
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS session_duration INTEGER DEFAULT 0;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0;
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS end_date VARCHAR(100);
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
  // 11) SHOP: Sellable courses tables
  {
    name: "shop_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS sellable_permissions (
        id SERIAL PRIMARY KEY,
        institute_id INTEGER NOT NULL UNIQUE REFERENCES institutes(id) ON DELETE CASCADE,
        max_courses INTEGER DEFAULT 0,
        is_enabled BOOLEAN DEFAULT false,
        commission_percent DECIMAL(5,2) DEFAULT 10.00,
        approved_by INTEGER,
        approved_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sellable_courses (
        id SERIAL PRIMARY KEY,
        institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(500),
        description TEXT,
        cover_image TEXT,
        trailer_video TEXT,
        category_id INTEGER REFERENCES categories(id),
        instructor VARCHAR(255),
        instructor_title VARCHAR(255),
        instructor_avatar TEXT,
        instructor_bio TEXT,
        level VARCHAR(30),
        language VARCHAR(20) DEFAULT 'fa',
        total_duration INTEGER DEFAULT 0,
        total_lessons INTEGER DEFAULT 0,
        total_chapters INTEGER DEFAULT 0,
        students_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        price DECIMAL(12,0) NOT NULL,
        original_price DECIMAL(12,0),
        discount_percent INTEGER DEFAULT 0,
        discount_ends_at TIMESTAMP,
        features JSONB DEFAULT '[]'::jsonb,
        requirements JSONB DEFAULT '[]'::jsonb,
        target_audience JSONB DEFAULT '[]'::jsonb,
        has_support BOOLEAN DEFAULT true,
        has_certificate BOOLEAN DEFAULT true,
        has_download BOOLEAN DEFAULT false,
        lifetime_access BOOLEAN DEFAULT true,
        access_duration_days INTEGER,
        is_published BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'draft',
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sellable_courses_institute ON sellable_courses(institute_id);
      CREATE INDEX IF NOT EXISTS idx_sellable_courses_status ON sellable_courses(status);
      CREATE INDEX IF NOT EXISTS idx_sellable_courses_featured ON sellable_courses(is_featured) WHERE is_featured = true;

      CREATE TABLE IF NOT EXISTS sellable_chapters (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL REFERENCES sellable_courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        is_free BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sellable_chapters_course ON sellable_chapters(course_id);

      CREATE TABLE IF NOT EXISTS sellable_lessons (
        id SERIAL PRIMARY KEY,
        chapter_id INTEGER NOT NULL REFERENCES sellable_chapters(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES sellable_courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(20) DEFAULT 'video',
        description TEXT,
        video_url TEXT,
        video_provider VARCHAR(30) DEFAULT 'direct',
        video_duration INTEGER DEFAULT 0,
        content TEXT,
        attachment_url TEXT,
        is_free BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT true,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sellable_lessons_chapter ON sellable_lessons(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_sellable_lessons_course ON sellable_lessons(course_id);

      -- Cover image columns (idempotent)
      ALTER TABLE sellable_chapters ADD COLUMN IF NOT EXISTS cover_image TEXT;
      ALTER TABLE sellable_lessons  ADD COLUMN IF NOT EXISTS cover_image TEXT;

      -- Extend telegram_chats for interactive state
      ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS user_id INTEGER;
      ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
      ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS state VARCHAR(50);
      ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS state_data TEXT;
      ALTER TABLE telegram_chats ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP DEFAULT NOW();
    `,
  },
  // 13) V3: Assignments, Quizzes, Live Classes, Tickets, Points, Activities
  {
    name: "v3_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        max_score INTEGER DEFAULT 100,
        attachment_url TEXT,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);

      CREATE TABLE IF NOT EXISTS assignment_submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        registration_id INTEGER,
        submission_text TEXT,
        file_url TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        score INTEGER,
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT NOW(),
        reviewed_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_asub_user ON assignment_submissions(user_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_asub_user_assignment ON assignment_submissions(user_id, assignment_id);

      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        duration_minutes INTEGER DEFAULT 30,
        passing_score INTEGER DEFAULT 60,
        max_attempts INTEGER DEFAULT 1,
        scheduled_at TIMESTAMP,
        available_until TIMESTAMP,
        questions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_quizzes_course ON quizzes(course_id);

      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        max_score INTEGER DEFAULT 0,
        percent INTEGER DEFAULT 0,
        passed BOOLEAN DEFAULT false,
        answers JSONB DEFAULT '[]'::jsonb,
        started_at TIMESTAMP DEFAULT NOW(),
        submitted_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_qattempts_user ON quiz_attempts(user_id);

      CREATE TABLE IF NOT EXISTS live_classes (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        meeting_url TEXT NOT NULL,
        provider VARCHAR(30) DEFAULT 'skyroom',
        meeting_id VARCHAR(100),
        password VARCHAR(100),
        scheduled_at TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 60,
        status VARCHAR(20) DEFAULT 'scheduled',
        recording_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_live_course ON live_classes(course_id);
      CREATE INDEX IF NOT EXISTS idx_live_time ON live_classes(scheduled_at);

      CREATE TABLE IF NOT EXISTS support_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(20) DEFAULT 'open',
        assigned_to INTEGER,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        resolved_at TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
      CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);

      CREATE TABLE IF NOT EXISTS ticket_replies (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        is_staff BOOLEAN DEFAULT false,
        attachment_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_tr_ticket ON ticket_replies(ticket_id);

      CREATE TABLE IF NOT EXISTS user_points (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        reason VARCHAR(100),
        ref_type VARCHAR(50),
        ref_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_points_user ON user_points(user_id);

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_name VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        description TEXT,
        ref_type VARCHAR(50),
        ref_id INTEGER,
        amount DECIMAL(12, 0),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_activities_time ON activities(created_at DESC);
    `,
  },
  // 14) V4: Instructors, Grades, Attendance
  {
    name: "v4_tables",
    sql: `
      CREATE TABLE IF NOT EXISTS instructors (
        id SERIAL PRIMARY KEY,
        institute_id INTEGER NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        bio TEXT,
        avatar TEXT,
        phone VARCHAR(20),
        email VARCHAR(255),
        specialties JSONB DEFAULT '[]'::jsonb,
        years_experience INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_instructors_inst ON instructors(institute_id);

      CREATE TABLE IF NOT EXISTS grades (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        institute_id INTEGER NOT NULL,
        instructor_id INTEGER,
        subject VARCHAR(255),
        theoretical_score DECIMAL(5,2),
        practical_score DECIMAL(5,2),
        final_score DECIMAL(5,2),
        max_score INTEGER DEFAULT 20,
        passing_score DECIMAL(5,2) DEFAULT 10,
        status VARCHAR(20) DEFAULT 'pending',
        description TEXT,
        graded_by INTEGER,
        graded_at TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_grades_user ON grades(user_id);
      CREATE INDEX IF NOT EXISTS idx_grades_registration ON grades(registration_id);
      CREATE INDEX IF NOT EXISTS idx_grades_course ON grades(course_id);

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        registration_id INTEGER NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        session_id INTEGER,
        session_date VARCHAR(30),
        status VARCHAR(20) NOT NULL,
        notes TEXT,
        marked_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_att_user ON attendance(user_id);
      CREATE INDEX IF NOT EXISTS idx_att_course ON attendance(course_id);
      CREATE INDEX IF NOT EXISTS idx_att_date ON attendance(session_date);

      CREATE TABLE IF NOT EXISTS sellable_purchases (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL REFERENCES sellable_courses(id) ON DELETE CASCADE,
        institute_id INTEGER NOT NULL REFERENCES institutes(id),
        amount DECIMAL(12,0) NOT NULL,
        commission DECIMAL(12,0) DEFAULT 0,
        net_amount DECIMAL(12,0) DEFAULT 0,
        payment_method VARCHAR(30) DEFAULT 'wallet',
        payment_ref VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        access_expires_at TIMESTAMP,
        progress INTEGER DEFAULT 0,
        last_lesson_id INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sellable_purchases_user ON sellable_purchases(user_id);
      CREATE INDEX IF NOT EXISTS idx_sellable_purchases_course ON sellable_purchases(course_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_sellable_purchase_user_course ON sellable_purchases(user_id, course_id) WHERE status = 'paid';

      CREATE TABLE IF NOT EXISTS sellable_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        purchase_id INTEGER NOT NULL REFERENCES sellable_purchases(id) ON DELETE CASCADE,
        lesson_id INTEGER NOT NULL REFERENCES sellable_lessons(id) ON DELETE CASCADE,
        is_completed BOOLEAN DEFAULT false,
        watched_seconds INTEGER DEFAULT 0,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sellable_progress_purchase ON sellable_lesson_progress(purchase_id);
      CREATE UNIQUE INDEX IF NOT EXISTS uq_sellable_progress_user_lesson ON sellable_lesson_progress(user_id, lesson_id);
    `,
  },
  // 12) SEED: Sample sellable courses for آموزشگاه کامپیوتر هدف (institute id = 1)
  {
    name: "seed_shop_samples",
    sql: `
      -- Grant permission to institute 1 (کامپیوتر هدف)
      INSERT INTO sellable_permissions (institute_id, max_courses, is_enabled, commission_percent)
      SELECT 1, 10, true, 10.00
      WHERE EXISTS (SELECT 1 FROM institutes WHERE id = 1)
        AND NOT EXISTS (SELECT 1 FROM sellable_permissions WHERE institute_id = 1);

      -- Sample course 1: Photoshop
      INSERT INTO sellable_courses (institute_id, slug, title, subtitle, description, cover_image, instructor, instructor_title, level, price, original_price, discount_percent, features, requirements, target_audience, is_published, is_featured, status, published_at, total_chapters, total_lessons, total_duration, students_count, rating, rating_count)
      SELECT 1, 'photoshop-pro-package',
        'دوره جامع فتوشاپ حرفه‌ای',
        'از صفر تا تولید پروژه واقعی — ۲۵ ساعت آموزش پروژه‌محور با گواهینامه',
        E'در این دوره جامع، از پایه‌ای‌ترین ابزارهای فتوشاپ تا تکنیک‌های حرفه‌ای رتوش، طراحی پوستر، طراحی بنر و ادیت عکس‌های تبلیغاتی را یاد می‌گیرید.\n\nهر فصل شامل ویدئوهای HD، تمرین عملی و پروژه پایانی است. پس از اتمام دوره، گواهینامه معتبر آموزشگاه دریافت می‌کنید.',
        '',
        'مهندس حمید حسینی', 'مدرس رسمی فنی و حرفه‌ای',
        'beginner', 1290000, 2490000, 48,
        '["آموزش پروژه‌محور با ۲۵ ساعت ویدئو HD", "پشتیبانی ۶ ماهه رایگان", "گواهینامه معتبر فنی و حرفه‌ای", "دسترسی مادام‌العمر", "دانلود ویدئوها بدون محدودیت"]'::jsonb,
        '["داشتن کامپیوتر با حداقل ۴ گیگ رم", "نصب نرم‌افزار فتوشاپ 2020 به بالا", "علاقه به طراحی گرافیک"]'::jsonb,
        '["علاقه‌مندان به طراحی گرافیک", "مدیران شبکه‌های اجتماعی", "دانشجویان هنر و رسانه", "فریلنسرها"]'::jsonb,
        true, true, 'published', NOW(), 6, 42, 1500, 178, 4.8, 89
      WHERE EXISTS (SELECT 1 FROM institutes WHERE id = 1)
        AND NOT EXISTS (SELECT 1 FROM sellable_courses WHERE slug = 'photoshop-pro-package');

      -- Sample course 2: AI
      INSERT INTO sellable_courses (institute_id, slug, title, subtitle, description, instructor, instructor_title, level, price, original_price, discount_percent, features, requirements, target_audience, is_published, is_featured, status, published_at, total_chapters, total_lessons, total_duration, students_count, rating, rating_count)
      SELECT 1, 'ai-complete-package',
        'دوره جامع هوش مصنوعی و ChatGPT',
        'یاد بگیر چطور با هوش مصنوعی درآمد میلیونی بسازی — ۳۰ ساعت آموزش کاربردی',
        E'دوره کامل کاربرد هوش مصنوعی در کسب‌وکار، تولید محتوا، طراحی، کدنویسی و... همراه با پروژه‌های عملی و درآمدزا.\n\nهم برای مبتدی‌ها و هم افراد حرفه‌ای مناسب است.',
        'دکتر سعید کاظمی', 'متخصص هوش مصنوعی',
        'intermediate', 1990000, 3990000, 50,
        '["۳۰ ساعت ویدئو کیفیت HD", "۱۵ پروژه کاربردی و درآمدزا", "گواهینامه معتبر", "پشتیبانی ۱ ساله", "دسترسی مادام‌العمر", "آپدیت رایگان محتوا"]'::jsonb,
        '["کامپیوتر با اتصال اینترنت", "آشنایی مقدماتی با کامپیوتر", "علاقه به یادگیری تکنولوژی"]'::jsonb,
        '["صاحبان کسب‌وکار", "تولیدکنندگان محتوا", "برنامه‌نویسان", "بازاریابان دیجیتال"]'::jsonb,
        true, true, 'published', NOW(), 8, 56, 1800, 312, 4.9, 156
      WHERE EXISTS (SELECT 1 FROM institutes WHERE id = 1)
        AND NOT EXISTS (SELECT 1 FROM sellable_courses WHERE slug = 'ai-complete-package');

      -- Sample course 3: Admin
      INSERT INTO sellable_courses (institute_id, slug, title, subtitle, description, instructor, instructor_title, level, price, original_price, discount_percent, features, requirements, target_audience, is_published, is_featured, status, published_at, total_chapters, total_lessons, total_duration, students_count, rating, rating_count)
      SELECT 1, 'admin-office-package',
        'دوره جامع ادمینی و مدیریت دفتری',
        'ورود سریع به بازار کار به عنوان کارشناس دفتری با مدرک رسمی',
        E'یاد بگیر چطور به عنوان یک ادمین حرفه‌ای در دفاتر و شرکت‌ها کار کنی. شامل Word, Excel, PowerPoint, ایمیل حرفه‌ای، مدیریت زمان و اصول ارتباط سازمانی.',
        'استاد سارا احمدی', 'مدرس دوره‌های ICDL',
        'beginner', 890000, 1590000, 44,
        '["۲۰ ساعت آموزش عملی", "چک‌لیست‌ها و قالب‌های آماده", "گواهینامه فنی و حرفه‌ای", "پشتیبانی مستقیم مدرس", "دسترسی دائمی"]'::jsonb,
        '["کامپیوتر یا لپ‌تاپ", "علاقه به کار دفتری"]'::jsonb,
        '["جویندگان کار", "کارآموزان", "افرادی که می‌خواهند به عنوان منشی/کارشناس دفتری استخدام شوند"]'::jsonb,
        true, false, 'published', NOW(), 5, 30, 1200, 89, 4.7, 42
      WHERE EXISTS (SELECT 1 FROM institutes WHERE id = 1)
        AND NOT EXISTS (SELECT 1 FROM sellable_courses WHERE slug = 'admin-office-package');

      -- Sample chapters & lessons for Photoshop
      DO $$
      DECLARE
        v_course_id INTEGER;
        v_ch1 INTEGER; v_ch2 INTEGER; v_ch3 INTEGER; v_ch4 INTEGER; v_ch5 INTEGER; v_ch6 INTEGER;
      BEGIN
        SELECT id INTO v_course_id FROM sellable_courses WHERE slug = 'photoshop-pro-package';
        IF v_course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM sellable_chapters WHERE course_id = v_course_id) THEN
          INSERT INTO sellable_chapters (course_id, title, order_index, is_free) VALUES (v_course_id, 'فصل ۱: آشنایی با محیط فتوشاپ', 1, true) RETURNING id INTO v_ch1;
          INSERT INTO sellable_chapters (course_id, title, order_index) VALUES (v_course_id, 'فصل ۲: ابزارهای انتخاب و برش', 2) RETURNING id INTO v_ch2;
          INSERT INTO sellable_chapters (course_id, title, order_index) VALUES (v_course_id, 'فصل ۳: لایه‌ها و ماسک', 3) RETURNING id INTO v_ch3;
          INSERT INTO sellable_chapters (course_id, title, order_index) VALUES (v_course_id, 'فصل ۴: رتوش و ادیت پرتره', 4) RETURNING id INTO v_ch4;
          INSERT INTO sellable_chapters (course_id, title, order_index) VALUES (v_course_id, 'فصل ۵: طراحی پوستر و بنر', 5) RETURNING id INTO v_ch5;
          INSERT INTO sellable_chapters (course_id, title, order_index) VALUES (v_course_id, 'فصل ۶: پروژه پایانی', 6) RETURNING id INTO v_ch6;

          INSERT INTO sellable_lessons (chapter_id, course_id, title, type, video_duration, is_free, is_locked, order_index) VALUES
            (v_ch1, v_course_id, 'معرفی دوره و منابع مورد نیاز', 'video', 420, true, false, 1),
            (v_ch1, v_course_id, 'نصب فتوشاپ و آشنایی با محیط', 'video', 780, true, false, 2),
            (v_ch1, v_course_id, 'شخصی‌سازی پنل‌ها و کارگاه', 'video', 540, true, false, 3),
            (v_ch2, v_course_id, 'ابزار Marquee و Lasso', 'video', 720, false, true, 1),
            (v_ch2, v_course_id, 'ابزار Magic Wand و Quick Selection', 'video', 660, false, true, 2),
            (v_ch2, v_course_id, 'برش دقیق با Pen Tool', 'video', 900, false, true, 3),
            (v_ch3, v_course_id, 'مفهوم لایه‌ها', 'video', 480, false, true, 1),
            (v_ch3, v_course_id, 'Layer Mask و Clipping Mask', 'video', 720, false, true, 2),
            (v_ch3, v_course_id, 'Adjustment Layers', 'video', 600, false, true, 3),
            (v_ch4, v_course_id, 'رتوش پوست و حذف جوش', 'video', 840, false, true, 1),
            (v_ch4, v_course_id, 'میکاپ دیجیتال', 'video', 780, false, true, 2),
            (v_ch5, v_course_id, 'اصول طراحی پوستر', 'video', 900, false, true, 1),
            (v_ch5, v_course_id, 'ساخت بنر تبلیغاتی اینستاگرام', 'video', 720, false, true, 2),
            (v_ch6, v_course_id, 'تعریف پروژه و بریف', 'video', 540, false, true, 1),
            (v_ch6, v_course_id, 'اجرای پروژه با راهنمای مدرس', 'video', 1200, false, true, 2);
        END IF;
      END $$;
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
