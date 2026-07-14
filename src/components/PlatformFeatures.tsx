"use client";

import { motion } from "framer-motion";
import {
  Users, Building2, Calendar, Award, CheckCircle, TrendingUp,
  Megaphone, Bot, MessageCircle, Sparkles,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "CRM هنرجویان",
    desc: "مدیریت کامل پروفایل، ثبت‌نام، پرداخت‌ها و پیام‌های هنرجویان از یک پنل هوشمند",
    gradient: "from-primary-500/25 via-primary-500/10 to-transparent",
    iconBg: "bg-primary-500",
    span: "lg:col-span-2",
  },
  {
    icon: Building2,
    title: "مدیریت آموزشگاه",
    desc: "پنل مدیریتی پیشرفته با اساتید، دوره‌ها، جلسات و کلاس‌ها",
    gradient: "from-secondary-500/25 via-secondary-500/10 to-transparent",
    iconBg: "bg-secondary-500",
  },
  {
    icon: Calendar,
    title: "ثبت‌نام آنلاین",
    desc: "فرآیند ثبت‌نام ساده و بدون تماس تلفنی — کاملاً خودکار",
    gradient: "from-emerald-500/25 via-emerald-500/10 to-transparent",
    iconBg: "bg-emerald-500",
  },
  {
    icon: Award,
    title: "صدور گواهینامه دیجیتال",
    desc: "گواهی‌های معتبر با کد QR قابل استعلام آنلاین",
    gradient: "from-amber-500/25 via-amber-500/10 to-transparent",
    iconBg: "bg-amber-500",
  },
  {
    icon: CheckCircle,
    title: "حضور و غیاب",
    desc: "ثبت حضور تک‌کلیکی و گزارش‌گیری هوشمند",
    gradient: "from-teal-500/25 via-teal-500/10 to-transparent",
    iconBg: "bg-teal-500",
  },
  {
    icon: TrendingUp,
    title: "گزارش‌های مالی و Excel",
    desc: "درآمد، هزینه‌ها، بدهکاران و اقساط — همه در یک نمودار",
    gradient: "from-fuchsia-500/25 via-fuchsia-500/10 to-transparent",
    iconBg: "bg-fuchsia-500",
    span: "lg:col-span-2",
  },
  {
    icon: Megaphone,
    title: "ابزارهای بازاریابی",
    desc: "استوری، بنر، تبلیغات هدفمند و شبکه اجتماعی داخلی",
    gradient: "from-rose-500/25 via-rose-500/10 to-transparent",
    iconBg: "bg-rose-500",
  },
  {
    icon: Bot,
    title: "تولید محتوا با AI",
    desc: "متن تبلیغاتی، توضیح دوره و پاسخ خودکار به سوالات هنرجو",
    gradient: "from-purple-500/25 via-purple-500/10 to-transparent",
    iconBg: "bg-gradient-to-br from-purple-500 to-fuchsia-500",
    isNew: true,
  },
  {
    icon: MessageCircle,
    title: "اعلان و پیامک هوشمند",
    desc: "پیام خودکار برای ثبت‌نام، جلسه، تولد و بدهی",
    gradient: "from-sky-500/25 via-sky-500/10 to-transparent",
    iconBg: "bg-sky-500",
  },
];

export default function PlatformFeatures() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary-500/5 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 mb-5"
          >
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-xs font-black text-primary-300 uppercase tracking-wider">PLATFORM FEATURES</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-text-primary mb-4 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            همه چیز در <span className="gradient-text">یک سامانه</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-text-secondary leading-relaxed"
          >
            بیش از ۵۰ قابلیت حرفه‌ای برای مدیریت کامل آموزشگاه — از ثبت‌نام تا صدور گواهینامه
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 6) * 0.05 }}
              className={`group relative rounded-[20px] p-6 lg:p-7 bg-gradient-to-br ${f.gradient} border border-[var(--border-default)] hover:border-primary-500/40 transition-all duration-300 hover:-translate-y-1 overflow-hidden ${f.span || ""}`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/10 to-transparent rotate-45" />
              </div>

              {f.isNew && (
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-gradient-to-l from-purple-500 to-fuchsia-500 text-white text-[9px] font-black">
                  ✨ NEW
                </div>
              )}

              <div className={`w-12 h-12 rounded-[14px] ${f.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-black text-text-primary mb-2" style={{ letterSpacing: "-0.01em" }}>{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
