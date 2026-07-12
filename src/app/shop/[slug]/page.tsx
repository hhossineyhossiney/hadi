"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSession } from "next-auth/react";
import {
  PlayCircle, Lock, CheckCircle2, Star, Users, Clock, BookOpen, Award,
  ShoppingCart, Download, LifeBuoy, Video, FileText, ChevronDown, ChevronUp,
  Shield, Sparkles, ArrowLeft, Loader2, Play, Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Lesson = {
  id: number;
  title: string;
  type: string;
  description: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  videoDuration: number;
  isFree: boolean;
  isLocked: boolean;
  content: string | null;
};

type Chapter = {
  id: number;
  title: string;
  description: string | null;
  coverImage: string | null;
  isFree: boolean;
  lessons: Lesson[];
};

type Course = {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImage: string | null;
  trailerVideo: string | null;
  instructor: string | null;
  instructorTitle: string | null;
  instructorAvatar: string | null;
  instructorBio: string | null;
  level: string | null;
  price: string;
  originalPrice: string | null;
  discountPercent: number;
  totalLessons: number;
  totalChapters: number;
  totalDuration: number;
  studentsCount: number;
  rating: string;
  ratingCount: number;
  features: string[];
  requirements: string[];
  targetAudience: string[];
  hasSupport: boolean;
  hasCertificate: boolean;
  hasDownload: boolean;
  lifetimeAccess: boolean;
};

function fmt(n: number | string) {
  return (Number(n) || 0).toLocaleString("fa-IR");
}
function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function VideoPlayer({ url, provider = "direct" }: { url: string; provider?: string }) {
  if (!url) return null;
  // Detect provider
  if (provider === "youtube" || /youtube\.com|youtu\.be/.test(url)) {
    const id = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (id) return <iframe className="w-full aspect-video rounded-[16px]" src={`https://www.youtube.com/embed/${id}`} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />;
  }
  if (provider === "aparat" || /aparat\.com/.test(url)) {
    const id = url.match(/aparat\.com\/v\/([a-zA-Z0-9]+)/)?.[1];
    if (id) return <iframe className="w-full aspect-video rounded-[16px]" src={`https://www.aparat.com/video/video/embed/videohash/${id}/vt/frame`} allowFullScreen />;
  }
  if (provider === "drive" || /drive\.google\.com/.test(url)) {
    const id = url.match(/\/d\/([^\/]+)/)?.[1];
    if (id) return <iframe className="w-full aspect-video rounded-[16px]" src={`https://drive.google.com/file/d/${id}/preview`} allow="autoplay" allowFullScreen />;
  }
  if (provider === "vimeo" || /vimeo\.com/.test(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (id) return <iframe className="w-full aspect-video rounded-[16px]" src={`https://player.vimeo.com/video/${id}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />;
  }
  return <video className="w-full aspect-video rounded-[16px] bg-black" src={url} controls />;
}

export default function ShopCourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<{ course: Course; institute: any; chapters: Chapter[]; hasPurchased: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openChapters, setOpenChapters] = useState<Record<number, boolean>>({});
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [buying, setBuying] = useState(false);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"chapters" | "about" | "instructor" | "reviews">("chapters");

  useEffect(() => {
    fetch(`/api/shop/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setMsg("❌ " + d.error); }
        else { setData(d); const first = d.chapters?.[0]?.id; if (first) setOpenChapters({ [first]: true }); }
        setLoading(false);
      });
  }, [slug]);

  const toggleChapter = (id: number) => setOpenChapters(p => ({ ...p, [id]: !p[id] }));

  const buy = async (method: "wallet" | "online") => {
    if (!session) { router.push(`/login?callbackUrl=/shop/${slug}`); return; }
    if (!data) return;
    setBuying(true); setMsg("");
    try {
      const res = await fetch("/api/shop/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: data.course.id, method }),
      });
      const d = await res.json();
      if (!res.ok) { setMsg("❌ " + d.error); }
      else {
        setMsg("✅ خرید موفق! در حال بارگذاری دوره...");
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (e: any) {
      setMsg("❌ خطا در ارتباط");
    }
    setBuying(false);
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    </>
  );
  if (!data) return (
    <>
      <Navbar />
      <div className="pt-32 min-h-screen text-center px-4">
        <div className="text-lg font-black text-text-primary">دوره یافت نشد</div>
        {msg && <p className="text-error-500 mt-4">{msg}</p>}
        <Link href="/shop" className="mt-6 inline-block px-6 py-3 rounded-[12px] gradient-button text-white font-black">بازگشت به فروشگاه</Link>
      </div>
    </>
  );

  const { course, institute, chapters, hasPurchased } = data;
  const price = Number(course.price);
  const original = course.originalPrice ? Number(course.originalPrice) : null;
  const durationH = Math.floor(course.totalDuration / 60);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-[#082D53] via-[#0B4F8B] to-[#0A3D6E] overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-secondary-500/20 blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 text-white">
                <Link href="/shop" className="inline-flex items-center gap-1 text-xs text-primary-300 hover:text-primary-200 mb-4">
                  <ArrowLeft className="w-3.5 h-3.5" /> بازگشت به فروشگاه
                </Link>

                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {course.level && (
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-black text-white">
                      {course.level === "beginner" ? "مقدماتی" : course.level === "intermediate" ? "متوسط" : "پیشرفته"}
                    </span>
                  )}
                  {course.discountPercent > 0 && (
                    <span className="px-3 py-1 rounded-full bg-error-500 text-white text-[10px] font-black">
                      {course.discountPercent}٪ تخفیف ویژه
                    </span>
                  )}
                  {institute && (
                    <Link href={`/institutes/${institute.slug}`} className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-200 text-[10px] font-black hover:bg-primary-500/30">
                      {institute.name}
                    </Link>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">{course.title}</h1>
                <p className="text-sm md:text-lg text-slate-300 mb-6 leading-relaxed">
                  {course.subtitle
                    || (course.description
                          ? (course.description.split(/[\n\r]/)[0] || course.description).slice(0, 220) + (course.description.length > 220 ? "..." : "")
                          : `${course.title} را ساده اما حرفه‌ای یاد بگیرید — آموزش پروژه‌محور با گواهینامه معتبر، پشتیبانی مستقیم مدرس و دسترسی مادام‌العمر`)}
                </p>

                {/* Meta stats */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-black">{Number(course.rating).toFixed(1)}</span>
                    <span className="text-xs text-slate-400">({fmt(course.ratingCount)} امتیاز)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300"><Users className="w-4 h-4" /><span className="text-xs font-bold">{fmt(course.studentsCount)} دانشجو</span></div>
                  <div className="flex items-center gap-1.5 text-slate-300"><BookOpen className="w-4 h-4" /><span className="text-xs font-bold">{fmt(course.totalLessons)} درس</span></div>
                  <div className="flex items-center gap-1.5 text-slate-300"><Clock className="w-4 h-4" /><span className="text-xs font-bold">{fmt(durationH)} ساعت</span></div>
                </div>

                {/* Instructor */}
                {course.instructor && (
                  <div className="flex items-center gap-3 p-4 rounded-[16px] bg-white/5 backdrop-blur-sm border border-white/10 max-w-md">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-lg font-black shrink-0">
                      {course.instructorAvatar ? <img src={course.instructorAvatar} className="w-full h-full rounded-full object-cover" /> : course.instructor.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-bold">مدرس</div>
                      <div className="text-sm font-black truncate">{course.instructor}</div>
                      {course.instructorTitle && <div className="text-[10px] text-primary-300 truncate">{course.instructorTitle}</div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Purchase Card */}
              <div className="lg:sticky lg:top-24">
                <div className="bg-white dark:bg-[#082D53] rounded-[22px] overflow-hidden shadow-2xl border border-white/10">
                  {/* Cover / trailer */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary-500 to-secondary-500">
                    {course.coverImage ? (
                      <img src={course.coverImage} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PlayCircle className="w-16 h-16 text-white/70" />
                      </div>
                    )}
                    {course.trailerVideo && (
                      <button
                        onClick={() => setPreviewLesson({ id: 0, title: "پیش‌نمایش دوره", type: "video", videoUrl: course.trailerVideo, videoDuration: 0, isFree: true, isLocked: false, description: null, content: null } as any)}
                        className="absolute inset-0 bg-black/40 hover:bg-black/60 transition flex items-center justify-center group"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                          <Play className="w-10 h-10 text-primary-600 mr-1" fill="currentColor" />
                        </div>
                      </button>
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    {/* Price */}
                    <div>
                      {original && original > price && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 line-through font-bold" dir="ltr">
                          {fmt(original)} تومان
                        </div>
                      )}
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900 dark:text-white" dir="ltr">{fmt(price)}</span>
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">تومان</span>
                      </div>
                      {course.discountPercent > 0 && (
                        <div className="mt-1 text-[11px] text-error-500 font-black">
                          💰 صرفه‌جویی: {fmt(original! - price)} تومان
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    {msg && (
                      <div className={`p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-500" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"}`}>
                        {msg}
                      </div>
                    )}

                    {hasPurchased ? (
                      <div className="p-4 rounded-[14px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-center">
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-black text-sm">شما این دوره را خریداری کرده‌اید</div>
                        <div className="text-[11px] mt-1 opacity-80">همه فصل‌ها برای شما آزاد هستند</div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => buy("wallet")}
                          disabled={buying}
                          className="w-full py-3.5 rounded-[14px] gradient-button hover:gradient-button-hover text-white font-black text-sm shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
                        >
                          {buying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                          خرید و ثبت‌نام فوری
                        </button>
                        <div className="text-[10px] text-slate-500 text-center">💳 پرداخت از کیف پول یا درگاه آنلاین</div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                      {[
                        { icon: Video, label: `${fmt(course.totalLessons)} درس ویدئویی` },
                        { icon: Clock, label: `${fmt(durationH)} ساعت محتوا` },
                        { icon: BookOpen, label: `${fmt(course.totalChapters)} فصل کامل` },
                        ...(course.hasCertificate ? [{ icon: Award, label: "گواهینامه معتبر" }] : []),
                        ...(course.hasSupport ? [{ icon: LifeBuoy, label: "پشتیبانی مستقیم" }] : []),
                        ...(course.hasDownload ? [{ icon: Download, label: "امکان دانلود" }] : []),
                        ...(course.lifetimeAccess ? [{ icon: Shield, label: "دسترسی مادام‌العمر" }] : []),
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-xs">
                          <f.icon className="w-4 h-4 text-primary-500 shrink-0" />
                          <span className="font-bold">{f.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body — Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-1 border-b border-[var(--border-default)] mb-6 overflow-x-auto">
                {[
                  { k: "chapters", l: "سرفصل‌ها", count: chapters.length },
                  { k: "about", l: "درباره دوره" },
                  { k: "instructor", l: "درباره مدرس" },
                ].map(t => (
                  <button
                    key={t.k}
                    onClick={() => setActiveTab(t.k as any)}
                    className={`px-4 py-3 text-sm font-black transition-all whitespace-nowrap border-b-2 ${
                      activeTab === t.k
                        ? "text-primary-500 border-primary-500"
                        : "text-text-secondary border-transparent hover:text-primary-500"
                    }`}
                  >
                    {t.l} {t.count !== undefined && <span className="text-[10px] opacity-70">({fmt(t.count)})</span>}
                  </button>
                ))}
              </div>

              {activeTab === "chapters" && (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm text-text-secondary font-bold">
                      شامل {fmt(course.totalChapters)} فصل و {fmt(course.totalLessons)} درس
                    </div>
                    <button onClick={() => setOpenChapters(chapters.reduce((a, c) => ({ ...a, [c.id]: true }), {}))} className="text-xs text-primary-500 hover:underline font-bold">
                      باز کردن همه بخش‌ها
                    </button>
                  </div>

                  <div className="space-y-2">
                    {chapters.map((ch, chi) => (
                      <div key={ch.id} className="bg-[var(--bg-glass-card)] border border-[var(--border-default)] rounded-[14px] overflow-hidden">
                        <button
                          onClick={() => toggleChapter(ch.id)}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 hover:bg-[var(--panel-hover,rgba(11,79,139,0.06))] text-right"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-primary-500/15 text-primary-500 flex items-center justify-center font-black text-xs shrink-0">
                              {(chi + 1).toLocaleString("fa-IR")}
                            </div>
                            {ch.coverImage && (
                              <img src={ch.coverImage} className="w-12 h-12 rounded-[10px] object-cover shrink-0 border border-[var(--border-default)]" />
                            )}
                            <div className="text-right flex-1 min-w-0">
                              <div className="font-black text-sm text-text-primary truncate">{ch.title}</div>
                              <div className="text-[10px] text-text-tertiary mt-0.5">{fmt(ch.lessons.length)} درس {ch.isFree && "• رایگان"}</div>
                            </div>
                          </div>
                          {openChapters[ch.id] ? <ChevronUp className="w-4 h-4 text-text-tertiary" /> : <ChevronDown className="w-4 h-4 text-text-tertiary" />}
                        </button>

                        <AnimatePresence>
                          {openChapters[ch.id] && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-[var(--border-default)]"
                            >
                              <div className="divide-y divide-[var(--border-default)]">
                                {ch.lessons.map((l) => {
                                  const canView = l.isFree || hasPurchased;
                                  return (
                                    <button
                                      key={l.id}
                                      disabled={!canView}
                                      onClick={() => canView && l.videoUrl && setPreviewLesson(l)}
                                      className={`w-full flex items-center gap-3 px-5 py-3 text-right hover:bg-[var(--panel-hover,rgba(11,79,139,0.06))] transition ${canView ? "cursor-pointer" : "opacity-70 cursor-not-allowed"}`}
                                    >
                                      {l.coverImage ? (
                                        <img src={l.coverImage} className="w-9 h-9 rounded-[8px] object-cover shrink-0 border border-[var(--border-default)]" />
                                      ) : canView ? (
                                        <PlayCircle className="w-4 h-4 text-primary-500 shrink-0" />
                                      ) : (
                                        <Lock className="w-4 h-4 text-text-tertiary shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <span className="text-sm font-bold text-text-primary truncate">{l.title}</span>
                                        {l.isFree && !hasPurchased && (
                                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] font-black shrink-0">
                                            رایگان
                                          </span>
                                        )}
                                      </div>
                                      {l.videoDuration > 0 && (
                                        <span className="text-[11px] text-text-tertiary font-bold shrink-0" dir="ltr">
                                          {fmtTime(l.videoDuration)}
                                        </span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="space-y-8">
                  {course.description && (
                    <div>
                      <h3 className="text-lg font-black text-text-primary mb-3">توضیحات دوره</h3>
                      <div className="text-sm text-text-secondary leading-loose whitespace-pre-wrap">{course.description}</div>
                    </div>
                  )}

                  {course.features && course.features.length > 0 && (
                    <div>
                      <h3 className="text-lg font-black text-text-primary mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary-500" /> در این دوره یاد می‌گیرید
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-[12px] bg-[var(--bg-glass-card)] border border-[var(--border-default)]">
                            <CheckCircle2 className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-text-primary font-semibold">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="text-lg font-black text-text-primary mb-3">پیش‌نیازها</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="text-primary-500 mt-1">•</span> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.targetAudience && course.targetAudience.length > 0 && (
                    <div>
                      <h3 className="text-lg font-black text-text-primary mb-3">این دوره برای چه کسانی مناسب است؟</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {course.targetAudience.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-[12px] bg-primary-500/5 border border-primary-500/20">
                            <Sparkles className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                            <span className="text-sm text-text-primary font-semibold">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "instructor" && (
                <div className="bg-[var(--bg-glass-card)] rounded-[18px] border border-[var(--border-default)] p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-2xl font-black shrink-0">
                      {course.instructorAvatar ? <img src={course.instructorAvatar} className="w-full h-full rounded-full object-cover" /> : (course.instructor || "-").charAt(0)}
                    </div>
                    <div>
                      <div className="text-lg font-black text-text-primary">{course.instructor}</div>
                      {course.instructorTitle && <div className="text-sm text-primary-500 font-bold mt-1">{course.instructorTitle}</div>}
                    </div>
                  </div>
                  {course.instructorBio ? (
                    <p className="text-sm text-text-secondary leading-loose whitespace-pre-wrap">{course.instructorBio}</p>
                  ) : (
                    <p className="text-sm text-text-tertiary">توضیحات مدرس در دسترس نیست.</p>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar: institute info */}
            <div className="lg:col-span-1">
              {institute && (
                <div className="bg-[var(--bg-glass-card)] rounded-[18px] border border-[var(--border-default)] p-5">
                  <div className="text-xs text-text-tertiary font-bold mb-2">ارائه‌دهنده دوره</div>
                  <Link href={`/institutes/${institute.slug}`} className="block group">
                    <div className="text-base font-black text-text-primary group-hover:text-primary-500 mb-2">{institute.name}</div>
                    <div className="text-[11px] text-text-tertiary" dir="ltr">{institute.phone || ""}</div>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Preview / Video Modal */}
      {previewLesson && previewLesson.videoUrl && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewLesson(null)}>
          <div className="w-full max-w-4xl bg-slate-900 rounded-[16px] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div className="text-sm font-black text-white truncate">{previewLesson.title}</div>
              <button onClick={() => setPreviewLesson(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">✕</button>
            </div>
            <VideoPlayer url={previewLesson.videoUrl} />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
