import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Newspaper, Radio, RefreshCw } from "lucide-react";
import type { EitaaNewsFeed } from "@/lib/eitaa-news-types";

function refreshedLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "به‌روزرسانی روزانه";
  return `به‌روزرسانی ${new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

export default function LatestNewsSection({ feed }: { feed: EitaaNewsFeed }) {
  const items = feed.items.slice(0, 10);
  if (items.length === 0) return null;

  return (
    <section id="latest-news" className="relative overflow-hidden py-5 sm:py-8" aria-labelledby="latest-news-title">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[26px] border border-cyan-300/15 bg-gradient-to-br from-[#082c4d] via-[#061f39] to-[#04162a] p-4 shadow-[0_24px_75px_rgba(0,0,0,0.28)] sm:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.13),transparent_30%),radial-gradient(circle_at_95%_100%,rgba(52,211,153,0.10),transparent_32%)]" />

          <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[9px] font-black text-emerald-200">
                <Radio className="h-3.5 w-3.5" /> دریافت خودکار از کانال ایتا زبرخان
              </div>
              <h2 id="latest-news-title" className="flex items-center gap-2 text-[clamp(21px,6vw,32px)] font-black text-white">
                <Newspaper className="h-7 w-7 shrink-0 text-cyan-300" /> آخرین اخبار مهارت
              </h2>
              <p className="mt-2 text-[11px] font-medium leading-6 text-slate-300 sm:text-xs">
                ۱۰ خبر و اطلاعیه تازه آموزش فنی و حرفه‌ای شهرستان زبرخان، همراه تصویر
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-bold text-slate-300">
                <RefreshCw className="h-3.5 w-3.5 text-emerald-300" /> {refreshedLabel(feed.refreshedAt)}
              </span>
              <Link href="/news" className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] font-black text-[#073354] shadow-lg transition hover:bg-cyan-50">
                مشاهده همه اخبار <ArrowLeft className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="news-horizontal-scroll relative flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-4" aria-label="ده خبر آخر">
            {items.map((item, index) => (
              <article key={item.id} className="group relative min-h-[455px] w-[84vw] max-w-[360px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.055] p-4 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-white/[0.075] sm:w-[340px] sm:p-5">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-l from-cyan-300 via-emerald-300 to-amber-300 opacity-70" />
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300/10 text-[10px] font-black text-cyan-200">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 text-emerald-300" /> {item.dateLabel}
                  </span>
                </div>

                <div className="relative mb-3 aspect-video overflow-hidden rounded-[14px] border border-white/10 bg-[#031426]">
                  <Image
                    src={`/api/news/image/${encodeURIComponent(item.id)}`}
                    alt={`تصویر خبر: ${item.title}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 84vw, 340px"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04162a]/35 to-transparent" />
                </div>

                <h3 className="line-clamp-2 min-h-[50px] text-sm font-black leading-7 text-white sm:text-[15px]">{item.title}</h3>
                <p className="mt-2 line-clamp-4 text-[10px] font-medium leading-6 text-slate-300">{item.body}</p>

                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between gap-2 border-t border-white/8 pt-3">
                  <Link href={`/news#news-${item.id}`} className="inline-flex items-center gap-1 text-[10px] font-black text-cyan-200 transition group-hover:text-cyan-100">
                    متن کامل خبر <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 hover:text-emerald-300">
                    منبع ایتا <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="relative mt-1 flex items-center justify-between gap-3 text-[9px] text-slate-500">
            <span>برای دیدن سایر خبرها، کارت‌ها را به طرفین بکشید.</span>
            <a href={feed.channelUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-black text-emerald-300 hover:text-emerald-200">
              @AmoFan12
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
