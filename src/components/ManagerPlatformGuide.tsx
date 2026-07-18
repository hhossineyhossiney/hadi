"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowLeft,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Database,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderOpen,
  Gauge,
  Globe2,
  GraduationCap,
  Heart,
  HelpCircle,
  History,
  ImagePlus,
  Images,
  KeyRound,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LockKeyhole,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Paperclip,
  Phone,
  PlayCircle,
  Receipt,
  Rocket,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingUp,
  User,
  UserCheck,
  UserCog,
  UserRoundCog,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";

type CategoryKey =
  | "all"
  | "foundation"
  | "courses"
  | "learning"
  | "finance"
  | "communication"
  | "showcase"
  | "smart";

type ManagerModule = {
  order: number;
  category: Exclude<CategoryKey, "all">;
  icon: LucideIcon;
  title: string;
  desc: string;
  location: string;
  color: string;
  items: string[];
  result: string;
  note?: string;
};

const categoryOptions: { key: CategoryKey; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "همه بخش‌ها", icon: Layers3 },
  { key: "foundation", label: "مدیریت پایه", icon: LayoutDashboard },
  { key: "courses", label: "دوره و فروش", icon: BookOpen },
  { key: "learning", label: "فرایند آموزش", icon: GraduationCap },
  { key: "finance", label: "مالی و گزارش", icon: Wallet },
  { key: "communication", label: "ارتباطات", icon: MessageCircle },
  { key: "showcase", label: "ویترین آموزشگاه", icon: Images },
  { key: "smart", label: "ابزار هوشمند", icon: Sparkles },
];

const categoryNames: Record<Exclude<CategoryKey, "all">, string> = {
  foundation: "مدیریت پایه",
  courses: "دوره و فروش",
  learning: "فرایند آموزش",
  finance: "مالی و گزارش",
  communication: "ارتباطات",
  showcase: "ویترین آموزشگاه",
  smart: "ابزار هوشمند",
};

