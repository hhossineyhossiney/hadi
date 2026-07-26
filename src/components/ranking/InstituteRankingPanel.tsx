"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Building2, CheckCircle2, FileText, Loader2, Plus, Save, Send, Trash2, Upload, Users } from "lucide-react";

const emptyBook = { title: "", author: "", printYear: "", publisher: "", isbn: "", pages: "", cover: "", file: "" };
const emptySeminar = { title: "", date: "", subject: "", participants: "", description: "", images: [], poster: "", certificate: "" };
const emptyHonor = { title: "", year: "", issuer: "", document: "" };

function statusLabel(status: string) {
  return ({ draft: "پیش‌نویس", submitted: "ارسال‌شده برای بررسی کارشناس", under_review: "در حال بررسی", needs_correction: "نیازمند اصلاح", approved: "تایید کارشناس", published: "منتشرشده" } as any)[status] || status;
}

function fileData(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 1_500_000) return reject(new Error("حجم هر فایل حداکثر ۱.۵ مگابایت است"));
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "")); reader.onerror = reject; reader.readAsDataURL(file);
  });
}

export function InstituteRankSummary() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { fetch("/api/ranking/manager").then((r) => r.ok ? r.json() : null).then(setData).catch(() => {}); }, []);
  if (!data?.ranking || !["approved", "published"].includes(data.ranking.status)) return null;
  return (
    <div className="mb-6 overflow-hidden rounded-[22px] border border-amber-400/30 bg-gradient-to-l from-amber-500/15 via-cyan-500/10 to-transparent p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-amber-300 to-amber-600 text-2xl font-black text-slate-950">{data.ranking.rank}</div><div><div className="text-[10px] font-black text-amber-300">🏆 رتبه آموزشگاه</div><div className="mt-1 text-xl font-black text-white">{data.ranking.rankLabel}</div><div className="text-xs text-slate-300">{data.ranking.score} از ۱۰۰ • سال {data.year}</div></div></div>
        <button onClick={() => window.dispatchEvent(new CustomEvent("open-ranking-tab"))} className="rounded-[12px] bg-white px-5 py-3 text-xs font-black text-slate-900">مشاهده جزئیات رتبه</button>
      </div>
    </div>
  );
}

