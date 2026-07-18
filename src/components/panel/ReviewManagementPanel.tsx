"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X,
  XCircle,
} from "lucide-react";

type Review = {
  id: number;
  instituteId: number;
  courseId: number | null;
  sellableCourseId: number | null;
  authorName: string;
  rating: number;
  comment: string;
  managerReply: string | null;
  status: "pending" | "published" | "rejected";
  isSample: boolean;
  isVerified: boolean;
  instituteName?: string;
  targetTitle: string;
  targetType: "institute" | "course" | "online";
  createdAt: string;
};

type Data = {
  reviews: Review[];
  courses?: { id: number; title: string }[];
  onlineCourses?: { id: number; title: string }[];
  stats: { total: number; pending: number; published: number; samples: number };
  institute?: { id: number; name: string };
};

const statusMeta = {
  pending: { label: "در انتظار بررسی", className: "bg-amber-500/15 text-amber-300 border-amber-500/25", icon: Clock },
  published: { label: "منتشرشده", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", icon: CheckCircle2 },
  rejected: { label: "ردشده", className: "bg-rose-500/15 text-rose-300 border-rose-500/25", icon: XCircle },
};

function fa(value: number) {
  return Number(value || 0).toLocaleString("fa-IR");
}

export default function ReviewManagementPanel({ scope = "manager" }: { scope?: "manager" | "admin" }) {
  const endpoint = scope === "admin" ? "/api/admin/reviews" : "/api/manager/reviews";
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "published" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Review | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    return fetch(endpoint, { cache: "no-store" })
      .then((response) => response.json())
      .then((value) => setData(value))
      .catch(() => setMessage("❌ دریافت نظرات انجام نشد"))
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => { void load(); }, [load]);

  const action = async (payload: Record<string, unknown>, busyKey?: number | string) => {
    setBusy(busyKey ?? String(payload.action));
    setMessage("");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const value = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) {
      setMessage(`❌ ${value.error || "عملیات انجام نشد"}`);
      return false;
    }
    load();
    return true;
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fa-IR");
    return (data?.reviews || []).filter((review) => {
      if (filter !== "all" && review.status !== filter) return false;
      if (!query) return true;
      return [review.authorName, review.comment, review.targetTitle, review.instituteName || ""].join(" ").toLocaleLowerCase("fa-IR").includes(query);
    });
  }, [data?.reviews, filter, search]);

  if (loading && !data) {
    return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-400" /></div>;
  }

  return (
    <div className="text-white">
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black"><Star className="h-6 w-6 fill-amber-400 text-amber-400" /> مدیریت نظرات و امتیازها</h2>
          <p className="mt-1 text-sm text-slate-400">
            {scope === "admin" ? "نظارت کامل بر نظرات همه آموزشگاه‌ها و دوره‌ها" : "مشاهده، تأیید، ویرایش، پاسخ‌گویی و حذف نظرات آموزشگاه و دوره‌ها"}
          </p>
        </div>
        {scope === "manager" && (
          <button type="button" onClick={() => setCreating(!creating)} className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-gradient-to-l from-violet-500 to-fuchsia-500 px-4 py-3 text-xs font-black text-white">
            {creating ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {creating ? "بستن فرم" : "افزودن نظر نمونه"}
          </button>
        )}
      </div>

      {message && <div className="mb-4 rounded-[11px] border border-white/10 bg-white/5 p-3 text-xs font-bold">{message}</div>}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "کل نظرات", value: data?.stats.total || 0, color: "text-cyan-300" },
          { label: "در انتظار", value: data?.stats.pending || 0, color: "text-amber-300" },
          { label: "منتشرشده", value: data?.stats.published || 0, color: "text-emerald-300" },
          { label: "نمونه آموزشی", value: data?.stats.samples || 0, color: "text-violet-300" },
        ].map((item) => (
          <div key={item.label} className="rounded-[16px] border border-white/10 bg-[#111a2e] p-4">
            <div className={`text-2xl font-black ${item.color}`}>{fa(item.value)}</div>
            <div className="mt-1 text-[10px] font-bold text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>

      {creating && scope === "manager" && data && (
        <CreateReviewForm data={data} onCancel={() => setCreating(false)} onSave={async (payload) => {
          const ok = await action({ action: "create", ...payload }, "create");
          if (ok) { setCreating(false); setMessage("✅ نظر نمونه در پایگاه داده ثبت شد"); }
        }} busy={busy === "create"} />
      )}

      <div className="mb-5 rounded-[18px] border border-white/10 bg-[#111a2e] p-3">
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجو در نام، متن نظر، آموزشگاه یا دوره..." className="w-full rounded-[11px] border border-white/10 bg-[#0B1120] py-3 pr-10 pl-3 text-sm text-white outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(["all", "pending", "published", "rejected"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-black ${filter === value ? "bg-primary-600 text-white" : "bg-white/5 text-slate-400"}`}>
              {value === "all" ? "همه" : statusMeta[value].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-white/15 py-14 text-center text-sm text-slate-500">نظری با این فیلتر پیدا نشد.</div>
        ) : filtered.map((review) => {
          const meta = statusMeta[review.status] || statusMeta.pending;
          const StatusIcon = meta.icon;
          return (
            <article key={review.id} className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4 md:p-5">
              <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-sm font-black text-primary-300">{review.authorName?.charAt(0) || "ه"}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-white">{review.authorName}</h3>
                      {review.isVerified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-black text-emerald-300"><ShieldCheck className="h-3 w-3" /> هنرجوی واقعی</span>}
                      {review.isSample && <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-1 text-[8px] font-black text-violet-300"><Sparkles className="h-3 w-3" /> نمونه آموزشی</span>}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">{scope === "admin" && review.instituteName ? `${review.instituteName} • ` : ""}{review.targetTitle} • {review.targetType === "online" ? "دوره آنلاین" : review.targetType === "course" ? "دوره حضوری" : "آموزشگاه"}</div>
                  </div>
                </div>
                <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black ${meta.className}`}><StatusIcon className="h-3.5 w-3.5" />{meta.label}</span>
              </div>

              <div className="mb-3 flex" dir="ltr">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} />)}</div>
              <p className="whitespace-pre-wrap text-xs leading-6 text-slate-300">{review.comment}</p>
              {review.managerReply && <div className="mt-3 rounded-[10px] border-r-2 border-primary-400 bg-primary-500/5 p-3 text-[10px] leading-5 text-primary-100"><b className="text-primary-300">پاسخ آموزشگاه:</b> {review.managerReply}</div>}

              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                {review.status !== "published" && <button type="button" disabled={busy === review.id} onClick={() => action({ action: "status", reviewId: review.id, status: "published" }, review.id)} className="inline-flex items-center gap-1 rounded-[8px] bg-emerald-500/15 px-3 py-2 text-[10px] font-black text-emerald-300"><Check className="h-3.5 w-3.5" /> انتشار</button>}
                {review.status !== "rejected" && <button type="button" disabled={busy === review.id} onClick={() => action({ action: "status", reviewId: review.id, status: "rejected" }, review.id)} className="inline-flex items-center gap-1 rounded-[8px] bg-amber-500/15 px-3 py-2 text-[10px] font-black text-amber-300"><XCircle className="h-3.5 w-3.5" /> رد</button>}
                <button type="button" onClick={() => setEditing(review)} className="inline-flex items-center gap-1 rounded-[8px] bg-sky-500/15 px-3 py-2 text-[10px] font-black text-sky-300"><Edit3 className="h-3.5 w-3.5" /> ویرایش و پاسخ</button>
                <button type="button" disabled={busy === review.id} onClick={() => { if (confirm("این نظر برای همیشه حذف شود؟")) action({ action: "delete", reviewId: review.id }, review.id); }} className="inline-flex items-center gap-1 rounded-[8px] bg-rose-500/15 px-3 py-2 text-[10px] font-black text-rose-300"><Trash2 className="h-3.5 w-3.5" /> حذف</button>
                {busy === review.id && <Loader2 className="h-4 w-4 animate-spin text-primary-300" />}
              </div>
            </article>
          );
        })}
      </div>

      {editing && <EditReviewModal review={editing} busy={busy === editing.id} onClose={() => setEditing(null)} onSave={async (payload) => {
        const ok = await action({ action: "update", reviewId: editing.id, ...payload }, editing.id);
        if (ok) { setEditing(null); setMessage("✅ تغییرات نظر ذخیره شد"); }
      }} />}
    </div>
  );
}

function CreateReviewForm({ data, onCancel, onSave, busy }: { data: Data; onCancel: () => void; onSave: (payload: Record<string, unknown>) => void; busy: boolean }) {
  const [form, setForm] = useState({ targetType: "institute", targetId: "", authorName: "", rating: 5, comment: "", managerReply: "", status: "published" });
  const targets = form.targetType === "course" ? data.courses || [] : form.targetType === "online" ? data.onlineCourses || [] : [];
  const submit = () => {
    const payload: Record<string, unknown> = { authorName: form.authorName, rating: form.rating, comment: form.comment, managerReply: form.managerReply, status: form.status };
    if (form.targetType === "course") payload.courseId = Number(form.targetId);
    if (form.targetType === "online") payload.sellableCourseId = Number(form.targetId);
    onSave(payload);
  };
  return (
    <div className="mb-5 rounded-[18px] border border-violet-500/25 bg-violet-500/[0.07] p-4 md:p-5">
      <div className="mb-4"><h3 className="text-sm font-black text-white">نظر نمونه برای آموزش مدیر</h3><p className="mt-1 text-[10px] text-violet-200">این نظر با برچسب «نمونه آموزشی» ذخیره می‌شود و بعداً قابل ویرایش یا حذف است.</p></div>
      <div className="grid gap-3 md:grid-cols-2">
        <select value={form.targetType} onChange={(event) => setForm({ ...form, targetType: event.target.value, targetId: "" })} className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900"><option value="institute">خود آموزشگاه</option><option value="course">دوره حضوری</option><option value="online">دوره آنلاین</option></select>
        {form.targetType !== "institute" ? <select value={form.targetId} onChange={(event) => setForm({ ...form, targetId: event.target.value })} className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900"><option value="">انتخاب دوره</option>{targets.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select> : <div className="rounded-[10px] border border-white/10 bg-black/10 px-3 py-2.5 text-xs text-slate-300">هدف: {data.institute?.name}</div>}
        <input value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} placeholder="نام نمایش داده‌شده" className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" />
        <select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} ستاره</option>)}</select>
        <textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} rows={3} placeholder="متن نظر" className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900 md:col-span-2" />
        <textarea value={form.managerReply} onChange={(event) => setForm({ ...form, managerReply: event.target.value })} rows={2} placeholder="پاسخ آموزشگاه (اختیاری)" className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900 md:col-span-2" />
      </div>
      <div className="mt-3 flex gap-2"><button type="button" disabled={busy} onClick={submit} className="inline-flex items-center gap-2 rounded-[10px] bg-violet-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-50">{busy && <Loader2 className="h-4 w-4 animate-spin" />} ذخیره نمونه</button><button type="button" onClick={onCancel} className="rounded-[10px] bg-white/5 px-5 py-2.5 text-xs font-black text-slate-300">انصراف</button></div>
    </div>
  );
}

function EditReviewModal({ review, busy, onClose, onSave }: { review: Review; busy: boolean; onClose: () => void; onSave: (payload: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ authorName: review.authorName, rating: review.rating, comment: review.comment || "", managerReply: review.managerReply || "", status: review.status });
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-xl rounded-[20px] border border-white/10 bg-[#0f1a30] p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><div><h3 className="font-black text-white">ویرایش نظر و پاسخ مدیر</h3><p className="mt-1 text-[10px] text-slate-500">{review.targetTitle}</p></div><button type="button" onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400"><X className="h-4 w-4" /></button></div>
        <div className="space-y-3">
          <input value={form.authorName} onChange={(event) => setForm({ ...form, authorName: event.target.value })} className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" />
          <div className="grid grid-cols-2 gap-3"><select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })} className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} ستاره</option>)}</select><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as Review["status"] })} className="rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900"><option value="published">منتشرشده</option><option value="pending">در انتظار</option><option value="rejected">ردشده</option></select></div>
          <textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} rows={4} className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" />
          <textarea value={form.managerReply} onChange={(event) => setForm({ ...form, managerReply: event.target.value })} rows={3} placeholder="پاسخ رسمی آموزشگاه به هنرجو" className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" />
        </div>
        <div className="mt-4 flex gap-2"><button type="button" disabled={busy} onClick={() => onSave(form)} className="flex-1 rounded-[10px] bg-emerald-600 py-3 text-xs font-black text-white disabled:opacity-50">{busy ? "در حال ذخیره..." : "ذخیره تغییرات"}</button><button type="button" onClick={onClose} className="rounded-[10px] bg-white/5 px-5 py-3 text-xs font-black text-slate-300">انصراف</button></div>
      </div>
    </div>
  );
}
