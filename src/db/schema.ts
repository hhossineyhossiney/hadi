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
