"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, Plus, X, ShieldCheck, Award, Building2 } from "lucide-react";

interface Institute {
  id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  mobile: string | null;
  managerName: string | null;
  managerTitle: string | null;
  licenseNumber: string | null;
  establishedYear: string | null;
  features: string[];
  isYearAward: boolean;
  isVerified: boolean;
}

export default function InstituteProfileForm({ institute, refresh }: { institute: Institute; refresh: () => void }) {
  const [form, setForm] = useState({
    description: institute.description || "",
    address: institute.address || "",
    phone: institute.phone || "",
    mobile: institute.mobile || "",
    managerName: institute.managerName || "",
    managerTitle: institute.managerTitle || "",
    licenseNumber: institute.licenseNumber || "",
    establishedYear: institute.establishedYear || "",
    features: institute.features || [],
  });
  const [featInput, setFeatInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setForm({
      description: institute.description || "",
      address: institute.address || "",
      phone: institute.phone || "",
      mobile: institute.mobile || "",
      managerName: institute.managerName || "",
      managerTitle: institute.managerTitle || "",
      licenseNumber: institute.licenseNumber || "",
      establishedYear: institute.establishedYear || "",
      features: institute.features || [],
    });
  }, [institute]);

  const save = async () => {
    setSaving(true); setMsg(null);
    const res = await fetch("/api/manager", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateProfile", ...form }),
    });
    setSaving(false);
    const d = await res.json();
    if (res.ok) {
      setMsg({ type: "ok", text: "✅ اطلاعات با موفقیت ذخیره شد" });
      refresh();
    } else setMsg({ type: "err", text: "❌ " + (d.error || "خطا در ذخیره") });
  };

  const addFeature = () => {
    if (!featInput.trim()) return;
    setForm({ ...form, features: [...form.features, featInput.trim()] });
    setFeatInput("");
  };
  const removeFeature = (i: number) =>
    setForm({ ...form, features: form.features.filter((_, j) => j !== i) });

  return (
    <div className="bg-[#111a2e] border border-white/10 rounded-[20px] p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-primary-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white">اطلاعات کامل آموزشگاه</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              این اطلاعات روی کارت آموزشگاه در صفحه اصلی نمایش داده می‌شود.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {institute.isVerified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
              <ShieldCheck className="w-3 h-3" /> تأیید شده
            </span>
          )}
          {institute.isYearAward && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black">
              <Award className="w-3 h-3" /> برگزیده سال
            </span>
          )}
        </div>
      </div>

      {msg && (
        <div className={`p-3 rounded-[10px] text-xs font-bold ${
          msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"
        }`}>{msg.text}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">👤 نام مدیر آموزشگاه</label>
          <input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })}
            placeholder="مثل: علیرضا رضایی"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
          <p className="text-[10px] text-slate-500 mt-1">این نام روی کارت آموزشگاه در بخش «مدیریت» نمایش داده می‌شود.</p>
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">🎓 عنوان مدیر</label>
          <input value={form.managerTitle} onChange={(e) => setForm({ ...form, managerTitle: e.target.value })}
            placeholder="مثل: مهندس / استاد / سرکار خانم / دکتر"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">📜 شماره مجوز رسمی</label>
          <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            placeholder="1402/12/8945" dir="ltr"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
          <p className="text-[10px] text-slate-500 mt-1">شماره پروانه فعالیت رسمی از سازمان فنی و حرفه‌ای.</p>
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">📅 سال تأسیس</label>
          <input value={form.establishedYear} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })}
            placeholder="1400"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">📱 موبایل</label>
          <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            dir="ltr" placeholder="09159999999"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
        </div>
        <div>
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">☎️ تلفن ثابت</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            dir="ltr" placeholder="05142224500"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">📍 آدرس کامل</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] font-black text-slate-400 mb-1.5 block">📝 توضیحات آموزشگاه</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} placeholder="یک معرفی کوتاه از آموزشگاه که روی کارت نمایش داده می‌شود."
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600 resize-none" />
        </div>
      </div>

      {/* Features editor */}
      <div>
        <label className="text-[11px] font-black text-slate-400 mb-2 block">
          ⭐ ویژگی‌های کلیدی آموزشگاه
          <span className="text-slate-600 font-normal mr-1">— این ویژگی‌ها با تیک سبز روی کارت نمایش داده می‌شود</span>
        </label>
        <div className="flex gap-2 mb-3">
          <input value={featInput} onChange={(e) => setFeatInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            placeholder="مثال: سایت کامپیوتری مجهز به سیستم‌های نسل جدید"
            className="flex-1 px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
          <button type="button" onClick={addFeature}
            className="px-4 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black cursor-pointer flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> افزودن
          </button>
        </div>
        <div className="space-y-2">
          {form.features.map((f, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#0B1120] rounded-[10px] px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">✓</div>
              <span className="flex-1 text-sm text-white">{f}</span>
              <button onClick={() => removeFeature(i)} className="text-error-400 hover:text-error-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {form.features.length === 0 && (
            <div className="text-center py-4 text-[11px] text-slate-600 bg-[#0B1120] rounded-[10px]">
              هنوز ویژگی‌ای اضافه نشده. دو ویژگی برتر آموزشگاه‌تان را وارد کنید.
            </div>
          )}
        </div>
      </div>

      <button onClick={save} disabled={saving}
        className="w-full py-3 rounded-[12px] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-black cursor-pointer flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        ذخیره تغییرات پروفایل
      </button>
    </div>
  );
}
