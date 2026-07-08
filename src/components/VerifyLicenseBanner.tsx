"use client";

import { motion } from "framer-motion";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyLicenseBanner() {
  return (
    <section className="py-10 bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[24px] border border-secondary-200 bg-gradient-to-br from-secondary-50 via-white to-primary-50 p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-5"
        >
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, #0F766E 1px, transparent 0)`,
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-[20px] bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg shadow-secondary-500/30 shrink-0">
            <ShieldCheck className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
          </div>

          <div className="relative flex-1 text-center lg:text-right">
            <span className="text-[10px] font-black text-secondary-700 tracking-[0.2em] uppercase mb-1.5 block">
              TRUST & VERIFICATION
            </span>
            <h3 className="text-xl lg:text-2xl font-black text-text-primary mb-2">
              استعلام رسمی و تایید اعتبار آموزشگاه‌ها
            </h3>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
              شما می‌توانید با وارد کردن شماره پروانه هر آموزشگاه، اصالت آن را در سامانه نظارتی
              فنی و حرفه‌ای بررسی کنید و از اعتبار مدرک صادره اطمینان حاصل نمایید.
            </p>
          </div>

          <Link
            href="/institutes"
            className="relative shrink-0 flex items-center gap-2 px-7 py-3.5 rounded-[14px] bg-gradient-to-br from-secondary-600 to-secondary-700 hover:from-secondary-700 hover:to-secondary-800 text-white font-black text-sm shadow-lg shadow-secondary-600/30 transition-all"
          >
            استعلام آنلاین مجوزها
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
