"use client";

import { motion } from "framer-motion";
import { UserPlus, Settings2, Rocket, ArrowLeft } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    num: "۰۱",
    icon: UserPlus,
    title: "ثبت‌نام رایگان در ۲ دقیقه",
    desc: "فقط با یک شماره موبایل، آموزشگاه خود را ثبت کنید. بدون کارت اعتباری، بدون فرم طولانی.",
    color: "from-primary-500 to-primary-700",
    accent: "text-primary-300",
  },
  {
    num: "۰۲",
    icon: Settings2,
    title: "شخصی‌سازی پنل و دوره‌ها",
    desc: "لوگو، رنگ، دوره‌ها و اساتید را در چند کلیک اضافه کنید. تیم پشتیبانی همراه شماست.",
    color: "from-secondary-500 to-teal-700",
    accent: "text-secondary-300",
  },
  {
    num: "۰۳",
    icon: Rocket,
    title: "ثبت‌نام هنرجو و درآمدزایی",
    desc: "لینک شخصی خود را منتشر کنید. هنرجویان آنلاین ثبت‌نام و پرداخت می‌کنند — همه چیز خودکار.",
    color: "from-amber-500 to-orange-600",
    accent: "text-amber-300",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-500/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
          >
            <Rocket className="w-4 h-4 text-primary-300" />
            <span className="text-xs font-black text-primary-200">شروع در ۳ گام</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            از ثبت‌نام تا اولین درآمد،{" "}
            <span className="bg-gradient-to-l from-amber-300 to-orange-500 bg-clip-text text-transparent">
              کمتر از ۲۴ ساعت.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-slate-400 leading-relaxed"
          >
            بدون نیاز به دانش فنی. بدون هزینه اولیه. بدون قرارداد بلندمدت.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-24 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all h-full group-hover:-translate-y-1 duration-300">
                  {/* Big number in background */}
                  <div className="absolute top-6 left-6 text-[80px] font-black text-white/[0.04] leading-none pointer-events-none">
                    {s.num}
                  </div>

                  {/* Icon */}
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-xl shadow-black/30 group-hover:scale-110 transition-transform`}>
                    <s.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className={`text-xs font-black ${s.accent} mb-2`}>گام {s.num}</div>
                  <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-l from-primary-600 to-primary-500 text-white text-sm font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary-500/30 group"
          >
            شروع رایگان
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-black hover:bg-white/10 transition-colors"
          >
            مشاهده پلن‌ها
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
