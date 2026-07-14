"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles, ArrowLeft, Rocket, Bot, Brain, Zap, GraduationCap,
  Calculator, BookOpen, Layers, Calendar, Mic, Target, AlertTriangle,
  Heart, Repeat, Compass,
  FileText, HelpCircle, ClipboardCheck, Check, UserCheck, BarChart,
  Presentation, Video, Volume2, Users,
  UserX, TrendingUp, DollarSign, Megaphone, Smile, User, Phone,
  MessageCircle, Flag, Mail, Send,
  Edit3, Globe, Search, Image as ImageIcon2, Image as InstagramIcon, Palette, LayoutGrid,
  Film, Camera, Wand2, PlaySquare,
  BarChart3, LineChart, PiggyBank, UserPlus, Award, Shield, Search as FileSearchIcon,
  Headphones, Radio, Speaker, Languages, MessageSquare,
  Settings, Bell, Clock, RefreshCw, Timer,
} from "lucide-react";
type LucideIcon = typeof Bot;

type Feature = { icon: LucideIcon; title: string; desc: string; badge?: string };
type Section = {
  id: string;
  eyebrow: string;
  title: string;
  gradient: string;
  accent: string;
  cardBg: string;
  icon: LucideIcon;
  features: Feature[];
};

const SECTIONS: Section[] = [
  {
    id: "students",
    eyebrow: "AI FOR STUDENTS",
    title: "دستیاران هوشمند هنرجویان",
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    accent: "text-blue-300",
    cardBg: "from-blue-500/10 to-indigo-500/5",
    icon: GraduationCap,
    features: [
      { icon: Bot, title: "معلم شخصی AI", desc: "دستیار ۲۴ ساعته که هر سوال درسی رو مثل یک استاد خصوصی توضیح میده" },
      { icon: Calculator, title: "حل تمرین و مسئله", desc: "عکس تمرین رو بفرست، پاسخ گام‌به‌گام همراه توضیح دریافت کن" },
      { icon: HelpCircle, title: "تولید کوییز خودکار", desc: "از هر متن یا درسی سوالات چهارگزینه‌ای، تشریحی و صحیح‌غلط بساز" },
      { icon: Layers, title: "فلش‌کارت هوشمند", desc: "کارت‌های مرور با الگوریتم spaced repetition برای حفظ ماندگار" },
      { icon: Calendar, title: "برنامه مطالعه شخصی‌سازی", desc: "بر اساس تعداد ساعت آزادت، برنامه مطالعه بهینه بساز" },
      { icon: Mic, title: "معلم صوتی", desc: "با هوش صحبت کن، سوال بپرس، توضیح صوتی حرفه‌ای بگیر" },
      { icon: Target, title: "پیش‌بینی سوالات آزمون", desc: "با تحلیل الگوهای گذشته، احتمالی‌ترین سوالات آزمون رو نشون میده" },
      { icon: AlertTriangle, title: "تشخیص نقاط ضعف", desc: "بر اساس نمرات و پاسخ‌ها، دقیقاً می‌گه کجا ضعف داری" },
      { icon: Heart, title: "مربی روزانه یادگیری", desc: "هر روز صبح چالش کوتاه، هدف روز و تشویق شخصی دریافت کن" },
      { icon: Rocket, title: "دستیار انگیزشی", desc: "وقتی خسته‌ای، پیام‌های انگیزشی متناسب با شخصیتت می‌فرسته" },
      { icon: Repeat, title: "برنامه‌ریز مرور هوشمند", desc: "قبل از فراموشی مطالب، تایمینگ دقیق مرور رو بهت اعلام می‌کنه" },
      { icon: Compass, title: "مشاور مسیر شغلی", desc: "بر اساس علاقه، مهارت و بازار کار، مسیر شغلی و دوره‌های بعدی رو پیشنهاد میده" },
    ],
  },
  {
    id: "teachers",
    eyebrow: "AI FOR TEACHERS",
    title: "ابزارهای حرفه‌ای اساتید",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    accent: "text-emerald-300",
    cardBg: "from-emerald-500/10 to-teal-500/5",
    icon: Presentation,
    features: [
      { icon: FileText, title: "طرح درس خودکار", desc: "با یک کلیک طرح درس ۹۰ دقیقه‌ای کامل با اهداف، فعالیت‌ها و ارزیابی بگیر" },
      { icon: HelpCircle, title: "بانک سوالات AI", desc: "بر اساس سرفصل، هزاران سوال متنوع و طبقه‌بندی‌شده تولید کن" },
      { icon: ClipboardCheck, title: "طراح ورقه امتحان", desc: "ورقه امتحان با بارم‌بندی، پاسخ‌نامه و کلید تصحیح در ۳۰ ثانیه" },
      { icon: Check, title: "تصحیح خودکار برگه", desc: "برگه رو عکس بگیر، AI نمره و بازخورد دقیق برای هر سوال میده" },
      { icon: UserCheck, title: "هوش حضور و غیاب", desc: "الگوی غیبت هر هنرجو تحلیل و ریسک ترک‌تحصیل بهت اعلام میشه" },
      { icon: BarChart, title: "تحلیل کیفیت دوره", desc: "بر اساس بازخورد و نمرات، نقاط قوت و ضعف دوره‌ت رو شناسایی می‌کنه" },
      { icon: Presentation, title: "طراح پاورپوینت AI", desc: "از عنوان درس، اسلایدشوی حرفه‌ای با طرح، تصاویر و متن بساز" },
      { icon: Video, title: "تولید متن ویدیو", desc: "برای ویدیوهای آموزشی، اسکریپت جذاب و مفهومی تولید کن" },
      { icon: Volume2, title: "صداگذاری AI", desc: "متن رو با صدای طبیعی فارسی مرد یا زن به صوت تبدیل کن" },
      { icon: Users, title: "دستیار کلاس آنلاین", desc: "در حین کلاس زنده، سوالات هنرجویان رو خلاصه و پاسخ پیشنهاد میده" },
      { icon: Wand2, title: "بازنویسی متن آموزشی", desc: "متن‌های سخت رو ساده و متن‌های ساده رو تخصصی بازنویسی کن" },
      { icon: BookOpen, title: "منتور تدریس", desc: "پس از هر جلسه، بازخورد سازنده درباره روش تدریست بگیر" },
    ],
  },
  {
    id: "centers",
    eyebrow: "AI FOR TRAINING CENTERS",
    title: "هوش تجاری آموزشگاه‌ها",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    accent: "text-amber-300",
    cardBg: "from-amber-500/10 to-orange-500/5",
    icon: TrendingUp,
    features: [
      { icon: UserX, title: "پیش‌بینی ترک تحصیل", desc: "هنرجویانی که احتمال انصراف دارن رو ۲ هفته قبل شناسایی کن" },
      { icon: TrendingUp, title: "پیش‌بینی ثبت‌نام", desc: "بر اساس ترند و فصل، ثبت‌نام دوره بعدی رو با دقت بالا پیش‌بینی می‌کنه" },
      { icon: DollarSign, title: "پیش‌بینی درآمد", desc: "با تحلیل داده‌های گذشته، درآمد ۳ ماه آینده رو تخمین بزن" },
      { icon: Megaphone, title: "دستیار بازاریابی", desc: "کمپین‌های تبلیغاتی هدفمند با متن، تصویر و مخاطب پیشنهادی بساز" },
      { icon: Smile, title: "تحلیل رضایت هنرجو", desc: "با تحلیل نظرات و پیام‌ها، سطح رضایت هر گروه رو بسنج" },
      { icon: User, title: "CRM هوشمند", desc: "لیدها رو خودکار امتیازدهی و اولویت‌بندی می‌کنه" },
      { icon: Phone, title: "دستیار فروش تلفنی", desc: "اسکریپت مکالمه، پاسخ اعتراض و بستن فروش رو در لحظه پیشنهاد میده" },
      { icon: MessageCircle, title: "اتوماسیون واتساپ", desc: "پیام خوش‌آمد، پیگیری و یادآوری خودکار به تمام مخاطبین" },
      { icon: InstagramIcon, title: "تولید محتوای اینستاگرام", desc: "پست، استوری و ریلز جذاب متناسب با هویت برند آموزشگاه" },
      { icon: Flag, title: "طراح کمپین AI", desc: "کمپین ۳۰ روزه با تقویم، محتوا، بودجه و KPI کامل" },
      { icon: Mail, title: "تولید ایمیل حرفه‌ای", desc: "ایمیل‌های خبرنامه، پیگیری و تبلیغاتی با نرخ باز شدن بالا" },
      { icon: Send, title: "تولید پیامک هوشمند", desc: "پیامک کوتاه، جذاب و بهینه برای دعوت، تخفیف و اطلاع‌رسانی" },
    ],
  },
  {
    id: "content",
    eyebrow: "CONTENT AI",
    title: "استودیوی محتوای هوشمند",
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
    accent: "text-fuchsia-300",
    cardBg: "from-fuchsia-500/10 to-pink-500/5",
    icon: Palette,
    features: [
      { icon: Edit3, title: "تولید مقاله بلاگ", desc: "مقاله ۱۵۰۰ کلمه‌ای SEO محور با تیتر، سرتیتر و متا در ۲ دقیقه" },
      { icon: Globe, title: "لندینگ پیج ساز", desc: "صفحه فرود کامل با هدلاین، مزایا، تستمونیال و CTA بساز" },
      { icon: Search, title: "نویسنده SEO", desc: "کلمات کلیدی، متا دیسکریپشن و ساختار SEO بهینه پیشنهاد میده" },
      { icon: ImageIcon2, title: "طراح بنر تبلیغاتی", desc: "بنر وب و شبکه اجتماعی با متن جذاب و ترکیب رنگ حرفه‌ای" },
      { icon: Palette, title: "طراح پوستر", desc: "پوستر دوره، همایش و اطلاع‌رسانی در سایزهای استاندارد" },
      { icon: LayoutGrid, title: "برنامه‌ریز شبکه اجتماعی", desc: "تقویم محتوایی ماهانه با ایده، ساعت انتشار و هشتگ" },
      { icon: Film, title: "اسکریپت‌نویس ریلز", desc: "متن ۳۰ ثانیه‌ای ویروسی برای ریلز و شورت با هوک قوی" },
      { icon: Camera, title: "تولید Thumbnail", desc: "تصویر بند انگشتی جذاب برای ویدیو با CTR بالا" },
      { icon: Wand2, title: "پرامپت‌ساز تصویر", desc: "پرامپت حرفه‌ای برای Midjourney و DALL-E تولید کن" },
      { icon: PlaySquare, title: "پرامپت‌ساز ویدیو", desc: "پرامپت برای Sora، Runway و Kling با جزئیات سینمایی" },
    ],
  },
  {
    id: "bi",
    eyebrow: "BUSINESS INTELLIGENCE",
    title: "هوش تجاری و تحلیل داده",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    accent: "text-cyan-300",
    cardBg: "from-cyan-500/10 to-blue-500/5",
    icon: BarChart3,
    features: [
      { icon: BarChart3, title: "داشبورد KPI", desc: "شاخص‌های کلیدی آموزشگاه در یک نگاه — درآمد، رضایت، رشد، تبدیل" },
      { icon: LineChart, title: "پیش‌بینی مالی", desc: "روند درآمد و هزینه ۶ ماه آینده با سناریوهای مختلف" },
      { icon: PiggyBank, title: "تحلیل درآمد", desc: "کدوم دوره، کدوم استاد و کدوم فصل بیشترین درآمد رو داره" },
      { icon: UserPlus, title: "تحلیل هنرجو", desc: "کوهورت، LTV و رفتار خرید هنرجویان" },
      { icon: Award, title: "عملکرد اساتید", desc: "رتبه‌بندی اساتید بر اساس رضایت، نتیجه و درآمدزایی" },
      { icon: Shield, title: "تحلیل رقبا", desc: "با تحلیل قیمت، دوره و بازار، جایگاه رقابتی خودت رو ببین" },
      { icon: FileSearchIcon, title: "گزارش هوشمند", desc: "گزارش خودکار هفتگی/ماهانه با insight و پیشنهاد اقدام" },
    ],
  },
  {
    id: "voice",
    eyebrow: "VOICE AI",
    title: "هوش صوتی چند زبانه",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
    accent: "text-violet-300",
    cardBg: "from-violet-500/10 to-purple-500/5",
    icon: Mic,
    features: [
      { icon: Headphones, title: "چت صوتی", desc: "با AI صحبت کن، پاسخ صوتی طبیعی دریافت کن" },
      { icon: Radio, title: "تبدیل گفتار به متن", desc: "صدای فارسی و انگلیسی رو با دقت بالا به متن تبدیل کن" },
      { icon: Speaker, title: "تبدیل متن به گفتار", desc: "متن رو با صدای انسانی، طبیعی و چند حالتی تبدیل کن" },
      { icon: Languages, title: "مترجم زنده", desc: "ترجمه لحظه‌ای صوتی بین فارسی، انگلیسی و ۴۰+ زبان" },
      { icon: Mic, title: "فرمان‌های صوتی", desc: "پنل رو با صدا کنترل کن — «دوره فتوشاپ رو باز کن»" },
    ],
  },
  {
    id: "automation",
    eyebrow: "AUTOMATION",
    title: "اتوماسیون کامل عملیات",
    gradient: "from-slate-400 via-slate-500 to-slate-700",
    accent: "text-slate-300",
    cardBg: "from-slate-500/10 to-zinc-500/5",
    icon: Settings,
    features: [
      { icon: Settings, title: "طراح فرآیند", desc: "فرآیندهای پیچیده رو با drag & drop خودکار کن" },
      { icon: Award, title: "صدور گواهی خودکار", desc: "پس از تکمیل دوره، گواهی با QR و امضا خودکار صادر میشه" },
      { icon: Bell, title: "اعلان هوشمند", desc: "پیام درست، به فرد درست، در زمان درست — بدون spam" },
      { icon: Clock, title: "زمان‌بند AI", desc: "کلاس‌ها، جلسات و رویدادها بر اساس ظرفیت خودکار زمان‌بندی میشن" },
      { icon: RefreshCw, title: "پیگیری خودکار", desc: "لیدها و مشتریان بلاتکلیف رو خودکار پیگیری کن" },
      { icon: Timer, title: "یادآوری هوشمند", desc: "یادآوری قسط، جلسه و آزمون به هنرجو و مدیر" },
      { icon: User, title: "اتوماسیون CRM", desc: "تبدیل لید به مشتری با فرآیندهای هوشمند و شخصی‌سازی" },
    ],
  },
];

