"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Building2, UserCircle2, ShieldCheck, ArrowLeft, Check } from "lucide-react";

const ROLES = [
  {
    icon: GraduationCap,
    role: "هنرجویان",
    tagline: "دنیای یادگیری بی‌محدود",
    color: "from-primary-500 to-secondary-500",
    bgAccent: "from-primary-500/15",
    features: [
      "مشاهده دوره‌های ثبت‌نامی و پیشرفت",
      "کیف پول دیجیتال و پرداخت اقساط",
      "دریافت گواهینامه معتبر و کارنامه",
      "شرکت در آزمون و ارسال تکلیف",
      "چت مستقیم با استاد و آموزشگاه",
    ],
    href: "/register",
    cta: "شروع رایگان",
  },
  {
    icon: Building2,
    role: "آموزشگاه‌ها",
    tagline: "مدیریت هوشمند بدون کاغذ",
    color: "from-amber-500 to-orange-500",
    bgAccent: "from-amber-500/15",
    features: [
      "پنل جامع مدیریت هنرجویان و دوره‌ها",
      "ثبت‌نام آنلاین و صدور فاکتور خودکار",
      "فروش دوره آنلاین با پخش ویدئو",
      "گزارش‌های Excel و آمار پیشرفته",
      "بازاریابی هدفمند در سامانه",
    ],
    href: "/pricing",
    cta: "مشاهده پلن‌ها",
    highlight: true,
  },
  {
    icon: UserCircle2,
    role: "اساتید",
    tagline: "تدریس آسان، نتیجه بیشتر",
    color: "from-emerald-500 to-teal-500",
    bgAccent: "from-emerald-500/15",
    features: [
      "برنامه کلاسی هفتگی و تقویم",
      "ثبت نمرات، حضور و غیاب سریع",
      "بارگذاری تکلیف و آزمون آنلاین",
      "پروفایل حرفه‌ای با رزومه و نمونه‌کار",
      "چت با هنرجویان و مدیریت",
    ],
    href: "/register",
    cta: "پیوستن به تیم",
  },
  {
    icon: ShieldCheck,
    role: "مدیر کل سامانه",
    tagline: "کنترل کامل شبکه آموزشی",
    color: "from-purple-500 to-fuchsia-500",
    bgAccent: "from-purple-500/15",
    features: [
      "مدیریت همه آموزشگاه‌های شبکه",
      "نظارت لحظه‌ای بر آمار و درآمد",
      "مدیریت پلن‌ها و اشتراک‌ها",
      "بررسی و پاسخ تیکت‌های پشتیبانی",
      "اعلان همگانی + کنترل کامل تبلیغات",
    ],
    href: "/pricing",
    cta: "درخواست دموی مدیریتی",
  },
];

export default function UserRolesSection() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 mb-5">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">FOR EVERYONE</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black text-text-primary mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>
            برای <span className="bg-gradient-to-l from-amber-400 to-yellow-500 bg-clip-text text-transparent">هر نقشی</span> ساخته شده
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-text-secondary">
            پنل‌های اختصاصی برای هنرجویان، آموزشگاه‌ها، اساتید و مدیران — همه در یک اکوسیستم
          </motion.p>
        </div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 4) * 0.08 }}
              className={`group relative rounded-[24px] overflow-hidden bg-[var(--bg-glass-card)] border ${r.highlight ? "border-amber-500/40 lg:scale-[1.02]" : "border-[var(--border-default)]"} hover:border-primary-500/40 transition-all duration-500 hover:-translate-y-1`}
            >
              {/* Top gradient accent */}
              <div className={`h-1.5 bg-gradient-to-l ${r.color}`} />

              <div className={`p-7 lg:p-8 relative`}>
                {/* BG accent blur */}
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-br ${r.bgAccent} to-transparent blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60`} />

                {r.highlight && (
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 text-slate-900 text-[10px] font-black flex items-center gap-1">
                    🏆 محبوب
                  </div>
                )}

                <div className="relative">
                  <div className={`w-14 h-14 rounded-[16px] bg-gradient-to-br ${r.color} flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <r.icon className="w-7 h-7 text-white" />
                  </div>

                  <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-2">{r.tagline}</div>
                  <h3 className="text-2xl md:text-3xl font-black text-text-primary mb-5" style={{ letterSpacing: "-0.01em" }}>{r.role}</h3>

                  <ul className="space-y-2.5 mb-6">
                    {r.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2 text-sm text-text-secondary">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${r.color} flex items-center justify-center shrink-0 mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={r.href}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-gradient-to-l ${r.color} text-white text-sm font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all group/btn`}
                  >
                    {r.cta}
                    <ArrowLeft className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
