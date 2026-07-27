"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeftRight, Award, BarChart3, BrainCircuit, CalendarDays,
  CheckCircle2, ClipboardCheck, Download, Eye, FileDown, FileText, Filter,
  Loader2, LogOut, MapPin, MessageCircle, Save, Search, SlidersHorizontal,
  TrendingUp, Users, Wrench, X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import ExpertRankingControlPanel from "@/components/ranking/ExpertRankingControlPanel";

function statusText(status: string) {
  return ({ not_started: "شروع‌نشده", draft: "در حال تکمیل", submitted: "منتظر بررسی", under_review: "در حال بررسی", needs_correction: "نیازمند اصلاح", approved: "تاییدشده", published: "منتشرشده" } as Record<string, string>)[status] || status;
}

function scoreTheme(score: number) {
  if (score >= 90) return { text: "text-emerald-300", bg: "bg-emerald-500/15", dot: "bg-emerald-400", label: "A+" };
  if (score >= 80) return { text: "text-cyan-300", bg: "bg-cyan-500/15", dot: "bg-cyan-400", label: "A" };
  if (score >= 70) return { text: "text-blue-300", bg: "bg-blue-500/15", dot: "bg-blue-400", label: "B" };
  if (score >= 60) return { text: "text-amber-300", bg: "bg-amber-500/15", dot: "bg-amber-400", label: "C" };
  return { text: "text-rose-300", bg: "bg-rose-500/15", dot: "bg-rose-400", label: "D" };
}

function persianDate() {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
}

