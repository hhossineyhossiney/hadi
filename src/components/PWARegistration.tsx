"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PWARegistration() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).then((registration) => {
      registration.update().catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    if (standalone) return;
    const dismissedAt = Number(localStorage.getItem("pwa-install-dismissed-at") || 0);
    const canShow = Date.now() - dismissedAt > 7 * 24 * 60 * 60 * 1000;
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      if (canShow) setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setInstallEvent(null);
    }
  };

  const dismiss = () => {
    localStorage.setItem("pwa-install-dismissed-at", String(Date.now()));
    setVisible(false);
  };

  if (!visible || !installEvent) return null;

  return (
    <aside className="fixed bottom-24 right-3 left-3 z-[180] mx-auto max-w-sm rounded-[20px] border border-white/15 bg-[#071426]/95 p-4 text-white shadow-2xl backdrop-blur-xl lg:right-auto lg:left-6 lg:bottom-6" dir="rtl">
      <button type="button" onClick={dismiss} aria-label="بستن پیشنهاد نصب" className="absolute left-2 top-2 rounded-full p-1.5 text-slate-400 hover:bg-white/10">
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pl-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-primary-500 to-secondary-500">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-black">نصب اپلیکیشن فَنیکسو</h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-400">دسترسی سریع‌تر، اجرای تمام‌صفحه و مشاهده بعضی صفحات عمومی در حالت آفلاین.</p>
        </div>
      </div>
      <button type="button" onClick={install} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[11px] bg-white py-2.5 text-xs font-black text-slate-900">
        <Download className="h-4 w-4" /> نصب نسخه وب‌اپ
      </button>
    </aside>
  );
}
