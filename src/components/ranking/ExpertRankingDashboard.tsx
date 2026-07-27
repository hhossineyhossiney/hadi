"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Award, Building2, CheckCircle2, ClipboardCheck, FileText, Loader2, LogOut, RefreshCw, Save, Users, Wrench } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import ExpertRankingControlPanel from "@/components/ranking/ExpertRankingControlPanel";

function statusText(status: string) { return ({ submitted: "منتظر بررسی", under_review: "در حال بررسی", needs_correction: "نیازمند اصلاح", approved: "تاییدشده", published: "منتشرشده" } as any)[status] || status; }

export default function ExpertRankingDashboard() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const [list, setList] = useState<any>(null), [selected, setSelected] = useState<any>(null), [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [msg, setMsg] = useState("");
  const [view, setView] = useState<"cases" | "control">("cases");
  const load = () => { setLoading(true); fetch("/api/ranking/expert").then(async r => { const d=await r.json(); if(!r.ok) throw new Error(d.error); setList(d); }).catch(e=>setMsg(`❌ ${e.message}`)).finally(()=>setLoading(false)); };
  useEffect(() => {
    fetch("/api/ranking/expert")
      .then(async (response) => { const value = await response.json(); if (!response.ok) throw new Error(value.error); setList(value); })
      .catch((error) => setMsg(`❌ ${error.message}`))
      .finally(() => setLoading(false));
  }, []);
  const open = (item:any) => fetch(`/api/ranking/expert?academyId=${item.academy_id}&year=${item.year}`).then(r=>r.json()).then((d)=>setSelected({ ...d, academyId:item.academy_id, academyName:item.academy_name, strengths:d.ranking.strengths||[], improvements:d.ranking.improvements||[] }));
  const updateScore = (code:string, patch:any) => setSelected((d:any)=>({...d,scores:d.scores.map((s:any)=>s.code===code?{...s,...patch}:s)}));
  const save = async (nextStatus:string) => { setSaving(true); setMsg(""); const r=await fetch("/api/ranking/expert",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({academyId:selected.academyId,year:selected.year,status:nextStatus,scores:selected.scores,strengths:selected.strengths,improvements:selected.improvements})}); const d=await r.json(); setSaving(false); if(!r.ok)return setMsg(`❌ ${d.error}`); setMsg("✅ ارزیابی ذخیره شد"); setSelected(null); load(); };

  if(status==="loading"||loading)return <div className="flex min-h-screen items-center justify-center bg-[#071426]"><Loader2 className="h-9 w-9 animate-spin text-cyan-300"/></div>;
  if(!user||user.role!=="expert")return <div className="min-h-screen bg-[#071426] p-10 text-center text-white"><p>دسترسی این سامانه فقط در اختیار کارشناس رتبه‌بندی است.</p><Link href="/login?callbackUrl=/expert" className="mt-4 inline-block rounded-xl bg-cyan-500 px-5 py-3 text-slate-950">ورود کارشناس</Link></div>;

  return <main className="min-h-screen bg-[#071426] text-white">
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071426]/95 px-4 py-4 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between"><div><h1 className="flex items-center gap-2 text-xl font-black"><ClipboardCheck className="h-6 w-6 text-cyan-300"/> داشبورد کارشناسان رتبه‌بندی</h1><p className="mt-1 text-[10px] text-slate-400">{user.name} • ارزیابی هوشمند آموزشگاه‌ها</p></div><div className="flex gap-2"><button onClick={()=>{setView("cases");setSelected(null)}} className={`rounded-lg px-3 py-2 text-[10px] font-black ${view==="cases"?"bg-cyan-500 text-slate-950":"bg-white/5"}`}>پرونده‌های ارزیابی</button><button onClick={()=>{setView("control");setSelected(null)}} className={`rounded-lg px-3 py-2 text-[10px] font-black ${view==="control"?"bg-emerald-500 text-slate-950":"bg-white/5"}`}>انتشار و اعتبار رتبه‌ها</button><button onClick={()=>signOut({callbackUrl:"/"})} className="rounded-lg bg-red-500/10 p-2 text-red-300"><LogOut className="h-4 w-4"/></button></div></div></header>
    <div className="mx-auto max-w-7xl p-4 sm:p-6">
      {view === "control" ? <ExpertRankingControlPanel /> : <>
      {msg&&<div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">{msg}</div>}
      {!selected?<>
        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["منتظر بررسی",list?.stats?.waiting,Users,"text-amber-300"],["بررسی‌شده",list?.stats?.reviewed,ClipboardCheck,"text-cyan-300"],["تاییدشده",list?.stats?.approved,CheckCircle2,"text-emerald-300"],["نیازمند اصلاح",list?.stats?.needsCorrection,Wrench,"text-rose-300"]].map(([label,value,Icon,color]:any)=><div key={label} className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4"><Icon className={`mb-3 h-6 w-6 ${color}`}/><div className="text-2xl font-black">{Number(value||0).toLocaleString("fa-IR")}</div><div className="text-[10px] text-slate-400">{label}</div></div>)}</div>
        <div className="overflow-x-auto rounded-[18px] border border-white/10 bg-[#111a2e]"><table className="w-full min-w-[720px] text-xs"><thead><tr className="border-b border-white/10 text-right text-[10px] text-slate-500"><th className="p-4">آموزشگاه</th><th>شهر</th><th>سال</th><th>تاریخ ارسال</th><th>وضعیت</th><th>امتیاز فعلی</th><th>عملیات</th></tr></thead><tbody>{(list?.items||[]).map((item:any)=><tr key={`${item.id}-${item.academy_id}`} className="border-b border-white/5"><td className="p-4 font-black">{item.academy_name}</td><td>{item.city||"—"}</td><td>{item.year}</td><td>{item.submitted_at?new Date(item.submitted_at).toLocaleDateString("fa-IR"):"—"}</td><td><span className="rounded-full bg-cyan-500/10 px-2 py-1 text-cyan-200">{statusText(item.status)}</span></td><td>{Number(item.score||0)} / ۱۰۰</td><td><button onClick={()=>open(item)} className="rounded-lg bg-primary-600 px-3 py-2 font-black">بازکردن پرونده</button></td></tr>)}{!(list?.items||[]).length&&<tr><td colSpan={7} className="p-12 text-center text-slate-500">پرونده‌ای برای بررسی وجود ندارد.</td></tr>}</tbody></table></div>
      </>:<RankingReview data={selected} setData={setSelected} updateScore={updateScore} save={save} saving={saving} onBack={()=>setSelected(null)}/>} 
      </>}
    </div>
  </main>;
}

