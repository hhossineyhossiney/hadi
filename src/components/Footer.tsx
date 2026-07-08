import Link from "next/link";
import {
  GraduationCap, Phone, MapPin, Mail, Globe, ShieldCheck, Building2, ArrowLeft, Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-bg-dark text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-600/10 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: brand + CTA */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] gradient-button flex items-center justify-center shadow-lg shadow-primary-500/30">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black leading-snug">شبکه آموزشگاه‌های آزاد زبرخان</span>
                <span className="text-[11px] text-primary-300 font-bold mt-0.5">
                  مرکز شماره ۱۲ آموزش فنی و حرفه‌ای شهرستان
                </span>
              </div>
            </div>
            <p className="text-text-tertiary text-[13px] leading-relaxed">
              سامانه جامع جستجوی هوشمند، مقایسه و ثبت‌نام آنلاین در دوره‌های مهارتی
              آموزشگاه‌های آزاد فنی‌وحرفه‌ای در سطح شهرستان زبرخان (شهرهای قدمگاه، درود،
              اسحاق‌آباد و روستاها) با صدور مدرک رسمی و بین‌المللی.
            </p>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-2.5 pt-2">
              <Link href="/institutes"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-secondary-600 hover:bg-secondary-700 text-white text-[12px] font-black transition-colors">
                <ShieldCheck className="w-4 h-4" />
                استعلام اصالت مجوزها
              </Link>
              <a href="tel:09159513179"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[12px] font-black transition-colors">
                <Building2 className="w-4 h-4" />
                ثبت آموزشگاه جدید
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-black mb-6 text-sm tracking-wide text-white flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-primary-400" />
              دسترسی سریع
            </h4>
            <ul className="space-y-3.5">
              {[
                { href: "/", label: "صفحه اصلی سامانه" },
                { href: "/institutes", label: "آموزشگاه‌های برتر زبرخان" },
                { href: "/courses", label: "جدیدترین دوره‌های مهارتی" },
                { href: "/fields", label: "رشته‌های آموزشی (کامپیوتر، زیبایی، خیاطی...)" },
                { href: "/search", label: "جستجوی هوشمند" },
                { href: "/#faq", label: "سوالات متداول و راهنما" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}
                    className="text-text-tertiary hover:text-white transition-colors text-[13px] leading-relaxed line-clamp-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-black mb-6 text-sm tracking-wide text-white flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-primary-400" />
              اطلاعات تماس مرکز شماره ۱۲
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-text-tertiary text-[12.5px]">
                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center shrink-0 text-primary-300">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="leading-relaxed">
                  <span className="text-white/80 font-bold block mb-0.5">آدرس مرکز نظارتی:</span>
                  خراسان رضوی، شهرستان زبرخان، شهر قدمگاه، بلوار امام رضا (ع)، جنب بانک ملی،
                  ساختمان آموزش فنی و حرفه‌ای مرکز شماره ۱۲
                </div>
              </li>
              <li className="flex items-center gap-3 text-text-tertiary text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center shrink-0 text-primary-300">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <span>
                  <span className="text-white/80 font-bold">تلفن گویا و پشتیبانی: </span>
                  <a href="tel:05142224500" className="hover:text-white transition-colors" dir="ltr">۰۵۱-۴۲۲۲۴۵۰۰</a>
                </span>
              </li>
              <li className="flex items-center gap-3 text-text-tertiary text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center shrink-0 text-primary-300">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span>
                  <span className="text-white/80 font-bold">ایمیل رسمی: </span>
                  <a href="mailto:info@zeberkhan-tvto.ir" className="hover:text-white transition-colors" dir="ltr">info@zeberkhan-tvto.ir</a>
                </span>
              </li>
              <li className="flex items-center gap-3 text-text-tertiary text-[13px]">
                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-white/5 flex items-center justify-center shrink-0 text-primary-300">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span>
                  <span className="text-white/80 font-bold">لینک سامانه: </span>
                  <a href="https://amozeshgahazadconfig.vercel.app" target="_blank" rel="noopener noreferrer"
                    className="text-primary-300 hover:text-primary-200 transition-colors" dir="ltr">
                    amozeshgahazadconfig.vercel.app
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-black mb-6 text-sm tracking-wide text-white flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-primary-400" />
              رشته‌های پرطرفدار
            </h4>
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { href: "/fields/computer", label: "کامپیوتر" },
                { href: "/fields/beauty", label: "زیبایی" },
                { href: "/fields/tailoring", label: "خیاطی" },
                { href: "/fields/culinary", label: "آشپزی" },
                { href: "/search?q=%D8%AD%D8%B3%D8%A7%D8%A8%D8%AF%D8%A7%D8%B1%DB%8C", label: "حسابداری" },
                { href: "/search?q=ICDL", label: "ICDL" },
              ].map((link) => (
                <Link key={link.href} href={link.href}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-primary-500/20 hover:text-primary-200 hover:border-primary-500/40 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>

            <h4 className="font-black mb-4 text-sm tracking-wide text-white flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-primary-400" />
              پنل‌های سامانه
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/register" className="text-text-tertiary hover:text-white transition-colors text-[13px]">↳ ثبت‌نام آنلاین هنرجویان</Link></li>
              <li><Link href="/panel" className="text-text-tertiary hover:text-white transition-colors text-[13px]">↳ ورود به پنل هنرجویان</Link></li>
              <li><Link href="/dashboard" className="text-text-tertiary hover:text-white transition-colors text-[13px]">↳ ورود پنل آموزشگاه‌ها</Link></li>
              <li><Link href="/admin" className="text-text-tertiary hover:text-white transition-colors text-[13px]">↳ ورود پنل مدیر مرکز</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-tertiary text-xs text-center sm:text-right leading-relaxed">
            تمام حقوق مادی و معنوی این سامانه متعلق به شبکه آموزشگاه‌های آزاد شهرستان زبرخان
            (مرکز شماره ۱۲) می‌باشد. © ۱۴۰۳ - ۱۴۰۵
          </p>
          <div className="flex items-center gap-2 text-text-tertiary text-xs">
            <span className="flex items-center gap-1.5">
              طراحی و ارتقا با هوش مصنوعی برای
              <span className="text-primary-300 font-black">مردم شریف زبرخان</span>
              <Heart className="w-3.5 h-3.5 text-error-400 fill-error-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
