"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Rocket, Shield, Sparkles } from "lucide-react";

export default function PremiumCTA() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0B4F8B] via-[#04152A] to-[#0B4F8B]"
        >
          {/* Background layers */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-primary-500 blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-amber-500 blur-[100px]" />
          </div>
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>

          <div className="relative p-8 lg:p-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-black text-white">۳۰ روز رایگان — بدون کارت اعتباری</span>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              همین امروز آموزشگاه‌تان را{" "}
              <span className="bg-gradient-to-l from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                هوشمند
              </span>{" "}
              کنید
            </h2>

            <p className="text-base md:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              به بیش از ۱۹ آموزشگاه فعال در شبکه زبرخان بپیوندید. تمام امکانات را ۳۰ روز رایگان امتحان کنید.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mb-8">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-[16px] bg-white text-slate-900 text-sm font-black flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/30 hover:scale-105 transition-all group"
              >
                <Rocket className="w-5 h-5" />
                شروع رایگان — همین حالا
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <a
                href="tel:09159513179"
                className="w-full sm:w-auto px-8 py-4 rounded-[16px] bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              >
                <Phone className="w-4 h-4" />
                ۰۹۱۵۹۵۱۳۱۷۹
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-400" /> بدون تعهد ماهانه</div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5">✓ لغو در هر زمان</div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5">✓ پشتیبانی ۲۴/۷</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