export default function ExpertRankingDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [list, setList] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [view, setView] = useState<"cases" | "control">("cases");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const load = () => {
    setLoading(true);
    fetch("/api/ranking/expert")
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error);
        setList(value);
      })
      .catch((error) => setMsg(`❌ ${error.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/ranking/expert")
      .then(async (response) => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.error);
        setList(value);
      })
      .catch((error) => setMsg(`❌ ${error.message}`))
      .finally(() => setLoading(false));
  }, []);

  const open = (item: any) => fetch(`/api/ranking/expert?academyId=${item.academy_id}&year=${item.year}`)
    .then((response) => response.json())
    .then((value) => setSelected({ ...value, academyId: item.academy_id, academyName: item.academy_name, listItem: item, strengths: value.ranking.strengths || [], improvements: value.ranking.improvements || [] }));

  const updateScore = (code: string, patch: any) => setSelected((current: any) => ({ ...current, scores: current.scores.map((score: any) => score.code === code ? { ...score, ...patch } : score) }));

  const save = async (nextStatus: string) => {
    setSaving(true); setMsg("");
    const response = await fetch("/api/ranking/expert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ academyId: selected.academyId, year: selected.year, status: nextStatus, scores: selected.scores, strengths: selected.strengths, improvements: selected.improvements }) });
    const value = await response.json(); setSaving(false);
    if (!response.ok) return setMsg(`❌ ${value.error}`);
    setMsg("✅ ارزیابی ذخیره شد"); setSelected(null); load();
  };

  const sendReminder = async (item: any, severity: "reminder" | "warning" = "reminder") => {
    const missing = Array.isArray(item.missing_items) && item.missing_items.length ? ` موارد ناقص: ${item.missing_items.join("، ")}.` : "";
    const defaultMessage = severity === "warning"
      ? `پرونده رتبه‌بندی آموزشگاه شما ناقص است.${missing} لطفاً در اولین فرصت اطلاعات و مستندات را تکمیل و ارسال کنید.`
      : `لطفاً پرونده خوداظهاری رتبه‌بندی آموزشگاه را تکمیل و برای بررسی ارسال کنید.${missing}`;
    const message = window.prompt("متن پیام برای مدیر آموزشگاه:", defaultMessage);
    if (!message) return;
    setMsg("");
    const response = await fetch("/api/ranking/expert", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "send_reminder", academyId: item.academy_id, year: item.year, severity: severity === "warning" ? "warning" : "reminder", message }) });
    const result = await response.json();
    if (!response.ok) return setMsg(`❌ ${result.error || "ارسال پیام ناموفق بود"}`);
    setMsg(`✅ پیام برای ${result.sentTo} ارسال شد`);
  };

  const items = useMemo(() => (list?.items || []).filter((item: any) => {
    const matchesQuery = !query || item.academy_name?.includes(query) || item.city?.includes(query);
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesRank = rankFilter === "all" || item.rank === rankFilter;
    return matchesQuery && matchesStatus && matchesRank;
  }), [list, query, statusFilter, rankFilter]);

  const exportExcel = () => {
    const rows = [["آموزشگاه", "شهر", "سال", "رتبه", "امتیاز", "قبولی", "هنرجو", "وضعیت"], ...items.map((item: any) => [item.academy_name, item.city || "", item.year, item.rank || "", item.score || 0, item.pass_rate || 0, item.total_students || 0, statusText(item.status)])];
    const csv = "\uFEFF" + rows.map((row) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `fanixo-ranking-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };

  const stats = list?.stats || {};
  const distribution = list?.distribution || [];
  const maxDistribution = Math.max(1, ...distribution.map((item: any) => Number(item.count || 0)));
  const trend = list?.trend || [];
  const maxTrend = Math.max(1, ...trend.map((item: any) => Number(item.count || 0)));
  const comparison = (list?.items || []).filter((item: any) => compareIds.includes(Number(item.academy_id))).slice(0, 2);
  const alerts = (list?.items || []).filter((item: any) => ["urgent", "high", "documents", "incomplete"].includes(item.priority)).slice(0, 8);

  if (status === "loading" || loading) return <div className="flex min-h-screen items-center justify-center bg-[#071426]"><Loader2 className="h-9 w-9 animate-spin text-cyan-300" /></div>;
  if (!user || user.role !== "expert") return <div className="min-h-screen bg-[#071426] p-10 text-center text-white"><p>دسترسی این سامانه فقط در اختیار کارشناس رتبه‌بندی است.</p><Link href="/login?callbackUrl=/expert" className="mt-4 inline-block rounded-xl bg-cyan-500 px-5 py-3 text-slate-950">ورود کارشناس</Link></div>;

  return (
    <main className="min-h-screen bg-[#061427] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#061427]/95 px-4 py-3 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-3 lg:flex-row lg:items-center">
          <div><h1 className="flex items-center gap-2 text-xl font-black"><ClipboardCheck className="h-6 w-6 text-cyan-300" /> داشبورد هوشمند ارزیابی</h1><p className="mt-1 text-[10px] text-slate-400">سلام، {user.name || "کارشناس محترم"} • امروز: {persianDate()}</p></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => { setView("cases"); setSelected(null); }} className={`rounded-lg px-3 py-2 text-[10px] font-black ${view === "cases" ? "bg-cyan-500 text-slate-950" : "bg-white/5"}`}>داشبورد و پرونده‌ها</button><button onClick={() => { setView("control"); setSelected(null); }} className={`rounded-lg px-3 py-2 text-[10px] font-black ${view === "control" ? "bg-emerald-500 text-slate-950" : "bg-white/5"}`}>انتشار و اعتبار رتبه‌ها</button><button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg bg-red-500/10 p-2 text-red-300"><LogOut className="h-4 w-4" /></button></div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] p-3 sm:p-6">
        {view === "control" ? <ExpertRankingControlPanel /> : (
          <div className="space-y-5">
            {msg && <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs">{msg}</div>}

            <section className="relative overflow-hidden rounded-[24px] border border-cyan-400/15 bg-gradient-to-l from-[#0b3c62] via-[#092943] to-[#071b31] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.25)]">
              <div className="relative grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div><div className="text-[10px] font-black text-cyan-200">نمای لحظه‌ای امروز</div><h2 className="mt-2 text-2xl font-black sm:text-3xl">سلام، کارشناس محترم 👋</h2><p className="mt-2 text-xs text-slate-300">{persianDate()} • وضعیت ارزیابی آموزشگاه‌های منطقه در یک نگاه</p></div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <HeaderMetric icon="📌" label="پرونده‌های امروز" value={stats.todayCases} />
                  <HeaderMetric icon="⏳" label="بررسی فوری" value={stats.urgent} warn />
                  <HeaderMetric icon="⚠" label="پرونده ناقص" value={stats.incompleteDeclarations} warn />
                  <HeaderMetric icon="🏆" label="پایان‌یافته" value={stats.approved} />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              <KpiCard icon="🏫" label="کل آموزشگاه‌ها" value={stats.totalAcademies} color="cyan" />
              <KpiCard icon="📄" label="پرونده‌های فعال" value={stats.activeCases} color="blue" />
              <KpiCard icon="⏳" label="منتظر بررسی" value={stats.waiting} color="amber" />
              <KpiCard icon="✅" label="تایید شده" value={stats.approved} color="emerald" />
              <KpiCard icon="❌" label="نیازمند اصلاح" value={stats.needsCorrection} color="rose" />
              <KpiCard icon="🏆" label="رتبه ممتاز A+" value={stats.excellent} color="fuchsia" />
              <KpiCard icon="⭐" label="میانگین امتیاز" value={stats.averageScore} color="yellow" decimal />
              <KpiCard icon="📈" label="رشد سالانه" value={`${Number(stats.growth || 0) >= 0 ? "+" : ""}${stats.growth || 0}٪`} color="teal" />
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <DashboardCard title="توزیع رتبه‌ها" subtitle="تعداد آموزشگاه‌ها در هر سطح" icon={<BarChart3 className="h-5 w-5 text-cyan-300" />}>
                <div className="space-y-3">{["A+", "A", "B", "C", "D"].map((rank) => { const found = distribution.find((item: any) => item.rank === rank); const count = Number(found?.count || 0); const theme = scoreTheme(rank === "A+" ? 95 : rank === "A" ? 85 : rank === "B" ? 75 : rank === "C" ? 65 : 45); return <div key={rank} className="grid grid-cols-[38px_1fr_38px] items-center gap-3"><span className={`font-black ${theme.text}`}>{rank}</span><div className="h-3 overflow-hidden rounded-full bg-white/5"><div className={`h-full rounded-full ${theme.dot}`} style={{ width: `${(count / maxDistribution) * 100}%` }} /></div><span className="text-left text-xs font-black text-slate-300">{count.toLocaleString("fa-IR")}</span></div>; })}</div>
              </DashboardCard>
              <DashboardCard title="روند رتبه‌بندی" subtitle="پرونده‌های تکمیل‌شده در شش ماه اخیر" icon={<TrendingUp className="h-5 w-5 text-emerald-300" />}>
                <div className="flex h-48 items-end gap-3 border-b border-white/10 px-2 pb-2">{trend.length > 0 ? trend.map((point: any) => <div key={point.month} className="flex flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-black text-cyan-200">{Number(point.count).toLocaleString("fa-IR")}</span><div className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-cyan-600 to-emerald-400" style={{ height: `${Math.max(8, (Number(point.count) / maxTrend) * 135)}px` }} /><span className="text-[9px] text-slate-500">{point.month}</span></div>) : <div className="m-auto text-xs text-slate-500">هنوز داده کافی برای نمودار روند وجود ندارد.</div>}</div>
              </DashboardCard>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
              <DashboardCard title="نقشه عملکرد شهرها و مناطق" subtitle="رنگ هر منطقه بر اساس میانگین امتیاز" icon={<MapPin className="h-5 w-5 text-amber-300" />}>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{(list?.cityStats || []).map((city: any) => { const avg = Number(city.average || 0); const theme = scoreTheme(avg); return <div key={city.city} className={`rounded-[16px] border border-white/10 p-4 ${theme.bg}`}><div className="flex items-center justify-between"><span className="text-sm font-black">{city.city}</span><span className={`h-3 w-3 rounded-full ${theme.dot}`} /></div><div className={`mt-3 text-2xl font-black ${theme.text}`}>{avg || "—"}</div><div className="mt-1 text-[9px] text-slate-500">{Number(city.cases || 0).toLocaleString("fa-IR")} پرونده</div></div>; })}</div>
              </DashboardCard>
              <DashboardCard title="گزارش لحظه‌ای امروز" subtitle="خلاصه فعالیت کارشناسی" icon={<CalendarDays className="h-5 w-5 text-fuchsia-300" />}>
                <div className="space-y-3"><LiveReport label="پرونده بررسی‌شده" value={stats.todayReviewed} color="cyan" /><LiveReport label="تایید و منتشرشده" value={stats.todayApproved} color="emerald" /><LiveReport label="برگشت برای اصلاح" value={stats.todayReturned} color="rose" /><LiveReport label="در انتظار بررسی" value={stats.waiting} color="amber" /></div>
              </DashboardCard>
            </section>

            {alerts.length > 0 && (
              <DashboardCard title="هشدارها و موارد نیازمند اقدام" subtitle="مواردی که باید سریع‌تر بررسی شوند" icon={<AlertTriangle className="h-5 w-5 text-amber-300" />}>
                <div className="grid gap-2 md:grid-cols-2">{alerts.map((item: any) => <div key={item.academy_id} className="flex items-center gap-3 rounded-[14px] border border-amber-400/15 bg-amber-400/[0.055] p-3"><button onClick={() => open(item)} className="flex min-w-0 flex-1 items-center gap-3 text-right"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-xl">{item.priority === "documents" ? "📎" : item.priority === "urgent" ? "⏰" : item.priority === "incomplete" ? "📝" : "⚠️"}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{item.academy_name}</span><span className="mt-1 block text-[10px] text-slate-400">{item.priority === "documents" ? "مستندات پرونده تکمیل نشده است" : item.priority === "urgent" ? "بیش از دو روز در انتظار بررسی" : item.priority === "incomplete" ? `خوداظهاری ${Number(item.completion_percent || 0)}٪ تکمیل شده` : "پرونده نیازمند اصلاح است"}</span></span><Eye className="h-4 w-4 text-amber-300" /></button><button onClick={() => sendReminder(item, item.priority === "urgent" ? "warning" : "reminder")} className="shrink-0 rounded-lg bg-amber-400 px-3 py-2 text-[9px] font-black text-slate-950">ارسال پیام</button></div>)}</div>
              </DashboardCard>
            )}

            <section className="rounded-[22px] border border-violet-400/20 bg-gradient-to-l from-violet-500/10 to-cyan-500/5 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black text-violet-200"><BrainCircuit className="h-6 w-6" /> تحلیل هوشمند منطقه</h3><p className="mt-2 text-xs leading-7 text-slate-300">میانگین امتیاز فعلی <b className="text-white">{stats.averageScore || 0}</b> است. روند سالانه <b className={Number(stats.growth || 0) >= 0 ? "text-emerald-300" : "text-rose-300"}>{stats.growth || 0}٪</b> بوده و {stats.excellent || 0} آموزشگاه رتبه ممتاز دارند.</p></div><div className="grid grid-cols-3 gap-2"><MiniAnalysis label="رشد" value={`${stats.growth || 0}٪`} /><MiniAnalysis label="میانگین" value={stats.averageScore || 0} /><MiniAnalysis label="ممتاز" value={stats.excellent || 0} /></div></div>
            </section>

            <section className="overflow-hidden rounded-[22px] border border-white/10 bg-[#0b223b]">
              <div className="border-b border-white/10 p-4">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><div><h3 className="text-lg font-black">پرونده‌های آموزشگاه‌ها</h3><p className="mt-1 text-[10px] text-slate-500">جست‌وجو، فیلتر، مقایسه و بازکردن پرونده بدون خروج از داشبورد</p></div><div className="flex flex-wrap gap-2"><QuickButton icon={<FileDown className="h-4 w-4" />} label="گزارش PDF" onClick={() => window.print()} /><QuickButton icon={<Download className="h-4 w-4" />} label="خروجی Excel" onClick={exportExcel} /><QuickButton icon={<MessageCircle className="h-4 w-4" />} label="ارسال پیام" onClick={() => window.location.href = "/chat"} /><QuickButton icon={<Filter className="h-4 w-4" />} label="جست‌وجوی پیشرفته" onClick={() => setShowFilters(!showFilters)} /></div></div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3"><Search className="h-4 w-4 text-slate-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جست‌وجوی آموزشگاه یا شهر..." className="w-full bg-transparent py-3 text-xs outline-none" /></label>{showFilters && <><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"><option value="all">همه وضعیت‌ها</option><option value="not_started">شروع‌نشده</option><option value="draft">در حال تکمیل</option><option value="submitted">منتظر بررسی</option><option value="under_review">در حال بررسی</option><option value="needs_correction">نیازمند اصلاح</option><option value="published">منتشرشده</option></select><select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)} className="rounded-xl bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"><option value="all">همه رتبه‌ها</option>{["A+", "A", "B", "C", "D"].map((rank) => <option key={rank} value={rank}>{rank}</option>)}</select></>}</div>
              </div>
              <div className="overflow-x-auto"><table className="w-full min-w-[1160px] text-xs"><thead><tr className="border-b border-white/10 text-right text-[10px] font-black text-slate-500"><th className="p-4">مقایسه</th><th>آموزشگاه</th><th>تکمیل پرونده</th><th>رتبه</th><th>امتیاز</th><th>قبولی</th><th>هنرجو</th><th>وضعیت</th><th>اولویت</th><th>عملیات</th></tr></thead><tbody>{items.map((item: any) => { const score = Number(item.score || 0); const completion = Number(item.completion_percent || 0); const started = !["not_started", "draft"].includes(item.status); const theme = scoreTheme(score); return <tr key={`${item.id}-${item.academy_id}`} className="border-b border-white/5 transition hover:bg-white/[0.03]"><td className="p-4"><input type="checkbox" checked={compareIds.includes(Number(item.academy_id))} onChange={() => setCompareIds((current) => current.includes(Number(item.academy_id)) ? current.filter((id) => id !== Number(item.academy_id)) : current.length < 2 ? [...current, Number(item.academy_id)] : [current[1], Number(item.academy_id)])} /></td><td><div className="font-black text-white">{item.academy_name}</div><div className="text-[9px] text-slate-500">{item.city || "—"}</div></td><td><div className="w-28"><div className="mb-1 flex items-center justify-between text-[9px]"><span className={completion<100?"text-amber-300":"text-emerald-300"}>{completion.toLocaleString("fa-IR")}٪</span><span className="text-slate-600">{item.missing_items?.length||0} نقص</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${completion>=100?"bg-emerald-400":completion>=50?"bg-amber-400":"bg-rose-400"}`} style={{width:`${completion}%`}} /></div></div></td><td>{started?<span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-black ${theme.bg} ${theme.text}`}><span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />{item.rank || theme.label}</span>:<span className="text-slate-600">—</span>}</td><td className={`text-base font-black ${started?theme.text:"text-slate-600"}`}>{started?score:"—"}</td><td>{Number(item.pass_rate || 0).toLocaleString("fa-IR")}٪</td><td>{Number(item.total_students || 0).toLocaleString("fa-IR")}</td><td><span className="rounded-full bg-white/5 px-2 py-1 text-[10px]">{statusText(item.status)}</span></td><td><PriorityBadge value={item.priority} /></td><td><div className="flex gap-1.5"><button onClick={() => open(item)} className="rounded-lg bg-primary-600 px-3 py-2 font-black">مشاهده پرونده</button>{completion<100&&<button onClick={() => sendReminder(item, completion<40?"warning":"reminder")} className="rounded-lg bg-amber-400 px-3 py-2 font-black text-slate-950">ارسال هشدار</button>}</div></td></tr>; })}{items.length === 0 && <tr><td colSpan={10} className="p-12 text-center text-slate-500">آموزشگاهی با این فیلتر پیدا نشد.</td></tr>}</tbody></table></div>
            </section>

            {comparison.length === 2 && <ComparisonPanel items={comparison} onClose={() => setCompareIds([])} />}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <aside className="absolute inset-y-0 right-0 w-full max-w-5xl overflow-y-auto border-l border-white/10 bg-[#07182c] p-4 shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="sticky top-0 z-20 mr-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-slate-200"><X className="h-5 w-5" /></button>
            <RankingReview data={selected} setData={setSelected} updateScore={updateScore} save={save} saving={saving} onBack={() => setSelected(null)} onReminder={() => sendReminder(selected.listItem, "warning")} />
          </aside>
        </div>
      )}
    </main>
  );
}

