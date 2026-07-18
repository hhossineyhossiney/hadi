"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Rocket, Sparkles, CheckCircle2 } from "lucide-react";

const perks = [
  "۳۰ روز رایگان",
  "تا ۵ دوره حضوری",
  "تا ۵۰ هنرجو",
  "امکان ارتقای پلن",
];

export default function PremiumCTA() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[40px] overflow-hidden bg-[#04152A] border border-white/10"
        >
          {/* Aurora effect layers */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-[#04152A] to-fuchsia-900/30" />
            {/* Aurora blobs */}
            <motion.div
              animate={{
                x: [0, 60, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 -right-40 w-[500px] h-[500px] rounded-full bg-primary-500/30 blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, -50, 0],
                y: [0, 40, 0],
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-fuchsia-500/25 blur-[120px]"
            />
            <motion.div
              animate={{
                x: [0, 40, 0],
                y: [0, -20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[120px]"
            />
          </div>

          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid-2" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid-2)" />
          </svg>

          {/* Inner shine */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="relative p-8 md:p-12 lg:p-20 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-white tracking-wide">پیشنهاد ویژه راه‌اندازی — ۳۰ روز کاملاً رایگان</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mobile-one-line-title text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              همین امروز آموزشگاه‌تان را{" "}
              <br className="hidden md:block" />
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                  هوشمند
                </span>
                <span className="absolute -inset-2 bg-amber-500/20 blur-2xl -z-10" />
              </span>{" "}
              کنید.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              با <span className="font-black text-white">پلن رایگان ۳۰ روزه</span> پنل مدیریت را راه‌اندازی کنید؛
              سپس متناسب با ظرفیت دوره‌ها، هنرجویان و فروش آنلاین، پلن مناسب را انتخاب کنید.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-10"
            >
              <Link
                href="/pricing"
                className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-slate-900 text-base font-black flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/40 hover:scale-[1.03] transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <Rocket className="w-5 h-5 relative" />
                <span className="relative">مشاهده و انتخاب پلن</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform relative" />
              </Link>
              <a
                href="tel:09159513179"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 text-white text-base font-black flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <Phone className="w-5 h-5" />
                مشاوره تلفنی
              </a>
            </motion.div>

            {/* Trust perks */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              {perks.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs md:text-sm text-slate-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {p}
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
