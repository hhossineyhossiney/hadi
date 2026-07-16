"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Bookmark,
  Calendar,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { pickCategoryVisual } from "@/lib/category-visuals";

export interface CourseCardData {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fullDescription?: string | null;
  duration: string | null;
  price: string | null;
  originalPrice?: string | null;
  capacity: number | null;
  enrolledCount: number | null;
  instructor: string | null;
  startDate?: string | null;
  categoryName: string | null;
  instituteName: string | null;
  instituteSlug?: string | null;
  image?: string | null;
  regionName?: string | null;
}

// Per-category color palette (glow + accent + button)
function getPalette(category: string | null, index: number) {
  const palettes = [
    // Purple / Magenta (default / زیبایی)
    {
      glowFrom: "rgba(168, 85, 247, 0.55)",
      glowTo: "rgba(236, 72, 153, 0.35)",
      accent: "text-fuchsia-300",
      badge: "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200",
      button: "from-fuchsia-500 via-purple-500 to-pink-500",
      bookmark: "text-fuchsia-300",
    },
    // Blue / Cyan (کامپیوتر / ICDL)
    {
      glowFrom: "rgba(59, 130, 246, 0.55)",
      glowTo: "rgba(14, 165, 233, 0.35)",
      accent: "text-cyan-300",
      badge: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200",
      button: "from-blue-500 via-cyan-500 to-sky-500",
      bookmark: "text-cyan-300",
    },
    // Pink / Rose (مراقبت زیبایی)
    {
      glowFrom: "rgba(236, 72, 153, 0.55)",
      glowTo: "rgba(244, 63, 94, 0.35)",
      accent: "text-pink-300",
      badge: "bg-pink-500/20 border-pink-400/40 text-pink-200",
      button: "from-pink-500 via-rose-500 to-red-500",
      bookmark: "text-pink-300",
    },
    // Gold / Amber (کاشت ناخن / لوکس)
    {
      glowFrom: "rgba(245, 158, 11, 0.55)",
      glowTo: "rgba(217, 119, 6, 0.35)",
      accent: "text-amber-300",
      badge: "bg-amber-500/20 border-amber-400/40 text-amber-200",
      button: "from-amber-500 via-yellow-500 to-orange-500",
      bookmark: "text-amber-300",
    },
    // Emerald / Teal (تغذیه / سلامت)
    {
      glowFrom: "rgba(16, 185, 129, 0.55)",
      glowTo: "rgba(20, 184, 166, 0.35)",
      accent: "text-emerald-300",
      badge: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
      button: "from-emerald-500 via-teal-500 to-cyan-500",
      bookmark: "text-emerald-300",
    },
    // Indigo (طراحی / آموزش)
    {
      glowFrom: "rgba(99, 102, 241, 0.55)",
      glowTo: "rgba(139, 92, 246, 0.35)",
      accent: "text-indigo-300",
      badge: "bg-indigo-500/20 border-indigo-400/40 text-indigo-200",
      button: "from-indigo-500 via-violet-500 to-purple-500",
      bookmark: "text-indigo-300",
    },
  ];
  const cat = (category || "").toLowerCase();
  if (/(کامپیوتر|icdl|فناوری|it)/i.test(cat)) return palettes[1];
  if (/(زیبایی|مراقبت|آرایش)/i.test(cat)) return palettes[2];
  if (/(ناخن|کاشت|طلا|لوکس)/i.test(cat)) return palettes[3];
  if (/(تغذیه|آشپز|سلامت)/i.test(cat)) return palettes[4];
  if (/(خیاطی|طراحی|لباس)/i.test(cat)) return palettes[5];
  return palettes[index % palettes.length];
}

