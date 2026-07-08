"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, MapPin } from "lucide-react";
import InstituteCard from "@/components/InstituteCard";

interface Institute {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  description?: string | null;
  phone: string | null;
  mobile: string | null;
  rating: string | null;
  reviewCount: number | null;
  isVerified: boolean | null;
  regionName?: string | null;
  courseCount?: number;
  logo?: string | null;
  profilePhoto?: string | null;
  bannerImages?: unknown;
  accessCode?: string | null;
  licenseNumber?: string | null;
  managerName?: string | null;
  managerTitle?: string | null;
  features?: unknown;
  isYearAward?: boolean | null;
  establishedYear?: string | null;
}

interface Props {
  institutes: Institute[];
}

export default function InstitutesShowcase({ institutes }: Props) {
  const [activeRegion, setActiveRegion] = useState<string>("all");

  const regions = useMemo(() => {
    const set = new Set<string>();
    institutes.forEach((i) => {
      if (i.regionName) set.add(i.regionName);
    });
    return Array.from(set);
  }, [institutes]);

  const filtered = useMemo(() => {
    if (activeRegion === "all") return institutes;
    return institutes.filter((i) => i.regionName === activeRegion);
  }, [institutes, activeRegion]);

  return (
    <section className="py-12 bg-bg-secondary relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-100/30 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 bg-secondary-50 border border-secondary-200 tracking-[0.15em] uppercase mb-4 px-3 py-1 rounded-full"
          >
            <Building2 className="w-3.5 h-3.5" />
            TOP INSTITUTES IN ZEBERKHAN
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl lg:text-4xl font-black text-text-primary mb-3"
          >
            آموزشگاه‌های برتر دارای مجوز رسمی
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            تمامی آموزشگاه‌های زیر دارای پروانه رسمی از مرکز فنی و حرفه‌ای شماره ۱۲ شهرستان
            زبرخان بوده و مدارک بین‌المللی صادر می‌کنند.
          </motion.p>
        </div>

        {regions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveRegion("all")}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-[14px] text-sm font-black transition-all ${
                activeRegion === "all"
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                  : "bg-surface border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              <MapPin className="w-4 h-4" />
              همه شهرهای زبرخان
            </button>
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-5 py-2.5 rounded-[14px] text-sm font-black transition-all ${
                  activeRegion === r
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                    : "bg-surface border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                شهر {r}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-[20px] border border-border-default">
            <Building2 className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary text-sm">
              آموزشگاهی در این منطقه ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 6).map((inst, i) => (
              <InstituteCard
                key={inst.id}
                institute={{
                  ...inst,
                  licenseNumber: inst.licenseNumber || inst.accessCode || null,
                  managerName: inst.managerName
                    ? (inst.managerTitle ? `${inst.managerTitle} ${inst.managerName}` : inst.managerName)
                    : null,
                }}
                index={i}
              />
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Link
            href="/institutes"
            className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-surface hover:bg-primary-600 hover:text-white border border-border-default hover:border-primary-600 text-text-primary font-black text-sm transition-all shadow-sm hover:shadow-lg group"
          >
            مشاهده همه آموزشگاه‌ها
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
