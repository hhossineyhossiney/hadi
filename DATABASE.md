# 🗄️ DATABASE.md — ساختار دیتابیس

> ORM: Drizzle ORM | فایل schema: `src/db/schema.ts`
> دیتابیس Production: Neon PostgreSQL | دیتابیس Dev: PostgreSQL محلی

هر تغییر در این فایل باید هم‌زمان روی هر دو دیتابیس (لوکال با `npx drizzle-kit push` و روی Neon با `psql`/push جداگانه) اعمال شود چون CLI به‌صورت خودکار روی Neon اجرا نمی‌شود.

---

## جدول `users`
کاربران سیستم (هنرجو، مدیر آموزشگاه، مدیر کل)

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| name | varchar(255) | نام کامل |
| phone | varchar(50) unique | شماره موبایل نرمال‌شده (۰۹...) — شناسه ورود |
| email | varchar(255) | اختیاری |
| password | varchar(255) | هش bcrypt |
| role | enum(student, institute, admin) | نقش کاربر |
| avatar | text | اختیاری |
| createdAt | timestamp | |

## جدول `telegram_chats`
چت‌های متصل به ربات تلگرام (مدیر کل + مدیران آموزشگاه)

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| chatId | varchar(100) unique | شناسه چت تلگرام |
| firstName | varchar(255) | |
| username | varchar(255) | |
| role | varchar(50) default 'subscriber' | subscriber / institute_manager |
| instituteId | integer | اگر چت به یک آموزشگاه خاص متصل شده باشد (تفکیک اعلان‌ها) |
| createdAt | timestamp | |

## جدول `otp_codes`
کدهای تأیید پیامکی موقت برای ثبت‌نام

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| phone | varchar(50) | |
| code | varchar(10) | کد ۵ رقمی |
| expiresAt | timestamp | انقضا ۳ دقیقه‌ای |
| verified | boolean | |
| createdAt | timestamp | |

## جدول `categories`
رشته‌های آموزشی (۵ رشته seed‌شده)

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| name | varchar(255) | مثلاً «کامپیوتر و فناوری اطلاعات» |
| slug | varchar(255) unique | |
| description | text | |
| icon | varchar(100) | نام آیکون lucide |
| color | varchar(50) | کد رنگ HEX |
| image | text | |
| courseCount | integer | |
| createdAt | timestamp | |

## جدول `regions`
مناطق شهرستان زبرخان (۵ منطقه seed‌شده: قدمگاه، درود، اسحاق‌آباد، خور، خرو)

| ستون | نوع |
|---|---|
| id | serial PK |
| name | varchar(255) |
| slug | varchar(255) unique |
| createdAt | timestamp |

## جدول `institutes`
آموزشگاه‌ها

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| userId | integer FK → users.id | مدیر آموزشگاه متصل |
| name | varchar(255) | |
| slug | varchar(255) unique | |
| description | text | |
| address | text | |
| regionId | integer FK → regions.id | |
| phone | varchar(50) | |
| mobile | varchar(50) | |
| email | varchar(255) | |
| website | text | |
| images | jsonb | گالری نمونه‌کار (base64 array) |
| logo | text | |
| lat / lng | decimal | مختصات جغرافیایی |
| rating | decimal(2,1) default 0 | |
| reviewCount | integer default 0 | |
| isFeatured | boolean | |
| isVerified | boolean | بج «تأیید شده» |
| accessCode | varchar(12) | کد اتصال ربات تلگرام اختصاصی |
| status | enum(pending, approved, rejected) | |
| isActive | boolean default true | برای تعلیق/فعال‌سازی توسط مدیر کل |
| bannerImages | jsonb default [] | **بنر اسلایدی آموزشگاه** (تا ۷ عکس) |
| profilePhoto | text | عکس پروفایل آموزشگاه برای نوار استوری و صفحه عمومی |
| createdAt | timestamp | |

## جدول `site_settings`
تنظیمات صفحه اصلی که مدیر کل کنترل می‌کند

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| key | varchar(100) unique | `featured_institutes` / `featured_courses` / `recommended_institutes` |
| value | jsonb default [] | آرایه‌ای از ID ها |
| updatedAt | timestamp | |