const managerModules: ManagerModule[] = [
  {
    order: 1,
    category: "foundation",
    icon: LayoutDashboard,
    title: "داشبورد مدیریتی",
    desc: "تصویر لحظه‌ای از وضعیت آموزشگاه برای شروع سریع کارهای روزانه.",
    location: "منوی پنل ← داشبورد",
    color: "from-blue-500 to-cyan-500",
    items: [
      "تعداد کل هنرجویان و تفکیک ثبت‌نام‌های در انتظار و تأییدشده",
      "نمایش درآمد تخمینی بر اساس ثبت‌نام‌ها و شهریه دوره‌ها",
      "تعداد دوره‌های فعال و امتیاز فعلی آموزشگاه",
      "مشاهده اطلاعات آموزشگاه متصل به حساب مدیر",
      "دسترسی سریع و واکنش‌گرا در موبایل و دسکتاپ",
    ],
    result: "مدیر بدون جمع‌آوری دستی اطلاعات، مهم‌ترین شاخص‌های روز را یکجا می‌بیند.",
  },
  {
    order: 2,
    category: "smart",
    icon: Sparkles,
    title: "استودیوی هوش مصنوعی مدیر",
    desc: "چهار ابزار متنی آماده برای تولید محتوا و پاسخ‌گویی سریع‌تر.",
    location: "منوی پنل ← استودیوی AI",
    color: "from-fuchsia-500 to-purple-600",
    items: [
      "تولید توضیح حرفه‌ای و سئوشده برای معرفی دوره",
      "ساخت پیامک تبلیغاتی کوتاه با دعوت به اقدام",
      "تولید کپشن اینستاگرام همراه هشتگ و CTA",
      "گفت‌وگو با دستیار مدیر برای ایده‌پردازی و حل مسئله",
      "پیشنهادهای آماده برای شروع سریع هر نوع تولید محتوا",
    ],
    result: "زمان آماده‌سازی متن‌های تبلیغاتی و معرفی دوره از ساعت‌ها به چند دقیقه کاهش پیدا می‌کند.",
  },
  {
    order: 3,
    category: "foundation",
    icon: Award,
    title: "پلن اشتراک و ظرفیت مصرف",
    desc: "نمای شفاف از دسترسی‌های فعال، محدودیت‌ها و تاریخچه اشتراک آموزشگاه.",
    location: "منوی پنل ← پلن اشتراک من",
    color: "from-amber-500 to-orange-500",
    items: [
      "نام، توضیح، تاریخ شروع و تاریخ پایان پلن فعلی",
      "نمایش سقف دوره‌ها و تعداد هنرجویان مجاز",
      "مشاهده مجوز و سقف دوره‌های فروش آنلاین",
      "نمایش درصد کمیسیون فروش آنلاین سامانه",
      "مقایسه پلن‌های قابل ارتقا و مشاهده تاریخچه اشتراک‌ها",
    ],
    result: "مدیر دقیقاً می‌داند چه امکاناتی فعال است و چه مقدار از ظرفیت پلن باقی مانده است.",
  },
  {
    order: 4,
    category: "courses",
    icon: BookOpen,
    title: "مدیریت کامل دوره‌های حضوری",
    desc: "ثبت، ویرایش، انتشار و کنترل ثبت‌نام هر دوره از یک فرم کامل.",
    location: "منوی پنل ← مدیریت دوره‌ها",
    color: "from-indigo-500 to-violet-600",
    items: [
      "عنوان، رشته، توضیح کوتاه کارت و توضیحات کامل صفحه دوره",
      "شهریه، قیمت قبل از تخفیف، ظرفیت و سطح دوره",
      "مدت، تاریخ شروع، برنامه هفتگی و تعداد کل جلسات",
      "نام مدرس، عنوان تخصصی مدرس و پیش‌نیازهای دوره",
      "ثبت سرفصل‌های آموزشی به‌صورت فهرست مرحله‌ای",
      "تصویر اصلی و مجموعه بنرهای اختصاصی هر دوره",
      "باز یا بسته‌کردن دستی ثبت‌نام، تعیین مهلت و ویرایش ظرفیت",
      "ویرایش یا حذف دوره با کنترل دسترسی آموزشگاه",
    ],
    result: "اطلاعات ثبت‌شده مستقیماً در کارت و صفحه عمومی دوره برای هنرجو نمایش داده می‌شود.",
  },
  {
    order: 5,
    category: "courses",
    icon: ShoppingBag,
    title: "فروش دوره‌های آنلاین و ویدئویی",
    desc: "ساخت فروشگاه محتوای آموزشی با فصل‌بندی، درس و قفل خرید.",
    location: "منوی پنل ← فروش آنلاین دوره",
    color: "from-orange-500 to-red-500",
    items: [
      "نمایش وضعیت مجوز فروش، سقف مجاز و درصد کمیسیون",
      "ثبت عنوان، سطح، توضیح، قیمت، تخفیف، مدرس و کاور دوره",
      "ساخت، ویرایش و حذف فصل همراه توضیح و تصویر اختصاصی",
      "افزودن درس ویدئویی با مدت، توضیح و تصویر درس",
      "پشتیبانی از لینک مستقیم، آپارات، YouTube، Vimeo و Google Drive",
      "تعیین فصل یا درس رایگان برای پیش‌نمایش قبل از خرید",
      "انتشار یا بازگرداندن دوره به پیش‌نویس و مشاهده تعداد خرید",
      "قفل محتوای پولی و نمایش خریدها در پنل هنرجو",
    ],
    result: "آموزشگاه می‌تواند علاوه بر کلاس حضوری، محتوای آموزشی خود را به محصول دیجیتال تبدیل کند.",
    note: "با اختصاص پلن، دسترسی فروش آنلاین، سقف دوره‌ها و کمیسیون همان پلن خودکار اعمال می‌شود؛ مجوز جداگانه لازم نیست.",
  },
  {
    order: 6,
    category: "foundation",
    icon: Users,
    title: "هنرجویان، ثبت‌نام‌ها و پرونده یکپارچه",
    desc: "مدیریت کامل هر ثبت‌نام به تفکیک دوره، همراه مدارک و امور مالی.",
    location: "منوی پنل ← لیست هنرجویان",
    color: "from-emerald-500 to-teal-600",
    items: [
      "گروه‌بندی هنرجویان بر اساس دوره و نمایش تعداد هر گروه",
      "جست‌وجو بر اساس نام، موبایل یا عنوان دوره و فیلتر وضعیت",
      "تأیید یا رد درخواست ثبت‌نام و مشاهده تاریخ درخواست",
      "ویرایش نام، شماره موبایل، ایمیل و یادداشت داخلی مدیر",
      "مشاهده و مدیریت مدارک بارگذاری‌شده هنرجو",
      "بارگذاری، مشاهده و دانلود گواهینامه هر هنرجو",
      "تعریف اقساط، هزینه مدرک، آزمون، آزمون مجدد، دهک دولتی و هزینه اضافه",
      "تأیید پرداخت دستی، لغو، بخشودگی یا حذف ردیف هزینه",
      "حذف کنترل‌شده ثبت‌نام و اطلاعات وابسته پس از تأیید مدیر",
    ],
    result: "تمام اطلاعات آموزشی، هویتی، مدرک و وضعیت مالی هنرجو در یک پرونده قابل پیگیری است.",
  },
  {
    order: 7,
    category: "learning",
    icon: UserRoundCog,
    title: "مدیریت اساتید",
    desc: "ساخت رزومه منظم برای مدرس‌ها و استفاده از آن در فرایند آموزشی.",
    location: "منوی پنل ← مدیریت اساتید",
    color: "from-pink-500 to-rose-600",
    items: [
      "ثبت نام و عنوان تخصصی مدرس",
      "شماره تماس، ایمیل و تصویر پروفایل",
      "زندگی‌نامه، رزومه و سوابق تدریس",
      "ثبت تخصص‌ها و تعداد سال‌های تجربه",
      "ثبت امتیاز و فعال یا غیرفعال‌کردن مدرس",
      "ویرایش و حذف اطلاعات مدرس در پنل آموزشگاه",
    ],
    result: "اطلاعات مدرس‌ها استاندارد می‌شود و هنگام معرفی دوره یا ثبت ارزیابی در دسترس مدیر است.",
  },
  {
    order: 8,
    category: "learning",
    icon: TrendingUp,
    title: "وضعیت پیشرفت هنرجویان",
    desc: "اندازه‌گیری روند یادگیری هر هنرجو در هر دوره.",
    location: "منوی پنل ← وضعیت پیشرفت هنرجویان",
    color: "from-lime-500 to-emerald-600",
    items: [
      "مشاهده هنرجویان تأییدشده هر دوره",
      "ثبت و ویرایش درصد پیشرفت از صفر تا صد",
      "ثبت تعداد جلسات شرکت‌کرده هنرجو",
      "نمایش پیشرفت به‌صورت قابل فهم در پنل هنرجو",
      "ارسال خودکار اعلان پس از به‌روزرسانی پیشرفت",
    ],
    result: "مدیر و هنرجو هر دو یک برداشت مشترک و به‌روز از وضعیت پیشرفت دوره دارند.",
  },
  {
    order: 9,
    category: "learning",
    icon: Award,
    title: "ثبت نمرات و کارنامه",
    desc: "ارزیابی ساختاریافته تئوری و عملی با نتیجه قبولی.",
    location: "منوی پنل ← ثبت نمرات و کارنامه",
    color: "from-yellow-500 to-amber-600",
    items: [
      "انتخاب هنرجو و دوره و ثبت موضوع ارزیابی",
      "ثبت جداگانه نمره تئوری، عملی و نمره نهایی",
      "تعیین نمره کل و حد نصاب قبولی",
      "اتصال ارزیابی به مدرس و افزودن توضیحات",
      "ویرایش یا حذف رکورد نمره",
      "نمایش کارنامه و وضعیت قبولی در پنل هنرجو",
    ],
    result: "سوابق ارزیابی پراکنده حذف می‌شود و کارنامه هر هنرجو همیشه قابل مشاهده است.",
  },
  {
    order: 10,
    category: "learning",
    icon: UserCheck,
    title: "حضور و غیاب جلسه‌ای",
    desc: "ثبت گروهی وضعیت هنرجویان در تاریخ مشخص برای هر دوره.",
    location: "منوی پنل ← حضور و غیاب",
    color: "from-green-500 to-emerald-600",
    items: [
      "انتخاب دوره و تاریخ جلسه",
      "بارگذاری خودکار فهرست هنرجویان تأییدشده همان دوره",
      "ثبت وضعیت حاضر، غایب، تأخیر یا غیبت با اجازه",
      "ذخیره گروهی وضعیت تمام هنرجویان یک جلسه",
      "مشاهده سابقه حضور و غیاب در پنل هنرجو",
      "دریافت خروجی Excel کامل حضور و غیاب",
    ],
    result: "ثبت حضور کلاس سریع، استاندارد و قابل گزارش می‌شود.",
  },
  {
    order: 11,
    category: "learning",
    icon: CalendarDays,
    title: "تقویم جلسات دوره‌ها",
    desc: "برنامه‌ریزی دقیق جلسه‌های حضوری یا آنلاین هر دوره.",
    location: "منوی پنل ← تقویم جلسات دوره‌ها",
    color: "from-sky-500 to-blue-600",
    items: [
      "انتخاب دوره و ثبت شماره و عنوان جلسه",
      "تعیین تاریخ، ساعت شروع و مدت جلسه",
      "مشخص‌کردن حضوری یا آنلاین بودن جلسه",
      "ثبت لینک ورود برای جلسه‌های آنلاین",
      "ویرایش یا حذف برنامه ثبت‌شده",
      "نمایش جلسه‌های آینده در داشبورد و تقویم هنرجو",
    ],
    result: "هنرجو برنامه به‌روز کلاس را مستقیماً در پنل خود می‌بیند و سردرگمی زمانی کاهش می‌یابد.",
  },
  {
    order: 12,
    category: "learning",
    icon: Video,
    title: "کلاس آنلاین Live",
    desc: "ساخت و زمان‌بندی جلسه زنده با اطلاعات ورود کامل.",
    location: "منوی پنل ← کلاس‌های آنلاین (Live)",
    color: "from-red-500 to-rose-600",
    items: [
      "اتصال کلاس زنده به دوره و ثبت عنوان و توضیح",
      "ثبت تاریخ، ساعت و مدت زمان جلسه",
      "پشتیبانی از Skyroom، Zoom، Google Meet و سرویس سفارشی",
      "ذخیره لینک جلسه، Meeting ID و رمز ورود",
      "ویرایش، حذف یا مدیریت وضعیت کلاس",
      "نمایش لینک و جزئیات ورود فقط برای هنرجوی مرتبط",
    ],
    result: "اطلاعات کلاس آنلاین در یک محل رسمی ثبت می‌شود و هنرجو برای ورود به پیام‌های پراکنده وابسته نیست.",
  },
  {
    order: 13,
    category: "learning",
    icon: FileText,
    title: "تکالیف و بررسی پاسخ‌ها",
    desc: "تعریف تمرین، دریافت پاسخ و ثبت بازخورد آموزشی.",
    location: "منوی پنل ← مدیریت تکالیف",
    color: "from-purple-500 to-indigo-600",
    items: [
      "اتصال تکلیف به دوره با عنوان و شرح کامل",
      "تعیین مهلت تحویل و حداکثر نمره",
      "مشاهده پاسخ متنی و فایل ارسالی هنرجو",
      "ثبت نمره، بازخورد و وضعیت بررسی هر پاسخ",
      "مشاهده تعداد ارسال‌ها و پاسخ‌های در انتظار",
      "ویرایش یا حذف تکلیف و مشاهده نتیجه در پنل هنرجو",
    ],
    result: "چرخه تعریف تمرین تا بازخورد و نمره‌دهی کاملاً داخل سامانه انجام می‌شود.",
  },
  {
    order: 14,
    category: "learning",
    icon: ClipboardCheck,
    title: "آزمون‌های چندگزینه‌ای",
    desc: "ارزیابی آنلاین با تصحیح خودکار و آمار نتیجه.",
    location: "منوی پنل ← مدیریت آزمون‌ها",
    color: "from-cyan-500 to-blue-500",
    items: [
      "تعریف آزمون برای دوره با عنوان و توضیح",
      "تعیین زمان آزمون، نمره قبولی و سقف تلاش",
      "ساخت سوال‌های چهارگزینه‌ای و مشخص‌کردن پاسخ درست",
      "تعیین امتیاز هر سوال و محاسبه خودکار نتیجه",
      "مشاهده تعداد شرکت‌کنندگان و قبول‌شده‌ها",
      "نمایش نتیجه و سابقه تلاش در پنل هنرجو",
    ],
    result: "ارزیابی مرحله‌ای بدون تصحیح دستی انجام می‌شود و نتیجه بلافاصله قابل پیگیری است.",
  },
  {
    order: 15,
    category: "communication",
    icon: MessageCircle,
    title: "گروه‌های پیام‌رسان دوره",
    desc: "گفت‌وگوی گروهی ساختاریافته برای هر کلاس یا دوره.",
    location: "منوی پنل ← گروه‌های پیام‌رسان",
    color: "from-violet-500 to-fuchsia-600",
    items: [
      "ساخت گروه با عنوان، توضیح و نوع گروه",
      "اتصال گروه به یک دوره مشخص",
      "افزودن خودکار هنرجویان تأییدشده همان دوره",
      "ارسال و مشاهده پیام‌های گروهی با تاریخچه",
      "نمایش گروه در بخش گروه‌های چت هنرجو",
      "مدیریت اعضا و حذف گروه توسط مدیر آموزشگاه",
    ],
    result: "ارتباطات هر دوره از چت‌های شخصی جدا می‌شود و تاریخچه آموزشی قابل دسترس باقی می‌ماند.",
  },
  {
    order: 16,
    category: "finance",
    icon: FileSpreadsheet,
    title: "گزارش‌گیری حرفه‌ای Excel",
    desc: "شش خروجی فارسی و آماده بایگانی برای کنترل مدیریتی.",
    location: "منوی پنل ← گزارش‌گیری Excel",
    color: "from-emerald-500 to-green-600",
    items: [
      "گزارش هنرجویان: مشخصات، دوره، وضعیت، پیشرفت و تاریخ ثبت‌نام",
      "گزارش دوره‌ها: ظرفیت، شهریه، مدرس و آمار ثبت‌نام",
      "گزارش نمرات: تئوری، عملی، نهایی و وضعیت قبولی",
      "گزارش حضور و غیاب: تاریخ و وضعیت هر هنرجو",
      "گزارش درآمد فروش آنلاین: مبلغ، کمیسیون و خالص دریافتی",
      "گزارش شهریه و اقساط: هزینه‌ها، سررسید و وضعیت پرداخت",
      "خروجی xlsx با ستون‌های فارسی و سازگار با Excel و Google Sheets",
    ],
    result: "گزارش‌های اصلی با یک کلیک آماده دانلود، چاپ، تحلیل یا بایگانی می‌شوند.",
  },
  {
    order: 17,
    category: "communication",
    icon: Bell,
    title: "ارسال اعلان هدفمند",
    desc: "اطلاع‌رسانی داخل سامانه به همه هنرجویان یا یک دوره مشخص.",
    location: "منوی پنل ← ارسال اعلان",
    color: "from-orange-500 to-amber-600",
    items: [
      "ثبت عنوان و متن کامل اعلان",
      "انتخاب نوع اعلان متناسب با موضوع پیام",
      "ارسال به همه هنرجویان آموزشگاه یا هنرجویان یک دوره",
      "نمایش تعداد دریافت‌کنندگان پس از ارسال",
      "نمایش نشان اعلان خوانده‌نشده در پنل هنرجو",
      "مناسب برای تغییر برنامه، یادآوری آزمون و اطلاعیه فوری",
    ],
    result: "پیام مهم مستقیماً در پنل افراد مرتبط دیده می‌شود و اطلاع‌رسانی هدفمند باقی می‌ماند.",
  },
  {
    order: 18,
    category: "showcase",
    icon: Images,
    title: "گالری تصاویر و نمونه‌کارها",
    desc: "نمایش کیفیت محیط، کلاس‌ها و خروجی هنرجویان در صفحه عمومی.",
    location: "منوی پنل ← گالری نمونه‌کارها",
    color: "from-pink-500 to-rose-500",
    items: [
      "افزودن تصویر به گالری اختصاصی آموزشگاه",
      "نمایش خودکار تصاویر در صفحه عمومی آموزشگاه",
      "چیدمان واکنش‌گرا برای موبایل و دسکتاپ",
      "حذف آسان تصاویر قدیمی از پنل",
      "کنترل حجم هر تصویر تا ۵۰۰ کیلوبایت",
    ],
    result: "هنرجو پیش از ثبت‌نام با فضای آموزشگاه و نمونه فعالیت‌های واقعی آن آشنا می‌شود.",
  },
  {
    order: 19,
    category: "showcase",
    icon: ImagePlus,
    title: "بنر اسلایدی آموزشگاه و دوره",
    desc: "ساخت ویترین تصویری حرفه‌ای در بالای صفحه‌های عمومی.",
    location: "منوی پنل ← بنر اسلایدی آموزشگاه / مدیریت دوره‌ها",
    color: "from-teal-500 to-cyan-600",
    items: [
      "افزودن حداکثر ۷ اسلاید برای صفحه اختصاصی آموزشگاه",
      "کنترل حجم هر بنر آموزشگاه تا ۸۰۰ کیلوبایت",
      "نمایش خودکار بنرها به‌صورت اسلایدر واکنش‌گرا",
      "افزودن مجموعه بنر جداگانه برای هر دوره حضوری",
      "حذف و جایگزینی ساده تصاویر از پنل مدیریت",
    ],
    result: "مهم‌ترین پیام‌های تبلیغاتی آموزشگاه در بخش پرمشاهده صفحه اختصاصی نمایش داده می‌شوند.",
  },
  {
    order: 20,
    category: "communication",
    icon: MessageCircle,
    title: "چت مستقیم با هنرجویان",
    desc: "کانال رسمی گفت‌وگوی یک‌به‌یک داخل سامانه.",
    location: "منوی پنل ← چت با هنرجویان",
    color: "from-blue-500 to-indigo-600",
    items: [
      "ساخت رشته گفت‌وگو بین هنرجو و آموزشگاه مرتبط",
      "نمایش تاریخچه پیام‌ها و وضعیت خوانده‌شدن",
      "ارسال متن و ایموجی",
      "ارسال تصویر، GIF، PDF، TXT، DOC و DOCX",
      "فشرده‌سازی تصویر و پیش‌نمایش یا دانلود فایل پیوست",
      "رابط موبایلی پایدار با دکمه بستن و بازگشت بر اساس نقش",
    ],
    result: "پرسش‌های هنرجو، هماهنگی کلاس و تبادل فایل در یک کانال رسمی و قابل پیگیری انجام می‌شود.",
  },
  {
    order: 21,
    category: "showcase",
    icon: Building2,
    title: "پروفایل عمومی، عکس و استوری",
    desc: "کنترل هویت و اطلاعاتی که کاربران در سایت از آموزشگاه می‌بینند.",
    location: "منوی پنل ← پروفایل و استوری",
    color: "from-fuchsia-500 to-pink-600",
    items: [
      "ثبت نام و عنوان مدیر، شماره مجوز و سال تأسیس",
      "ویرایش موبایل، تلفن ثابت، آدرس و معرفی کوتاه آموزشگاه",
      "ثبت فهرست امکانات و مزیت‌های آموزشگاه",
      "آپلود و برش عکس پروفایل برای هدر و نوار استوری",
      "انتشار استوری تصویری یا ویدئویی با انقضای خودکار",
      "مدیریت حداکثر ۱۰ استوری فعال و تمدید ۲۴ ساعته",
      "نمایش اطلاعات به‌روز در کارت و صفحه اختصاصی آموزشگاه",
    ],
    result: "آموزشگاه بدون نیاز به تغییر کد، ویترین و اطلاعات تماس خود را همیشه به‌روز نگه می‌دارد.",
  },
  {
    order: 22,
    category: "communication",
    icon: Send,
    title: "ربات اختصاصی تلگرام",
    desc: "دریافت سریع اعلان‌ها و دسترسی به اطلاعات آموزشگاه در تلگرام.",
    location: "منوی پنل ← ربات تلگرام",
    color: "from-sky-500 to-indigo-500",
    items: [
      "کد اتصال اختصاصی و تفکیک‌شده برای هر آموزشگاه",
      "اتصال حساب مدیر به ربات سامانه",
      "دریافت اعلان فوری ثبت‌نام جدید",
      "مشاهده فهرست هنرجویان از طریق دستورات ربات",
      "دسترسی به آمار و اطلاعات آموزشگاه متصل",
      "راهنمای مرحله‌به‌مرحله اتصال داخل پنل",
    ],
    result: "مدیر حتی خارج از پنل وب، از رویدادهای مهم آموزشگاه باخبر می‌شود.",
  },
  {
    order: 23,
    category: "communication",
    icon: Star,
    title: "مدیریت نظرات و امتیازها",
    desc: "سامانه واقعی و قابل مدیریت نظرات برای آموزشگاه، دوره حضوری و دوره آنلاین.",
    location: "منوی پنل ← مدیریت نظرات و امتیازها",
    color: "from-amber-400 to-orange-600",
    items: [
      "دریافت نظر واقعی فقط از هنرجوی تأییدشده یا خریدار دوره",
      "مشاهده نظرات در انتظار، منتشرشده و ردشده",
      "تأیید، رد، ویرایش یا حذف نظر توسط مدیر آموزشگاه",
      "ثبت پاسخ رسمی آموزشگاه زیر نظر هنرجو",
      "نمایش امتیاز و تعداد نظر روی کارت‌های عمومی",
      "نظرهای نمونه مرتبط برای آموزش کار با بخش مدیریت",
      "محاسبه خودکار میانگین امتیاز پس از هر تغییر",
    ],
    result: "امتیازها از رکوردهای واقعی پایگاه داده محاسبه می‌شوند و مدیر کنترل کامل فرایند انتشار و پاسخ‌گویی را دارد.",
  },
];

