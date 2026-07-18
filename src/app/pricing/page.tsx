"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/plans").then(r => r.json()).then(d => setPlans(d.items || [])); }, []);

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0A3D6E] via-[#0B4F8B] to-[#082D53] py-16 lg:py-24">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-white">پلن‌های اشتراک آموزشگاه</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
              انتخاب پلن مناسب <span className="gradient-text">آموزشگاه شما</span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto">
              پلن‌های مختلف با ویژگی‌های متنوع — از رایگان تا حرفه‌ای، متناسب با اندازه و نیاز آموزشگاه شما
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map((p: any, i: number) => {
              const c = p.color || "primary";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-[22px] overflow-hidden border-2 ${p.is_popular ? "ring-2 ring-amber-400 scale-105 lg:scale-110" : ""} ${
                    c === "amber" ? "bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/50" :
                    c === "purple" ? "bg-gradient-to-br from-purple-500/15 to-transparent border-purple-500/50" :
                    c === "slate" ? "bg-gradient-to-br from-slate-500/15 to-transparent border-slate-500/50" :
                    "bg-gradient-to-br from-primary-500/15 to-transparent border-primary-500/50"
                  }`}
                >
                  {p.is_popular && (
                    <div className="absolute top-0 left-0 right-0 py-1.5 bg-gradient-to-l from-amber-400 to-yellow-500 text-slate-900 text-center text-[11px] font-black">
                      🏆 محبوب‌ترین انتخاب
                    </div>
                  )}
                  <div className={`p-6 ${p.is_popular ? "pt-10" : ""}`}>
                    <div className="text-xl font-black text-text-primary mb-2">{p.name}</div>
                    <div className="text-xs text-text-secondary mb-4 min-h-[36px]">{p.description}</div>
                    <div className="mb-6">
                      {Number(p.price) === 0 ? (
                        <div className="text-3xl font-black text-emerald-500">رایگان</div>
                      ) : (
                        <div>
                          <div className="text-3xl font-black text-text-primary" dir="ltr">{Number(p.price).toLocaleString("fa-IR")}<span className="text-sm text-text-tertiary mr-1">تومان</span></div>
                          <div className="text-[11px] text-text-tertiary">/ {p.duration_days} روز</div>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2 mb-6">
                      {(p.features || []).map((f: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                          <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-4 border-t border-[var(--border-default)] space-y-1 text-[10px] text-text-secondary mb-6">
                      <div>📚 {p.max_courses === 0 ? "دوره نامحدود" : `تا ${p.max_courses} دوره`}</div>
                      <div>👥 {p.max_students === 0 ? "هنرجو نامحدود" : `تا ${p.max_students} هنرجو`}</div>
                      <div>🎬 {!p.online_sales_enabled ? "بدون فروش آنلاین" : p.max_shop_courses === 0 ? "فروش آنلاین نامحدود" : `${p.max_shop_courses} دوره فروش آنلاین`}</div>
                      <div>💰 کمیسیون سامانه: {p.commission_percent}٪</div>
                    </div>
                    <a href="tel:09159513179" className={`block text-center py-3 rounded-[12px] font-black text-sm ${p.is_popular ? "bg-gradient-to-l from-amber-400 to-yellow-500 text-slate-900" : "gradient-button text-white"}`}>
                      تماس برای فعال‌سازی
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-16 text-text-tertiary">در حال بارگذاری پلن‌ها...</div>
          )}

          <div className="mt-12 p-6 rounded-[18px] bg-[var(--bg-glass-card)] border border-[var(--border-default)] text-center">
            <div className="text-lg font-black text-text-primary mb-2">همه پلن‌ها شامل:</div>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-text-secondary">
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> پنل مدیریت</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> ثبت‌نام آنلاین</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> اطلاع‌رسانی خودکار</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> ربات تلگرام</span>
              <span className="flex items-center gap-1"><Check className="w-4 h-4 text-emerald-500" /> پشتیبانی</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link href="/" className="text-primary-500 text-sm font-black flex items-center gap-1 hover:underline">
              <ArrowLeft className="w-4 h-4" /> بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