function RankingReview({data,setData,updateScore,save,saving,onBack}:any){
  const m=data.metrics||{},d=data.declaration||{};
  const total=data.scores.reduce((s:number,x:any)=>s+Number(x.expertScore??x.systemScore??0),0);
  return <div className="space-y-5"><div className="flex items-center justify-between"><div><button onClick={onBack} className="mb-2 text-xs text-cyan-300">← بازگشت</button><h2 className="text-2xl font-black">پرونده {data.academyName||m.name}</h2><p className="text-xs text-slate-400">سال {data.year} • امتیاز لحظه‌ای {total.toFixed(2)} از ۱۰۰</p></div><div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-cyan-400/20 text-xl font-black">{Math.round(total)}</div></div>
    <section className="rounded-[18px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-3 font-black text-cyan-200">اطلاعات سیستمی</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{[["هنرجو",m.totalStudents],["مدرک",m.certifiedStudents],["آزمون",m.examsTaken],["قبولی",m.passed],["درصد قبولی",`${m.passRate}٪`],["سابقه",`${m.activityYears} سال`],["دوره",m.coursesHeld],["رشته",m.activeFields]].map(([l,v])=><div key={l as string} className="rounded-lg bg-black/20 p-3"><div className="text-[9px] text-slate-500">{l}</div><div className="mt-1 font-black">{String(v)}</div></div>)}</div></section>
    <SelfDeclarationView declaration={d} />
    <section className="rounded-[18px] border border-white/10 bg-[#111a2e] p-5"><h3 className="mb-4 font-black text-amber-200">امتیازدهی کارشناس</h3><div className="space-y-3">{data.scores.map((score:any)=><div key={score.code} className="rounded-xl border border-white/10 bg-[#0B1120] p-4"><div className="mb-3 flex items-center justify-between"><div><div className="font-black">{score.title}</div><div className="text-[9px] text-slate-500">پیشنهاد سیستم: {score.systemScore} • حداکثر {score.maxScore}</div></div><input type="number" min="0" max={score.maxScore} step="0.25" value={score.expertScore??score.systemScore} onChange={(e)=>updateScore(score.code,{expertScore:e.target.value})} className="w-24 rounded-lg bg-white px-3 py-2 text-center text-lg font-black text-slate-900"/></div><div className="grid gap-2 sm:grid-cols-2"><textarea value={score.comment||""} onChange={(e)=>updateScore(score.code,{comment:e.target.value})} placeholder="توضیح کارشناس" rows={2} className="rounded-lg bg-white/90 p-2 text-xs text-slate-900"/><textarea value={score.deductionReason||""} onChange={(e)=>updateScore(score.code,{deductionReason:e.target.value})} placeholder="دلیل کاهش امتیاز" rows={2} className="rounded-lg bg-white/90 p-2 text-xs text-slate-900"/></div></div>)}</div></section>
    <div className="grid gap-3 sm:grid-cols-2"><ListEditor title="نقاط قوت" value={data.strengths} onChange={(value: string[])=>setData({...data,strengths:value})}/><ListEditor title="موارد قابل بهبود" value={data.improvements} onChange={(value: string[])=>setData({...data,improvements:value})}/></div>
    <div className="sticky bottom-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#071426]/95 p-3 shadow-2xl"><button onClick={()=>save("under_review")} disabled={saving} className="flex-1 rounded-xl bg-white/10 py-3 text-xs font-black"><Save className="ml-1 inline h-4 w-4"/>ذخیره بررسی</button><button onClick={()=>save("needs_correction")} disabled={saving} className="flex-1 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950">نیازمند اصلاح</button><button onClick={()=>save("approved")} disabled={saving} className="flex-1 rounded-xl bg-emerald-500 py-3 text-xs font-black text-slate-950">تایید و انتشار رتبه</button></div>
  </div>;
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
    <section className="overflow-hidden rounded-[22px] border border-emerald-400/20 bg-gradient-to-br from-[#0d3457] to-[#081f39] shadow-[0_22px_65px_rgba(0,0,0,0.22)]">
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

function ListEditor({title,value=[],onChange}:any){return <label className="text-xs font-black text-slate-300">{title}<textarea value={value.join("\n")} onChange={(e)=>onChange(e.target.value.split("\n").map((x: string)=>x.trim()).filter(Boolean))} rows={5} className="mt-2 w-full rounded-xl bg-white/90 p-3 text-xs text-slate-900" placeholder="هر مورد در یک خط"/></label>}