const studentGroups: {
  icon: LucideIcon;
  title: string;
  color: string;
  items: { title: string; desc: string }[];
}[] = [
  {
    icon: GraduationCap,
    title: "یادگیری و ارزیابی",
    color: "from-blue-500 to-cyan-500",
    items: [
      { title: "داشبورد هنرجو", desc: "آمار دوره فعال، ساعات آموزش، مدارک، موجودی و میان‌برهای مهم." },
      { title: "دوره‌های حضوری من", desc: "مشاهده وضعیت ثبت‌نام، اطلاعات دوره و آموزشگاه." },
      { title: "دوره‌های آنلاین خریداری‌شده", desc: "دسترسی به فصل‌ها، درس‌های بازشده و ادامه یادگیری." },
      { title: "معلم هوشمند AI", desc: "پرسش درسی و دریافت توضیح مرحله‌به‌مرحله و تمرین." },
      { title: "کلاس Live", desc: "مشاهده زمان، سرویس، لینک و اطلاعات ورود به کلاس زنده." },
      { title: "تکالیف", desc: "مشاهده مهلت، ارسال پاسخ و فایل و دریافت نمره و بازخورد." },
      { title: "آزمون‌ها", desc: "شرکت در کوییز، مشاهده نتیجه و کنترل تعداد تلاش." },
      { title: "کارنامه و نمرات", desc: "مشاهده نمره تئوری، عملی، نهایی و وضعیت قبولی." },
      { title: "حضور و غیاب", desc: "مشاهده سابقه حاضر، غایب، تأخیر و غیبت موجه." },
      { title: "پیشرفت و تقویم", desc: "درصد پیشرفت، جلسه‌های شرکت‌کرده و برنامه کلاس‌های آینده." },
    ],
  },
  {
    icon: MessageCircle,
    title: "ارتباط و پشتیبانی",
    color: "from-violet-500 to-fuchsia-500",
    items: [
      { title: "چت با آموزشگاه", desc: "گفت‌وگوی مستقیم و ارسال متن، تصویر و فایل." },
      { title: "گروه‌های دوره", desc: "حضور در گروه کلاس و مشاهده پیام‌های گروهی." },
      { title: "اعلان‌ها", desc: "دریافت اطلاعیه‌های مدیر و شمارنده پیام‌های خوانده‌نشده." },
      { title: "تیکت پشتیبانی", desc: "ایجاد درخواست، مشاهده پاسخ‌ها و پیگیری وضعیت حل مشکل." },
    ],
  },
  {
    icon: Wallet,
    title: "مالی و مدارک",
    color: "from-emerald-500 to-teal-500",
    items: [
      { title: "شهریه و اقساط", desc: "مشاهده مبلغ، سررسید، وضعیت و جزئیات هزینه‌های دوره." },
      { title: "پرداخت", desc: "پرداخت از کیف پول یا درگاه آنلاین در صورت فعال‌بودن سرویس پرداخت." },
      { title: "کیف پول", desc: "مشاهده موجودی و تاریخچه تراکنش‌های مالی." },
      { title: "گواهینامه‌ها", desc: "مشاهده و دانلود مدرک بارگذاری‌شده توسط آموزشگاه." },
    ],
  },
  {
    icon: User,
    title: "پروفایل و سابقه شخصی",
    color: "from-amber-500 to-orange-500",
    items: [
      { title: "علاقه‌مندی‌ها", desc: "ذخیره دوره‌ها برای بررسی و تصمیم‌گیری بعدی." },
      { title: "رزومه و نمونه‌کار", desc: "ثبت عنوان، توضیح، تصویر و لینک نمونه فعالیت‌ها." },
      { title: "ویرایش پروفایل", desc: "به‌روزرسانی اطلاعات فردی و ارتباطی." },
      { title: "امنیت", desc: "تغییر رمز عبور و مدیریت ورود امن به حساب." },
      { title: "تاریخچه فعالیت", desc: "مشاهده رویدادهای مهم ثبت‌شده در حساب هنرجو." },
    ],
  },
];

