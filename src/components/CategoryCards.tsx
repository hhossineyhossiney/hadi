"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, BookOpen, Building2, MoveLeft } from "lucide-react";
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
    <section className="relative py-12 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-fuchsia-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="px-4 sm:px-6 lg:px-8 flex items-end justify-between mb-6 gap-3">
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-300" />
              <span className="text-[10px] font-black text-white tracking-wider">رشته‌های آموزشی</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight"
            >
              رشته‌ای که <span className="bg-gradient-to-l from-fuchsia-300 to-blue-300 bg-clip-text text-transparent">عاشقشی</span> رو انتخاب کن
            </motion.h2>
            <p className="hidden sm:block mt-2 text-xs text-slate-400">
              رشته‌های تخصصی با گواهی رسمی فنی و حرفه‌ای
            </p>
          </div>
          <Link
            href="/fields"
            className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] sm:text-xs font-black transition"
          >
            همه رشته‌ها
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="px-4 sm:px-6 md:hidden flex items-center gap-1.5 text-[10px] font-bold text-slate-500 mb-2">
          <MoveLeft className="w-3.5 h-3.5" /> برای دیدن همه رشته‌ها، کارت‌ها را ورق بزنید
        </div>

        <div
          className="px-4 sm:px-6 lg:px-8 overflow-x-auto md:overflow-visible scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-pan-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="فهرست رشته‌های آموزشی"
        >
          <div className="flex w-max gap-3 pb-3 md:w-auto md:grid md:grid-cols-3 lg:grid-cols-5 md:gap-4">
            {categories.map((category, index) => (
              <CategoryCompactCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryCompactCard({ category, index }: { category: Category; index: number }) {
  const visual = pickCategoryVisual(category.name, category.description);
  const palette = visual.palette;
  const activeCount = category.activeCourseCount ?? category.courseCount ?? 0;
  const instituteCount = category.instituteCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: (index % 6) * 0.04, duration: 0.42 }}
      className="h-full w-[68vw] max-w-[230px] sm:w-[205px] md:w-auto md:max-w-none shrink-0 snap-start"
    >
      <Link
        href={`/fields/${category.slug}`}
        aria-label={`مشاهده دوره‌های ${category.name}`}
        className="block h-full group relative"
      >
        <div
          className="absolute -inset-0.5 rounded-[30px] opacity-45 blur-xl group-hover:opacity-80 transition-opacity duration-400 pointer-events-none"
          style={{
            background: `radial-gradient(60% 55% at 35% 20%, ${palette.glowFrom} 0%, transparent 65%), radial-gradient(55% 55% at 70% 90%, ${palette.glowTo} 0%, transparent 65%)`,
          }}
        />

        <article
          className="relative h-full min-h-[258px] flex flex-col overflow-hidden bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 border border-white/10 group-hover:border-white/25 group-hover:-translate-y-1 transition-all duration-400 p-3.5"
          style={{ borderRadius: "34px 20px 34px 20px / 24px 34px 24px 34px" }}
        >
          <div
            className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-55 pointer-events-none"
            style={{ background: palette.glowFrom }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-40 pointer-events-none"
            style={{ background: palette.glowTo }}
          />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="relative mx-auto w-[92px] h-[92px] mb-2.5">
            <div
              className="absolute inset-0 rounded-full opacity-65 blur-xl"
              style={{ background: palette.glowFrom }}
            />
            <div
              className="relative w-full h-full overflow-hidden ring-1 ring-white/15"
              style={{ borderRadius: "62% 38% 55% 45% / 50% 60% 40% 50%" }}
            >
              <img
                src={visual.image}
                alt={category.name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/35 pointer-events-none" />
            </div>
            <div className="absolute bottom-0 left-0 z-20 w-8 h-8 rounded-full bg-black/70 backdrop-blur-md border border-white/25 shadow-lg flex items-center justify-center text-sm pointer-events-none">
              {visual.icon}
            </div>
          </div>

          <h3 className="relative text-center text-sm sm:text-[15px] font-black text-white mb-1 line-clamp-1">
            {category.name}
          </h3>
          <p className="relative text-center text-[9.5px] text-slate-500 leading-relaxed mb-2.5 line-clamp-1">
            {category.description || "دوره‌های تخصصی و مهارتی"}
          </p>

          <div className="relative grid grid-cols-2 gap-1.5 mb-2.5">
            <div className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <BookOpen className={`w-3 h-3 ${palette.accent}`} />
              <span className="text-[9px] text-slate-400">{activeCount.toLocaleString("fa-IR")} دوره</span>
            </div>
            <div className="flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Building2 className={`w-3 h-3 ${palette.accent}`} />
              <span className="text-[9px] text-slate-400">{instituteCount.toLocaleString("fa-IR")} آموزشگاه</span>
            </div>
          </div>

          <div className={`relative mt-auto flex items-center justify-center gap-1 px-3 py-2 rounded-full text-white text-[10px] font-black bg-gradient-to-l ${palette.button} shadow-lg group-hover:shadow-xl transition-all`}>
            مشاهده دوره‌ها
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
