"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Sparkles,
  ChevronDown,
  Building2,
  GraduationCap,
  Users,
  BadgeCheck,
  ShieldCheck,
  Award,
  FileSearch,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  const regions = [
    { value: "", label: "همه مناطق" },
    { value: "qadamgah", label: "قدمگاه" },
    { value: "dorud", label: "درود" },
    { value: "eshaqabad", label: "اسحاق‌آباد" },
    { value: "khor", label: "خور" },
  ];

  const stats = [
    { icon: Building2, value: "۱۸+", label: "آموزشگاه فعال" },
    { icon: GraduationCap, value: "۱۴+", label: "دوره مهارتی" },
    { icon: Users, value: "۵۰۰+", label: "هنرجوی موفق" },
    { icon: BadgeCheck, value: "۱۰۰٪", label: "دارای مجوز رسمی" },
  ];

  const trustBadges = [
    { icon: ShieldCheck, label: "۱۰۰٪ دارای مجوز رسمی" },
    { icon: Award, label: "صدور مدرک بین‌المللی" },
    { icon: FileSearch, label: "استعلام اصالت آموزشگاه‌ها" },
  ];

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedRegion) params.set("region", selectedRegion);
    if (selectedCategory) params.set("category", selectedCategory);
    return `/search?${params.toString()}`;
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex flex-col items-center justify-center overflow-hidden pb-16">
      {/* Map-grid background */}
      <div className="absolute inset-0">
        <img src="/images/hero-map.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1B3A]/85 via-[#0B1B3A]/70 to-[#0B1B3A]/95" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-24 right-16 w-80 h-80 bg-primary-500/20 rounded-full blur-[110px] animate-float" />
      <div className="absolute bottom-40 left-16 w-96 h-96 bg-primary-400/10 rounded-full blur-[130px] animate-float" style={{ animationDelay: "-3s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 lg:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-dark text-white/90 text-sm font-semibold mb-8 border border-white/15"
          >
            <Sparkles className="w-4 h-4 text-accent-400" />
            <span>شبکه هوشمند آموزشگاه‌های آزاد شهرستان زبرخان</span>
          </motion.div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.12] mb-6 tracking-tight">
            آینده شغلی خود را
            <br />
            <span className="bg-gradient-to-r from-primary-300 via-primary-400 to-accent-400 bg-clip-text text-transparent">
              همین‌جا بسازید
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            جستجوی هوشمند بین آموزشگاه‌های دارای مجوز رسمی سازمان فنی‌وحرفه‌ای در شهرستان زبرخان،
            مقایسه دوره‌های مهارتی و ثبت‌نام آنلاین با ارائه مدرک بین‌المللی در کمتر از ۲ دقیقه.
          </p>

          {/* Smart Search Engine — 3 fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="glass-card rounded-[24px] p-2.5 flex flex-col lg:flex-row gap-2.5 shadow-2xl shadow-black/20">
              <div className="flex-1 flex items-center gap-3 px-5 py-4 rounded-[16px] bg-white/85 border border-white/50">
                <Search className="w-5 h-5 text-primary-500 shrink-0" />
                <input
                  type="text"
                  placeholder="نام دوره، رشته یا آموزشگاه..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary text-text-primary font-medium"
                />
              </div>
              <div className="flex items-center gap-2.5 px-4 py-4 rounded-[16px] bg-white/85 border border-white/50">
                <MapPin className="w-5 h-5 text-primary-500 shrink-0" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent text-sm outline-none text-text-secondary cursor-pointer min-w-[100px] font-medium"
                >
                  {regions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-4 rounded-[16px] bg-white/85 border border-white/50">
                <BookOpen className="w-5 h-5 text-primary-500 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-sm outline-none text-text-secondary cursor-pointer min-w-[110px] font-medium max-w-[160px] truncate"
                >
                  <option value="">همه رشته‌ها</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </div>
              <Link
                href={buildSearchUrl()}
                className="px-8 py-4 rounded-[16px] text-sm font-bold text-white gradient-button hover:gradient-button-hover shadow-xl shadow-primary-600/40 hover:shadow-primary-600/60 transition-all flex items-center justify-center gap-2 min-w-[130px]"
              >
                <Search className="w-4 h-4" />
                جستجو
              </Link>
            </div>
          </motion.div>

          {/* Popular tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-sm"
          >
            <span className="text-white/40 text-xs">پرطرفدارها:</span>
            {["حسابداری", "ICDL", "خیاطی", "آرایشگری", "آشپزی"].map((tag) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="px-4 py-1.5 rounded-full glass-dark border border-white/12 hover:border-primary-400/50 hover:text-primary-300 transition-all text-white/70 text-xs font-medium"
              >
                {tag}
              </Link>
            ))}
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          >
            {trustBadges.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-2 text-white/70 text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-full bg-primary-500/20 border border-primary-400/30 flex items-center justify-center">
                  <b.icon className="w-3.5 h-3.5 text-primary-300" />
                </div>
                {b.label}
              </div>
            ))}
          </motion.div>

          {/* Dual CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/institutes"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] text-sm font-bold text-white gradient-button hover:gradient-button-hover shadow-lg shadow-primary-600/30 transition-all"
            >
              جستجوی آموزشگاه‌ها
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-[14px] text-sm font-bold text-white/90 border border-white/25 hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
            >
              ثبت‌نام آنلاین در دوره‌ها
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust stats band */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((s) => (
            <div key={s.label} className="glass-dark rounded-[20px] border border-white/10 px-5 py-4 flex items-center gap-3.5 text-right">
              <div className="w-11 h-11 rounded-[14px] bg-primary-500/15 border border-primary-400/20 flex items-center justify-center shrink-0">
                <s.icon className="w-5 h-5 text-primary-300" />
              </div>
              <div>
                <div className="text-xl font-black text-white leading-tight">{s.value}</div>
                <div className="text-[11px] text-white/50 font-medium">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 rounded-full glass-dark border border-white/15 flex items-center justify-center"
        >
          <ChevronDown className="w-4 h-4 text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