function HeaderMetric({ icon, label, value, warn = false }: { icon: string; label: string; value: number; warn?: boolean }) {
  return <div className={`rounded-[14px] border px-3 py-3 ${warn && Number(value) > 0 ? "border-amber-400/25 bg-amber-400/10" : "border-white/10 bg-black/15"}`}><div className="text-[9px] text-slate-400">{icon} {label}</div><div className={`mt-1 text-xl font-black ${warn && Number(value) > 0 ? "text-amber-200" : "text-white"}`}>{Number(value || 0).toLocaleString("fa-IR")}</div></div>;
}

function KpiCard({ icon, label, value, color, decimal = false }: { icon: string; label: string; value: any; color: string; decimal?: boolean }) {
  const themes: Record<string, string> = {
    cyan: "border-cyan-400/15 bg-cyan-500/[0.065] hover:border-cyan-400/30",
    blue: "border-blue-400/15 bg-blue-500/[0.065] hover:border-blue-400/30",
    amber: "border-amber-400/15 bg-amber-500/[0.065] hover:border-amber-400/30",
    emerald: "border-emerald-400/15 bg-emerald-500/[0.065] hover:border-emerald-400/30",
    rose: "border-rose-400/15 bg-rose-500/[0.065] hover:border-rose-400/30",
    fuchsia: "border-fuchsia-400/15 bg-fuchsia-500/[0.065] hover:border-fuchsia-400/30",
    yellow: "border-yellow-400/15 bg-yellow-500/[0.065] hover:border-yellow-400/30",
    teal: "border-teal-400/15 bg-teal-500/[0.065] hover:border-teal-400/30",
  };
  return <div className={`rounded-[17px] border p-4 transition hover:-translate-y-1 ${themes[color] || themes.cyan}`}><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-xl">{icon}</div><div className="text-xl font-black text-white">{typeof value === "number" ? value.toLocaleString("fa-IR", { maximumFractionDigits: decimal ? 1 : 0 }) : value}</div><div className="mt-1 text-[9px] font-bold text-slate-400">{label}</div></div>;
}

function DashboardCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode }) {
  return <div className="rounded-[22px] border border-white/10 bg-[#0b223b] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.16)]"><div className="mb-5 flex items-start gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">{icon}</div><div><h3 className="font-black text-white">{title}</h3><p className="mt-1 text-[10px] text-slate-500">{subtitle}</p></div></div>{children}</div>;
}

function LiveReport({ label, value, color }: { label: string; value: number; color: string }) {
  const themes: Record<string, string> = { cyan: "bg-cyan-500/15 text-cyan-300", emerald: "bg-emerald-500/15 text-emerald-300", rose: "bg-rose-500/15 text-rose-300", amber: "bg-amber-500/15 text-amber-300" };
  return <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.025] p-3"><span className="text-xs font-bold text-slate-300">{label}</span><span className={`rounded-full px-3 py-1 text-sm font-black ${themes[color] || themes.cyan}`}>{Number(value || 0).toLocaleString("fa-IR")}</span></div>;
}

function MiniAnalysis({ label, value }: { label: string; value: any }) {
  return <div className="min-w-20 rounded-xl bg-black/20 p-3 text-center"><div className="text-lg font-black text-violet-200">{value}</div><div className="text-[8px] text-slate-500">{label}</div></div>;
}

function QuickButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[9px] font-black text-slate-200 hover:bg-white/10">{icon}{label}</button>;
}

