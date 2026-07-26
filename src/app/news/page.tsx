import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, ExternalLink, Newspaper, Radio, RefreshCw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getEitaaNewsFeed } from "@/lib/eitaa-news";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "آخرین اخبار آموزشگاه‌های فنی و حرفه‌ای | فَنیکسو",
  description: "۱۰ خبر و اطلاعیه آخر کانال آموزش فنی و حرفه‌ای زبرخان با تصویر و به‌روزرسانی روزانه.",
};

function refreshText(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "به‌روزرسانی روزانه";
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export default async function NewsPage() {
  const feed = await getEitaaNewsFeed();

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#0b3558_0%,#061c33_38%,#03101f_100%)] text-white">
      <Navbar />
      <div className="mx-auto max-w-5xl px-3 pb-20 pt-28 sm:px-6">
        <Link href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 hover:text-white">
          <ArrowRight className="h-4 w-4" /> بازگشت به صفحه اصلی
        </Link>

        <header className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-[#0a3b62] via-[#072642] to-[#04182c] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-9">
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_5%_0%,rgba(34,211,238,0.16),transparent_34%),radial-gradient(circle_at_100%_100%,rgba(52,211,153,0.12),transparent_35%)]" />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-black text-emerald-200">
              <Radio className="h-3.5 w-3.5" /> منبع اخبار @AmoFan12
            </span>
            <h1 className="mt-3 flex items-center gap-3 text-2xl font-black sm:text-4xl">
              <Newspaper className="h-8 w-8 shrink-0 text-cyan-300 sm:h-10 sm:w-10" /> آخرین اخبار مهارت
            </h1>
            <p className="mt-3 max-w-2xl text-xs font-medium leading-7 text-slate-300 sm:text-sm">
              ۱۰ خبر و اطلاعیه آخر کانال اطلاع‌رسانی آموزش فنی و حرفه‌ای زبرخان؛ مطالب همراه تصویر هر روز به‌صورت خودکار به‌روزرسانی می‌شوند.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold text-slate-300">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-300" /> آخرین دریافت: {refreshText(feed.refreshedAt)}
              </span>
              <a href={feed.channelUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-black text-[#073354]">
                مشاهده کانال در ایتا <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </header>

        <section className="mt-6 space-y-4" aria-label="فهرست ده خبر آخر">
          {feed.items.slice(0, 10).map((item, index) => (
            <article id={`news-${item.id}`} key={item.id} className="scroll-mt-28 overflow-hidden rounded-[22px] border border-white/10 bg-[#071f37]/92 shadow-[0_16px_40px_rgba(0,0,0,0.20)]">
              <div className="h-1 bg-gradient-to-l from-cyan-300 via-emerald-300 to-amber-300 opacity-75" />
              <div className="p-5 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/15 bg-cyan-300/10 text-xs font-black text-cyan-200">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> {item.dateLabel}
                  </span>
                </div>

                <div className="relative mb-5 aspect-video w-full overflow-hidden rounded-[16px] border border-white/10 bg-[#031426] sm:max-h-[460px]">
                  <Image
                    src={`/api/news/image/${encodeURIComponent(item.id)}`}
                    alt={`تصویر خبر: ${item.title}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 94vw, 896px"
                    className="object-contain"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04162a]/25 to-transparent" />
                </div>

                <h2 className="text-lg font-black leading-8 text-white sm:text-xl">{item.title}</h2>
                <p className="mt-3 whitespace-pre-line text-xs font-medium leading-7 text-slate-300 sm:text-sm sm:leading-8">{item.body}</p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
                  <span className="text-[9px] font-bold text-slate-500">بازنشر خودکار با ذکر منبع رسمی</span>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-[11px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-2.5 text-[10px] font-black text-emerald-200 hover:bg-emerald-300/15">
                    مشاهده خبر اصلی در ایتا <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
      <Footer />
    </main>
  );
}
