"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Coffee,
  GraduationCap,
  Heart,
  Library,
  MapPin,
  MessageCircle,
  Navigation,
  ParkingCircle,
  Phone,
  Play,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Users,
  Video,
  Wifi,
  X,
  Zap,
} from "lucide-react";
import CourseCard from "@/components/CourseCard";
import OnlineCourseCard from "@/components/OnlineCourseCard";
import PublicReviewsSection from "@/components/PublicReviewsSection";
import type { AdvancedInstituteProfile } from "@/lib/advanced-institute-profile";

type Props = {
  institute: any;
  profile: AdvancedInstituteProfile;
  courses: any[];
  onlineCourses: any[];
  instructors: any[];
  sessions: any[];
  stories: any[];
  similar: any[];
  stats: { students: number; graduates: number; courses: number; instructors: number };
};

const facilityIcons: Record<string, any> = {
  اینترنت: Wifi,
  پارکینگ: ParkingCircle,
  کتابخانه: Library,
  "کافی‌شاپ": Coffee,
  آزمایشگاه: Building2,
};

function fa(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("fa-IR");
}

function Stars({ value }: { value: number }) {
  return <span className="flex" dir="ltr">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-white/15"}`} />)}</span>;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div className="mb-6"><span className="mb-2 block text-[10px] font-black tracking-widest text-fuchsia-400">{eyebrow}</span><h2 className="text-xl font-black text-white md:text-2xl">{title}</h2>{description && <p className="mt-2 max-w-2xl text-xs leading-6 text-slate-400">{description}</p>}</div>;
}

function SampleBadge({ show }: { show?: boolean }) {
  return show ? <span className="rounded-full border border-violet-400/20 bg-violet-500/15 px-2 py-1 text-[8px] font-black text-violet-300">نمونه قابل ویرایش</span> : null;
}

