"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, Star, Users, Clock, PlayCircle, ArrowLeft, Sparkles, TrendingUp, Award } from "lucide-react";
import { motion } from "framer-motion";

type ShopCourse = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_image: string | null;
  instructor: string | null;
  level: string | null;
  price: string;
  original_price: string | null;
  discount_percent: number;
  total_lessons: number;
  total_duration: number;
  students_count: number;
  rating: string;
  rating_count: number;
  is_featured: boolean;
  institute_name: string;
};

const gradients = [
  "from-rose-500 via-pink-500 to-orange-400",
  "from-violet-600 via-purple-500 to-indigo-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-blue-500 via-indigo-500 to-purple-500",
  "from-fuchsia-600 via-pink-500 to-rose-500",
];

function fmt(n: number | string) {
  return (Number(n) || 0).toLocaleString("fa-IR");
}

export default function ShopShowcase() {
  const [courses, setCourses] = useState<ShopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop?limit=8")
      .then(r => r.json())
      .then(d => { setCourses(d.courses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && courses.length === 0) return null;

  return (
    <section className="relative py-14 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black text-primary-500 tracking-wider">ONLINE COURSES</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-text-primary mb-2">
              دوره‌های <span className="gradient-text">آنلاین جذاب</span> با گواهینامه معتبر
            </h2>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl">
              دوره‌های تخصصی از آموزشگاه‌های معتبر — قابل خرید و مشاهده آنلاین با دسترسی مادام‌العمر
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden md:inline-flex shrink-0 items-center gap-2 px-5 py-3 rounded-[14px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-sm font-black shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.03] transition-all"
          >
            مشاهده فروشگاه کامل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: Award, l: "گواهینامه رسمی" },
            { icon: TrendingUp, l: "بروزرسانی رایگان" },
            { icon: Sparkles, l: "کیفیت HD" },
            { icon: Users, l: "پشتیبانی مستقیم" },
          ].map(f => (
            <div key={f.l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20">
              <f.icon className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-[11px] font-black text-primary-600 dark:text-primary-300">{f.l}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => <div key={i} className="aspect-[3/4] rounded-[22px] skeleton" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {courses.slice(0, 8).map((c, i) => {
                const gradient = gradients[i % gradients.length];
                const price = Number(c.price);
                const original = c.original_price ? Number(c.original_price) : null;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                  >
                    <Link href={`/shop/${c.slug}`} className="block group">
                      <div className="relative rounded-[22px] overflow-hidden bg-[var(--bg-glass-card)] border border-[var(--border-default)] hover-lift transition-all"
                        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                        {/* Cover */}
                        <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradient} overflow-hidden`}>
                          {c.cover_image && (
                            <img src={c.cover_image} alt={c.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-90" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                          {c.is_featured && (
                            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 text-black text-[9px] font-black shadow flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> ویژه
                            </span>
                          )}
                          {c.discount_percent > 0 && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-error-500 text-white text-[9px] font-black shadow">
                              {c.discount_percent}٪
                            </span>
                          )}

                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                              <PlayCircle className="w-8 h-8 text-primary-600" />
                            </div>
                          </div>

                          <div className="absolute bottom-3 right-3 left-3 flex items-end justify-between">
                            <div className="text-[10px] text-white/90 font-bold truncate">{c.institute_name}</div>
                          </div>
                        </div>

                        <div className="p-4">
                          <h3 className="text-sm font-black text-text-primary mb-2 line-clamp-2 min-h-[42px] group-hover:text-primary-500 transition-colors">
                            {c.title}
                          </h3>

                          <div className="flex items-center gap-3 text-[10px] text-text-tertiary mb-3">
                            <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {Number(c.rating).toFixed(1)}</div>
                            <div className="flex items-center gap-0.5"><Users className="w-3 h-3" /> {fmt(c.students_count)}</div>
                            <div className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {fmt(Math.floor(c.total_duration / 60))}س</div>
                          </div>

                          <div className="flex items-end justify-between pt-3 border-t border-[var(--border-default)]">
                            <div>
                              {original && original > price && (
                                <div className="text-[9px] text-text-tertiary line-through font-bold" dir="ltr">{fmt(original)}</div>
                              )}
                              <div className="text-base font-black gradient-text" dir="ltr">
                                {fmt(price)}<span className="text-[9px] text-text-tertiary mr-0.5">ت</span>
                              </div>
                            </div>
                            <div className="px-3 py-1.5 rounded-[8px] bg-primary-500/15 text-primary-600 dark:text-primary-300 text-[10px] font-black group-hover:bg-primary-500 group-hover:text-white transition-colors">
                              خرید →
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Mobile "view all" button */}
            <div className="mt-8 flex md:hidden justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-[14px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-sm font-black shadow-lg shadow-primary-500/25"
              >
                مشاهده همه دوره‌های آنلاین <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
