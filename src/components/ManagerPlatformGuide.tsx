"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, ShoppingBag, Users, UserRoundCog, TrendingUp,
  Award, CheckCircle2, CalendarDays, Video, FileText, ClipboardCheck,
  MessageCircle, Bell, Images, ImagePlus, Bot, Sparkles, Wallet, BarChart3,
  ShieldCheck, Smartphone, ArrowLeft, Check, GraduationCap, Settings2,
  Headphones, Send, Globe2, LockKeyhole, Database, Rocket,
} from "lucide-react";

const managerModules = [
  {
    icon: LayoutDashboard,
    title: "داشبورد مدیریتی لحظه‌ای",
    color: "from-blue-500 to-cyan-500",
    desc: "نمای کلی عملکرد آموزشگاه بدون نیاز به گزارش‌گیری دستی.",
    items: ["آمار دوره‌ها و هنرجویان", "ثبت‌نام‌های در انتظار", "دسترسی سریع به عملیات روزانه", "نمایش وضعیت آموزشگاه و اشتراک"],
  },
  {
    icon: BookOpen,
    title: "مدیریت کامل دوره‌های حضوری",
    color: "from-indigo-500 to-violet-500",
    desc: "ساخت و ویرایش دوره از معرفی اولیه تا برنامه برگزاری.",
    items: ["عنوان، توضیحات و سرفصل‌ها", "شهریه، تخفیف، ظرفیت و سطح", "مدرس، پیش‌نیاز و زمان‌بندی", "تاریخ شروع/پایان و محاسبه برنامه", "تصویر و بنر تبلیغاتی دوره"],
  },
  {
    icon: ShoppingBag,
    title: "فروش دوره‌های آنلاین",
    color: "from-amber-500 to-orange-500",
    desc: "فروشگاه آموزشی با ساختار فصل، درس و محتوای چندرسانه‌ای.",
    items: ["تعریف فصل و درس", "ویدئو، متن و فایل ضمیمه", "قیمت اصلی و تخفیف", "گواهینامه، پشتیبانی و دسترسی مادام‌العمر", "کنترل انتشار و مشاهده خریدها"],
    note: "فعال‌سازی فروش آنلاین و سقف دوره‌ها توسط مدیر کل سامانه انجام می‌شود.",
  },
  {
    icon: Users,
    title: "مدیریت هنرجویان و ثبت‌نام‌ها",
    color: "from-emerald-500 to-teal-500",
    desc: "پرونده یکپارچه هر هنرجو به تفکیک دوره.",
    items: ["مشاهده اطلاعات و وضعیت ثبت‌نام", "تأیید یا رد درخواست", "مدیریت مدارک و گواهینامه", "ثبت پیشرفت و جلسات حضور", "ارتباط مستقیم با هنرجو"],
  },
  {
    icon: UserRoundCog,
    title: "مدیریت اساتید",
    color: "from-fuchsia-500 to-pink-500",
    desc: "معرفی حرفه‌ای مدرس و نگهداری رزومه آموزشی.",
    items: ["نام و عنوان تخصصی", "رزومه و سوابق تدریس", "تخصص‌ها و سابقه کاری", "تلفن، ایمیل، امتیاز و تصویر"],
  },
  {
    icon: CalendarDays,
    title: "تقویم جلسات و برنامه آموزشی",
    color: "from-sky-500 to-blue-600",
    desc: "برنامه‌ریزی منظم کلاس‌ها و جلسات هر دوره.",
    items: ["ثبت روز و ساعت برگزاری", "جلسات ساختاریافته دوره", "پیگیری زمان شروع و پایان", "نمایش برنامه در پنل هنرجو"],
  },
  {
    icon: CheckCircle2,
    title: "حضور و غیاب",
    color: "from-green-500 to-emerald-600",
    desc: "ثبت وضعیت حضور هنرجویان برای هر جلسه.",
    items: ["حاضر، غایب یا تأخیر", "یادداشت جلسه", "نمایش سابقه به هنرجو", "گزارش وضعیت حضور"],
  },
  {
    icon: Award,
    title: "نمرات، کارنامه و پیشرفت",
    color: "from-yellow-500 to-amber-600",
    desc: "ارزیابی آموزشی از نمره تئوری تا نتیجه نهایی.",
    items: ["نمره تئوری و عملی", "نمره نهایی و وضعیت قبولی", "کارنامه قابل مشاهده برای هنرجو", "درصد پیشرفت هر دوره"],
  },
  {
    icon: Video,
    title: "کلاس آنلاین Live",
    color: "from-red-500 to-rose-600",
    desc: "مدیریت لینک و زمان کلاس‌های زنده.",
    items: ["پشتیبانی از Skyroom، Zoom و Meet", "زمان‌بندی کلاس", "Meeting ID و رمز ورود", "نمایش مستقیم در پنل هنرجو"],
  },
  {
    icon: FileText,
    title: "تکالیف و فایل‌های آموزشی",
    color: "from-purple-500 to-indigo-600",
    desc: "تعریف تکلیف و دریافت پاسخ هنرجویان.",
    items: ["عنوان، شرح و مهلت تحویل", "فایل و تصویر ضمیمه", "مشاهده پاسخ هنرجو", "پیگیری وضعیت ارسال"],
  },
  {
    icon: ClipboardCheck,
    title: "آزمون و کوییز",
    color: "from-cyan-500 to-blue-500",
    desc: "ساخت آزمون برای ارزیابی مرحله‌ای دوره.",
    items: ["تعریف سوال و گزینه‌ها", "زمان و نمره قبولی", "ثبت تلاش‌های هنرجو", "نمایش نتیجه آزمون"],
  },
  {
    icon: MessageCircle,
    title: "چت و گروه‌های پیام‌رسان",
    color: "from-violet-500 to-fuchsia-500",
    desc: "ارتباط یکپارچه با هنرجویان داخل سامانه.",
    items: ["چت مستقیم", "ارسال ایموجی، عکس و فایل", "ساخت گروه دوره", "پیام گروهی و تاریخچه گفتگو", "وضعیت خوانده‌شدن پیام"],
  },
  {
    icon: Bell,
    title: "مرکز اعلان‌ها",
    color: "from-orange-500 to-red-500",
    desc: "ارسال اطلاعیه هدفمند به هنرجویان.",
    items: ["عنوان و متن اعلان", "ارسال به کاربران مرتبط", "نمایش اعلان خوانده‌نشده", "اطلاع‌رسانی تغییرات دوره"],
  },
  {
    icon: Images,
    title: "پروفایل، گالری و استوری",
    color: "from-pink-500 to-rose-500",
    desc: "ویترین دیجیتال آموزشگاه در صفحات عمومی سایت.",
    items: ["عکس پروفایل آموزشگاه", "گالری نمونه‌کارها", "استوری زمان‌دار", "اطلاعات تماس، مدیر و مجوز", "معرفی امکانات و سابقه"],
  },
  {
    icon: ImagePlus,
    title: "بنرهای تبلیغاتی",
    color: "from-teal-500 to-cyan-600",
    desc: "نمایش اسلایدی تصاویر در صفحه آموزشگاه و دوره.",
    items: ["بنر اسلایدی آموزشگاه", "بنر اختصاصی هر دوره", "آپلود و حذف آسان", "نمایش واکنش‌گرا در موبایل"],
  },
  {
    icon: BarChart3,
    title: "گزارش Excel",
    color: "from-lime-500 to-emerald-600",
    desc: "خروجی سریع برای مدیریت و بایگانی اطلاعات.",
    items: ["گزارش هنرجویان", "گزارش دوره‌ها", "خروجی مالی و وضعیت ثبت‌نام", "فایل قابل استفاده در Excel"],
  },
  {
    icon: Bot,
    title: "ربات اختصاصی تلگرام",
    color: "from-sky-500 to-indigo-500",
    desc: "دریافت اعلان‌ها و دسترسی سریع از طریق تلگرام.",
    items: ["کد اتصال اختصاصی", "اعلان ثبت‌نام جدید", "گزارش و آمار", "دسترسی تفکیک‌شده هر آموزشگاه"],
  },
  {
    icon: Sparkles,
    title: "استودیوی هوش مصنوعی",
    color: "from-purple-500 to-pink-500",
    desc: "تولید محتوای سریع برای تبلیغات و مدیریت آموزشگاه.",
    items: ["توضیح حرفه‌ای دوره", "پیامک تبلیغاتی", "کپشن اینستاگرام", "پاسخ‌گویی و ایده‌پردازی", "ابزارهای متنی تخصصی"],
  },
  {
    icon: Wallet,
    title: "اشتراک، ظرفیت و کمیسیون",
    color: "from-amber-500 to-yellow-500",
    desc: "نمایش شفاف پلن فعال و محدودیت‌های مصرف.",
    items: ["تاریخ شروع و انقضا", "سقف دوره و هنرجو", "مجوز فروش آنلاین", "درصد کمیسیون", "تاریخچه اشتراک"],
  },
];

