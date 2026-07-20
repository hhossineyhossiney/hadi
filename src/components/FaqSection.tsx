"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Phone, Loader2 } from "lucide-react";

interface Faq {
  id: number;
  question: string;
  answer: string;
}

const MANAGER_FAQS: Faq[] = [
  {
    id: 101,
    question: "حساب مدیر آموزشگاه چگونه فعال می‌شود؟",
    answer: "حساب مدیر توسط مدیر کل سامانه ساخته و به آموزشگاه مربوط متصل می‌شود. سپس مدیر با شماره موبایل و رمز اختصاصی وارد پنل می‌شود و فقط اطلاعات همان آموزشگاه را مدیریت می‌کند.",
  },
  {
    id: 102,
    question: "درخواست ثبت‌نام هنرجو کجا نمایش داده می‌شود؟",
    answer: "پس از ثبت درخواست از صفحه دوره، پرونده در بخش «لیست هنرجویان» با وضعیت در انتظار قرار می‌گیرد. مدیر می‌تواند اطلاعات و مدارک را بررسی و درخواست را تأیید یا رد کند.",
  },
  {
    id: 103,
    question: "آیا می‌توان شهریه را قسط‌بندی و هزینه‌های جانبی را ثبت کرد؟",
    answer: "بله. داخل پرونده هر هنرجو امکان تعریف چند قسط با مبلغ و سررسید، هزینه مدرک، آزمون اول، آزمون مجدد، دهک‌بندی دولتی و سایر هزینه‌ها وجود دارد. پرداخت دستی، لغو، بخشودگی و گزارش Excel نیز پشتیبانی می‌شود.",
  },
  {
    id: 104,
    question: "فروش دوره آنلاین چگونه فعال می‌شود؟",
    answer: "مدیر کل سامانه مجوز فروش آنلاین، سقف تعداد دوره و درصد کمیسیون را برای آموزشگاه تعیین می‌کند. پس از فعال‌سازی، مدیر می‌تواند دوره ویدئویی، فصل، درس، پیش‌نمایش رایگان، قیمت و وضعیت انتشار را مدیریت کند.",
  },
  {
    id: 105,
    question: "چه گزارش‌هایی در اختیار مدیر آموزشگاه است؟",
    answer: "شش خروجی Excel شامل فهرست هنرجویان، دوره‌ها، نمرات و کارنامه‌ها، حضور و غیاب، درآمد فروش آنلاین و شهریه و اقساط قابل دانلود است.",
  },
  {
    id: 106,
    question: "آیا پنل در موبایل قابل استفاده است؟",
    answer: "بله. پنل مدیر و هنرجو، منوها، فرم‌ها، چت و صفحات عمومی برای موبایل و دسکتاپ واکنش‌گرا طراحی شده‌اند و در موبایل منوی کشویی اختصاصی دارند.",
  },
  {
    id: 107,
    question: "اطلاعاتی که مدیر وارد می‌کند کجا دیده می‌شود؟",
    answer: "مشخصات، تصاویر، گالری، بنر، استوری، دوره‌ها و اطلاعات مدرس در کارت‌ها و صفحه اختصاصی آموزشگاه یا دوره نمایش داده می‌شوند. اطلاعات آموزشی، مالی و ارزیابی فقط در پنل افراد مجاز قابل مشاهده است.",
  },
  {
    id: 108,
    question: "هوش مصنوعی سامانه چه کمکی به مدیر می‌کند؟",
    answer: "استودیوی AI برای تولید توضیح حرفه‌ای دوره، پیامک تبلیغاتی، کپشن اینستاگرام و گفت‌وگو با دستیار مدیر در دسترس است. مشاور عمومی سایت نیز بر اساس داده‌های زنده دوره‌ها و آموزشگاه‌ها به هنرجویان پاسخ می‌دهد.",
  },
];

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

export default function FaqSection({ audience = "students" }: { audience?: "students" | "managers" }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<Faq[]>(audience === "managers" ? MANAGER_FAQS : []);
  const [loading, setLoading] = useState(audience !== "managers");

  useEffect(() => {
    if (audience === "managers") return;

    fetch("/api/faqs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFaqs(data);
        else setFaqs(FALLBACK_FAQS);
      })
      .catch(() => setFaqs(FALLBACK_FAQS))
      .finally(() => setLoading(false));
  }, [audience]);

  return (
    <section id="faq" className="relative overflow-hidden bg-bg-secondary py-8 md:py-10">
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
            {audience === "managers" ? "پاسخ به سوالات مدیران آموزشگاه‌ها" : "پاسخ به سوالات متداول هنرجویان"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-secondary"
          >
            {audience === "managers"
              ? "پاسخ روشن درباره راه‌اندازی پنل، ثبت‌نام‌ها، امور مالی، فروش آنلاین، گزارش‌ها و هوش مصنوعی."
              : "هر آنچه لازم است درباره مدارک فنی‌وحرفه‌ای، نحوه ثبت‌نام و آموزشگاه‌های زبرخان بدانید."}
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