const adminFeatures: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: LayoutDashboard, title: "داشبورد کل شبکه", desc: "آمار دوره، هنرجو، آموزشگاه، درآمد و ثبت‌نام‌های روزانه." },
  { icon: BarChart3, title: "نمودار و تحلیل", desc: "روند ثبت‌نام، درآمد، رشد و شاخص‌های عملکرد سامانه." },
  { icon: LifeBuoy, title: "تیکت‌های پشتیبانی", desc: "پاسخ، تغییر وضعیت و پیگیری درخواست کاربران." },
  { icon: Award, title: "پلن‌ها و اشتراک", desc: "قیمت، مدت، ظرفیت، ویژگی‌ها، کمیسیون و پلن محبوب." },
  { icon: Building2, title: "آموزشگاه‌ها", desc: "ایجاد، ویرایش، فعال‌سازی و نظارت بر اطلاعات مراکز." },
  { icon: Star, title: "برگزیدگان سال", desc: "مدیریت آموزشگاه‌ها و چهره‌های منتخب صفحه اصلی." },
  { icon: UserCog, title: "مدیران آموزشگاه", desc: "ساخت حساب، اتصال مدیر به آموزشگاه و کنترل دسترسی." },
  { icon: ClipboardCheck, title: "ثبت‌نام‌ها", desc: "نمای کلی و کنترل وضعیت ثبت‌نام‌های شبکه." },
  { icon: Star, title: "نظرات و امتیازها", desc: "نظارت، ویرایش، انتشار یا حذف نظرات تمام آموزشگاه‌ها و دوره‌ها." },
  { icon: ShieldCheck, title: "فروش آنلاین خودکار", desc: "اعمال خودکار دسترسی، سقف و کمیسیون از پلن و کنترل نشان ویژه دوره آنلاین." },
  { icon: Wallet, title: "مالی و درآمد", desc: "درآمد، فروش، کمیسیون و گزارش مالی کل سامانه." },
  { icon: MessageCircle, title: "چت با آموزشگاه‌ها", desc: "ارتباط مستقیم مدیر کل با مدیر هر مرکز." },
  { icon: BookOpen, title: "رشته‌ها", desc: "مدیریت دسته‌بندی و رشته‌های قابل نمایش در سایت." },
  { icon: MapPin, title: "مناطق", desc: "مدیریت محدوده‌های جغرافیایی و فیلتر آموزشگاه‌ها." },
  { icon: HelpCircle, title: "سوالات متداول", desc: "ویرایش محتوای پرسش و پاسخ عمومی سایت." },
  { icon: Settings2, title: "صفحه اصلی", desc: "کنترل محتوای منتخب و تنظیمات نمای اصلی سامانه." },
  { icon: Send, title: "ربات و اعلان‌ها", desc: "راه‌اندازی وب‌هوک تلگرام و کنترل اطلاع‌رسانی شبکه." },
];

