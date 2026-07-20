"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function BrandWelcome() {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-5 sm:py-7 md:py-10" aria-labelledby="fanixo-welcome-title">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[8%] top-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />
        <div className="absolute bottom-0 left-[8%] h-64 w-64 rounded-full bg-fuchsia-500/10 blur-[90px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="group relative isolate overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#071a31] via-[#0a1630] to-[#160d2f] shadow-[0_24px_70px_rgba(2,12,27,0.34)] sm:rounded-[34px]"
        >
          <motion.div
            aria-hidden="true"
            animate={reducedMotion ? undefined : { x: ["-80%", "140%"] }}
            transition={{ duration: 7, repeat: Infinity, repeatDelay: 2.5, ease: "easeInOut" }}
            className="absolute inset-y-0 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.055] to-transparent blur-xl"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.045]"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }}
          />
          <div aria-hidden="true" className="absolute -right-24 -top-28 h-64 w-64 rounded-full border border-cyan-300/10 bg-cyan-400/[0.06] blur-[1px]" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full border border-fuchsia-300/10 bg-fuchsia-500/[0.07]" />

          <div className="relative z-10 grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[1fr_auto] md:p-10 lg:p-12">
            <div className="min-w-0 text-center md:text-right">
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, x: 16 }}
                whileInView={reducedMotion ? undefined : { opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 }}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1.5 text-[9px] font-black text-amber-200 sm:text-[10px]"
              >
                <Sparkles className="h-3.5 w-3.5" /> مهارت امروز، آینده فردا
              </motion.div>

              <h2 id="fanixo-welcome-title" className="w-full whitespace-nowrap text-[clamp(20px,7vw,29px)] font-black leading-relaxed tracking-[-0.055em] text-white md:whitespace-normal md:text-4xl md:tracking-normal lg:text-5xl">
                به <span className="bg-gradient-to-l from-cyan-300 via-primary-300 to-fuchsia-300 bg-clip-text text-transparent">فَنی‌اکسو</span> خوش آمدید
              </h2>
              <p className="mt-1 font-black leading-7 text-cyan-100 md:mt-2">
                <span className="block whitespace-nowrap text-[clamp(10.5px,3.35vw,14px)] tracking-[-0.045em] md:hidden">اولین سایت مدیریتی آموزشگاه‌های آزاد کشور</span>
                <span className="hidden text-lg md:inline">اولین سایت مدیریتی آموزشگاه‌های آزاد کشور</span>
              </p>
              <p className="mx-auto mt-3 max-w-3xl text-xs leading-6 text-slate-400 sm:text-sm sm:leading-7 md:mx-0">
                آموزشگاه‌ها، دوره‌های حضوری و آنلاین، ثبت‌نام، کلاس، پرداخت و مشاوره هوشمند؛ همه در یک تجربه سریع، شفاف و یکپارچه.
              </p>

            </div>

            <motion.div
              aria-hidden="true"
              animate={reducedMotion ? undefined : { y: [0, -8, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto hidden h-44 w-44 shrink-0 items-center justify-center md:flex lg:h-52 lg:w-52"
            >
              <motion.div animate={reducedMotion ? undefined : { rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-[42%] border border-cyan-300/20" />
              <motion.div animate={reducedMotion ? undefined : { rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute inset-5 rounded-[38%] border border-fuchsia-300/20" />
              <div className="absolute inset-9 rounded-[32px] bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 blur-xl" />
              <img src="/images/fanixo-logo.png" alt="" className="relative h-28 w-28 rounded-[28px] border border-white/15 object-cover shadow-2xl lg:h-32 lg:w-32" />
            </motion.div>
          </div>

          <div className="h-1 w-full bg-gradient-to-l from-cyan-400 via-primary-500 to-fuchsia-500 opacity-80" />
        </motion.div>
      </div>
    </section>
  );
}
