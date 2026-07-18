"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Sparkles, Search, ArrowLeft, Play, GraduationCap, Building2, Award,
  TrendingUp, ShieldCheck, Users, BookOpen, Wallet, MessageCircle, Bot,
  ChevronDown,
} from "lucide-react";

const CATEGORIES = ["حسابداری", "ICDL", "خیاطی", "آرایشگری", "آشپزی", "طراحی"];

export default function HeroSection() {
  const [q, setQ] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Background layers — subtle premium gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04152A] via-[#0B4F8B]/40 to-[#04152A]" />
        {/* animated orbs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-500/12 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] animate-float" style={{ animationDelay: "1.5s" }} />
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(107, 220, 213, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 220, 213, 0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24 pb-20 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          {/* Right column — content */}
          <div className="lg:col-span-6 text-center lg:text-right">
            {/* AI-Powered badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary-500/30 bg-primary-500/10 backdrop-blur-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgb(52_211_153)]" />
              <Bot className="w-4 h-4 text-primary-300" />
              <span className="text-xs font-black text-white">راهنمای حرفه‌ای مدیران آموزشگاه‌های زبرخان</span>
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-l from-amber-400 to-yellow-500 text-slate-900 text-[9px] font-black">AI POWERED</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-6"
              style={{ letterSpacing: "-0.03em" }}
            >
              <span className="text-white">مدیریت آموزشگاه،</span>
              <br />
              <span className="bg-gradient-to-l from-primary-300 via-primary-400 to-secondary-400 bg-clip-text text-transparent">
                دقیق، یکپارچه و هوشمند.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-slate-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
            >
              از معرفی آموزشگاه و جذب هنرجو تا ثبت‌نام، برگزاری کلاس، ارزیابی، امور مالی، ارتباطات،
              فروش دوره آنلاین و گزارش‌گیری؛ همه فرایندها در یک سامانه متصل به داده‌های واقعی.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative mb-6 max-w-lg mx-auto lg:mx-0"
            >
              <div className="relative bg-white/95 backdrop-blur-sm rounded-[16px] shadow-2xl shadow-primary-500/20 flex items-center overflow-hidden border border-white/10">
                <Search className="w-5 h-5 text-slate-500 absolute right-4" />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="جستجو در دوره‌ها، رشته‌ها، آموزشگاه‌ها..."
                  className="flex-1 pr-12 pl-2 py-4 bg-transparent text-slate-900 text-sm font-black outline-none placeholder:text-slate-400"
                />
                <Link
                  href={`/courses${q ? `?q=${encodeURIComponent(q)}` : ""}`}
                  className="m-1.5 px-5 py-3 rounded-[12px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-xs font-black flex items-center gap-1 shadow-lg shadow-primary-500/40 hover:shadow-primary-500/60 transition-all"
                >
                  جستجو
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 justify-center lg:justify-start">
                <span className="text-[11px] text-slate-400">پرطرفدارها:</span>
                {CATEGORIES.map(c => (
                  <Link key={c} href={`/courses?q=${encodeURIComponent(c)}`} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-200 hover:bg-white/10 hover:border-primary-500/40 transition">
                    {c}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start"
            >
              <a
                href="#manager-capabilities"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[14px] bg-white text-slate-900 text-sm font-black flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all group"
              >
                مشاهده همه امکانات
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </a>
              <Link
                href="/pricing"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[14px] bg-white/5 backdrop-blur-sm border border-white/20 text-white text-sm font-black flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
              >
                <Play className="w-4 h-4" />
                مشاهده پلن‌ها
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start text-[11px] text-slate-400"
            >
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> دسترسی نقش‌محور</div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-400" /> ۶ گزارش Excel</div>
              <div className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary-400" /> پنل مدیر و هنرجو</div>
            </motion.div>
          </div>

          {/* Left column — 3D Dashboard Mockup */}
          <div className="lg:col-span-6 relative">
            <DashboardMockup />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-1 text-slate-500"
        >
          <ChevronDown className="w-4 h-4 animate-bounce" />
          <span className="text-[9px] font-bold uppercase tracking-widest">اسکرول</span>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════ 3D DASHBOARD MOCKUP ═══════════════════════ */
function DashboardMockup() {
  return (
    <div className="relative aspect-[4/5] lg:aspect-[5/6]">
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary-500/30 via-secondary-500/20 to-purple-500/30 rounded-[32px] blur-3xl" />

      {/* Main dashboard card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="relative w-full h-full rounded-[24px] bg-gradient-to-br from-[#0A3D6E] to-[#04152A] border border-white/10 shadow-2xl overflow-hidden"
        style={{ transform: "perspective(1200px) rotateY(-8deg) rotateX(4deg)" }}
      >
        {/* Fake browser chrome */}
        <div className="h-8 bg-black/40 flex items-center gap-1.5 px-3 border-b border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <div className="flex-1 mx-2 h-4 rounded-full bg-white/5" />
        </div>

        {/* Dashboard content */}
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-white text-sm font-black">داشبورد مدیریت</div>
              <div className="text-[9px] text-slate-400">آموزشگاه کامپیوتر هدف</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xs font-black">م</div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { l: "هنرجو", v: "۱٬۲۵۰", c: "from-primary-500/30 to-primary-500/5" },
              { l: "دوره", v: "۴۲", c: "from-emerald-500/30 to-emerald-500/5" },
              { l: "درآمد", v: "۸۹M", c: "from-amber-500/30 to-amber-500/5" },
            ].map((s, i) => (
              <div key={i} className={`p-2.5 rounded-[10px] bg-gradient-to-br ${s.c} border border-white/10`}>
                <div className="text-[8px] text-slate-400 mb-0.5">{s.l}</div>
                <div className="text-sm font-black text-white">{s.v}</div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="p-3 rounded-[10px] bg-white/5 border border-white/10 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-black text-white">درآمد ماهانه</div>
              <div className="text-[9px] text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" /> +۲۴٪</div>
            </div>
            <svg viewBox="0 0 200 60" className="w-full h-14">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points="0,60 0,45 25,35 50,40 75,20 100,25 125,15 150,20 175,10 200,15 200,60" fill="url(#chart-grad)" />
              <polyline points="0,45 25,35 50,40 75,20 100,25 125,15 150,20 175,10 200,15" fill="none" stroke="#14B8A6" strokeWidth="1.5" />
              {[[25,35],[50,40],[75,20],[100,25],[125,15],[150,20],[175,10]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2" fill="#14B8A6" stroke="#04152A" strokeWidth="0.5" />)}
            </svg>
          </div>

          {/* Recent list */}
          <div className="space-y-1.5">
            <div className="text-[9px] font-black text-slate-400 mb-1">فعالیت‌های اخیر</div>
            {[
              { i: "🎓", t: "ثبت‌نام جدید — دوره فتوشاپ" },
              { i: "💰", t: "پرداخت شهریه ۱,۲۹۰,۰۰۰ ت" },
              { i: "📊", t: "ثبت نمره برای ۵ هنرجو" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-[8px] bg-white/5 border border-white/5">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">{r.i}</div>
                <div className="text-[10px] text-slate-300 flex-1 truncate">{r.t}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Floating cards */}
      <FloatingCard
        icon={Users}
        label="هنرجو"
        value="+۱٬۲۵۰"
        color="bg-primary-500"
        className="absolute -top-4 -right-4 hidden md:block"
        delay={0.6}
      />
      <FloatingCard
        icon={Bot}
        label="AI Assistant"
        value="فعال"
        color="bg-gradient-to-br from-purple-500 to-fuchsia-500"
        className="absolute top-1/3 -left-6 hidden md:block"
        delay={0.8}
      />
      <FloatingCard
        icon={Wallet}
        label="فروش ماه"
        value="۸۹M ت"
        color="bg-gradient-to-br from-amber-500 to-orange-500"
        className="absolute -bottom-6 -left-2 hidden md:block"
        delay={1.0}
      />
      <FloatingCard
        icon={MessageCircle}
        label="پیام جدید"
        value="۲۴"
        color="bg-gradient-to-br from-emerald-500 to-teal-500"
        className="absolute bottom-1/4 -right-6 hidden md:block"
        delay={1.2}
      />
    </div>
  );
}

function FloatingCard({ icon: Icon, label, value, color, className, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className={`${className} p-3 rounded-[14px] bg-white/95 backdrop-blur-md shadow-2xl border border-white/20 min-w-[140px] animate-float`}
      style={{ animationDelay: `${delay + 1}s`, animationDuration: "6s" }}
    >
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded-[10px] ${color} flex items-center justify-center shrink-0 shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[9px] text-slate-500 font-bold">{label}</div>
          <div className="text-sm font-black text-slate-900 truncate">{value}</div>
        </div>
      </div>
    </motion.div>
  );
}
