"use client";

import { useEffect, useState } from "react";
import { Award, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck, Users2 } from "lucide-react";

function statusLabel(status: string) {
  return ({ draft: "پیش‌نویس", submitted: "منتظر بررسی", under_review: "در حال بررسی", needs_correction: "نیازمند اصلاح", approved: "تاییدشده", published: "منتشرشده" } as Record<string, string>)[status] || status;
}

export default function ExpertRankingControlPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => fetch("/api/ranking/control")
    .then(async (response) => {
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || "خطا در دریافت اطلاعات");
      setData(value);
    })
    .catch((error) => setMsg(`❌ ${error.message}`))
    .finally(() => setLoading(false));

  useEffect(() => { void load(); }, []);

  const changePublication = async (ranking: any) => {
    setBusy(ranking.id);
    setMsg("");
    const response = await fetch("/api/ranking/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: ranking.status === "published" ? "unpublish" : "publish", rankingId: ranking.id }),
    });
    const result = await response.json();
    setBusy(null);
    if (!response.ok) return setMsg(`❌ ${result.error || "خطا"}`);
    setMsg(ranking.status === "published" ? "✅ انتشار رتبه لغو شد" : "✅ رتبه منتشر و صفحه استعلام فعال شد");
    load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-300" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black">
          <Award className="h-6 w-6 text-amber-300" /> کنترل انتشار و اعتبار رتبه‌ها
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          تمام آموزشگاه‌ها به‌صورت خودکار در اختیار همین کارشناس هستند؛ نیازی به ساخت کارشناس یا تخصیص آموزشگاه وجود ندارد.
        </p>
      </div>

      {msg && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-bold">{msg}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["کل پرونده‌ها", data?.stats?.total, ShieldCheck, "text-cyan-300"],
          ["منتظر بررسی", data?.stats?.waiting, Users2, "text-amber-300"],
          ["تایید کارشناس", data?.stats?.approved, CheckCircle2, "text-emerald-300"],
          ["منتشرشده", data?.stats?.published, Award, "text-fuchsia-300"],
        ].map(([label, value, Icon, color]: any) => (
          <div key={label} className="rounded-[16px] border border-white/10 bg-[#111a2e] p-4">
            <Icon className={`mb-3 h-5 w-5 ${color}`} />
            <div className="text-2xl font-black">{Number(value || 0).toLocaleString("fa-IR")}</div>
            <div className="text-[10px] text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-[18px] border border-white/10 bg-[#111a2e]">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-white/10 text-right text-[10px] text-slate-500">
              <th className="p-4">آموزشگاه</th>
              <th>سال</th>
              <th>امتیاز</th>
              <th>رتبه</th>
              <th>وضعیت</th>
              <th>تاریخ انتشار</th>
              <th>کنترل انتشار</th>
            </tr>
          </thead>
          <tbody>
            {(data?.rankings || []).map((ranking: any) => (
              <tr key={ranking.id} className="border-b border-white/5 hover:bg-white/[0.025]">
                <td className="p-4 font-black text-white">{ranking.academy_name}</td>
                <td>{ranking.year}</td>
                <td>{Number(ranking.score || 0).toLocaleString("fa-IR")} از ۱۰۰</td>
                <td className="text-base font-black text-amber-300">{ranking.rank || "—"}</td>
                <td><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-200">{statusLabel(ranking.status)}</span></td>
                <td className="text-[10px] text-slate-500">{ranking.published_at ? new Date(ranking.published_at).toLocaleDateString("fa-IR") : "—"}</td>
                <td>
                  {["approved", "published"].includes(ranking.status) ? (
                    <button
                      type="button"
                      onClick={() => changePublication(ranking)}
                      disabled={busy === ranking.id}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 font-black disabled:opacity-50 ${ranking.status === "published" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500 text-slate-950"}`}
                    >
                      {busy === ranking.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : ranking.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      {ranking.status === "published" ? "لغو انتشار" : "انتشار"}
                    </button>
                  ) : <span className="text-[10px] text-slate-600">پس از تکمیل ارزیابی</span>}
                </td>
              </tr>
            ))}
            {(data?.rankings || []).length === 0 && (
              <tr><td colSpan={7} className="p-12 text-center text-slate-500">هنوز پرونده رتبه‌بندی ایجاد نشده است.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
