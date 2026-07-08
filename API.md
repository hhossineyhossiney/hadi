# 🔌 API.md — فهرست کامل API Routes

همه مسیرها تحت `src/app/api/` و به‌صورت `export const dynamic = "force-dynamic"` تعریف شده‌اند (برای سازگاری با دیتابیس در زمان اجرا و جلوگیری از خطای Build روی Vercel).

---

## احراز هویت

| Route | Method | توضیح |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth Credentials Provider (ورود با phone + password) |
| `/api/auth/signup` | POST | ثبت‌نام مستقیم حساب کاربری (بدون دوره) |
| `/api/otp` | POST | ارسال (`action:"send"`) و تأیید (`action:"verify"`) کد OTP پیامکی |
| `/api/health` | GET | Health check (`{ok:true}`) برای build_and_start |

## عمومی (Public)

| Route | Method | توضیح |
|---|---|---|
| `/api/categories` | GET | لیست رشته‌ها |
| `/api/institutes` | GET | لیست آموزشگاه‌ها (فیلتر region/q/category/featured) |
| `/api/institutes/[slug]` | GET | جزئیات یک آموزشگاه + دوره‌ها + نظرات |
| `/api/courses` | GET | لیست دوره‌ها (فیلتر category/q/featured) |
| `/api/courses/[slug]` | GET | جزئیات دوره شامل `bannerImages`, `startDate` |
| `/api/registrations` | POST | ثبت‌نام جدید هنرجو در دوره (نیازمند OTP تأییدشده در ۱۵ دقیقه اخیر) — ایجاد/آپدیت user، ارسال اعلان تلگرام |

## هنرجو (Student — نیازمند Session)

| Route | Method | توضیح |
|---|---|---|
| `/api/student/dashboard` | GET | دریافت پروفایل و لیست ثبت‌نام‌های هنرجو با شماره موبایل (`?phone=`) |
| `/api/student/enroll` | POST | **ثبت‌نام سریع در دوره جدید بدون OTP مجدد** برای کاربر لاگین‌شده — جلوگیری از ثبت‌نام تکراری در همان دوره |
| `/api/student/recommendations` | GET | آموزشگاه‌های پیشنهادی (حداکثر ۲، تنظیم‌شده توسط مدیر کل در `site_settings.recommended_institutes`) |
| `/api/student/documents` | GET | لیست مدارک متعلق به هنرجو بر اساس شماره موبایل (`?phone=`)، شامل مشاهده/دانلود/چاپ در UI |

## مدیر آموزشگاه (Manager — نیازمند Session با role=institute)

| Route | Method | Body/Action | توضیح |
|---|---|---|---|
| `/api/manager` | GET | — | داشبورد کامل: institute, courses (با bannerImages), categories, students, stats |
| `/api/manager` | POST | `createCourse` | ثبت دوره جدید (title, categoryId الزامی). `price` و `capacity` فقط عدد می‌پذیرند و اعداد فارسی/عربی به‌صورت امن نرمال می‌شوند |
| `/api/manager` | POST | `updateCourse` | ویرایش دوره موجود با اعتبارسنجی عددی امن برای `price` و `capacity` |
| `/api/manager` | POST | `deleteCourse` | حذف دوره + ثبت‌نام‌های مرتبط |
| `/api/manager` | POST | `updateStatus` | تأیید/رد ثبت‌نام هنرجو |
| `/api/manager` | POST | `uploadCertificate` | آپلود گواهینامه (base64 image) برای یک ثبت‌نام تأییدشده |
| `/api/manager` | POST | `addImage` / `deleteImage` | مدیریت گالری نمونه‌کار آموزشگاه (حداکثر ۱۲ عکس، هرکدام تا ۵۰۰KB) |
| `/api/manager` | POST | `addBanner` / `deleteBanner` | مدیریت بنر اسلایدی آموزشگاه (حداکثر ۷ عکس، هرکدام تا ۸۰۰KB) |
| `/api/manager` | POST | `addCourseBanner` / `deleteCourseBanner` | مدیریت بنر تبلیغاتی یک دوره خاص (حداکثر ۵ عکس، هرکدام تا ۸۰۰KB) — نیازمند `courseId` |
| `/api/manager` | POST | `updateProfile` | ویرایش توضیحات/آدرس/موبایل آموزشگاه |
| `/api/manager/documents` | GET | — | لیست مدارک هنرجویان آموزشگاه؛ قابل فیلتر با `?registrationId=` |
| `/api/manager/documents` | POST | — | افزودن مدرک جدید برای هنرجو (PDF/JPG/PNG، عنوان، شماره مدرک، سریال، تاریخ صدور، اعتبار، توضیحات) |
| `/api/manager/documents` | PATCH | — | ویرایش اطلاعات مدرک یا جایگزینی فایل |
| `/api/manager/documents` | DELETE | — | حذف دائمی مدرک |
| `/api/manager/profile-photo` | POST/DELETE | — | آپلود/حذف عکس پروفایل آموزشگاه با اعتبارسنجی فرمت و حجم |
| `/api/manager/stories` | GET/POST/PATCH/DELETE | — | مدیریت کامل استوری‌های آموزشگاه (تصویر/ویدئو، ترتیب، انتشار، انقضا، آرشیو) |

