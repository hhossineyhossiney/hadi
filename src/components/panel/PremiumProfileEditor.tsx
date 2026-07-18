"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Eye,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Users,
  Video,
} from "lucide-react";
import type { AdvancedInstituteProfile } from "@/lib/advanced-institute-profile";

type Lead = {
  id: number;
  type: string;
  full_name: string;
  phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  advisor: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  course_title: string | null;
};

type Field = { key: string; label: string; type?: "text" | "textarea" | "image" | "video" };

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function MediaInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const select = (file: File) => {
    if (file.size > 900_000) { alert("حجم تصویر باید کمتر از ۹۰۰ کیلوبایت باشد"); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <label className="mb-1 block text-[10px] font-black text-slate-400">{label}</label>
      {value && <img src={value} alt="پیش‌نمایش" className="mb-2 h-28 w-full rounded-[10px] border border-white/10 object-cover" />}
      <div className="flex gap-2">
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="آدرس تصویر یا فایل آپلودی" dir="ltr" className="min-w-0 flex-1 rounded-[9px] bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-900" />
        <label className="flex cursor-pointer items-center gap-1 rounded-[9px] bg-primary-600 px-3 py-2 text-[10px] font-black text-white"><ImagePlus className="h-3.5 w-3.5" /> انتخاب<input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && select(event.target.files[0])} /></label>
      </div>
    </div>
  );
}

function CollectionEditor({ title, description, items, fields, onChange, newItem }: { title: string; description: string; items: any[]; fields: Field[]; onChange: (items: any[]) => void; newItem: () => any }) {
  const [open, setOpen] = useState<number | null>(items.length ? 0 : null);
  const update = (index: number, key: string, value: unknown) => onChange(items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value, isSample: false } : item));
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div><h3 className="text-sm font-black text-white">{title}</h3><p className="mt-1 text-[9px] leading-5 text-slate-500">{description}</p></div>
        <button type="button" onClick={() => { const next = [...items, newItem()]; onChange(next); setOpen(next.length - 1); }} className="flex shrink-0 items-center gap-1 rounded-[9px] bg-emerald-600 px-3 py-2 text-[10px] font-black text-white"><Plus className="h-3.5 w-3.5" /> افزودن</button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id || index} className="overflow-hidden rounded-[12px] border border-white/10 bg-[#0B1120]">
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button type="button" onClick={() => setOpen(open === index ? null : index)} className="flex flex-1 items-center gap-2 text-right"><ChevronDown className={`h-4 w-4 text-slate-500 transition ${open === index ? "rotate-180" : ""}`} /><span className="flex-1 truncate text-[11px] font-black text-white">{item.title || item.name || item.question || `مورد ${index + 1}`}</span>{item.isSample && <span className="rounded-full bg-violet-500/10 px-2 py-1 text-[8px] font-black text-violet-300">نمونه</span>}</button>
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="rounded-[7px] bg-rose-500/10 p-1.5 text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            {open === index && (
              <div className="grid gap-3 border-t border-white/10 p-3 md:grid-cols-2">
                {fields.map((field) => field.type === "image" ? (
                  <div key={field.key} className="md:col-span-2"><MediaInput value={String(item[field.key] || "")} onChange={(value) => update(index, field.key, value)} label={field.label} /></div>
                ) : field.type === "textarea" ? (
                  <div key={field.key} className="md:col-span-2"><label className="mb-1 block text-[10px] font-black text-slate-400">{field.label}</label><textarea value={item[field.key] || ""} onChange={(event) => update(index, field.key, event.target.value)} rows={3} className="w-full resize-none rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>
                ) : (
                  <div key={field.key}><label className="mb-1 block text-[10px] font-black text-slate-400">{field.label}</label><input value={item[field.key] || ""} onChange={(event) => update(index, field.key, event.target.value)} dir={field.type === "video" ? "ltr" : undefined} className="w-full rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>
                ))}
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="rounded-[10px] border border-dashed border-white/10 py-7 text-center text-[10px] text-slate-500">موردی ثبت نشده است.</div>}
      </div>
    </div>
  );
}

