"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Phone, Loader2 } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

const FALLBACK_FAQS: Faq[] = [
  {
    id: 1,
    question: "آیا مدارک صادره از آموزشگاه‌های شبکه زبرخان معتبر و بین‌المللی است؟",
    answer:
      "بله! تمام آموزشگاه‌های معرفی شده در این سامانه دارای پروانه تاسیس رسمی از سازمان آموزش فنی و حرفه‌ای کشور هستند و مدرک پایان دوره آن‌ها دارای کد بین‌المللی ISCO-08 بوده و در بیش از ۱۷۰ کشور عضو سازمان جهانی کار (ILO) معتبر است.",
  },
  {
    id: 2,
    question: "چگونه می‌توانم در دوره‌ها ثبت‌نام کنم؟",
    answer:
      "روی دکمه «ثبت‌نام سریع» در صفحه‌ی هر دوره کلیک کنید. پس از تأیید توسط آموزشگاه با شما تماس گرفته می‌شود.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFaqs(data);
        else setFaqs(FALLBACK_FAQS);
      })
      .catch(() => setFaqs(FALLBACK_FAQS))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="faq" className="py-10 bg-bg-secondary relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-100/30 rounded-full blur-[100px]" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">
            FAQ &amp; SUPPORT
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mobile-one-line-title text-3xl lg:text-4xl font-black text-text-primary mb-3"
          >
            پاسخ به سوالات متداول هنرجویان
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary"
          >
            هر آنچه لازم است درباره مدارک فنی‌وحرفه‌ای، نحوه ثبت‌نام و آموزشگاه‌های زبرخان بدانید.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-surface rounded-[18px] border border-border-default overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-5 text-right hover:bg-primary-50/40 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 text-xs font-black">
                      {i + 1}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-text-primary text-right leading-relaxed">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-primary-500 shrink-0 transition-transform duration-300 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pr-14 text-text-secondary text-sm leading-loose border-t border-border-light pt-4 whitespace-pre-wrap">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-[20px] p-6 lg:p-8 text-white flex flex-col lg:flex-row items-center gap-5 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />
          <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0 relative">
            <HelpCircle className="w-7 h-7" />
          </div>
          <div className="flex-1 text-center lg:text-right relative">
            <h3 className="font-black text-lg mb-1">پاسخ سوال خود را پیدا نکردید؟</h3>
            <p className="text-sm text-white/80">
              کارشناسان نظارت و مشاوران مرکز شماره ۱۲ فنی و حرفه‌ای شهرستان زبرخان آماده پاسخگویی به شما هستند.
            </p>
          </div>
          <a
            href="tel:09159513179"
            className="relative shrink-0 flex items-center gap-2 px-6 py-3 bg-white text-primary-700 rounded-[14px] font-black text-sm shadow-lg hover:bg-primary-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            تماس با پشتیبانی
          </a>
        </motion.div>
      </div>
    </section>
  );
}