## جدول `stories`
استوری‌های آموزشگاه‌ها برای نمایش شبیه Instagram Story در صفحه اصلی.

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| instituteId | integer FK → institutes.id | مالک استوری |
| mediaUrl | text | فایل base64 تصویر/ویدئو |
| mediaType | varchar(10) default image | image یا video |
| caption | varchar(255) | توضیح کوتاه |
| sortOrder | integer default 0 | ترتیب نمایش |
| publishAt | timestamp | زمان انتشار |
| expiresAt | timestamp | زمان انقضا — بعد از این زمان در Public API نمایش داده نمی‌شود |
| isArchived | boolean default false | آرشیو دستی توسط مدیر آموزشگاه |
| viewCount | integer default 0 | شمارنده بازدید |
| createdAt | timestamp | |

## جدول `courses`
دوره‌های آموزشی

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| instituteId | integer FK → institutes.id | |
| categoryId | integer FK → categories.id | |
| title | varchar(255) | |
| slug | varchar(255) unique | |
| description | text | |
| fullDescription | text | |
| duration | varchar(100) | مثلاً «۴۰ ساعت» |
| price | decimal(12,0) default 0 | تومان |
| capacity | integer default 0 | |
| enrolledCount | integer default 0 | |
| instructor | varchar(255) | |
| requirements | text | |
| schedule | text | زمان‌بندی متنی |
| startDate | varchar(100) | |
| image | text | |
| bannerImages | jsonb default [] | **بنر تبلیغاتی دوره** (تا ۵ عکس) |
| isFeatured | boolean | |
| status | enum(pending, approved, rejected) | |
| createdAt | timestamp | |

## جدول `registrations`
ثبت‌نام‌های هنرجویان در دوره‌ها

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| userId | integer FK → users.id | |
| courseId | integer FK → courses.id | |
| instituteId | integer FK → institutes.id | |
| fullName | varchar(255) | |
| phone | varchar(50) | |
| email | varchar(255) | |
| documents | jsonb | مدارک بارگذاری‌شده (فاز آتی) |
| notes | text | |
| status | enum(pending, approved, rejected) | |
| certificateUrl | text | **گواهینامه** بارگذاری‌شده توسط مدیر آموزشگاه (base64) |
| createdAt | timestamp | |

## جدول `student_documents`
مدارک حرفه‌ای هنرجویان که توسط مدیر آموزشگاه در پنل آموزشگاه مدیریت می‌شود و در پنل هنرجو قابل مشاهده/دانلود/چاپ است.

| ستون | نوع | توضیح |
|---|---|---|
| id | serial PK | |
| registrationId | integer FK → registrations.id | ثبت‌نام مربوط به مدرک |
| instituteId | integer FK → institutes.id | مالک مدرک برای کنترل دسترسی مدیر آموزشگاه |
| title | varchar(255) | عنوان مدرک |
| fileUrl | text | فایل base64 از نوع PDF/JPG/PNG |
| fileType | varchar(10) | pdf / jpg / png |
| documentNumber | varchar(100) | شماره مدرک |
| serialNumber | varchar(100) | شماره سریال |
| issueDate | varchar(50) | تاریخ صدور |
| validity | enum(valid, expired, pending_review) | وضعیت اعتبار |
| description | text | توضیحات |
| createdAt | timestamp | تاریخ ثبت |
| updatedAt | timestamp | تاریخ آخرین ویرایش |

## جدول `reviews`
نظرات هنرجویان درباره آموزشگاه (ساختار آماده، UI ثبت نظر هنوز پیاده نشده)

| ستون | نوع |
|---|---|
| id | serial PK |
| userId | integer FK → users.id |
| instituteId | integer FK → institutes.id |
| rating | integer |
| comment | text |
| createdAt | timestamp |

---

## نکات مهاجرت (Migration Notes)

- تمام تغییرات schema با `npx drizzle-kit push --force` روی دیتابیس لوکال اعمال می‌شود.
- روی Neon، به دلیل عدم دسترسی CLI مستقیم در بعضی حالت‌ها، از `psql "$NEON_URL" -c "ALTER TABLE ..."` به‌صورت دستی هم استفاده شده — همیشه بعد از تغییر Schema این مرحله را برای Neon هم تکرار کن.
- Connection String فعلی Neon (در Environment Variables Vercel ذخیره شده): `postgresql://neondb_owner:***@ep-dawn-meadow-aht44x4z.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require`