export default function PremiumInstitutePage({ institute, profile, courses, onlineCourses, instructors, sessions, stories, similar, stats }: Props) {
  const [courseFilter, setCourseFilter] = useState("all");
  const [courseQuery, setCourseQuery] = useState("");
  const [favorite, setFavorite] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [recommendForm, setRecommendForm] = useState({ age: "", job: "", interest: "", budget: "", freeTime: "" });
  const [showCompare, setShowCompare] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([institute.id]);

  const allCourses = useMemo(() => [
    ...courses.map((course) => ({ ...course, mode: "inperson" })),
    ...onlineCourses.map((course) => ({ ...course, mode: "online" })),
  ], [courses, onlineCourses]);

  const filteredCourses = useMemo(() => {
    const query = courseQuery.trim().toLocaleLowerCase("fa-IR");
    return allCourses.filter((course) => {
      if (courseFilter === "inperson" && course.mode !== "inperson") return false;
      if (courseFilter === "online" && course.mode !== "online") return false;
      if (courseFilter === "free" && Number(course.price || 0) !== 0) return false;
      if (courseFilter === "open" && course.mode === "inperson" && (course.registrationClosed || course.registrationEnded)) return false;
      return !query || `${course.title} ${course.categoryName || course.category_name || ""} ${course.instructor || ""}`.toLocaleLowerCase("fa-IR").includes(query);
    });
  }, [allCourses, courseFilter, courseQuery]);

  const recommended = useMemo(() => {
    const interest = recommendForm.interest.toLocaleLowerCase("fa-IR");
    return [...allCourses].sort((a, b) => {
      const score = (course: any) => {
        const text = `${course.title} ${course.categoryName || course.category_name || ""} ${course.description || course.subtitle || ""}`.toLocaleLowerCase("fa-IR");
        let total = interest && text.includes(interest) ? 6 : 0;
        if (recommendForm.budget && Number(course.price || 0) <= Number(recommendForm.budget)) total += 2;
        if (recommendForm.freeTime === "کم" && course.mode === "online") total += 2;
        return total + Number(course.rating || 0);
      };
      return score(b) - score(a);
    }).slice(0, 3);
  }, [allCourses, recommendForm]);

  const heroCover = profile.coverImage || institute.bannerImages?.[0] || institute.images?.[0] || institute.profilePhoto || "/images/institute-cover.jpg";
  const logo = institute.logo || institute.profilePhoto || "/images/fanixo-logo.png";
  const whatsapp = profile.social.whatsapp || institute.mobile || institute.phone || "";
  const established = Number(institute.establishedYear || 0);
  const years = established > 0 ? Math.max(1, 1405 - established) : 0;
  const studentTotal = Math.max(stats.students, profile.historicalStudents || 0);
  const graduateTotal = Math.max(stats.graduates, profile.graduateCount || 0);
  const courseTotal = stats.courses;

  const share = async () => {
    const payload = { title: institute.name, text: profile.slogan, url: window.location.href };
    if (navigator.share) await navigator.share(payload).catch(() => {});
    else { await navigator.clipboard.writeText(window.location.href); alert("لینک صفحه کپی شد"); }
  };

  return (
    <main className="min-h-screen bg-[#050817] text-white">
      {/* Hero */}
      <section className="relative min-h-[580px] overflow-hidden border-b border-fuchsia-500/15">
        <img src={heroCover} alt={`کاور ${institute.name}`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#050817]/95 via-[#080b21]/80 to-[#07091a]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050817] via-transparent to-[#050817]/35" />
        <div className="absolute right-[10%] top-16 h-72 w-72 rounded-full bg-fuchsia-600/20 blur-[120px]" />
        <div className="relative mx-auto grid min-h-[580px] max-w-7xl items-center gap-8 px-4 pb-16 pt-28 md:grid-cols-[1.2fr_0.8fr] md:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/15 px-3 py-1.5 text-[10px] font-black text-fuchsia-200"><Sparkles className="h-3.5 w-3.5" /> پروفایل حرفه‌ای آموزشگاه</span>
              {institute.isVerified && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-[10px] font-black text-emerald-200"><BadgeCheck className="h-3.5 w-3.5" /> مجوز و هویت تأییدشده</span>}
              {institute.isYearAward && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-black text-slate-950"><Award className="h-3.5 w-3.5" /> آموزشگاه برگزیده</span>}
            </div>
            <div className="mb-5 flex items-center gap-4">
              <img src={logo} alt={`لوگوی ${institute.name}`} className="h-20 w-20 rounded-[22px] border-2 border-white/25 bg-white/10 object-cover p-1 shadow-2xl" />
              <div><h1 className="text-3xl font-black leading-tight md:text-5xl">{institute.name}</h1><p className="mt-2 text-sm font-bold text-fuchsia-300 md:text-lg">{profile.slogan}</p></div>
            </div>
            <p className="mb-6 max-w-2xl text-sm leading-7 text-slate-300">{institute.description || profile.mission}</p>
            <div className="mb-7 flex flex-wrap items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><Stars value={Number(institute.rating || 0)} /><b>{Number(institute.rating || 0).toFixed(1)}</b><small className="text-slate-400">({fa(institute.reviewCount)} نظر)</small></span>
              <span className="flex items-center gap-1.5 text-slate-300"><MapPin className="h-4 w-4 text-fuchsia-400" />{institute.regionName}</span>
              <span className="flex items-center gap-1.5 text-slate-300"><ShieldCheck className="h-4 w-4 text-emerald-400" />مجوز {institute.licenseNumber || "رسمی"}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="#quick-register" className="rounded-[12px] bg-gradient-to-l from-fuchsia-500 to-purple-600 px-5 py-3 text-xs font-black text-white shadow-xl shadow-fuchsia-500/20">ثبت‌نام سریع</a>
              {(institute.mobile || institute.phone) && <a href={`tel:${institute.mobile || institute.phone}`} className="flex items-center gap-2 rounded-[12px] border border-white/15 bg-white/5 px-4 py-3 text-xs font-black"><Phone className="h-4 w-4" /> تماس</a>}
              {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/^0/, "98").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-[12px] border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-xs font-black text-emerald-300"><MessageCircle className="h-4 w-4" /> واتساپ</a>}
              <button type="button" onClick={share} className="rounded-[12px] border border-white/15 bg-white/5 p-3"><Share2 className="h-4 w-4" /></button>
              <button type="button" onClick={() => setFavorite(!favorite)} className={`rounded-[12px] border p-3 ${favorite ? "border-rose-400/40 bg-rose-500/15 text-rose-300" : "border-white/15 bg-white/5"}`}><Heart className={`h-4 w-4 ${favorite ? "fill-current" : ""}`} /></button>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 rounded-[28px] border border-white/10 bg-[#080b20]/70 p-4 backdrop-blur-xl md:p-5">
            {[
              { icon: Users, value: studentTotal, label: "هنرجو", color: "text-cyan-300" },
              { icon: GraduationCap, value: graduateTotal, label: "فارغ‌التحصیل", color: "text-fuchsia-300" },
              { icon: BookOpen, value: courseTotal, label: "دوره فعال", color: "text-amber-300" },
              { icon: BriefcaseBusiness, value: profile.employmentCount, label: "استخدام ثبت‌شده", color: "text-emerald-300" },
              { icon: Award, value: years, label: "سال سابقه", color: "text-violet-300" },
              { icon: Star, value: Number(institute.rating || 0).toFixed(1), label: "امتیاز کاربران", color: "text-yellow-300" },
            ].map((item) => <div key={item.label} className="rounded-[18px] border border-white/[0.08] bg-white/[0.045] p-4"><item.icon className={`mb-3 h-5 w-5 ${item.color}`} /><div className="text-2xl font-black">{typeof item.value === "number" ? fa(item.value) : item.value}</div><div className="mt-1 text-[9px] font-bold text-slate-500">{item.label}</div></div>)}
          </div>
        </div>
      </section>

      {/* Floating quick nav */}
      <nav className="sticky top-20 z-40 border-y border-white/10 bg-[#070a1c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-2 [scrollbar-width:none]">{[["#courses","دوره‌ها"],["#about","معرفی"],["#teachers","اساتید"],["#portfolio","نمونه‌کار"],["#reviews","نظرات"],["#calendar","تقویم"],["#contact","تماس و مشاوره"]].map(([href,label]) => <a key={href} href={href} className="shrink-0 rounded-full px-3 py-2 text-[10px] font-black text-slate-400 hover:bg-fuchsia-500/15 hover:text-fuchsia-300">{label}</a>)}</div>
      </nav>

      {/* Competitive advantages */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{profile.advantages.slice(0, 10).map((item) => <div key={item} className="flex items-center gap-3 rounded-[16px] border border-fuchsia-500/15 bg-gradient-to-br from-fuchsia-500/[0.08] to-transparent p-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-fuchsia-400" /><span className="text-xs font-black text-slate-200">{item}</span></div>)}</div>
      </section>

      {/* Courses */}
      <section id="courses" className="scroll-mt-36 border-y border-white/5 bg-[#070a1c] py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <SectionTitle eyebrow="COURSES" title="دوره‌های آموزشی" description="دوره‌های حضوری و آنلاین را بر اساس نوع، قیمت و وضعیت ثبت‌نام پیدا کنید." />
          <div className="mb-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto">{[["all","همه"],["inperson","حضوری"],["online","آنلاین"],["free","رایگان"],["open","در حال ثبت‌نام"]].map(([key,label]) => <button key={key} onClick={() => setCourseFilter(key)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-black ${courseFilter === key ? "bg-fuchsia-500 text-white" : "border border-white/10 bg-white/5 text-slate-400"}`}>{label}</button>)}</div>
            <div className="relative"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={courseQuery} onChange={(event) => setCourseQuery(event.target.value)} placeholder="جست‌وجوی دوره یا مدرس..." className="w-full rounded-[12px] border border-white/10 bg-white/5 py-3 pr-10 pl-4 text-sm text-white outline-none lg:w-80" /></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredCourses.map((course, index) => course.mode === "online" ? <OnlineCourseCard key={`online-${course.id}`} course={course} index={index} /> : <CourseCard key={`course-${course.id}`} course={course} index={index} />)}</div>
          {filteredCourses.length === 0 && <div className="rounded-[20px] border border-dashed border-white/10 py-14 text-center text-sm text-slate-500">دوره‌ای با این فیلتر پیدا نشد.</div>}
        </div>
      </section>

      {/* About + media */}
      <section id="about" className="mx-auto grid max-w-7xl scroll-mt-36 gap-5 px-4 py-14 md:px-8 lg:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-[#0c1026] p-6 md:p-8"><SectionTitle eyebrow="ABOUT" title={`درباره ${institute.name}`} /><p className="mb-5 text-sm leading-8 text-slate-300">{profile.history}</p><div className="space-y-3"><div className="rounded-[13px] bg-white/[0.04] p-4"><b className="text-xs text-fuchsia-300">ماموریت</b><p className="mt-2 text-xs leading-6 text-slate-400">{profile.mission}</p></div><div className="rounded-[13px] bg-white/[0.04] p-4"><b className="text-xs text-cyan-300">چشم‌انداز</b><p className="mt-2 text-xs leading-6 text-slate-400">{profile.vision}</p></div></div></div>
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0c1026] p-4"><div className="relative aspect-video overflow-hidden rounded-[18px] bg-gradient-to-br from-purple-700 to-fuchsia-600">{institute.images?.[0] ? <img src={institute.images[0]} alt="فضای آموزشگاه" className="h-full w-full object-cover opacity-70" /> : <img src={heroCover} alt="فضای آموزشگاه" className="h-full w-full object-cover opacity-60" />}<a href={profile.introVideoUrl || profile.virtualTourUrl || "#portfolio"} target={profile.introVideoUrl || profile.virtualTourUrl ? "_blank" : undefined} className="absolute inset-0 flex items-center justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-2xl"><Play className="h-8 w-8 fill-current" /></span></a><div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-black">{profile.introVideoUrl ? "ویدئوی معرفی" : profile.virtualTourUrl ? "تور مجازی" : "مشاهده گالری"}</div></div><div className="mt-3 grid grid-cols-4 gap-2">{(institute.images || []).slice(0, 4).map((image: string, index: number) => <img key={index} src={image} alt={`نمای آموزشگاه ${index + 1}`} className="aspect-video w-full rounded-[9px] object-cover" />)}</div></div>
      </section>

      {/* Teachers */}
      <section id="teachers" className="scroll-mt-36 bg-[#070a1c] py-14"><div className="mx-auto max-w-7xl px-4 md:px-8"><SectionTitle eyebrow="INSTRUCTORS" title="اساتید آموزشگاه" description="رزومه، تخصص، امتیاز و راه ارتباطی مدرس‌ها" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{instructors.map((teacher) => <article key={teacher.id} className="group rounded-[22px] border border-white/10 bg-gradient-to-b from-[#111630] to-[#0b0e21] p-4 text-center transition hover:border-fuchsia-500/35"><div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-fuchsia-500/30 bg-fuchsia-500/10">{teacher.avatar ? <img src={teacher.avatar} alt={teacher.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-3xl font-black text-fuchsia-300">{teacher.name?.charAt(0)}</div>}</div><h3 className="font-black">{teacher.name}</h3><p className="mt-1 text-[10px] text-fuchsia-300">{teacher.title || "مدرس مهارتی"}</p><p className="mt-3 line-clamp-3 text-[10px] leading-5 text-slate-500">{teacher.bio || "رزومه مدرس توسط آموزشگاه تکمیل می‌شود."}</p><div className="mt-3 flex items-center justify-center gap-3 text-[9px] text-slate-400"><span>⭐ {Number(teacher.rating || 0).toFixed(1)}</span><span>•</span><span>{fa(teacher.years_experience)} سال تجربه</span></div><div className="mt-4 flex justify-center gap-2">{teacher.phone && <a href={`tel:${teacher.phone}`} className="rounded-full bg-white/5 p-2 text-cyan-300"><Phone className="h-3.5 w-3.5" /></a>}{teacher.email && <a href={`mailto:${teacher.email}`} className="rounded-full bg-white/5 p-2 text-fuchsia-300"><Send className="h-3.5 w-3.5" /></a>}</div></article>)}</div>{instructors.length === 0 && <div className="rounded-[18px] border border-dashed border-white/10 py-12 text-center text-slate-500">مدرسی ثبت نشده است.</div>}</div></section>

      {/* Stat ribbon */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8"><div className="grid grid-cols-2 gap-3 rounded-[24px] border border-fuchsia-500/20 bg-gradient-to-l from-fuchsia-500/10 via-purple-500/5 to-cyan-500/10 p-5 md:grid-cols-5">{[["رضایت هنرجویان",profile.quality.satisfaction],["کیفیت آموزش",profile.quality.education],["بازار کار",profile.quality.jobMarket],["قبولی",profile.quality.passRate],["استخدام",profile.quality.employment]].map(([label,value]) => <div key={String(label)} className="text-center"><div className="text-2xl font-black text-fuchsia-300">{value}٪</div><div className="mt-1 text-[9px] font-bold text-slate-500">{label}</div></div>)}</div></section>

      {/* Portfolio + success */}
      <section id="portfolio" className="mx-auto max-w-7xl scroll-mt-36 px-4 py-14 md:px-8"><SectionTitle eyebrow="STUDENT WORK" title="نمونه‌کار و موفقیت هنرجویان" /><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[24px] border border-white/10 bg-[#0c1026] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-black">گالری پروژه‌ها</h3><SampleBadge show={profile.portfolio.some((item) => item.isSample)} /></div><div className="grid grid-cols-2 gap-3">{profile.portfolio.slice(0, 6).map((item) => <article key={item.id} className="group relative overflow-hidden rounded-[15px] border border-white/10"><img src={item.image || heroCover} alt={item.title} className="aspect-[4/3] h-full w-full object-cover transition group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3"><b className="text-[10px]">{item.title}</b><p className="mt-1 line-clamp-1 text-[8px] text-slate-400">{item.description}</p></div>{item.video && <a href={item.video} target="_blank" rel="noreferrer" className="absolute left-2 top-2 rounded-full bg-fuchsia-500 p-2"><Play className="h-3 w-3 fill-current" /></a>}</article>)}</div></div><div className="space-y-3">{profile.successStories.map((story) => <article key={story.id} className="rounded-[20px] border border-white/10 bg-[#0c1026] p-4"><div className="flex gap-4"><img src={story.image || heroCover} alt={story.name} className="h-20 w-20 rounded-[15px] object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{story.name}</h3><SampleBadge show={story.isSample} /></div><p className="mt-1 text-[10px] font-bold text-emerald-300">{story.title} • {story.result}</p><p className="mt-2 line-clamp-3 text-[10px] leading-5 text-slate-400">{story.story}</p></div></div></article>)}</div></div></section>

      {/* Reviews */}
      <section id="reviews" className="scroll-mt-36 bg-[#070a1c] py-14"><div className="mx-auto max-w-7xl px-4 md:px-8"><PublicReviewsSection instituteId={institute.id} title={`نظرات هنرجویان ${institute.name}`} /></div></section>

      {/* Calendar + facilities */}
      <section id="calendar" className="mx-auto grid max-w-7xl scroll-mt-36 gap-5 px-4 py-14 md:px-8 lg:grid-cols-2"><div className="rounded-[24px] border border-white/10 bg-[#0c1026] p-5"><SectionTitle eyebrow="CALENDAR" title="تقویم کلاس‌ها" /><div className="space-y-2">{sessions.slice(0, 8).map((session) => <div key={session.id} className="flex items-center gap-3 rounded-[13px] border border-white/[0.07] bg-white/[0.035] p-3"><div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-fuchsia-500/15 text-fuchsia-300"><CalendarDays className="h-5 w-5" /></div><div className="min-w-0 flex-1"><b className="block truncate text-xs">{session.course_title}</b><span className="mt-1 block text-[9px] text-slate-500">{session.title} • {session.session_date || "تاریخ در انتظار"} • {session.session_time || "—"}</span></div>{session.is_online && <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[8px] font-black text-cyan-300">آنلاین</span>}</div>)}{sessions.length === 0 && <div className="py-10 text-center text-xs text-slate-500">جلسه‌ای در تقویم ثبت نشده است.</div>}</div></div><div className="rounded-[24px] border border-white/10 bg-[#0c1026] p-5"><SectionTitle eyebrow="FACILITIES" title="امکانات آموزشگاه" /><div className="grid grid-cols-2 gap-3">{profile.facilities.map((facility) => { const Icon = Object.entries(facilityIcons).find(([key]) => facility.name.includes(key))?.[1] || Building2; return <div key={facility.id} className={`rounded-[14px] border p-4 ${facility.available ? "border-emerald-500/20 bg-emerald-500/[0.06]" : "border-white/5 bg-white/[0.02] opacity-60"}`}><div className="mb-2 flex items-center justify-between"><Icon className={`h-5 w-5 ${facility.available ? "text-emerald-300" : "text-slate-500"}`} />{facility.available ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-slate-600" />}</div><b className="text-xs">{facility.name}</b>{facility.note && <p className="mt-1 text-[8px] text-slate-500">{facility.note}</p>}</div>; })}</div></div></section>

      {/* News / stories */}
      <section className="bg-[#070a1c] py-14"><div className="mx-auto max-w-7xl px-4 md:px-8"><div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]"><div><SectionTitle eyebrow="NEWS" title="اخبار، رویدادها و تخفیف‌ها" /><div className="grid gap-3 sm:grid-cols-2">{profile.news.map((item) => <article key={item.id} className="overflow-hidden rounded-[18px] border border-white/10 bg-[#0c1026]"><img src={item.image || heroCover} alt={item.title} className="aspect-video w-full object-cover" /><div className="p-4"><div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-fuchsia-500/10 px-2 py-1 text-[8px] font-black text-fuchsia-300">{item.kind || "خبر"}</span><SampleBadge show={item.isSample} /></div><h3 className="text-sm font-black">{item.title}</h3><p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-500">{item.summary}</p></div></article>)}</div></div><div><SectionTitle eyebrow="STORIES" title="استوری آموزشگاه" /><div className="grid grid-cols-2 gap-3">{stories.map((story) => <div key={story.id} className="overflow-hidden rounded-[18px] border-2 border-fuchsia-500/40 bg-[#0c1026] p-1">{story.media_type === "video" ? <video src={story.media_url} className="aspect-[9/14] w-full rounded-[14px] object-cover" controls /> : <img src={story.media_url} alt={story.caption || "استوری"} className="aspect-[9/14] w-full rounded-[14px] object-cover" />}<p className="p-2 text-center text-[8px] text-slate-400">{story.caption || "استوری آموزشگاه"}</p></div>)}{stories.length === 0 && <div className="col-span-2 rounded-[18px] border border-dashed border-white/10 py-12 text-center text-[10px] text-slate-500">استوری فعالی وجود ندارد.</div>}</div></div></div></div></section>

      {/* Certificates + partners + comparison */}
      <section className="mx-auto max-w-7xl space-y-12 px-4 py-14 md:px-8"><div><SectionTitle eyebrow="TRUST" title="مجوزها، افتخارات و همکاری‌ها" /><div className="grid gap-5 lg:grid-cols-2"><div className="grid gap-3 sm:grid-cols-2">{profile.certificates.map((item) => <article key={item.id} className="rounded-[18px] border border-amber-500/15 bg-amber-500/[0.04] p-4">{item.image ? <img src={item.image} alt={item.title} className="mb-3 aspect-video w-full rounded-[12px] object-cover" /> : <Award className="mb-4 h-9 w-9 text-amber-300" />}<div className="flex items-center gap-2"><h3 className="text-xs font-black">{item.title}</h3><SampleBadge show={item.isSample} /></div><p className="mt-1 text-[9px] text-slate-500">{item.issuer} • {item.year}</p></article>)}</div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{profile.partners.map((partner) => <a key={partner.id} href={partner.url || undefined} className="flex min-h-28 flex-col items-center justify-center rounded-[18px] border border-white/10 bg-white/[0.035] p-4 text-center">{partner.logo ? <img src={partner.logo} alt={partner.name} className="mb-3 h-12 max-w-full object-contain" /> : <Building2 className="mb-3 h-8 w-8 text-fuchsia-300" />}<b className="text-[10px]">{partner.name}</b><SampleBadge show={partner.isSample} /></a>)}</div></div></div>
        <div><SectionTitle eyebrow="COMPARE" title="مقایسه کیفیت آموزشگاه" description="شاخص‌های ثبت‌شده توسط آموزشگاه در کنار میانگین معیار مقایسه." /><div className="overflow-x-auto rounded-[20px] border border-white/10"><table className="w-full min-w-[580px] text-xs"><thead className="bg-white/[0.05] text-slate-400"><tr><th className="p-4 text-right">ویژگی</th><th className="p-4">{institute.name}</th><th className="p-4">میانگین مقایسه</th><th className="p-4">وضعیت</th></tr></thead><tbody className="divide-y divide-white/5">{[["کیفیت آموزش",profile.quality.education,82],["رضایت",profile.quality.satisfaction,78],["بازارکار",profile.quality.jobMarket,72],["قبولی",profile.quality.passRate,80],["استخدام",profile.quality.employment,65]].map(([label,value,average]) => <tr key={String(label)}><td className="p-4 font-black">{label}</td><td className="p-4 text-center text-fuchsia-300">{value}٪</td><td className="p-4 text-center text-slate-400">{average}٪</td><td className="p-4 text-center">{Number(value) >= Number(average) ? <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-black text-emerald-300">بالاتر از میانگین</span> : <span className="text-slate-500">در حال بهبود</span>}</td></tr>)}</tbody></table></div></div>
      </section>

      {/* Map + consultation */}
      <section id="contact" className="scroll-mt-36 bg-[#070a1c] py-14"><div className="mx-auto grid max-w-7xl gap-5 px-4 md:px-8 lg:grid-cols-2"><div className="overflow-hidden rounded-[24px] border border-white/10 bg-[#0c1026]"><div className="h-72 bg-white/5">{institute.lat && institute.lng ? <iframe title="نقشه آموزشگاه" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(institute.lng)-0.015},${Number(institute.lat)-0.01},${Number(institute.lng)+0.015},${Number(institute.lat)+0.01}&layer=mapnik&marker=${institute.lat},${institute.lng}`} className="h-full w-full border-0" /> : <div className="flex h-full items-center justify-center text-slate-500"><MapPin className="ml-2 h-6 w-6" />موقعیت دقیق توسط مدیر تکمیل شود</div>}</div><div className="space-y-2 p-4 text-[10px] text-slate-400"><p><MapPin className="ml-1 inline h-3.5 w-3.5 text-fuchsia-300" />{institute.address}</p><p><Car className="ml-1 inline h-3.5 w-3.5 text-cyan-300" />{profile.locationDetails.parking}</p><p>🚌 {profile.locationDetails.bus}</p><p>📍 {profile.locationDetails.distance}</p>{institute.lat && <a href={`https://www.google.com/maps?q=${institute.lat},${institute.lng}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 rounded-[9px] bg-fuchsia-600 px-3 py-2 font-black text-white"><Navigation className="h-3.5 w-3.5" /> مسیر از موقعیت من</a>}</div></div><LeadForm institute={institute} profile={profile} courses={courses} type="consultation" /></div></section>

      {/* FAQ */}
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-8"><SectionTitle eyebrow="FAQ" title="سوالات متداول" /><div className="space-y-2">{profile.faqs.map((item, index) => <div key={item.id} className="overflow-hidden rounded-[14px] border border-white/10 bg-[#0c1026]"><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-3 p-4 text-right"><span className="flex items-center gap-2 text-xs font-black">{item.question}<SampleBadge show={item.isSample} /></span><ChevronDown className={`h-4 w-4 text-fuchsia-300 transition ${openFaq === index ? "rotate-180" : ""}`} /></button>{openFaq === index && <p className="border-t border-white/5 px-4 py-4 text-xs leading-7 text-slate-400">{item.answer}</p>}</div>)}</div></section>

      {/* AI recommendation */}
      <section className="bg-gradient-to-l from-purple-900/40 via-[#080b20] to-fuchsia-900/30 py-14"><div className="mx-auto max-w-5xl px-4 text-center md:px-8"><div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-xl shadow-fuchsia-500/30"><Sparkles className="h-8 w-8" /></div><h2 className="text-2xl font-black md:text-3xl">کدام دوره برای من مناسب است؟</h2><p className="mx-auto mt-3 max-w-2xl text-xs leading-6 text-slate-400">سن، شغل، علاقه، بودجه و زمان آزاد را وارد کنید تا دوره‌های متناسب این آموزشگاه پیشنهاد شوند.</p><button type="button" onClick={() => setRecommendOpen(true)} className="mt-6 rounded-[12px] bg-white px-6 py-3 text-xs font-black text-slate-900">دریافت پیشنهاد هوشمند</button></div></section>

      {/* Similar + compare */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-8"><div className="flex items-end justify-between gap-3"><SectionTitle eyebrow="SIMILAR" title="آموزشگاه‌های مشابه" description="اگر این آموزشگاه را پسندیدید، گزینه‌های نزدیک را نیز بررسی و مقایسه کنید." /><button type="button" onClick={() => setShowCompare(true)} disabled={compareIds.length < 2} className="mb-6 shrink-0 rounded-[10px] bg-fuchsia-600 px-4 py-2.5 text-[10px] font-black disabled:opacity-40">مقایسه {fa(compareIds.length)} آموزشگاه</button></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{similar.map((item) => <article key={item.id} className="rounded-[18px] border border-white/10 bg-[#0c1026] p-4"><div className="mb-3 flex items-start justify-between"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[13px] bg-fuchsia-500/10">{item.profile_photo || item.logo ? <img src={item.profile_photo || item.logo} alt={item.name} className="h-full w-full object-cover" /> : <Building2 className="h-6 w-6 text-fuchsia-300" />}</div><label className="flex items-center gap-1 text-[8px] text-slate-500"><input type="checkbox" checked={compareIds.includes(item.id)} onChange={(event) => setCompareIds(event.target.checked ? [...compareIds, item.id] : compareIds.filter((id) => id !== item.id))} /> مقایسه</label></div><h3 className="line-clamp-1 text-xs font-black">{item.name}</h3><div className="mt-2 flex items-center justify-between text-[9px] text-slate-500"><span>⭐ {Number(item.rating || 0).toFixed(1)}</span><span>{fa(item.course_count)} دوره</span></div><Link href={`/institutes/${item.slug}`} className="mt-4 block rounded-[9px] bg-white/5 py-2 text-center text-[9px] font-black text-fuchsia-300">مشاهده آموزشگاه</Link></article>)}</div></section>

      {/* Quick registration */}
      <section id="quick-register" className="scroll-mt-36 border-t border-white/5 bg-[#070a1c] py-14"><div className="mx-auto max-w-3xl px-4 md:px-8"><LeadForm institute={institute} profile={profile} courses={courses} type="registration" /></div></section>

      {/* floating contact */}
      <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2"><a href={`tel:${institute.mobile || institute.phone || ""}`} aria-label="تماس" className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-600 shadow-xl"><Phone className="h-5 w-5" /></a>{whatsapp && <a href={`https://wa.me/${whatsapp.replace(/^0/, "98").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label="واتساپ" className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 shadow-xl"><MessageCircle className="h-5 w-5" /></a>}{profile.social.telegram && <a href={profile.social.telegram.startsWith("http") ? profile.social.telegram : `https://t.me/${profile.social.telegram.replace(/^@/, "")}`} target="_blank" rel="noreferrer" aria-label="تلگرام" className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 shadow-xl"><Send className="h-5 w-5" /></a>}<Link href="/chat" aria-label="چت آنلاین" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-[#171337] shadow-xl"><MessageCircle className="h-5 w-5" /></Link></div>

      {recommendOpen && <RecommendationModal form={recommendForm} setForm={setRecommendForm} courses={recommended} onClose={() => setRecommendOpen(false)} />}
      {showCompare && <CompareModal current={institute} similar={similar.filter((item) => compareIds.includes(item.id))} onClose={() => setShowCompare(false)} />}
    </main>
  );
}

function LeadForm({ institute, profile, courses, type }: { institute: any; profile: AdvancedInstituteProfile; courses: any[]; type: "registration" | "consultation" }) {
  const [form, setForm] = useState({ fullName: "", phone: "", courseId: "", preferredDate: "", preferredTime: "", advisor: profile.advisors[0]?.name || "", notes: "" });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const submit = async () => {
    setSending(true); setMessage("");
    const response = await fetch(`/api/institutes/${institute.slug}/engage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, type }) });
    const data = await response.json().catch(() => ({}));
    setSending(false); setMessage(response.ok ? `✅ ${data.message}` : `❌ ${data.error || "ثبت درخواست انجام نشد"}`);
    if (response.ok) setForm({ ...form, fullName: "", phone: "", notes: "" });
  };
  return <div className="rounded-[24px] border border-fuchsia-500/25 bg-gradient-to-br from-purple-700/35 to-fuchsia-700/20 p-5 md:p-7"><div className="mb-5 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-fuchsia-500"><CalendarDays className="h-6 w-6" /></div><div><h2 className="text-lg font-black">{type === "consultation" ? "رزرو مشاوره رایگان" : "ثبت‌نام سریع"}</h2><p className="mt-1 text-[9px] text-slate-400">{type === "consultation" ? "روز، ساعت و مشاور را انتخاب کنید." : "نام، شماره موبایل و دوره را وارد کنید."}</p></div></div><div className="grid gap-3 sm:grid-cols-2"><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="نام و نام خانوادگی" className="rounded-[11px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500" /><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="شماره موبایل" dir="ltr" className="rounded-[11px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500" />{type === "registration" ? <select value={form.courseId} onChange={(event) => setForm({ ...form, courseId: event.target.value })} className="rounded-[11px] border border-white/10 bg-[#171337] px-4 py-3 text-sm text-white sm:col-span-2"><option value="">انتخاب دوره</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select> : <><input type="date" value={form.preferredDate} onChange={(event) => setForm({ ...form, preferredDate: event.target.value })} className="rounded-[11px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white" /><input type="time" value={form.preferredTime} onChange={(event) => setForm({ ...form, preferredTime: event.target.value })} className="rounded-[11px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white" /><select value={form.advisor} onChange={(event) => setForm({ ...form, advisor: event.target.value })} className="rounded-[11px] border border-white/10 bg-[#171337] px-4 py-3 text-sm text-white sm:col-span-2">{profile.advisors.map((advisor) => <option key={advisor.id} value={advisor.name}>{advisor.name} — {advisor.specialty}</option>)}</select></>}<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={2} placeholder="توضیح کوتاه (اختیاری)" className="resize-none rounded-[11px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 sm:col-span-2" /></div><button type="button" onClick={submit} disabled={sending} className="mt-4 w-full rounded-[11px] bg-gradient-to-l from-fuchsia-500 to-purple-600 py-3 text-sm font-black disabled:opacity-50">{sending ? "در حال ثبت..." : type === "consultation" ? "رزرو مشاوره" : "ثبت درخواست"}</button>{message && <div className="mt-3 rounded-[9px] bg-black/20 p-3 text-xs font-bold">{message}</div>}</div>;
}

function RecommendationModal({ form, setForm, courses, onClose }: { form: any; setForm: (value: any) => void; courses: any[]; onClose: () => void }) {
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" onClick={onClose}><div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-[24px] border border-fuchsia-500/25 bg-[#0c1026] p-5" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black"><Sparkles className="h-5 w-5 text-fuchsia-300" /> پیشنهاد هوشمند دوره</h3><p className="mt-1 text-[9px] text-slate-500">پیشنهاد بر اساس اطلاعات فعلی دوره‌های همین آموزشگاه</p></div><button onClick={onClose} className="rounded-full bg-white/5 p-2"><X className="h-4 w-4" /></button></div><div className="grid gap-3 sm:grid-cols-2"><input value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} placeholder="سن" className="rounded-[10px] bg-white/10 px-3 py-3 text-sm" /><input value={form.job} onChange={(event) => setForm({ ...form, job: event.target.value })} placeholder="شغل فعلی" className="rounded-[10px] bg-white/10 px-3 py-3 text-sm" /><input value={form.interest} onChange={(event) => setForm({ ...form, interest: event.target.value })} placeholder="علاقه؛ مثلاً فتوشاپ یا خیاطی" className="rounded-[10px] bg-white/10 px-3 py-3 text-sm sm:col-span-2" /><input type="number" value={form.budget} onChange={(event) => setForm({ ...form, budget: event.target.value })} placeholder="حداکثر بودجه (تومان)" className="rounded-[10px] bg-white/10 px-3 py-3 text-sm" /><select value={form.freeTime} onChange={(event) => setForm({ ...form, freeTime: event.target.value })} className="rounded-[10px] bg-[#171337] px-3 py-3 text-sm"><option value="">زمان آزاد</option><option value="کم">کم</option><option value="متوسط">متوسط</option><option value="زیاد">زیاد</option></select></div><div className="mt-6 space-y-2"><h4 className="mb-3 text-xs font-black text-fuchsia-300">پیشنهادهای مناسب شما</h4>{courses.map((course, index) => <Link key={`${course.mode}-${course.id}`} href={course.mode === "online" ? `/shop/${course.slug}` : `/courses/${course.slug}`} className="flex items-center gap-3 rounded-[13px] border border-white/10 bg-white/[0.035] p-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-fuchsia-500 text-xs font-black">{index + 1}</span><div className="flex-1"><b className="text-xs">{course.title}</b><p className="mt-1 text-[9px] text-slate-500">{course.mode === "online" ? "آنلاین" : "حضوری"} • {Number(course.price || 0).toLocaleString("fa-IR")} تومان</p></div><Target className="h-4 w-4 text-emerald-300" /></Link>)}</div></div></div>;
}

function CompareModal({ current, similar, onClose }: { current: any; similar: any[]; onClose: () => void }) {
  const list = [current, ...similar.filter((item) => item.id !== current.id)].slice(0, 4);
  return <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm" onClick={onClose}><div className="max-h-[92dvh] w-full max-w-5xl overflow-auto rounded-[24px] border border-fuchsia-500/25 bg-[#0c1026] p-5" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h3 className="text-lg font-black">مقایسه آموزشگاه‌ها</h3><button onClick={onClose} className="rounded-full bg-white/5 p-2"><X className="h-4 w-4" /></button></div><table className="w-full min-w-[700px] text-xs"><thead><tr><th className="p-3 text-right text-slate-500">معیار</th>{list.map((item) => <th key={item.id} className="p-3 text-center">{item.name}</th>)}</tr></thead><tbody className="divide-y divide-white/5">{[["امتیاز",(item:any)=>Number(item.rating||0).toFixed(1)],["تعداد نظر",(item:any)=>fa(item.reviewCount||item.review_count)],["دوره‌ها",(item:any)=>fa(item.courseCount||item.course_count)],["مجوز",(item:any)=>item.isVerified||item.is_verified?"تأییدشده":"ثبت‌شده"],["منطقه",(item:any)=>item.regionName||item.region_name||"—"]].map(([label,getter]:any) => <tr key={label}><td className="p-3 font-black text-slate-400">{label}</td>{list.map((item) => <td key={item.id} className="p-3 text-center text-slate-300">{getter(item)}</td>)}</tr>)}</tbody></table></div></div>;
}
