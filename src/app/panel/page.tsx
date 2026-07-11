"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Users, BookOpen, Clock, CheckCircle, XCircle, Loader2, Building2,
  Wallet, Check, X, Pencil, ImagePlus, Trash2, Send, Lock, Phone,
  LayoutDashboard, Image as ImageIcon, Award, Plus, LogOut, ShieldCheck, Eye, EyeOff,
  UserCircle2, FolderOpen, Menu, Bell, TrendingUp, CalendarDays,
  MessageCircle, Video, Link as LinkIcon, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";
import ProfileStoriesTab from "@/components/panel/ProfileStoriesTab";
import InstituteProfileForm from "@/components/panel/InstituteProfileForm";
import StudentDocumentsModal from "@/components/panel/StudentDocumentsModal";
import PersianDatePicker from "@/components/PersianDatePicker";
import MoneyInput from "@/components/MoneyInput";

type TabKey = "dashboard" | "courses" | "students" | "sessions" | "progress" | "chat" | "notifications" | "gallery" | "banner" | "profile" | "telegram";

const NAV_ITEMS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "courses", label: "مدیریت دوره‌ها", icon: BookOpen },
  { key: "students", label: "لیست هنرجویان", icon: Users },
  { key: "progress", label: "وضعیت پیشرفت هنرجویان", icon: TrendingUp },
  { key: "sessions", label: "تقویم جلسات دوره‌ها", icon: CalendarDays },
  { key: "notifications", label: "ارسال اعلان", icon: Bell },
  { key: "gallery", label: "گالری نمونه‌کارها", icon: ImageIcon },
  { key: "banner", label: "بنر اسلایدی آموزشگاه", icon: ImagePlus },
  { key: "chat", label: "چت با هنرجویان", icon: MessageCircle },
  { key: "profile", label: "پروفایل و استوری", icon: UserCircle2 },
  { key: "telegram", label: "ربات تلگرام", icon: Send },
];

export default function ManagerPanelPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { open: drawerOpen, setOpen: setDrawerOpen } = useMobilePanelDrawer();

  // login form
  const [lp, setLp] = useState({ phone: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/manager");
      if (res.ok) setData(await res.json());
      else setData(null);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (status === "authenticated") fetchData();
    else if (status === "unauthenticated") setLoading(false);
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoginLoading(true); setLoginError("");
    const res = await signIn("credentials", { redirect: false, phone: normalizePhone(lp.phone), password: lp.password });
    setLoginLoading(false);
    if (res?.ok) window.location.reload();
    else setLoginError("شماره یا رمز عبور نادرست است");
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <main className="min-h-screen bg-bg-secondary"><Navbar />
        <div className="pt-28 pb-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
      </main>
    );
  }

  // Login lock screen
  if (!data) {
    return (
      <main className="min-h-screen bg-bg-secondary"><Navbar />
        <div className="pt-28 pb-20 max-w-md mx-auto px-4">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-surface rounded-[28px] border border-border-default overflow-hidden shadow-2xl">
            <div className="p-8 text-center bg-[#0B1120] text-white">
              <div className="w-16 h-16 rounded-[20px] bg-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-black mb-1">پنل مدیران آموزشگاه‌ها</h1>
              <p className="text-[11px] text-slate-400">با حساب مدیریتی که ادمین پلتفرم به شما داده وارد شوید</p>
            </div>
            <form onSubmit={handleLogin} className="p-7 space-y-4">
              {loginError && <div className="p-3.5 rounded-[12px] bg-error-50 text-error-600 text-xs font-bold">{loginError}</div>}
              {status === "authenticated" && (
                <div className="p-3.5 rounded-[12px] bg-warning-50 text-warning-600 text-xs font-bold">
                  حساب فعلی شما به هیچ آموزشگاهی متصل نیست. با حساب مدیر آموزشگاه وارد شوید.
                </div>
              )}
              <div className="relative">
                <input type="tel" value={lp.phone} onChange={(e) => setLp({ ...lp, phone: e.target.value })}
                  className="w-full px-4 py-3.5 pr-11 rounded-[14px] border border-border-default bg-bg-secondary text-sm font-semibold"
                  placeholder="شماره موبایل مدیر" dir="ltr" required />
                <Phone className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={lp.password} onChange={(e) => setLp({ ...lp, password: e.target.value })}
                  className="w-full px-4 py-3.5 pr-11 rounded-[14px] border border-border-default bg-bg-secondary text-sm font-semibold"
                  placeholder="رمز عبور" dir="ltr" required />
                <Lock className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" disabled={loginLoading}
                className="w-full py-3.5 rounded-[14px] text-sm font-black text-white gradient-button shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 cursor-pointer">
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ورود به پنل آموزشگاه"}
              </button>
            </form>
          </motion.div>
        </div>
      </main>
    );
  }

  const { institute } = data;

  return (
    <main className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="pt-20 lg:flex lg:flex-row lg:min-h-screen">
        {/* Mobile top compact bar */}
        <div className="lg:hidden sticky top-20 z-30 bg-[#0B1120]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-[12px] bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-300 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white truncate">{NAV_ITEMS.find(n => n.key === tab)?.label || institute?.name || "پنل آموزشگاه"}</div>
            <div className="text-[10px] text-primary-300 font-bold truncate">{institute?.name || "پنل مدیریت"}</div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-9 h-9 rounded-[10px] bg-error-500/15 hover:bg-error-500/25 text-error-400 flex items-center justify-center cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        )}

        <aside className={`bg-[#0B1120] text-white shrink-0 lg:min-h-[calc(100vh-80px)] lg:w-72 lg:static lg:translate-x-0 lg:border-l lg:border-white/5 lg:block
          fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          ${drawerOpen ? "block" : "hidden lg:block"}`}
          style={{ boxShadow: drawerOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : undefined }}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-primary-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black truncate">{institute.name}</div>
                <div className="text-[10px] text-primary-300 font-bold">پنل مدیریت آموزشگاه</div>
              </div>
            </div>
            <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 rounded-[10px] hover:bg-white/10 text-error-400 cursor-pointer shrink-0" title="خروج">
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
          <div className="p-3 mt-2">
            <div className="bg-white/5 border border-white/10 rounded-[14px] p-4">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-primary-400" />
                <span className="text-[11px] font-black text-white">کد ربات تلگرام</span>
              </div>
              <code className="text-primary-300 font-black tracking-wider text-sm" dir="ltr">{institute.accessCode}</code>
            </div>
          </div>
        </aside>

        {/* Content Area (dark) */}
        <div className="flex-1 bg-[#0B1120] text-white p-4 lg:p-8">
          {tab === "dashboard" && <DashboardTab data={data} />}
          {tab === "courses" && <CoursesTab data={data} refresh={fetchData} />}
          {tab === "students" && <StudentsTab data={data} refresh={fetchData} />}
          {tab === "gallery" && <GalleryTab data={data} refresh={fetchData} />}
          {tab === "banner" && <BannerTab data={data} refresh={fetchData} />}
          {tab === "profile" && (
            <div className="space-y-6">
              <InstituteProfileForm institute={institute} refresh={fetchData} />
              <ProfileStoriesTab institute={institute} refresh={fetchData} />
            </div>
          )}
          {tab === "chat" && <ManagerChatTab data={data} refresh={fetchData} />}
          {tab === "notifications" && <NotificationSenderTab data={data} />}
          {tab === "sessions" && <SessionsManagerTab data={data} />}
          {tab === "progress" && <ProgressManagerTab data={data} refresh={fetchData} />}
          {tab === "telegram" && <TelegramTab institute={institute} />}
        </div>
      </div>
    </main>
  );
}

