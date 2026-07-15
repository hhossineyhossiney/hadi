"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { pickCategoryVisual } from "@/lib/category-visuals";

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
  has_certificate: boolean;
  has_support: boolean;
  lifetime_access: boolean;
  institute_name: string;
  category_name: string | null;
};

const LEVELS: Record<string, string> = {
  beginner: "مقدماتی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
};

function fmt(n: number | string) {
  return (Number(n) || 0).toLocaleString("fa-IR");
}

function durationLabel(minutes: number) {
  if (!minutes) return "—";
  if (minutes < 60) return `${fmt(minutes)} دقیقه`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${fmt(hours)}:${fmt(rest).padStart(2, "۰")} ساعت` : `${fmt(hours)} ساعت`;
}

export default function ShopShowcase() {
  const [courses, setCourses] = useState<ShopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop?limit=6")
      .then((r) => r.json())
      .then((d) => {
        setCourses(d.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && courses.length === 0) return null;

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Ambient section background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-[8%] w-80 h-80 rounded-full bg-primary-500/10 blur-[110px]" />
        <div className="absolute bottom-0 left-[5%] w-96 h-96 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black text-primary-500 tracking-wider">ONLINE COURSES</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-text-primary mb-2">
              دوره‌های <span className="gradient-text">آنلاین حرفه‌ای</span> با گواهینامه معتبر
            </h2>
            <p className="text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
              آموزش تخصصی از آموزشگاه‌های معتبر؛ با پشتیبانی مدرس، دسترسی مادام‌العمر و تجربه یادگیری باکیفیت
            </p>
          </div>

          <Link
            href="/shop"
            className="hidden md:inline-flex shrink-0 items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-sm font-black shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-[1.03] transition-all"
          >
            مشاهده فروشگاه کامل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-2 mb-9">
          {[
            { icon: Award, label: "گواهینامه رسمی" },
            { icon: TrendingUp, label: "بروزرسانی رایگان" },
            { icon: Sparkles, label: "کیفیت HD" },
            { icon: Users, label: "پشتیبانی مستقیم" },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-sm"
            >
              <feature.icon className="w-3.5 h-3.5 text-primary-500" />
              <span className="text-[11px] font-black text-primary-600 dark:text-primary-300">
                {feature.label}
              </span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[430px] rounded-[36px] skeleton" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
              {courses.slice(0, 6).map((course, index) => {
                const visual = pickCategoryVisual(course.title, course.category_name, course.subtitle);
                const palette = visual.palette;
                const fallbackImage = visual.image;
                const price = Number(course.price) || 0;
                const original = Number(course.original_price) || 0;
                const hasDiscount = original > price && price > 0;
                const discount = course.discount_percent || (hasDiscount ? Math.round(((original - price) / original) * 100) : 0);

                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.55,
                      delay: (index % 6) * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="h-full"
                  >
                    <Link href={`/shop/${course.slug}`} className="relative block h-full group">
                      {/* Organic ambient glow */}
                      <div
                        className="absolute -inset-1 rounded-[42px] opacity-65 blur-2xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: `radial-gradient(60% 50% at 30% 20%, ${palette.glowFrom} 0%, transparent 60%), radial-gradient(50% 50% at 70% 90%, ${palette.glowTo} 0%, transparent 60%)`,
                        }}
                      />

                      {/* Main organic card */}
                      <article
                        className="relative h-full min-h-[430px] flex flex-col overflow-hidden bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 backdrop-blur-xl border border-white/10 group-hover:border-white/25 group-hover:-translate-y-1 transition-all duration-500"
                        style={{
                          borderRadius: "48px 28px 48px 28px / 32px 48px 32px 48px",
                        }}
                      >
                        {/* Inner colored light */}
                        <div
                          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-60 pointer-events-none"
                          style={{ background: palette.glowFrom }}
                        />
                        <div
                          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-45 pointer-events-none"
                          style={{ background: palette.glowTo }}
                        />
                        <div
                          className="absolute inset-0 opacity-[0.04] pointer-events-none"
                          style={{
                            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                            backgroundSize: "22px 22px",
                          }}
                        />

                        {/* Top: organic image + main information */}
                        <div className="relative flex items-start gap-3 p-5 pb-3">
                          <div className="relative shrink-0 w-[126px] h-[126px] sm:w-[140px] sm:h-[140px] -mt-1 -mr-1">
                            <div
                              className="absolute inset-0 rounded-full opacity-70 blur-2xl"
                              style={{ background: palette.glowFrom }}
                            />
                            <div
                              className="relative w-full h-full overflow-hidden ring-1 ring-white/15"
                              style={{ borderRadius: "62% 38% 55% 45% / 50% 60% 40% 50%" }}
                            >
                              <img
                                src={course.cover_image || fallbackImage}
                                alt={course.title}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  const image = e.currentTarget;
                                  if (image.src !== fallbackImage) image.src = fallbackImage;
                                }}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-11 h-11 rounded-full bg-white/95 shadow-xl flex items-center justify-center">
                                  <PlayCircle className="w-7 h-7 text-primary-600" />
                                </div>
                              </div>
                              <div className="absolute bottom-1 left-1 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-base">
                                {visual.icon}
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 flex flex-col">
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black backdrop-blur ${palette.badge}`}>
                                <PlayCircle className="w-2.5 h-2.5" /> دوره آنلاین
                              </span>
                              {course.is_featured && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black shadow">
                                  <Sparkles className="w-2.5 h-2.5" /> ویژه
                                </span>
                              )}
                            </div>

                            <h3 className="text-lg sm:text-xl font-black text-white leading-tight mb-2 line-clamp-2">
                              {course.title}
                            </h3>
                            {course.subtitle && (
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                {course.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Institute / instructor */}
                        <div className="relative px-5 py-2 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${palette.button} flex items-center justify-center text-white text-[11px] font-black shrink-0 shadow-lg`}>
                              {(course.instructor || course.institute_name || "م").trim().charAt(0)}
                            </div>
                            <div className="min-w-0">
                              {course.instructor && (
                                <div className="text-[11px] font-black text-white truncate">مدرس: {course.instructor}</div>
                              )}
                              <div className="text-[9.5px] text-slate-500 truncate">{course.institute_name}</div>
                            </div>
                          </div>
                          {course.level && (
                            <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[9px] font-black text-slate-300">
                              {LEVELS[course.level] || course.level}
                            </span>
                          )}
                        </div>

                        {/* Course statistics */}
                        <div className="relative mx-5 mt-2 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                            <BookOpen className={`w-4 h-4 ${palette.accent} shrink-0`} />
                            <div className="min-w-0">
                              <div className="text-[9px] text-slate-500">محتوای آموزشی</div>
                              <div className="text-xs font-black text-white truncate">{fmt(course.total_lessons)} درس</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10">
                            <Clock className={`w-4 h-4 ${palette.accent} shrink-0`} />
                            <div className="min-w-0">
                              <div className="text-[9px] text-slate-500">مدت دوره</div>
                              <div className="text-xs font-black text-white truncate">{durationLabel(course.total_duration)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Rating, students and guarantees */}
                        <div className="relative mx-5 mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <b className="text-white">{Number(course.rating || 0).toFixed(1)}</b>
                            <span>({fmt(course.rating_count)})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {fmt(course.students_count)} هنرجو
                          </span>
                          {(course.has_certificate || course.lifetime_access) && (
                            <span className={`flex items-center gap-1 ${palette.accent}`}>
                              <CheckCircle className="w-3.5 h-3.5" />
                              {course.has_certificate ? "گواهینامه" : "دسترسی دائمی"}
                            </span>
                          )}
                        </div>

                        {/* Price and CTA */}
                        <div className="relative mt-auto p-5 pt-4 flex items-end justify-between gap-3">
                          <div className="min-w-0">
                            <span className="text-[9px] text-slate-500 font-bold">هزینه ثبت‌نام</span>
                            {hasDiscount && (
                              <div className="text-[10px] text-slate-500 line-through leading-none" dir="ltr">
                                {fmt(original)}
                              </div>
                            )}
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className={`text-xl font-black bg-gradient-to-l ${palette.button} bg-clip-text text-transparent leading-none`}>
                                {price > 0 ? fmt(price) : "رایگان"}
                              </span>
                              {price > 0 && <span className="text-[9px] text-slate-400 font-bold">تومان</span>}
                            </div>
                          </div>
                          <span className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white text-xs font-black bg-gradient-to-l ${palette.button} shadow-lg group-hover:scale-[1.04] transition-transform`}>
                            مشاهده و خرید
                            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                          </span>
                        </div>

                        {discount > 0 && (
                          <div className={`absolute top-4 left-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-lg bg-gradient-to-l ${palette.button}`}>
                            {fmt(discount)}٪ تخفیف
                          </div>
                        )}
                      </article>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-9 flex md:hidden justify-center">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-sm font-black shadow-lg shadow-primary-500/25"
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
