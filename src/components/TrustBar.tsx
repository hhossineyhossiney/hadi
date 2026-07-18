"use client";

import { motion } from "framer-motion";
import { FileSpreadsheet, GraduationCap, LayoutDashboard, ShieldCheck } from "lucide-react";

const badges = [
  { icon: LayoutDashboard, label: "امکانات پنل مدیر", value: "۲۲ بخش" },
  { icon: GraduationCap, label: "خدمات پنل هنرجو", value: "۲۳ ابزار" },
  { icon: FileSpreadsheet, label: "خروجی مدیریتی", value: "۶ گزارش Excel" },
  { icon: ShieldCheck, label: "ساختار دسترسی", value: "نقش‌محور" },
];

export default function TrustBar() {
  return (
    <section className="relative py-10 border-y border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {badges.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <b.icon className="w-5 h-5 text-primary-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-slate-400 mb-0.5 truncate">{b.label}</div>
                <div className="text-base lg:text-lg font-black text-white leading-tight">{b.value}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
