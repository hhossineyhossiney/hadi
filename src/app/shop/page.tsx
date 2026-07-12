"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Star, Users, Clock, PlayCircle, BookOpen, Award, TrendingUp, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

type ShopCourse = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  instructor: string | null;
  instructor_title: string | null;
  level: string | null;
  price: string;
  original_price: string | null;
  discount_percent: number;
  total_lessons: number;
  total_chapters: number;
  total_duration: number;
  students_count: number;
  rating: string;
  rating_count: number;
  is_featured: boolean;
  has_certificate: boolean;
  institute_id: number;
  institute_name: string;
  institute_slug: string;
  category_name: string | null;
  features: string[];
};

const gradientPalette = [
  "from-rose-500 via-pink-500 to-orange-400",
  "from-violet-600 via-purple-500 to-indigo-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-fuchsia-600 via-pink-500 to-rose-500",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-lime-500 via-emerald-500 to-teal-500",
];

const LEVELS: Record<string, string> = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

function fmt(n: number | string) {
  const v = Number(n) || 0;
  return v.toLocaleString("fa-IR");
}

function ShopCourseCard({ course, index }: { course: ShopCourse; index: number }) {
  const gradient = gradientPalette[index % gradientPalette.length];
  const price = Number(course.price);
  const original = course.original_price ? Number(course.original_price) : null;
  const durationH = Math.floor(course.total_duration / 60);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05 }}
      className="group relative bg-[var(--panel-surface,#0A3D6E)] rounded-[24px] overflow-hidden border border-[var(--border-default)] hover:border-primary-500/50 transition-all duration-300 hover-lift"
      style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.18)" }}
    >
      {/* Cover with gradient overlay */}
      <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradient} overflow-hidden`}>
        {course.cover_image ? (
          <img src={course.cover_image} alt={course.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Badges top */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {course.is_featured && (
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 text-black text-[10px] font-black shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ویژه
            </span>
          )}
          {course.discount_percent > 0 && (
            <span className="px-3 py-1.5 rounded-full bg-error-500 text-white text-[10px] font-black shadow-lg">
              {course.discount_percent}٪ تخفیف
            </span>
          )}
        </div>

        {/* Level badge bottom-left */}
        {course.level && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[10px] font-black">
              {LEVELS[course.level] || course.level}
            </span>
          </div>
        )}

        {/* Category badge */}
        {course.category_name && (
          <div className="absolute bottom-3 right-3">
            <span className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold">
              {course.category_name}
            </span>
          </div>
        )}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
            <PlayCircle className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-white">{Number(course.rating).toFixed(1)}</span>
            <span className="text-[10px] text-slate-400">({fmt(course.rating_count)})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-bold truncate max-w-[120px]">{course.institute_name}</span>
        </div>

        <h3 className="text-base font-black text-white mb-1 line-clamp-2 min-h-[48px] group-hover:text-primary-300 transition-colors">
          {course.title}
        </h3>

        {course.subtitle && (
          <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">{course.subtitle}</p>
        )}

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white text-[11px] font-black">
              {course.instructor.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black text-white truncate">{course.instructor}</div>
              {course.instructor_title && (
                <div className="text-[9px] text-slate-500 truncate">{course.instructor_title}</div>
              )}
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2 mb-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {fmt(course.total_lessons)} درس</div>
          <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {durationH > 0 ? `${fmt(durationH)}س` : `${fmt(course.total_duration)}د`}</div>
          <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {fmt(course.students_count)}</div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3">
          <div>
            {original && original > price && (
              <div className="text-[10px] text-slate-500 line-through font-bold" dir="ltr">
                {fmt(original)}
              </div>
            )}
            <div className="text-lg font-black gradient-text" dir="ltr">
              {fmt(price)}
              <span className="text-[10px] text-slate-400 mr-1">تومان</span>
            </div>
          </div>
          <Link
            href={`/shop/${course.slug}`}
            className="px-4 py-2 rounded-[10px] gradient-button hover:gradient-button-hover text-white text-xs font-black shadow-lg shadow-primary-500/25 transition-all"
          >
            جزئیات
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function ShopHero({ total }: { total: number }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#0A3D6E] via-[#0B4F8B] to-[#082D53] py-16 lg:py-24">
      {/* orbs */}
      <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-secondary-500/20 blur-3xl" />
      <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
        >
          <ShoppingBag className="w-4 h-4 text-primary-300" />
          <span className="text-xs font-black text-white">فروشگاه آنلاین دوره‌های زبرخان</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight"
        >
          دوره‌های <span className="gradient-text">آنلاین حرفه‌ای</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          بیش از {fmt(total)} دوره حرفه‌ای از آموزشگاه‌های معتبر — با گواهینامه رسمی، پشتیبانی مستقیم مدرس و دسترسی مادام‌العمر
        </motion.p>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-6"
        >
          {[
            { icon: Award, label: "گواهینامه معتبر" },
            { icon: TrendingUp, label: "بروزرسانی رایگان" },
            { icon: Users, label: "پشتیبانی مستقیم" },
            { icon: PlayCircle, label: "دسترسی مادام‌العمر" },
          ].map((it) => (
            <div key={it.label} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
              <it.icon className="w-4 h-4 text-primary-300" />
              <span className="text-[11px] font-bold text-white">{it.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [courses, setCourses] = useState<ShopCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    fetch("/api/shop?limit=200")
      .then(r => r.json())
      .then(d => { setCourses(d.courses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c => {
    if (q && !c.title.toLowerCase().includes(q.toLowerCase()) && !(c.subtitle || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (levelFilter !== "all" && c.level !== levelFilter) return false;
    return true;
  });

  const featured = filtered.filter(c => c.is_featured);
  const others = filtered.filter(c => !c.is_featured);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <ShopHero total={courses.length} />

        {/* Filter bar */}
        <div className="sticky top-20 z-30 bg-[var(--bg-canvas)] border-b border-[var(--border-default)] py-4 backdrop-blur-lg" style={{ background: "var(--nav-bg)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <div className="flex-1 relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="جستجوی دوره..."
                className="w-full pr-11 pl-4 py-3 rounded-[14px] bg-white/85 text-slate-900 text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-slate-500"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {[
                { k: "all", l: "همه سطوح" },
                { k: "beginner", l: "مقدماتی" },
                { k: "intermediate", l: "متوسط" },
                { k: "advanced", l: "پیشرفته" },
              ].map(o => (
                <button
                  key={o.k}
                  onClick={() => setLevelFilter(o.k)}
                  className={`px-4 py-3 rounded-[12px] text-xs font-black transition-all whitespace-nowrap ${
                    levelFilter === o.k
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                      : "bg-white/5 text-text-secondary hover:bg-white/10"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-[4/5] rounded-[24px] skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <ShoppingBag className="w-16 h-16 mx-auto text-text-tertiary mb-4" />
              <div className="text-lg font-black text-text-primary mb-2">هنوز دوره‌ای منتشر نشده</div>
              <div className="text-sm text-text-secondary">به‌زودی دوره‌های جدید اضافه می‌شن!</div>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h2 className="text-xl md:text-2xl font-black text-text-primary">دوره‌های ویژه و پرفروش</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featured.map((c, i) => <ShopCourseCard key={c.id} course={c} index={i} />)}
                  </div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="w-6 h-6 text-primary-400" />
                    <h2 className="text-xl md:text-2xl font-black text-text-primary">همه دوره‌های آنلاین</h2>
                    <span className="text-xs text-text-tertiary font-bold">({fmt(others.length)} دوره)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {others.map((c, i) => <ShopCourseCard key={c.id} course={c} index={i} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
