"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, BookOpen, Building2 } from "lucide-react";
import { pickCategoryVisual } from "@/lib/category-visuals";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  courseCount: number | null;
  activeCourseCount?: number;
  instituteCount?: number;
}

export default function CategoryCards({ categories }: { categories: Category[] }) {
  return (
    <section className="relative py-20 lg:py-24 overflow-hidden">
      {/* Bg glow */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4"
            >
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
              <span className="text-xs font-black text-white tracking-widest">
                رشته‌های آموزشی
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              رشته‌ای که{" "}
              <span className="bg-gradient-to-l from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">
                عاشقشی
              </span>{" "}
              رو انتخاب کن
            </motion.h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              بیش از ۱۰ رشته تخصصی با گواهی رسمی فنی و حرفه‌ای
            </p>
          </div>
          <Link
            href="/fields"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-black transition"
          >
            همه رشته‌ها
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.slice(0, 12).map((c, i) => (
            <CategoryBlob key={c.id} cat={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── One organic blob card ──────────────────────────────────────
function CategoryBlob({ cat, index }: { cat: Category; index: number }) {
  const visual = pickCategoryVisual(cat.name, cat.description);
  const pal = visual.palette;
  const activeCount = cat.activeCourseCount ?? cat.courseCount ?? 0;
  const instituteCount = cat.instituteCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.5 }}
      className="h-full"
    >
      <Link href={`/fields/${cat.slug}`} className="block h-full group relative">
        {/* Ambient glow behind card */}
        <div
          className="absolute -inset-1 rounded-[42px] opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(60% 50% at 30% 20%, ${pal.glowFrom} 0%, transparent 60%), radial-gradient(50% 50% at 70% 90%, ${pal.glowTo} 0%, transparent 60%)`,
          }}
        />
        {/* Card body */}
        <div
          className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 backdrop-blur-xl border border-white/10 group-hover:border-white/25 transition-all duration-500 p-5"
          style={{
            borderRadius: "48px 28px 48px 28px / 32px 48px 32px 48px",
          }}
        >
          {/* Inner glows */}
          <div
            className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-70"
            style={{ background: pal.glowFrom }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ background: pal.glowTo }}
          />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Organic image */}
          <div className="relative mx-auto w-[150px] h-[150px] mb-4">
            <div
              className="absolute inset-0 rounded-full opacity-80 blur-2xl"
              style={{ background: pal.glowFrom }}
            />
            <div
              className="relative w-full h-full overflow-hidden ring-1 ring-white/15"
              style={{
                borderRadius: "62% 38% 55% 45% / 50% 60% 40% 50%",
              }}
            >
              <img
                src={visual.image}
                alt={cat.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30 mix-blend-overlay pointer-events-none" />
              {/* Emoji badge */}
              <div className="absolute -bottom-1 -left-1 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl">
                {visual.icon}
              </div>
            </div>
          </div>

          {/* Title */}
          <h3 className="relative text-center text-lg font-black text-white mb-1.5 line-clamp-1">
            {cat.name}
          </h3>
          {cat.description && (
            <p className="relative text-center text-[11px] text-slate-400 leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
              {cat.description}
            </p>
          )}

          {/* Stats */}
          <div className="relative grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <BookOpen className={`w-3.5 h-3.5 ${pal.accent}`} />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-slate-500">دوره فعال</span>
                <span className="text-xs font-black text-white">{activeCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-white/[0.04] border border-white/10">
              <Building2 className={`w-3.5 h-3.5 ${pal.accent}`} />
              <div className="flex flex-col leading-tight">
                <span className="text-[9px] text-slate-500">آموزشگاه</span>
                <span className="text-xs font-black text-white">{instituteCount}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className={`relative mt-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-white text-xs font-black bg-gradient-to-l ${pal.button} shadow-lg group-hover:shadow-2xl group-hover:scale-[1.02] transition-all`}
          >
            مشاهده دوره‌ها
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