const TOTAL_FEATURES = SECTIONS.reduce((acc, s) => acc + s.features.length, 0);

export default function AIShowcase() {
  return (
    <div className="relative">
      {/* Global bg */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[#04091A]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute top-1/3 left-0 w-[600px] h-[600px] rounded-full bg-blue-500/8 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(200, 100, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(200, 100, 255, 0.5) 1px, transparent 1px)`,
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative pt-36 lg:pt-44 pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto mb-8 w-24 h-24 lg:w-32 lg:h-32"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 blur-3xl opacity-70 animate-pulse" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
              <Brain className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-fuchsia-300" />
            <span className="text-xs font-black text-white tracking-widest">ZABARKHAN AI PLATFORM</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-6 leading-[1.05]"
            style={{ letterSpacing: "-0.035em" }}
          >
            <span className="bg-gradient-to-l from-fuchsia-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
              {TOTAL_FEATURES}+
            </span>{" "}
            قابلیت AI
            <br />
            که آموزش رو{" "}
            <span className="bg-gradient-to-l from-amber-200 to-yellow-400 bg-clip-text text-transparent">
              دوباره اختراع می‌کنه
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            پلتفرم هوش مصنوعی جامع برای هنرجویان، اساتید و آموزشگاه‌ها — از دستیار شخصی تا اتوماسیون
            کامل عملیات، همه چیزی که برای پیشتاز بودن نیاز داری.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-l from-fuchsia-600 via-purple-600 to-blue-600 text-white text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.03] transition-transform shadow-2xl shadow-fuchsia-500/30 group"
            >
              <Rocket className="w-5 h-5" />
              شروع رایگان AI
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <a
              href="#students"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white text-sm font-black hover:bg-white/10 transition-colors"
            >
              مشاهده تمام قابلیت‌ها
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto"
          >
            {[
              { label: "قابلیت AI", value: `${TOTAL_FEATURES}+` },
              { label: "دسته اصلی", value: `${SECTIONS.length}` },
              { label: "زبان پشتیبانی", value: "40+" },
              { label: "پاسخ‌دهی", value: "< 2s" },
            ].map((s, i) => (
              <div
                key={i}
                className="relative p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10"
              >
                <div className="text-2xl lg:text-3xl font-black bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-xs text-slate-400 font-bold mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section nav pills (sticky) */}
      <div className="sticky top-20 z-40 backdrop-blur-xl bg-[#04091A]/70 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black text-white hover:bg-white/10 transition-colors`}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.eyebrow.replace("AI FOR ", "").replace("BUSINESS INTELLIGENCE", "BI").replace("CONTENT AI", "CONTENT")}
            </a>
          ))}
        </div>
      </div>

      {/* SECTIONS */}
      {SECTIONS.map((sec, sIdx) => (
        <section id={sec.id} key={sec.id} className="relative py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section header */}
            <div className="max-w-3xl mx-auto text-center mb-14">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-l ${sec.gradient} bg-opacity-10 mb-5`}
              >
                <sec.icon className="w-4 h-4 text-white" />
                <span className="text-xs font-black text-white tracking-widest">{sec.eyebrow}</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
                style={{ letterSpacing: "-0.02em" }}
              >
                {sec.title}
              </motion.h2>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className={`mt-5 h-px w-24 mx-auto bg-gradient-to-r ${sec.gradient}`}
              />
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sec.features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: (i % 6) * 0.05 }}
                  className="group relative"
                >
                  {/* glow bg on hover */}
                  <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${sec.gradient} opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500 pointer-events-none`} />

                  {/* card */}
                  <div className="relative h-full p-6 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                    {/* internal gradient wash */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${sec.cardBg} opacity-40 pointer-events-none`} />
                    {/* corner sparkle */}
                    <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${sec.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 pointer-events-none`} />

                    <div className="relative flex items-start gap-4">
                      {/* icon */}
                      <div className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${sec.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <f.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="text-sm font-black text-white leading-tight">
                            {f.title}
                          </h3>
                          {f.badge && (
                            <span className="text-[9px] font-black bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded">
                              {f.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>

                    {/* bottom shine */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[40px] overflow-hidden bg-[#04091A] border border-white/10 p-10 lg:p-16 text-center"
          >
            {/* aurora */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{ x: [0, 60, 0], y: [0, -30, 0] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 -right-40 w-[500px] h-[500px] rounded-full bg-fuchsia-500/30 blur-[120px]"
              />
              <motion.div
                animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-blue-500/30 blur-[120px]"
              />
            </div>

            <div className="relative">
              <Sparkles className="w-10 h-10 text-fuchsia-300 mx-auto mb-5" />
              <h2
                className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5"
                style={{ letterSpacing: "-0.03em" }}
              >
                آماده‌ای{" "}
                <span className="bg-gradient-to-l from-fuchsia-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
                  آینده آموزش
                </span>{" "}
                رو تجربه کنی؟
              </h2>
              <p className="text-base md:text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
                همه {TOTAL_FEATURES}+ قابلیت هوش مصنوعی، ۳۰ روز کاملاً رایگان. بدون کارت اعتباری،
                بدون تعهد.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-2xl bg-white text-slate-900 text-sm font-black flex items-center gap-2 hover:scale-[1.03] transition-transform shadow-2xl"
                >
                  <Rocket className="w-5 h-5" />
                  فعال‌سازی AI رایگان
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-black hover:bg-white/15 transition-colors"
                >
                  مشاهده پلن‌ها
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