## مدیر کل سامانه (Admin — نیازمند Session با role=admin)

| Route | Method | توضیح |
|---|---|---|
| `/api/admin/stats` | GET | آمار کلی: totalRegistrations, totalInstitutes, totalCourses, pendingCount, approvedCount, todayCount, totalRevenue |
| `/api/admin/institutes` | GET | لیست همه آموزشگاه‌ها با تعداد دوره/هنرجو |
| `/api/admin/institutes` | POST | افزودن آموزشگاه جدید (تولید accessCode خودکار) |
| `/api/admin/institutes` | PATCH | `{action:"suspend"/"activate"}` یا آپدیت فیلد دلخواه |
| `/api/admin/institutes` | DELETE | حذف کامل آموزشگاه + دوره‌ها + ثبت‌نام‌های آن |
| `/api/admin/managers` | GET | لیست آموزشگاه‌ها به همراه مدیر متصل و accessCode |
| `/api/admin/managers` | POST | ساخت/بازنشانی حساب مدیر آموزشگاه (phone, password, instituteId) |
| `/api/admin/registrations` | GET | لیست همه ثبت‌نام‌ها (کل پلتفرم) |
| `/api/admin/registrations` | PATCH | تغییر وضعیت یک ثبت‌نام |
| `/api/admin/export` | GET | خروجی اکسل چندشیتی (`.xlsx`) — شیت کلی + شیت هر آموزشگاه |
| `/api/admin/finance` | GET | درآمد کل، در انتظار، تفکیک درآمد هر آموزشگاه |
| `/api/admin/settings` | GET | خواندن تنظیمات صفحه اصلی (`featured_institutes`, `featured_courses`, `recommended_institutes`) |
| `/api/admin/settings` | POST | ذخیره یک تنظیم (`{key, value}`) — حداکثر ۲ مورد برای `recommended_institutes` |

## تلگرام

| Route | Method | توضیح |
|---|---|---|
| `/api/telegram/webhook` | POST | Webhook دریافت پیام از تلگرام — دستورات: گزارش ثبت‌نام، آمار، لیست آموزشگاه‌ها/دوره‌ها، اتصال با accessCode، «هنرجویان آموزشگاه من» |
| `/api/telegram/setup` | GET | تنظیم Webhook روی دامنه فعلی (فراخوانی یک‌باره بعد از هر دیپلوی دامنه جدید) |

---

## نکات پیاده‌سازی مهم

- **اعتبارسنجی OTP:** در `/api/registrations`، رکورد `otp_codes` با `verified=true` و `createdAt` در ۱۵ دقیقه اخیر بررسی می‌شود؛ در غیر این صورت خطای ۴۰۳ برمی‌گردد.
- **جلوگیری از ثبت‌نام تکراری:** `/api/student/enroll` قبل از insert بررسی می‌کند کاربر در همان courseId ثبت‌نام قبلی نداشته باشد (خطای ۴۰۹).
- **اعلان تلگرام تفکیک‌شده:** در `/api/registrations` و `/api/student/enroll`، چت‌های بدون `instituteId` (مدیر کل) همیشه اعلان می‌گیرند؛ چت‌های با `instituteId` فقط اعلان مربوط به همان آموزشگاه را دریافت می‌کنند.
- همه اکشن‌های `manager` ابتدا مالکیت (`instituteId`) را نسبت به کاربر لاگین‌شده بررسی می‌کنند تا مدیر یک آموزشگاه نتواند داده آموزشگاه دیگر را تغییر دهد.