const studentFeatures = [
  "دوره‌های حضوری و آنلاین من",
  "برنامه جلسات و کلاس Live",
  "تکالیف و آزمون‌ها",
  "کارنامه، نمرات و حضور و غیاب",
  "گواهینامه‌ها و مدارک",
  "شهریه، اقساط و کیف پول",
  "چت، گروه‌ها، اعلان‌ها و تیکت",
  "پروفایل، امنیت، علاقه‌مندی و رزومه",
];

const adminFeatures = [
  "مدیریت آموزشگاه‌ها و مدیران",
  "پلن‌ها، اشتراک و مجوز فروش آنلاین",
  "مدیریت ثبت‌نام و امور مالی",
  "نمودارها، تحلیل و گزارش‌ها",
  "مدیریت رشته‌ها، مناطق و سوالات متداول",
  "برگزیدگان سال و محتوای صفحه اصلی",
  "چت، تیکت و اعلان‌های سامانه",
  "ربات تلگرام و کنترل دسترسی",
];

const workflow = [
  { n: "۱", title: "ساخت حساب مدیر", text: "مدیر کل برای آموزشگاه حساب امن و کد اتصال ایجاد می‌کند." },
  { n: "۲", title: "تکمیل پروفایل", text: "مدیر اطلاعات، تصاویر، مجوز، گالری و معرفی آموزشگاه را تکمیل می‌کند." },
  { n: "۳", title: "ثبت دوره", text: "دوره حضوری یا آنلاین با قیمت، مدرس، برنامه و محتوای کامل ساخته می‌شود." },
  { n: "۴", title: "دریافت ثبت‌نام", text: "درخواست هنرجو وارد پنل شده و پس از بررسی تأیید یا رد می‌شود." },
  { n: "۵", title: "مدیریت آموزش", text: "جلسات، حضور، تکالیف، آزمون، نمره و پیشرفت ثبت می‌شوند." },
  { n: "۶", title: "ارتباط و گزارش", text: "مدیر با اعلان، چت، تلگرام و گزارش Excel فرایند را کنترل می‌کند." },
];

