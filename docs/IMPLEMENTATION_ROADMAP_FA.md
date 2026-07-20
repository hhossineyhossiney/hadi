# نقشه اجرای مرحله‌ای اپلیکیشن تجاری فَنیکسو

## اصل اجرا

پروژه در Releaseهای کوچک، قابل تست و بدون حذف داده‌های فعلی توسعه می‌یابد. هر فاز پس از Build، تست و بررسی تولید بسته می‌شود.

## فاز ۰ — تثبیت و معماری ✅

- [x] مستندسازی معماری هدف
- [x] تعیین دامنه‌های Backend
- [x] تعریف صفحات و User Journeyها
- [x] راهبرد Migration بدون حذف داده
- [x] انتخاب React Native/Expo برای موبایل
- [x] انتخاب NestJS برای API هدف

## فاز ۱ — PWA و Design Foundation 🚧

- [x] Web App Manifest
- [x] آیکن‌های 192، 512، Maskable و Apple
- [x] Service Worker امن
- [x] Offline Fallback عمومی
- [x] Install Prompt
- [x] Viewport و Apple Web App Metadata
- [x] بسته Android TWA امضاشده برای توزیع عمومی
- [x] Digital Asset Links و لینک دانلود پایدار
- [ ] یکپارچه‌سازی Design Token وب و موبایل
- [ ] Accessibility Audit سراسری
- [ ] بهینه‌سازی Bundle و Core Web Vitals

## فاز ۲ — API نسخه‌دار و احراز هویت موبایل

- [ ] `/api/v1`
- [ ] Access Token کوتاه‌مدت
- [ ] Refresh Token چرخشی
- [ ] Device Session Management
- [ ] Logout/Revoke
- [ ] Rate Limit و Audit Login
- [ ] OpenAPI

## فاز ۳ — اپ موبایل MVP

- [ ] Expo Router و Design System
- [ ] ورود و ثبت‌نام
- [ ] صفحه اصلی
- [ ] دوره‌ها و آموزشگاه‌ها
- [ ] پنل هنرجو
- [ ] پخش درس آنلاین
- [ ] پیشرفت
- [ ] پیام و اعلان
- [ ] پروفایل و امنیت
- [ ] EAS Build Android/iOS

## فاز ۴ — نقش مدرس

- [ ] افزودن نقش Instructor بدون شکستن نقش‌های فعلی
- [ ] پروفایل مدرس
- [ ] پنل مدرس
- [ ] Course Builder
- [ ] Upload مستقیم ویدئو
- [ ] مدیریت دانشجو
- [ ] تکلیف، آزمون و پاسخ
- [ ] فروش و درآمد مدرس

## فاز ۵ — تجارت کامل

- [ ] سبد خرید
- [ ] Order و Order Item
- [ ] Coupon و Campaign
- [ ] Payment Idempotency
- [ ] Invoice PDF
- [ ] Refund
- [ ] Settlement آموزشگاه
- [ ] گزارش مغایرت مالی

## فاز ۶ — زیرساخت ویدئو و Storage

- [ ] Object Storage
- [ ] Multipart Upload
- [ ] مهاجرت Base64
- [ ] Queue پردازش
- [ ] HLS چند کیفیت
- [ ] Signed URL
- [ ] Thumbnail و Metadata

## فاز ۷ — Push و ارتباطات

- [ ] FCM
- [ ] APNs
- [ ] Web Push
- [ ] Device Token
- [ ] Deep Link
- [ ] Notification Preference
- [ ] Delivery/Open Analytics

## فاز ۸ — هوش مصنوعی آموزشی پیشرفته

- [ ] Context دوره خریداری‌شده
- [ ] خلاصه درس
- [ ] ساخت آزمون با تایید مدرس
- [ ] پیشنهاد مسیر یادگیری
- [ ] ثبت هزینه و Usage
- [ ] Moderation و Guardrail

## فاز ۹ — استخراج NestJS

ترتیب استخراج دامنه‌ها:

1. Identity و Mobile Auth
2. Notifications
3. Commerce/Payment
4. Learning Progress
5. Chat/Ticket
6. Course Catalog
7. Institute Management

## فاز ۱۰ — تجاری‌سازی نهایی

- [ ] Monitoring و Alert
- [ ] SLO/SLA
- [ ] Load Test
- [ ] Penetration Test
- [ ] Privacy/Terms
- [ ] Backup Drill
- [ ] انتشار Google Play
- [ ] انتشار App Store
- [ ] Runbook پشتیبانی و Incident