export default function CourseCard({
  course,
  index = 0,
}: {
  course: CourseCardData;
  index?: number;
}) {
  // Smart visual: pick a curated image + palette based on title/category
  const visual = pickCategoryVisual(course.title, course.categoryName, course.description);
  const pal = visual.palette;
  const fallbackImage = visual.image;
  // legacy palette (kept but unused for compatibility)
  void getPalette;
  const cap = course.capacity || 0;
  const filled = course.enrolledCount || 0;
  const pct = cap > 0 ? Math.min(100, Math.round((filled / cap) * 100)) : 0;

  const priceNum = Number(course.price || 0);
  const originalNum = Number(course.originalPrice || 0);
  const hasDiscount = originalNum > priceNum && priceNum > 0;
  const discountPct = hasDiscount
    ? Math.round(((originalNum - priceNum) / originalNum) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="relative h-full group">
        {/* Ambient glow behind card */}
        <div
          className="absolute -inset-1 rounded-[42px] opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(60% 50% at 30% 20%, ${pal.glowFrom} 0%, transparent 60%), radial-gradient(50% 50% at 70% 90%, ${pal.glowTo} 0%, transparent 60%)`,
          }}
        />

        {/* Main card body (organic shape via border-radius asymmetry) */}
        <div
          className="relative h-full flex flex-col rounded-[36px] overflow-hidden bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 backdrop-blur-xl border border-white/10 group-hover:border-white/25 transition-all duration-500"
          style={{
            borderRadius: "48px 28px 48px 28px / 32px 48px 32px 48px",
          }}
        >
          {/* Inner glow accents */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ background: pal.glowFrom }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-50"
            style={{ background: pal.glowTo }}
          />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Top row: organic image + right side info */}
          <div className="relative flex items-start gap-3 p-5 pb-3">
            {/* Organic blob image on the right (RTL) */}
            <div className="relative shrink-0 w-[130px] sm:w-[150px] h-[130px] sm:h-[150px] -mt-1 -mr-1">
              <div
                className="absolute inset-0 rounded-full opacity-70 blur-2xl"
                style={{ background: pal.glowFrom }}
              />
              <div
                className="relative w-full h-full overflow-hidden ring-1 ring-white/15"
                style={{
                  borderRadius:
                    "62% 38% 55% 45% / 50% 60% 40% 50%",
                }}
              >
                <img
                  src={course.image || fallbackImage}
                  alt={course.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (t.src !== fallbackImage) t.src = fallbackImage;
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Subtle sparkle overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 mix-blend-overlay pointer-events-none" />
              </div>

              {/* Emoji badge — outside the clipped blob so it always stays on top */}
              <div className="absolute bottom-1 left-1 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/25 shadow-xl flex items-center justify-center text-lg pointer-events-none">
                {visual.icon}
              </div>
            </div>

            {/* Right-side content */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* badge + bookmark */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black backdrop-blur ${pal.badge}`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  دوره آموزشی
                </span>
                <button
                  className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition ${pal.bookmark}`}
                  title="ذخیره"
                  aria-label="ذخیره"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white leading-tight mb-1.5 line-clamp-2 group-hover:text-white transition-colors">
                {course.title}
              </h3>
              {course.description && (
                <p className="text-[11.5px] text-slate-400 leading-relaxed line-clamp-2">
                  {course.description}
                </p>
              )}
            </div>
          </div>

          {/* Instructor row */}
          {course.instructor && (
            <div className="relative px-5 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${pal.button} flex items-center justify-center shrink-0 text-white text-[10px] font-black`}
                >
                  {course.instructor?.trim().charAt(0) || "م"}
                </div>
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="text-[10px] text-slate-500">مدرس:</span>
                  <span className="text-[11.5px] font-black text-white truncate">
                    {course.instructor}
                  </span>
                </div>
              </div>
              {course.categoryName && (
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[45%]">
                  {course.categoryName}
                </span>
              )}
            </div>
          )}

          {/* Stats bar */}
          <div className="relative mx-5 mt-2 mb-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10">
              <Calendar className={`w-4 h-4 ${pal.accent} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-500 leading-none">
                  جلسه آموزشی
                </span>
                <span className="text-sm font-black text-white leading-tight mt-0.5">
                  {cap > 0 ? cap : filled || "—"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10">
              <Clock className={`w-4 h-4 ${pal.accent} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-500 leading-none">
                  ساعت محتوا
                </span>
                <span className="text-sm font-black text-white leading-tight mt-0.5 truncate">
                  {course.duration || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {cap > 0 && (
            <div className="relative px-5 pb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                  <Users className="w-3 h-3" />
                  پیشرفت دوره
                </span>
                <span className={`text-xs font-black ${pal.accent}`}>{pct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-l ${pal.button}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          {/* Bottom row: price + CTA */}
          <div className="relative mt-auto p-4 sm:p-5 pt-3 flex items-end justify-between gap-3">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] text-slate-500 font-bold">
                شهریه دوره
              </span>
              {hasDiscount && (
                <span className="text-[10px] text-slate-500 line-through leading-none">
                  {originalNum.toLocaleString("fa-IR")}
                </span>
              )}
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-lg sm:text-xl font-black bg-gradient-to-l ${pal.button} bg-clip-text text-transparent leading-none`}
                >
                  {priceNum > 0
                    ? priceNum.toLocaleString("fa-IR")
                    : "رایگان"}
                </span>
                {priceNum > 0 && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    تومان
                  </span>
                )}
              </div>
            </div>
            <Link
              href={`/courses/${course.slug}`}
              className={`card-cta-breathe group/btn shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-white text-xs font-black bg-gradient-to-l ${pal.button} shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all`}
            >
              مشاهده دوره
              <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Angled discount ribbon — isolated in the image corner */}
          {hasDiscount && (
            <div
              className={`card-discount-ribbon pointer-events-none absolute top-6 -right-12 z-30 w-44 rotate-45 py-1.5 text-center text-[10px] sm:text-[11px] font-black text-white shadow-[0_6px_20px_rgba(0,0,0,0.35)] border-y border-white/25 bg-gradient-to-l ${pal.button}`}
            >
              {discountPct}٪ تخفیف
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
