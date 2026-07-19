"use client";

import { Download, MonitorSmartphone, ShieldCheck, Smartphone, Sparkles, Zap } from "lucide-react";

const APK_URL = "/download/android";

export default function AppDownloadSection() {
  return (
    <section id="download-app" className="relative overflow-hidden py-10 md:py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[8%] top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute bottom-0 left-[8%] h-72 w-72 rounded-full bg-primary-500/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#071426] via-[#0A2444] to-[#071426] shadow-2xl">
          <div className="grid items-center gap-7 p-6 md:grid-cols-[1fr_auto] md:p-10 lg:p-12">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-black text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" /> نسخه رسمی اندروید
              </span>
              <h2 className="text-2xl font-black leading-tight text-white md:text-4xl">اپلیکیشن فَنی‌اکسو را نصب کنید</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                دسترسی سریع به آموزشگاه‌ها، دوره‌ها، پنل هنرجو و مدیر، کلاس‌ها، پرداخت‌ها، چت و دستیار هوشمند در یک اپلیکیشن سبک و همیشه به‌روز.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { icon: ShieldCheck, label: "امضای دیجیتال معتبر" },
                  { icon: Zap, label: "حجم کمتر از ۲ مگابایت" },
                  { icon: MonitorSmartphone, label: "Android 5 و بالاتر" },
                ].map(({ icon: Icon, label }) => (
                  <span key={label} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold text-slate-300">
                    <Icon className="h-3.5 w-3.5 text-primary-300" /> {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="w-full md:w-72">
              <div className="mb-3 flex items-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.055] p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-emerald-400 to-primary-600 shadow-lg">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">Fanixo Android</div>
                  <div className="mt-1 text-[10px] text-slate-400">نسخه ۱.۰.۰ • APK رسمی</div>
                </div>
              </div>
              <a
                href={APK_URL}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-white px-5 py-4 text-sm font-black text-slate-900 shadow-xl transition hover:scale-[1.02]"
              >
                <Download className="h-5 w-5" /> دانلود مستقیم اندروید
              </a>
              <p className="mt-2 text-center text-[9px] leading-5 text-slate-500">پس از دانلود، در صورت درخواست اندروید اجازه نصب از مرورگر را فعال کنید.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
