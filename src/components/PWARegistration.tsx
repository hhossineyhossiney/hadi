"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, ShieldCheck, Smartphone, X } from "lucide-react";
import { usePWAInstall } from "@/components/PWAInstallProvider";

export default function PWARegistration() {
  const pathname = usePathname();
  const { canInstall, install } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (!canInstall || pathname === "/install-app") {
        setVisible(false);
        return;
      }

      const dismissedAt = Number(localStorage.getItem("pwa-install-dismissed-at") || 0);
      setVisible(Date.now() - dismissedAt > 7 * 24 * 60 * 60 * 1000);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [canInstall, pathname]);

  const handleInstall = async () => {
    const outcome = await install();
    if (outcome === "accepted" || outcome === "installed") setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem("pwa-install-dismissed-at", String(Date.now()));
    setVisible(false);
  };

  if (!visible || !canInstall) return null;

  return (
    <aside className="fixed bottom-24 right-3 left-3 z-[180] mx-auto max-w-sm rounded-[20px] border border-emerald-300/20 bg-[#071426]/95 p-4 text-white shadow-2xl backdrop-blur-xl lg:right-auto lg:left-6 lg:bottom-6" dir="rtl">
      <button type="button" onClick={dismiss} aria-label="بستن پیشنهاد نصب" className="absolute left-2 top-2 rounded-full p-1.5 text-slate-400 hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pl-6">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-emerald-500 to-cyan-500">
          <Smartphone className="h-5 w-5" />
          <ShieldCheck className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-[#071426] text-emerald-300" />
        </div>
        <div>
          <h2 className="text-sm font-black">نصب امن اپلیکیشن فَنیکسو</h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-400">نصب مستقیم توسط مرورگر؛ بدون دریافت APK و بدون هشدار برنامه ناشناس.</p>
        </div>
      </div>
      <button type="button" onClick={handleInstall} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[11px] bg-white py-2.5 text-xs font-black text-slate-900">
        <Download className="h-4 w-4" /> نصب امن و مستقیم
      </button>
    </aside>
  );
}