export default function InstituteRankingPanel() {
  const [data, setData] = useState<any>(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [msg, setMsg] = useState("");
  const load = () => fetch("/api/ranking/manager").then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setData(d); }).catch((e) => setMsg(`❌ ${e.message}`)).finally(() => setLoading(false));
  useEffect(() => { void load(); }, []);
  const updateDeclaration = (patch: any) => setData((current: any) => ({ ...current, declaration: { ...current.declaration, ...patch } }));
  const updatePhysical = (key: string, value: any) => updateDeclaration({ physical: { ...data.declaration.physical, [key]: value } });
  const addArray = (key: string, value: any) => updateDeclaration({ [key]: [...(data.declaration[key] || []), value] });
  const updateArray = (key: string, index: number, patch: any) => updateDeclaration({ [key]: data.declaration[key].map((item: any, i: number) => i === index ? { ...item, ...patch } : item) });
  const removeArray = (key: string, index: number) => updateDeclaration({ [key]: data.declaration[key].filter((_: any, i: number) => i !== index) });

  const save = async (action: "save" | "submit") => {
    setSaving(true); setMsg("");
    const response = await fetch("/api/ranking/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, year: data.year, declaration: data.declaration }) });
    const result = await response.json(); setSaving(false);
    if (!response.ok) return setMsg(`❌ ${result.error || "خطا"}`);
    setMsg(action === "submit" ? "✅ پرونده برای بررسی کارشناس ارسال شد" : "✅ پیش‌نویس ذخیره شد"); setData(result.bundle);
  };

  const addDocument = async (file: File, type = "document") => {
    try { const dataUrl = await fileData(file); addArray("documents", { name: file.name, type, dataUrl, description: "" }); } catch (e: any) { setMsg(`❌ ${e.message}`); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-cyan-400" /></div>;
  if (!data) return <div className="rounded-xl bg-red-500/10 p-4 text-red-300">{msg || "اطلاعات رتبه‌بندی در دسترس نیست"}</div>;
  const locked = ["approved", "published"].includes(data.ranking.status);
  const m = data.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h2 className="flex items-center gap-2 text-2xl font-black text-white"><Award className="h-7 w-7 text-amber-300" /> رتبه‌بندی آموزشگاه</h2><p className="mt-1 text-xs text-slate-400">خوداظهاری، ارزیابی کارشناس و مشاهده دلایل رتبه</p></div><span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-black text-cyan-200">{statusLabel(data.ranking.status)}</span></div>
      {msg && <div className="rounded-[12px] border border-white/10 bg-white/5 p-3 text-xs font-bold text-slate-200">{msg}</div>}

      {["approved", "published"].includes(data.ranking.status) && (
        <div className="rounded-[22px] border border-amber-400/25 bg-gradient-to-br from-amber-500/15 to-cyan-500/5 p-5">
          <div className="grid gap-5 lg:grid-cols-[220px_1fr]"><div className="text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-amber-300/30 bg-[#071d35] text-4xl font-black text-amber-300">{data.ranking.rank}</div><div className="mt-3 text-xl font-black">{data.ranking.rankLabel}</div><div className="text-sm text-cyan-200">{data.ranking.score} از ۱۰۰</div></div><div><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{data.scores.reduce((groups: any, score: any) => { groups[score.group] = (groups[score.group] || 0) + Number(score.expertScore ?? score.systemScore); return groups; }, {}) && [["عملکرد آموزشی", data.scores.filter((x:any)=>x.group==="education").reduce((s:number,x:any)=>s+Number(x.expertScore??x.systemScore),0),60],["سابقه",data.scores.find((x:any)=>x.code==="experience")?.expertScore??0,15],["امکانات",data.scores.find((x:any)=>x.code==="facilities")?.expertScore??0,15],["فعالیت علمی",data.scores.find((x:any)=>x.code==="science")?.expertScore??0,10]].map(([label,value,max]:any)=><div key={label} className="rounded-xl bg-black/20 p-3"><div className="text-[9px] text-slate-400">{label}</div><div className="text-lg font-black text-white">{Number(value)} <span className="text-[10px] text-slate-500">از {max}</span></div></div>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-emerald-500/10 p-4"><div className="mb-2 text-xs font-black text-emerald-300">نقاط قوت</div>{(data.ranking.strengths || []).map((x:string)=><div key={x} className="text-[11px] leading-6 text-slate-200">✔ {x}</div>)}</div><div className="rounded-xl bg-amber-500/10 p-4"><div className="mb-2 text-xs font-black text-amber-300">موارد قابل بهبود</div>{(data.ranking.improvements || []).map((x:string)=><div key={x} className="text-[11px] leading-6 text-slate-200">⚠ {x}</div>)}</div></div><div className="mt-4 flex gap-2"><Link href={`/rank/${m.slug}`} target="_blank" className="rounded-[10px] bg-white px-4 py-2.5 text-[10px] font-black text-slate-900">صفحه استعلام عمومی</Link><Link href={`/rank/${m.slug}?print=1`} target="_blank" className="rounded-[10px] bg-cyan-500 px-4 py-2.5 text-[10px] font-black text-slate-950">چاپ / ذخیره PDF</Link></div></div></div>
        </div>
      )}

      <section className="rounded-[20px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-5 w-5 text-cyan-300" /> اطلاعات خودکار سیستم</h3><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["نام آموزشگاه",m.name],["کد آموزشگاه",m.academyCode],["تاریخ تأسیس",m.establishedYear],["سابقه فعالیت",`${m.activityYears} سال`],["کل هنرجویان",m.totalStudents],["هنرجوی دارای مدرک",m.certifiedStudents],["آزمون داده‌شده",m.examsTaken],["قبول‌شدگان",m.passed],["درصد قبولی",`${m.passRate}٪`],["دوره برگزارشده",m.coursesHeld],["رشته فعال",m.activeFields]].map(([label,value])=><div key={label as string} className="rounded-[12px] border border-white/5 bg-[#0B1120] p-3"><div className="text-[9px] text-slate-500">{label}</div><div className="mt-1 text-sm font-black text-white">{String(value)}</div></div>)}</div></section>

      <fieldset disabled={locked} className="space-y-5 disabled:opacity-70">
        <section className="rounded-[20px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-4 flex items-center gap-2 text-sm font-black"><Building2 className="h-5 w-5 text-emerald-300" /> امکانات فیزیکی</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["area","متراژ آموزشگاه"],["classrooms","تعداد کلاس‌ها"],["workshops","تعداد کارگاه‌ها"],["systems","تعداد سیستم‌های آموزشی"]].map(([key,label])=><label key={key} className="text-[10px] font-bold text-slate-400">{label}<input type="number" value={data.declaration.physical?.[key] || ""} onChange={(e)=>updatePhysical(key,e.target.value)} className="mt-1 w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" /></label>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-[10px] font-bold text-slate-400">تجهیزات تخصصی<textarea value={data.declaration.physical?.specialEquipment || ""} onChange={(e)=>updatePhysical("specialEquipment",e.target.value)} rows={3} className="mt-1 w-full rounded-[10px] bg-white/90 p-3 text-sm text-slate-900" /></label><label className="text-[10px] font-bold text-slate-400">امکانات رفاهی<textarea value={data.declaration.physical?.amenities || ""} onChange={(e)=>updatePhysical("amenities",e.target.value)} rows={3} className="mt-1 w-full rounded-[10px] bg-white/90 p-3 text-sm text-slate-900" /></label></div><div className="mt-3 flex flex-wrap gap-4">{[["buffet","بوفه"],["waitingArea","فضای انتظار"]].map(([key,label])=><label key={key} className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={!!data.declaration.physical?.[key]} onChange={(e)=>updatePhysical(key,e.target.checked)} /> {label}</label>)}</div></section>

        <Collection title="کتاب‌های تألیفی" icon={<BookOpen className="h-5 w-5 text-amber-300" />} items={data.declaration.books} onAdd={()=>addArray("books",{...emptyBook})} onRemove={(i: number)=>removeArray("books",i)} render={(book:any,i: number)=><div className="grid gap-2 sm:grid-cols-3">{[["title","عنوان کتاب"],["author","نویسنده"],["printYear","سال چاپ"],["publisher","ناشر"],["isbn","شابک"],["pages","تعداد صفحات"]].map(([key,label])=><input key={key} value={book[key]||""} onChange={(e)=>updateArray("books",i,{[key]:e.target.value})} placeholder={label} className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900" />)}</div>} />
        <Collection title="سمینارها و رویدادها" icon={<Users className="h-5 w-5 text-cyan-300" />} items={data.declaration.seminars} onAdd={()=>addArray("seminars",{...emptySeminar})} onRemove={(i: number)=>removeArray("seminars",i)} render={(item:any,i: number)=><div className="grid gap-2 sm:grid-cols-2"><input value={item.title||""} onChange={(e)=>updateArray("seminars",i,{title:e.target.value})} placeholder="عنوان سمینار" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><input value={item.date||""} onChange={(e)=>updateArray("seminars",i,{date:e.target.value})} placeholder="تاریخ برگزاری" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><input value={item.subject||""} onChange={(e)=>updateArray("seminars",i,{subject:e.target.value})} placeholder="موضوع" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><input type="number" value={item.participants||""} onChange={(e)=>updateArray("seminars",i,{participants:e.target.value})} placeholder="تعداد شرکت‌کنندگان" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><textarea value={item.description||""} onChange={(e)=>updateArray("seminars",i,{description:e.target.value})} placeholder="توضیحات" className="sm:col-span-2 rounded-[9px] bg-white/90 p-3 text-xs text-slate-900"/></div>} />
        <Collection title="افتخارات و فعالیت‌ها" icon={<Award className="h-5 w-5 text-fuchsia-300" />} items={data.declaration.honors} onAdd={()=>addArray("honors",{...emptyHonor})} onRemove={(i: number)=>removeArray("honors",i)} render={(item:any,i: number)=><div className="grid gap-2 sm:grid-cols-3"><input value={item.title||""} onChange={(e)=>updateArray("honors",i,{title:e.target.value})} placeholder="عنوان افتخار" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><input value={item.year||""} onChange={(e)=>updateArray("honors",i,{year:e.target.value})} placeholder="سال دریافت" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/><input value={item.issuer||""} onChange={(e)=>updateArray("honors",i,{issuer:e.target.value})} placeholder="مرجع صادرکننده" className="rounded-[9px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900"/></div>} />

        <section className="rounded-[20px] border border-white/10 bg-[#111a2e] p-5"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-black"><Upload className="h-5 w-5 text-emerald-300" /> تصاویر و مستندات</h3><label className="cursor-pointer rounded-[10px] bg-primary-600 px-4 py-2 text-[10px] font-black">انتخاب فایل<input type="file" accept="image/*,.pdf" className="hidden" onChange={(e)=>e.target.files?.[0]&&addDocument(e.target.files[0],e.target.files[0].type.includes("pdf")?"pdf":"image")} /></label></div><div className="space-y-2">{(data.declaration.documents||[]).map((doc:any,i:number)=><div key={i} className="flex items-center gap-3 rounded-xl bg-black/20 p-3"><FileText className="h-4 w-4 text-cyan-300"/><span className="min-w-0 flex-1 truncate text-xs">{doc.name}</span><button onClick={()=>removeArray("documents",i)} className="text-red-400"><Trash2 className="h-4 w-4"/></button></div>)}{!data.declaration.documents?.length&&<div className="py-5 text-center text-xs text-slate-500">هنوز مستندی بارگذاری نشده است.</div>}</div></section>
      </fieldset>

      {!locked && <div className="sticky bottom-20 z-20 flex gap-2 rounded-[16px] border border-white/10 bg-[#071426]/95 p-3 shadow-2xl backdrop-blur"><button onClick={()=>save("save")} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-white/10 py-3 text-xs font-black"><Save className="h-4 w-4"/> ذخیره پیش‌نویس</button><button onClick={()=>save("submit")} disabled={saving} className="flex flex-[1.4] items-center justify-center gap-2 rounded-[12px] bg-emerald-500 py-3 text-xs font-black text-slate-950">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Send className="h-4 w-4"/>} ارسال برای بررسی کارشناس</button></div>}
    </div>
  );
}

function Collection({ title, icon, items = [], onAdd, onRemove, render }: any) {
  return <section className="rounded-[20px] border border-white/10 bg-[#111a2e] p-5"><div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-black">{icon}{title}</h3><button type="button" onClick={onAdd} className="flex items-center gap-1 rounded-[9px] bg-primary-600 px-3 py-2 text-[10px] font-black"><Plus className="h-3.5 w-3.5"/> افزودن</button></div><div className="space-y-3">{items.map((item:any,index:number)=><div key={index} className="relative rounded-[14px] border border-white/10 bg-[#0B1120] p-4"><button type="button" onClick={()=>onRemove(index)} className="absolute left-2 top-2 text-red-400"><Trash2 className="h-4 w-4"/></button>{render(item,index)}</div>)}{items.length===0&&<div className="py-6 text-center text-xs text-slate-500">موردی ثبت نشده است.</div>}</div></section>;
}