function PriorityBadge({ value }: { value: string }) {
  const config = value === "urgent" ? ["فوری", "bg-rose-500/15 text-rose-300"] : value === "high" ? ["بالا", "bg-amber-500/15 text-amber-300"] : value === "documents" ? ["مدارک ناقص", "bg-fuchsia-500/15 text-fuchsia-300"] : value === "incomplete" ? ["تکمیل‌نشده", "bg-orange-500/15 text-orange-300"] : ["عادی", "bg-slate-500/10 text-slate-400"];
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${config[1]}`}>{config[0]}</span>;
}

function ComparisonPanel({ items, onClose }: { items: any[]; onClose: () => void }) {
  const metrics = [
    ["امتیاز نهایی", (item: any) => Number(item.score || 0), 100],
    ["درصد قبولی", (item: any) => Number(item.pass_rate || 0), 100],
    ["تعداد هنرجو", (item: any) => Number(item.total_students || 0), Math.max(1, ...items.map((item) => Number(item.total_students || 0)))],
  ];
  return <section className="rounded-[22px] border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/5 p-5"><div className="mb-5 flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-lg font-black"><ArrowLeftRight className="h-5 w-5 text-fuchsia-300" /> مقایسه آموزشگاه‌ها</h3><p className="mt-1 text-[10px] text-slate-400">{items[0].academy_name} در برابر {items[1].academy_name}</p></div><button onClick={onClose} className="rounded-full bg-white/5 p-2"><X className="h-4 w-4" /></button></div><div className="space-y-4">{metrics.map(([label, getter, max]: any) => <div key={label}><div className="mb-2 text-xs font-black text-slate-300">{label}</div><div className="grid gap-2 sm:grid-cols-2">{items.map((item, index) => { const value = getter(item); return <div key={item.academy_id} className="rounded-xl bg-black/15 p-3"><div className="mb-2 flex items-center justify-between text-[10px]"><span className="truncate">{item.academy_name}</span><b>{value.toLocaleString("fa-IR")}</b></div><div className="h-2 rounded-full bg-white/10"><div className={`h-full rounded-full ${index === 0 ? "bg-fuchsia-400" : "bg-cyan-400"}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div></div>; })}</div></div>)}</div></section>;
}


