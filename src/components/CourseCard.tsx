"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Users,
  Building2,
  GraduationCap,
  BadgeCheck,
  ArrowLeft,
  BookOpenCheck,
} from "lucide-react";
import { getTheme } from "@/lib/cardTheme";

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

function detectLevel(title: string, desc?: string | null): {
  label: string;
  color: string;
} | null {
  const text = `${title} ${desc || ""}`.toLowerCase();
  if (/جامع|از\s*صفر|صفر\s*تا\s*صد/i.test(text)) {
    return { label: "جامع از صفر تا صد", color: "bg-primary-600" };
  }
  if (/پیشرفته|advanced|expert/i.test(text)) {
    return { label: "پیشرفته", color: "bg-error-500" };
  }
  if (/متوسط|intermediate/i.test(text)) {
    return { label: "متوسط", color: "bg-accent-500" };
  }
  if (/مقدماتی|پایه|basic|beginner|شروع/i.test(text)) {
    return { label: "مقدماتی", color: "bg-secondary-600" };
  }
  return null;
}

export default function CourseCard({
  course,
  index = 0,
}: {
  course: CourseCardData;
  index?: number;
}) {
  const theme = getTheme(course.categoryName, index);
  const levelFromField: { label: string; color: string } | null = course.regionName === "__never" ? null : (() => {
    const l = (course as any).level as string | undefined;
    if (!l) return null;
    const map: Record<string, { label: string; color: string }> = {
      beginner: { label: "مقدماتی", color: "bg-secondary-600" },
      intermediate: { label: "متوسط", color: "bg-accent-500" },
      advanced: { label: "پیشرفته", color: "bg-error-500" },
      comprehensive: { label: "جامع از صفر تا صد", color: "bg-primary-600" },
    };
    return map[l] || null;
  })();
  const level = levelFromField || detectLevel(course.title, course.description);
  const cap = course.capacity || 0;
  const filled = course.enrolledCount || 0;
  const pct = cap > 0 ? Math.min(100, Math.round((filled / cap) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="group h-full flex flex-col bg-surface rounded-[20px] border border-border-default hover:border-primary-300 hover-lift transition-all duration-500 overflow-hidden">
        <div className="relative h-44 overflow-hidden">
          {course.image ? (
            <>
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} relative`}>
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-[14px] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <BookOpenCheck className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          )}

          {course.duration && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black border border-white/15">
                <Clock className="w-3 h-3" />
                {course.duration}
              </span>
            </div>
          )}

          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
            {course.categoryName && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-md ${theme.badgeSolid || "bg-primary-600"}`}
              >
                {course.categoryName}
              </span>
            )}
            {level && (
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-md ${level.color}`}
              >
                {level.label}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 z-10">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-primary-700 text-[10px] font-black shadow-md max-w-[180px]">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="line-clamp-1">{course.instituteName}</span>
            </span>
          </div>

          {course.startDate && (
            <div className="absolute top-3 left-3 z-10">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] font-black border border-white/15">
                شروع: {course.startDate}
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <h3 className="text-[15px] font-black text-text-primary group-hover:text-primary-600 transition-colors leading-snug mb-2 line-clamp-2">
            {course.title}
          </h3>

          {course.description && (
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mb-3">
              {course.description}
            </p>
          )}

          {course.instructor && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-3 h-3 text-primary-600" />
              </div>
              <div className="text-[11px] flex items-baseline gap-1 flex-1 min-w-0">
                <span className="text-text-tertiary font-medium">مدرس:</span>
                <span className="font-black text-text-primary line-clamp-1">
                  {course.instructor}
                </span>
              </div>
              <span className="flex items-center gap-1 text-[9px] font-black text-secondary-700 bg-secondary-50 border border-secondary-200 px-2 py-0.5 rounded-full shrink-0">
                <BadgeCheck className="w-2.5 h-2.5" />
                مدرک فنی‌وحرفه‌ای
              </span>
            </div>
          )}

          {cap > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] text-text-tertiary mb-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  ظرفیت: {filled}/{cap}
                </span>
                <span className="font-bold">{pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 85 ? "bg-error-500" : "gradient-button"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mt-auto pt-3 border-t border-border-light flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-tertiary font-bold">شهریه مصوب دوره:</span>
              <div className="flex flex-col">
                {course.originalPrice && Number(course.originalPrice) > Number(course.price || 0) && (
                  <span className="text-[10px] text-text-tertiary line-through leading-none">
                    {Number(course.originalPrice).toLocaleString("fa-IR")} تومان
                  </span>
                )}
                <span className="text-base font-black text-primary-600 leading-tight">
                  {course.price
                    ? Number(course.price).toLocaleString("fa-IR") + " تومان"
                    : "رایگان"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/courses/${course.slug}`}
                title="سرفصل‌ها و جزئیات"
                className="px-2.5 py-2 rounded-[10px] border border-border-default text-text-secondary hover:text-primary-600 hover:border-primary-300 text-[10px] font-black transition-colors"
              >
                سرفصل‌ها
              </Link>
              <Link
                href={`/courses/${course.slug}`}
                className="flex items-center gap-1 gradient-button hover:gradient-button-hover text-white text-[10px] font-black px-3 py-2 rounded-[10px] transition-all"
              >
                ثبت‌نام سریع
                <ArrowLeft className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
