import Link from "next/link";
import { BookOpen, Home, RefreshCw, WifiOff } from "lucide-react";

export const metadata = { title: "اتصال اینترنت برقرار نیست | فَنیکسو" };

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#04152A] px-4 py-20 text-white flex items-center justify-center" dir="rtl">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.045] p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-slate-600 to-slate-800">
          <WifiOff className="h-9 w-9 text-slate-200" />
        </div>
        <h1 className="text-2xl font-black">اتصال اینترنت برقرار نیست</h1>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          بخش‌های عمومی که قبلاً مشاهده کرده‌اید ممکن است در دسترس باشند. برای اطلاعات تازه، ورود و پرداخت دوباره به اینترنت متصل شوید.
        </p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <Link href="/" className="flex items-center justify-center gap-2 rounded-[13px] bg-white px-4 py-3 text-xs font-black text-slate-900">
            <Home className="h-4 w-4" /> صفحه اصلی
          </Link>
          <Link href="/courses" className="flex items-center justify-center gap-2 rounded-[13px] border border-white/15 bg-white/5 px-4 py-3 text-xs font-black">
            <BookOpen className="h-4 w-4" /> دوره‌ها
          </Link>
        </div>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
          <RefreshCw className="h-3.5 w-3.5" /> پس از اتصال، صفحه را تازه‌سازی کنید.
        </p>
      </section>
    </main>
  );
}