const tabs = [
  { key: "hero", label: "هدر و معرفی", icon: Building2 },
  { key: "content", label: "مزایا و امکانات", icon: Sparkles },
  { key: "media", label: "رسانه و موفقیت", icon: Video },
  { key: "trust", label: "اعتبار و محتوا", icon: Award },
  { key: "quality", label: "کیفیت و مشاوره", icon: Star },
  { key: "leads", label: "درخواست‌ها", icon: ClipboardList },
] as const;

export default function PremiumProfileEditor() {
  const [profile, setProfile] = useState<AdvancedInstituteProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => fetch("/api/manager/premium-profile", { cache: "no-store" }).then((response) => response.json()).then((data) => { setProfile(data.profile); setLeads(data.leads || []); setLoading(false); });
  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!profile) return;
    setSaving(true); setMessage("");
    const response = await fetch("/api/manager/premium-profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? "✅ پروفایل حرفه‌ای آموزشگاه ذخیره شد" : `❌ ${data.error || "ذخیره انجام نشد"}`);
    if (response.ok) setProfile(data.profile);
  };

  const updateLead = async (leadId: number, status: string) => {
    await fetch("/api/manager/premium-profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, status }) });
    load();
  };

  const leadStats = useMemo(() => ({ all: leads.length, fresh: leads.filter((lead) => lead.status === "new").length }), [leads]);

  if (loading || !profile) return <div className="rounded-[18px] border border-white/10 bg-[#111a2e] py-16 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" /></div>;

  const set = <K extends keyof AdvancedInstituteProfile>(key: K, value: AdvancedInstituteProfile[K]) => setProfile({ ...profile, [key]: value });

  return (
    <section className="overflow-hidden rounded-[22px] border border-fuchsia-500/20 bg-gradient-to-br from-[#15132d] to-[#0d1729]">
      <div className="border-b border-white/10 p-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div><div className="mb-1 flex items-center gap-2"><Sparkles className="h-5 w-5 text-fuchsia-300" /><h2 className="text-lg font-black text-white">سازنده صفحه حرفه‌ای آموزشگاه</h2></div><p className="text-[10px] leading-5 text-slate-400">کنترل هدر، معرفی، نمونه‌کار، موفقیت‌ها، اخبار، گواهینامه‌ها، شرکا، کیفیت و رزرو مشاوره. موارد نمونه برچسب دارند و قابل ویرایش یا حذف هستند.</p></div>
          <div className="flex gap-2"><a href="/institutes" target="_blank" className="flex items-center gap-1 rounded-[10px] bg-white/5 px-3 py-2.5 text-[10px] font-black text-slate-300"><Eye className="h-4 w-4" /> مشاهده عمومی</a><button type="button" onClick={save} disabled={saving} className="flex items-center gap-2 rounded-[10px] bg-gradient-to-l from-fuchsia-500 to-purple-600 px-4 py-2.5 text-xs font-black text-white disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره همه</button></div>
        </div>
        {message && <div className="mt-3 rounded-[9px] bg-white/5 p-3 text-xs font-bold text-slate-200">{message}</div>}
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-3 [scrollbar-width:none]">
        {tabs.map((item) => <button key={item.key} type="button" onClick={() => setTab(item.key)} className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-black ${tab === item.key ? "bg-fuchsia-500 text-white" : "bg-white/5 text-slate-400"}`}><item.icon className="h-3.5 w-3.5" />{item.label}{item.key === "leads" && leadStats.fresh > 0 && <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[8px]">{leadStats.fresh}</span>}</button>)}
      </div>

      <div className="space-y-4 p-4 md:p-5">
        {tab === "hero" && <>
          <div className="grid gap-4 rounded-[18px] border border-white/10 bg-[#111a2e] p-4 md:grid-cols-2">
            <div className="md:col-span-2"><label className="mb-1 block text-[10px] font-black text-slate-400">شعار آموزشگاه</label><input value={profile.slogan} onChange={(event) => set("slogan", event.target.value)} className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-sm font-bold text-slate-900" /></div>
            <div className="md:col-span-2"><MediaInput value={profile.coverImage} onChange={(value) => set("coverImage", value)} label="کاور عریض هدر" /></div>
            <div><label className="mb-1 block text-[10px] font-black text-slate-400">لینک ویدئوی معرفی</label><input value={profile.introVideoUrl} onChange={(event) => set("introVideoUrl", event.target.value)} dir="ltr" className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900" /></div>
            <div><label className="mb-1 block text-[10px] font-black text-slate-400">لینک تور مجازی</label><input value={profile.virtualTourUrl} onChange={(event) => set("virtualTourUrl", event.target.value)} dir="ltr" className="w-full rounded-[10px] bg-white/90 px-3 py-2.5 text-xs font-bold text-slate-900" /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">{[["historicalStudents", "کل هنرجویان سابق"], ["graduateCount", "فارغ‌التحصیلان"], ["employmentCount", "هنرجویان استخدام‌شده"]].map(([key, label]) => <div key={key} className="rounded-[14px] border border-white/10 bg-[#111a2e] p-3"><label className="mb-1 block text-[10px] font-black text-slate-400">{label}</label><input type="number" min="0" value={(profile as any)[key] || 0} onChange={(event) => setProfile({ ...profile, [key]: Number(event.target.value) })} className="w-full rounded-[9px] bg-white/90 px-3 py-2 text-sm font-bold text-slate-900" /></div>)}</div>
          <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4 space-y-3">{[["history", "تاریخچه"], ["mission", "ماموریت"], ["vision", "چشم‌انداز"]].map(([key, label]) => <div key={key}><label className="mb-1 block text-[10px] font-black text-slate-400">{label}</label><textarea value={(profile as any)[key] || ""} onChange={(event) => setProfile({ ...profile, [key]: event.target.value })} rows={3} className="w-full resize-none rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>)}</div>
          <div className="grid gap-3 rounded-[18px] border border-white/10 bg-[#111a2e] p-4 md:grid-cols-3">{(["whatsapp", "telegram", "instagram"] as const).map((key) => <div key={key}><label className="mb-1 block text-[10px] font-black text-slate-400">{key === "whatsapp" ? "واتساپ" : key === "telegram" ? "تلگرام" : "اینستاگرام"}</label><input value={profile.social[key]} onChange={(event) => set("social", { ...profile.social, [key]: event.target.value })} dir="ltr" className="w-full rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>)}</div>
        </>}

        {tab === "content" && <>
          <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4"><label className="mb-1 block text-[10px] font-black text-slate-400">مزیت‌های رقابتی — هر خط یک مورد</label><textarea value={profile.advantages.join("\n")} onChange={(event) => set("advantages", event.target.value.split("\n").filter(Boolean))} rows={6} className="w-full resize-none rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>
          <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-black text-white">امکانات آموزشگاه</h3><p className="mt-1 text-[9px] text-slate-500">پارکینگ، اینترنت، آزمایشگاه، کتابخانه و هر امکان دیگری را اضافه کنید.</p></div><button type="button" onClick={() => set("facilities", [...profile.facilities, { id: uid("facility"), name: "امکان جدید", available: true }])} className="rounded-[8px] bg-emerald-600 px-3 py-2 text-[10px] font-black text-white"><Plus className="inline h-3.5 w-3.5" /> افزودن</button></div><div className="space-y-2">{profile.facilities.map((facility, index) => <div key={facility.id} className="flex flex-wrap items-center gap-2 rounded-[10px] bg-[#0B1120] p-2"><input type="checkbox" checked={facility.available} onChange={(event) => set("facilities", profile.facilities.map((item, itemIndex) => itemIndex === index ? { ...item, available: event.target.checked, isSample: false } : item))} /><input value={facility.name} onChange={(event) => set("facilities", profile.facilities.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value, isSample: false } : item))} className="min-w-[160px] flex-1 rounded-[8px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /><input value={facility.note || ""} onChange={(event) => set("facilities", profile.facilities.map((item, itemIndex) => itemIndex === index ? { ...item, note: event.target.value, isSample: false } : item))} placeholder="توضیح" className="min-w-[160px] flex-1 rounded-[8px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /><button type="button" onClick={() => set("facilities", profile.facilities.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-rose-300"><Trash2 className="h-4 w-4" /></button></div>)}</div></div>
          <div className="grid gap-3 rounded-[18px] border border-white/10 bg-[#111a2e] p-4 md:grid-cols-2">{(["parking", "bus", "metro", "distance"] as const).map((key) => <div key={key}><label className="mb-1 block text-[10px] font-black text-slate-400">{key === "parking" ? "پارکینگ" : key === "bus" ? "ایستگاه اتوبوس" : key === "metro" ? "مترو" : "فاصله و دسترسی"}</label><input value={profile.locationDetails[key]} onChange={(event) => set("locationDetails", { ...profile.locationDetails, [key]: event.target.value })} className="w-full rounded-[9px] bg-white/90 px-3 py-2 text-xs font-bold text-slate-900" /></div>)}</div>
        </>}

        {tab === "media" && <>
          <CollectionEditor title="نمونه‌کار هنرجویان" description="تصویر، ویدئو، پروژه، قبل و بعد و پشت صحنه کلاس" items={profile.portfolio} onChange={(items) => set("portfolio", items)} newItem={() => ({ id: uid("portfolio"), title: "نمونه‌کار جدید", description: "", image: "", video: "", kind: "project" })} fields={[{ key: "title", label: "عنوان" }, { key: "kind", label: "نوع" }, { key: "description", label: "توضیحات", type: "textarea" }, { key: "image", label: "تصویر", type: "image" }, { key: "video", label: "لینک ویدئو", type: "video" }]} />
          <CollectionEditor title="موفقیت هنرجویان" description="استخدام، درآمد، مصاحبه و راه‌اندازی کسب‌وکار" items={profile.successStories} onChange={(items) => set("successStories", items)} newItem={() => ({ id: uid("success"), name: "نام هنرجو", title: "عنوان موفقیت", story: "", image: "", video: "", result: "" })} fields={[{ key: "name", label: "نام هنرجو" }, { key: "title", label: "عنوان" }, { key: "result", label: "نتیجه" }, { key: "story", label: "داستان", type: "textarea" }, { key: "image", label: "تصویر", type: "image" }, { key: "video", label: "لینک ویدئو", type: "video" }]} />
        </>}

        {tab === "trust" && <>
          <CollectionEditor title="اخبار و رویدادها" description="ثبت‌نام، تخفیف، جشنواره، سمینار و خبر" items={profile.news} onChange={(items) => set("news", items)} newItem={() => ({ id: uid("news"), title: "خبر جدید", summary: "", date: "", kind: "news", image: "" })} fields={[{ key: "title", label: "عنوان" }, { key: "kind", label: "نوع" }, { key: "date", label: "تاریخ" }, { key: "summary", label: "خلاصه", type: "textarea" }, { key: "image", label: "تصویر", type: "image" }]} />
          <CollectionEditor title="سوالات متداول" description="مدرک، شهریه، اقساط، بازار کار و ثبت‌نام" items={profile.faqs} onChange={(items) => set("faqs", items)} newItem={() => ({ id: uid("faq"), question: "سوال جدید", answer: "" })} fields={[{ key: "question", label: "سوال" }, { key: "answer", label: "پاسخ", type: "textarea" }]} />
          <CollectionEditor title="مجوزها و افتخارات" description="گواهینامه‌ها، لوح‌ها، پروانه فعالیت و افتخارات" items={profile.certificates} onChange={(items) => set("certificates", items)} newItem={() => ({ id: uid("certificate"), title: "مجوز جدید", issuer: "", year: "", image: "" })} fields={[{ key: "title", label: "عنوان" }, { key: "issuer", label: "صادرکننده" }, { key: "year", label: "سال" }, { key: "image", label: "تصویر", type: "image" }]} />
          <CollectionEditor title="شرکت‌ها و مجموعه‌های همکار" description="لوگو و لینک همکاران واقعی بازار کار" items={profile.partners} onChange={(items) => set("partners", items)} newItem={() => ({ id: uid("partner"), name: "همکار جدید", logo: "", url: "" })} fields={[{ key: "name", label: "نام" }, { key: "url", label: "لینک" }, { key: "logo", label: "لوگو", type: "image" }]} />
        </>}

        {tab === "quality" && <>
          <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4"><h3 className="mb-4 text-sm font-black text-white">نمودار کیفیت</h3><div className="space-y-4">{(["education", "satisfaction", "jobMarket", "passRate", "employment"] as const).map((key) => { const labels = { education: "کیفیت آموزش", satisfaction: "رضایت هنرجویان", jobMarket: "آمادگی بازار کار", passRate: "قبولی", employment: "استخدام" }; return <div key={key}><div className="mb-1 flex items-center justify-between text-[10px]"><span className="font-bold text-slate-300">{labels[key]}</span><b className="text-fuchsia-300">{profile.quality[key]}٪</b></div><input type="range" min="0" max="100" value={profile.quality[key]} onChange={(event) => set("quality", { ...profile.quality, [key]: Number(event.target.value), isSample: false })} className="w-full" /></div>; })}</div></div>
          <CollectionEditor title="مشاوران و زمان‌های رزرو" description="نام، تخصص، روزها و ساعت پاسخ‌گویی" items={profile.advisors} onChange={(items) => set("advisors", items)} newItem={() => ({ id: uid("advisor"), name: "مشاور جدید", specialty: "", image: "", days: "", hours: "" })} fields={[{ key: "name", label: "نام" }, { key: "specialty", label: "تخصص" }, { key: "days", label: "روزها" }, { key: "hours", label: "ساعت‌ها" }, { key: "image", label: "تصویر", type: "image" }]} />
        </>}

        {tab === "leads" && <div className="rounded-[18px] border border-white/10 bg-[#111a2e] p-4"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-black text-white">درخواست‌های ثبت‌نام سریع و مشاوره</h3><p className="mt-1 text-[9px] text-slate-500">{leadStats.all.toLocaleString("fa-IR")} درخواست • {leadStats.fresh.toLocaleString("fa-IR")} جدید</p></div><Users className="h-6 w-6 text-primary-300" /></div><div className="space-y-2">{leads.map((lead) => <div key={lead.id} className="rounded-[12px] border border-white/10 bg-[#0B1120] p-3"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="flex items-center gap-2"><b className="text-xs text-white">{lead.full_name}</b><span className={`rounded-full px-2 py-1 text-[8px] font-black ${lead.type === "consultation" ? "bg-violet-500/15 text-violet-300" : "bg-emerald-500/15 text-emerald-300"}`}>{lead.type === "consultation" ? "مشاوره" : "ثبت‌نام سریع"}</span></div><div className="mt-1 text-[10px] text-slate-500" dir="ltr">{lead.phone}</div><div className="mt-1 text-[9px] text-slate-500">{lead.course_title || lead.advisor || "—"} {lead.preferred_date ? `• ${lead.preferred_date}` : ""} {lead.preferred_time ? `• ${lead.preferred_time}` : ""}</div></div><select value={lead.status} onChange={(event) => updateLead(lead.id, event.target.value)} className="h-fit rounded-[8px] bg-white/90 px-3 py-2 text-[10px] font-bold text-slate-900"><option value="new">جدید</option><option value="contacted">تماس گرفته شد</option><option value="scheduled">زمان‌بندی شد</option><option value="completed">تکمیل شد</option><option value="cancelled">لغو شد</option></select></div></div>)}{leads.length === 0 && <div className="py-10 text-center text-xs text-slate-500"><MessageCircle className="mx-auto mb-2 h-7 w-7" />هنوز درخواستی ثبت نشده است.</div>}</div></div>}
      </div>
    </section>
  );
}
