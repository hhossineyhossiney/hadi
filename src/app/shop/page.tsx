"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Users, PlayCircle, BookOpen, Award, TrendingUp, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import OnlineCourseCard, { OnlineCourseCardData } from "@/components/OnlineCourseCard";

type ShopCourse = OnlineCourseCardData;





function fmt(n: number | string) {
  const v = Number(n) || 0;
  return v.toLocaleString("fa-IR");
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
                    {featured.map((c, i) => <OnlineCourseCard key={c.id} course={c} index={i} />)}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
                    {others.map((c, i) => <OnlineCourseCard key={c.id} course={c} index={i} />)}
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
