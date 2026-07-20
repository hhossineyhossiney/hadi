"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Award, ShoppingBag, Sparkles, TrendingUp, Users } from "lucide-react";
import OnlineCourseCard, { OnlineCourseCardData } from "@/components/OnlineCourseCard";
import AutoLoopCarousel from "@/components/AutoLoopCarousel";

export default function ShopShowcase() {
  const [courses, setCourses] = useState<OnlineCourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shop?limit=6")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (!loading && courses.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-8 sm:py-10 md:py-12">
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
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-5 mb-4 md:mb-8">
          <div>
            <div className="hidden md:flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-black text-primary-500 tracking-wider">ONLINE COURSES</span>
            </div>
            <h2 className="mobile-one-line-title text-2xl md:text-4xl font-black text-text-primary mb-2">
              دوره‌های <span className="gradient-text">آنلاین حرفه‌ای</span> با گواهینامه معتبر
            </h2>
            <p className="hidden md:block text-sm md:text-base text-text-secondary max-w-2xl leading-relaxed">
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

        <div className="hidden md:flex flex-wrap gap-2 mb-9">
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
              <span className="text-[11px] font-black text-primary-600 dark:text-primary-300">{feature.label}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
            {[...Array(6)].map((_, index) => <div key={index} className="h-[430px] rounded-[36px] skeleton" />)}
          </div>
        ) : (
          <>
            <AutoLoopCarousel
              items={courses.slice(0, 6)}
              getKey={(course) => course.id}
              ariaLabel="دوره‌های آنلاین حرفه‌ای"
              intervalMs={3200}
              renderItem={(course, index) => (
                <OnlineCourseCard course={course} index={index} />
              )}
            />
            {/* Mobile intentionally stays focused on title + carousel cards. */}
          </>
        )}
      </div>
    </section>
  );
}