const publicTouchpoints: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Store, title: "کارت آموزشگاه", desc: "نام، تصویر، منطقه، رشته‌ها، امتیاز و اطلاعات کلیدی در فهرست عمومی." },
  { icon: Building2, title: "صفحه اختصاصی", desc: "معرفی، تماس، آدرس، مجوز، امکانات، گالری، بنر، دوره‌ها و مدرس‌ها." },
  { icon: BookOpen, title: "کارت و صفحه دوره", desc: "شهریه، تخفیف، ظرفیت، سطح، مدرس، برنامه، سرفصل و پیش‌نیازها." },
  { icon: Search, title: "جست‌وجو و فیلتر", desc: "پیداشدن آموزشگاه و دوره بر اساس نام، رشته، منطقه و عبارت جست‌وجو." },
  { icon: PlayCircle, title: "فروشگاه آنلاین", desc: "معرفی دوره ویدئویی، پیش‌نمایش رایگان، خرید و دسترسی به محتوای قفل‌شده." },
  { icon: Camera, title: "استوری و بنر", desc: "حضور تصویری آموزشگاه در صفحه اصلی و صفحه اختصاصی برای معرفی رویدادها." },
  { icon: Bot, title: "مشاور هوشمند سایت", desc: "پاسخ مستقیم بر اساس داده‌های زنده دوره‌ها، قیمت‌ها، مدرس‌ها و اطلاعات تماس." },
  { icon: Smartphone, title: "تجربه موبایل", desc: "کارت‌ها، فرم ثبت‌نام، چت، پنل‌ها و اسلایدرها سازگار با صفحه لمسی." },
];

