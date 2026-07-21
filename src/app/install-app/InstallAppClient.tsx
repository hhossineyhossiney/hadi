"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Globe2,
  MoreVertical,
  Share2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { usePWAInstall } from "@/components/PWAInstallProvider";

type Platform = "android" | "ios" | "other";
type InstallStatus = "idle" | "requesting" | "accepted" | "dismissed" | "unavailable";

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  return "other";
}

export default function InstallAppClient() {
  const { canInstall, isStandalone, install } = usePWAInstall();
  const [platform, setPlatform] = useState<Platform>("other");
  const [status, setStatus] = useState<InstallStatus>("idle");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setPlatform(detectPlatform()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleInstall = async () => {
    setStatus("requesting");
    const outcome = await install();
    if (outcome === "installed" || outcome === "accepted") setStatus("accepted");
    else if (outcome === "dismissed") setStatus("dismissed");
    else setStatus("unavailable");
  };

  const installed = isStandalone || status === "accepted";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#13385a_0%,#071426_42%,#030a14_100%)] px-3 pb-28 pt-6 text-white sm:px-6 sm:pt-10 lg:pb-12" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white">
          <ArrowRight className="h-4 w-4" /> بازگشت به فَنیکسو
        </Link>

        <section className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#081a2e]/90 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.14),transparent_32%),radial-gradient(circle_at_100%_100%,rgba(251,191,36,0.11),transparent_35%)]" />

          <div className="relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <div className="absolute -inset-3 rounded-full bg-cyan-300/15 blur-xl" />
                <Image
                  src="/brand/fanixo-emblem-circle-1024.png"
                  alt="نشان فَنیکسو"
                  width={112}
                  height={112}
                  priority
                  className="relative h-24 w-24 rounded-full border border-amber-200/30 object-cover shadow-2xl sm:h-28 sm:w-28"
                />
                <span className="absolute -bottom-1 -left-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-[#081a2e] bg-emerald-500 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </span>
              </div>

              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" /> مسیر نصب امن
              </span>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">نصب اپلیکیشن فَنیکسو</h1>
              <p className="mt-3 max-w-xl text-xs font-medium leading-7 text-slate-300 sm:text-sm">
                نسخهٔ امن وب‌اپ مستقیماً توسط مرورگر نصب می‌شود؛ نیازی به دانلود APK، فعال‌کردن «منابع ناشناس» یا عبور از هشدار Play Protect نیست.
              </p>
            </div>

            {installed ? (
              <div className="mt-7 rounded-[20px] border border-emerald-300/20 bg-emerald-400/10 p-5 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-300" />
                <h2 className="mt-3 text-lg font-black text-emerald-100">فَنیکسو نصب شد</h2>
                <p className="mt-2 text-xs leading-6 text-emerald-100/70">آیکن برنامه در صفحهٔ اصلی یا فهرست برنامه‌های دستگاه شما قرار گرفته است.</p>
                <Link href="/" className="mt-4 inline-flex items-center justify-center rounded-[13px] bg-white px-6 py-3 text-xs font-black text-slate-900">
                  ورود به فَنیکسو
                </Link>
              </div>
            ) : canInstall ? (
              <div className="mt-7">
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={status === "requesting"}
                  className="flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-l from-emerald-400 to-cyan-400 px-6 py-4 text-sm font-black text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.18)] transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
                >
                  {status === "requesting" ? <Smartphone className="h-5 w-5 animate-pulse" /> : <Download className="h-5 w-5" />}
                  {status === "requesting" ? "در حال آماده‌سازی نصب…" : "نصب امن و مستقیم"}
                </button>
                {status === "dismissed" && (
                  <p className="mt-3 text-center text-xs font-bold text-amber-200">درخواست نصب بسته شد؛ برای نمایش دوباره، دکمهٔ بالا را بزنید.</p>
                )}
              </div>
            ) : (
              <div className="mt-7 rounded-[20px] border border-white/10 bg-white/[0.045] p-4 sm:p-5">
                <h2 className="flex items-center gap-2 text-sm font-black">
                  <Globe2 className="h-5 w-5 text-cyan-300" /> نصب از منوی مرورگر
                </h2>
                {platform === "ios" ? (
                  <ol className="mt-4 space-y-3 text-xs leading-6 text-slate-300">
                    <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-200">۱</span><span>این صفحه را در Safari باز کنید و دکمهٔ <Share2 className="mx-1 inline h-4 w-4 text-cyan-300" /> اشتراک‌گذاری را بزنید.</span></li>
                    <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-200">۲</span><span>گزینهٔ «Add to Home Screen / افزودن به صفحهٔ اصلی» را انتخاب کنید.</span></li>
                  </ol>
                ) : (
                  <ol className="mt-4 space-y-3 text-xs leading-6 text-slate-300">
                    <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-200">۱</span><span>صفحه را در Chrome باز کنید.</span></li>
                    <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 font-black text-cyan-200">۲</span><span>منوی <MoreVertical className="mx-1 inline h-4 w-4 text-cyan-300" /> را بزنید و «نصب برنامه» یا «افزودن به صفحه اصلی» را انتخاب کنید.</span></li>
                  </ol>
                )}
                <p className="mt-4 rounded-xl bg-emerald-400/10 px-3 py-2.5 text-[10px] font-bold leading-5 text-emerald-200">
                  این روش نیز فایل APK دانلود نمی‌کند و هشدار برنامهٔ ناشناس نمایش داده نمی‌شود.
                </p>
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[9px] font-bold text-slate-400 sm:text-[11px]">
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-2 py-3"><ShieldCheck className="mx-auto mb-1.5 h-5 w-5 text-emerald-300" />بدون هشدار امنیتی</div>
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-2 py-3"><Download className="mx-auto mb-1.5 h-5 w-5 text-cyan-300" />بدون دانلود APK</div>
              <div className="rounded-xl border border-white/8 bg-white/[0.035] px-2 py-3"><Smartphone className="mx-auto mb-1.5 h-5 w-5 text-amber-300" />اجرای تمام‌صفحه</div>
            </div>
          </div>
        </section>

        <details className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.035] p-4 text-slate-400">
          <summary className="cursor-pointer text-xs font-black text-slate-300">دانلود دستی APK برای کاربران حرفه‌ای</summary>
          <p className="mt-3 text-[10px] leading-5">
            نصب دستی APK ممکن است همچنان هشدار «برنامهٔ ناشناس» Google Play Protect را نشان دهد. این گزینه فقط زمانی استفاده شود که نصب مستقیم مرورگر در دسترس نیست.
          </p>
          <a href="/downloads/fanixo-android-1.3.0.apk" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-[11px] font-black text-slate-200 hover:bg-white/5">
            <Download className="h-4 w-4" /> دریافت APK رسمی نسخهٔ ۱.۳.۰
          </a>
        </details>
      </div>
    </main>
  );
}
