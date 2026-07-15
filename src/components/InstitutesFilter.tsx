"use client";

import { useState, useMemo } from "react";
import InstituteCard from "@/components/InstituteCard";
import { MapPin, Search } from "lucide-react";

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
}

export default function InstitutesFilter({ institutes }: { institutes: Institute[] }) {
  const [activeRegion, setActiveRegion] = useState<string>("all");
  const [query, setQuery] = useState("");

  const regions = useMemo(() => {
    const set = new Set<string>();
    institutes.forEach((i) => { if (i.regionName) set.add(i.regionName); });
    return Array.from(set);
  }, [institutes]);

  const filtered = useMemo(() => {
    let list = activeRegion === "all"
      ? institutes
      : institutes.filter((i) => i.regionName === activeRegion);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description || "").toLowerCase().includes(q) ||
        (i.accessCode || "").toLowerCase().includes(q) ||
        (i.licenseNumber || "").toLowerCase().includes(q) ||
        (i.managerName || "").toLowerCase().includes(q) ||
        (i.address || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [institutes, activeRegion, query]);

  return (
    <div>
      <div className="bg-surface rounded-[20px] border border-border-default p-3 mb-8 flex flex-col md:flex-row gap-3 items-stretch md:items-center shadow-sm">
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[14px] bg-bg-secondary flex-1 min-w-0">
          <Search className="w-4 h-4 text-primary-400 shrink-0" />
          <input type="text" placeholder="جستجو نام، مدیریت یا کد مجوز..."
            value={query} onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary text-text-primary" />
        </div>
        <div className="flex flex-wrap gap-2 justify-center md:justify-end">
          <button onClick={() => setActiveRegion("all")}
            className={`px-4 py-2.5 rounded-[12px] text-xs font-black transition-all ${
              activeRegion === "all"
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                : "bg-white/50 border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
            }`}>
            همه شهرهای زبرخان
          </button>
          {regions.map((r) => (
            <button key={r} onClick={() => setActiveRegion(r)}
              className={`px-4 py-2.5 rounded-[12px] text-xs font-black transition-all ${
                activeRegion === r
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                  : "bg-white/50 border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
              }`}>شهر {r}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-[20px] border border-border-default">
          <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-40" />
          <p className="text-text-secondary text-sm">آموزشگاهی با این معیارها یافت نشد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((inst, i) => (
            <InstituteCard
              key={inst.id}
              institute={{
                ...inst,
                licenseNumber: inst.licenseNumber || null,
                managerName: inst.managerName
                  ? (inst.managerTitle ? `${inst.managerTitle} ${inst.managerName}` : inst.managerName)
                  : null,
              }}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