/* ============================= DASHBOARD TAB ============================= */
function DashboardTab({ data }: { data: any }) {
  const { stats, institute } = data;
  const cards = [
    { label: "کل هنرجویان", value: stats.totalStudents, icon: Users, c: "bg-indigo-600" },
    { label: "در انتظار تأیید", value: stats.pendingCount, icon: Clock, c: "bg-amber-500" },
    { label: "تأیید شده", value: stats.approvedCount, icon: CheckCircle, c: "bg-emerald-500" },
    { label: "درآمد تخمینی (تومان)", value: stats.estimatedRevenue.toLocaleString("fa-IR"), icon: Wallet, c: "bg-fuchsia-600" },
    { label: "دوره‌های فعال", value: stats.totalCourses, icon: BookOpen, c: "bg-sky-500" },
    { label: "امتیاز آموزشگاه", value: institute.rating || "—", icon: ShieldCheck, c: "bg-teal-500" },
  ];
  return (
    <div>
      <h2 className="text-2xl font-black mb-1">داشبورد آموزشگاه</h2>
      <p className="text-slate-400 text-sm mb-6">نمای کلی عملکرد {institute.name}</p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
    </div>
  );
}

/* ============================= COURSES TAB ============================= */
function CoursesTab({ data, refresh }: { data: any; refresh: () => void }) {
  const { courses, categories } = data;
  const [showAdd, setShowAdd] = useState(false);
  const [editCourse, setEditCourse] = useState<any>(null);
  const [bannerCourseId, setBannerCourseId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const emptyForm = {
    title: "", description: "", fullDescription: "", price: "", originalPrice: "",
    capacity: "", duration: "", schedule: "", startDate: "", instructor: "",
    instructorTitle: "", level: "", totalSessions: "", syllabus: [] as string[],
    categoryId: "", requirements: "",
  };
  const [newCourse, setNewCourse] = useState<any>(emptyForm);
  const [syllabusInput, setSyllabusInput] = useState("");

  const act = async (payload: any) => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    setSaving(false);
    if (res.ok) { refresh(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await act({ action: "createCourse", ...newCourse });
    if (ok) { setNewCourse(emptyForm); setShowAdd(false); setMsg("✅ دوره جدید ثبت شد"); }
  };

  const handleDelete = async (courseId: number, title: string) => {
    if (!confirm(`آیا از حذف دوره «${title}» مطمئن هستید؟`)) return;
    await act({ action: "deleteCourse", courseId });
  };

  const uploadCourseBanner = (courseId: number, file: File) => {
    if (file.size > 800_000) { setMsg("❌ حجم تصویر بنر باید کمتر از ۸۰۰KB باشد"); return; }
    const reader = new FileReader();
    reader.onload = () => act({ action: "addCourseBanner", courseId, image: reader.result });
    reader.readAsDataURL(file);
  };

  const deleteCourseBanner = (courseId: number, index: number) => {
    act({ action: "deleteCourseBanner", courseId, index });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black">مدیریت دوره‌ها</h2>
          <p className="text-slate-400 text-sm mt-1">ثبت دوره جدید، ویرایش و حذف دوره‌های آموزشگاه</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-3 rounded-[14px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black flex items-center gap-2 cursor-pointer">
          <Plus className="w-4 h-4" /> ثبت دوره جدید
        </button>
      </div>

      {msg && <div className="mb-4 p-3 rounded-[10px] bg-primary-500/10 text-primary-300 text-xs font-bold">{msg}</div>}

      {showAdd && (
        <form onSubmit={handleCreate} className="bg-[#111a2e] border border-white/10 rounded-[18px] p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="عنوان دوره *" value={newCourse.title} onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <select required value={newCourse.categoryId} onChange={(e) => setNewCourse({ ...newCourse, categoryId: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white cursor-pointer">
            <option value="">انتخاب رشته *</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <MoneyInput value={newCourse.price} onChange={(v) => setNewCourse({ ...newCourse, price: v })} placeholder="شهریه دوره" />
          <input placeholder="ظرفیت (نفر)" type="number" value={newCourse.capacity} onChange={(e) => setNewCourse({ ...newCourse, capacity: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="مدت دوره (مثلاً ۴۰ ساعت)" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <PersianDatePicker value={newCourse.startDate} onChange={(v) => setNewCourse({ ...newCourse, startDate: v })} placeholder="تاریخ شروع دوره" />
          <input placeholder="زمان‌بندی کلاس" value={newCourse.schedule} onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="نام مدرس" value={newCourse.instructor} onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="عنوان مدرس (مدرس کشوری، دکترای...)" value={newCourse.instructorTitle} onChange={(e) => setNewCourse({ ...newCourse, instructorTitle: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <select value={newCourse.level} onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white cursor-pointer">
            <option value="">سطح دوره را انتخاب کنید</option>
            <option value="beginner">مقدماتی</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">پیشرفته</option>
            <option value="comprehensive">جامع از صفر تا صد</option>
          </select>
          <MoneyInput value={newCourse.originalPrice} onChange={(v) => setNewCourse({ ...newCourse, originalPrice: v })} placeholder="قیمت قبل از تخفیف (اختیاری)" />
          <input placeholder="تعداد کل جلسات (مثل: ۲۰)" type="number" value={newCourse.totalSessions} onChange={(e) => setNewCourse({ ...newCourse, totalSessions: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <textarea placeholder="توضیحات کوتاه (برای کارت)" rows={2} value={newCourse.description} onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 md:col-span-2 resize-none" />
          <textarea placeholder="توضیحات کامل (برای صفحه دوره)" rows={3} value={newCourse.fullDescription} onChange={(e) => setNewCourse({ ...newCourse, fullDescription: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 md:col-span-2 resize-none" />
          <textarea placeholder="پیش‌نیازها" rows={2} value={newCourse.requirements} onChange={(e) => setNewCourse({ ...newCourse, requirements: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm text-white placeholder:text-slate-500 md:col-span-2 resize-none" />

          {/* Syllabus */}
          <div className="md:col-span-2 bg-[#0B1120] rounded-[12px] p-3 border border-white/10">
            <div className="text-[11px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              📚 سرفصل‌های دوره ({newCourse.syllabus.length})
            </div>
            <div className="flex gap-2 mb-2">
              <input placeholder="یک سرفصل بنویسید و Enter بزنید" value={syllabusInput}
                onChange={(e) => setSyllabusInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && syllabusInput.trim()) {
                    e.preventDefault();
                    setNewCourse({ ...newCourse, syllabus: [...newCourse.syllabus, syllabusInput.trim()] });
                    setSyllabusInput("");
                  }
                }}
                className="flex-1 px-3 py-2 rounded-[10px] bg-[#111a2e] border border-white/10 text-xs text-white placeholder:text-slate-500" />
              <button type="button" onClick={() => {
                if (syllabusInput.trim()) {
                  setNewCourse({ ...newCourse, syllabus: [...newCourse.syllabus, syllabusInput.trim()] });
                  setSyllabusInput("");
                }
              }} className="px-3 py-2 rounded-[10px] bg-primary-500 text-white text-xs font-black cursor-pointer">افزودن</button>
            </div>
            <div className="space-y-1">
              {newCourse.syllabus.map((s: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-[#111a2e] rounded-[8px] px-2 py-1.5">
                  <span className="text-[10px] font-black text-primary-400 w-5">{i + 1}.</span>
                  <span className="flex-1 text-xs text-white">{s}</span>
                  <button type="button" onClick={() => setNewCourse({ ...newCourse, syllabus: newCourse.syllabus.filter((_: any, j: number) => j !== i) })}
                    className="text-error-400 hover:text-error-300 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="md:col-span-2 py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black cursor-pointer">
            {saving ? "در حال ثبت..." : "ثبت دوره"}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((c: any) => (
          <div key={c.id} className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
            {editCourse?.id === c.id ? (
              <div className="space-y-3">
                {[
                  { k: "title", l: "عنوان دوره" },
                  { k: "capacity", l: "ظرفیت (نفر)" }, { k: "duration", l: "مدت" },
                  { k: "totalSessions", l: "تعداد کل جلسات" },
                  { k: "schedule", l: "زمان‌بندی" },
                  { k: "instructor", l: "مدرس" },
                  { k: "instructorTitle", l: "عنوان مدرس" },
                ].map((f) => (
                  <div key={f.k}>
                    <label className="text-[10px] font-bold text-slate-500">{f.l}</label>
                    <input value={editCourse[f.k] ?? ""} onChange={(e) => setEditCourse({ ...editCourse, [f.k]: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs font-semibold text-white mt-1" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-slate-500">شهریه دوره</label>
                  <div className="mt-1">
                    <MoneyInput value={editCourse.price ?? ""} onChange={(v) => setEditCourse({ ...editCourse, price: v })} placeholder="شهریه" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">قیمت قبل از تخفیف</label>
                  <div className="mt-1">
                    <MoneyInput value={editCourse.originalPrice ?? ""} onChange={(v) => setEditCourse({ ...editCourse, originalPrice: v })} placeholder="قیمت قبل تخفیف" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">تاریخ شروع دوره</label>
                  <div className="mt-1">
                    <PersianDatePicker value={editCourse.startDate ?? ""} onChange={(v) => setEditCourse({ ...editCourse, startDate: v })} placeholder="تاریخ شروع" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">سطح دوره</label>
                  <select value={editCourse.level || ""} onChange={(e) => setEditCourse({ ...editCourse, level: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs font-semibold text-white mt-1 cursor-pointer">
                    <option value="">— انتخاب کنید —</option>
                    <option value="beginner">مقدماتی</option>
                    <option value="intermediate">متوسط</option>
                    <option value="advanced">پیشرفته</option>
                    <option value="comprehensive">جامع از صفر تا صد</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">توضیح کوتاه (روی کارت)</label>
                  <textarea value={editCourse.description || ""} onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })} rows={2}
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs text-white mt-1 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">توضیح کامل (صفحه دوره)</label>
                  <textarea value={editCourse.fullDescription || ""} onChange={(e) => setEditCourse({ ...editCourse, fullDescription: e.target.value })} rows={3}
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs text-white mt-1 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">پیش‌نیازها</label>
                  <textarea value={editCourse.requirements || ""} onChange={(e) => setEditCourse({ ...editCourse, requirements: e.target.value })} rows={2}
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs text-white mt-1 resize-none" />
                </div>
                {/* Syllabus editor */}
                <div className="bg-[#0B1120] rounded-[10px] p-3 border border-white/10">
                  <div className="text-[10px] font-black text-slate-300 mb-2">📚 سرفصل‌های دوره ({(editCourse.syllabus || []).length})</div>
                  <div className="space-y-1.5 mb-2">
                    {(editCourse.syllabus || []).map((sy: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 bg-[#111a2e] rounded-[8px] px-2 py-1.5">
                        <span className="text-[10px] font-black text-primary-400 w-4">{i + 1}.</span>
                        <input value={sy} onChange={(e) => {
                          const arr = [...editCourse.syllabus];
                          arr[i] = e.target.value;
                          setEditCourse({ ...editCourse, syllabus: arr });
                        }} className="flex-1 bg-transparent text-xs text-white outline-none" />
                        <button type="button" onClick={() => {
                          const arr = editCourse.syllabus.filter((_: any, j: number) => j !== i);
                          setEditCourse({ ...editCourse, syllabus: arr });
                        }} className="text-error-400 cursor-pointer"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setEditCourse({ ...editCourse, syllabus: [...(editCourse.syllabus || []), ""] })}
                    className="w-full py-1.5 rounded-[8px] bg-primary-500/15 text-primary-300 text-[10px] font-black cursor-pointer flex items-center justify-center gap-1">
                    <Plus className="w-3 h-3" /> افزودن سرفصل جدید
                  </button>
                </div>
                <div className="flex gap-2">
                  <button disabled={saving} onClick={async () => {
                    const payload = {
                      action: "updateCourse", courseId: c.id,
                      title: editCourse.title, description: editCourse.description, fullDescription: editCourse.fullDescription,
                      price: editCourse.price, originalPrice: editCourse.originalPrice,
                      capacity: editCourse.capacity, duration: editCourse.duration, totalSessions: editCourse.totalSessions,
                      schedule: editCourse.schedule, startDate: editCourse.startDate,
                      instructor: editCourse.instructor, instructorTitle: editCourse.instructorTitle,
                      level: editCourse.level, requirements: editCourse.requirements,
                      syllabus: (editCourse.syllabus || []).filter((x: string) => x && x.trim()),
                    };
                    const ok = await act(payload);
                    if (ok) setEditCourse(null);
                  }} className="flex-1 py-2.5 rounded-[10px] text-xs font-black text-white bg-emerald-500 hover:bg-emerald-600 cursor-pointer">
                    {saving ? "..." : "ذخیره تغییرات"}
                  </button>
                  <button onClick={() => setEditCourse(null)} className="px-4 py-2.5 rounded-[10px] text-xs font-bold bg-white/10 cursor-pointer">انصراف</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-white">{c.title}</h3>
                      {c.registrationClosed && <span className="text-[9px] font-black bg-error-500/20 text-error-400 px-2 py-0.5 rounded-full">ثبت‌نام متوقف</span>}
                      {c.registrationEnded && <span className="text-[9px] font-black bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">زمان تمام شده</span>}
                      {!c.registrationClosed && !c.registrationEnded && (c.capacity > 0 && c.enrolledCount >= c.capacity) && (
                        <span className="text-[9px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">تکمیل ظرفیت</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{c.categoryName}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0 flex-wrap">
                    <button onClick={() => setEditCourse({ ...c })} className="p-2 rounded-[10px] bg-primary-500/15 text-primary-400 hover:bg-primary-500/30 cursor-pointer" title="ویرایش دوره"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setBannerCourseId(bannerCourseId === c.id ? null : c.id)} className="p-2 rounded-[10px] bg-fuchsia-500/15 text-fuchsia-400 hover:bg-fuchsia-500/30 cursor-pointer" title="بنر تبلیغاتی دوره"><ImagePlus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id, c.title)} className="p-2 rounded-[10px] bg-error-500/15 text-error-400 hover:bg-error-500/30 cursor-pointer" title="حذف دوره"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">شهریه: </span><b className="text-emerald-400">{c.price ? Number(c.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">ظرفیت: </span><b className="text-white">{Number(c.enrolledCount).toLocaleString("fa-IR")}/{Number(c.capacity).toLocaleString("fa-IR")}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">شروع: </span><b className="text-white">{c.startDate ? String(c.startDate).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]) : "—"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">مدرس: </span><b className="text-white">{c.instructor || "—"}</b></div>
                </div>

                {/* Registration Management Panel */}
                <div className="bg-[#0B1120] rounded-[12px] p-3 border border-white/5 space-y-2">
                  <div className="text-[10px] font-black text-slate-400 mb-2">🎯 مدیریت ثبت‌نام دوره</div>

                  {/* Toggle 1: Registration closed by manager */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-[8px] bg-[#111a2e]">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-white">توقف/تکمیل ظرفیت</div>
                      <div className="text-[9px] text-slate-500">ثبت‌نام دستی متوقف شود</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => act({ action: "toggleCourseRegistration", courseId: c.id, closed: !c.registrationClosed })}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${c.registrationClosed ? "bg-error-500" : "bg-white/10"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${c.registrationClosed ? "left-0.5" : "left-[22px]"}`} />
                    </button>
                  </div>

                  {/* Toggle 2: Registration period ended */}
                  <div className="flex items-center justify-between gap-2 p-2 rounded-[8px] bg-[#111a2e]">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-white">زمان ثبت‌نام تمام شده</div>
                      <div className="text-[9px] text-slate-500">مهلت ثبت‌نام گذشته است</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => act({ action: "toggleCourseRegistrationEnded", courseId: c.id, ended: !c.registrationEnded })}
                      className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${c.registrationEnded ? "bg-purple-500" : "bg-white/10"}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${c.registrationEnded ? "left-0.5" : "left-[22px]"}`} />
                    </button>
                  </div>

                  {/* Capacity edit */}
                  <button
                    type="button"
                    onClick={async () => {
                      const cur = c.capacity || 0;
                      const raw = prompt(`ظرفیت جدید دوره «${c.title}» را وارد کنید (فعلی: ${cur})`, String(cur));
                      if (raw === null) return;
                      const capacity = parseInt(raw.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))), 10);
                      if (isNaN(capacity) || capacity < 0) { alert("عدد نامعتبر است"); return; }
                      await act({ action: "updateCapacity", courseId: c.id, capacity });
                    }}
                    className="w-full py-1.5 rounded-[8px] bg-sky-500/15 text-sky-400 text-[10px] font-black hover:bg-sky-500/25 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Users className="w-3 h-3" /> ویرایش ظرفیت ({Number(c.capacity).toLocaleString("fa-IR")} نفر)
                  </button>
                </div>

                {bannerCourseId === c.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-black text-white">بنر تبلیغاتی این دوره (حداکثر ۵ عکس)</span>
                      <label className="px-3 py-1.5 rounded-[8px] bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-[10px] font-black cursor-pointer flex items-center gap-1">
                        <ImagePlus className="w-3 h-3" /> افزودن
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCourseBanner(c.id, e.target.files[0])} />
                      </label>
                    </div>
                    {(!c.bannerImages || c.bannerImages.length === 0) ? (
                      <div className="text-[10px] text-slate-500 text-center py-4">هنوز بنری برای این دوره بارگذاری نشده است</div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {c.bannerImages.map((img: string, i: number) => (
                          <div key={i} className="relative group rounded-[8px] overflow-hidden border border-white/10 aspect-video">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => deleteCourseBanner(c.id, i)} className="absolute top-1 left-1 p-1 rounded-[6px] bg-error-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
      {courses.length === 0 && <div className="text-center py-16 text-slate-500 text-sm">هنوز دوره‌ای ثبت نکرده‌اید. با دکمه «ثبت دوره جدید» شروع کنید.</div>}
    </div>
  );
}

/* ============================= STUDENTS TAB ============================= */
function StudentsTab({ data, refresh }: { data: any; refresh: () => void }) {
  const { students } = data;
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [docsModalStudent, setDocsModalStudent] = useState<{ id: number; fullName: string } | null>(null);
  const [feesModalStudent, setFeesModalStudent] = useState<{ id: number; fullName: string; courseTitle: string } | null>(null);

  const act = async (payload: any) => {
    const res = await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (res.ok) { refresh(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const uploadCertificate = (registrationId: number, file: File) => {
    if (file.size > 800_000) { setMsg("❌ حجم فایل باید کمتر از ۸۰۰KB باشد"); return; }
    setUploadingId(registrationId);
    const reader = new FileReader();
    reader.onload = async () => {
      await act({ action: "uploadCertificate", registrationId, certificateUrl: reader.result });
      setUploadingId(null);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">لیست هنرجویان</h2>
      <p className="text-slate-400 text-sm mb-6">تأیید/رد ثبت‌نام و بارگذاری گواهینامه برای هنرجویان تأییدشده</p>
      {msg && <div className="mb-4 p-3 rounded-[10px] bg-error-500/10 text-error-400 text-xs font-bold">{msg}</div>}
      <div className="overflow-x-auto bg-[#111a2e] border border-white/5 rounded-[18px]">
        <table className="w-full text-xs">
          <thead><tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
            <th className="px-5 py-3.5">هنرجو</th><th className="px-5 py-3.5">دوره</th>
            <th className="px-5 py-3.5">موبایل</th><th className="px-5 py-3.5">تاریخ</th>
            <th className="px-5 py-3.5">وضعیت</th><th className="px-5 py-3.5">اقدام</th><th className="px-5 py-3.5">گواهینامه</th>
            <th className="px-5 py-3.5">مدارک</th>
            <th className="px-5 py-3.5">شهریه و اقساط</th>
          </tr></thead>
          <tbody className="divide-y divide-white/5">
            {students.map((s: any) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-5 py-3.5 font-bold text-white">{s.fullName}
                  {s.notes && <div className="text-[10px] text-slate-500 font-normal line-clamp-1">{s.notes}</div>}
                </td>
                <td className="px-5 py-3.5 text-slate-300">{s.courseTitle}</td>
                <td className="px-5 py-3.5 font-bold text-white" dir="ltr">{s.phone}</td>
                <td className="px-5 py-3.5 text-slate-500 text-[10px]">{new Date(s.createdAt).toLocaleDateString("fa-IR")}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
                    s.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : s.status === "rejected" ? "bg-error-500/15 text-error-400" : "bg-amber-500/15 text-amber-400"}`}>
                    {s.status === "approved" ? "تأیید شد" : s.status === "rejected" ? "رد شد" : "در انتظار"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <button disabled={s.status === "approved"} onClick={() => act({ action: "updateStatus", registrationId: s.id, status: "approved" })}
                      className="p-1.5 rounded-[8px] bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                    <button disabled={s.status === "rejected"} onClick={() => act({ action: "updateStatus", registrationId: s.id, status: "rejected" })}
                      className="p-1.5 rounded-[8px] bg-error-500/15 text-error-400 hover:bg-error-500/30 disabled:opacity-30 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {s.status === "approved" ? (
                    s.certificateUrl ? (
                      <a href={s.certificateUrl} download={`گواهینامه-${s.fullName}.png`} className="text-emerald-400 hover:underline font-bold flex items-center gap-1"><Award className="w-3.5 h-3.5" /> دانلود</a>
                    ) : (
                      <label className="text-primary-400 hover:underline font-bold cursor-pointer flex items-center gap-1">
                        {uploadingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />} بارگذاری
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadCertificate(s.id, e.target.files[0])} />
                      </label>
                    )
                  ) : <span className="text-slate-600">—</span>}
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => setDocsModalStudent({ id: s.id, fullName: s.fullName })}
                    className="px-3 py-1.5 rounded-[8px] bg-primary-500/15 hover:bg-primary-500/30 text-primary-400 text-[10px] font-black cursor-pointer flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" /> مدیریت مدارک
                  </button>
                </td>
                <td className="px-5 py-3.5">
                  <button
                    onClick={() => setFeesModalStudent({ id: s.id, fullName: s.fullName, courseTitle: s.courseTitle })}
                    className="px-3 py-1.5 rounded-[8px] bg-amber-500/15 hover:bg-amber-500/30 text-amber-400 text-[10px] font-black cursor-pointer flex items-center gap-1"
                  >
                    <Wallet className="w-3.5 h-3.5" /> اقساط و هزینه‌ها
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && <div className="p-10 text-center text-slate-500 text-sm">هنوز هنرجویی ثبت‌نام نکرده است</div>}
      </div>

      {docsModalStudent && (
        <StudentDocumentsModal
          registrationId={docsModalStudent.id}
          studentName={docsModalStudent.fullName}
          onClose={() => setDocsModalStudent(null)}
        />
      )}

      {feesModalStudent && (
        <StudentFeesModal
          registrationId={feesModalStudent.id}
          studentName={feesModalStudent.fullName}
          courseTitle={feesModalStudent.courseTitle}
          onClose={() => setFeesModalStudent(null)}
        />
      )}
    </div>
  );
}

/* ============================= GALLERY TAB ============================= */
function GalleryTab({ data, refresh }: { data: any; refresh: () => void }) {
  const { institute } = data;
  const [msg, setMsg] = useState("");

  const uploadImage = (file: File) => {
    if (file.size > 500_000) { setMsg("❌ حجم تصویر باید کمتر از ۵۰۰KB باشد"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addImage", image: reader.result }) });
      if (res.ok) refresh(); else setMsg("❌ خطا در آپلود");
    };
    reader.readAsDataURL(file);
  };

  const deleteImage = async (index: number) => {
    await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteImage", index }) });
    refresh();
  };

  return (
    <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-white">گالری تصاویر و نمونه‌کارها</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">در صفحه عمومی آموزشگاه شما نمایش داده می‌شوند (حداکثر ۵۰۰KB)</p>
        </div>
        <label className="px-4 py-2.5 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black cursor-pointer flex items-center gap-1.5">
          <ImagePlus className="w-4 h-4" /> افزودن تصویر
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
        </label>
      </div>
      {msg && <div className="mb-4 p-3 rounded-[10px] bg-error-500/10 text-error-400 text-xs font-bold">{msg}</div>}
      {institute.images.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">هنوز تصویری بارگذاری نشده است</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {institute.images.map((img: string, i: number) => (
            <div key={i} className="relative group rounded-[14px] overflow-hidden border border-white/10 aspect-square">
              <img src={img} alt={`نمونه‌کار ${i + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => deleteImage(i)} className="absolute top-2 left-2 p-1.5 rounded-[8px] bg-error-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= BANNER TAB ============================= */
function BannerTab({ data, refresh }: { data: any; refresh: () => void }) {
  const { institute } = data;
  const [msg, setMsg] = useState("");

  const uploadBanner = (file: File) => {
    if (file.size > 800_000) { setMsg("❌ حجم تصویر بنر باید کمتر از ۸۰۰KB باشد"); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "addBanner", image: reader.result }) });
      if (res.ok) refresh(); else setMsg("❌ خطا در آپلود");
    };
    reader.readAsDataURL(file);
  };

  const deleteBanner = async (index: number) => {
    await fetch("/api/manager", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "deleteBanner", index }) });
    refresh();
  };

  return (
    <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-black text-white">بنر اسلایدی آموزشگاه</h3>
          <p className="text-[10px] text-slate-500 mt-0.5">این اسلایدها در بالای صفحه اختصاصی آموزشگاه شما نمایش داده می‌شوند (حداکثر ۷ عکس، هرکدام تا ۸۰۰KB)</p>
        </div>
        <label className="px-4 py-2.5 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 shrink-0">
          <ImagePlus className="w-4 h-4" /> افزودن اسلاید
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadBanner(e.target.files[0])} />
        </label>
      </div>
      {msg && <div className="mb-4 p-3 rounded-[10px] bg-error-500/10 text-error-400 text-xs font-bold">{msg}</div>}
      {institute.bannerImages.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">هنوز اسلایدی برای بنر آموزشگاه بارگذاری نشده است</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {institute.bannerImages.map((img: string, i: number) => (
            <div key={i} className="relative group rounded-[14px] overflow-hidden border border-white/10 aspect-video">
              <img src={img} alt={`بنر ${i + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => deleteBanner(i)} className="absolute top-2 left-2 p-1.5 rounded-[8px] bg-error-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= TELEGRAM TAB ============================= */
function TelegramTab({ institute }: { institute: any }) {
  return (
    <div>
      <h2 className="text-2xl font-black mb-1">ربات تلگرام اختصاصی آموزشگاه</h2>
      <p className="text-slate-400 text-sm mb-6">با اتصال ربات، اعلان ثبت‌نام‌های جدید آموزشگاه شما فوراً به تلگرام ارسال می‌شود و می‌توانید لیست هنرجویان را در تلگرام هم مشاهده کنید</p>
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-[18px] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h3 className="font-black mb-2">کد اختصاصی آموزشگاه شما:</h3>
          <code className="text-2xl font-black tracking-[0.3em] bg-white/15 px-4 py-2 rounded-[10px] inline-block" dir="ltr">{institute.accessCode}</code>
          <p className="text-xs text-sky-100 mt-3">این کد را در ربات تلگرام ارسال کنید یا مستقیم روی دکمه زیر بزنید</p>
        </div>
        <a href={`https://t.me/amoozeshghah_bot?start=${institute.accessCode}`} target="_blank" rel="noopener noreferrer"
          className="px-6 py-3.5 rounded-[14px] bg-white text-sky-800 text-sm font-black shrink-0 flex items-center gap-2 shadow-xl">
          <Send className="w-4 h-4" /> اتصال به ربات تلگرام
        </a>
      </div>
    </div>
  );
}

/* ============================= MANAGER CHAT TAB ============================= */
function ManagerChatTab({ data }: { data: any; refresh: () => void }) {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    fetch("/api/chat/threads")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setThreads(d); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const students = (data?.students || []) as any[];
  const uniqueStudents = Array.from(
    new Map(students.map((s: any) => [s.phone, s])).values()
  );

  const startChat = async (studentPhone: string, studentName: string) => {
    setMsg(null);
    // Look up user by phone (via a small endpoint)
    const r = await fetch(`/api/lookup-user?phone=${encodeURIComponent(studentPhone)}`);
    const d = await r.json();
    if (!d.userId) {
      setMsg({ type: "err", text: `هنرجو «${studentName}» هنوز حساب کاربری فعال ندارد. باید ابتدا وارد سایت شود.` });
      return;
    }
    // Open chat with that user
    window.location.href = `/chat?with=${d.userId}&role=student`;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><MessageCircle className="w-6 h-6 text-primary-400" />چت با هنرجویان</h2>
        <p className="text-slate-400 text-sm mt-1">با هنرجویان دوره‌های خود مستقیم گفتگو کنید.</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"}`}>{msg.text}</div>
      )}

      {/* Active chat threads */}
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

      {/* Students list to start new chat */}
      <div>
        <h3 className="text-sm font-black text-slate-300 mb-3">شروع گفتگوی جدید ({uniqueStudents.length} هنرجو)</h3>
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : uniqueStudents.length === 0 ? (
          <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[14px]">
            <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">هنوز هنرجویی ثبت‌نام نکرده است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {uniqueStudents.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 bg-[#111a2e] border border-white/5 rounded-[14px]">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm truncate">{s.fullName}</div>
                  <div className="text-[10px] text-slate-500" dir="ltr">{s.phone}</div>
                </div>
                <button onClick={() => startChat(s.phone, s.fullName)}
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

/* ============================= NOTIFICATION SENDER TAB (manager → students) ============================= */
function NotificationSenderTab({ data }: { data: any }) {
  const [form, setForm] = useState({ title: "", body: "", type: "info", courseId: "" });
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const courses = data?.courses || [];

  const send = async () => {
    if (!form.title.trim()) { setMsg({ type: "err", text: "عنوان اعلان الزامی است" }); return; }
    setSending(true); setMsg(null);
    try {
      const payload: any = {
        action: "sendNotification",
        title: form.title,
        body: form.body,
        type: form.type,
      };
      if (form.courseId) payload.courseId = Number(form.courseId);
      const res = await fetch("/api/manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: `✅ اعلان به ${d.sent} هنرجو ارسال شد.` });
        setForm({ title: "", body: "", type: "info", courseId: "" });
      } else {
        setMsg({ type: "err", text: d.error || "خطا در ارسال" });
      }
    } catch {
      setMsg({ type: "err", text: "خطا در ارتباط با سرور" });
    } finally { setSending(false); }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><Bell className="w-6 h-6 text-primary-400" /> ارسال اعلان به هنرجویان</h2>
        <p className="text-slate-400 text-sm mt-1">به هنرجویان یک دوره خاص یا همه‌ی هنرجویان آموزشگاه اعلان بفرستید.</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"}`}>{msg.text}</div>
      )}

      <div className="bg-[#111a2e] border border-white/10 rounded-[18px] p-5 space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-400 mb-1 block">گیرندگان</label>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white cursor-pointer">
            <option value="">همه هنرجویان تأییدشده آموزشگاه</option>
            {courses.map((c: any) => (
              <option key={c.id} value={c.id}>هنرجویان دوره: {c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 mb-1 block">نوع اعلان</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white cursor-pointer">
            <option value="info">🔔 اطلاع‌رسانی عمومی</option>
            <option value="success">✅ خبر خوب / موفقیت</option>
            <option value="warning">⚠️ هشدار</option>
            <option value="error">❌ خطا / لغو</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 mb-1 block">عنوان *</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="مثال: تغییر زمان کلاس آموزشی"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
        </div>

        <div>
          <label className="text-[11px] font-bold text-slate-400 mb-1 block">متن اعلان</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={4} placeholder="متن اعلان را وارد کنید..."
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
        </div>

        <button onClick={send} disabled={sending || !form.title.trim()}
          className="w-full py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          ارسال اعلان
        </button>
      </div>
    </div>
  );
}

/* ============================= SESSIONS MANAGER TAB (course schedule) ============================= */
function SessionsManagerTab({ data }: { data: any }) {
  const courses = data?.courses || [];
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(courses[0]?.id || null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    sessionNumber: "", title: "", sessionDate: "", sessionTime: "",
    duration: "", isOnline: false, meetingUrl: "",
  });
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    if (!selectedCourseId) return;
    setLoading(true);
    fetch(`/api/manager/sessions?courseId=${selectedCourseId}`)
      .then((r) => r.json())
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [selectedCourseId]);

  const resetForm = () => {
    setForm({ sessionNumber: "", title: "", sessionDate: "", sessionTime: "", duration: "", isOnline: false, meetingUrl: "" });
    setEditingId(null);
    setShowAdd(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setMsg(null);
    try {
      const method = editingId ? "PATCH" : "POST";
      const body: any = { ...form, courseId: selectedCourseId };
      if (editingId) body.id = editingId;
      const res = await fetch("/api/manager/sessions", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: editingId ? "جلسه ویرایش شد" : "جلسه اضافه شد" });
        resetForm();
        load();
      } else {
        setMsg({ type: "err", text: d.error || "خطا" });
      }
    } catch { setMsg({ type: "err", text: "خطا در ارتباط با سرور" }); }
  };

  const remove = async (id: number) => {
    if (!confirm("حذف این جلسه؟")) return;
    await fetch("/api/manager/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      sessionNumber: s.sessionNumber || "",
      title: s.title || "",
      sessionDate: s.sessionDate || "",
      sessionTime: s.sessionTime || "",
      duration: s.duration || "",
      isOnline: !!s.isOnline,
      meetingUrl: s.meetingUrl || "",
    });
    setShowAdd(true);
  };

  const selectedCourse = courses.find((c: any) => c.id === selectedCourseId);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><CalendarDays className="w-6 h-6 text-primary-400" /> تقویم جلسات دوره‌ها</h2>
        <p className="text-slate-400 text-sm mt-1">جلسات هر دوره را زمان‌بندی کنید تا در تقویم آموزشی هنرجویان نمایش داده شود.</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"}`}>{msg.text}</div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">ابتدا یک دوره در تب «مدیریت دوره‌ها» ایجاد کنید.</p>
        </div>
      ) : (
        <>
          {/* Course selector */}
          <div className="mb-5">
            <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">انتخاب دوره</label>
            <select value={selectedCourseId || ""} onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-[12px] bg-[#111a2e] border border-white/10 text-sm font-bold text-white cursor-pointer">
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title} ({c.enrolledCount || 0} هنرجو)</option>
              ))}
            </select>
            {selectedCourse && (
              <p className="text-[10px] text-slate-500 mt-1.5">
                کل جلسات این دوره: <b className="text-primary-300">{selectedCourse.totalSessions || "تعیین نشده"}</b>
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-white text-sm">جلسات ثبت‌شده ({sessions.length})</h3>
            <button onClick={() => { resetForm(); setShowAdd(!showAdd); }}
              className="px-4 py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /> افزودن جلسه جدید
            </button>
          </div>

          {showAdd && (
            <form onSubmit={submit} className="bg-[#111a2e] border border-white/10 rounded-[16px] p-5 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">شماره جلسه</label>
                <input type="number" min="1" value={form.sessionNumber} onChange={(e) => setForm({ ...form, sessionNumber: e.target.value })}
                  placeholder="خودکار"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">مدت جلسه</label>
                <input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="مثل: ۹۰ دقیقه"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">عنوان جلسه *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: مقدمه بر برنامه‌نویسی"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">تاریخ جلسه</label>
                <PersianDatePicker value={form.sessionDate} onChange={(v) => setForm({ ...form, sessionDate: v })} placeholder="انتخاب تاریخ" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 mb-1 block">ساعت</label>
                <input value={form.sessionTime} onChange={(e) => setForm({ ...form, sessionTime: e.target.value })}
                  placeholder="مثل: ۱۶:۰۰ - ۱۸:۰۰" dir="ltr"
                  className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white text-right" />
              </div>
              <div className="md:col-span-2 flex items-center gap-3 p-2 bg-[#0B1120] rounded-[10px] border border-white/10">
                <button type="button" onClick={() => setForm({ ...form, isOnline: !form.isOnline })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isOnline ? "bg-primary-600" : "bg-white/10"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.isOnline ? "left-0.5" : "left-[22px]"}`} />
                </button>
                <span className="text-xs font-black text-white flex items-center gap-1"><Video className="w-3.5 h-3.5" /> جلسه آنلاین است</span>
              </div>
              {form.isOnline && (
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 mb-1 block">لینک ورود به کلاس</label>
                  <input value={form.meetingUrl} onChange={(e) => setForm({ ...form, meetingUrl: e.target.value })}
                    placeholder="https://meet.google.com/..." dir="ltr"
                    className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white text-right" />
                </div>
              )}
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="flex-1 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black">
                  {editingId ? "ذخیره تغییرات" : "افزودن جلسه"}
                </button>
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 rounded-[10px] bg-white/10 text-white text-xs font-black">انصراف</button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-[#111a2e] border border-white/5 rounded-[14px]">
              <CalendarDays className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-slate-500 text-sm">هنوز جلسه‌ای برای این دوره ثبت نکرده‌اید.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="bg-[#111a2e] border border-white/5 rounded-[14px] p-4 flex items-start gap-3">
                  <div className="w-14 h-14 rounded-[12px] bg-primary-500/15 border border-primary-500/30 flex flex-col items-center justify-center shrink-0">
                    <div className="text-[9px] text-primary-300 font-black">جلسه</div>
                    <div className="text-lg font-black text-white">{String(s.sessionNumber || "?").replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm text-white">{s.title}</h4>
                    <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                      {s.sessionDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{String(s.sessionDate).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}</span>}
                      {s.sessionTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.sessionTime}</span>}
                      {s.duration && <span>مدت: {s.duration}</span>}
                      {s.isOnline && <span className="text-primary-300 flex items-center gap-1"><Video className="w-3 h-3" /> آنلاین</span>}
                    </div>
                    {s.isOnline && s.meetingUrl && (
                      <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary-300 mt-1 flex items-center gap-1" dir="ltr">
                        <LinkIcon className="w-3 h-3" />{s.meetingUrl}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(s)} className="p-2 rounded-[8px] bg-primary-500/15 text-primary-400 hover:bg-primary-500/25 cursor-pointer">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(s.id)} className="p-2 rounded-[8px] bg-error-500/15 text-error-400 hover:bg-error-500/25 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================= PROGRESS MANAGER TAB (student progress) ============================= */
function ProgressManagerTab({ data, refresh }: { data: any; refresh: () => void }) {
  const students = (data?.students || []).filter((s: any) => s.status === "approved");
  const courses = data?.courses || [];
  const [savingId, setSavingId] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<number, { progress?: number; sessionsAttended?: number }>>({});

  const save = async (regId: number, courseTitle: string, studentName: string) => {
    const draft = drafts[regId] || {};
    if (draft.progress === undefined && draft.sessionsAttended === undefined) return;
    setSavingId(regId);
    setMsg(null);
    try {
      const res = await fetch("/api/manager/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: regId,
          progress: draft.progress,
          sessionsAttended: draft.sessionsAttended,
          notifyStudent: true,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: `✅ پیشرفت ${studentName} در دوره «${courseTitle}» ذخیره شد` });
        setDrafts((prev) => { const c = { ...prev }; delete c[regId]; return c; });
        refresh();
      } else {
        setMsg({ type: "err", text: d.error || "خطا" });
      }
    } catch {
      setMsg({ type: "err", text: "خطا در ارتباط با سرور" });
    } finally { setSavingId(null); }
  };

  const getCurrentProgress = (s: any) => drafts[s.id]?.progress ?? s.progress ?? 0;
  const getCurrentSessions = (s: any) => drafts[s.id]?.sessionsAttended ?? s.sessionsAttended ?? 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black flex items-center gap-2"><TrendingUp className="w-6 h-6 text-primary-400" /> وضعیت پیشرفت هنرجویان</h2>
        <p className="text-slate-400 text-sm mt-1">درصد پیشرفت و تعداد جلسات شرکت‌کرده هر هنرجو را به‌روزرسانی کنید. هنرجو خودکار اعلان می‌گیرد.</p>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/10 text-emerald-300" : "bg-error-500/10 text-error-400"}`}>{msg.text}</div>
      )}

      {students.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <Users className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">هیچ هنرجوی تأییدشده‌ای وجود ندارد.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {students.map((s: any) => {
            const c = courses.find((cc: any) => cc.title === s.courseTitle);
            const totalSess = c?.totalSessions || 0;
            const curProgress = getCurrentProgress(s);
            const curSessions = getCurrentSessions(s);
            const hasChanges = drafts[s.id] !== undefined;

            return (
              <div key={s.id} className="bg-[#111a2e] border border-white/5 rounded-[14px] p-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-white text-sm">{s.fullName}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      دوره: <b className="text-primary-300">{s.courseTitle}</b>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5" dir="ltr">{s.phone}</div>
                  </div>
                  {curProgress >= 100 && (
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      🎉 تکمیل
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-slate-400">درصد پیشرفت</span>
                    <span className="font-black text-primary-300">{String(curProgress).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 transition-all" style={{ width: `${curProgress}%` }} />
                  </div>
                  <input type="range" min="0" max="100" step="5" value={curProgress}
                    onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], progress: Number(e.target.value) } })}
                    className="w-full accent-primary-500" />
                </div>

                {/* Sessions attended */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">جلسات شرکت‌کرده</label>
                    <input type="number" min="0" max={totalSess || 100} value={curSessions}
                      onChange={(e) => setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], sessionsAttended: Number(e.target.value) } })}
                      className="w-full px-3 py-2 rounded-[8px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">کل جلسات دوره</label>
                    <div className="px-3 py-2 rounded-[8px] bg-[#0B1120] border border-white/10 text-sm text-slate-500">
                      {String(totalSess || "—").replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}
                    </div>
                  </div>
                </div>

                {hasChanges && (
                  <button onClick={() => save(s.id, s.courseTitle, s.fullName)} disabled={savingId === s.id}
                    className="w-full py-2 rounded-[8px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5">
                    {savingId === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    ذخیره تغییرات و اطلاع به هنرجو
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT FEES MODAL — installments + extra fees management
   ═══════════════════════════════════════════════════════════════ */
type FeeExtraType = "certificate" | "exam_first" | "exam_retry" | "government_dahak" | "extra";

const EXTRA_FEE_PRESETS: { type: FeeExtraType; label: string; icon: any; color: string; defaultTitle: string; defaultOptional: boolean }[] = [
  { type: "certificate", label: "💎 هزینه صدور مدرک", icon: Award, color: "text-amber-300", defaultTitle: "هزینه صدور مدرک فنی و حرفه‌ای", defaultOptional: false },
  { type: "exam_first", label: "📝 هزینه آزمون اول", icon: BookOpen, color: "text-cyan-300", defaultTitle: "هزینه آزمون اصلی دوره", defaultOptional: false },
  { type: "exam_retry", label: "🔄 آزمون مجدد", icon: XCircle, color: "text-orange-300", defaultTitle: "هزینه آزمون مجدد (در صورت مردودی)", defaultOptional: true },
  { type: "government_dahak", label: "🏛️ دهک‌بندی دولت", icon: ShieldCheck, color: "text-fuchsia-300", defaultTitle: "کسری دهک‌بندی دولتی", defaultOptional: true },
  { type: "extra", label: "💰 سایر هزینه‌ها", icon: Plus, color: "text-slate-300", defaultTitle: "هزینه اضافه", defaultOptional: false },
];

function StudentFeesModal({ registrationId, studentName, courseTitle, onClose }: {
  registrationId: number; studentName: string; courseTitle: string; onClose: () => void;
}) {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Installments plan builder
  const [showInstallments, setShowInstallments] = useState(false);
  const [installmentRows, setInstallmentRows] = useState<{ amount: string; dueDate: string; title: string }[]>([
    { amount: "", dueDate: "", title: "" },
  ]);

  // Extra fee form
  const [showExtra, setShowExtra] = useState<FeeExtraType | null>(null);
  const [extraForm, setExtraForm] = useState({ title: "", amount: "", dueDate: "", isOptional: false, description: "" });

  const load = () => {
    setLoading(true);
    fetch(`/api/manager/fees?registrationId=${registrationId}`)
      .then((r) => r.json())
      .then((d) => setFees(Array.isArray(d) ? d : []))
      .catch(() => setFees([]))
      .finally(() => setLoading(false));
  };
  useEffect(load, [registrationId]);

  const toPersian = (str: string | number) => String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  const existingInstallments = fees.filter((f) => f.type === "installment");
  const existingExtras = fees.filter((f) => f.type !== "installment");
  const totalPayable = fees.filter((f) => f.status !== "waived").reduce((s, f) => s + Number(f.amount || 0), 0);
  const totalPaid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + Number(f.amount || 0), 0);

  const addInstallmentRow = () => setInstallmentRows([...installmentRows, { amount: "", dueDate: "", title: "" }]);
  const removeInstallmentRow = (i: number) => setInstallmentRows(installmentRows.filter((_, j) => j !== i));
  const updateInstallmentRow = (i: number, k: string, v: string) => {
    const rows = [...installmentRows];
    (rows[i] as any)[k] = v;
    setInstallmentRows(rows);
  };

  const saveInstallments = async () => {
    const valid = installmentRows.filter((r) => Number(r.amount) > 0);
    if (valid.length === 0) { setMsg({ type: "err", text: "حداقل یک قسط با مبلغ معتبر وارد کنید" }); return; }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/manager/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId, plan: "installments",
          installments: valid.map((r) => ({ amount: Number(r.amount), dueDate: r.dueDate, title: r.title })),
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: `✅ ${valid.length} قسط ثبت شد.` });
        setShowInstallments(false);
        setInstallmentRows([{ amount: "", dueDate: "", title: "" }]);
        load();
      } else { setMsg({ type: "err", text: d.error || "خطا" }); }
    } catch { setMsg({ type: "err", text: "خطا در ارتباط با سرور" }); }
    finally { setSaving(false); }
  };

  const startExtra = (type: FeeExtraType) => {
    const preset = EXTRA_FEE_PRESETS.find((p) => p.type === type)!;
    setExtraForm({ title: preset.defaultTitle, amount: "", dueDate: "", isOptional: preset.defaultOptional, description: "" });
    setShowExtra(type);
  };

  const saveExtra = async () => {
    if (!extraForm.title.trim() || !Number(extraForm.amount)) {
      setMsg({ type: "err", text: "عنوان و مبلغ الزامی است" }); return;
    }
    setSaving(true); setMsg(null);
    try {
      const res = await fetch("/api/manager/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId, plan: "extra",
          type: showExtra,
          title: extraForm.title,
          amount: Number(extraForm.amount),
          dueDate: extraForm.dueDate,
          isOptional: extraForm.isOptional,
          description: extraForm.description,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: "✅ هزینه اضافه ثبت شد." });
        setShowExtra(null);
        load();
      } else { setMsg({ type: "err", text: d.error || "خطا" }); }
    } catch { setMsg({ type: "err", text: "خطا در ارتباط با سرور" }); }
    finally { setSaving(false); }
  };

  const markPaid = async (id: number) => {
    if (!confirm("تأیید پرداخت این قسط/هزینه (دستی/نقدی)؟")) return;
    await fetch("/api/manager/fees", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, markPaid: true, method: "manual" }),
    });
    load();
  };
  const markUnpaid = async (id: number) => {
    if (!confirm("لغو پرداخت این قسط؟")) return;
    await fetch("/api/manager/fees", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, markUnpaid: true }),
    });
    load();
  };
  const markWaived = async (id: number) => {
    if (!confirm("بخشیدن این هزینه (بدون پرداخت)؟")) return;
    await fetch("/api/manager/fees", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, markWaived: true }),
    });
    load();
  };
  const removeFee = async (id: number) => {
    if (!confirm("حذف کامل این ردیف؟")) return;
    await fetch("/api/manager/fees", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0B1120] rounded-[24px] border border-white/10 w-full max-w-3xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-l from-primary-500/20 via-primary-500/10 to-transparent border-b border-white/10 p-5 flex items-center justify-between backdrop-blur-lg">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-5 h-5 text-amber-400" />
              <h3 className="font-black text-white">مدیریت شهریه و اقساط</h3>
            </div>
            <p className="text-[11px] text-slate-400">
              هنرجو: <b className="text-white">{studentName}</b> • دوره: <b className="text-primary-300">{courseTitle}</b>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[10px] bg-white/10 hover:bg-white/20"><X className="w-4 h-4 text-white" /></button>
        </div>

        <div className="p-5">
          {msg && (
            <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-error-500/15 text-error-400"}`}>{msg.text}</div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            <div className="bg-[#111a2e] rounded-[12px] p-3 text-center">
              <div className="text-[9px] text-slate-500 mb-1">کل قابل پرداخت</div>
              <div className="text-sm font-black text-white" dir="ltr">{toPersian(totalPayable.toLocaleString("fa-IR"))}</div>
            </div>
            <div className="bg-emerald-500/10 rounded-[12px] p-3 text-center border border-emerald-500/30">
              <div className="text-[9px] text-emerald-400 mb-1">پرداخت‌شده</div>
              <div className="text-sm font-black text-emerald-300" dir="ltr">{toPersian(totalPaid.toLocaleString("fa-IR"))}</div>
            </div>
            <div className="bg-amber-500/10 rounded-[12px] p-3 text-center border border-amber-500/30">
              <div className="text-[9px] text-amber-400 mb-1">باقی‌مانده</div>
              <div className="text-sm font-black text-amber-300" dir="ltr">{toPersian((totalPayable - totalPaid).toLocaleString("fa-IR"))}</div>
            </div>
          </div>

          {/* Add installments plan */}
          <div className="mb-5">
            <button onClick={() => setShowInstallments(!showInstallments)}
              className="w-full py-3 rounded-[12px] bg-gradient-to-l from-primary-600 to-primary-700 text-white text-sm font-black flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" /> {existingInstallments.length > 0 ? "ویرایش اقساط شهریه" : "ایجاد برنامه قسط‌بندی شهریه"}
            </button>

            {showInstallments && (
              <div className="mt-3 bg-[#111a2e] rounded-[16px] p-4 border border-white/10">
                <div className="text-xs font-black text-slate-300 mb-3">اقساط را وارد کنید:</div>
                <div className="space-y-2 mb-3">
                  {installmentRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-start">
                      <div className="w-8 h-10 rounded-[8px] bg-primary-500/20 text-primary-300 flex items-center justify-center text-xs font-black">
                        {toPersian(i + 1)}
                      </div>
                      <MoneyInput value={row.amount} onChange={(v) => updateInstallmentRow(i, "amount", v)} placeholder={`مبلغ قسط ${i + 1}`} showWord={false} />
                      <PersianDatePicker value={row.dueDate} onChange={(v) => updateInstallmentRow(i, "dueDate", v)} placeholder="تاریخ سررسید" />
                      <button onClick={() => removeInstallmentRow(i)} disabled={installmentRows.length === 1}
                        className="w-10 h-10 rounded-[8px] bg-error-500/15 text-error-400 disabled:opacity-30 flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addInstallmentRow}
                  className="w-full py-2 rounded-[10px] bg-white/5 hover:bg-white/10 text-primary-300 text-[11px] font-black flex items-center justify-center gap-1 mb-3">
                  <Plus className="w-3.5 h-3.5" /> افزودن قسط دیگر
                </button>
                <div className="flex gap-2">
                  <button onClick={saveInstallments} disabled={saving}
                    className="flex-1 py-2.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    ذخیره و اطلاع به هنرجو
                  </button>
                  <button onClick={() => setShowInstallments(false)} className="px-4 py-2.5 rounded-[10px] bg-white/10 text-white text-xs font-black">لغو</button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">⚠️ اقساط قبلی پرداخت‌نشده جایگزین می‌شوند</p>
              </div>
            )}
          </div>

          {/* Extra fees */}
          <div className="mb-5">
            <div className="text-xs font-black text-slate-300 mb-2">افزودن هزینه جانبی:</div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {EXTRA_FEE_PRESETS.map((p) => (
                <button key={p.type} onClick={() => startExtra(p.type)}
                  className={`p-2.5 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black ${p.color} flex flex-col items-center gap-1`}>
                  {p.label}
                </button>
              ))}
            </div>

            {showExtra && (
              <div className="mt-3 bg-[#111a2e] rounded-[16px] p-4 border border-amber-500/30">
                <div className="text-xs font-black text-amber-300 mb-3">{EXTRA_FEE_PRESETS.find((p) => p.type === showExtra)?.label}</div>
                <div className="space-y-2">
                  <input value={extraForm.title} onChange={(e) => setExtraForm({ ...extraForm, title: e.target.value })}
                    placeholder="عنوان هزینه" className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  <MoneyInput value={extraForm.amount} onChange={(v) => setExtraForm({ ...extraForm, amount: v })} placeholder="مبلغ" />
                  <PersianDatePicker value={extraForm.dueDate} onChange={(v) => setExtraForm({ ...extraForm, dueDate: v })} placeholder="تاریخ سررسید (اختیاری)" />
                  <textarea value={extraForm.description} onChange={(e) => setExtraForm({ ...extraForm, description: e.target.value })}
                    placeholder="توضیح (اختیاری)" rows={2} className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs text-white resize-none" />
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input type="checkbox" checked={extraForm.isOptional} onChange={(e) => setExtraForm({ ...extraForm, isOptional: e.target.checked })} />
                    این هزینه اختیاری است (مثل دهک‌بندی که برای همه اعمال نمی‌شود)
                  </label>
                  <div className="flex gap-2 pt-2">
                    <button onClick={saveExtra} disabled={saving}
                      className="flex-1 py-2.5 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white text-xs font-black">
                      {saving ? "..." : "افزودن هزینه"}
                    </button>
                    <button onClick={() => setShowExtra(null)} className="px-4 py-2.5 rounded-[10px] bg-white/10 text-white text-xs font-black">لغو</button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Existing fees list */}
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : fees.length === 0 ? (
            <div className="text-center py-8 bg-[#111a2e] rounded-[14px] text-slate-500 text-xs">
              هنوز هیچ برنامه پرداخت یا هزینه‌ای برای این هنرجو ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2">
              {fees.map((f) => {
                const paid = f.status === "paid";
                const waived = f.status === "waived";
                return (
                  <div key={f.id} className={`rounded-[12px] p-3 border ${
                    paid ? "bg-emerald-500/5 border-emerald-500/30"
                    : waived ? "bg-slate-500/5 border-slate-500/30 opacity-70"
                    : "bg-[#111a2e] border-white/10"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 text-white text-xs font-black ${
                        paid ? "bg-emerald-500" : waived ? "bg-slate-500" : f.type === "installment" ? "bg-primary-500" : "bg-amber-500"
                      }`}>
                        {paid ? <Check className="w-4 h-4" /> : waived ? <X className="w-4 h-4" /> : f.type === "installment" ? toPersian(f.installmentNumber) : "$"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white truncate">{f.title}</div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-black text-white" dir="ltr">{toPersian(Number(f.amount).toLocaleString("fa-IR"))} ت</span>
                          {f.dueDate && <span>سررسید: {toPersian(f.dueDate)}</span>}
                          {paid && f.paymentMethod && <span className="text-emerald-400">✓ {f.paymentMethod === "wallet" ? "کیف پول" : f.paymentMethod === "manual" ? "دستی" : "آنلاین"}</span>}
                          {waived && <span className="text-slate-400">بخشوده</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {!paid && !waived && (
                          <>
                            <button onClick={() => markPaid(f.id)} className="p-1.5 rounded-[6px] bg-emerald-500/15 text-emerald-400" title="ثبت پرداخت دستی">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => markWaived(f.id)} className="p-1.5 rounded-[6px] bg-slate-500/15 text-slate-300" title="بخشیدن">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {paid && (
                          <button onClick={() => markUnpaid(f.id)} className="p-1.5 rounded-[6px] bg-amber-500/15 text-amber-300" title="لغو پرداخت">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!paid && (
                          <button onClick={() => removeFee(f.id)} className="p-1.5 rounded-[6px] bg-error-500/15 text-error-400" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
