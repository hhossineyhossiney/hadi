"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send, ShieldCheck, Sparkles, Star } from "lucide-react";

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string;
  managerReply: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isSample: boolean;
  isVerified: boolean;
  createdAt: string | null;
};

type Props = {
  instituteId: number;
  courseId?: number | null;
  sellableCourseId?: number | null;
  title?: string;
  compact?: boolean;
  onSummaryChange?: (summary: { rating: string; reviewCount: number }) => void;
};

function fa(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function PublicReviewsSection({
  instituteId,
  courseId,
  sellableCourseId,
  title = "نظرات هنرجویان",
  compact = false,
  onSummaryChange,
}: Props) {
  const [items, setItems] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [summary, setSummary] = useState({ rating: "0", reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams({ instituteId: String(instituteId) });
    if (courseId) params.set("courseId", String(courseId));
    if (sellableCourseId) params.set("sellableCourseId", String(sellableCourseId));
    return params.toString();
  }, [instituteId, courseId, sellableCourseId]);

  const load = useCallback(() => {
    return fetch(`/api/reviews?${query}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        const nextSummary = {
          rating: String(data.rating || "0"),
          reviewCount: Number(data.reviewCount || 0),
        };
        setItems(Array.isArray(data.reviews) ? data.reviews : []);
        setSummary(nextSummary);
        onSummaryChange?.(nextSummary);
      })
      .catch(() => setMessage({ type: "err", text: "دریافت نظرات انجام نشد" }))
      .finally(() => setLoading(false));
  }, [onSummaryChange, query]);

  useEffect(() => { void load(); }, [load]);

  const selectMedia = (file: File) => {
    if (file.size > 1_000_000) { setMessage({ type: "err", text: "حجم تصویر یا ویدئو باید کمتر از یک مگابایت باشد" }); return; }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) { setMessage({ type: "err", text: "فقط تصویر یا ویدئو مجاز است" }); return; }
    const reader = new FileReader();
    reader.onload = () => { setMediaUrl(String(reader.result || "")); setMediaType(file.type.startsWith("video/") ? "video" : "image"); };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setMessage(null);
    if (comment.trim().length < 10) {
      setMessage({ type: "err", text: "لطفاً نظر خود را با حداقل ۱۰ کاراکتر بنویسید" });
      return;
    }
    setSending(true);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instituteId, courseId, sellableCourseId, rating, comment, mediaUrl, mediaType }),
    });
    const data = await response.json().catch(() => ({}));
    setSending(false);
    if (!response.ok) {
      setMessage({ type: "err", text: data.error || "ثبت نظر انجام نشد" });
      return;
    }
    setComment("");
    setMediaUrl("");
    setRating(5);
    setMessage({ type: "ok", text: data.message || "نظر ثبت شد" });
    load();
  };

  return (
    <section className={compact ? "space-y-5" : "rounded-[24px] border border-border-default bg-surface p-5 md:p-7"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary-500" />
            <h2 className="text-lg font-black text-text-primary md:text-xl">{title}</h2>
          </div>
          <p className="text-[11px] text-text-tertiary">نظرهای منتشرشده از پایگاه داده سامانه نمایش داده می‌شوند.</p>
        </div>
        <div className="flex items-center gap-2 rounded-[14px] border border-amber-400/20 bg-amber-400/10 px-4 py-2.5">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <b className="text-lg text-text-primary">{Number(summary.rating || 0).toFixed(1)}</b>
          <span className="text-[10px] text-text-tertiary">از {fa(summary.reviewCount)} نظر</span>
        </div>
      </div>

      <div className="rounded-[18px] border border-primary-500/15 bg-primary-500/[0.04] p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-text-primary">تجربه خود را ثبت کنید</h3>
            <p className="mt-1 text-[10px] text-text-tertiary">فقط هنرجوی تأییدشده یا خریدار دوره می‌تواند نظر واقعی ثبت کند.</p>
          </div>
          <div className="flex gap-1" dir="ltr">
            {Array.from({ length: 5 }).map((_, index) => {
              const value = index + 1;
              return (
                <button key={value} type="button" onClick={() => setRating(value)} aria-label={`امتیاز ${value}`} className="p-0.5">
                  <Star className={`h-6 w-6 transition ${value <= rating ? "fill-amber-400 text-amber-400" : "text-border-strong"}`} />
                </button>
              );
            })}
          </div>
        </div>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value.slice(0, 1500))}
          rows={3}
          placeholder="درباره کیفیت آموزش، مدرس، پشتیبانی یا نتیجه‌ای که گرفتید بنویسید..."
          className="w-full resize-none rounded-[13px] border border-border-default bg-bg-secondary px-4 py-3 text-sm text-text-primary outline-none focus:border-primary-400"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="cursor-pointer rounded-[9px] border border-border-default bg-bg-secondary px-3 py-2 text-[9px] font-black text-text-secondary">افزودن تصویر یا ویدئو<input type="file" accept="image/*,video/*" className="hidden" onChange={(event) => event.target.files?.[0] && selectMedia(event.target.files[0])} /></label>
          {mediaUrl && <div className="relative h-16 w-24 overflow-hidden rounded-[9px] border border-border-default">{mediaType === "video" ? <video src={mediaUrl} className="h-full w-full object-cover" /> : <img src={mediaUrl} alt="پیش‌نمایش نظر" className="h-full w-full object-cover" />}<button type="button" onClick={() => setMediaUrl("")} className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 text-white">×</button></div>}
        </div>
        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[9px] text-text-tertiary">نظر پس از بررسی مدیر آموزشگاه منتشر می‌شود.</span>
          <button type="button" onClick={submit} disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-[11px] bg-primary-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} ثبت نظر
          </button>
        </div>
        {message && (
          <div className={`mt-3 rounded-[10px] p-3 text-xs font-bold ${message.type === "ok" ? "bg-emerald-500/10 text-emerald-600" : "bg-error-500/10 text-error-500"}`}>
            {message.text}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-7 w-7 animate-spin text-primary-500" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-[16px] border border-dashed border-border-default py-10 text-center text-sm text-text-tertiary">هنوز نظری منتشر نشده است.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((review) => (
            <article key={review.id} className="rounded-[17px] border border-border-default bg-bg-secondary p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-text-primary">
                    {review.authorName}
                    {review.isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" aria-label="هنرجوی تأییدشده" />}
                  </div>
                  <div className="mt-1 flex" dir="ltr">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-border-strong"}`} />
                    ))}
                  </div>
                </div>
                {review.isSample && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-[8px] font-black text-violet-500">
                    <Sparkles className="h-3 w-3" /> نمونه آموزشی
                  </span>
                )}
              </div>
              <p className="text-xs leading-6 text-text-secondary">{review.comment}</p>
              {review.mediaUrl && (review.mediaType === "video" ? <video src={review.mediaUrl} controls className="mt-3 aspect-video w-full rounded-[12px] bg-black object-cover" /> : <img src={review.mediaUrl} alt={`رسانه نظر ${review.authorName}`} className="mt-3 max-h-64 w-full rounded-[12px] object-cover" />)}
              {review.managerReply && (
                <div className="mt-3 rounded-[11px] border-r-2 border-primary-500 bg-primary-500/[0.05] p-3">
                  <div className="mb-1 flex items-center gap-1 text-[9px] font-black text-primary-600"><CheckCircle2 className="h-3.5 w-3.5" /> پاسخ آموزشگاه</div>
                  <p className="text-[10px] leading-5 text-text-secondary">{review.managerReply}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
