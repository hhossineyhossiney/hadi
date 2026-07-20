"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDownToLine, Download, Rocket, Smartphone, Sparkles } from "lucide-react";

const APK_URL = "/download/android";

export default function AppDownloadSection() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="download-app" className="relative overflow-hidden py-4 sm:py-6 md:py-8">
      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.985 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group relative isolate overflow-hidden rounded-[24px] border border-orange-300/20 bg-gradient-to-l from-[#291052] via-[#591b76] to-[#b8325d] shadow-[0_22px_70px_rgba(104,24,111,0.28)] sm:rounded-[30px]"
        >
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(251,191,36,0.22),transparent_35%),radial-gradient(circle_at_90%_80%,rgba(34,211,238,0.16),transparent_35%)]" />
          <div aria-hidden="true" className="absolute inset-0 opacity-[0.055]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "19px 19px" }} />
          <motion.div
            aria-hidden="true"
            animate={reducedMotion ? undefined : { x: ["-90%", "170%"] }}
            transition={{ duration: 5.5, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            className="absolute inset-y-0 w-1/4 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-lg"
          />

          <div className="relative z-10 flex flex-col items-center gap-4 p-5 text-center sm:p-7 md:flex-row md:gap-6 md:p-8 md:text-right lg:px-10">
            <motion.div
              animate={reducedMotion ? undefined : { y: [0, -6, 0], rotate: [0, -3, 3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-white/20 bg-white/15 shadow-2xl backdrop-blur md:h-24 md:w-24"
            >
              <motion.span
                aria-hidden="true"
                animate={reducedMotion ? undefined : { scale: [1, 1.35, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
                className="absolute inset-0 rounded-[24px] border-2 border-amber-300/60"
              />
              <Smartphone className="h-9 w-9 text-white md:h-11 md:w-11" />
              <span className="absolute -left-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-300 text-slate-950 shadow-lg">
                <Sparkles className="h-4 w-4" />
              </span>
            </motion.div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200/30 bg-amber-300 px-3 py-1.5 text-[9px] font-black text-slate-950 shadow-lg sm:text-[10px]">
                <Rocket className="h-3.5 w-3.5" /> قابلیت جدید فَنیکسو
              </div>
              <h2 className="w-full whitespace-nowrap text-[clamp(17px,5.3vw,23px)] font-black leading-relaxed tracking-[-0.05em] text-white md:whitespace-normal md:text-4xl md:tracking-normal">
                <span className="md:hidden">اپ اندروید آماده نصب است!</span>
                <span className="hidden md:inline">اپلیکیشن اندروید آماده نصب است!</span>
              </h2>
              <p className="mt-2 text-xs font-medium leading-6 text-white/75 sm:text-sm">
                همین حالا دانلود کنید و فَنیکسو را سریع‌تر و تمام‌صفحه روی موبایل داشته باشید.
              </p>
            </div>

            <motion.a
              href={APK_URL}
              whileHover={reducedMotion ? undefined : { scale: 1.035 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[15px] bg-white px-6 py-4 text-sm font-black text-[#581b74] shadow-[0_16px_35px_rgba(0,0,0,0.25)] sm:w-auto md:min-w-48"
            >
              <motion.span
                aria-hidden="true"
                animate={reducedMotion ? undefined : { y: [-24, 24] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-4 text-orange-400/25"
              >
                <ArrowDownToLine className="h-9 w-9" />
              </motion.span>
              <Download className="relative h-5 w-5" />
              <span className="relative">دانلود و نصب</span>
            </motion.a>
          </div>

          <div className="relative z-10 h-1 bg-gradient-to-l from-cyan-300 via-amber-300 to-pink-300" />
        </motion.div>
      </div>
    </section>
  );
}
