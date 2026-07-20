"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function BrandSplashScreen() {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    const storageKey = "fanixo-brand-splash-v2";
    if (sessionStorage.getItem(storageKey) === "shown") return;

    // Show the same premium identity once per browsing/app session everywhere:
    // desktop web, mobile web, PWA and the Android application.
    sessionStorage.setItem(storageKey, "shown");
    requestAnimationFrame(() => setVisible(true));
    const duration = standalone ? 2300 : 1650;
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 750 : duration);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="fanixo-splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.025 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.45 }}
          className="fixed inset-0 z-[1000] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#031326] px-6 text-white"
          role="status"
          aria-label="در حال آماده‌سازی فَنیکسو"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[110px]" />
            <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/10 blur-[80px]" />
            <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
          </div>

          <div className="relative flex flex-col items-center text-center">
            <div className="relative flex h-52 w-52 items-center justify-center sm:h-60 sm:w-60">
              <motion.div
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(34,211,238,0.95)_65deg,transparent_125deg,rgba(251,191,36,0.9)_210deg,transparent_290deg)] p-[2px] shadow-[0_0_45px_rgba(34,211,238,0.35)]"
              >
                <div className="h-full w-full rounded-full bg-[#031326]" />
              </motion.div>
              <motion.div
                animate={reducedMotion ? undefined : { rotate: -360 }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-dashed border-amber-200/35"
              />
              <motion.div
                animate={reducedMotion ? undefined : { scale: [0.96, 1.025, 0.96], filter: ["brightness(0.92)", "brightness(1.13)", "brightness(0.92)"] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
                className="relative h-40 w-40 overflow-hidden rounded-full border border-amber-100/40 bg-[#061a31] p-1.5 shadow-[0_0_45px_rgba(237,203,128,0.3)] sm:h-44 sm:w-44"
              >
                <img src="/brand/fanixo-emblem-circle-1024.png" alt="نشان فَنیکسو" className="h-full w-full rounded-full object-cover" />
              </motion.div>
              <motion.span
                animate={reducedMotion ? undefined : { rotate: 360 }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <span className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-amber-300 text-[#04152A] shadow-[0_0_24px_rgba(251,191,36,0.9)]">
                  <Sparkles className="h-4 w-4" />
                </span>
              </motion.span>
            </div>

            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
              فَنیکسو
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-2 text-xs font-bold text-cyan-100/75 sm:text-sm">
              آموزش هوشمند، مدیریت حرفه‌ای
            </motion.p>
            <div className="mt-7 h-1 w-40 overflow-hidden rounded-full bg-white/10">
              <motion.div
                animate={reducedMotion ? undefined : { x: ["-110%", "110%"] }}
                transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-2/3 rounded-full bg-gradient-to-l from-cyan-300 via-white to-amber-300 shadow-[0_0_14px_rgba(34,211,238,0.8)]"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