export default function ManagerPlatformGuide() {
  return (
    <section id="manager-capabilities" className="relative py-16 lg:py-24 overflow-hidden bg-[#061326]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-[8%] w-96 h-96 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute bottom-20 left-[5%] w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-400/20 text-primary-200 text-xs font-black mb-4"><Sparkles className="w-4 h-4" /> راهنمای جامع امکانات سامانه</span>
          <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">همه ابزارهای لازم برای مدیریت یک آموزشگاه حرفه‌ای</h2>
          <p className="text-slate-300 leading-8">از معرفی آموزشگاه و جذب هنرجو تا برگزاری کلاس، ارزیابی، ارتباط، فروش دوره آنلاین و گزارش‌گیری؛ تمام فرایندها در یک پنل یکپارچه و واکنش‌گرا قرار دارند.</p>
        </div>

        <nav className="sticky top-20 z-30 mb-12 rounded-[18px] border border-white/10 bg-[#071426]/90 backdrop-blur-xl p-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ["#manager-modules", "پنل آموزشگاه"], ["#workflow", "فرایند کار"], ["#student-experience", "امکانات هنرجو"], ["#admin-control", "مدیریت کل"], ["#security", "امنیت و زیرساخت"],
          ].map(([href, label]) => <a key={href} href={href} className="shrink-0 px-4 py-2 rounded-[11px] text-xs font-black text-slate-300 hover:text-white hover:bg-white/10 transition">{label}</a>)}
        </nav>

        <div id="manager-modules" className="scroll-mt-32">
          <div className="flex items-center gap-3 mb-7"><div className="w-11 h-11 rounded-[13px] bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center"><Settings2 className="w-5 h-5 text-white" /></div><div><h3 className="text-2xl font-black text-white">امکانات پنل مدیر آموزشگاه</h3><p className="text-xs text-slate-400 mt-1">ماژول‌های فعال و متصل به داده واقعی سامانه</p></div></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {managerModules.map((feature, index) => (
              <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 6) * 0.04 }} className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] backdrop-blur-lg p-5 hover:border-white/25 hover:-translate-y-1 transition-all">
                <div className={`w-12 h-12 rounded-[14px] bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}><feature.icon className="w-6 h-6 text-white" /></div>
                <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-black text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> فعال</div>
                <h4 className="text-base font-black text-white mb-2">{feature.title}</h4>
                <p className="text-[12px] text-slate-400 leading-6 mb-4">{feature.desc}</p>
                <ul className="space-y-2">{feature.items.map((item) => <li key={item} className="flex items-start gap-2 text-[11px] text-slate-300"><Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /><span>{item}</span></li>)}</ul>
                {feature.note && <div className="mt-4 rounded-[12px] bg-amber-500/10 border border-amber-500/20 p-2.5 text-[10px] leading-5 text-amber-200">{feature.note}</div>}
              </motion.article>
            ))}
          </div>
        </div>

        <div id="workflow" className="scroll-mt-32 mt-20">
          <div className="text-center mb-8"><h3 className="text-2xl md:text-3xl font-black text-white">مسیر کار مدیر از راه‌اندازی تا گزارش</h3><p className="text-sm text-slate-400 mt-2">فرایند استاندارد و مرحله‌به‌مرحله بدون پراکندگی ابزارها</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{workflow.map((step) => <div key={step.n} className="relative rounded-[20px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5"><span className="absolute top-4 left-4 text-4xl font-black text-white/[0.055]">{step.n}</span><div className="w-9 h-9 rounded-full bg-primary-500/15 border border-primary-400/20 text-primary-200 flex items-center justify-center font-black mb-3">{step.n}</div><h4 className="font-black text-white mb-2">{step.title}</h4><p className="text-xs text-slate-400 leading-6">{step.text}</p></div>)}</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 mt-20">
          <section id="student-experience" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-white" /></div><div><h3 className="text-xl font-black text-white">تجربه کامل هنرجو</h3><p className="text-xs text-slate-400">خدماتی که مدیر برای هنرجویان فراهم می‌کند</p></div></div>
            <div className="grid sm:grid-cols-2 gap-2.5">{studentFeatures.map((item) => <div key={item} className="flex items-center gap-2 rounded-[12px] bg-black/10 border border-white/8 p-3 text-xs text-slate-200"><CheckCircle2 className="w-4 h-4 text-cyan-300 shrink-0" />{item}</div>)}</div>
          </section>

          <section id="admin-control" className="scroll-mt-32 rounded-[28px] border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-white" /></div><div><h3 className="text-xl font-black text-white">نظارت مدیر کل سامانه</h3><p className="text-xs text-slate-400">کنترل کیفیت، دسترسی‌ها و پشتیبانی شبکه</p></div></div>
            <div className="grid sm:grid-cols-2 gap-2.5">{adminFeatures.map((item) => <div key={item} className="flex items-center gap-2 rounded-[12px] bg-black/10 border border-white/8 p-3 text-xs text-slate-200"><CheckCircle2 className="w-4 h-4 text-fuchsia-300 shrink-0" />{item}</div>)}</div>
          </section>
        </div>

        <section id="security" className="scroll-mt-32 mt-20 rounded-[30px] border border-white/10 bg-[#071426]/80 p-6 md:p-9 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/8 via-transparent to-fuchsia-500/8" />
          <div className="relative grid md:grid-cols-[1fr_auto] gap-7 items-center">
            <div><div className="flex items-center gap-3 mb-4"><LockKeyhole className="w-7 h-7 text-emerald-300" /><h3 className="text-2xl font-black text-white">امنیت، پایداری و دسترسی از هر دستگاه</h3></div><p className="text-sm text-slate-400 leading-7 mb-5">ورود امن مبتنی بر نقش، تفکیک اطلاعات هر آموزشگاه، کنترل دسترسی API، ذخیره داده در PostgreSQL ابری و رابط کاربری سازگار با موبایل و دسکتاپ، زیرساخت مدیریت روزانه را قابل اتکا می‌کند.</p><div className="flex flex-wrap gap-2">{[[ShieldCheck,"دسترسی نقش‌محور"],[Database,"دیتابیس ابری"],[Smartphone,"موبایل و دسکتاپ"],[Headphones,"پشتیبانی و تیکت"],[Globe2,"دامنه رسمی"]].map(([Icon,label]:any)=><span key={label} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-200"><Icon className="w-3.5 h-3.5 text-primary-300" />{label}</span>)}</div></div>
            <div className="flex flex-col gap-3 min-w-[220px]"><Link href="/login" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white font-black shadow-xl"><LayoutDashboard className="w-5 h-5" /> ورود به پنل مدیریت</Link><a href="tel:09159513179" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-[14px] bg-white/5 border border-white/15 text-white font-black"><Headphones className="w-5 h-5" /> درخواست مشاوره</a></div>
          </div>
        </section>

        <div className="mt-14 text-center"><Link href="/register" className="inline-flex items-center gap-2 px-7 py-4 rounded-[15px] bg-white text-slate-900 font-black shadow-2xl hover:scale-[1.03] transition-transform"><Rocket className="w-5 h-5" /> شروع راه‌اندازی آموزشگاه <ArrowLeft className="w-4 h-4" /></Link></div>
      </div>
    </section>
  );
}
