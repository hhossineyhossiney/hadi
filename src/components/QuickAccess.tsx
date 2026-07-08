"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ClipboardCheck, Scale, MapPin, Info } from "lucide-react";

const items = [
  {
    icon: ClipboardCheck,
    title: "ثبت‌نام آنلاین",
    desc: "ثبت‌نام سریع و آسان در دوره‌ها",
    href: "/register",
    gradient: "from-blue-600 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    icon: Scale,
    title: "مقایسه آموزشگاه‌ها",
    desc: "مقایسه امکانات و قیمت‌ها",
    href: "/institutes",
    gradient: "from-purple-600 to-fuchsia-500",
    bg: "bg-purple-50",
  },
  {
    icon: MapPin,
    title: "نقشه و مسیریابی",
    desc: "موقعیت دقیق روی نقشه",
    href: "/institutes",
    gradient: "from-emerald-600 to-teal-500",
    bg: "bg-emerald-50",
  },
  {
    icon: Info,
    title: "اطلاعات کامل",
    desc: "جزئیات دوره‌ها و اساتید",
    href: "/courses",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
  },
];

export default function QuickAccess() {
  return (
    <section className="relative -mt-10 z-20 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link
                href={item.href}
                className="group flex items-center gap-4 bg-surface rounded-[18px] border border-border-default p-5 hover:border-primary-200 hover-lift transition-all duration-400 h-full"
              >
                <div className={`w-13 h-13 w-14 h-14 rounded-[16px] bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-400`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-text-primary group-hover:text-primary-600 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-text-tertiary mt-0.5 hidden sm:block">{item.desc}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