function RankingReview({data,setData,updateScore,save,saving,onBack,onReminder}:any){
  const m=data.metrics||{},d=data.declaration||{};
  const canEvaluate = !["draft", "not_started"].includes(data.ranking?.status);
  const total=data.scores.reduce((s:number,x:any)=>s+Number(x.expertScore??x.systemScore??0),0);
  const suggestedTotal=data.scores.reduce((s:number,x:any)=>s+Number(x.systemScore??0),0);
  const previousScore=Number(data.listItem?.previous_score||0);
  const scoreGrowth=previousScore>0?Math.round(((suggestedTotal-previousScore)/previousScore)*1000)/10:0;
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><button onClick={onBack} className="mb-2 text-xs text-cyan-300">← بازگشت</button><h2 className="text-2xl font-black">پرونده {data.academyName||m.name}</h2><p className="text-xs text-slate-400">سال {data.year} • امتیاز لحظه‌ای {total.toFixed(2)} از ۱۰۰</p></div><div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-cyan-400/20 text-xl font-black">{Math.round(total)}</div></div>
    <nav className="sticky top-12 z-10 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#07182c]/95 p-2 backdrop-blur"><a href="#rank-info" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-[9px] font-black">اطلاعات</a><a href="#rank-declaration" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-[9px] font-black">خوداظهاری و مدارک</a><a href="#rank-timeline" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-[9px] font-black">مراحل پرونده</a><a href="#rank-scores" className="whitespace-nowrap rounded-lg bg-white/5 px-3 py-2 text-[9px] font-black">امتیازها و تحلیل</a><a href={`/rank/${m.slug}?print=1`} target="_blank" className="whitespace-nowrap rounded-lg bg-cyan-500 px-3 py-2 text-[9px] font-black text-slate-950">گزارش PDF</a></nav>
    <section id="rank-info" className="scroll-mt-28 rounded-[18px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-3 font-black text-cyan-200">اطلاعات سیستمی</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[["هنرجو",m.totalStudents],["مدرک",m.certifiedStudents],["آزمون",m.examsTaken],["قبولی",m.passed],["درصد قبولی",`${m.passRate}٪`],["سابقه",`${m.activityYears} سال`],["دوره",m.coursesHeld],["رشته",m.activeFields]].map(([l,v])=><div key={l as string} className="rounded-lg bg-black/20 p-3"><div className="text-[9px] text-slate-500">{l}</div><div className="mt-1 font-black">{String(v)}</div></div>)}</div></section>
    <CaseTimeline status={data.ranking.status} />
    <SelfDeclarationView declaration={d} />
    {!canEvaluate && <section className="rounded-[18px] border border-amber-400/25 bg-amber-400/10 p-5"><h3 className="font-black text-amber-200">پرونده هنوز برای ارزیابی ارسال نشده است</h3><p className="mt-2 text-[11px] leading-6 text-slate-300">کارشناس می‌تواند اطلاعات فعلی را مشاهده کند، اما امتیازدهی تا زمان تکمیل و ارسال رسمی خوداظهاری توسط آموزشگاه قفل است.</p><button onClick={onReminder} className="mt-3 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-black text-slate-950">ارسال هشدار تکمیل پرونده</button></section>}
    <section id="rank-scores" className="scroll-mt-28 rounded-[18px] border border-violet-400/20 bg-gradient-to-l from-violet-500/10 to-cyan-500/5 p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h3 className="flex items-center gap-2 text-base font-black text-violet-200"><BrainCircuit className="h-5 w-5"/> پیشنهاد امتیاز هوشمند</h3><p className="mt-2 text-[11px] leading-6 text-slate-300">سیستم بر اساس هنرجویان، قبولی، سابقه، امکانات و فعالیت علمی امتیاز پایه را محاسبه کرده است. {previousScore>0?<>این آموزشگاه نسبت به رتبه سال قبل <b className={scoreGrowth>=0?"text-emerald-300":"text-rose-300"}>{Math.abs(scoreGrowth)}٪ {scoreGrowth>=0?"رشد":"افت"}</b> داشته است.</>:"هنوز رتبه سال قبل برای مقایسه ثبت نشده است."}</p><div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-200">قبولی: {m.passRate||0}٪</span><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200">هنرجو: {m.totalStudents||0}</span><span className="rounded-full bg-violet-500/10 px-2 py-1 text-violet-200">فعالیت علمی: {data.declaration?.books?.length||0} کتاب، {data.declaration?.seminars?.length||0} رویداد</span></div></div><div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-violet-500/15 px-5 py-3 text-center"><div className="text-[9px] text-violet-200">پیشنهاد سیستم</div><div className="text-2xl font-black text-white">{suggestedTotal.toFixed(1)}</div></div><div className="rounded-xl bg-cyan-500/15 px-5 py-3 text-center"><div className="text-[9px] text-cyan-200">امتیاز کارشناس</div><div className="text-2xl font-black text-white">{total.toFixed(1)}</div></div></div></div></section>
    <section className="rounded-[18px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-4 font-black text-amber-200">امتیازدهی کارشناس</h3><div className="space-y-3">{data.scores.map((score:any)=><div key={score.code} className="rounded-xl border border-white/10 bg-[#0B1120] p-4"><div className="mb-3 flex items-center justify-between"><div><div className="font-black">{score.title}</div><div className="text-[9px] text-slate-500">پیشنهاد سیستم: {score.systemScore} • حداکثر {score.maxScore}</div></div><input type="number" min="0" max={score.maxScore} step="0.25" disabled={!canEvaluate} value={score.expertScore??score.systemScore} onChange={(e)=>updateScore(score.code,{expertScore:e.target.value})} className="w-24 rounded-lg bg-white px-3 py-2 text-center text-lg font-black text-slate-900"/></div><div className="grid gap-2 sm:grid-cols-2"><textarea disabled={!canEvaluate} value={score.comment||""} onChange={(e)=>updateScore(score.code,{comment:e.target.value})} placeholder="توضیح کارشناس" rows={2} className="rounded-lg bg-white/90 p-2 text-xs text-slate-900"/><textarea disabled={!canEvaluate} value={score.deductionReason||""} onChange={(e)=>updateScore(score.code,{deductionReason:e.target.value})} placeholder="دلیل کاهش امتیاز" rows={2} className="rounded-lg bg-white/90 p-2 text-xs text-slate-900"/></div></div>)}</div></section>
    <div className="grid gap-3 sm:grid-cols-2"><ListEditor title="نقاط قوت" disabled={!canEvaluate} value={data.strengths} onChange={(value: string[])=>setData({...data,strengths:value})}/><ListEditor title="موارد قابل بهبود" disabled={!canEvaluate} value={data.improvements} onChange={(value: string[])=>setData({...data,improvements:value})}/></div>
    {canEvaluate && <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#071426]/95 p-3 shadow-2xl"><button onClick={()=>save("under_review")} disabled={saving} className="flex-1 rounded-xl bg-white/10 py-3 text-xs font-black"><Save className="ml-1 inline h-4 w-4"/>ذخیره بررسی</button><button onClick={()=>save("needs_correction")} disabled={saving} className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950">نیازمند اصلاح</button><button onClick={()=>save("approved")} disabled={saving} className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-black text-slate-950">تایید و انتشار رتبه</button></div>}
  </div>;
}
function CaseTimeline({ status }: { status: string }) {
  const stages = [
    { key: "submitted", label: "ثبت خوداظهاری" },
    { key: "under_review", label: "بررسی اولیه" },
    { key: "visit", label: "بازدید و مستندات" },
    { key: "scoring", label: "امتیازدهی" },
    { key: "published", label: "تایید نهایی" },
  ];
  const progress = status === "published" ? 5 : status === "approved" ? 4 : status === "needs_correction" ? 3 : status === "under_review" ? 2 : 1;
  return <section id="rank-timeline" className="scroll-mt-28 rounded-[18px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-4 text-base font-black text-white">🕒 مسیر پرونده</h3><div className="grid grid-cols-5 gap-1">{stages.map((stage, index) => { const done = index < progress; const current = index === progress; return <div key={stage.key} className="relative text-center"><div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black ${done ? "border-emerald-400 bg-emerald-500 text-slate-950" : current ? "border-amber-300 bg-amber-400/15 text-amber-200" : "border-slate-700 bg-slate-800 text-slate-500"}`}>{done ? "✓" : current ? "⏳" : index + 1}</div><div className={`mt-2 text-[8px] font-bold sm:text-[10px] ${done ? "text-emerald-200" : current ? "text-amber-200" : "text-slate-600"}`}>{stage.label}</div>{index < stages.length - 1 && <div className={`absolute right-[60%] top-4 h-0.5 w-[80%] ${done ? "bg-emerald-400/50" : "bg-slate-700"}`} />}</div>; })}</div></section>;
}

function SelfDeclarationView({ declaration }: { declaration: any }) {
  const physical = declaration?.physical || {};
  const books = Array.isArray(declaration?.books) ? declaration.books : [];
  const seminars = Array.isArray(declaration?.seminars) ? declaration.seminars : [];
  const honors = Array.isArray(declaration?.honors) ? declaration.honors : [];
  const activities = Array.isArray(declaration?.contentActivities) ? declaration.contentActivities : [];
  const documents = Array.isArray(declaration?.documents) ? declaration.documents : [];
  const activeValue = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";
  const yesNo = (value: unknown) => activeValue(value) ? "دارد" : "ندارد";

  return (
    <section id="rank-declaration" className="scroll-mt-28 overflow-hidden rounded-[22px] border border-emerald-400/20 bg-gradient-to-br from-[#0d3457] to-[#081f39] shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/10 bg-emerald-400/[0.07] px-5 py-5 sm:px-6">
        <h3 className="flex items-center gap-2 text-lg font-black text-emerald-200">🏫 خوداظهاری آموزشگاه</h3>
        <p className="mt-1 text-[11px] leading-6 text-slate-300">اطلاعات ثبت‌شده توسط مدیر آموزشگاه، به‌صورت دسته‌بندی‌شده و قابل ارزیابی</p>
      </div>

      <div className="space-y-5 p-4 sm:p-6">
        <div className="rounded-[18px] border border-cyan-400/15 bg-[#061b31]/75 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="text-base font-black text-cyan-100">🏢 امکانات و فضای آموزشی</h4>
            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[10px] font-black text-cyan-200">اطلاعات فیزیکی</span>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <InfoValue icon="📐" label="متراژ آموزشگاه" value={physical.area ? `${physical.area} مترمربع` : "ثبت نشده"} />
            <InfoValue icon="🚪" label="تعداد کلاس‌ها" value={physical.classrooms ? `${physical.classrooms} کلاس` : "ثبت نشده"} />
            <InfoValue icon="🛠️" label="تعداد کارگاه‌ها" value={physical.workshops ? `${physical.workshops} کارگاه` : "ثبت نشده"} />
            <InfoValue icon="💻" label="سیستم‌های آموزشی" value={physical.systems ? `${physical.systems} دستگاه` : "ثبت نشده"} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <StatusValue label="بوفه" active={activeValue(physical.buffet)} value={yesNo(physical.buffet)} />
            <StatusValue label="فضای انتظار" active={activeValue(physical.waitingArea)} value={yesNo(physical.waitingArea)} />
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <TextPanel title="تجهیزات تخصصی" value={physical.specialEquipment} empty="تجهیزات تخصصی ثبت نشده است" />
            <TextPanel title="امکانات رفاهی" value={physical.amenities} empty="امکانات رفاهی ثبت نشده است" />
          </div>
        </div>

        <DeclarationCollection
          title="کتاب‌های تألیفی"
          icon="📚"
          count={books.length}
          empty="کتابی ثبت نشده است"
          items={books.map((book: any, index: number) => (
            <div key={index} className="rounded-[15px] border border-amber-400/15 bg-amber-400/[0.055] p-4">
              <div className="text-sm font-black text-amber-100">{book.title || "کتاب بدون عنوان"}</div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] leading-6 text-slate-300">
                <Field label="نویسنده" value={book.author} />
                <Field label="سال چاپ" value={book.printYear} />
                <Field label="ناشر" value={book.publisher} />
                <Field label="شابک" value={book.isbn} ltr />
                <Field label="تعداد صفحات" value={book.pages} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {book.cover && <FileLink href={book.cover} label="مشاهده جلد کتاب" />}
                {book.file && <FileLink href={book.file} label="مشاهده فایل کتاب" />}
              </div>
            </div>
          ))}
        />

        <DeclarationCollection
          title="سمینارها و رویدادها"
          icon="🎤"
          count={seminars.length}
          empty="سمینار یا رویدادی ثبت نشده است"
          items={seminars.map((seminar: any, index: number) => (
            <div key={index} className="rounded-[15px] border border-sky-400/15 bg-sky-400/[0.055] p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div><div className="text-sm font-black text-sky-100">{seminar.title || "رویداد بدون عنوان"}</div><div className="mt-1 text-[11px] font-bold text-slate-400">{seminar.subject || "موضوع ثبت نشده"}</div></div>
                {seminar.date && <span className="w-fit rounded-full bg-sky-400/10 px-3 py-1 text-[10px] font-black text-sky-200">📅 {seminar.date}</span>}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <InfoValue icon="👥" label="تعداد شرکت‌کنندگان" value={seminar.participants ? `${seminar.participants} نفر` : "ثبت نشده"} compact />
                <InfoValue icon="📌" label="نوع فعالیت" value="سمینار آموزشی" compact />
              </div>
              {seminar.description && <p className="mt-3 rounded-xl bg-black/15 p-3 text-[11px] leading-6 text-slate-300">{seminar.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                {seminar.poster && <FileLink href={seminar.poster} label="پوستر رویداد" />}
                {seminar.certificate && <FileLink href={seminar.certificate} label="گواهی برگزاری" />}
                {(seminar.images || []).map((image: string, imageIndex: number) => <FileLink key={imageIndex} href={image} label={`تصویر ${imageIndex + 1}`} />)}
              </div>
            </div>
          ))}
        />

        <DeclarationCollection
          title="افتخارات و دستاوردها"
          icon="🏆"
          count={honors.length}
          empty="افتخاری ثبت نشده است"
          items={honors.map((honor: any, index: number) => (
            <div key={index} className="rounded-[15px] border border-fuchsia-400/15 bg-fuchsia-400/[0.055] p-4">
              <div className="text-sm font-black text-fuchsia-100">{honor.title || "افتخار بدون عنوان"}</div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-[11px] text-slate-300">
                <Field label="سال دریافت" value={honor.year} />
                <Field label="مرجع صادرکننده" value={honor.issuer} />
              </div>
              {honor.document && <div className="mt-3"><FileLink href={honor.document} label="مشاهده مدرک افتخار" /></div>}
            </div>
          ))}
        />

        {activities.length > 0 && (
          <DeclarationCollection
            title="تولید محتوا و فعالیت علمی"
            icon="✨"
            count={activities.length}
            empty=""
            items={activities.map((activity: any, index: number) => (
              <div key={index} className="rounded-[14px] border border-emerald-400/15 bg-emerald-400/[0.055] p-4 text-sm font-bold text-emerald-100">
                {typeof activity === "string" ? activity : activity.title || activity.description || "فعالیت علمی"}
              </div>
            ))}
          />
        )}

        <div className="rounded-[18px] border border-white/10 bg-[#061b31]/75 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between"><h4 className="text-base font-black text-white">📎 تصاویر و مستندات</h4><span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black text-slate-300">{documents.length.toLocaleString("fa-IR")} فایل</span></div>
          {documents.length > 0 ? <div className="grid gap-2 sm:grid-cols-2">{documents.map((doc: any, index: number) => (
            <a key={index} href={doc.dataUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.06]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-400/10 text-xl">{doc.type === "pdf" ? "📄" : "🖼️"}</span>
              <div className="min-w-0"><div className="truncate text-xs font-black text-white">{doc.name || `مستند ${index + 1}`}</div><div className="mt-1 text-[9px] text-cyan-200">برای مشاهده کلیک کنید</div></div>
            </a>
          ))}</div> : <EmptyState text="هیچ تصویر یا مستندی بارگذاری نشده است" />}
        </div>
      </div>
    </section>
  );
}

function DeclarationCollection({ title, icon, count, empty, items }: { title: string; icon: string; count: number; empty: string; items: ReactNode[] }) {
  return <div className="rounded-[18px] border border-white/10 bg-[#061b31]/75 p-4 sm:p-5"><div className="mb-4 flex items-center justify-between gap-3"><h4 className="text-base font-black text-white"><span className="ml-2">{icon}</span>{title}</h4><span className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-black text-slate-300">{count.toLocaleString("fa-IR")} مورد</span></div>{count > 0 ? <div className="grid gap-3 lg:grid-cols-2">{items}</div> : <EmptyState text={empty} />}</div>;
}

function InfoValue({ icon, label, value, compact = false }: { icon: string; label: string; value: string; compact?: boolean }) {
  return <div className={`rounded-[13px] border border-white/8 bg-white/[0.035] ${compact ? "p-3" : "p-4"}`}><div className="flex items-center gap-2 text-[10px] font-bold text-slate-400"><span className="text-base">{icon}</span>{label}</div><div className="mt-2 text-sm font-black text-white sm:text-base">{value}</div></div>;
}

function StatusValue({ label, value, active }: { label: string; value: string; active: boolean }) {
  return <div className={`flex items-center justify-between rounded-[13px] border p-3 ${active ? "border-emerald-400/20 bg-emerald-400/[0.07]" : "border-slate-500/15 bg-white/[0.025]"}`}><span className="text-xs font-black text-slate-200">{label}</span><span className={`rounded-full px-3 py-1 text-[10px] font-black ${active ? "bg-emerald-400/15 text-emerald-200" : "bg-slate-500/10 text-slate-400"}`}>{active ? "✓ " : "— "}{value}</span></div>;
}

function TextPanel({ title, value, empty }: { title: string; value: unknown; empty: string }) {
  return <div className="rounded-[13px] border border-white/8 bg-white/[0.035] p-4"><div className="text-xs font-black text-cyan-100">{title}</div><p className="mt-2 whitespace-pre-line text-[11px] leading-6 text-slate-300">{value ? String(value) : empty}</p></div>;
}

function Field({ label, value, ltr = false }: { label: string; value: unknown; ltr?: boolean }) {
  return <div><span className="text-slate-500">{label}: </span><b className="text-slate-200" dir={ltr ? "ltr" : undefined}>{value ? String(value) : "ثبت نشده"}</b></div>;
}

function FileLink({ href, label }: { href: string; label: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/15 bg-cyan-400/[0.07] px-3 py-2 text-[10px] font-black text-cyan-200 transition hover:bg-cyan-400/[0.13]"><FileText className="h-3.5 w-3.5" />{label}</a>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 bg-black/10 px-4 py-7 text-center text-[11px] font-bold text-slate-500">{text}</div>;
}

function ListEditor({title,value=[],onChange,disabled=false}:any){return <label className="text-xs font-black text-slate-300">{title}<textarea disabled={disabled} value={value.join("\n")} onChange={(e)=>onChange(e.target.value.split("\n").map((x: string)=>x.trim()).filter(Boolean))} rows={5} className="mt-2 w-full rounded-xl bg-white/90 p-3 text-xs text-slate-900" placeholder="هر مورد در یک خط"/></label>}
