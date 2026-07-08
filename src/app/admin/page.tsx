"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  LayoutDashboard, Building2, Users2, ClipboardList, Wallet, Settings2, Send,
  Loader2, Phone, Lock, ShieldCheck, Eye, EyeOff, LogOut, Plus, Trash2, Ban,
  CheckCircle2, Search, Check, X, Clock, TrendingUp, BookOpen, GraduationCap,
  Award, MapPin, HelpCircle, Star, Edit3, Save, XCircle, MessageCircle, Menu,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";

type TabKey = "dashboard" | "institutes" | "awards" | "managers" | "registrations" | "finance" | "chat" | "categories" | "regions" | "faqs" | "homepage" | "telegram";

const NAV_ITEMS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "داشبورد مدیریتی", icon: LayoutDashboard },
  { key: "institutes", label: "مدیریت آموزشگاه‌ها", icon: Building2 },
  { key: "awards", label: "برگزیدگان سال ⭐", icon: Award },
  { key: "managers", label: "مدیران آموزشگاه‌ها", icon: Users2 },
  { key: "registrations", label: "مدیریت ثبت‌نام‌ها", icon: ClipboardList },
  { key: "finance", label: "مالی و درآمد", icon: Wallet },
  { key: "chat", label: "چت با آموزشگاه‌ها", icon: MessageCircle },
  { key: "categories", label: "مدیریت رشته‌ها", icon: BookOpen },
  { key: "regions", label: "مدیریت مناطق", icon: MapPin },
  { key: "faqs", label: "سوالات متداول", icon: HelpCircle },
  { key: "homepage", label: "تنظیمات صفحه اصلی", icon: Settings2 },
  { key: "telegram", label: "ربات و اعلان‌ها", icon: Send },
];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin" || user?.phone === "09159513179" || user?.phone === "09150000000";

  const [tab, setTab] = useState<TabKey>("dashboard");
  const { open: drawerOpen, setOpen: setDrawerOpen } = useMobilePanelDrawer();

  // Login lock screen state
  const [adminPhone, setAdminPhone] = useState("09159513179");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    const cleanPhone = normalizePhone(adminPhone);
    try {
      const res = await signIn("credentials", { redirect: false, phone: cleanPhone, password: adminPassword });
      if (res?.ok) window.location.reload();
      else setLoginError("شماره همراه یا رمز عبور مدیر نادرست است.");
    } catch { setLoginError("خطا در ورود به سیستم."); }
    finally { setLoginLoading(false); }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-bg-secondary"><Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-bg-secondary"><Navbar />
        <div className="pt-28 pb-20 max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-[28px] border border-border-default overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-border-default text-center bg-[#0B1120] text-white">
              <div className="w-16 h-16 rounded-[20px] bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black mb-1">ورود محرمانه مدیریت</h1>
              <p className="text-xs text-slate-400">این بخش فقط برای مدیر کل پلتفرم قابل دسترسی است.</p>
            </div>
            <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
              {loginError && <div className="p-4 rounded-[14px] bg-error-50 text-error-600 text-sm font-bold">{loginError}</div>}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">شماره همراه مدیر</label>
                <div className="relative">
                  <input type="tel" required value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-[16px] border border-border-default bg-bg-secondary text-text-primary outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-100 transition-all font-semibold"
                    placeholder="۰۹۱۵۹۵۱۳۱۷۹" dir="ltr" />
                  <Phone className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">رمز عبور مدیر</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-[16px] border border-border-default bg-bg-secondary text-text-primary outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-100 transition-all font-semibold"
                    placeholder="رمز عبور مدیر" dir="ltr" />
                  <Lock className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loginLoading}
                className="w-full py-4 rounded-[16px] text-base font-black text-white bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-600/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                {loginLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> در حال احراز هویت...</> : "ورود به پنل مدیریت"}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-20 lg:flex lg:flex-row lg:min-h-screen">
        {/* Mobile compact top bar (only shown on mobile) */}
        <div className="lg:hidden sticky top-20 z-30 bg-[#0B1120]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-[12px] bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-300 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white truncate">{NAV_ITEMS.find(n => n.key === tab)?.label || "پنل مدیر"}</div>
            <div className="text-[10px] text-primary-300 font-bold">مدیر کل سامانه</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-9 h-9 rounded-[10px] bg-error-500/15 hover:bg-error-500/25 text-error-400 flex items-center justify-center cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile drawer backdrop */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed inset-0 z-[60] bg-black/70" />
        )}

        {/* Sidebar — desktop always visible, mobile as slide-in drawer */}
        <aside className={`bg-[#0B1120] text-white shrink-0 lg:min-h-[calc(100vh-80px)] lg:w-72 lg:static lg:translate-x-0
          fixed top-0 right-0 bottom-0 z-[70] w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0 block" : "translate-x-full hidden lg:block lg:translate-x-0"}`}
          style={{ boxShadow: drawerOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : undefined }}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-[10px] bg-primary-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-black">مدیر کل سامانه</div>
                <div className="text-[10px] text-primary-300 font-bold">Super Admin</div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 rounded-[10px] hover:bg-white/10 text-error-400 cursor-pointer" title="خروج">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.key} onClick={() => { setTab(item.key); setDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-bold transition-all cursor-pointer text-right ${
                  tab === item.key ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25" : "text-slate-300 hover:bg-white/5"
                }`}>
                <item.icon className="w-4 h-4 shrink-0" /> {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area (dark) */}
        <div className="flex-1 bg-[#0B1120] text-white p-4 lg:p-8">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "institutes" && <InstitutesTab />}
          {tab === "awards" && <AwardsTab />}
          {tab === "managers" && <ManagersTab />}
          {tab === "registrations" && <RegistrationsTab />}
          {tab === "finance" && <FinanceTab />}
          {tab === "categories" && <CategoriesTab />}
          {tab === "regions" && <RegionsTab />}
          {tab === "faqs" && <FaqsTab />}
          {tab === "homepage" && <HomepageSettingsTab />}
          {tab === "chat" && <AdminChatTab />}
          {tab === "telegram" && <TelegramTab />}
        </div>
      </div>
    </main>
  );
}

/* ============================= DASHBOARD TAB ============================= */
function DashboardTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [migResult, setMigResult] = useState<{ ok: boolean; migrations: { name: string; ok: boolean; error?: string }[] } | null>(null);
  const [migRunning, setMigRunning] = useState(false);

  const runMigrations = async () => {
    setMigRunning(true);
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const d = await res.json();
      setMigResult(d);
    } catch (e) {
      setMigResult({ ok: false, migrations: [{ name: "network", ok: false, error: String(e) }] });
    }
    setMigRunning(false);
  };

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => { setStats(d); setLoading(false); });
    // Auto-run migrations on first visit (idempotent - safe to run repeatedly)
    const hasRun = typeof window !== "undefined" && window.sessionStorage.getItem("zbk_mig_done_v1");
    if (!hasRun) {
      fetch("/api/admin/migrate", { method: "POST" })
        .then((r) => r.json())
        .then((d) => {
          setMigResult(d);
          if (d.ok && typeof window !== "undefined") window.sessionStorage.setItem("zbk_mig_done_v1", "1");
        })
        .catch(() => {});
    }
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  const cards = [
    { label: "کل دوره‌ها", value: stats?.totalCourses ?? 0, icon: BookOpen, c: "bg-fuchsia-600" },
    { label: "کل هنرجویان", value: stats?.totalRegistrations ?? 0, icon: Users2, c: "bg-indigo-600" },
    { label: "آموزشگاه فعال", value: stats?.totalInstitutes ?? 0, icon: CheckCircle2, c: "bg-emerald-500" },
    { label: "کل آموزشگاه‌ها", value: stats?.totalInstitutes ?? 0, icon: Building2, c: "bg-sky-500" },
    { label: "درآمد کل (تومان)", value: (stats?.totalRevenue ?? 0).toLocaleString("fa-IR"), icon: Wallet, c: "bg-green-600" },
    { label: "در انتظار تأیید", value: stats?.pendingCount ?? 0, icon: Clock, c: "bg-amber-500" },
    { label: "ثبت‌نام این ماه", value: stats?.approvedCount ?? 0, icon: GraduationCap, c: "bg-cyan-500" },
    { label: "ثبت‌نام امروز", value: stats?.todayCount ?? 0, icon: TrendingUp, c: "bg-teal-500" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">داشبورد مدیریتی</h2>
      <p className="text-slate-400 text-sm mb-6">نمای کلی عملکرد کل سامانه آموزشگاه‌های زبرخان</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
            <div className={`w-11 h-11 rounded-[12px] ${c.c} flex items-center justify-center mb-4 shadow-lg`}>
              <c.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black">{c.value}</div>
            <div className="text-[11px] text-slate-400 font-bold mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Database Migration Panel */}
      <div className="mt-8 bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white">وضعیت پایگاه داده</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">اسکیمای پایگاه داده به‌صورت خودکار به‌روزرسانی می‌شود. برای اجرای دستی روی دکمه کلیک کنید.</p>
          </div>
          <button
            onClick={runMigrations}
            disabled={migRunning}
            className="px-4 py-2.5 rounded-[12px] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2"
          >
            {migRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {migRunning ? "در حال اجرا..." : "اجرای دستی مهاجرت"}
          </button>
        </div>
        {migResult && (
          <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
            {migResult.migrations.map((m) => (
              <div key={m.name} className={`flex items-center gap-2 text-[11px] px-3 py-2 rounded-lg ${m.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                <span className="font-black">{m.ok ? "✓" : "✗"}</span>
                <span className="font-bold">{m.name}</span>
                {m.error && <span className="opacity-70 line-clamp-1">— {m.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================= INSTITUTES TAB ============================= */
function InstitutesTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", address: "", mobile: "", phone: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/institutes").then((r) => r.json()).then((d) => { setList(d); setLoading(false); });
  };

  useEffect(fetchList, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("");
    const res = await fetch("/api/admin/institutes", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) { setMsg("✅ آموزشگاه ساخته شد"); setForm({ name: "", address: "", mobile: "", phone: "", description: "" }); setShowForm(false); fetchList(); }
    else setMsg("❌ " + (d.error || "خطا"));
  };

  const toggleActive = async (id: number, active: boolean) => {
    await fetch("/api/admin/institutes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: active ? "suspend" : "activate" }),
    });
    fetchList();
  };

  const removeInstitute = async (id: number, name: string) => {
    if (!confirm(`آیا از حذف کامل «${name}» مطمئن هستید؟ این عملیات همه دوره‌ها و ثبت‌نام‌های آن را نیز حذف می‌کند.`)) return;
    await fetch("/api/admin/institutes", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    fetchList();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">مدیریت آموزشگاه‌ها</h2>
          <p className="text-slate-400 text-sm mt-1">افزودن، حذف، تعلیق و مشاهده عملکرد هر آموزشگاه</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-3 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> افزودن آموزشگاه جدید
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111a2e] border border-white/10 rounded-[18px] p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {msg && <div className="md:col-span-2 p-3 rounded-[10px] bg-primary-500/10 text-primary-300 text-xs font-bold">{msg}</div>}
          <input required placeholder="نام آموزشگاه *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="شماره موبایل" dir="ltr" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="آدرس" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500 md:col-span-2" />
          <textarea placeholder="توضیحات" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 md:col-span-2 resize-none" />
          <button type="submit" disabled={saving} className="md:col-span-2 py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black cursor-pointer">
            {saving ? "در حال ساخت..." : "ثبت آموزشگاه"}
          </button>
        </form>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((inst) => (
            <div key={inst.id} className="bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-white">{inst.name}</h3>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${inst.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-error-500/20 text-error-400"}`}>
                      {inst.isActive ? "فعال" : "معلق"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{inst.regionName || "—"}</span>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toggleActive(inst.id, inst.isActive)}
                    className={`p-2 rounded-[10px] cursor-pointer ${inst.isActive ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25" : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"}`}
                    title={inst.isActive ? "تعلیق آموزشگاه" : "فعال‌سازی مجدد"}>
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removeInstitute(inst.id, inst.name)} className="p-2 rounded-[10px] bg-error-500/15 text-error-400 hover:bg-error-500/25 cursor-pointer" title="حذف کامل">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              {(inst.managerName || inst.licenseNumber || inst.isYearAward) && (
                <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
                  {inst.managerName && (
                    <div className="bg-[#0B1120] rounded-[8px] px-2 py-1.5 flex items-center gap-1.5">
                      <Users2 className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400">مدیر:</span>
                      <span className="font-black text-white truncate">{inst.managerName}</span>
                    </div>
                  )}
                  {inst.licenseNumber && (
                    <div className="bg-[#0B1120] rounded-[8px] px-2 py-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400">مجوز:</span>
                      <span className="font-black text-white truncate" dir="ltr">{inst.licenseNumber}</span>
                    </div>
                  )}
                  {inst.isYearAward && (
                    <div className="col-span-2 bg-gradient-to-l from-amber-500/15 to-orange-500/5 border border-amber-500/30 rounded-[8px] px-2 py-1.5 flex items-center gap-1.5">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span className="text-amber-300 font-black">برگزیده سال ⭐</span>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#0B1120] rounded-[10px] py-2"><div className="text-sm font-black text-emerald-400">{inst.courseCount}</div><div className="text-[9px] text-slate-500">دوره</div></div>
                <div className="bg-[#0B1120] rounded-[10px] py-2"><div className="text-sm font-black text-sky-400">{inst.studentCount}</div><div className="text-[9px] text-slate-500">هنرجو</div></div>
                <div className="bg-[#0B1120] rounded-[10px] py-2"><div className="text-sm font-black text-primary-400" dir="ltr">{inst.mobile || "—"}</div><div className="text-[9px] text-slate-500">تماس</div></div>
              </div>
              <button onClick={() => setEditingId(inst.id)}
                className="mt-3 w-full py-2 rounded-[10px] bg-primary-500/15 text-primary-300 hover:bg-primary-500/25 text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5" /> ویرایش کامل اطلاعات
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingId !== null && (
        <InstituteEditModal
          instituteId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); fetchList(); }}
        />
      )}
    </div>
  );
}

/* ============================= INSTITUTE EDIT MODAL ============================= */
function InstituteEditModal({ instituteId, onClose, onSaved }: { instituteId: number; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any>(null);
  const [regionsList, setRegionsList] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/institutes")
      .then((r) => r.json())
      .then((all) => {
        const found = (all || []).find((i: any) => i.id === instituteId);
        setData(found || null);
        setLoading(false);
      });
    fetch("/api/admin/regions").then((r) => r.json()).then((d) => setRegionsList(d || [])).catch(() => {});
  }, [instituteId]);

  const setField = (k: string, v: any) => setData({ ...data, [k]: v });
  const setFeature = (idx: number, v: string) => {
    const arr = Array.isArray(data.features) ? [...data.features] : [];
    arr[idx] = v;
    setData({ ...data, features: arr });
  };
  const addFeature = () => setData({ ...data, features: [...(data.features || []), ""] });
  const removeFeature = (idx: number) => {
    const arr = (data.features || []).filter((_: any, i: number) => i !== idx);
    setData({ ...data, features: arr });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      id: instituteId,
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      mobile: data.mobile,
      regionId: data.regionId ? Number(data.regionId) : null,
      licenseNumber: data.licenseNumber || null,
      managerName: data.managerName || null,
      managerTitle: data.managerTitle || null,
      establishedYear: data.establishedYear || null,
      features: (data.features || []).filter((f: string) => f && f.trim().length),
    };
    const res = await fetch("/api/admin/institutes", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) onSaved();
    else alert("خطا در ذخیره");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#111a2e] rounded-[24px] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-[#111a2e] border-b border-white/10 p-4 flex items-center justify-between">
          <h3 className="font-black">ویرایش کامل آموزشگاه</h3>
          <button onClick={onClose} className="p-2 rounded-[10px] bg-white/10 hover:bg-white/20 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        {loading || !data ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">نام آموزشگاه</label>
              <input value={data.name || ""} onChange={(e) => setField("name", e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">نام مدیر</label>
                <input value={data.managerName || ""} onChange={(e) => setField("managerName", e.target.value)}
                  placeholder="مثل: مهندس علی رضایی"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">عنوان مدیر</label>
                <input value={data.managerTitle || ""} onChange={(e) => setField("managerTitle", e.target.value)}
                  placeholder="مثل: مدیرعامل"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">شماره مجوز رسمی</label>
                <input value={data.licenseNumber || ""} onChange={(e) => setField("licenseNumber", e.target.value)}
                  dir="ltr" placeholder="1402/12/8945"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">سال تأسیس</label>
                <input value={data.establishedYear || ""} onChange={(e) => setField("establishedYear", e.target.value)}
                  placeholder="1400"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-600" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">منطقه</label>
              <select value={data.regionId || ""} onChange={(e) => setField("regionId", e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white">
                <option value="">— انتخاب منطقه —</option>
                {regionsList.map((r) => (<option key={r.id} value={r.id}>{r.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">آدرس کامل</label>
              <input value={data.address || ""} onChange={(e) => setField("address", e.target.value)}
                className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">موبایل</label>
                <input value={data.mobile || ""} onChange={(e) => setField("mobile", e.target.value)} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">تلفن ثابت</label>
                <input value={data.phone || ""} onChange={(e) => setField("phone", e.target.value)} dir="ltr"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">توضیحات آموزشگاه</label>
              <textarea value={data.description || ""} onChange={(e) => setField("description", e.target.value)} rows={3}
                className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-bold text-slate-400">ویژگی‌های کلیدی (روی کارت نمایش داده می‌شود)</label>
                <button type="button" onClick={addFeature} className="text-[10px] font-black text-primary-300 hover:text-primary-200 flex items-center gap-1 cursor-pointer">
                  <Plus className="w-3 h-3" /> افزودن
                </button>
              </div>
              <div className="space-y-2">
                {(data.features || []).map((f: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <input value={f} onChange={(e) => setFeature(i, e.target.value)}
                      placeholder="مثل: کادر مدرسین با تجربه بین‌المللی"
                      className="flex-1 px-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs text-white placeholder:text-slate-600" />
                    <button type="button" onClick={() => removeFeature(i)} className="p-2 rounded-[10px] bg-error-500/15 text-error-400 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {(!data.features || data.features.length === 0) && (
                  <div className="text-[10px] text-slate-600 text-center py-3 bg-[#0B1120] rounded-[10px]">هنوز ویژگی‌ای اضافه نشده</div>
                )}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-black cursor-pointer flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                ذخیره تغییرات
              </button>
              <button onClick={onClose} className="px-4 py-3 rounded-[12px] bg-white/10 hover:bg-white/20 text-white text-sm font-black cursor-pointer">لغو</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================= MANAGERS TAB ============================= */
function ManagersTab() {
  const [managers, setManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ instituteId: "", phone: "", password: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/managers").then((r) => r.json()).then((d) => { setManagers(d); setLoading(false); });
  };
  useEffect(fetchList, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMsg("");
    const res = await fetch("/api/admin/managers", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, instituteId: Number(form.instituteId) }),
    });
    const d = await res.json();
    setSaving(false);
    if (res.ok) { setMsg(`✅ حساب مدیر ساخته شد | کد ربات: ${d.accessCode}`); setForm({ instituteId: "", phone: "", password: "", name: "" }); fetchList(); }
    else setMsg("❌ " + (d.error || "خطا"));
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">مدیران آموزشگاه‌ها</h2>
      <p className="text-slate-400 text-sm mb-6">ساخت یوزر/پسورد اختصاصی + کد اتصال ربات تلگرام</p>

      <form onSubmit={handleCreate} className="bg-[#111a2e] border border-white/10 rounded-[18px] p-5 grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <select required value={form.instituteId} onChange={(e) => setForm({ ...form, instituteId: e.target.value })}
          className="px-3 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-xs font-bold text-white cursor-pointer md:col-span-2">
          <option value="">انتخاب آموزشگاه...</option>
          {managers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <input required type="tel" placeholder="موبایل مدیر (۰۹...)" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="px-3 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-xs font-bold text-white placeholder:text-slate-500" />
        <input required type="text" placeholder="رمز عبور (حداقل ۶)" dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="px-3 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-xs font-bold text-white placeholder:text-slate-500" />
        <button type="submit" disabled={saving} className="px-4 py-3 rounded-[12px] text-xs font-black text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 cursor-pointer">
          {saving ? "..." : "ساخت / بازنشانی حساب"}
        </button>
      </form>
      {msg && <div className="mb-6 p-3.5 rounded-[12px] bg-primary-500/10 text-primary-300 text-xs font-bold">{msg}</div>}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="overflow-x-auto bg-[#111a2e] border border-white/5 rounded-[18px]">
          <table className="w-full text-xs">
            <thead><tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
              <th className="px-4 py-3">آموزشگاه</th><th className="px-4 py-3">مدیر</th>
              <th className="px-4 py-3">موبایل</th><th className="px-4 py-3">کد ربات</th><th className="px-4 py-3">لینک اتصال</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {managers.map((m) => (
                <tr key={m.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-bold text-white">{m.name}</td>
                  <td className="px-4 py-3 text-slate-300">{m.managerName || <span className="text-slate-600">— تعیین نشده</span>}</td>
                  <td className="px-4 py-3 font-bold text-white" dir="ltr">{m.managerPhone || "—"}</td>
                  <td className="px-4 py-3"><code className="px-2 py-1 rounded-[8px] bg-primary-500/15 text-primary-300 font-black tracking-wider">{m.accessCode}</code></td>
                  <td className="px-4 py-3">
                    <a href={`https://t.me/amoozeshghah_bot?start=${m.accessCode}`} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline font-bold">
                      اتصال ربات ←
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================= REGISTRATIONS TAB ============================= */
function RegistrationsTab() {
  const [regs, setRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/registrations").then((r) => r.json()).then((d) => { setRegs(d); setLoading(false); });
  };
  useEffect(fetchList, []);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/admin/registrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchList();
  };

  const handleExport = async () => {
    setExporting(true);
    const res = await fetch("/api/admin/export");
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `zabarkhan-registrations-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
    setExporting(false);
  };

  const filtered = regs.filter((r) => {
    const matchF = filter === "all" || r.status === filter;
    const matchQ = !q || r.fullName.includes(q) || r.phone.includes(q) || r.courseTitle?.includes(q) || r.instituteName?.includes(q);
    return matchF && matchQ;
  });

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black">مدیریت ثبت‌نام‌ها</h2>
          <p className="text-slate-400 text-sm mt-1">تأیید/رد درخواست‌ها و خروجی اکسل کامل</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="px-5 py-3 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer disabled:opacity-50">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardList className="w-4 h-4" />} دانلود اکسل
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-[#111a2e] border border-white/10 flex-1">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام، تلفن، دوره..." className="bg-transparent text-xs font-semibold outline-none w-full text-white placeholder:text-slate-500" />
        </div>
        <div className="flex items-center gap-1.5 bg-[#111a2e] border border-white/10 p-1 rounded-[12px]">
          {[{ v: "all", l: "همه" }, { v: "pending", l: "در انتظار" }, { v: "approved", l: "تأیید شده" }, { v: "rejected", l: "رد شده" }].map((f) => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold cursor-pointer ${filter === f.v ? "bg-primary-600 text-white" : "text-slate-400"}`}>{f.l}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="overflow-x-auto bg-[#111a2e] border border-white/5 rounded-[18px]">
          <table className="w-full text-xs">
            <thead><tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
              <th className="px-4 py-3">هنرجو</th><th className="px-4 py-3">دوره</th><th className="px-4 py-3">آموزشگاه</th>
              <th className="px-4 py-3">تماس</th><th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">اقدام</th>
            </tr></thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-bold text-white">{r.fullName}</td>
                  <td className="px-4 py-3 text-slate-300">{r.courseTitle}</td>
                  <td className="px-4 py-3 text-slate-300">{r.instituteName}</td>
                  <td className="px-4 py-3 font-bold text-white" dir="ltr">{r.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${r.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : r.status === "rejected" ? "bg-error-500/15 text-error-400" : "bg-amber-500/15 text-amber-400"}`}>
                      {r.status === "approved" ? "تأیید شد" : r.status === "rejected" ? "رد شد" : "در انتظار"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      <button onClick={() => updateStatus(r.id, "approved")} className="p-1.5 rounded-[8px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => updateStatus(r.id, "rejected")} className="p-1.5 rounded-[8px] bg-error-500/15 text-error-400 hover:bg-error-500/30 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ============================= FINANCE TAB ============================= */
function FinanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/finance").then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">مالی و درآمد</h2>
      <p className="text-slate-400 text-sm mb-6">درآمد کل و تفکیک درآمد هر آموزشگاه</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
          <div className="w-11 h-11 rounded-[12px] bg-amber-500 flex items-center justify-center mb-3"><Clock className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-black">{data.totalPending.toLocaleString("fa-IR")}</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">در انتظار پرداخت (تومان)</div>
        </div>
        <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
          <div className="w-11 h-11 rounded-[12px] bg-sky-500 flex items-center justify-center mb-3"><CheckCircle2 className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-black">{data.totalApprovedRegs}</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">ثبت‌نام تأییدشده</div>
        </div>
        <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-5">
          <div className="w-11 h-11 rounded-[12px] bg-green-600 flex items-center justify-center mb-3"><Wallet className="w-5 h-5 text-white" /></div>
          <div className="text-2xl font-black">{data.totalRevenue.toLocaleString("fa-IR")}</div>
          <div className="text-[11px] text-slate-400 font-bold mt-1">درآمد کل (تومان)</div>
        </div>
      </div>
      <div className="bg-[#111a2e] border border-white/5 rounded-[18px] overflow-hidden">
        <div className="p-5 border-b border-white/5"><h3 className="font-black text-white text-sm">درآمد تفکیکی آموزشگاه‌ها</h3></div>
        <table className="w-full text-xs">
          <thead><tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
            <th className="px-5 py-3">آموزشگاه</th><th className="px-5 py-3">هنرجو</th><th className="px-5 py-3">دوره</th><th className="px-5 py-3">درآمد (تومان)</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {data.breakdown.map((b: any) => (
              <tr key={b.instituteId} className="hover:bg-white/5">
                <td className="px-5 py-3 font-bold text-white">{b.instituteName}</td>
                <td className="px-5 py-3 text-slate-300">{b.studentCount}</td>
                <td className="px-5 py-3 text-slate-300">{b.courseCount}</td>
                <td className="px-5 py-3 font-black text-emerald-400">{b.approvedRevenue.toLocaleString("fa-IR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================= HOMEPAGE SETTINGS TAB ============================= */
function HomepageSettingsTab() {
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, number[]>>({ featured_institutes: [], featured_courses: [], recommended_institutes: [] });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/institutes").then((r) => r.json()),
      fetch("/api/courses").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
    ]).then(([inst, crs, sett]) => {
      setInstitutes(inst); setCourses(crs); setSettings(sett); setLoading(false);
    });
  }, []);

  const toggle = (key: string, id: number, max?: number) => {
    setSettings((prev) => {
      const current = prev[key] || [];
      let next: number[];
      if (current.includes(id)) next = current.filter((x) => x !== id);
      else {
        if (max && current.length >= max) {
          setMsg((m) => ({ ...m, [key]: `❌ حداکثر ${max} مورد قابل انتخاب است` }));
          return prev;
        }
        next = [...current, id];
      }
      return { ...prev, [key]: next };
    });
  };

  const save = async (key: string) => {
    setMsg((m) => ({ ...m, [key]: "" }));
    const res = await fetch("/api/admin/settings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value: settings[key] }),
    });
    const d = await res.json();
    setMsg((m) => ({ ...m, [key]: res.ok ? "✅ ذخیره شد" : "❌ " + d.error }));
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">تنظیمات صفحه اصلی</h2>
        <p className="text-slate-400 text-sm mt-1">کنترل کامل محتوای نمایشی در صفحه اصلی سایت برای هنرجویان</p>
      </div>

      {/* Featured Institutes */}
      <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-primary-400" /> آموزشگاه‌های برتر صفحه اصلی</h3>
          <button onClick={() => save("featured_institutes")} className="px-4 py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer">ذخیره</button>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">موارد انتخاب‌شده در بخش «آموزشگاه‌های برتر» صفحه اصلی نمایش داده می‌شوند (اگر هیچ‌کدام انتخاب نشود، خودکار براساس امتیاز نمایش می‌یابد)</p>
        {msg.featured_institutes && <div className="text-xs font-bold text-amber-400 mb-3">{msg.featured_institutes}</div>}
        <div className="flex flex-wrap gap-2">
          {institutes.map((i) => (
            <button key={i.id} onClick={() => toggle("featured_institutes", i.id)}
              className={`px-3.5 py-2 rounded-[10px] text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                settings.featured_institutes?.includes(i.id) ? "bg-primary-600 border-primary-500 text-white" : "bg-[#0B1120] border-white/10 text-slate-300"
              }`}>
              {settings.featured_institutes?.includes(i.id) && <Check className="w-3 h-3" />} {i.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Courses */}
      <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-400" /> دوره‌های ویژه صفحه اصلی</h3>
          <button onClick={() => save("featured_courses")} className="px-4 py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer">ذخیره</button>
        </div>
        {msg.featured_courses && <div className="text-xs font-bold text-amber-400 mb-3">{msg.featured_courses}</div>}
        <div className="flex flex-wrap gap-2">
          {courses.map((c) => (
            <button key={c.id} onClick={() => toggle("featured_courses", c.id)}
              className={`px-3.5 py-2 rounded-[10px] text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                settings.featured_courses?.includes(c.id) ? "bg-primary-600 border-primary-500 text-white" : "bg-[#0B1120] border-white/10 text-slate-300"
              }`}>
              {settings.featured_courses?.includes(c.id) && <Check className="w-3 h-3" />} {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Institutes (max 2) */}
      <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary-400" /> آموزشگاه‌های پیشنهادی به هنرجویان</h3>
          <button onClick={() => save("recommended_institutes")} className="px-4 py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer">ذخیره</button>
        </div>
        <p className="text-[11px] text-slate-500 mb-4">این آموزشگاه‌ها در پنل هنرجویان به عنوان «پیشنهاد ویژه» نمایش داده می‌شوند</p>
        {msg.recommended_institutes && <div className="text-xs font-bold text-amber-400 mb-3">{msg.recommended_institutes}</div>}
        <div className="flex flex-wrap gap-2">
          {institutes.map((i) => (
            <button key={i.id} onClick={() => toggle("recommended_institutes", i.id, 2)}
              className={`px-3.5 py-2 rounded-[10px] text-xs font-bold border cursor-pointer transition-all flex items-center gap-1.5 ${
                settings.recommended_institutes?.includes(i.id) ? "bg-primary-600 border-primary-500 text-white" : "bg-[#0B1120] border-white/10 text-slate-300"
              }`}>
              {settings.recommended_institutes?.includes(i.id) && <Check className="w-3 h-3" />} {i.name}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-amber-400 font-bold mt-3">💡 حداکثر ۲ آموزشگاه قابل انتخاب است (طبق درخواست شما)</p>
      </div>
    </div>
  );
}

/* ============================= TELEGRAM TAB ============================= */
function TelegramTab() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setupWebhook = async () => {
    setLoading(true); setStatus(null);
    const res = await fetch("/api/telegram/setup");
    const d = await res.json();
    setStatus(d.success && d.telegramResponse?.ok ? "🟢 وب‌هوک با موفقیت متصل شد!" : "⚠️ " + (d.telegramResponse?.description || "خطا"));
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">ربات و اعلان‌ها</h2>
      <p className="text-slate-400 text-sm mb-6">مدیریت ربات تلگرام رسمی سامانه</p>
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[18px] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h3 className="font-black mb-1">ربات تلگرام: <code>@amoozeshghah_bot</code></h3>
          <p className="text-xs text-sky-100">ثبت‌نام‌های جدید به صورت لحظه‌ای به تلگرام شما و مدیران آموزشگاه‌ها ارسال می‌شود</p>
          {status && <div className="text-xs font-bold text-amber-200 mt-2">{status}</div>}
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={setupWebhook} disabled={loading} className="px-5 py-3 rounded-[12px] bg-white text-sky-800 text-xs font-black cursor-pointer flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} اتصال وب‌هوک
          </button>
          <a href="https://t.me/amoozeshghah_bot" target="_blank" rel="noopener noreferrer" className="px-5 py-3 rounded-[12px] bg-sky-500/40 hover:bg-sky-500/60 text-white text-xs font-bold border border-sky-300/30">
            باز کردن در تلگرام
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============================= AWARDS TAB (برگزیدگان سال) ============================= */
function AwardsTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/institutes").then((r) => r.json()).then((d) => { setList(d || []); setLoading(false); });
  };
  useEffect(fetchList, []);

  const toggleAward = async (id: number) => {
    setSaving(id);
    await fetch("/api/admin/institutes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "toggle_award" }),
    });
    setSaving(null);
    fetchList();
  };

  const awardedCount = list.filter((i) => i.isYearAward).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            برگزیدگان سال
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            هر آموزشگاهی که به‌عنوان برگزیده سال انتخاب کنید، بج طلایی «برگزیده سال» روی کارت آن در صفحه اصلی نمایش داده می‌شود.
            <span className="text-amber-300 font-black mr-2">({awardedCount} برگزیده انتخاب شده)</span>
          </p>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="space-y-2">
          {list.map((inst) => (
            <div key={inst.id} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-[14px] border transition-all ${
              inst.isYearAward
                ? "bg-gradient-to-l from-amber-500/15 to-orange-500/5 border-amber-500/40"
                : "bg-[#111a2e] border-white/5 hover:border-white/10"
            }`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${
                  inst.isYearAward ? "bg-gradient-to-br from-amber-500 to-orange-500" : "bg-[#0B1120]"
                }`}>
                  <Award className={`w-5 h-5 ${inst.isYearAward ? "text-white" : "text-slate-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-sm truncate">{inst.name}</h4>
                    {inst.isYearAward && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-white shrink-0">برگزیده</span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{inst.regionName || "—"} • {inst.mobile || "—"}</div>
                </div>
              </div>
              <button onClick={() => toggleAward(inst.id)} disabled={saving === inst.id}
                className={`px-4 py-2 rounded-[10px] text-[11px] font-black cursor-pointer transition-all ${
                  inst.isYearAward
                    ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}>
                {saving === inst.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                  inst.isYearAward ? "برداشتن بج" : "انتخاب به عنوان برگزیده"}
              </button>
            </div>
          ))}
          {list.length === 0 && (
            <div className="text-center py-20 text-slate-500 text-sm">آموزشگاهی ثبت نشده است.</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================= CATEGORIES TAB ============================= */
function CategoriesTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", color: "" });
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => { setList(d || []); setLoading(false); });
  };
  useEffect(fetchList, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/categories", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ name: "", description: "", icon: "", color: "" }); setShowForm(false); fetchList(); }
    else { const d = await res.json(); alert(d.error || "خطا"); }
  };

  const handleSaveEdit = async (id: number) => {
    await fetch("/api/admin/categories", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...editForm }),
    });
    setEditing(null); fetchList();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`حذف رشته «${name}»؟`)) return;
    const res = await fetch("/api/admin/categories", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "خطا"); return; }
    fetchList();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary-400" />مدیریت رشته‌ها</h2>
          <p className="text-slate-400 text-sm mt-1">افزودن، ویرایش و حذف رشته‌های آموزشی که در صفحه اصلی و فیلترها نمایش داده می‌شوند.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-3 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> رشته جدید
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111a2e] border border-white/10 rounded-[18px] p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="نام رشته *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="نام آیکن (مثل: Monitor, Scissors, Sparkles)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="رنگ (مثل: #0EA5E9)" dir="ltr" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <textarea placeholder="توضیحات رشته" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 md:col-span-2 resize-none" />
          <button type="submit" className="md:col-span-2 py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black cursor-pointer">ثبت رشته</button>
        </form>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {list.map((cat) => (
            <div key={cat.id} className="bg-[#111a2e] border border-white/5 rounded-[14px] p-4">
              {editing === cat.id ? (
                <div className="space-y-2">
                  <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  <textarea value={editForm.description || ""} rows={2} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(cat.id)} className="flex-1 py-2 rounded-[10px] bg-emerald-500 text-white text-xs font-black cursor-pointer">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-[10px] bg-white/10 text-white text-xs font-black cursor-pointer">لغو</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm">{cat.name}</h4>
                      <div className="text-[10px] text-slate-500 mt-1">{cat.courseCount} دوره فعال • slug: {cat.slug}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(cat.id); setEditForm(cat); }} className="p-2 rounded-[8px] bg-primary-500/15 text-primary-300 cursor-pointer" title="ویرایش">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 rounded-[8px] bg-error-500/15 text-error-400 cursor-pointer" title="حذف">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {cat.description && <p className="text-[11px] text-slate-400 line-clamp-2">{cat.description}</p>}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= REGIONS TAB ============================= */
function RegionsTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/regions").then((r) => r.json()).then((d) => { setList(d || []); setLoading(false); });
  };
  useEffect(fetchList, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch("/api/admin/regions", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName }),
    });
    if (res.ok) { setNewName(""); fetchList(); }
  };

  const handleSaveEdit = async (id: number) => {
    await fetch("/api/admin/regions", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: editName }),
    });
    setEditing(null); fetchList();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`حذف منطقه «${name}»؟`)) return;
    const res = await fetch("/api/admin/regions", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    if (!res.ok) { const d = await res.json(); alert(d.error || "خطا"); return; }
    fetchList();
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><MapPin className="w-6 h-6 text-primary-400" />مدیریت مناطق</h2>
        <p className="text-slate-400 text-sm mt-1">شهرها و مناطقی که در فیلتر آموزشگاه‌ها نمایش داده می‌شوند.</p>
      </div>

      <div className="bg-[#111a2e] border border-white/10 rounded-[14px] p-3 mb-6 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="نام منطقه جدید (مثل: قدمگاه)"
          className="flex-1 px-4 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500" />
        <button onClick={handleCreate} className="px-5 py-2.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black cursor-pointer flex items-center gap-2">
          <Plus className="w-4 h-4" /> افزودن
        </button>
      </div>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-2 px-4 py-3 bg-[#111a2e] border border-white/5 rounded-[12px]">
              {editing === r.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-[8px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  <button onClick={() => handleSaveEdit(r.id)} className="p-1.5 rounded-[8px] bg-emerald-500 text-white cursor-pointer"><Save className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditing(null)} className="p-1.5 rounded-[8px] bg-white/10 text-white cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span className="flex-1 font-black text-sm">{r.name}</span>
                  <span className="text-[10px] text-slate-500">{r.instituteCount} آموزشگاه</span>
                  <button onClick={() => { setEditing(r.id); setEditName(r.name); }} className="p-1.5 rounded-[8px] bg-primary-500/15 text-primary-300 cursor-pointer">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 rounded-[8px] bg-error-500/15 text-error-400 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= FAQs TAB ============================= */
function FaqsTab() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: 0 });
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const fetchList = () => {
    setLoading(true);
    fetch("/api/admin/faqs").then((r) => r.json()).then((d) => { setList(d || []); setLoading(false); });
  };
  useEffect(fetchList, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/faqs", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setForm({ question: "", answer: "", sortOrder: 0 }); setShowForm(false); fetchList(); }
  };

  const handleSaveEdit = async (id: number) => {
    await fetch("/api/admin/faqs", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...editForm }),
    });
    setEditing(null); fetchList();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("حذف این سوال؟")) return;
    await fetch("/api/admin/faqs", {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    fetchList();
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    await fetch("/api/admin/faqs", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !current }),
    });
    fetchList();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2"><HelpCircle className="w-6 h-6 text-primary-400" />سوالات متداول</h2>
          <p className="text-slate-400 text-sm mt-1">سوالاتی که در بخش FAQ صفحه اصلی نمایش داده می‌شود.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-3 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> سوال جدید
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#111a2e] border border-white/10 rounded-[18px] p-6 mb-6 space-y-3">
          <input required placeholder="متن سوال" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <textarea required placeholder="پاسخ" rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })}
            className="w-full px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 resize-none" />
          <input type="number" placeholder="ترتیب نمایش (0 اول)" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            className="w-40 px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500" />
          <button type="submit" className="w-full py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black cursor-pointer">ثبت سوال</button>
        </form>
      )}

      {loading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div> : (
        <div className="space-y-3">
          {list.map((faq) => (
            <div key={faq.id} className={`bg-[#111a2e] border rounded-[14px] p-4 ${faq.isActive ? "border-white/5" : "border-error-500/30 opacity-60"}`}>
              {editing === faq.id ? (
                <div className="space-y-2">
                  <input value={editForm.question} onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  <textarea value={editForm.answer} rows={3} onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
                    className="w-full px-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => handleSaveEdit(faq.id)} className="flex-1 py-2 rounded-[10px] bg-emerald-500 text-white text-xs font-black cursor-pointer">ذخیره</button>
                    <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-[10px] bg-white/10 text-white text-xs font-black cursor-pointer">لغو</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-black text-sm flex-1">{faq.question}</h4>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleToggleActive(faq.id, faq.isActive)} className={`p-2 rounded-[8px] cursor-pointer ${faq.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-white/10 text-slate-400"}`} title={faq.isActive ? "غیرفعال کن" : "فعال کن"}>
                        {faq.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => { setEditing(faq.id); setEditForm(faq); }} className="p-2 rounded-[8px] bg-primary-500/15 text-primary-300 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-2 rounded-[8px] bg-error-500/15 text-error-400 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-400 leading-relaxed">{faq.answer}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= ADMIN CHAT TAB ============================= */
function AdminChatTab() {
  const [threads, setThreads] = useState<any[]>([]);
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/chat/threads").then((r) => r.json()).catch(() => []),
      fetch("/api/admin/institutes").then((r) => r.json()).catch(() => []),
    ]).then(([t, ins]) => {
      if (Array.isArray(t)) setThreads(t);
      if (Array.isArray(ins)) setInstitutes(ins);
      setLoading(false);
    });
  }, []);

  const startChat = async (mobile: string, name: string) => {
    if (!mobile) {
      setMsg({ type: "err", text: `آموزشگاه «${name}» شماره موبایل ندارد.` });
      return;
    }
    const r = await fetch(`/api/lookup-user?phone=${encodeURIComponent(mobile)}`);
    const d = await r.json();
    if (!d.userId) {
      setMsg({ type: "err", text: `مدیر آموزشگاه «${name}» هنوز حساب کاربری فعال ندارد.` });
      return;
    }
    window.location.href = `/chat?with=${d.userId}&role=institute`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><MessageCircle className="w-6 h-6 text-primary-400" />چت با آموزشگاه‌ها</h2>
        <p className="text-slate-400 text-sm mt-1">با مدیران آموزشگاه‌های تحت پوشش مرکز شماره ۱۲ گفتگو کنید.</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"}`}>{msg.text}</div>
      )}

      {threads.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-black text-slate-300 mb-3">گفتگوهای فعال ({threads.length})</h3>
          <div className="space-y-2">
            {threads.map((t) => (
              <a key={t.id} href={`/chat`}
                className="flex items-center gap-3 px-4 py-3 bg-[#111a2e] hover:bg-[#0f1729] border border-white/5 rounded-[14px] transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-black text-sm truncate">{t.other?.name || "کاربر"}</div>
                    {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-error-500 text-white text-[10px] font-black flex items-center justify-center">{t.unread}</span>}
                  </div>
                  {t.lastMessage && <div className="text-[11px] text-slate-500 truncate mt-0.5">{t.lastMessage.body}</div>}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-black text-slate-300 mb-3">شروع گفتگو با مدیران ({institutes.length})</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {institutes.map((i: any) => (
              <div key={i.id} className="flex items-center gap-3 px-4 py-3 bg-[#111a2e] border border-white/5 rounded-[14px]">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm truncate">{i.name}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2">
                    <span>{i.managerName || "بدون مدیر"}</span>
                    {i.mobile && <span dir="ltr">• {i.mobile}</span>}
                  </div>
                </div>
                <button onClick={() => startChat(i.mobile, i.name)}
                  className="px-3 py-1.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black cursor-pointer flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" /> شروع چت
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
