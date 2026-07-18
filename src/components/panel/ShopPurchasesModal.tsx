"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, Receipt, RotateCcw, Trash2, Users, Wallet, X, XCircle } from "lucide-react";

type Purchase = {
  id: number;
  userName: string;
  phone: string | null;
  email: string | null;
  amount: string;
  commission: string;
  netAmount: string;
  paymentMethod: string;
  paymentRef: string | null;
  status: "pending" | "paid" | "failed" | "refunded";
  progress: number;
  createdAt: string;
};

type Data = {
  course: { id: number; title: string };
  purchases: Purchase[];
  stats: { total: number; paid: number; pending: number; refunded: number; revenue: number };
};

const statusLabel: Record<string, string> = { pending: "در انتظار", paid: "پرداخت‌شده", failed: "ناموفق", refunded: "مستردشده" };
const statusClass: Record<string, string> = { pending: "bg-amber-500/15 text-amber-300", paid: "bg-emerald-500/15 text-emerald-300", failed: "bg-rose-500/15 text-rose-300", refunded: "bg-violet-500/15 text-violet-300" };

function money(value: number | string) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

export default function ShopPurchasesModal({ courseId, onClose, onChanged }: { courseId: number; onClose: () => void; onChanged: () => void }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(() => {
    return fetch(`/api/manager/shop-purchases?courseId=${courseId}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((value) => setData(value))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => { void load(); }, [load]);

  const action = async (purchaseId: number, payload: Record<string, unknown>) => {
    setBusy(purchaseId); setMessage("");
    const response = await fetch("/api/manager/shop-purchases", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchaseId, ...payload }) });
    const value = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) { setMessage(`❌ ${value.error || "عملیات انجام نشد"}`); return; }
    setMessage("✅ وضعیت خرید و تعداد هنرجویان به‌روزرسانی شد");
    load(); onChanged();
  };

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-[22px] border border-white/10 bg-[#0f1a30] shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#0f1a30]/95 px-5 py-4 backdrop-blur-xl">
          <div><h3 className="flex items-center gap-2 font-black text-white"><Receipt className="h-5 w-5 text-emerald-300" /> مدیریت خریدهای واقعی دوره</h3><p className="mt-1 text-[10px] text-slate-500">{data?.course.title || "دوره آنلاین"}</p></div>
          <button type="button" onClick={onClose} className="rounded-full bg-white/5 p-2 text-slate-400"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-4 md:p-6">
          <div className="mb-4 rounded-[12px] border border-cyan-500/20 bg-cyan-500/10 p-3 text-[10px] leading-5 text-cyan-100">
            تعداد خرید روی کارت از رکوردهای «پرداخت‌شده» محاسبه می‌شود و قابل جعل نیست. در این بخش می‌توانید پرداخت دستی را تأیید یا خرید پرداخت‌شده را مسترد کنید؛ شمارنده کارت خودکار اصلاح می‌شود.
          </div>
          {message && <div className="mb-4 rounded-[10px] bg-white/5 p-3 text-xs font-bold text-slate-200">{message}</div>}

          {loading ? <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary-300" /></div> : data ? (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  { label: "خرید پرداخت‌شده", value: data.stats.paid, icon: CheckCircle2, color: "text-emerald-300" },
                  { label: "در انتظار", value: data.stats.pending, icon: Clock, color: "text-amber-300" },
                  { label: "مستردشده", value: data.stats.refunded, icon: RotateCcw, color: "text-violet-300" },
                  { label: "درآمد ناخالص", value: money(data.stats.revenue), icon: Wallet, color: "text-cyan-300" },
                ].map((item) => <div key={item.label} className="rounded-[14px] border border-white/10 bg-[#111a2e] p-4"><item.icon className={`mb-2 h-5 w-5 ${item.color}`} /><div className="text-base font-black text-white">{typeof item.value === "number" ? item.value.toLocaleString("fa-IR") : item.value}</div><div className="mt-1 text-[9px] text-slate-500">{item.label}</div></div>)}
              </div>

              {data.purchases.length === 0 ? <div className="rounded-[16px] border border-dashed border-white/15 py-12 text-center text-sm text-slate-500"><Users className="mx-auto mb-3 h-8 w-8" />هنوز خریدی برای این دوره ثبت نشده است.</div> : (
                <div className="space-y-3">
                  {data.purchases.map((purchase) => (
                    <div key={purchase.id} className="rounded-[16px] border border-white/10 bg-[#111a2e] p-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div><div className="font-black text-white">{purchase.userName}</div><div className="mt-1 text-[10px] text-slate-500" dir="ltr">{purchase.phone || "—"}</div></div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-black ${statusClass[purchase.status] || statusClass.pending}`}>{statusLabel[purchase.status] || purchase.status}</span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] md:grid-cols-4">
                        <div className="rounded-[9px] bg-black/10 p-2"><span className="text-slate-500">مبلغ: </span><b className="text-emerald-300">{money(purchase.amount)}</b></div>
                        <div className="rounded-[9px] bg-black/10 p-2"><span className="text-slate-500">خالص: </span><b className="text-cyan-300">{money(purchase.netAmount)}</b></div>
                        <div className="rounded-[9px] bg-black/10 p-2"><span className="text-slate-500">روش: </span><b className="text-white">{purchase.paymentMethod || "—"}</b></div>
                        <div className="rounded-[9px] bg-black/10 p-2"><span className="text-slate-500">پیشرفت: </span><b className="text-white">{purchase.progress.toLocaleString("fa-IR")}٪</b></div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 border-t border-white/5 pt-3">
                        {purchase.status === "pending" && <button type="button" disabled={busy === purchase.id} onClick={() => action(purchase.id, { action: "status", status: "paid" })} className="rounded-[8px] bg-emerald-500/15 px-3 py-2 text-[10px] font-black text-emerald-300">تأیید پرداخت دستی</button>}
                        {purchase.status === "paid" && <button type="button" disabled={busy === purchase.id} onClick={() => { if (confirm("این خرید مسترد شود؟ در پرداخت کیف پول، مبلغ به کیف پول هنرجو برمی‌گردد.")) action(purchase.id, { action: "status", status: "refunded" }); }} className="rounded-[8px] bg-violet-500/15 px-3 py-2 text-[10px] font-black text-violet-300">استرداد خرید</button>}
                        {purchase.status !== "paid" && <button type="button" disabled={busy === purchase.id} onClick={() => { if (confirm("این رکورد خرید حذف شود؟")) action(purchase.id, { action: "delete" }); }} className="inline-flex items-center gap-1 rounded-[8px] bg-rose-500/15 px-3 py-2 text-[10px] font-black text-rose-300"><Trash2 className="h-3.5 w-3.5" /> حذف</button>}
                        {busy === purchase.id && <Loader2 className="h-4 w-4 animate-spin text-primary-300" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : <div className="py-12 text-center text-rose-300"><XCircle className="mx-auto mb-2 h-8 w-8" />اطلاعات خرید دریافت نشد.</div>}
        </div>
      </div>
    </div>
  );
}
