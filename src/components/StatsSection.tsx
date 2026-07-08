"use client";

import { motion } from "framer-motion";
import { Building2, Users, BookOpen, Award } from "lucide-react";

const stats = [
  { icon: Building2, label: "آموزشگاه", value: "۱۸+" },
  { icon: BookOpen, label: "دوره آموزشی", value: "۱۴+" },
  { icon: Users, label: "هنرجو", value: "۵۰۰+" },
  { icon: Award, label: "رشته", value: "۵+" },
];

export default function StatsSection() {
  return (
    <section className="py-12 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-[16px] bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 border border-white/10">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-primary-100 text-sm font-medium tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