const workflows = [
  {
    icon: Rocket,
    title: "راه‌اندازی آموزشگاه",
    color: "from-blue-500 to-cyan-500",
    steps: ["دریافت حساب مدیر", "تکمیل مشخصات و مجوز", "افزودن عکس، گالری و بنر", "ثبت مدرس و دوره", "بررسی صفحه عمومی"],
  },
  {
    icon: UserCheck,
    title: "از ثبت‌نام تا شروع کلاس",
    color: "from-emerald-500 to-teal-500",
    steps: ["ثبت درخواست توسط هنرجو", "ورود درخواست به وضعیت انتظار", "بررسی مدارک و اطلاعات", "تأیید یا رد مدیر", "نمایش دوره در پنل هنرجو"],
  },
  {
    icon: GraduationCap,
    title: "مدیریت چرخه آموزش",
    color: "from-violet-500 to-fuchsia-500",
    steps: ["ساخت تقویم جلسات", "حضور و غیاب", "تکلیف و آزمون", "ثبت پیشرفت و نمره", "صدور و بارگذاری گواهینامه"],
  },
  {
    icon: Receipt,
    title: "کنترل مالی و گزارش",
    color: "from-amber-500 to-orange-500",
    steps: ["تعریف اقساط و هزینه‌ها", "ثبت سررسید", "پیگیری پرداخت", "تأیید یا بخشودگی", "دریافت گزارش Excel"],
  },
];

const securityItems: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: KeyRound, title: "ورود امن", desc: "احراز هویت و نشست کاربری برای دسترسی به پنل‌های خصوصی." },
  { icon: ShieldCheck, title: "دسترسی نقش‌محور", desc: "تفکیک دسترسی مدیر کل، مدیر آموزشگاه و هنرجو در صفحه و API." },
  { icon: Database, title: "تفکیک داده آموزشگاه", desc: "هر مدیر فقط داده‌های آموزشگاه متصل به حساب خود را مدیریت می‌کند." },
  { icon: LockKeyhole, title: "اعتبارسنجی عملیات", desc: "کنترل ورودی و مجوز پیش از ثبت، ویرایش یا حذف داده‌های حساس." },
  { icon: Globe2, title: "زیرساخت ابری", desc: "Next.js، پایگاه‌داده PostgreSQL ابری، HTTPS و دامنه رسمی fanixo.ir." },
  { icon: Smartphone, title: "دسترسی همه‌جا", desc: "رابط واکنش‌گرا برای موبایل و دسکتاپ با منوی اختصاصی صفحات کوچک." },
];

