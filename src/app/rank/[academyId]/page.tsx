import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Award, BadgeCheck, Building2, CalendarDays, CheckCircle2, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrintRankingButton from "@/components/ranking/PrintRankingButton";
import { getPublishedRanking } from "@/lib/ranking-system";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "استعلام رتبه آموزشگاه | فَنیکسو", description: "استعلام عمومی و گزارش رسمی رتبه‌بندی آموزشگاه" };

export default async function PublicRankPage({ params }: { params: Promise<{ academyId: string }> }) {
  const { academyId } = await params;
  const data = await getPublishedRanking(decodeURIComponent(academyId));
  if (!data) notFound();
  const p = data.public as any, metrics = data.metrics as any;
  const url = `https://www.fanixo.ir/rank/${metrics.slug}`;
  const qr = await QRCode.toDataURL(url, { width: 260, margin: 1, color: { dark: "#04152A", light: "#FFFFFF" } });
  const valid = !p.valid_until || new Date(p.valid_until) > new Date();
  const groups = [
    { label: "عملکرد آموزشی", value: data.scores.filter((x:any)=>x.group==="education").reduce((s:number,x:any)=>s+Number(x.expertScore??x.systemScore),0), max:60, color:"#22d3ee" },
    { label: "سابقه", value: Number(data.scores.find((x:any)=>x.code==="experience")?.expertScore||0), max:15, color:"#34d399" },
    { label: "امکانات", value: Number(data.scores.find((x:any)=>x.code==="facilities")?.expertScore||0), max:15, color:"#f4d57c" },
    { label: "فعالیت علمی", value: Number(data.scores.find((x:any)=>x.code==="science")?.expertScore||0), max:10, color:"#c084fc" },
  ];
  return <main className="min-h-screen bg-[#06182d] text-white"><div className="print:hidden"><Navbar/></div><div className="mx-auto max-w-5xl px-3 pb-16 pt-28 print:max-w-none print:p-0">
    <div className="mb-4 flex items-center justify-between gap-3 print:hidden"><div><div className="text-xs text-cyan-200">گزارش رسمی اعتبارسنجی</div><h1 className="text-2xl font-black">رتبه‌بندی آموزشگاه</h1></div><PrintRankingButton/></div>
    <article className="overflow-hidden rounded-[28px] border border-cyan-300/20 bg-white/[0.04] shadow-2xl print:rounded-none print:border-0 print:bg-white print:text-slate-900 print:shadow-none">
      <header className="relative bg-gradient-to-l from-[#0a4168] to-[#071b33] p-6 sm:p-8 print:bg-[#082d53] print:text-white"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-center gap-4"><div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-amber-300/30 bg-[#04152A]">{p.logo?<Image src={p.logo} alt="لوگو" width={80} height={80} className="h-full w-full object-cover" unoptimized/>:<Building2 className="h-10 w-10 text-cyan-300"/>}</div><div><div className="text-[10px] font-black text-amber-200">فَنیکسو • سامانه هوشمند رتبه‌بندی</div><h2 className="mt-1 text-xl font-black sm:text-3xl">{p.academy_name}</h2><p className="mt-1 text-xs text-slate-300">{p.city||"زبرخان"} • کد {p.license_number||metrics.academyCode}</p></div></div><div className="flex items-center gap-3"><div className="text-left"><div className="text-[10px] text-slate-300">رتبه نهایی</div><div className="text-5xl font-black text-amber-300">{p.rank}</div><div className="text-xs font-black text-amber-100">{p.rank_label}</div></div><div className="flex h-24 w-24 items-center justify-center rounded-full border-8 border-cyan-300/20 bg-black/20"><div className="text-center"><div className="text-2xl font-black">{Number(p.score)}</div><div className="text-[9px]">از ۱۰۰</div></div></div></div></div></header>
      <div className="p-5 sm:p-8"><div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{groups.map(g=><div key={g.label} className="rounded-xl border border-white/10 bg-black/15 p-3 print:border-slate-200 print:bg-slate-50"><div className="text-[10px] text-slate-400 print:text-slate-500">{g.label}</div><div className="mt-1 text-xl font-black">{g.value} <span className="text-[10px] text-slate-500">از {g.max}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10 print:bg-slate-200"><div className="h-full rounded-full" style={{width:`${Math.min(100,(g.value/g.max)*100)}%`,background:g.color}}/></div></div>)}</div>
        <div className="grid gap-4 sm:grid-cols-2"><section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5 print:border-emerald-200 print:bg-emerald-50"><h3 className="mb-3 flex items-center gap-2 font-black text-emerald-200 print:text-emerald-800"><CheckCircle2 className="h-5 w-5"/>نقاط قوت</h3>{(data.ranking.strengths||[]).map((x:string)=><p key={x} className="text-xs leading-7">✔ {x}</p>)}</section><section className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 print:border-amber-200 print:bg-amber-50"><h3 className="mb-3 flex items-center gap-2 font-black text-amber-200 print:text-amber-800"><Award className="h-5 w-5"/>موارد قابل بهبود</h3>{(data.ranking.improvements||[]).map((x:string)=><p key={x} className="text-xs leading-7">• {x}</p>)}</section></div>
        <section className="mt-6 grid gap-4 rounded-2xl border border-white/10 p-5 sm:grid-cols-[1fr_180px] print:border-slate-200"><div><h3 className="flex items-center gap-2 font-black"><ShieldCheck className="h-5 w-5 text-cyan-300"/>اعتبار رتبه</h3><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><span className="text-slate-500">سال ارزیابی:</span> <b>{p.year}</b></div><div><span className="text-slate-500">وضعیت:</span> <b className={valid?"text-emerald-300 print:text-emerald-700":"text-red-300"}>{valid?"معتبر":"منقضی"}</b></div><div><span className="text-slate-500">تاریخ انتشار:</span> <b>{p.published_at?new Date(p.published_at).toLocaleDateString("fa-IR"):"—"}</b></div><div><span className="text-slate-500">اعتبار تا:</span> <b>{p.valid_until?new Date(p.valid_until).toLocaleDateString("fa-IR"):"نامحدود"}</b></div></div><p className="mt-5 text-[10px] leading-6 text-slate-500">این گزارش بر اساس اطلاعات خودکار سامانه، خوداظهاری مستند آموزشگاه و ارزیابی کارشناس صادر شده است. برای استعلام آنلاین، QR را اسکن کنید.</p></div><div className="text-center"><Image src={qr} alt="QR استعلام رتبه" width={160} height={160} unoptimized className="mx-auto h-40 w-40 rounded-xl bg-white p-2"/><div className="mt-2 text-[9px] text-slate-500">QR استعلام عمومی</div></div></section>
      </div>
    </article>
  </div><div className="print:hidden"><Footer/></div><style>{`@media print{@page{size:A4;margin:10mm}body{background:white!important}.fixed{display:none!important}}`}</style></main>;
}
