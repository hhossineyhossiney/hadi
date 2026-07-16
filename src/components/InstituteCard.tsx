"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star, MapPin, Phone, BadgeCheck, Award, ArrowLeft, Building2,
  CheckCircle2, Bookmark, Sparkles,
} from "lucide-react";
import { pickCategoryVisual } from "@/lib/category-visuals";

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
  const numericRating = institute.rating ? parseFloat(institute.rating) : 0;
  const isTop = institute.isYearAward === true || numericRating >= 4.8;
  const primaryPhone = institute.mobile || institute.phone;
  const img = pickImage(institute);

  // Smart visual fallback based on institute name (e.g., "آموزشگاه کامپیوتر هدف" → computer)
  const visual = pickCategoryVisual(institute.name, institute.description);
  const pal = visual.palette;
  const fallbackImage = visual.image;
  const finalImage = img || fallbackImage;

  const highlights = (Array.isArray(institute.features) && institute.features.length > 0)
    ? (institute.features as string[]).slice(0, 2)
    : deriveHighlights(institute.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 8) * 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div className="relative h-full group">
        {/* Ambient glow */}
        <div
          className="absolute -inset-1 rounded-[42px] opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(60% 50% at 30% 20%, ${pal.glowFrom} 0%, transparent 60%), radial-gradient(50% 50% at 70% 90%, ${pal.glowTo} 0%, transparent 60%)`,
          }}
        />
        {/* Card body */}
        <div
          className="relative h-full flex flex-col overflow-hidden bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 backdrop-blur-xl border border-white/10 group-hover:border-white/25 transition-all duration-500"
          style={{
            borderRadius: "48px 28px 48px 28px / 32px 48px 32px 48px",
          }}
        >
          {/* inner glows */}
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-70"
            style={{ background: pal.glowFrom }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ background: pal.glowTo }}
          />
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          {/* Top row: organic image + institute info */}
          <div className="relative flex items-start gap-3 p-5 pb-3">
            {/* Organic image */}
            <div className="relative shrink-0 w-[130px] sm:w-[150px] h-[130px] sm:h-[150px] -mt-1 -mr-1">
              <div
                className="absolute inset-0 rounded-full opacity-80 blur-2xl"
                style={{ background: pal.glowFrom }}
              />
              <div
                className="relative w-full h-full overflow-hidden ring-1 ring-white/15"
                style={{ borderRadius: "62% 38% 55% 45% / 50% 60% 40% 50%" }}
              >
                <img
                  src={finalImage}
                  alt={institute.name}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (t.src !== fallbackImage) t.src = fallbackImage;
                  }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40 mix-blend-overlay pointer-events-none" />
              </div>
              <div className="card-icon-float absolute bottom-1 left-1 z-20 w-10 h-10 rounded-full bg-black/70 backdrop-blur-md border border-white/25 shadow-xl flex items-center justify-center text-lg pointer-events-none">
                {visual.icon}
              </div>
            </div>

            {/* Right-side info */}
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black backdrop-blur ${pal.badge}`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  آموزشگاه معتبر
                </span>
                <button
                  className={`w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition ${pal.bookmark}`}
                  title="ذخیره"
                  aria-label="ذخیره"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white leading-tight mb-1.5 line-clamp-2">
                {institute.name}
              </h3>

              {institute.regionName && (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                  <MapPin className={`w-3 h-3 ${pal.accent}`} />
                  <span className="line-clamp-1">{institute.regionName}</span>
                </div>
              )}

              {numericRating > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-white">
                      {numericRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    ({institute.reviewCount || 0} نظر)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Manager row */}
          {institute.managerName && (
            <div className="relative px-5 py-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-full bg-gradient-to-br ${pal.button} flex items-center justify-center shrink-0 text-white text-[10px] font-black`}
                >
                  {institute.managerName.trim().charAt(0)}
                </div>
                <div className="flex items-baseline gap-1 min-w-0">
                  <span className="text-[10px] text-slate-500">مدیریت:</span>
                  <span className="text-[11.5px] font-black text-white truncate">
                    {institute.managerName}
                  </span>
                </div>
              </div>
              {isTop && (
                <span className="card-neon-pulse flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow text-[9px] font-black text-white">
                  <Award className="w-2.5 h-2.5" />
                  برگزیده
                </span>
              )}
            </div>
          )}

          {/* Stats bar */}
          <div className="relative mx-5 mt-2 mb-3 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10">
              <Building2 className={`w-4 h-4 ${pal.accent} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-500 leading-none">دوره فعال</span>
                <span className="text-sm font-black text-white leading-tight mt-0.5">
                  {institute.courseCount ?? 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/[0.04] border border-white/10">
              <BadgeCheck className={`w-4 h-4 ${pal.accent} shrink-0`} />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-slate-500 leading-none">مجوز</span>
                <span className="text-xs font-black text-white leading-tight mt-0.5 truncate" dir="ltr">
                  {institute.licenseNumber || "دارد"}
                </span>
              </div>
            </div>
          </div>

          {/* Highlights / description */}
          {highlights.length > 0 ? (
            <ul className="relative px-5 space-y-1.5 mb-3">
              {highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${pal.accent} shrink-0 mt-0.5`} />
                  <span className="line-clamp-2">{h}</span>
                </li>
              ))}
            </ul>
          ) : institute.address ? (
            <div className="relative px-5 mb-3 flex items-start gap-1.5 text-[11px] text-slate-400">
              <MapPin className={`w-3.5 h-3.5 ${pal.accent} shrink-0 mt-0.5`} />
              <span className="line-clamp-2 leading-relaxed">{institute.address}</span>
            </div>
          ) : null}

          {/* Bottom row: phone + CTA */}
          <div className="relative mt-auto p-4 sm:p-5 pt-3 flex items-center justify-between gap-3">
            {primaryPhone ? (
              <a
                href={`tel:${primaryPhone}`}
                title={`تماس ${primaryPhone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[11px] font-black hover:bg-white/10 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                تماس
              </a>
            ) : (
              <span />
            )}
            <Link
              href={`/institutes/${institute.slug}`}
              className={`group/btn shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-white text-xs font-black bg-gradient-to-l ${pal.button} shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all`}
            >
              مشاهده آموزشگاه
              <ArrowLeft className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Badge برگزیده top-left corner */}
          {isTop && !institute.managerName && (
            <div className="absolute top-4 left-4 z-10">
              <div className="card-neon-pulse px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center gap-1">
                <Award className="w-3 h-3" />
                برگزیده سال
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
