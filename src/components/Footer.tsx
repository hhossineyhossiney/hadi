import Link from "next/link";
import {
  Phone, MapPin, Mail, Globe, ShieldCheck, Building2, ArrowLeft, Heart,
  LayoutDashboard, UserRoundCog,
} from "lucide-react";

const QUICK_LINKS = [
  { href: "/", label: "صفحه اصلی سامانه" },
  { href: "/institutes", label: "آموزشگاه‌های برتر" },
  { href: "/courses", label: "دوره‌های مهارتی" },
  { href: "/search", label: "جستجوی هوشمند" },
  { href: "/#faq", label: "سوالات متداول" },
];

const PANEL_LINKS = [
  { href: "/register", label: "ثبت‌نام آنلاین" },
  { href: "/dashboard", label: "پنل هنرجویان" },
  { href: "/panel", label: "پنل آموزشگاه‌ها" },
  { href: "/admin", label: "پنل مدیر مرکز" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#04152A] text-white relative overflow-visible">
      {/* Animated nested waves — a soft visual bridge from content to footer */}
      <div className="absolute -top-20 inset-x-0 h-24 overflow-hidden pointer-events-none" aria-hidden="true">
        <svg className="footer-wave footer-wave-back absolute inset-x-0 bottom-0 w-[110%] -left-[5%] h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,72 C180,24 330,104 520,58 C715,11 850,103 1050,54 C1215,14 1340,56 1440,38 L1440,120 L0,120 Z" fill="rgba(20,184,166,0.24)" />
        </svg>
        <svg className="footer-wave footer-wave-middle absolute inset-x-0 bottom-0 w-[112%] -left-[6%] h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,82 C220,40 350,94 560,68 C750,44 870,95 1080,60 C1250,31 1355,58 1440,50 L1440,120 L0,120 Z" fill="rgba(59,130,246,0.22)" />
        </svg>
        <svg className="footer-wave footer-wave-front absolute inset-x-0 bottom-0 w-[108%] -left-[4%] h-full" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,88 C160,54 335,104 535,76 C720,50 920,98 1110,72 C1260,51 1370,68 1440,61 L1440,120 L0,120 Z" fill="#04152A" />
        </svg>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary-500/8 rounded-full blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "26px 26px" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0 bg-[#071a33] border border-amber-400/20 shadow-lg shadow-primary-500/20">
                <img src="/images/fanixo-logo.png" alt="لوگوی فَنیکسو" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black leading-snug whitespace-nowrap">آموزشگاه‌های آزاد فنی و حرفه‌ای زبرخان</span>
                <span className="text-[10px] text-primary-300 font-bold mt-0.5 whitespace-nowrap">مرکز شماره ۱۲</span>
              </div>
            </div>
            <p className="text-slate-400 text-[12.5px] leading-7 max-w-md">
              سامانه جامع معرفی آموزشگاه‌ها، جستجو و ثبت‌نام آنلاین دوره‌های مهارتی شهرستان زبرخان با امکان مقایسه، انتخاب و دریافت خدمات آموزشی معتبر.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Link href="/institutes" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-secondary-600 hover:bg-secondary-700 text-white text-[11px] font-black transition-colors shadow-lg shadow-secondary-600/15">
                <ShieldCheck className="w-4 h-4" /> استعلام مجوزها
              </Link>
              <a href="tel:09159513179" className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-white/10 hover:bg-white/15 border border-white/15 text-white text-[11px] font-black transition-colors">
                <Building2 className="w-4 h-4" /> ثبت آموزشگاه
              </a>
            </div>
          </div>

          {/* Quick access + panels, always side-by-side */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 sm:gap-4">
            <section className="rounded-[20px] border border-white/10 bg-white/[0.035] p-3.5 sm:p-4 min-h-[230px] backdrop-blur-sm">
              <h4 className="font-black mb-4 text-[12px] sm:text-sm text-white flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5 text-primary-400" /> دسترسی سریع
              </h4>
              <ul className="space-y-3">
                {QUICK_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-[10.5px] sm:text-[12px] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-500/60 group-hover:bg-primary-300 group-hover:shadow-[0_0_8px_rgba(45,212,191,0.8)] transition" />
                      <span className="line-clamp-1">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[20px] border border-white/10 bg-white/[0.035] p-3.5 sm:p-4 min-h-[230px] backdrop-blur-sm">
              <h4 className="font-black mb-4 text-[12px] sm:text-sm text-white flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-fuchsia-300" /> پنل‌های سامانه
              </h4>
              <ul className="space-y-2.5">
                {PANEL_LINKS.map((link, index) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group flex items-center gap-2 p-2 rounded-[10px] bg-white/[0.03] hover:bg-primary-500/15 border border-transparent hover:border-primary-500/20 text-slate-400 hover:text-white transition-all text-[10px] sm:text-[11.5px]">
                      <UserRoundCog className={`w-3.5 h-3.5 shrink-0 ${index % 2 ? "text-fuchsia-300" : "text-cyan-300"}`} />
                      <span className="line-clamp-1">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4 rounded-[22px] border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.02] p-4 sm:p-5 backdrop-blur-sm">
            <h4 className="font-black mb-5 text-sm text-white flex items-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-primary-400" /> اطلاعات تماس مرکز شماره ۱۲
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400 text-[12px]">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 text-primary-300">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="leading-6">
                  <span className="text-white/85 font-bold block mb-0.5">آدرس مرکز فنی و حرفه‌ای شماره ۱۲ زبرخان:</span>
                  شهرستان زبرخان - قدمگاه - نبش میدان ولایت سمت راست
                </div>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-[12px]">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 text-primary-300"><Phone className="w-3.5 h-3.5" /></div>
                <span><span className="text-white/80 font-bold">تلفن پشتیبانی: </span><a href="tel:05142224500" className="hover:text-white" dir="ltr">۰۵۱-۴۲۲۲۴۵۰۰</a></span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-[12px]">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 text-primary-300"><Mail className="w-3.5 h-3.5" /></div>
                <span><span className="text-white/80 font-bold">ایمیل: </span><a href="mailto:info@zeberkhan-tvto.ir" className="hover:text-white" dir="ltr">info@zeberkhan-tvto.ir</a></span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-[12px]">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 text-primary-300"><Globe className="w-3.5 h-3.5" /></div>
                <span><span className="text-white/80 font-bold">وب‌سایت: </span><a href="https://fanixo.ir" target="_blank" rel="noopener noreferrer" className="text-primary-300 hover:text-primary-200" dir="ltr">fanixo.ir</a></span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[11px] text-center sm:text-right leading-relaxed">
            تمام حقوق مادی و معنوی این سامانه متعلق به شبکه آموزشگاه‌های آزاد شهرستان زبرخان (مرکز شماره ۱۲) است. © ۱۴۰۳ - ۱۴۰۵
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1.5">
              طراحی و ارتقا با هوش مصنوعی برای <span className="text-primary-300 font-black">مردم شریف زبرخان</span>
              <Heart className="w-3.5 h-3.5 text-error-400 fill-error-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