function toFa(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function ManagerPlatformGuide() {
  const [category, setCategory] = useState<CategoryKey>("all");
  const [query, setQuery] = useState("");
  const reduceMotion = useReducedMotion();

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa-IR");
    return managerModules.filter((module) => {
      const categoryMatches = category === "all" || module.category === category;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        module.title,
        module.desc,
        module.location,
        module.result,
        module.note || "",
        ...module.items,
      ]
        .join(" ")
        .toLocaleLowerCase("fa-IR");
      return searchable.includes(normalizedQuery);
    });
  }, [category, query]);

  return (
    <section id="manager-capabilities" className="relative overflow-hidden bg-[#061326] py-14 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[4%] top-24 h-96 w-96 rounded-full bg-primary-500/10 blur-[120px]" />
        <div className="absolute bottom-40 left-[3%] h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-4xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-400/20 bg-primary-500/10 px-4 py-2 text-xs font-black text-primary-200">
            <Sparkles className="h-4 w-4" /> راهنمای کامل و واقعی سامانه
          </span>
          <h2 className="mb-5 text-3xl font-black leading-tight text-white md:text-5xl">
            راهنمای حرفه‌ای و جزئی‌به‌جز مدیران آموزشگاه‌ها
          </h2>
          <p className="mx-auto max-w-3xl text-sm leading-7 text-slate-300 md:text-base md:leading-8">
            این بخش بر اساس امکانات فعال پنل مدیر، پنل هنرجو، مدیریت کل و صفحات عمومی فَنی‌اکسو تنظیم شده است؛
            برای هر ابزار می‌بینید کجاست، دقیقاً چه کاری انجام می‌دهد و نتیجه آن برای آموزشگاه چیست.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { value: managerModules.length, label: "بخش پنل مدیر", icon: LayoutDashboard, color: "text-cyan-300" },
            { value: 23, label: "ابزار پنل هنرجو", icon: GraduationCap, color: "text-violet-300" },
            { value: adminFeatures.length, label: "بخش نظارت مدیر کل", icon: ShieldCheck, color: "text-emerald-300" },
            { value: 6, label: "گزارش تخصصی Excel", icon: FileSpreadsheet, color: "text-amber-300" },
          ].map((item) => (
            <div key={item.label} className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4 backdrop-blur-lg md:p-5">
              <div className="mb-3 flex items-center justify-between">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black text-emerald-300">فعال</span>
              </div>
              <div className="text-2xl font-black text-white md:text-3xl">{toFa(item.value)}</div>
              <div className="mt-1 text-[10px] font-bold text-slate-400 md:text-xs">{item.label}</div>
            </div>
          ))}
        </div>

        <nav className="sticky top-20 z-30 mb-12 flex gap-2 overflow-x-auto rounded-[18px] border border-white/10 bg-[#071426]/90 p-2 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            ["#manager-modules", "پنل مدیر"],
            ["#workflow", "مسیرهای کاری"],
            ["#public-showcase", "نمایش عمومی"],
            ["#student-experience", "پنل هنرجو"],
            ["#admin-control", "مدیریت کل"],
            ["#security", "امنیت"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 rounded-[11px] px-4 py-2 text-xs font-black text-slate-300 transition hover:bg-white/10 hover:text-white">
              {label}
            </a>
          ))}
        </nav>

        <div id="manager-modules" className="scroll-mt-32">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-cyan-500">
                <Settings2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white md:text-2xl">نقشه کامل پنل مدیر آموزشگاه</h3>
                <p className="mt-1 text-xs text-slate-400">همان بخش‌هایی که مدیر پس از ورود به پنل مشاهده می‌کند</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <Gauge className="h-4 w-4 text-emerald-300" /> نمایش {toFa(filteredModules.length)} از {toFa(managerModules.length)} بخش
            </div>
          </div>

          <div className="mb-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-3 md:p-4">
            <div className="relative mb-3">
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جست‌وجو در امکانات؛ مثلاً اقساط، آزمون، بنر یا تلگرام..."
                className="w-full rounded-[14px] border border-white/10 bg-[#071426] py-3.5 pr-11 pl-11 text-xs font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-primary-400/50 md:text-sm"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="پاک‌کردن جست‌وجو"
                  className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setCategory(option.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-black transition md:px-4 md:text-xs ${
                    category === option.key
                      ? "border-primary-400/50 bg-primary-500/20 text-primary-100"
                      : "border-white/10 bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <option.icon className="h-3.5 w-3.5" /> {option.label}
                </button>
              ))}
            </div>
          </div>

          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredModules.map((feature, index) => (
                <motion.article
                  key={feature.order}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ delay: reduceMotion ? 0 : (index % 4) * 0.04 }}
                  className="group relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-lg transition-all hover:-translate-y-0.5 hover:border-white/25 md:p-6"
                >
                  <div className="absolute left-4 top-4 text-5xl font-black text-white/[0.035]">{toFa(feature.order)}</div>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-105`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-black text-slate-300">
                        {categoryNames[feature.category]}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black text-emerald-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> فعال
                      </span>
                    </div>
                  </div>

                  <h4 className="mb-2 text-base font-black text-white md:text-lg">{feature.title}</h4>
                  <p className="mb-3 text-xs leading-6 text-slate-400">{feature.desc}</p>
                  <div className="mb-4 inline-flex items-center gap-1.5 rounded-[9px] bg-black/15 px-2.5 py-1.5 text-[9px] font-bold text-primary-200">
                    <MapPin className="h-3 w-3" /> {feature.location}
                  </div>

                  <div className="mb-4 rounded-[16px] border border-white/[0.07] bg-black/10 p-3.5">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-black text-white">
                      <ListChecks className="h-4 w-4 text-primary-300" /> امکانات دقیق این بخش
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {feature.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[10px] leading-5 text-slate-300 md:text-[11px]">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[13px] border border-cyan-400/10 bg-cyan-500/[0.06] p-3 text-[10px] leading-5 text-cyan-100">
                    <strong className="ml-1 text-cyan-300">نتیجه برای مدیر:</strong>
                    {feature.result}
                  </div>
                  {feature.note && (
                    <div className="mt-2 rounded-[12px] border border-amber-500/20 bg-amber-500/10 p-2.5 text-[10px] leading-5 text-amber-200">
                      <strong>نکته دسترسی:</strong> {feature.note}
                    </div>
                  )}
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/15 bg-white/[0.025] py-14 text-center">
              <Filter className="mx-auto mb-3 h-8 w-8 text-slate-500" />
              <div className="font-black text-white">امکانی با این عبارت پیدا نشد</div>
              <p className="mt-2 text-xs text-slate-500">عبارت دیگری بنویسید یا فیلتر «همه بخش‌ها» را انتخاب کنید.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("all"); }} className="mt-4 rounded-[11px] bg-white/10 px-4 py-2 text-xs font-black text-white">
                پاک‌کردن فیلترها
              </button>
            </div>
          )}
        </div>

        <section id="workflow" className="mt-20 scroll-mt-32">
          <div className="mb-9 text-center">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-black text-primary-300"><Activity className="h-4 w-4" /> فرایندهای واقعی</span>
            <h3 className="text-2xl font-black text-white md:text-3xl">چهار مسیر اصلی کار مدیر در سامانه</h3>
            <p className="mt-2 text-sm text-slate-400">از راه‌اندازی تا آموزش، امور مالی و گزارش‌گیری؛ مرحله‌به‌مرحله</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflows.map((flow, index) => (
              <motion.div
                key={flow.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : index * 0.06 }}
                className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-5 md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br ${flow.color}`}><flow.icon className="h-5 w-5 text-white" /></div>
                  <h4 className="font-black text-white">{flow.title}</h4>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {flow.steps.map((step, stepIndex) => (
                    <div key={step} className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/10 bg-black/10 px-3 py-2 text-[10px] font-bold text-slate-200">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[9px] font-black text-white">{toFa(stepIndex + 1)}</span>
                        {step}
                      </span>
                      {stepIndex < flow.steps.length - 1 && <ArrowLeft className="hidden h-3.5 w-3.5 text-slate-600 sm:block" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="public-showcase" className="mt-20 scroll-mt-32 rounded-[30px] border border-white/10 bg-gradient-to-br from-primary-500/10 via-white/[0.025] to-fuchsia-500/10 p-5 md:p-9">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-black text-cyan-300"><Globe2 className="h-4 w-4" /> خروجی عمومی اطلاعات مدیر</span>
              <h3 className="text-2xl font-black text-white md:text-3xl">اطلاعات آموزشگاه کجا دیده می‌شود؟</h3>
              <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400 md:text-sm">هر تغییری که مدیر در پروفایل، دوره، تصویر یا محتوا ثبت می‌کند، در نقاط مرتبط سایت به یک تجربه یکپارچه برای هنرجو تبدیل می‌شود.</p>
            </div>
            <Link href="/institutes" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-[12px] border border-white/15 bg-white/5 px-4 py-3 text-xs font-black text-white hover:bg-white/10">
              مشاهده فهرست آموزشگاه‌ها <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {publicTouchpoints.map((item) => (
              <div key={item.title} className="rounded-[18px] border border-white/[0.08] bg-black/10 p-4">
                <item.icon className="mb-3 h-5 w-5 text-primary-300" />
                <h4 className="mb-1.5 text-sm font-black text-white">{item.title}</h4>
                <p className="text-[10px] leading-5 text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="student-experience" className="mt-20 scroll-mt-32">
          <div className="mb-9 text-center">
            <span className="mb-3 inline-flex items-center gap-2 text-xs font-black text-cyan-300"><GraduationCap className="h-4 w-4" /> پنل اختصاصی هنرجو</span>
            <h3 className="text-2xl font-black text-white md:text-3xl">مدیر چه تجربه‌ای برای هنرجو می‌سازد؟</h3>
            <p className="mt-2 text-sm text-slate-400">۲۳ ابزار هنرجویی در چهار گروه؛ متصل به اطلاعاتی که مدیر آموزشگاه ثبت می‌کند</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {studentGroups.map((group, groupIndex) => (
              <motion.article
                key={group.title}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: reduceMotion ? 0 : groupIndex * 0.06 }}
                className="rounded-[26px] border border-white/10 bg-white/[0.04] p-5 md:p-6"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-[13px] bg-gradient-to-br ${group.color}`}><group.icon className="h-5 w-5 text-white" /></div>
                  <div>
                    <h4 className="font-black text-white">{group.title}</h4>
                    <p className="mt-0.5 text-[10px] text-slate-500">{toFa(group.items.length)} امکان متصل</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <div key={item.title} className="rounded-[13px] border border-white/[0.07] bg-black/10 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-black text-slate-100"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-cyan-300" />{item.title}</div>
                      <p className="pr-5 text-[9px] leading-5 text-slate-500">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="admin-control" className="mt-20 scroll-mt-32 rounded-[30px] border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/5 p-5 md:p-9">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-fuchsia-500 to-purple-600"><ShieldCheck className="h-6 w-6 text-white" /></div>
            <div>
              <h3 className="text-xl font-black text-white md:text-2xl">نظارت و پشتیبانی مدیر کل سامانه</h3>
              <p className="mt-1 text-xs text-slate-400">۱۷ بخش برای کنترل شبکه، دسترسی‌ها، محتوای عمومی و کیفیت خدمات</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {adminFeatures.map((item) => (
              <div key={item.title} className="rounded-[17px] border border-white/[0.08] bg-black/10 p-4">
                <item.icon className="mb-3 h-5 w-5 text-fuchsia-300" />
                <h4 className="mb-1 text-xs font-black text-white">{item.title}</h4>
                <p className="text-[9px] leading-5 text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="security" className="relative mt-20 scroll-mt-32 overflow-hidden rounded-[30px] border border-white/10 bg-[#071426]/80 p-5 md:p-9">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/[0.08] via-transparent to-fuchsia-500/[0.08]" />
          <div className="relative">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="mb-3 flex items-center gap-3"><LockKeyhole className="h-7 w-7 text-emerald-300" /><h3 className="text-xl font-black text-white md:text-2xl">امنیت، پایداری و دسترسی از هر دستگاه</h3></div>
                <p className="max-w-3xl text-xs leading-6 text-slate-400 md:text-sm">زیرساخت سامانه برای تفکیک نقش‌ها و اطلاعات آموزشگاه‌ها طراحی شده تا عملیات روزانه در موبایل و دسکتاپ، منظم و قابل اتکا باشد.</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-[10px] font-black text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> سامانه عملیاتی</span>
            </div>
            <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {securityItems.map((item) => (
                <div key={item.title} className="flex items-start gap-3 rounded-[16px] border border-white/[0.08] bg-white/[0.035] p-4">
                  <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary-300" />
                  <div><h4 className="mb-1 text-xs font-black text-white">{item.title}</h4><p className="text-[9px] leading-5 text-slate-400">{item.desc}</p></div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-l from-primary-500 to-secondary-500 px-6 py-3.5 text-sm font-black text-white shadow-xl"><LayoutDashboard className="h-5 w-5" /> ورود به پنل مدیریت</Link>
              <a href="tel:09159513179" className="flex items-center justify-center gap-2 rounded-[14px] border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-black text-white"><Phone className="h-5 w-5" /> درخواست مشاوره</a>
            </div>
          </div>
        </section>

        <div className="mt-14 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> پلن رایگان ۳۰ روزه</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-primary-300" /> قابل استفاده با موبایل</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5"><LifeBuoy className="h-4 w-4 text-fuchsia-300" /> راهنمای فعال‌سازی</span>
          </div>
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-[15px] bg-white px-7 py-4 font-black text-slate-900 shadow-2xl transition-transform hover:scale-[1.03]"><Rocket className="h-5 w-5" /> مشاهده پلن و راه‌اندازی آموزشگاه <ArrowLeft className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
