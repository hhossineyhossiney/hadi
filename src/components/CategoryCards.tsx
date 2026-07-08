"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Monitor,
  Scissors,
  Sparkles,
  ChefHat,
  BookOpen,
  ArrowLeft,
  GraduationCap,
  Building2,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-6 h-6" />,
  Scissors: <Scissors className="w-6 h-6" />,
  Sparkles: <Sparkles className="w-6 h-6" />,
  ChefHat: <ChefHat className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
};

const imageMap: Record<string, string> = {
  computer: "/images/cat-computer.jpg",
  tailoring: "/images/cat-tailoring.jpg",
  beauty: "/images/cat-beauty.jpg",
  culinary: "/images/cat-culinary.jpg",
  education: "/images/cat-education.jpg",
};

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
    <section className="py-10 bg-bg-primary relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-100/40 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block"
            >
              CATEGORIES
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-black text-text-primary mb-3"
            >
              رشته‌های آموزشی در زبرخان
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-text-secondary text-base max-w-2xl"
            >
              رشته مورد نظر خود را انتخاب کرده و دوره‌ها و آموزشگاه‌های مربوطه را بررسی کنید
            </motion.p>
          </div>
          <Link
            href="/fields"
            className="hidden sm:flex items-center gap-2 text-primary-600 hover:text-primary-700 font-bold transition-colors group text-sm"
          >
            مشاهده همه رشته‌ها
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, index) => {
            const activeCount =
              cat.activeCourseCount ?? cat.courseCount ?? 0;
            const instCount = cat.instituteCount ?? 0;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={`/fields/${cat.slug}`}
                  className="group block rounded-[24px] bg-surface border border-border-default hover:border-primary-200 hover-lift transition-all duration-500 relative overflow-hidden"
                >
                  {/* Image */}
                  <div className="h-40 relative overflow-hidden">
                    <img
                      src={imageMap[cat.slug] || "/images/hero-bg.jpg"}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

                    {/* Stats overlay top-right */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-primary-700 text-[10px] font-black shadow">
                        <GraduationCap className="w-3 h-3" />
                        {activeCount} دوره فعال
                      </span>
                      {instCount > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold border border-white/20">
                          <Building2 className="w-3 h-3" />
                          در {instCount} آموزشگاه
                        </span>
                      )}
                    </div>

                    {/* Category icon */}
                    <div
                      className="absolute bottom-3 right-3 w-11 h-11 rounded-[12px] flex items-center justify-center backdrop-blur-md border border-white/25 shadow-lg"
                      style={{ backgroundColor: `${cat.color || "#0EA5E9"}D9`, color: "#fff" }}
                    >
                      {iconMap[cat.icon || ""] || <Sparkles className="w-5 h-5" />}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-black text-text-primary mb-2 group-hover:text-primary-600 transition-colors text-lg">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-sm text-text-tertiary mb-4 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <span className="text-xs font-bold text-primary-600">
                        مشاهده دوره‌های این رشته
                      </span>
                      <ArrowLeft className="w-4 h-4 text-primary-500 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
