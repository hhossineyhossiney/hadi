"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles, Zap, TrendingUp, MessageSquare, Wand2 } from "lucide-react";

const AI_FEATURES = [
  { icon: Wand2, title: "تولید محتوای تبلیغاتی", desc: "متن جذاب برای دوره‌ها با یک کلیک" },
  { icon: MessageSquare, title: "پاسخ خودکار به سوالات", desc: "چت‌بات هوشمند برای پشتیبانی ۲۴/۷" },
  { icon: TrendingUp, title: "تحلیل داده و پیشنهاد", desc: "پیشنهاد دوره و مسیر شغلی به هنرجویان" },
  { icon: Zap, title: "خلاصه و ترجمه محتوا", desc: "خلاصه‌سازی جلسات و ترجمه چند زبانه" },
];

export default function AITechSection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#04152A] via-[#1a0b3a] to-[#04152A]">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-fuchsia-500/20 blur-[100px] animate-float" style={{ animationDelay: "2s" }} />
        {/* mesh grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ai-grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(168, 85, 247, 0.8)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ai-grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Right: AI Visualization */}
          <div className="relative order-2 lg:order-1">
            <AIVisualization />
          </div>

          {/* Left: content */}
          <div className="order-1 lg:order-2 text-center lg:text-right">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-500/15 backdrop-blur-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse shadow-[0_0_10px_rgb(232_121_249)]" />
              <span className="text-xs font-black bg-gradient-to-l from-purple-300 to-fuchsia-300 bg-clip-text text-transparent uppercase tracking-wider">
                AI-POWERED TECHNOLOGY
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black text-white leading-tight mb-5"
              style={{ letterSpacing: "-0.02em" }}
            >
              نسل جدید آموزش با{" "}
              <span className="bg-gradient-to-l from-purple-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-slate-300 mb-8 leading-relaxed"
            >
              دستیار هوشمند برای مدیران آموزشگاه و هنرجویان — از تولید محتوا تا پاسخگویی خودکار، پیشنهاد دوره و تحلیل داده.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {AI_FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="p-4 rounded-[14px] bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center mb-2 shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-sm font-black text-white mb-1">{f.title}</div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">{f.desc}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* AI orbital visualization */
function AIVisualization() {
  return (
    <div className="relative aspect-square max-w-md mx-auto">
      {/* Central AI core */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, type: "spring" }}
        className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50 z-10"
        style={{ boxShadow: "0 0 80px rgba(168, 85, 247, 0.5), 0 0 40px rgba(232, 121, 249, 0.4)" }}
      >
        <Bot className="w-14 h-14 text-white" />
        {/* rotating rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin" style={{ animationDuration: "8s" }} />
        <div className="absolute -inset-3 rounded-full border-2 border-purple-400/30 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }} />
      </motion.div>

      {/* Orbital nodes */}
      {[
        { icon: "🎓", angle: 0, distance: 140, delay: 0.3 },
        { icon: "📊", angle: 60, distance: 140, delay: 0.4 },
        { icon: "💬", angle: 120, distance: 140, delay: 0.5 },
        { icon: "📚", angle: 180, distance: 140, delay: 0.6 },
        { icon: "🎯", angle: 240, distance: 140, delay: 0.7 },
        { icon: "⚡", angle: 300, distance: 140, delay: 0.8 },
      ].map((n, i) => {
        const rad = (n.angle * Math.PI) / 180;
        const x = Math.cos(rad) * n.distance;
        const y = Math.sin(rad) * n.distance;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            whileInView={{ opacity: 1, scale: 1, x, y }}
            viewport={{ once: true }}
            transition={{ delay: n.delay, type: "spring", stiffness: 60 }}
            className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-xl"
            style={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)" }}
          >
            {n.icon}
          </motion.div>
        );
      })}

      {/* Connection lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="ai-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        {[0, 60, 120, 180, 240, 300].map((a, i) => {
          const rad = (a * Math.PI) / 180;
          const x2 = 200 + Math.cos(rad) * 140;
          const y2 = 200 + Math.sin(rad) * 140;
          return <line key={i} x1="200" y1="200" x2={x2} y2={y2} stroke="url(#ai-line)" strokeWidth="1.5" strokeDasharray="4 4" />;
        })}
      </svg>

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-purple-300 animate-float"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${20 + Math.random() * 60}%`,
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${5 + Math.random() * 3}s`,
            boxShadow: "0 0 8px rgba(168, 85, 247, 0.8)",
          }}
        />
      ))}
    </div>
  );
}
