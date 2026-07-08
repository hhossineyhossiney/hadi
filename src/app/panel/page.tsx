"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Users, BookOpen, Clock, CheckCircle, XCircle, Loader2, Building2,
  Wallet, Check, X, Pencil, ImagePlus, Trash2, Send, Lock, Phone,
  LayoutDashboard, Image as ImageIcon, Award, Plus, LogOut, ShieldCheck, Eye, EyeOff,
  UserCircle2, FolderOpen, Menu,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";
import ProfileStoriesTab from "@/components/panel/ProfileStoriesTab";
import InstituteProfileForm from "@/components/panel/InstituteProfileForm";
import StudentDocumentsModal from "@/components/panel/StudentDocumentsModal";

type TabKey = "dashboard" | "courses" | "students" | "chat" | "gallery" | "banner" | "profile" | "telegram";

const NAV_ITEMS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "courses", label: "مدیریت دوره‌ها", icon: BookOpen },
  { key: "students", label: "لیست هنرجویان", icon: Users },
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
          <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed top-20 left-0 right-0 bottom-0 z-30 bg-black/70" />
        )}

        <aside className={`bg-[#0B1120] text-white shrink-0 lg:min-h-[calc(100vh-80px)] lg:w-72 lg:static lg:translate-x-0 lg:border-l lg:border-white/5 lg:block
          fixed top-[80px] right-0 bottom-0 z-40 w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
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
          <input placeholder="شهریه (تومان)" value={newCourse.price} onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="ظرفیت" type="number" value={newCourse.capacity} onChange={(e) => setNewCourse({ ...newCourse, capacity: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="مدت دوره (مثلاً ۴۰ ساعت)" value={newCourse.duration} onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
          <input placeholder="تاریخ شروع" value={newCourse.startDate} onChange={(e) => setNewCourse({ ...newCourse, startDate: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
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
          <input placeholder="قیمت اصلی قبل تخفیف (اختیاری)" value={newCourse.originalPrice} onChange={(e) => setNewCourse({ ...newCourse, originalPrice: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />
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
                  { k: "title", l: "عنوان دوره" }, { k: "price", l: "شهریه (تومان)" },
                  { k: "originalPrice", l: "قیمت اصلی قبل تخفیف" },
                  { k: "capacity", l: "ظرفیت" }, { k: "duration", l: "مدت" },
                  { k: "totalSessions", l: "تعداد کل جلسات" },
                  { k: "schedule", l: "زمان‌بندی" }, { k: "startDate", l: "تاریخ شروع" },
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
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-black text-white">{c.title}</h3>
                    <span className="text-[10px] text-slate-400">{c.categoryName}</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setEditCourse({ ...c })} className="p-2 rounded-[10px] bg-primary-500/15 text-primary-400 hover:bg-primary-500/30 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setBannerCourseId(bannerCourseId === c.id ? null : c.id)} className="p-2 rounded-[10px] bg-fuchsia-500/15 text-fuchsia-400 hover:bg-fuchsia-500/30 cursor-pointer" title="بنر تبلیغاتی دوره"><ImagePlus className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(c.id, c.title)} className="p-2 rounded-[10px] bg-error-500/15 text-error-400 hover:bg-error-500/30 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">شهریه: </span><b className="text-primary-400">{c.price ? Number(c.price).toLocaleString("fa-IR") : "رایگان"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">ظرفیت: </span><b className="text-white">{c.enrolledCount}/{c.capacity}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">شروع: </span><b className="text-white">{c.startDate || "—"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">مدرس: </span><b className="text-white">{c.instructor || "—"}</b></div>
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
