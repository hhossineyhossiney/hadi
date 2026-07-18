"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle, Clock, Megaphone, BarChart3, Users2, ArrowLeft,
  Sparkles, CheckCircle2,
} from "lucide-react";

const problems = [
  {
    icon: Users2,
    title: "پرونده‌های پراکنده هنرجویان",
    desc: "ثبت‌نام، مدارک، اقساط، حضور و نمره در چند دفتر و فایل جدا نگهداری می‌شود.",
  },
  {
    icon: Megaphone,
    title: "ویترین دیجیتال ناقص",
    desc: "اطلاعات دوره، مدرس، گالری و راه‌های تماس به‌روز و یکپارچه در دسترس هنرجو نیست.",
  },
  {
    icon: Clock,
    title: "پیگیری‌های تکراری و زمان‌بر",
    desc: "هماهنگی کلاس، تکلیف، آزمون و اطلاعیه با تماس‌ها و پیام‌های پراکنده انجام می‌شود.",
  },
  {
    icon: BarChart3,
    title: "گزارش‌گیری دشوار",
    desc: "برای بررسی هنرجویان، شهریه، نمرات و حضور باید اطلاعات به‌صورت دستی جمع‌آوری شود.",
  },
];

const solutions = [
  "پرونده یکپارچه هر هنرجو شامل ثبت‌نام، مدارک، گواهینامه، اقساط و هزینه‌ها",
  "صفحه اختصاصی آموزشگاه با دوره‌ها، مدرس‌ها، گالری، بنر، استوری و اطلاعات تماس",
  "تقویم جلسات، کلاس Live، حضور، پیشرفت، تکلیف، آزمون، نمره، چت و اعلان",
  "شش گزارش Excel برای هنرجویان، دوره‌ها، نمرات، حضور، فروش و شهریه",
];

export default function ProblemSolution() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* subtle bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 mb-6"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-black text-red-300">مشکل مدیران آموزشگاه‌ها</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            هنوز دفترچه و اکسل استفاده می‌کنید؟
            <br />
            <span className="bg-gradient-to-l from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              وقتش رسیده متحول شوید.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 leading-relaxed"
          >
            مدیران آموزشگاه‌ها روزانه با این چالش‌ها روبرو هستند. ما همه را حل کردیم.
          </motion.p>
        </div>

        {/* Two-column: Problems vs Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Problems */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/25 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-black text-white">قبل از سامانه</h3>
            </div>
            <div className="space-y-3">
              {problems.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="group relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/20 hover:bg-red-500/[0.03] transition-all"
                >
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <p.icon className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-black text-white mb-1">{p.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Solutions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative lg:sticky lg:top-24"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black text-white">با سامانه زبرخان</h3>
            </div>

            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-primary-500/10 border border-emerald-500/20 p-6 lg:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none" />
              <div className="relative">
                <div className="text-xs font-bold text-emerald-300 mb-2">✨ راه‌حل یکپارچه</div>
                <h4 className="text-2xl font-black text-white mb-6 leading-tight">
                  همه چیز، در یک سامانه.
                </h4>
                <ul className="space-y-4">
                  {solutions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-200 leading-relaxed">{s}</span>
                    </motion.li>
                  ))}
                </ul>

                <a
                  href="#manager-capabilities"
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-900 text-sm font-black hover:scale-105 transition-transform group"
                >
                  امکانات را جزئی‌به‌جز ببینید
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
