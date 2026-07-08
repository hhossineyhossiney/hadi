import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Target, Layers, FolderTree, Globe, ShieldCheck, Database, Plug,
  Puzzle, Bug, ListTodo, Rocket, KeyRound, CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

const sections = [
  {
    icon: Target,
    title: "هدف پروژه",
    color: "bg-primary-600",
    content: (
      <>
        <p>
          پلتفرم SaaS چندسطحی برای معرفی، مقایسه و ثبت‌نام آنلاین دوره‌های{" "}
          <b>آموزشگاه‌های آزاد مرکز فنی و حرفه‌ای شهرستان زبرخان — مرکز شماره ۱۲</b>.
        </p>
        <p className="mt-2 text-text-tertiary text-sm">
          سازنده: مهندس سیدحمید حسینی — ۰۹۱۵۹۵۱۳۱۷۹
        </p>
        <ul className="mt-3 space-y-1.5 text-sm list-disc list-inside text-text-secondary">
          <li>هنرجو: جستجو، ثبت‌نام با OTP، ثبت‌نام چندگانه بدون فرم مجدد، دانلود گواهینامه</li>
          <li>مدیر آموزشگاه: مدیریت کامل دوره‌ها، هنرجویان، گالری، بنر اسلایدی و بنر تبلیغاتی دوره</li>
          <li>مدیر کل: کنترل کامل پلتفرم، مالی، تنظیمات صفحه اصلی، ربات تلگرام</li>
        </ul>
      </>
    ),
  },
  {
    icon: Layers,
    title: "تکنولوژی‌های استفاده‌شده",
    color: "bg-secondary-600",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        {[
          ["Framework", "Next.js 16 (App Router)"],
          ["زبان", "TypeScript"],
          ["استایل", "TailwindCSS v4"],
          ["انیمیشن", "Framer Motion"],
          ["ORM", "Drizzle ORM"],
          ["دیتابیس", "Neon PostgreSQL (Production)"],
          ["احراز هویت", "NextAuth.js + bcrypt"],
          ["ربات", "Telegram Bot API (@amoozeshghah_bot)"],
          ["اکسل", "کتابخانه xlsx"],
          ["هاست", "Vercel"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between p-2.5 rounded-[10px] bg-bg-secondary">
            <span className="text-text-tertiary">{k}</span>
            <b className="text-text-primary">{v}</b>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Globe,
    title: "صفحات سایت",
    color: "bg-accent-500",
    content: (
      <ul className="space-y-1.5 text-sm">
        {[
          ["/", "صفحه اصلی: Hero، QuickAccess، رشته‌ها، آموزشگاه‌های برتر، دوره‌های ویژه"],
          ["/institutes", "لیست آموزشگاه‌ها"],
          ["/institutes/[slug]", "جزئیات آموزشگاه + بنر اسلایدی + گالری + نقشه"],
          ["/courses", "لیست دوره‌ها"],
          ["/courses/[slug]", "جزئیات دوره + بنر تبلیغاتی دوره"],
          ["/fields", "رشته‌های آموزشی"],
          ["/search", "جستجوی سراسری"],
          ["/login", "ورود با موبایل"],
          ["/register", "ثبت‌نام Wizard ۴ مرحله‌ای + OTP"],
        ].map(([path, desc]) => (
          <li key={path} className="flex flex-col sm:flex-row sm:items-center gap-1 p-2.5 rounded-[10px] bg-bg-secondary">
            <code className="text-primary-600 font-bold shrink-0 sm:w-48">{path}</code>
            <span className="text-text-secondary">{desc}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: ShieldCheck,
    title: "پنل‌ها",
    color: "bg-purple-600",
    content: (
      <div className="space-y-4 text-sm">
        <div>
          <b className="text-text-primary">🎓 /dashboard — پنل هنرجو</b>
          <p className="text-text-tertiary mt-1">داشبورد، دوره‌های من، برنامه هفتگی، گواهینامه‌ها، ثبت‌نام دوره جدید (بدون فرم مجدد)</p>
        </div>
        <div>
          <b className="text-text-primary">🏫 /panel — پنل مدیر آموزشگاه (تیره، Sidebar راست)</b>
          <p className="text-text-tertiary mt-1">داشبورد، مدیریت دوره‌ها (+ بنر تبلیغاتی هر دوره)، هنرجویان (+ آپلود گواهینامه)، گالری، بنر اسلایدی آموزشگاه، ربات تلگرام</p>
        </div>
        <div>
          <b className="text-text-primary">👑 /admin — پنل مدیر کل (تیره، Sidebar راست)</b>
          <p className="text-text-tertiary mt-1">داشبورد مدیریتی، مدیریت آموزشگاه‌ها، مدیران آموزشگاه‌ها، ثبت‌نام‌ها، مالی و درآمد، تنظیمات صفحه اصلی، ربات و اعلان‌ها</p>
        </div>
      </div>
    ),
  },
  {
    icon: Database,
    title: "دیتابیس (جداول)",
    color: "bg-blue-600",
    content: (
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {["users", "institutes", "courses", "registrations", "categories", "regions", "reviews", "otp_codes", "telegram_chats", "site_settings"].map((t) => (
          <code key={t} className="px-3 py-1.5 rounded-full bg-primary-50 text-primary-700">{t}</code>
        ))}
      </div>
    ),
  },
  {
    icon: Plug,
    title: "API های کلیدی",
    color: "bg-teal-600",
    content: (
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {[
          "/api/registrations", "/api/otp", "/api/student/enroll", "/api/student/recommendations",
          "/api/manager", "/api/admin/institutes", "/api/admin/managers", "/api/admin/finance",
          "/api/admin/settings", "/api/admin/export", "/api/telegram/webhook", "/api/telegram/setup",
        ].map((t) => (
          <code key={t} className="px-3 py-1.5 rounded-full bg-secondary-50 text-secondary-700">{t}</code>
        ))}
      </div>
    ),
  },
  {
    icon: Puzzle,
    title: "کامپوننت‌های اصلی",
    color: "bg-fuchsia-600",
    content: (
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {[
          "Navbar", "Footer", "HeroSection", "QuickAccess", "CategoryCards",
          "InstituteCard", "StatsSection", "MobileNav", "Providers",
          "InstituteBannerSlider", "CourseBannerSlider",
        ].map((t) => (
          <code key={t} className="px-3 py-1.5 rounded-full bg-fuchsia-50 text-fuchsia-700">{t}</code>
        ))}
      </div>
    ),
  },
  {
    icon: CheckCircle2,
    title: "کارهای انجام‌شده (خلاصه)",
    color: "bg-success-600",
    content: (
      <ul className="space-y-1.5 text-sm list-disc list-inside text-text-secondary">
        <li>MVP اولیه با ۱۸ آموزشگاه واقعی زبرخان و ۱۴ دوره</li>
        <li>احراز هویت با موبایل + OTP پیامکی واقعی + جلوگیری از ثبت تکراری</li>
        <li>اتصال دیتابیس ابری Neon و دیپلوی Production روی Vercel</li>
        <li>ربات تلگرام با اعلان لحظه‌ای تفکیک‌شده (مدیر کل / هر آموزشگاه)</li>
        <li>خروجی Excel چندشیتی</li>
        <li>پنل مدیر کل کامل (۷ تب) + پنل مدیر آموزشگاه کامل (۶ تب) + پنل هنرجو (۵ تب)</li>
        <li>بنر اسلایدی آموزشگاه + بنر تبلیغاتی اختصاصی هر دوره</li>
        <li>تنظیمات صفحه اصلی و پیشنهاد هوشمند توسط مدیر کل</li>
        <li>رفع باگ جهت Sidebar (راست‌چین کامل)</li>
        <li>رفع خطای ثبت دوره در پنل آموزشگاه: اعتبارسنجی عددی امن برای شهریه و ظرفیت + پشتیبانی از اعداد فارسی</li>
        <li>تکمیل مرحله ۱: سیستم استوری آموزشگاه‌ها با اسکرول افقی، مشاهده تمام‌صفحه، تایمر پیشرفت، لمس چپ/راست، seen state و مدیریت پروفایل/استوری در پنل آموزشگاه</li>
        <li>تکمیل مرحله ۲: سیستم آپلود حرفه‌ای با درصد، سرعت، ETA، وضعیت موفق/خطا و امکان لغو برای فایل‌ها</li>
        <li>تکمیل مرحله ۳: مدیریت مدارک هنرجویان با PDF/JPG/PNG، شماره مدرک، سریال، تاریخ صدور، اعتبار، دانلود و چاپ</li>
      </ul>
    ),
  },
  {
    icon: Bug,
    title: "باگ‌های شناخته‌شده",
    color: "bg-error-600",
    content: (
      <ul className="space-y-1.5 text-sm list-disc list-inside text-text-secondary">
        <li>OTP در حالت آزمایشی نمایش داده می‌شود (پنل پیامکی واقعی متصل نیست)</li>
        <li>Slug دوره‌های ساخته‌شده در پنل مدیر شامل حروف فارسی است</li>
        <li>درگاه پرداخت آنلاین متصل نیست</li>
        <li>برنامه هفتگی فقط از فیلد متنی schedule خوانده می‌شود (بدون جدول ساختاریافته)</li>
      </ul>
    ),
  },
  {
    icon: ListTodo,
    title: "کارهای باقی‌مانده",
    color: "bg-warning-600",
    content: (
      <ul className="space-y-1.5 text-sm list-disc list-inside text-text-secondary">
        <li>اتصال پنل پیامکی واقعی (Kavenegar) و درگاه پرداخت</li>
        <li>تولید خودکار PDF گواهینامه</li>
        <li>جدول اختصاصی حضور و غیاب + برنامه هفتگی ساختاریافته</li>
        <li>UI ثبت نظر و امتیاز واقعی توسط هنرجو</li>
        <li>مدیریت رشته‌ها از پنل مدیر کل</li>
      </ul>
    ),
  },
  {
    icon: Rocket,
    title: "مرحله بعدی توسعه",
    color: "bg-indigo-600",
    content: (
      <p className="text-sm text-text-secondary">
        آخرین قابلیت افزوده‌شده «بنر اسلایدی آموزشگاه + بنر تبلیغاتی دوره» و مستندسازی پروژه بود.
        در صورت نبود درخواست جدید، پیشنهاد بعدی: <b>اتصال درگاه پرداخت آنلاین</b> یا{" "}
        <b>تولید خودکار PDF گواهینامه</b>.
      </p>
    ),
  },
  {
    icon: KeyRound,
    title: "اطلاعات ورود تست (Production)",
    color: "bg-slate-700",
    content: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-[10px] bg-bg-secondary">
          <div className="font-bold text-text-primary">مدیر کل سامانه</div>
          <div className="text-text-tertiary" dir="ltr">09159513179 / 123456</div>
        </div>
        <div className="p-3 rounded-[10px] bg-bg-secondary">
          <div className="font-bold text-text-primary">مدیر آموزشگاه کامپیوتر هدف</div>
          <div className="text-text-tertiary" dir="ltr">09151112222 / manager123</div>
        </div>
      </div>
    ),
  },
];

export default function ProjectMemoryPage() {
  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-2 block">
            PROJECT MEMORY
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">
            حافظه فنی پروژه
          </h1>
          <p className="text-text-secondary">
            نسخه زنده مستندات پروژه — معادل فایل‌های PROJECT.md، CHANGELOG.md، TODO.md، DATABASE.md و API.md
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((s) => (
            <div key={s.title} className="bg-surface rounded-[20px] border border-border-default p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-[12px] ${s.color} flex items-center justify-center shrink-0`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="font-black text-text-primary text-lg">{s.title}</h2>
              </div>
              <div className="text-text-secondary leading-relaxed">{s.content}</div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
