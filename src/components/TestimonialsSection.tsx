"use client";

import { motion } from "framer-motion";
import { Quote, Star, MessageSquareQuote } from "lucide-react";

const testimonials = [
  {
    name: "علی احمدی",
    role: "مدیر آموزشگاه کامپیوتر پارس",
    avatar: "ع",
    color: "from-primary-500 to-secondary-500",
    rating: 5,
    quote:
      "قبلاً روزم با اکسل و دفترچه شروع می‌شد. الان صبح‌ها فقط داشبورد رو باز می‌کنم و همه چیز آماده است. درآمدم ۳ برابر شده.",
  },
  {
    name: "زهرا محمدی",
    role: "مدیر آموزشگاه زیبایی هدف",
    avatar: "ز",
    color: "from-fuchsia-500 to-purple-600",
    rating: 5,
    quote:
      "سیستم ثبت‌نام آنلاین و صدور گواهی دیجیتال یک انقلاب بود. هنرجویان خیلی راضی‌ترن و کارهای اداری من نصف شده.",
  },
  {
    name: "محمد رضایی",
    role: "هنرجوی دوره فتوشاپ",
    avatar: "م",
    color: "from-amber-500 to-orange-600",
    rating: 5,
    quote:
      "کارنامه، حضور و غیاب، پیام‌رسان با استاد — همه چیز در یک اپ. حس یک پلتفرم بین‌المللی رو میده.",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 right-0 w-[400px] h-[400px] rounded-full bg-fuchsia-500/5 blur-[120px]" />
        <div className="absolute bottom-40 left-0 w-[400px] h-[400px] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
          >
            <MessageSquareQuote className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-black text-amber-200">نظرات کاربران</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            آموزشگاه‌هایی که{" "}
            <span className="bg-gradient-to-l from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              متحول شدند.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 leading-relaxed"
          >
            مدیران و هنرجویان درباره تجربه‌شان صحبت می‌کنند.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/20 backdrop-blur-sm hover:-translate-y-1 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-6 left-6 w-10 h-10 text-white/5 group-hover:text-white/10 transition-colors" />

              {/* Rating */}
              <div className="flex items-center gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, k) => (
                  <Star key={k} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-slate-200 text-sm leading-relaxed mb-6 relative">
                «{t.quote}»
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black shadow-lg`}>
                  {t.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white truncate">{t.name}</div>
                  <div className="text-xs text-slate-400 truncate">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
