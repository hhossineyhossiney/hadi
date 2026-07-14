"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, MapPin, Sparkles, ArrowLeft, ShieldCheck, Award,
  Users, BookOpen, GraduationCap,
} from "lucide-react";

const POPULAR = ["حسابداری", "ICDL", "خیاطی", "آرایشگری", "آشپزی", "طراحی", "کامپیوتر"];
const CITIES = ["همه شهرها", "قدمگاه", "درود", "اسحاق‌آباد", "خور"];

export default function PublicHero() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("همه شهرها");

  return (
    <section className="relative overflow-hidden pt-32 lg:pt-40 pb-16 lg:pb-20">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04152A] via-[#0B4F8B]/25 to-[#04152A]" />
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-500/15 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-secondary-500/10 blur-[120px] animate-float" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(107, 220, 213, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(107, 220, 213, 0.5) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <ShieldCheck className="w-4 h-4 text-secondary-300" />
            <span className="text-xs font-black text-white">
              مورد تأیید سازمان فنی و حرفه‌ای — مرکز شماره ۱۲
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1]"
          style={{ letterSpacing: "-0.03em" }}
        >
          دوره‌ای که می‌خواستی،
          <br />
          <span className="bg-gradient-to-l from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
            یک جستجو باهاش فاصله داری.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center text-base md:text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          بیش از <span className="font-black text-white">۱۴۰ دوره فعال</span> در آموزشگاه‌های
          آزاد فنی‌وحرفه‌ای شهرستان زبرخان — با گواهی رسمی و بین‌المللی.
        </motion.p>

        {/* Search box */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          action="/search"
          method="GET"
          className="relative max-w-3xl mx-auto"
        >
          <div className="relative rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/15 shadow-2xl shadow-primary-900/40 p-2 flex flex-col md:flex-row items-stretch gap-2">
            {/* City select */}
            <div className="relative md:w-48">
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-300 pointer-events-none" />
              <select
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-12 md:h-full pr-9 pl-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="نام دوره، رشته یا آموزشگاه..."
                className="w-full h-12 pr-12 pl-4 rounded-2xl bg-transparent text-white text-sm font-bold placeholder-slate-400 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="h-12 px-8 rounded-2xl bg-gradient-to-l from-primary-600 to-secondary-500 text-white text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-xl shadow-primary-500/30"
            >
              <Search className="w-4 h-4" />
              جستجو
            </button>
          </div>

          {/* Popular categories */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-bold ml-2">جستجوی محبوب:</span>
            {POPULAR.map((p) => (
              <Link
                key={p}
                href={`/search?q=${encodeURIComponent(p)}`}
                className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-black text-slate-200 hover:bg-white/10 hover:border-white/20 transition-all"
              >
                {p}
              </Link>
            ))}
          </div>
        </motion.form>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            { href: "/institutes", icon: ShieldCheck, label: "آموزشگاه‌های دارای مجوز", color: "from-primary-500 to-primary-700" },
            { href: "/courses", icon: BookOpen, label: "دوره‌های در حال ثبت‌نام", color: "from-secondary-500 to-teal-700" },
            { href: "/shop", icon: GraduationCap, label: "دوره‌های آنلاین قابل خرید", color: "from-amber-500 to-orange-600" },
            { href: "/fields", icon: Award, label: "رشته‌ها و گواهی‌نامه‌ها", color: "from-fuchsia-500 to-purple-700" },
          ].map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <a.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-black text-white truncate">{a.label}</div>
              </div>
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 group-hover:text-white transition-all" />
            </Link>
          ))}
        </motion.div>

        {/* Institute owner banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <Link
            href="/for-institutes"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-l from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-xs md:text-sm font-black text-amber-200 hover:bg-amber-500/20 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            مدیر آموزشگاه هستید؟ سامانه هوشمند مدیریت را ببینید
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
