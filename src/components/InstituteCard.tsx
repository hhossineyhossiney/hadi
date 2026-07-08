"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, MapPin, Phone, BadgeCheck, GraduationCap, Award, ArrowLeft, CheckCircle2,
} from "lucide-react";
import { getInstituteTheme } from "@/lib/cardTheme";

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
  image?: string | null;
  profilePhoto?: string | null;
  managerName?: string | null;
  licenseNumber?: string | null;
  bannerImages?: unknown;
  isYearAward?: boolean | null;
  features?: unknown;
}

function pickImage(inst: Institute): string | null {
  if (inst.profilePhoto) return inst.profilePhoto;
  if (inst.image) return inst.image;
  if (inst.logo) return inst.logo;
  const banners = inst.bannerImages;
  if (Array.isArray(banners) && banners.length > 0 && typeof banners[0] === "string") {
    return banners[0] as string;
  }
  return null;
}

function deriveHighlights(desc: string | null | undefined): string[] {
  if (!desc) return [];
  const parts = desc.split(/[.،؛\n]+/).map((s) => s.trim()).filter((s) => s.length > 15 && s.length < 100);
  return parts.slice(0, 2);
}

export default function InstituteCard({ institute, index = 0 }: { institute: Institute; index?: number }) {
  const theme = getInstituteTheme(institute.name, index);
  const numericRating = institute.rating ? parseFloat(institute.rating) : 0;
  const isTop = institute.isYearAward === true || numericRating >= 4.8;
  const primaryPhone = institute.mobile || institute.phone;
  const img = pickImage(institute);
  const highlights = (Array.isArray(institute.features) && institute.features.length > 0)
    ? institute.features.slice(0, 2)
    : deriveHighlights(institute.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="group h-full flex flex-col bg-surface rounded-[20px] border border-border-default hover:border-primary-300 hover-lift transition-all duration-500 overflow-hidden">
        <div className="relative h-52 overflow-hidden">
          {img ? (
            <>
              <img src={img} alt={institute.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
            </>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} relative`}>
              <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`, backgroundSize: "22px 22px" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-[16px] bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
            {isTop && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-accent-500 to-orange-500 shadow-lg">
                <Award className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-black text-white">برگزیده سال</span>
              </div>
            )}
          </div>

          {institute.regionName && (
            <div className="absolute top-3 right-3 z-10">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-black border border-white/20">
                <MapPin className="w-3 h-3" /> {institute.regionName}
              </span>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3 z-10">
            <div className="flex items-end justify-between gap-2">
              {numericRating > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md">
                  <Star className="w-3.5 h-3.5 text-accent-400 fill-accent-400" />
                  <span className="text-xs font-black text-white">{numericRating.toFixed(1)}</span>
                  <span className="text-[9px] text-white/70 font-bold">({institute.reviewCount || 0})</span>
                </div>
              )}
              <h3 className="text-white font-black text-sm leading-snug line-clamp-2 text-right flex-1">
                {institute.name}
              </h3>
            </div>
            {institute.licenseNumber && (
              <div className="mt-1.5 flex items-center gap-1 justify-end">
                {institute.isVerified && (<BadgeCheck className="w-3 h-3 text-secondary-400" />)}
                <span className="text-[10px] font-bold text-white/80" dir="ltr">مجوز: {institute.licenseNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-light">
            {institute.managerName ? (
              <div className="flex items-center gap-1 text-[11px] text-text-secondary">
                <span className="font-medium">مدیریت:</span>
                <span className="font-black text-text-primary">{institute.managerName}</span>
              </div>
            ) : (
              <span className="text-[11px] text-text-tertiary">مدیریت آموزشگاه</span>
            )}
            {institute.courseCount !== undefined && (
              <div className="flex items-center gap-1 text-primary-600 text-[11px] font-black">
                <GraduationCap className="w-3.5 h-3.5" />
                {institute.courseCount} دوره فعال
              </div>
            )}
          </div>

          {institute.description && (
            <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 mb-3">{institute.description}</p>
          )}

          {highlights.length > 0 && (
            <ul className="space-y-1.5 mb-4">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5 text-[11px] text-text-secondary leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-secondary-500 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{h}</span>
                </li>
              ))}
            </ul>
          )}

          {institute.address && !highlights.length && (
            <div className="flex items-start gap-1.5 text-text-tertiary text-[11px] mb-4">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-400 mt-0.5" />
              <span className="line-clamp-2 leading-relaxed">{institute.address}</span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-3">
            {primaryPhone && (
              <a href={`tel:${primaryPhone}`} title={`تماس با ${primaryPhone}`}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-[10px] border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600 text-[11px] font-black transition-colors shrink-0">
                <Phone className="w-3.5 h-3.5" />
                تماس
              </a>
            )}
            <Link href={`/institutes/${institute.slug}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-black text-white gradient-button px-3.5 py-2.5 rounded-[10px] hover:gradient-button-hover transition-all">
              مشاهده دوره‌ها و جزئیات
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
