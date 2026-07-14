import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["student", "institute", "admin"]);
export const statusEnum = pgEnum("status", ["pending", "approved", "rejected"]);
export const documentValidityEnum = pgEnum("document_validity", ["valid", "expired", "pending_review"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").notNull().default("student"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const telegramChats = pgTable("telegram_chats", {
  id: serial("id").primaryKey(),
  chatId: varchar("chat_id", { length: 100 }).notNull().unique(),
  firstName: varchar("first_name", { length: 255 }),
  username: varchar("username", { length: 255 }),
  role: varchar("role", { length: 50 }).default("subscriber"),
  instituteId: integer("institute_id"),
  userId: integer("user_id"),           // link to users table (for students/managers)
  phone: varchar("phone", { length: 20 }), // linked phone number
  state: varchar("state", { length: 50 }), // conversational state (e.g., awaiting_phone)
  stateData: text("state_data"),           // JSON data for state machine
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otpCodes = pgTable("otp_codes", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 50 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }),
  image: text("image"),
  courseCount: integer("course_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const regions = pgTable("regions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const institutes = pgTable("institutes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  address: text("address"),
  regionId: integer("region_id").references(() => regions.id),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  images: jsonb("images"),
  logo: text("logo"),
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isVerified: boolean("is_verified").default(false),
  isYearAward: boolean("is_year_award").default(false), // برگزیده سال
  accessCode: varchar("access_code", { length: 12 }),
  status: statusEnum("status").default("pending"),
  isActive: boolean("is_active").default(true),
  bannerImages: jsonb("banner_images").default([]),
  profilePhoto: text("profile_photo"),
  // NEW FIELDS
  managerName: varchar("manager_name", { length: 255 }),
  managerTitle: varchar("manager_title", { length: 100 }),
  licenseNumber: varchar("license_number", { length: 100 }),
  features: jsonb("features").default([]), // string[]
  establishedYear: varchar("established_year", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id")
    .references(() => institutes.id)
    .notNull(),
  mediaUrl: text("media_url").notNull(),
  mediaType: varchar("media_type", { length: 10 }).default("image"),
  caption: varchar("caption", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
  publishAt: timestamp("publish_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  isArchived: boolean("is_archived").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: jsonb("value").default([]),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id")
    .references(() => institutes.id)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  fullDescription: text("full_description"),
  duration: varchar("duration", { length: 100 }),
  price: decimal("price", { precision: 12, scale: 0 }).default("0"),
  originalPrice: decimal("original_price", { precision: 12, scale: 0 }),
  capacity: integer("capacity").default(0),
  enrolledCount: integer("enrolled_count").default(0),
  instructor: varchar("instructor", { length: 255 }),
  instructorTitle: varchar("instructor_title", { length: 150 }),
  level: varchar("level", { length: 30 }), // beginner|intermediate|advanced|comprehensive
  requirements: text("requirements"),
  schedule: text("schedule"),
  startDate: varchar("start_date", { length: 100 }),
  image: text("image"),
  syllabus: jsonb("syllabus").default([]), // string[] - سرفصل‌ها
  bannerImages: jsonb("banner_images").default([]),
  isFeatured: boolean("is_featured").default(false),
  totalSessions: integer("total_sessions").default(0),
  // Structured schedule fields (new)
  scheduleDays: jsonb("schedule_days").default([]), // e.g., ["saturday", "monday", "wednesday"]
  scheduleTime: varchar("schedule_time", { length: 30 }), // e.g., "16:00" - session start time
  sessionDuration: integer("session_duration").default(0), // minutes per session, e.g., 120
  totalHours: integer("total_hours").default(0), // total course hours, e.g., 40
  endDate: varchar("end_date", { length: 100 }), // auto-calculated end date (Jalali)
  registrationClosed: boolean("registration_closed").default(false), // مدیر ثبت‌نام رو دستی متوقف کرده
  registrationEnded: boolean("registration_ended").default(false),   // زمان ثبت‌نام تمام شده
  status: statusEnum("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id")
    .references(() => courses.id)
    .notNull(),
  instituteId: integer("institute_id")
    .references(() => institutes.id)
    .notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }),
  documents: jsonb("documents"),
  notes: text("notes"),
  status: statusEnum("status").default("pending"),
  certificateUrl: text("certificate_url"),
  progress: integer("progress").default(0), // 0..100
  sessionsAttended: integer("sessions_attended").default(0),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentDocuments = pgTable("student_documents", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id")
    .references(() => registrations.id)
    .notNull(),
  instituteId: integer("institute_id")
    .references(() => institutes.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 10 }).notNull(),
  documentNumber: varchar("document_number", { length: 100 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  issueDate: varchar("issue_date", { length: 50 }),
  validity: documentValidityEnum("validity").default("pending_review"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  instituteId: integer("institute_id")
    .references(() => institutes.id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ================= NEW TABLES ================= */

// Frequently Asked Questions (editable by admin)
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Live chat messages between users (admin ↔ manager ↔ student)
export const chatThreads = pgTable("chat_threads", {
  id: serial("id").primaryKey(),
  participantAId: integer("participant_a_id").notNull(),
  participantARole: varchar("participant_a_role", { length: 30 }).notNull(),
  participantBId: integer("participant_b_id").notNull(),
  participantBRole: varchar("participant_b_role", { length: 30 }).notNull(),
  contextType: varchar("context_type", { length: 30 }),
  contextId: integer("context_id"),
  isArchived: boolean("is_archived").default(false),
  isPinned: boolean("is_pinned").default(false),
  isBlockedByA: boolean("is_blocked_by_a").default(false),
  isBlockedByB: boolean("is_blocked_by_b").default(false),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id")
    .references(() => chatThreads.id, { onDelete: "cascade" })
    .notNull(),
  senderId: integer("sender_id").notNull(),
  senderRole: varchar("sender_role", { length: 30 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// System notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  userRole: varchar("user_role", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  type: varchar("type", { length: 50 }).default("info"), // info|success|warning|error|chat|enrollment
  link: text("link"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student portfolio (resume / نمونه‌کار)
export const studentPortfolio = pgTable("student_portfolio", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  link: text("link"),
  tags: jsonb("tags").default([]),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Institute portfolio / gallery
export const institutePortfolio = pgTable("institute_portfolio", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id")
    .references(() => institutes.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Wallet transactions
export const walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: decimal("amount", { precision: 12, scale: 0 }).notNull(),
  type: varchar("type", { length: 30 }).notNull(), // deposit|withdraw|payment|refund
  description: text("description"),
  registrationId: integer("registration_id").references(() => registrations.id),
  balanceAfter: decimal("balance_after", { precision: 12, scale: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Class sessions (for schedule / upcoming classes)
export const courseSessions = pgTable("course_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  sessionNumber: integer("session_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sessionDate: varchar("session_date", { length: 30 }),
  sessionTime: varchar("session_time", { length: 30 }),
  duration: varchar("duration", { length: 30 }),
  isOnline: boolean("is_online").default(false),
  meetingUrl: text("meeting_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT INSTALLMENTS SYSTEM — قسط‌بندی و هزینه‌های اضافی دوره
// ═══════════════════════════════════════════════════════════════

/**
 * Payment fees: each row is one fee (installment or extra fee) that a student must pay.
 * `type` distinguishes between:
 *   - "installment" — قسط شهریه دوره
 *   - "certificate" — هزینه صدور مدرک
 *   - "exam_first" — هزینه آزمون اول
 *   - "exam_retry" — هزینه آزمون مجدد (در صورت مردودی)
 *   - "government_dahak" — کسری/اضافه‌ی دهک‌بندی دولتی
 *   - "extra" — سایر هزینه‌های آموزشگاه
 */
export const paymentFees = pgTable("payment_fees", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id")
    .references(() => registrations.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id").notNull(), // for fast lookup
  courseId: integer("course_id").notNull(),
  instituteId: integer("institute_id").notNull(),

  type: varchar("type", { length: 30 }).notNull().default("installment"),
  installmentNumber: integer("installment_number").default(0), // 1, 2, 3 for installments; 0 for other fees
  totalInstallments: integer("total_installments").default(0), // e.g., 3 (کل تعداد اقساط این پلان)

  title: varchar("title", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 0 }).notNull(),
  dueDate: varchar("due_date", { length: 30 }), // Persian date "1404/06/15"

  status: varchar("status", { length: 20 }).default("pending"), // pending | paid | overdue | waived
  paidAt: timestamp("paid_at"),
  paidAmount: decimal("paid_amount", { precision: 12, scale: 0 }),
  paymentMethod: varchar("payment_method", { length: 30 }), // wallet | online | manual
  paymentRefId: varchar("payment_ref_id", { length: 100 }),
  transactionId: integer("transaction_id"), // FK to wallet_transactions.id

  isOptional: boolean("is_optional").default(false), // e.g., dahak fee may not apply to all
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/* ═══════════════════════════════════════════════════════════════
   ONLINE SHOP — Sellable Courses (پکیج فروش دوره‌های آنلاین)
   ═══════════════════════════════════════════════════════════════
   
   جریان:
   - مدیر کل به هر آموزشگاه یک سقف تعداد "دوره فروشی" می‌ده (sellablePermissions)
   - مدیر آموزشگاه در محدوده سقف، دوره‌های فروشی ثبت می‌کنه (sellableCourses)
   - هر دوره فصل‌ها (chapters) و درس‌ها (lessons) داره
   - هر درس می‌تونه: video, text, quiz, live باشه
   - هر درس می‌تونه رایگان (preview) یا قفل باشه — بعد از خرید باز می‌شه
   - ویدئوها یا مستقیم آپلود می‌شن یا لینک از فضای ابری (Google Drive, S3, etc.)
*/

// سقف مجاز فروش هر آموزشگاه (توسط مدیر کل تعیین می‌شه)
export const sellablePermissions = pgTable("sellable_permissions", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id").references(() => institutes.id, { onDelete: "cascade" }).notNull().unique(),
  maxCourses: integer("max_courses").default(0), // تعداد مجاز دوره فروشی
  isEnabled: boolean("is_enabled").default(false), // آیا فعال است؟
  commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }).default("10.00"), // درصد کمیسیون مدیر کل
  approvedBy: integer("approved_by"), // admin user id
  approvedAt: timestamp("approved_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// دوره فروشی
export const sellableCourses = pgTable("sellable_courses", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id").references(() => institutes.id, { onDelete: "cascade" }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  description: text("description"), // markdown / html
  coverImage: text("cover_image"), // data URL or URL
  trailerVideo: text("trailer_video"), // URL to preview
  categoryId: integer("category_id").references(() => categories.id),
  instructor: varchar("instructor", { length: 255 }),
  instructorTitle: varchar("instructor_title", { length: 255 }),
  instructorAvatar: text("instructor_avatar"),
  instructorBio: text("instructor_bio"),
  level: varchar("level", { length: 30 }), // beginner|intermediate|advanced
  language: varchar("language", { length: 20 }).default("fa"),
  totalDuration: integer("total_duration").default(0), // minutes
  totalLessons: integer("total_lessons").default(0),
  totalChapters: integer("total_chapters").default(0),
  studentsCount: integer("students_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: integer("rating_count").default(0),
  price: decimal("price", { precision: 12, scale: 0 }).notNull(),
  originalPrice: decimal("original_price", { precision: 12, scale: 0 }),
  discountPercent: integer("discount_percent").default(0),
  discountEndsAt: timestamp("discount_ends_at"),
  features: jsonb("features").default([]), // array of strings: what you learn
  requirements: jsonb("requirements").default([]),
  targetAudience: jsonb("target_audience").default([]),
  hasSupport: boolean("has_support").default(true),
  hasCertificate: boolean("has_certificate").default(true),
  hasDownload: boolean("has_download").default(false),
  lifetimeAccess: boolean("lifetime_access").default(true),
  accessDurationDays: integer("access_duration_days"), // if not lifetime
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  status: varchar("status", { length: 20 }).default("draft"), // draft|pending|published|archived
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// فصل‌های دوره
export const sellableChapters = pgTable("sellable_chapters", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => sellableCourses.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  orderIndex: integer("order_index").default(0),
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// درس‌های هر فصل
export const sellableLessons = pgTable("sellable_lessons", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id").references(() => sellableChapters.id, { onDelete: "cascade" }).notNull(),
  courseId: integer("course_id").references(() => sellableCourses.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).default("video"), // video|text|quiz|live|file
  description: text("description"),
  coverImage: text("cover_image"),
  videoUrl: text("video_url"), // آدرس ویدئو (Google Drive/YouTube/direct)
  videoProvider: varchar("video_provider", { length: 30 }).default("direct"), // direct|youtube|drive|vimeo|aparat
  videoDuration: integer("video_duration").default(0), // seconds
  content: text("content"), // for text lessons (markdown)
  attachmentUrl: text("attachment_url"),
  isFree: boolean("is_free").default(false), // پیش‌نمایش رایگان
  isLocked: boolean("is_locked").default(true),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// خرید دوره
export const sellablePurchases = pgTable("sellable_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  courseId: integer("course_id").references(() => sellableCourses.id, { onDelete: "cascade" }).notNull(),
  instituteId: integer("institute_id").references(() => institutes.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 0 }).notNull(),
  commission: decimal("commission", { precision: 12, scale: 0 }).default("0"),
  netAmount: decimal("net_amount", { precision: 12, scale: 0 }).default("0"), // آموزشگاه دریافت می‌کند
  paymentMethod: varchar("payment_method", { length: 30 }).default("wallet"),
  paymentRef: varchar("payment_ref", { length: 100 }),
  status: varchar("status", { length: 20 }).default("pending"), // pending|paid|failed|refunded
  accessExpiresAt: timestamp("access_expires_at"), // null = lifetime
  progress: integer("progress").default(0), // 0..100
  lastLessonId: integer("last_lesson_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// پیشرفت درس‌به‌درس
export const sellableLessonProgress = pgTable("sellable_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  purchaseId: integer("purchase_id").references(() => sellablePurchases.id, { onDelete: "cascade" }).notNull(),
  lessonId: integer("lesson_id").references(() => sellableLessons.id, { onDelete: "cascade" }).notNull(),
  isCompleted: boolean("is_completed").default(false),
  watchedSeconds: integer("watched_seconds").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ═══════════════════════════════════════════════════════════════
   V3 — Assignments, Quizzes, Live Classes, Support Tickets, Activities
   ═══════════════════════════════════════════════════════════════ */

// تکالیف
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  instituteId: integer("institute_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  maxScore: integer("max_score").default(100),
  attachmentUrl: text("attachment_url"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

// تحویل تکلیف توسط هنرجو
export const assignmentSubmissions = pgTable("assignment_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull(),
  userId: integer("user_id").notNull(),
  registrationId: integer("registration_id"),
  submissionText: text("submission_text"),
  fileUrl: text("file_url"),
  status: varchar("status", { length: 20 }).default("pending"), // pending|reviewed|late
  score: integer("score"),
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
});

// آزمون‌ها
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  instituteId: integer("institute_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  durationMinutes: integer("duration_minutes").default(30),
  passingScore: integer("passing_score").default(60),
  maxAttempts: integer("max_attempts").default(1),
  scheduledAt: timestamp("scheduled_at"),
  availableUntil: timestamp("available_until"),
  questions: jsonb("questions").default([]), // [{q, options:[], correctIndex, points}]
  createdAt: timestamp("created_at").defaultNow(),
});

// نتایج آزمون
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  userId: integer("user_id").notNull(),
  score: integer("score").default(0),
  maxScore: integer("max_score").default(0),
  percent: integer("percent").default(0),
  passed: boolean("passed").default(false),
  answers: jsonb("answers").default([]),
  startedAt: timestamp("started_at").defaultNow(),
  submittedAt: timestamp("submitted_at"),
});

// کلاس‌های آنلاین (Live)
export const liveClasses = pgTable("live_classes", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  instituteId: integer("institute_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  meetingUrl: text("meeting_url").notNull(), // Zoom, Skyroom, Meet, ...
  provider: varchar("provider", { length: 30 }).default("skyroom"), // zoom|skyroom|meet|other
  meetingId: varchar("meeting_id", { length: 100 }),
  password: varchar("password", { length: 100 }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  durationMinutes: integer("duration_minutes").default(60),
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled|live|ended|cancelled
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// تیکت‌های پشتیبانی
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  category: varchar("category", { length: 50 }).default("general"), // general|payment|technical|complaint
  priority: varchar("priority", { length: 20 }).default("normal"), // low|normal|high|urgent
  status: varchar("status", { length: 20 }).default("open"), // open|in_progress|resolved|closed
  assignedTo: integer("assigned_to"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// پاسخ‌های تیکت
export const ticketReplies = pgTable("ticket_replies", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull(),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isStaff: boolean("is_staff").default(false),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// سیستم امتیاز و گیمیفیکیشن
export const userPoints = pgTable("user_points", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  points: integer("points").notNull(),
  reason: varchar("reason", { length: 100 }), // registration, lesson_complete, quiz_pass, etc
  refType: varchar("ref_type", { length: 50 }), // course, quiz, lesson
  refId: integer("ref_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// جدول فعالیت‌ها (Audit log)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  userName: varchar("user_name", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(), // purchase, registration, payment, complete, etc.
  description: text("description"),
  refType: varchar("ref_type", { length: 50 }),
  refId: integer("ref_id"),
  amount: decimal("amount", { precision: 12, scale: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
});

/* ═══════════════════════════════════════════════════════════════
   V4 — نمرات و کارنامه، اساتید، حضور و غیاب
   ═══════════════════════════════════════════════════════════════ */

// اساتید
export const instructors = pgTable("instructors", {
  id: serial("id").primaryKey(),
  instituteId: integer("institute_id").references(() => institutes.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),               // تخصص
  bio: text("bio"),                                        // رزومه
  avatar: text("avatar"),                                  // تصویر
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  specialties: jsonb("specialties").default([]),           // تخصص‌ها [string]
  yearsExperience: integer("years_experience").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// نمرات هنرجویان
export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  instituteId: integer("institute_id").notNull(),
  instructorId: integer("instructor_id"),                  // اختیاری
  subject: varchar("subject", { length: 255 }),            // موضوع (اختیاری برای نمرات درسی داخل دوره)
  theoreticalScore: decimal("theoretical_score", { precision: 5, scale: 2 }),   // نمره تئوری
  practicalScore: decimal("practical_score", { precision: 5, scale: 2 }),       // نمره عملی
  finalScore: decimal("final_score", { precision: 5, scale: 2 }),               // نمره نهایی
  maxScore: integer("max_score").default(20),
  passingScore: decimal("passing_score", { precision: 5, scale: 2 }).default("10"),
  status: varchar("status", { length: 20 }).default("pending"),  // pending | passed | failed
  description: text("description"),
  gradedBy: integer("graded_by"),                          // مدیر یا استاد
  gradedAt: timestamp("graded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// حضور و غیاب
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  registrationId: integer("registration_id").references(() => registrations.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  sessionId: integer("session_id"),                        // ref to course_sessions
  sessionDate: varchar("session_date", { length: 30 }),    // Persian date
  status: varchar("status", { length: 20 }).notNull(),     // present | absent | late | excused
  notes: text("notes"),
  markedBy: integer("marked_by"),
  createdAt: timestamp("created_at").defaultNow(),
});
