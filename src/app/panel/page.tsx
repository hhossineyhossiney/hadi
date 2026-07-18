"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import {
  Users, BookOpen, Clock, CheckCircle, XCircle, Loader2, Building2,
  Wallet, Check, X, Pencil, ImagePlus, Trash2, Send, Lock, Phone,
  LayoutDashboard, Image as ImageIcon, Award, Plus, LogOut, ShieldCheck, Eye, EyeOff,
  UserCircle2, FolderOpen, Menu, Bell, TrendingUp, CalendarDays,
  MessageCircle, Video, Link as LinkIcon, Calendar, ShoppingBag, PlayCircle,
  ChevronLeft, Sparkles, Star,
} from "lucide-react";
import { motion } from "framer-motion";
import AIToolPanel from "@/components/AIToolPanel";
import { useSession, signIn, signOut } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";
import ProfileStoriesTab from "@/components/panel/ProfileStoriesTab";
import InstituteProfileForm from "@/components/panel/InstituteProfileForm";
import StudentDocumentsModal from "@/components/panel/StudentDocumentsModal";
import PersianDatePicker from "@/components/PersianDatePicker";
import MoneyInput from "@/components/MoneyInput";
import WeekdayPicker from "@/components/WeekdayPicker";
import { calculateCourseSchedule, formatScheduleDays } from "@/lib/schedule";
import ReviewManagementPanel from "@/components/panel/ReviewManagementPanel";
import ShopPurchasesModal from "@/components/panel/ShopPurchasesModal";

type TabKey = "dashboard" | "ai_studio" | "courses" | "shop" | "students" | "reviews" | "sessions" | "progress" | "live" | "assignments" | "quizzes" | "grades" | "instructors" | "attendance" | "groups" | "reports" | "subscription" | "chat" | "notifications" | "gallery" | "banner" | "profile" | "telegram";

const NAV_ITEMS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "ai_studio", label: "🤖 استودیوی AI", icon: Sparkles },
  { key: "subscription", label: "پلن اشتراک من", icon: Award },
  { key: "courses", label: "مدیریت دوره‌ها", icon: BookOpen },
  { key: "shop", label: "فروش آنلاین دوره", icon: Wallet },
  { key: "students", label: "لیست هنرجویان", icon: Users },
  { key: "reviews", label: "مدیریت نظرات و امتیازها", icon: Star },
  { key: "instructors", label: "مدیریت اساتید", icon: UserCircle2 },
  { key: "progress", label: "وضعیت پیشرفت هنرجویان", icon: TrendingUp },
  { key: "grades", label: "ثبت نمرات و کارنامه", icon: Award },
  { key: "attendance", label: "حضور و غیاب", icon: CheckCircle },
  { key: "sessions", label: "تقویم جلسات دوره‌ها", icon: CalendarDays },
  { key: "live", label: "کلاس‌های آنلاین (Live)", icon: Video },
  { key: "assignments", label: "مدیریت تکالیف", icon: ImageIcon },
  { key: "quizzes", label: "مدیریت آزمون‌ها", icon: Check },
  { key: "groups", label: "گروه‌های پیام‌رسان", icon: MessageCircle },
  { key: "reports", label: "گزارش‌گیری Excel", icon: FolderOpen },
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

      {/* Mobile top compact bar — چسبیده به Navbar */}
      <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-[#0B1120]/95 backdrop-blur-lg border-b border-white/10 px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-10 h-10 rounded-[12px] bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-300 cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-white truncate">{NAV_ITEMS.find(n => n.key === tab)?.label || institute?.name || "پنل آموزشگاه"}</div>
          <div className="text-[10px] text-primary-300 font-bold truncate">{institute?.name || "پنل مدیریت"}</div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="w-9 h-9 rounded-[10px] bg-error-500/15 hover:bg-error-500/25 text-error-400 flex items-center justify-center cursor-pointer shrink-0">
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm" />
      )}

      <div className="pt-[136px] lg:pt-20 lg:flex lg:flex-row lg:min-h-screen">
        <aside className={`bg-[#0B1120] text-white shrink-0 lg:min-h-[calc(100vh-80px)] lg:w-72 lg:static lg:translate-x-0 lg:border-l lg:border-white/5 lg:block
          fixed top-0 right-0 bottom-0 z-[60] w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          ${drawerOpen ? "block" : "hidden lg:block"}`}
          style={{ boxShadow: drawerOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : undefined }}>
          <div className="p-5 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-primary-600 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black truncate">{institute.name}</div>
                <div className="text-[10px] text-primary-300 font-bold">پنل مدیریت آموزشگاه</div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => signOut({ callbackUrl: "/" })} className="p-2 rounded-[10px] hover:bg-white/10 text-error-400 cursor-pointer" title="خروج">
                <LogOut className="w-4 h-4" />
              </button>
              <button onClick={() => setDrawerOpen(false)} className="lg:hidden p-2 rounded-[10px] hover:bg-white/10 text-slate-300 cursor-pointer" title="بستن منو">
                <X className="w-4 h-4" />
              </button>
            </div>
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
          {tab === "ai_studio" && <AIStudioTab />}
          {tab === "courses" && <CoursesTab data={data} refresh={fetchData} />}
          {tab === "students" && <StudentsTab data={data} refresh={fetchData} />}
          {tab === "reviews" && <ReviewManagementPanel scope="manager" />}
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
          {tab === "shop" && <ShopTab />}
          {tab === "live" && <ManagerLiveTab data={data} />}
          {tab === "assignments" && <ManagerAssignmentsTab data={data} />}
          {tab === "quizzes" && <ManagerQuizzesTab data={data} />}
          {tab === "grades" && <ManagerGradesTab data={data} />}
          {tab === "instructors" && <ManagerInstructorsTab />}
          {tab === "attendance" && <ManagerAttendanceTab data={data} />}
          {tab === "reports" && <ManagerReportsTab />}
          {tab === "groups" && <ManagerGroupsTab data={data} />}
          {tab === "subscription" && <ManagerSubscriptionTab />}
        </div>
      </div>
    </main>
  );
}

/* ============================= LIVE CLASSES MANAGER TAB ============================= */
function ManagerLiveTab({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({
    courseId: "", title: "", description: "", meetingUrl: "",
    provider: "skyroom", meetingId: "", password: "",
    scheduledAt: "", durationMinutes: 60,
  });
  const courses = (data?.courses || []) as any[];

  const load = () => {
    setLoading(true);
    fetch("/api/manager/learning?kind=live").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
  };
  useEffect(load, []);

  const act = async (payload: any) => {
    const r = await fetch("/api/manager/learning", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) { setMsg("✅ ذخیره شد"); load(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Video className="w-5 h-5 text-primary-400" /> کلاس‌های آنلاین (Live)</h2>
          <p className="text-slate-400 text-sm">زمان‌بندی و ارسال لینک کلاس Skyroom/Zoom/Meet برای هنرجویان</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="px-4 py-2 rounded-[12px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white font-black text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {creating ? "بستن فرم" : "افزودن کلاس Live"}
        </button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {creating && (
        <div className="mb-4 p-5 rounded-[16px] bg-[#111a2e] border border-white/10 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">دوره *</label>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
                <option value="">— انتخاب دوره —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">پلتفرم</label>
              <select value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
                <option value="skyroom">Skyroom</option>
                <option value="zoom">Zoom</option>
                <option value="meet">Google Meet</option>
                <option value="aparat">آپارات</option>
                <option value="other">سایر</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-1">عنوان کلاس *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="مثلاً: جلسه ۳ - ابزار Pen Tool" className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-1">لینک کلاس (URL) *</label>
              <input value={form.meetingUrl} onChange={e => setForm({...form, meetingUrl: e.target.value})} placeholder="https://..." dir="ltr" className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">Meeting ID (اختیاری)</label>
              <input value={form.meetingId} onChange={e => setForm({...form, meetingId: e.target.value})} dir="ltr" className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">رمز ورود (اختیاری)</label>
              <input value={form.password} onChange={e => setForm({...form, password: e.target.value})} dir="ltr" className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">زمان شروع *</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({...form, scheduledAt: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">مدت (دقیقه)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-1">توضیحات (اختیاری)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={async () => {
              if (!form.courseId || !form.title || !form.meetingUrl || !form.scheduledAt) { setMsg("❌ فیلدهای ستاره‌دار الزامی است"); return; }
              if (await act({ action: "createLive", ...form })) { setCreating(false); setForm({courseId:"",title:"",description:"",meetingUrl:"",provider:"skyroom",meetingId:"",password:"",scheduledAt:"",durationMinutes:60}); }
            }} className="px-5 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm">ذخیره کلاس</button>
            <button onClick={() => setCreating(false)} className="px-5 py-2.5 rounded-[10px] bg-white/5 text-slate-300 font-black text-sm">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <Video className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-slate-500 text-sm">هنوز کلاس Live ایجاد نکرده‌اید. با دکمه بالا اقدام کنید.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((l: any) => {
            const now = Date.now();
            const start = new Date(l.scheduled_at).getTime();
            const isLive = l.status === "live" || (Math.abs(start - now) < 15 * 60 * 1000 && l.status !== "ended");
            return (
              <div key={l.id} className="p-4 rounded-[16px] bg-[#111a2e] border border-white/10">
                <div className="flex items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isLive && <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black animate-pulse">🔴 در حال پخش</span>}
                      <span className="px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-[9px] font-black">{l.provider}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${l.status === "scheduled" ? "bg-amber-500/20 text-amber-400" : l.status === "ended" ? "bg-slate-500/20 text-slate-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {l.status === "scheduled" ? "زمان‌بندی شده" : l.status === "ended" ? "پایان یافته" : l.status === "cancelled" ? "لغو شده" : "زنده"}
                      </span>
                    </div>
                    <h3 className="font-black text-white text-sm">{l.title}</h3>
                    <div className="text-[10px] text-slate-400 mt-1">{l.course_title}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 space-y-1 mb-3">
                  <div>📅 {new Date(l.scheduled_at).toLocaleString("fa-IR")}</div>
                  <div>⏱ {l.duration_minutes} دقیقه</div>
                  {l.password && <div>🔑 رمز: <code>{l.password}</code></div>}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <a href={l.meeting_url} target="_blank" rel="noopener" className="flex-1 px-2.5 py-1.5 rounded-[8px] bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black flex items-center justify-center gap-1">
                    <Video className="w-3 h-3" /> باز کردن لینک
                  </a>
                  {l.status !== "ended" && (
                    <button onClick={() => act({ action: "updateLiveStatus", id: l.id, status: "ended" })} className="px-2.5 py-1.5 rounded-[8px] bg-amber-500/20 text-amber-400 text-[10px] font-black">پایان</button>
                  )}
                  <button onClick={() => { if (confirm("حذف این کلاس؟")) act({ action: "deleteLive", id: l.id }); }} className="p-1.5 rounded-[8px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============================= ASSIGNMENTS MANAGER TAB ============================= */
function ManagerAssignmentsTab({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [reviewing, setReviewing] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ courseId: "", title: "", description: "", dueDate: "", maxScore: 100 });
  const courses = (data?.courses || []) as any[];

  const load = () => {
    setLoading(true);
    fetch("/api/manager/learning?kind=assignments").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
  };
  useEffect(load, []);

  const act = async (payload: any) => {
    const r = await fetch("/api/manager/learning", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) { setMsg("✅ ذخیره شد"); load(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const openReview = async (a: any) => {
    setReviewing(a);
    const d = await fetch(`/api/manager/learning?kind=submissions&assignmentId=${a.id}`).then(r => r.json());
    setSubmissions(d.items || []);
  };
  const reviewSub = async (subId: number, score: number, feedback: string, status: string) => {
    await act({ action: "reviewSubmission", submissionId: subId, score, feedback, status });
    openReview(reviewing);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2">📝 مدیریت تکالیف</h2>
          <p className="text-slate-400 text-sm">تعریف تکلیف برای دوره‌ها + بررسی و نمره‌دهی به پاسخ هنرجویان</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="px-4 py-2 rounded-[12px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white font-black text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {creating ? "بستن" : "تکلیف جدید"}
        </button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {creating && (
        <div className="mb-4 p-5 rounded-[16px] bg-[#111a2e] border border-white/10 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">دوره *</label>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
                <option value="">— انتخاب دوره —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">نمره کل</label>
              <input type="number" value={form.maxScore} onChange={e => setForm({...form, maxScore: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-1">عنوان تکلیف *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 block mb-1">شرح تکلیف</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">موعد تحویل</label>
              <input type="datetime-local" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={async () => {
              if (!form.courseId || !form.title) { setMsg("❌ دوره و عنوان الزامی است"); return; }
              if (await act({ action: "createAssignment", ...form })) { setCreating(false); setForm({courseId:"",title:"",description:"",dueDate:"",maxScore:100}); }
            }} className="px-5 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm">ذخیره تکلیف</button>
            <button onClick={() => setCreating(false)} className="px-5 py-2.5 rounded-[10px] bg-white/5 text-slate-300 font-black text-sm">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <p className="text-slate-500 text-sm">تکلیفی تعریف نکرده‌اید</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((a: any) => (
            <div key={a.id} className="p-5 rounded-[16px] bg-[#111a2e] border border-white/10">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-sm">{a.title}</h3>
                  <div className="text-[10px] text-slate-400 mt-1">{a.course_title}</div>
                </div>
                <button onClick={() => { if (confirm("حذف این تکلیف و همه پاسخ‌ها؟")) act({ action: "deleteAssignment", id: a.id }); }} className="p-1.5 rounded-[6px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
              </div>
              {a.description && <p className="text-xs text-slate-300 mb-3 leading-relaxed line-clamp-2">{a.description}</p>}
              <div className="grid grid-cols-3 gap-2 mb-3 text-[10px] text-slate-400">
                <div>📊 نمره: {a.max_score}</div>
                <div>📬 پاسخ‌ها: {a.submissions_count}</div>
                <div>🟡 در انتظار: {a.pending_count}</div>
              </div>
              {a.due_date && <div className="text-[10px] text-amber-300 mb-3">⏰ موعد: {new Date(a.due_date).toLocaleString("fa-IR")}</div>}
              <button onClick={() => openReview(a)} className="w-full px-3 py-2 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black">
                بررسی پاسخ‌ها ({a.submissions_count})
              </button>
            </div>
          ))}
        </div>
      )}

      {reviewing && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setReviewing(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-[#082D53] rounded-[18px] border border-white/10 p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-lg font-black text-white">{reviewing.title}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{reviewing.course_title}</div>
              </div>
              <button onClick={() => setReviewing(null)} className="p-2 rounded-[8px] bg-white/10 text-white"><X className="w-4 h-4" /></button>
            </div>
            {submissions.length === 0 ? (
              <div className="p-10 text-center text-slate-500">هنوز پاسخی دریافت نشده</div>
            ) : (
              <div className="space-y-3">
                {submissions.map((s: any) => (
                  <div key={s.id} className="p-4 rounded-[12px] bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-black text-white">{s.user_name} <span className="text-[10px] text-slate-500 font-normal" dir="ltr">{s.user_phone}</span></div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${s.status === "reviewed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                        {s.status === "reviewed" ? "بررسی شد" : "در انتظار"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap mb-2 p-2 rounded-[8px] bg-black/30">{s.submission_text || "بدون متن"}</p>
                    {s.file_url && <a href={s.file_url} target="_blank" rel="noopener" className="inline-block text-[10px] text-primary-300 hover:underline mb-2">📎 فایل ضمیمه</a>}
                    <div className="flex items-center gap-2 mt-2">
                      <input type="number" defaultValue={s.score || 0} placeholder="نمره" id={`score-${s.id}`} className="w-20 px-2 py-1 rounded-[6px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
                      <input type="text" defaultValue={s.feedback || ""} placeholder="بازخورد" id={`fb-${s.id}`} className="flex-1 px-2 py-1 rounded-[6px] bg-white/85 text-slate-900 text-xs font-bold" />
                      <button onClick={() => {
                        const sc = Number((document.getElementById(`score-${s.id}`) as HTMLInputElement).value);
                        const fb = (document.getElementById(`fb-${s.id}`) as HTMLInputElement).value;
                        reviewSub(s.id, sc, fb, "reviewed");
                      }} className="px-3 py-1 rounded-[6px] bg-emerald-600 text-white text-[10px] font-black">ثبت نمره</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= QUIZZES MANAGER TAB ============================= */
function ManagerQuizzesTab({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({
    courseId: "", title: "", description: "", durationMinutes: 30, passingScore: 60,
    questions: [{ q: "", options: ["", "", "", ""], correctIndex: 0, points: 1 }],
  });
  const courses = (data?.courses || []) as any[];

  const load = () => {
    setLoading(true);
    fetch("/api/manager/learning?kind=quizzes").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
  };
  useEffect(load, []);

  const act = async (payload: any) => {
    const r = await fetch("/api/manager/learning", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) { setMsg("✅ ذخیره شد"); load(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const addQuestion = () => setForm({...form, questions: [...form.questions, { q: "", options: ["","","",""], correctIndex: 0, points: 1 }]});
  const removeQuestion = (idx: number) => setForm({...form, questions: form.questions.filter((_: any, i: number) => i !== idx)});
  const updateQ = (idx: number, key: string, val: any) => {
    const qs = [...form.questions];
    qs[idx] = { ...qs[idx], [key]: val };
    setForm({...form, questions: qs});
  };
  const updateOpt = (idx: number, oi: number, val: string) => {
    const qs = [...form.questions];
    qs[idx].options[oi] = val;
    setForm({...form, questions: qs});
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2">📊 مدیریت آزمون‌ها</h2>
          <p className="text-slate-400 text-sm">تعریف آزمون چند گزینه‌ای برای دوره‌ها با اعلام نمره خودکار</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="px-4 py-2 rounded-[12px] bg-gradient-to-l from-primary-500 to-secondary-500 text-white font-black text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> {creating ? "بستن" : "آزمون جدید"}
        </button>
      </div>

      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {creating && (
        <div className="mb-4 p-5 rounded-[16px] bg-[#111a2e] border border-white/10 space-y-4">
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">دوره *</label>
              <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
                <option value="">— انتخاب دوره —</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">مدت (دقیقه)</label>
              <input type="number" value={form.durationMinutes} onChange={e => setForm({...form, durationMinutes: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 block mb-1">حد قبولی (٪)</label>
              <input type="number" value={form.passingScore} onChange={e => setForm({...form, passingScore: Number(e.target.value)})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 block mb-1">عنوان آزمون *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div className="md:col-span-3">
              <label className="text-[10px] font-black text-slate-400 block mb-1">توضیح (اختیاری)</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-black text-white">سوالات ({form.questions.length})</div>
              <button onClick={addQuestion} className="px-3 py-1.5 rounded-[8px] bg-primary-600 text-white text-[10px] font-black flex items-center gap-1"><Plus className="w-3 h-3" /> افزودن سوال</button>
            </div>
            <div className="space-y-3">
              {form.questions.map((q: any, qi: number) => (
                <div key={qi} className="p-3 rounded-[10px] bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] font-black text-primary-300">سوال {qi + 1}</div>
                    {form.questions.length > 1 && (
                      <button onClick={() => removeQuestion(qi)} className="p-1 rounded-[4px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
                    )}
                  </div>
                  <input value={q.q} onChange={e => updateQ(qi, "q", e.target.value)} placeholder="متن سوال..." className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold mb-2" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    {q.options.map((opt: string, oi: number) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQ(qi, "correctIndex", oi)} className="shrink-0" />
                        <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} placeholder={`گزینه ${oi + 1}`} className="flex-1 px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400">💡 گزینه صحیح را با رادیو انتخاب کنید</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={async () => {
              if (!form.courseId || !form.title) { setMsg("❌ دوره و عنوان الزامی است"); return; }
              if (form.questions.some((q: any) => !q.q.trim() || q.options.some((o: string) => !o.trim()))) { setMsg("❌ همه سوالات و گزینه‌ها باید پر شوند"); return; }
              if (await act({ action: "createQuiz", ...form })) { setCreating(false); setForm({courseId:"",title:"",description:"",durationMinutes:30,passingScore:60,questions:[{q:"",options:["","","",""],correctIndex:0,points:1}]}); }
            }} className="px-5 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm">ذخیره آزمون</button>
            <button onClick={() => setCreating(false)} className="px-5 py-2.5 rounded-[10px] bg-white/5 text-slate-300 font-black text-sm">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <p className="text-slate-500 text-sm">آزمونی تعریف نکرده‌اید</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {items.map((q: any) => (
            <div key={q.id} className="p-5 rounded-[16px] bg-[#111a2e] border border-white/10">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-white text-sm">{q.title}</h3>
                  <div className="text-[10px] text-slate-400 mt-1">{q.course_title}</div>
                </div>
                <button onClick={() => { if (confirm("حذف این آزمون و نتایج؟")) act({ action: "deleteQuiz", id: q.id }); }} className="p-1.5 rounded-[6px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-3">
                <div>⏱ {q.duration_minutes} دقیقه</div>
                <div>✅ حد قبولی: {q.passing_score}٪</div>
                <div>📝 {(q.questions || []).length} سوال</div>
                <div>👥 {q.attempts_count} شرکت‌کننده</div>
                <div className="col-span-2">🏆 قبول‌شده‌ها: {q.passed_count}/{q.attempts_count}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= SHOP TAB (فروش آنلاین دوره) ============================= */
function ShopTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [purchasesCourseId, setPurchasesCourseId] = useState<number | null>(null);
  const [managingCourseId, setManagingCourseId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    title: "", subtitle: "", description: "", price: "", originalPrice: "",
    level: "beginner", instructor: "", instructorTitle: "", coverImage: "",
    features: [""], requirements: [""], targetAudience: [""],
  });

  const fetchData = () => {
    setLoading(true);
    fetch("/api/manager/shop-courses").then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };
  useEffect(() => { fetchData(); }, []);

  const act = async (payload: any) => {
    const res = await fetch("/api/manager/shop-courses", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await res.json();
    if (!res.ok) { setMsg("❌ " + (d.error || "خطا")); return null; }
    fetchData();
    return d;
  };

  if (loading) return <div className="p-10 text-center text-slate-500"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  const perm = data?.permission;
  const courses = data?.courses || [];
  const canCreate = perm?.isEnabled && courses.length < (perm?.maxCourses || 0);

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">فروش آنلاین دوره‌ها</h2>
      <p className="text-slate-400 text-sm mb-6">دوره‌های پکیجی خود را برای فروش آنلاین ثبت کنید — با پخش ویدئو، فصل‌بندی و قفل خرید</p>

      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {/* Permission status card */}
      {!perm?.isEnabled ? (
        <div className="p-6 rounded-[16px] bg-gradient-to-l from-amber-500/15 to-transparent border border-amber-500/30 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-black text-amber-300 text-sm mb-1">دسترسی فروش آنلاین شما فعال نیست</div>
              <div className="text-xs text-slate-300 leading-relaxed">
                برای فعال‌سازی امکان فروش دوره‌های آنلاین، با مدیر کل سامانه تماس بگیرید. مدیر کل تعداد دوره‌های مجاز و درصد کمیسیون را تعیین می‌کند.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-[14px] bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/25">
            <div className="text-[10px] text-slate-400 font-bold mb-1">وضعیت فروش</div>
            <div className="text-sm font-black text-emerald-300 flex items-center gap-1"><Check className="w-4 h-4" /> فعال</div>
          </div>
          <div className="p-4 rounded-[14px] bg-gradient-to-br from-primary-500/15 to-primary-500/5 border border-primary-500/25">
            <div className="text-[10px] text-slate-400 font-bold mb-1">سقف مجاز</div>
            <div className="text-lg font-black text-primary-300">{Number(perm.maxCourses).toLocaleString("fa-IR")}</div>
          </div>
          <div className="p-4 rounded-[14px] bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border border-indigo-500/25">
            <div className="text-[10px] text-slate-400 font-bold mb-1">دوره‌های ثبت‌شده</div>
            <div className="text-lg font-black text-indigo-300">{courses.length.toLocaleString("fa-IR")}</div>
          </div>
          <div className="p-4 rounded-[14px] bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25">
            <div className="text-[10px] text-slate-400 font-bold mb-1">کمیسیون سامانه</div>
            <div className="text-lg font-black text-amber-300">{perm.commissionPercent}٪</div>
          </div>
        </div>
      )}

      {/* Add new course */}
      {perm?.isEnabled && (
        <div className="mb-6">
          <button
            onClick={() => setCreating(!creating)}
            disabled={!canCreate}
            className={`px-5 py-2.5 rounded-[12px] font-black text-sm flex items-center gap-2 transition-all ${
              canCreate
                ? "bg-gradient-to-l from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 cursor-pointer"
                : "bg-slate-500/20 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" /> {creating ? "بستن فرم" : "افزودن دوره فروشی جدید"}
          </button>
          {!canCreate && perm?.maxCourses > 0 && courses.length >= perm.maxCourses && (
            <div className="mt-2 text-[11px] text-amber-400 font-bold">
              ⚠ سقف {perm.maxCourses} دوره پر است. برای افزایش با مدیر کل تماس بگیرید.
            </div>
          )}
        </div>
      )}

      {creating && (
        <div className="mb-6 p-6 rounded-[18px] bg-[#111a2e] border border-white/10">
          <h3 className="font-black text-white mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-primary-400" /> دوره فروشی جدید</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">عنوان دوره *</label>
              <input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">سطح</label>
              <select value={form.level} onChange={(e) => setForm({...form, level: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
                <option value="beginner">مقدماتی</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">پیشرفته</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 mb-1 block">توضیح کوتاه</label>
              <input value={form.subtitle} onChange={(e) => setForm({...form, subtitle: e.target.value})} placeholder="یک جمله جذاب — نمایش در کارت دوره" className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">قیمت فروش (تومان) *</label>
              <MoneyInput value={form.price} onChange={(v) => setForm({...form, price: v})} placeholder="مثلا: 1200000" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">قیمت قبل تخفیف</label>
              <MoneyInput value={form.originalPrice} onChange={(v) => setForm({...form, originalPrice: v})} placeholder="اختیاری" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">نام مدرس</label>
              <input value={form.instructor} onChange={(e) => setForm({...form, instructor: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 mb-1 block">تخصص مدرس</label>
              <input value={form.instructorTitle} onChange={(e) => setForm({...form, instructorTitle: e.target.value})} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 mb-1 block">توضیحات کامل دوره</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
            </div>
            <div className="md:col-span-2 rounded-[14px] border border-cyan-500/20 bg-cyan-500/5 p-4">
              <ImagePickField value={form.coverImage || ""} onChange={(value) => setForm({ ...form, coverImage: value })} label="تصویر اصلی کارت و صفحه دوره" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={async () => {
                if (!form.title || !form.price) { setMsg("❌ عنوان و قیمت الزامی است"); return; }
                const d = await act({ action: "create", ...form,
                  features: form.features.filter((s: string) => s.trim()),
                  requirements: form.requirements.filter((s: string) => s.trim()),
                  targetAudience: form.targetAudience.filter((s: string) => s.trim()),
                });
                if (d) { setCreating(false); setMsg("✅ دوره ایجاد شد. حالا فصل‌ها و ویدئوها را اضافه کنید"); setForm({ title: "", subtitle: "", description: "", price: "", originalPrice: "", level: "beginner", instructor: "", instructorTitle: "", coverImage: "", features: [""], requirements: [""], targetAudience: [""] }); }
              }}
              className="px-5 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm"
            >
              ذخیره دوره
            </button>
            <button onClick={() => setCreating(false)} className="px-5 py-2.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-slate-300 font-black text-sm">انصراف</button>
          </div>
        </div>
      )}

      {/* Courses grid */}
      {courses.length === 0 && !creating ? (
        <div className="p-10 text-center rounded-[18px] bg-[#111a2e] border border-white/5">
          <ShoppingBag className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <div className="text-sm font-bold text-slate-400">
            {perm?.isEnabled
              ? "هنوز دوره فروشی ثبت نکرده‌اید. با دکمه بالا شروع کنید."
              : "پس از فعال‌سازی مجوز توسط مدیر کل، اینجا می‌توانید دوره‌های خود را ثبت کنید."}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c: any) => (
            <div key={c.id} className="rounded-[16px] bg-[#111a2e] border border-white/10 overflow-hidden hover:border-primary-500/40 transition-all">
              <div className="relative aspect-[16/9] bg-gradient-to-br from-primary-600 to-secondary-600">
                {c.coverImage && <img src={c.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80" loading="lazy" decoding="async" />}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${c.isPublished ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}>
                    {c.isPublished ? "منتشر شده" : "پیش‌نویس"}
                  </span>
                  {c.isFeatured && <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gradient-to-l from-amber-400 to-yellow-500 text-black">ویژه</span>}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-black text-white text-sm mb-1 line-clamp-2 min-h-[40px]">{c.title}</h3>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-3">
                  <span>{c.chaptersCount} فصل</span>
                  <span>•</span>
                  <span>{c.lessonsCount} درس</span>
                  <span>•</span>
                  <span>{c.studentsCount || 0} خرید</span>
                </div>
                <div className="text-base font-black gradient-text mb-3" dir="ltr">{Number(c.price).toLocaleString("fa-IR")} تومان</div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setManagingCourseId(c.id)} className="px-3 py-2.5 rounded-[8px] bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black flex items-center justify-center gap-1">
                    <Video className="w-3 h-3" /> فصل‌ها و درس‌ها
                  </button>
                  <button onClick={() => setEditingCourse({ ...c })} className="px-3 py-2.5 rounded-[8px] bg-sky-500/20 text-sky-300 text-[11px] font-black flex items-center justify-center gap-1">
                    <Pencil className="w-3 h-3" /> ویرایش کامل
                  </button>
                  <button onClick={() => setPurchasesCourseId(c.id)} className="px-3 py-2.5 rounded-[8px] bg-violet-500/20 text-violet-300 text-[11px] font-black flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> خریدها ({Number(c.studentsCount || 0).toLocaleString("fa-IR")})
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => act({ action: "publish", courseId: c.id, publish: !c.isPublished })} className={`flex-1 px-3 py-2 rounded-[8px] text-[11px] font-black ${c.isPublished ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                      {c.isPublished ? "پیش‌نویس" : "انتشار"}
                    </button>
                    <button onClick={() => { if (confirm("این دوره و همه محتویاتش حذف شود؟")) act({ action: "delete", courseId: c.id }); }} className="px-3 py-2 rounded-[8px] bg-error-500/20 text-error-400 text-[11px] font-black">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {managingCourseId && (
        <ShopCourseManagerModal
          courseId={managingCourseId}
          onClose={() => { setManagingCourseId(null); fetchData(); }}
        />
      )}
      {editingCourse && (
        <ShopCourseEditModal
          course={editingCourse}
          categories={data?.categories || []}
          onClose={() => setEditingCourse(null)}
          onSave={async (payload) => {
            const result = await act({ action: "update", courseId: editingCourse.id, ...payload });
            if (result) { setEditingCourse(null); setMsg("✅ همه اطلاعات و تصویر دوره بروزرسانی شد"); }
          }}
        />
      )}
      {purchasesCourseId && (
        <ShopPurchasesModal
          courseId={purchasesCourseId}
          onClose={() => setPurchasesCourseId(null)}
          onChanged={fetchData}
        />
      )}
    </div>
  );
}

function LinesField({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (value: string[]) => void; placeholder: string }) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 mb-1 block">{label}</label>
      <textarea
        value={(value || []).join("\n")}
        onChange={(event) => onChange(event.target.value.split("\n"))}
        rows={4}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-xs font-bold resize-none"
      />
      <div className="mt-1 text-[9px] text-slate-500">هر مورد را در یک خط جدا بنویسید.</div>
    </div>
  );
}

function ShopCourseEditModal({ course, categories, onClose, onSave }: { course: any; categories: any[]; onClose: () => void; onSave: (payload: any) => Promise<void> }) {
  const [form, setForm] = useState<any>({
    ...course,
    categoryId: course.categoryId || "",
    features: Array.isArray(course.features) ? course.features : [],
    requirements: Array.isArray(course.requirements) ? course.requirements : [],
    targetAudience: Array.isArray(course.targetAudience) ? course.targetAudience : [],
    hasSupport: course.hasSupport !== false,
    hasCertificate: course.hasCertificate !== false,
    hasDownload: !!course.hasDownload,
    lifetimeAccess: course.lifetimeAccess !== false,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!String(form.title || "").trim()) { alert("عنوان دوره الزامی است"); return; }
    setSaving(true);
    await onSave({
      ...form,
      title: String(form.title).trim(),
      features: (form.features || []).map((item: string) => item.trim()).filter(Boolean),
      requirements: (form.requirements || []).map((item: string) => item.trim()).filter(Boolean),
      targetAudience: (form.targetAudience || []).map((item: string) => item.trim()).filter(Boolean),
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[225] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[94dvh] overflow-y-auto rounded-[22px] bg-[#0f1a30] border border-white/10 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-20 bg-[#0f1a30]/95 backdrop-blur-xl border-b border-white/10 px-5 py-4 flex items-center justify-between">
          <div><h3 className="font-black text-white flex items-center gap-2"><Pencil className="w-4 h-4 text-sky-300" /> ویرایش کامل دوره آنلاین</h3><p className="text-[10px] text-slate-500 mt-1">تمام اطلاعات کارت صفحه اصلی و صفحه خرید از اینجا کنترل می‌شود.</p></div>
          <button type="button" onClick={onClose} className="p-2 rounded-full bg-white/5 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 grid gap-5 lg:grid-cols-[300px_1fr]">
          <div className="space-y-4">
            <div className="rounded-[16px] bg-[#111a2e] border border-white/10 p-4">
              <ImagePickField value={form.coverImage || ""} onChange={(value) => setForm({ ...form, coverImage: value })} label="تصویر اصلی کارت و صفحه دوره" />
              <p className="mt-3 text-[9px] text-cyan-200 leading-5">این همان تصویری است که روی کارت دوره آنلاین در صفحه اصلی، فروشگاه و بالای صفحه دوره نمایش داده می‌شود.</p>
            </div>
            <div className="rounded-[16px] bg-[#111a2e] border border-white/10 p-4">
              <ImagePickField value={form.instructorAvatar || ""} onChange={(value) => setForm({ ...form, instructorAvatar: value })} label="تصویر مدرس" />
            </div>
            <div className="rounded-[16px] bg-[#111a2e] border border-white/10 p-4 space-y-3">
              <div className="text-[11px] font-black text-white">ویژگی‌های نمایش‌داده‌شده روی کارت و صفحه دوره</div>
              {[
                ["hasSupport", "پشتیبانی مستقیم"],
                ["hasCertificate", "گواهینامه"],
                ["hasDownload", "امکان دانلود"],
                ["lifetimeAccess", "دسترسی مادام‌العمر"],
              ].map(([key, label]) => <label key={key} className="flex items-center justify-between gap-3 text-xs font-bold text-slate-300"><span>{label}</span><input type="checkbox" checked={!!form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.checked })} className="w-4 h-4" /></label>)}
              {!form.lifetimeAccess && <input type="number" value={form.accessDurationDays || ""} onChange={(event) => setForm({ ...form, accessDurationDays: event.target.value })} placeholder="مدت دسترسی (روز)" className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-xs font-bold" />}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">عنوان دوره *</label><input value={form.title || ""} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">رشته</label><select value={form.categoryId || ""} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold"><option value="">بدون رشته</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 mb-1 block">زیرعنوان کارت</label><input value={form.subtitle || ""} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">قیمت فروش (تومان)</label><MoneyInput value={String(form.price || "")} onChange={(value) => setForm({ ...form, price: value })} /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">قیمت قبل تخفیف</label><MoneyInput value={String(form.originalPrice || "")} onChange={(value) => setForm({ ...form, originalPrice: value })} /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">سطح دوره</label><select value={form.level || "beginner"} onChange={(event) => setForm({ ...form, level: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold"><option value="beginner">مقدماتی</option><option value="intermediate">متوسط</option><option value="advanced">پیشرفته</option><option value="comprehensive">جامع</option></select></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">لینک ویدئوی معرفی</label><input value={form.trailerVideo || ""} onChange={(event) => setForm({ ...form, trailerVideo: event.target.value })} dir="ltr" className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-xs font-bold" /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">نام مدرس</label><input value={form.instructor || ""} onChange={(event) => setForm({ ...form, instructor: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold" /></div>
              <div><label className="text-[10px] font-black text-slate-400 mb-1 block">عنوان و تخصص مدرس</label><input value={form.instructorTitle || ""} onChange={(event) => setForm({ ...form, instructorTitle: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 mb-1 block">توضیحات کامل دوره</label><textarea value={form.description || ""} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={6} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold resize-none" /></div>
              <div className="md:col-span-2"><label className="text-[10px] font-black text-slate-400 mb-1 block">رزومه مدرس</label><textarea value={form.instructorBio || ""} onChange={(event) => setForm({ ...form, instructorBio: event.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-[10px] bg-white/90 text-slate-900 text-sm font-bold resize-none" /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <LinesField label="چه چیزهایی یاد می‌گیرند؟" value={form.features} onChange={(value) => setForm({ ...form, features: value })} placeholder="مثلاً ساخت پروژه واقعی" />
              <LinesField label="پیش‌نیازها" value={form.requirements} onChange={(value) => setForm({ ...form, requirements: value })} placeholder="مثلاً بدون پیش‌نیاز" />
              <LinesField label="مخاطبان دوره" value={form.targetAudience} onChange={(value) => setForm({ ...form, targetAudience: value })} placeholder="مثلاً افراد مبتدی" />
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 flex gap-2 border-t border-white/10 bg-[#0f1a30]/95 px-5 py-4 backdrop-blur-xl"><button type="button" onClick={submit} disabled={saving} className="flex-1 rounded-[11px] bg-emerald-600 py-3 text-sm font-black text-white disabled:opacity-50">{saving ? "در حال ذخیره..." : "ذخیره همه تغییرات"}</button><button type="button" onClick={onClose} className="rounded-[11px] bg-white/5 px-6 py-3 text-sm font-black text-slate-300">انصراف</button></div>
      </div>
    </div>
  );
}

/* Compact image uploader with preview */
function ImagePickField({ value, onChange, label = "تصویر" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const pick = (file: File) => {
    if (file.size > 800_000) { alert("حجم فایل باید کمتر از ۸۰۰KB باشد"); return; }
    setUploading(true);
    const r = new FileReader();
    r.onload = () => { onChange(String(r.result || "")); setUploading(false); };
    r.readAsDataURL(file);
  };
  return (
    <div>
      <label className="text-[10px] font-black text-slate-400 mb-1 block">{label} (اختیاری، حداکثر ۸۰۰KB)</label>
      <div className="flex items-center gap-2">
        {value ? (
          <div className="relative w-16 h-16 rounded-[10px] overflow-hidden border border-white/10 shrink-0">
            <img src={value} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            <button onClick={() => onChange("")} className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-error-400 transition"><X className="w-5 h-5" /></button>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-[10px] border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 shrink-0">
            <ImageIcon className="w-5 h-5" />
          </div>
        )}
        <label className="flex-1 px-3 py-2.5 rounded-[10px] bg-primary-600/20 hover:bg-primary-600/30 text-primary-300 text-[11px] font-black cursor-pointer flex items-center justify-center gap-1.5 border border-primary-500/30">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {value ? "تغییر تصویر" : "انتخاب تصویر"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        </label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="یا آدرس URL" dir="ltr" className="hidden md:block flex-1 px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-[10px] font-bold" />
      </div>
    </div>
  );
}

/* Manager modal for a single sellable course — chapters + lessons */
function ShopCourseManagerModal({ courseId, onClose }: { courseId: number; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [addingChapter, setAddingChapter] = useState(false);
  const [newCh, setNewCh] = useState<any>({ title: "", isFree: false, coverImage: "", description: "" });
  const [editingChapter, setEditingChapter] = useState<any>(null); // {id, title, isFree, coverImage, description}
  const [addingLessonTo, setAddingLessonTo] = useState<number | null>(null);
  const [newLesson, setNewLesson] = useState<any>({ title: "", type: "video", videoUrl: "", videoProvider: "direct", videoDuration: 0, isFree: false, description: "", coverImage: "" });
  const [editingLesson, setEditingLesson] = useState<any>(null); // full lesson object

  const load = () => {
    setLoading(true);
    fetch("/api/manager/shop-courses", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId }) })
      .then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };
  useEffect(load, [courseId]);

  const act = async (payload: any) => {
    const res = await fetch("/api/manager/shop-courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const d = await res.json();
    if (!res.ok) { setMsg("❌ " + (d.error || "خطا")); return false; }
    setMsg("✅ ذخیره شد");
    load();
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#082D53] rounded-[20px] border border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 bg-gradient-to-l from-primary-500/25 to-transparent border-b border-white/10 p-5 flex items-center justify-between backdrop-blur-lg">
          <div>
            <div className="text-lg font-black text-white">{data?.course?.title || "..."}</div>
            <div className="text-[11px] text-slate-400">مدیریت فصل‌ها و درس‌های دوره فروشی</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-[10px] bg-white/10 hover:bg-white/20 text-white flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {msg && <div className={`mb-4 p-2.5 rounded-[8px] text-[11px] font-bold ${msg.startsWith("❌") ? "bg-error-500/20 text-error-400" : "bg-emerald-500/20 text-emerald-400"}`}>{msg}</div>}
          {loading ? (
            <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary-400 mx-auto" /></div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm font-black text-white">فصل‌ها ({data?.chapters?.length || 0})</div>
                <button onClick={() => setAddingChapter(!addingChapter)} className="px-3 py-1.5 rounded-[8px] bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black flex items-center gap-1">
                  <Plus className="w-3 h-3" /> افزودن فصل
                </button>
              </div>

              {addingChapter && (
                <div className="mb-4 p-4 rounded-[12px] bg-white/5 border border-white/10">
                  <div className="grid gap-3">
                    <input value={newCh.title} onChange={(e) => setNewCh({...newCh, title: e.target.value})} placeholder="عنوان فصل" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
                    <textarea value={newCh.description || ""} onChange={(e) => setNewCh({...newCh, description: e.target.value})} placeholder="توضیح کوتاه فصل (اختیاری)" rows={2} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
                    <ImagePickField value={newCh.coverImage || ""} onChange={(v) => setNewCh({...newCh, coverImage: v})} label="تصویر فصل" />
                    <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                      <input type="checkbox" checked={newCh.isFree} onChange={(e) => setNewCh({...newCh, isFree: e.target.checked})} /> فصل رایگان (پیش‌نمایش)
                    </label>
                    <div className="flex gap-2">
                      <button onClick={async () => { if (!newCh.title) return; if (await act({ action: "addChapter", courseId, ...newCh })) { setAddingChapter(false); setNewCh({title:"",isFree:false,coverImage:"",description:""}); }}} className="px-4 py-2 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black">ذخیره فصل</button>
                      <button onClick={() => setAddingChapter(false)} className="px-4 py-2 rounded-[8px] bg-white/10 text-slate-300 text-xs font-black">انصراف</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(data?.chapters || []).map((ch: any, i: number) => (
                  <div key={ch.id} className="rounded-[12px] bg-white/5 border border-white/10 overflow-hidden">
                    {editingChapter?.id === ch.id ? (
                      // === EDIT CHAPTER MODE ===
                      <div className="p-4 space-y-3 bg-sky-500/5 border-l-2 border-sky-500/60">
                        <div className="flex items-center gap-2 text-[11px] font-black text-sky-300"><Pencil className="w-3.5 h-3.5" /> ویرایش فصل</div>
                        <input value={editingChapter.title || ""} onChange={(e) => setEditingChapter({...editingChapter, title: e.target.value})} placeholder="عنوان فصل" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
                        <textarea value={editingChapter.description || ""} onChange={(e) => setEditingChapter({...editingChapter, description: e.target.value})} placeholder="توضیح فصل" rows={2} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
                        <ImagePickField value={editingChapter.coverImage || ""} onChange={(v) => setEditingChapter({...editingChapter, coverImage: v})} label="تصویر فصل" />
                        <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                          <input type="checkbox" checked={!!editingChapter.isFree} onChange={(e) => setEditingChapter({...editingChapter, isFree: e.target.checked})} /> فصل رایگان (پیش‌نمایش)
                        </label>
                        <div className="flex gap-2">
                          <button onClick={async () => { if (await act({ action: "updateChapter", chapterId: ch.id, title: editingChapter.title, description: editingChapter.description, coverImage: editingChapter.coverImage, isFree: editingChapter.isFree })) setEditingChapter(null); }} className="px-4 py-2 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> ذخیره تغییرات</button>
                          <button onClick={() => setEditingChapter(null)} className="px-4 py-2 rounded-[8px] bg-white/10 text-slate-300 text-xs font-black">انصراف</button>
                        </div>
                      </div>
                    ) : (
                      // === VIEW CHAPTER MODE ===
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-[8px] bg-primary-500/20 text-primary-300 flex items-center justify-center text-xs font-black">{(i+1).toLocaleString("fa-IR")}</div>
                          {ch.coverImage && <img src={ch.coverImage} className="w-12 h-12 rounded-[8px] object-cover shrink-0 border border-white/10" loading="lazy" decoding="async" />}
                          <div className="min-w-0">
                            <div className="text-sm font-black text-white truncate">{ch.title}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>{(ch.lessons?.length || 0).toLocaleString("fa-IR")} درس</span>
                              {ch.isFree && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-black">رایگان</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => setAddingLessonTo(addingLessonTo === ch.id ? null : ch.id)} className="p-1.5 rounded-[6px] bg-primary-600/25 text-primary-300 hover:bg-primary-600/40" title="افزودن درس">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingChapter({ id: ch.id, title: ch.title, description: ch.description || "", coverImage: ch.coverImage || "", isFree: !!ch.isFree })} className="p-1.5 rounded-[6px] bg-sky-500/20 text-sky-400 hover:bg-sky-500/30" title="ویرایش فصل">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => { if (confirm("حذف این فصل و همه درس‌هایش؟")) act({ action: "deleteChapter", chapterId: ch.id }); }} className="p-1.5 rounded-[6px] bg-error-500/20 text-error-400 hover:bg-error-500/30">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {addingLessonTo === ch.id && (
                      <div className="p-4 border-t border-white/5 bg-white/[0.02] space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-black text-emerald-300"><Plus className="w-3.5 h-3.5" /> افزودن درس جدید</div>
                        <input value={newLesson.title} onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} placeholder="عنوان درس" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
                        <div className="grid md:grid-cols-2 gap-2">
                          <select value={newLesson.videoProvider} onChange={(e) => setNewLesson({...newLesson, videoProvider: e.target.value})} className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold">
                            <option value="direct">آپلود مستقیم (Direct URL)</option>
                            <option value="youtube">یوتیوب</option>
                            <option value="aparat">آپارات</option>
                            <option value="drive">Google Drive</option>
                            <option value="vimeo">Vimeo</option>
                          </select>
                          <input type="number" value={newLesson.videoDuration} onChange={(e) => setNewLesson({...newLesson, videoDuration: Number(e.target.value)})} placeholder="مدت (ثانیه)" className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
                        </div>
                        <input value={newLesson.videoUrl} onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})} placeholder="لینک ویدئو (URL)" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
                        <textarea value={newLesson.description} onChange={(e) => setNewLesson({...newLesson, description: e.target.value})} placeholder="توضیح کوتاه درس (اختیاری)" rows={2} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
                        <ImagePickField value={newLesson.coverImage || ""} onChange={(v) => setNewLesson({...newLesson, coverImage: v})} label="تصویر درس" />
                        <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                          <input type="checkbox" checked={newLesson.isFree} onChange={(e) => setNewLesson({...newLesson, isFree: e.target.checked})} /> این درس رایگان و پیش‌نمایش باشد (بدون قفل)
                        </label>
                        <div className="flex gap-2">
                          <button onClick={async () => { if (!newLesson.title) return; if (await act({ action: "addLesson", chapterId: ch.id, ...newLesson })) { setAddingLessonTo(null); setNewLesson({title:"",type:"video",videoUrl:"",videoProvider:"direct",videoDuration:0,isFree:false,description:"",coverImage:""}); }}} className="px-4 py-2 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black">افزودن درس</button>
                          <button onClick={() => setAddingLessonTo(null)} className="px-4 py-2 rounded-[8px] bg-white/10 text-slate-300 text-xs font-black">انصراف</button>
                        </div>
                      </div>
                    )}

                    {ch.lessons && ch.lessons.length > 0 && (
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        {ch.lessons.map((l: any, li: number) => (
                          <div key={l.id}>
                            {editingLesson?.id === l.id ? (
                              // === EDIT LESSON MODE ===
                              <div className="p-4 space-y-3 bg-sky-500/5 border-l-2 border-sky-500/60">
                                <div className="flex items-center gap-2 text-[11px] font-black text-sky-300"><Pencil className="w-3.5 h-3.5" /> ویرایش درس</div>
                                <input value={editingLesson.title || ""} onChange={(e) => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="عنوان درس" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
                                <div className="grid md:grid-cols-2 gap-2">
                                  <select value={editingLesson.videoProvider || "direct"} onChange={(e) => setEditingLesson({...editingLesson, videoProvider: e.target.value})} className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold">
                                    <option value="direct">آپلود مستقیم</option>
                                    <option value="youtube">یوتیوب</option>
                                    <option value="aparat">آپارات</option>
                                    <option value="drive">Google Drive</option>
                                    <option value="vimeo">Vimeo</option>
                                  </select>
                                  <input type="number" value={editingLesson.videoDuration || 0} onChange={(e) => setEditingLesson({...editingLesson, videoDuration: Number(e.target.value)})} placeholder="مدت (ثانیه)" className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
                                </div>
                                <input value={editingLesson.videoUrl || ""} onChange={(e) => setEditingLesson({...editingLesson, videoUrl: e.target.value})} placeholder="لینک ویدئو" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
                                <textarea value={editingLesson.description || ""} onChange={(e) => setEditingLesson({...editingLesson, description: e.target.value})} placeholder="توضیح درس" rows={2} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
                                <ImagePickField value={editingLesson.coverImage || ""} onChange={(v) => setEditingLesson({...editingLesson, coverImage: v})} label="تصویر درس" />
                                <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
                                  <input type="checkbox" checked={!!editingLesson.isFree} onChange={(e) => setEditingLesson({...editingLesson, isFree: e.target.checked})} /> رایگان و بدون قفل
                                </label>
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    const payload: any = { action: "updateLesson", lessonId: l.id, title: editingLesson.title, description: editingLesson.description, videoUrl: editingLesson.videoUrl, videoProvider: editingLesson.videoProvider, videoDuration: editingLesson.videoDuration, coverImage: editingLesson.coverImage, isFree: editingLesson.isFree };
                                    if (await act(payload)) setEditingLesson(null);
                                  }} className="px-4 py-2 rounded-[8px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1"><Check className="w-3.5 h-3.5" /> ذخیره</button>
                                  <button onClick={() => setEditingLesson(null)} className="px-4 py-2 rounded-[8px] bg-white/10 text-slate-300 text-xs font-black">انصراف</button>
                                </div>
                              </div>
                            ) : (
                              // === VIEW LESSON MODE ===
                              <div className="p-3 flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-slate-300 font-black">{(li+1).toLocaleString("fa-IR")}</div>
                                {l.coverImage ? (
                                  <img src={l.coverImage} className="w-9 h-9 rounded-[6px] object-cover shrink-0 border border-white/10" loading="lazy" decoding="async" />
                                ) : (
                                  l.isFree ? <PlayCircle className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-white truncate">{l.title}</div>
                                  <div className="text-[9px] text-slate-500">{l.videoDuration ? `${Math.floor(l.videoDuration/60)}:${String(l.videoDuration%60).padStart(2,"0")}` : ""} {l.videoProvider !== "direct" && `• ${l.videoProvider}`}</div>
                                </div>
                                <button onClick={() => act({ action: "updateLesson", lessonId: l.id, isFree: !l.isFree })} className={`text-[10px] font-black px-2 py-1 rounded-[6px] ${l.isFree ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                                  {l.isFree ? "رایگان" : "قفل"}
                                </button>
                                <button onClick={() => setEditingLesson({ ...l })} className="p-1 rounded-[4px] bg-sky-500/20 text-sky-400 hover:bg-sky-500/30" title="ویرایش">
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={() => { if (confirm("حذف این درس؟")) act({ action: "deleteLesson", lessonId: l.id }); }} className="p-1 rounded-[4px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
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
    categoryId: "", requirements: "", image: "",
    scheduleDays: [] as string[], scheduleTime: "", sessionDuration: "", totalHours: "",
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
          <div className="md:col-span-2 rounded-[14px] border border-cyan-500/20 bg-cyan-500/5 p-4">
            <ImagePickField value={newCourse.image || ""} onChange={(value) => setNewCourse({ ...newCourse, image: value })} label="تصویر اصلی کارت دوره حضوری" />
            <p className="mt-2 text-[9px] leading-5 text-cyan-200">این تصویر روی کارت دوره در صفحه اصلی، فهرست دوره‌ها و صفحه آموزشگاه نمایش داده می‌شود.</p>
          </div>
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
          <input placeholder="تعداد کل جلسات (خودکار محاسبه می‌شود)" type="number" value={newCourse.totalSessions} onChange={(e) => setNewCourse({ ...newCourse, totalSessions: e.target.value })}
            className="px-4 py-3 rounded-[12px] bg-[#0B1120] border border-white/10 text-sm font-semibold text-white placeholder:text-slate-500" />

          {/* ═══════════ SMART SCHEDULE BUILDER ═══════════ */}
          <div className="md:col-span-2">
            <ScheduleBuilder
              startDate={newCourse.startDate}
              scheduleDays={newCourse.scheduleDays}
              scheduleTime={newCourse.scheduleTime}
              sessionDuration={newCourse.sessionDuration}
              totalHours={newCourse.totalHours}
              onChange={(patch) => setNewCourse({ ...newCourse, ...patch })}
            />
          </div>

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
                <div className="rounded-[12px] border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <ImagePickField value={editCourse.image || ""} onChange={(value) => setEditCourse({ ...editCourse, image: value })} label="تصویر اصلی کارت دوره حضوری" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">رشته دوره</label>
                  <select value={editCourse.categoryId || ""} onChange={(event) => setEditCourse({ ...editCourse, categoryId: event.target.value })} className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-xs font-semibold text-white mt-1">
                    {categories?.map((category: any) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </div>
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

                {/* Schedule Builder (edit) */}
                <ScheduleBuilder
                  startDate={editCourse.startDate ?? ""}
                  scheduleDays={Array.isArray(editCourse.scheduleDays) ? editCourse.scheduleDays : []}
                  scheduleTime={editCourse.scheduleTime ?? ""}
                  sessionDuration={String(editCourse.sessionDuration ?? "")}
                  totalHours={String(editCourse.totalHours ?? "")}
                  onChange={(patch) => setEditCourse({ ...editCourse, ...patch })}
                />

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
                      scheduleDays: editCourse.scheduleDays || [],
                      scheduleTime: editCourse.scheduleTime,
                      sessionDuration: editCourse.sessionDuration,
                      totalHours: editCourse.totalHours,
                      instructor: editCourse.instructor, instructorTitle: editCourse.instructorTitle,
                      level: editCourse.level, requirements: editCourse.requirements,
                      categoryId: editCourse.categoryId, image: editCourse.image || null,
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
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">شروع: </span><b className="text-cyan-300">{c.startDate ? String(c.startDate).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]) : "—"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5"><span className="text-slate-500">پایان: </span><b className="text-emerald-300">{c.endDate ? String(c.endDate).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d]) : "—"}</b></div>
                  <div className="bg-[#0B1120] rounded-[10px] p-2.5 col-span-2"><span className="text-slate-500">مدرس: </span><b className="text-white">{c.instructor || "—"}</b></div>
                </div>
                {c.scheduleDays && Array.isArray(c.scheduleDays) && c.scheduleDays.length > 0 && (
                  <div className="mb-3 p-2.5 rounded-[10px] bg-primary-500/10 border border-primary-500/30 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Calendar className="w-3 h-3 text-primary-400" />
                      <span className="text-primary-300 font-black">{formatScheduleDays(c.scheduleDays)}</span>
                      {c.scheduleTime && <span className="text-slate-400">• ساعت {String(c.scheduleTime).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}</span>}
                      {c.sessionDuration > 0 && <span className="text-slate-400">• هر جلسه {String(c.sessionDuration).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])} دقیقه</span>}
                      {c.totalHours > 0 && <span className="text-slate-400">• کل {String(c.totalHours).replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])} ساعت</span>}
                    </div>
                  </div>
                )}

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
                            <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
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

/* ============================= STUDENTS TAB (grouped by course) ============================= */
function StudentsTab({ data, refresh }: { data: any; refresh: () => void }) {
  const students = (data?.students || []) as any[];
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [docsModalStudent, setDocsModalStudent] = useState<{ id: number; fullName: string } | null>(null);
  const [feesModalStudent, setFeesModalStudent] = useState<{ id: number; fullName: string; courseTitle: string } | null>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");

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

  // فیلتر اولیه
  const filtered = students.filter((s: any) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search) {
      const q = search.trim().toLowerCase();
      const hay = `${s.fullName || ""} ${s.phone || ""} ${s.courseTitle || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // گروه‌بندی بر اساس دوره
  const groupsMap = new Map<string, { key: string; courseId: any; courseTitle: string; items: any[] }>();
  for (const s of filtered) {
    const key = String(s.courseId ?? s.courseTitle ?? "unknown");
    if (!groupsMap.has(key)) groupsMap.set(key, { key, courseId: s.courseId, courseTitle: s.courseTitle || "بدون دوره", items: [] });
    groupsMap.get(key)!.items.push(s);
  }
  let groups = Array.from(groupsMap.values()).sort((a, b) => (a.courseTitle || "").localeCompare(b.courseTitle || "", "fa"));
  if (selectedGroup !== "all") groups = groups.filter((g) => g.key === selectedGroup);

  const toggle = (k: string) => setExpanded((prev) => ({ ...prev, [k]: !(prev[k] ?? true) }));
  const isOpen = (k: string) => expanded[k] ?? true;

  const expandAll = () => {
    const o: Record<string, boolean> = {};
    groups.forEach((g) => (o[g.key] = true));
    setExpanded(o);
  };
  const collapseAll = () => {
    const o: Record<string, boolean> = {};
    groups.forEach((g) => (o[g.key] = false));
    setExpanded(o);
  };

  const totalStudents = students.length;
  const totalApproved = students.filter((s: any) => s.status === "approved").length;
  const totalPending = students.filter((s: any) => s.status === "pending").length;
  const totalGroups = new Set(students.map((s: any) => String(s.courseId ?? s.courseTitle))).size;

  const statusChip = (status: string) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${
      status === "approved" ? "bg-emerald-500/15 text-emerald-400" : status === "rejected" ? "bg-error-500/15 text-error-400" : "bg-amber-500/15 text-amber-400"}`}>
      {status === "approved" ? "تأیید شد" : status === "rejected" ? "رد شد" : "در انتظار"}
    </span>
  );

  return (
    <div>
      <h2 className="text-2xl font-black mb-1">لیست هنرجویان</h2>
      <p className="text-slate-400 text-sm mb-6">هنرجویان به تفکیک گروه/دوره — روی هر گروه کلیک کن تا هنرجویان آن دوره نمایش داده شوند</p>
      {msg && <div className="mb-4 p-3 rounded-[10px] bg-error-500/10 text-error-400 text-xs font-bold">{msg}</div>}

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div className="p-4 rounded-[14px] bg-gradient-to-br from-primary-500/15 to-primary-500/5 border border-primary-500/20">
          <div className="text-[10px] text-slate-400 font-bold mb-1">کل گروه‌های درسی</div>
          <div className="text-2xl font-black text-primary-300">{totalGroups.toLocaleString("fa-IR")}</div>
        </div>
        <div className="p-4 rounded-[14px] bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-500/20">
          <div className="text-[10px] text-slate-400 font-bold mb-1">تأیید شده</div>
          <div className="text-2xl font-black text-emerald-300">{totalApproved.toLocaleString("fa-IR")}</div>
        </div>
        <div className="p-4 rounded-[14px] bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20">
          <div className="text-[10px] text-slate-400 font-bold mb-1">در انتظار</div>
          <div className="text-2xl font-black text-amber-300">{totalPending.toLocaleString("fa-IR")}</div>
        </div>
        <div className="p-4 rounded-[14px] bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 border border-indigo-500/20">
          <div className="text-[10px] text-slate-400 font-bold mb-1">کل هنرجویان</div>
          <div className="text-2xl font-black text-indigo-300">{totalStudents.toLocaleString("fa-IR")}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4 p-4 rounded-[14px] bg-[#111a2e] border border-white/5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 جستجو در نام، موبایل یا دوره..."
          className="flex-1 px-3 py-2 rounded-[10px] bg-white/85 text-[#0F172A] text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-3 py-2 rounded-[10px] bg-white/85 text-[#0F172A] text-xs font-bold outline-none min-w-[180px]"
          style={{ colorScheme: "light" }}
        >
          <option value="all">همه گروه‌ها</option>
          {Array.from(new Map(students.map((s: any) => [String(s.courseId ?? s.courseTitle), s])).values()).map((s: any) => (
            <option key={String(s.courseId ?? s.courseTitle)} value={String(s.courseId ?? s.courseTitle)}>
              {s.courseTitle}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-[10px] bg-white/85 text-[#0F172A] text-xs font-bold outline-none min-w-[130px]"
          style={{ colorScheme: "light" }}
        >
          <option value="all">همه وضعیت‌ها</option>
          <option value="pending">در انتظار</option>
          <option value="approved">تأیید شده</option>
          <option value="rejected">رد شده</option>
        </select>
        <div className="flex gap-2">
          <button onClick={expandAll} className="px-3 py-2 rounded-[10px] bg-primary-500/15 text-primary-300 text-[10px] font-black hover:bg-primary-500/25 cursor-pointer">باز کردن همه</button>
          <button onClick={collapseAll} className="px-3 py-2 rounded-[10px] bg-slate-500/15 text-slate-300 text-[10px] font-black hover:bg-slate-500/25 cursor-pointer">بستن همه</button>
        </div>
      </div>

      {/* Groups */}
      {groups.length === 0 ? (
        <div className="p-10 text-center text-slate-500 text-sm bg-[#111a2e] border border-white/5 rounded-[18px]">
          {students.length === 0 ? "هنوز هنرجویی ثبت‌نام نکرده است" : "با فیلترهای فعلی نتیجه‌ای یافت نشد"}
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const approvedCount = g.items.filter((s: any) => s.status === "approved").length;
            const pendingCount = g.items.filter((s: any) => s.status === "pending").length;
            const rejectedCount = g.items.filter((s: any) => s.status === "rejected").length;
            const open = isOpen(g.key);
            return (
              <div key={g.key} className="bg-[#111a2e] border border-white/5 rounded-[18px] overflow-hidden">
                {/* Group Header */}
                <button
                  onClick={() => toggle(g.key)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 bg-gradient-to-l from-primary-500/10 to-transparent hover:from-primary-500/20 transition-all cursor-pointer text-right"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-transform ${open ? "rotate-90" : ""} bg-primary-500/20 text-primary-300`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6" /></svg>
                    </div>
                    <div>
                      <div className="font-black text-white text-sm flex items-center gap-2">
                        📚 {g.courseTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {g.items.length.toLocaleString("fa-IR")} هنرجو در این دوره
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {approvedCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400">
                        {approvedCount.toLocaleString("fa-IR")} تأیید
                      </span>
                    )}
                    {pendingCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400">
                        {pendingCount.toLocaleString("fa-IR")} در انتظار
                      </span>
                    )}
                    {rejectedCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-error-500/15 text-error-400">
                        {rejectedCount.toLocaleString("fa-IR")} رد
                      </span>
                    )}
                  </div>
                </button>

                {/* Group Body */}
                {open && (
                  <div className="overflow-x-auto border-t border-white/5">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5 bg-white/[0.02]">
                          <th className="px-5 py-3">هنرجو</th>
                          <th className="px-5 py-3">موبایل</th>
                          <th className="px-5 py-3">تاریخ</th>
                          <th className="px-5 py-3">وضعیت</th>
                          <th className="px-5 py-3">اقدام</th>
                          <th className="px-5 py-3">گواهینامه</th>
                          <th className="px-5 py-3">مدارک</th>
                          <th className="px-5 py-3">شهریه و اقساط</th>
                          <th className="px-5 py-3">مدیریت</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {g.items.map((s: any) => (
                          <tr key={s.id} className="hover:bg-white/5">
                            <td className="px-5 py-3.5 font-bold text-white">{s.fullName}
                              {s.notes && <div className="text-[10px] text-slate-500 font-normal line-clamp-1">{s.notes}</div>}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-white" dir="ltr">{s.phone}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-[10px]">{new Date(s.createdAt).toLocaleDateString("fa-IR")}</td>
                            <td className="px-5 py-3.5">{statusChip(s.status)}</td>
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
                            <td className="px-5 py-3.5">
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => setEditStudent({ ...s })}
                                  title="ویرایش اطلاعات هنرجو"
                                  className="p-1.5 rounded-[8px] bg-sky-500/15 text-sky-400 hover:bg-sky-500/30 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm(`❗ آیا مطمئن هستید که می‌خواهید ثبت‌نام «${s.fullName}» در دوره «${s.courseTitle}» را حذف کنید؟\n\nاین عملیات:\n• ثبت‌نام هنرجو را کاملاً حذف می‌کند\n• همه اقساط، هزینه‌ها و مدارک مرتبط پاک می‌شوند\n• قابل بازگشت نیست!`)) return;
                                    setDeletingId(s.id);
                                    const ok = await act({ action: "deleteStudent", registrationId: s.id });
                                    setDeletingId(null);
                                    if (ok) setMsg(`✅ ثبت‌نام «${s.fullName}» با موفقیت حذف شد`);
                                  }}
                                  disabled={deletingId === s.id}
                                  title="حذف ثبت‌نام هنرجو"
                                  className="p-1.5 rounded-[8px] bg-error-500/15 text-error-400 hover:bg-error-500/30 disabled:opacity-40 cursor-pointer"
                                >
                                  {deletingId === s.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                </button>
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
          })}
        </div>
      )}

      {editStudent && (
        <EditStudentModal
          student={editStudent}
          onClose={() => setEditStudent(null)}
          onSave={async (payload) => {
            const ok = await act({ action: "updateStudent", registrationId: editStudent.id, ...payload });
            if (ok) { setEditStudent(null); setMsg("✅ اطلاعات هنرجو با موفقیت بروزرسانی شد"); }
          }}
        />
      )}

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

/* ============================= EDIT STUDENT MODAL ============================= */
function EditStudentModal({ student, onClose, onSave }: { student: any; onClose: () => void; onSave: (payload: any) => Promise<void> }) {
  const [fullName, setFullName] = useState(student.fullName || "");
  const [phone, setPhone] = useState(student.phone || "");
  const [email, setEmail] = useState(student.email || "");
  const [notes, setNotes] = useState(student.notes || "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    setErr("");
    if (!fullName.trim()) { setErr("نام و نام‌خانوادگی الزامی است"); return; }
    if (!/^09\d{9}$/.test(phone.trim())) { setErr("شماره موبایل باید با 09 شروع شده و 11 رقم باشد"); return; }
    setSaving(true);
    try {
      await onSave({ fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), notes });
    } catch { setErr("خطا در ذخیره‌سازی"); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0f1a30] border border-white/10 rounded-[22px] shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-sky-500/20 to-transparent border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-sky-500/20 text-sky-300 flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <div className="font-black text-white text-sm">ویرایش اطلاعات هنرجو</div>
              <div className="text-[10px] text-slate-400">دوره: {student.courseTitle}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[8px] hover:bg-white/10 text-slate-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {err && <div className="p-3 rounded-[10px] bg-error-500/15 text-error-400 text-xs font-bold">{err}</div>}

          <div>
            <label className="block text-[10px] font-black text-slate-300 mb-1.5">نام و نام‌خانوادگی *</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-[#0F172A] text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-300 mb-1.5">موبایل *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" maxLength={11}
              className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-[#0F172A] text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-300 mb-1.5">ایمیل (اختیاری)</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" type="email"
              className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-[#0F172A] text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-300 mb-1.5">یادداشت مدیر (اختیاری)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-[#0F172A] text-xs font-bold outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>

          <div className="p-3 rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-bold leading-relaxed">
            💡 توجه: اطلاعات دوره ثبت‌نام شده و وضعیت (تأیید/رد) از این بخش قابل تغییر نیست. برای تغییر وضعیت از دکمه‌های ✓ / ✕ در جدول استفاده کنید.
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 bg-white/[0.02] border-t border-white/5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-[10px] bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black cursor-pointer">
            انصراف
          </button>
          <button onClick={submit} disabled={saving} className="flex-1 py-2.5 rounded-[10px] bg-gradient-to-l from-sky-500 to-primary-500 text-white text-xs font-black cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> ذخیره تغییرات</>}
          </button>
        </div>
      </div>
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
              <img src={img} alt={`نمونه‌کار ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
              <img src={img} alt={`بنر ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
                  <input type="range" min="0" max="100" step="1" value={curProgress}
                    onChange={(e) => {
                      const p = Number(e.target.value);
                      // Auto-sync sessions if totalSess known
                      const syncedSessions = totalSess > 0 ? Math.round((p / 100) * totalSess) : drafts[s.id]?.sessionsAttended;
                      setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], progress: p, sessionsAttended: syncedSessions } });
                    }}
                    className="w-full accent-primary-500" />
                </div>

                {/* Sessions attended (auto-sync with progress) */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">جلسات شرکت‌کرده</label>
                    <input type="number" min="0" max={totalSess || 100} value={curSessions}
                      onChange={(e) => {
                        const sess = Math.max(0, Number(e.target.value) || 0);
                        // Auto-sync progress from sessions if totalSess known
                        const syncedProgress = totalSess > 0 ? Math.min(100, Math.round((sess / totalSess) * 100)) : drafts[s.id]?.progress;
                        setDrafts({ ...drafts, [s.id]: { ...drafts[s.id], sessionsAttended: sess, progress: syncedProgress } });
                      }}
                      className="w-full px-3 py-2 rounded-[8px] bg-[#0B1120] border border-white/10 text-sm text-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 mb-1 block">کل جلسات دوره</label>
                    <div className="px-3 py-2 rounded-[8px] bg-[#0B1120] border border-white/10 text-sm text-slate-500">
                      {String(totalSess || "—").replace(/[0-9]/g, d => "۰۱۲۳۴۵۶۷۸۹"[+d])}
                    </div>
                  </div>
                </div>
                {totalSess === 0 && (
                  <div className="mb-3 p-2 rounded-[8px] bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300">
                    ⚠️ کل جلسات این دوره تعیین نشده — برای همگام‌سازی خودکار، در تب «مدیریت دوره‌ها» تعداد کل جلسات دوره را وارد کنید.
                  </div>
                )}

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

/* ═══════════════════════════════════════════════════════════════
   SCHEDULE BUILDER — smart course scheduling with auto end-date
   ═══════════════════════════════════════════════════════════════ */
function ScheduleBuilder({ startDate, scheduleDays, scheduleTime, sessionDuration, totalHours, onChange }: {
  startDate: string;
  scheduleDays: string[];
  scheduleTime: string;
  sessionDuration: string;
  totalHours: string;
  onChange: (patch: any) => void;
}) {
  const sesDur = Number(sessionDuration) || 0;
  const totHrs = Number(totalHours) || 0;

  // Live preview calculation
  let preview: any = null;
  if (startDate && scheduleDays.length > 0 && sesDur > 0 && totHrs > 0) {
    preview = calculateCourseSchedule(startDate, scheduleDays, sesDur, totHrs);
  }

  const toPersian = (str: string | number) => String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  return (
    <div className="bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border-2 border-primary-500/30 rounded-[16px] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-primary-400" />
        <h4 className="text-sm font-black text-primary-300">زمان‌بندی هوشمند دوره</h4>
        <span className="text-[10px] font-black bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">
          🎯 تاریخ پایان خودکار محاسبه می‌شود
        </span>
      </div>

      <div className="space-y-3">
        {/* Days picker */}
        <div>
          <label className="text-[11px] font-bold text-slate-400 mb-1.5 block">روزهای برگزاری کلاس</label>
          <WeekdayPicker value={scheduleDays} onChange={(days) => onChange({ scheduleDays: days })} />
        </div>

        {/* Time + Duration + Total hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">ساعت شروع هر جلسه</label>
            <input type="time" value={scheduleTime} onChange={(e) => onChange({ scheduleTime: e.target.value })}
              dir="ltr" placeholder="16:00"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white font-bold text-center" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">مدت هر جلسه (دقیقه)</label>
            <input type="number" value={sessionDuration} onChange={(e) => onChange({ sessionDuration: e.target.value })}
              min="15" max="480" placeholder="۹۰"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white font-bold text-center" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">کل ساعت دوره</label>
            <input type="number" value={totalHours} onChange={(e) => onChange({ totalHours: e.target.value })}
              min="1" max="2000" placeholder="۴۰"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white font-bold text-center" />
          </div>
        </div>

        {/* Live preview */}
        {preview && !preview.error && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/40 rounded-[12px] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-300">پیش‌نمایش زمان‌بندی</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              <div className="bg-black/20 rounded-[8px] p-2">
                <div className="text-[9px] text-slate-400 mb-0.5">تعداد جلسات</div>
                <div className="text-base font-black text-white">{toPersian(preview.totalSessions)}</div>
              </div>
              <div className="bg-black/20 rounded-[8px] p-2">
                <div className="text-[9px] text-slate-400 mb-0.5">روزهای کلاس</div>
                <div className="text-[10px] font-black text-primary-300">{formatScheduleDays(scheduleDays)}</div>
              </div>
              <div className="bg-black/20 rounded-[8px] p-2">
                <div className="text-[9px] text-slate-400 mb-0.5">تاریخ شروع</div>
                <div className="text-[11px] font-black text-cyan-300">{toPersian(startDate)}</div>
              </div>
              <div className="bg-emerald-500/15 rounded-[8px] p-2 border border-emerald-500/40">
                <div className="text-[9px] text-emerald-300 mb-0.5">تاریخ پایان</div>
                <div className="text-[11px] font-black text-emerald-300">{preview.endDate ? toPersian(preview.endDate) : "—"}</div>
              </div>
            </div>
            {scheduleTime && (
              <div className="text-[10px] text-emerald-200 mt-2 text-center">
                🕐 هر جلسه ساعت <b>{toPersian(scheduleTime)}</b> شروع می‌شود و <b>{toPersian(sesDur)}</b> دقیقه طول می‌کشد
              </div>
            )}
          </div>
        )}

        {preview?.error && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-[10px] p-2 text-[10px] text-amber-300">
            ⚠️ {preview.error}
          </div>
        )}

        {!preview && (
          <div className="text-[10px] text-slate-500 text-center py-2">
            💡 برای محاسبه تاریخ پایان دوره، همه فیلدها را کامل کنید: تاریخ شروع، روزها، مدت جلسه، و کل ساعت دوره
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================= INSTRUCTORS MANAGER TAB ============================= */
function ManagerInstructorsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/manager/instructors").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
  };
  useEffect(load, []);

  const act = async (payload: any) => {
    const r = await fetch("/api/manager/instructors", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) { setMsg("✅ ذخیره شد"); load(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const newItem = () => setEditing({ id: null, name: "", title: "", phone: "", email: "", bio: "", specialties: [""], yearsExperience: 0, avatar: "", isActive: true });

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><UserCircle2 className="w-5 h-5 text-primary-400" /> مدیریت اساتید</h2>
          <p className="text-slate-400 text-sm">ثبت و مدیریت اساتید آموزشگاه</p>
        </div>
        <button onClick={newItem} className="px-4 py-2 rounded-[12px] gradient-button text-white font-black text-sm flex items-center gap-1">
          <Plus className="w-4 h-4" /> استاد جدید
        </button>
      </div>
      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 && !editing ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <UserCircle2 className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-slate-500 text-sm">هنوز استادی ثبت نکرده‌اید</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((ins: any) => (
            <div key={ins.id} className="rounded-[16px] bg-[#111a2e] border border-white/10 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black text-lg shrink-0 overflow-hidden">
                  {ins.avatar ? <img src={ins.avatar} className="w-full h-full object-cover" loading="lazy" decoding="async" /> : (ins.name || "?").charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-white text-sm">{ins.name}</div>
                  {ins.title && <div className="text-[11px] text-primary-300">{ins.title}</div>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${ins.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                  {ins.is_active ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 space-y-1 mb-3">
                {ins.phone && <div>📱 <span dir="ltr">{ins.phone}</span></div>}
                {ins.years_experience > 0 && <div>💼 {ins.years_experience} سال سابقه</div>}
                {Array.isArray(ins.specialties) && ins.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {ins.specialties.filter((s: string) => s).map((s: string, i: number) => (
                      <span key={i} className="px-1.5 py-0.5 rounded-full bg-white/5 text-[9px]">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setEditing({ ...ins, specialties: ins.specialties || [""] })} className="flex-1 px-3 py-2 rounded-[8px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 text-[11px] font-black flex items-center justify-center gap-1">
                  <Pencil className="w-3 h-3" /> ویرایش
                </button>
                <button onClick={() => { if (confirm("حذف این استاد؟")) act({ action: "delete", id: ins.id }); }} className="px-3 py-2 rounded-[8px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#082D53] rounded-[18px] border border-white/10 p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-black text-white mb-2">{editing.id ? "ویرایش استاد" : "استاد جدید"}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">نام و نام‌خانوادگی *</label>
                <input value={editing.name || ""} onChange={e => setEditing({...editing, name: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">تخصص</label>
                <input value={editing.title || ""} onChange={e => setEditing({...editing, title: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">سابقه (سال)</label>
                <input type="number" value={editing.years_experience || editing.yearsExperience || 0} onChange={e => setEditing({...editing, yearsExperience: Number(e.target.value)})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">موبایل</label>
                <input value={editing.phone || ""} onChange={e => setEditing({...editing, phone: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">ایمیل</label>
                <input value={editing.email || ""} onChange={e => setEditing({...editing, email: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">رزومه</label>
                <textarea value={editing.bio || ""} onChange={e => setEditing({...editing, bio: e.target.value})} rows={3} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">تخصص‌ها (با کاما جدا کنید)</label>
                <input
                  value={(editing.specialties || []).join("، ")}
                  onChange={e => setEditing({...editing, specialties: e.target.value.split(/[،,]/).map(s => s.trim()).filter(Boolean)})}
                  className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold"
                  placeholder="مثلاً: خیاطی، طراحی، آشپزی"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">تصویر (URL)</label>
                <input value={editing.avatar || ""} onChange={e => setEditing({...editing, avatar: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold" dir="ltr" />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active !== false && editing.isActive !== false} onChange={e => setEditing({...editing, isActive: e.target.checked, is_active: e.target.checked})} />
                <span className="text-xs text-slate-300 font-bold">فعال</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={async () => {
                if (!editing.name) { setMsg("❌ نام الزامی است"); return; }
                const payload: any = { action: editing.id ? "update" : "create", ...editing };
                if (payload.is_active !== undefined) payload.isActive = payload.is_active;
                if (payload.years_experience !== undefined) payload.yearsExperience = payload.years_experience;
                if (await act(payload)) setEditing(null);
              }} className="flex-1 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black">ذخیره</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-[10px] bg-white/10 text-slate-300 text-sm font-black">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= GRADES MANAGER TAB ============================= */
function ManagerGradesTab({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const students = (data?.students || []).filter((s: any) => s.status === "approved");
  const courses = (data?.courses || []) as any[];

  const load = () => {
    setLoading(true);
    fetch("/api/manager/grades" + (filterCourse ? `?courseId=${filterCourse}` : "")).then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); });
    fetch("/api/manager/instructors").then(r => r.json()).then(d => setInstructors(d.items || []));
  };
  useEffect(load, [filterCourse]);

  const act = async (payload: any) => {
    const r = await fetch("/api/manager/grades", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(payload) });
    const d = await r.json();
    if (r.ok) { setMsg("✅ ذخیره شد"); load(); return true; }
    setMsg("❌ " + (d.error || "خطا")); return false;
  };

  const newGrade = () => setEditing({ id: null, registrationId: "", subject: "", theoreticalScore: "", practicalScore: "", finalScore: "", maxScore: 20, passingScore: 10, instructorId: "", description: "" });

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><Award className="w-5 h-5 text-primary-400" /> ثبت نمرات و کارنامه</h2>
          <p className="text-slate-400 text-sm">ثبت نمره تئوری، عملی و نمره نهایی برای هنرجویان</p>
        </div>
        <div className="flex gap-2">
          <select value={filterCourse} onChange={e => setFilterCourse(e.target.value)} className="px-3 py-2 rounded-[10px] bg-white/85 text-slate-900 text-xs font-bold">
            <option value="">همه دوره‌ها</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button onClick={newGrade} className="px-4 py-2 rounded-[12px] gradient-button text-white font-black text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> ثبت نمره جدید</button>
        </div>
      </div>
      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 && !editing ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <Award className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-slate-500 text-sm">هنوز نمره‌ای ثبت نشده</p>
        </div>
      ) : (
        <div className="bg-[#111a2e] border border-white/5 rounded-[16px] overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">هنرجو</th>
                <th className="px-4 py-3">دوره</th>
                <th className="px-4 py-3">موضوع</th>
                <th className="px-4 py-3">تئوری</th>
                <th className="px-4 py-3">عملی</th>
                <th className="px-4 py-3">نهایی</th>
                <th className="px-4 py-3">وضعیت</th>
                <th className="px-4 py-3">اقدام</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((g: any) => (
                <tr key={g.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-bold text-white">{g.student_name}<div className="text-[9px] text-slate-500" dir="ltr">{g.student_phone}</div></td>
                  <td className="px-4 py-3 text-slate-300">{g.course_title}</td>
                  <td className="px-4 py-3 text-slate-300">{g.subject || "—"}</td>
                  <td className="px-4 py-3 text-slate-300" dir="ltr">{g.theoretical_score ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300" dir="ltr">{g.practical_score ?? "—"}</td>
                  <td className="px-4 py-3 font-black text-white" dir="ltr">{g.final_score ?? "—"}/{g.max_score}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${g.status === "passed" ? "bg-emerald-500/20 text-emerald-400" : g.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {g.status === "passed" ? "قبول" : g.status === "failed" ? "مردود" : "در انتظار"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => setEditing({...g, registrationId: g.registration_id})} className="p-1.5 rounded-[6px] bg-sky-500/20 text-sky-400"><Pencil className="w-3 h-3" /></button>
                      <button onClick={() => { if (confirm("حذف این نمره؟")) act({ action: "delete", id: g.id }); }} className="p-1.5 rounded-[6px] bg-error-500/20 text-error-400"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#082D53] rounded-[18px] border border-white/10 p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="text-sm font-black text-white mb-2">{editing.id ? "ویرایش نمره" : "ثبت نمره جدید"}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">هنرجو *</label>
                <select value={editing.registrationId || ""} onChange={e => setEditing({...editing, registrationId: e.target.value})} disabled={!!editing.id} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold disabled:opacity-60">
                  <option value="">— انتخاب هنرجو —</option>
                  {students.map((s: any) => <option key={s.id} value={s.id}>{s.fullName} — {s.courseTitle}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">موضوع (اختیاری)</label>
                <input value={editing.subject || ""} onChange={e => setEditing({...editing, subject: e.target.value})} placeholder="مثلاً: فصل ۱ — کار با مقدماتی" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">نمره تئوری</label>
                <input type="number" step="0.25" value={editing.theoretical_score ?? editing.theoreticalScore ?? ""} onChange={e => setEditing({...editing, theoreticalScore: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">نمره عملی</label>
                <input type="number" step="0.25" value={editing.practical_score ?? editing.practicalScore ?? ""} onChange={e => setEditing({...editing, practicalScore: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">نمره نهایی *</label>
                <input type="number" step="0.25" value={editing.final_score ?? editing.finalScore ?? ""} onChange={e => setEditing({...editing, finalScore: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">نمره کل</label>
                <input type="number" value={editing.max_score ?? editing.maxScore ?? 20} onChange={e => setEditing({...editing, maxScore: Number(e.target.value)})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">حد قبولی</label>
                <input type="number" step="0.25" value={editing.passing_score ?? editing.passingScore ?? 10} onChange={e => setEditing({...editing, passingScore: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 block mb-1">استاد</label>
                <select value={editing.instructor_id ?? editing.instructorId ?? ""} onChange={e => setEditing({...editing, instructorId: e.target.value})} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold">
                  <option value="">—</option>
                  {instructors.map((ins: any) => <option key={ins.id} value={ins.id}>{ins.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 block mb-1">توضیحات</label>
                <textarea value={editing.description || ""} onChange={e => setEditing({...editing, description: e.target.value})} rows={2} className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={async () => {
                if (!editing.registrationId || editing.finalScore === "" || editing.finalScore == null) { setMsg("❌ هنرجو و نمره نهایی الزامی است"); return; }
                if (await act({ action: editing.id ? "update" : "create", ...editing })) setEditing(null);
              }} className="flex-1 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black">ذخیره</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2.5 rounded-[10px] bg-white/10 text-slate-300 text-sm font-black">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= ATTENDANCE MANAGER TAB ============================= */
function ManagerAttendanceTab({ data }: { data: any }) {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const students = (data?.students || []).filter((s: any) => s.status === "approved");
  const courses = (data?.courses || []) as any[];
  const courseStudents = selectedCourse ? students.filter((s: any) => String(s.courseId) === String(selectedCourse)) : [];

  const load = () => {
    if (!selectedCourse || !selectedDate) return;
    setLoading(true);
    fetch(`/api/manager/attendance?courseId=${selectedCourse}&date=${selectedDate}`).then(r => r.json()).then(d => {
      setExisting(d.items || []);
      const map: Record<number, string> = {};
      (d.items || []).forEach((a: any) => { map[a.user_id] = a.status; });
      setAttendance(map);
      setLoading(false);
    });
  };
  useEffect(load, [selectedCourse, selectedDate]);

  const mark = (userId: number, status: string) => {
    setAttendance(a => ({...a, [userId]: status}));
  };
  const submit = async () => {
    const records = courseStudents.map((s: any) => ({
      registrationId: s.id,
      userId: s.userId,
      status: attendance[s.userId] || "absent",
    }));
    const r = await fetch("/api/manager/attendance", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "bulkMark", courseId: selectedCourse, sessionDate: selectedDate, records })});
    const d = await r.json();
    if (r.ok) { setMsg(`✅ حضور و غیاب ${d.count || 0} هنرجو ثبت شد`); load(); }
    else setMsg("❌ " + (d.error || "خطا"));
  };

  return (
    <div>
      <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-primary-400" /> حضور و غیاب</h2>
      <p className="text-slate-400 text-sm mb-6">ثبت حضور و غیاب هنرجویان در جلسات کلاس</p>
      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      <div className="grid md:grid-cols-2 gap-3 mb-4 p-4 rounded-[14px] bg-[#111a2e] border border-white/10">
        <div>
          <label className="text-[10px] font-black text-slate-400 block mb-1">انتخاب دوره</label>
          <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold">
            <option value="">— انتخاب دوره —</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-black text-slate-400 block mb-1">تاریخ جلسه</label>
          <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full px-3 py-2.5 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" dir="ltr" />
        </div>
      </div>

      {!selectedCourse ? (
        <div className="text-center py-10 text-slate-500">ابتدا دوره را انتخاب کنید</div>
      ) : loading ? (
        <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : courseStudents.length === 0 ? (
        <div className="text-center py-10 text-slate-500">هنرجویی در این دوره تأیید نشده</div>
      ) : (
        <>
          <div className="bg-[#111a2e] border border-white/5 rounded-[16px] overflow-hidden mb-4">
            {courseStudents.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 p-3 border-b border-white/5 last:border-0">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-300 flex items-center justify-center font-black text-sm shrink-0">
                  {(s.fullName || "?").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-white text-sm">{s.fullName}</div>
                  <div className="text-[10px] text-slate-500" dir="ltr">{s.phone}</div>
                </div>
                <div className="flex gap-1">
                  {[
                    { k: "present", l: "حاضر", c: "emerald" },
                    { k: "late", l: "تاخیر", c: "amber" },
                    { k: "excused", l: "با اجازه", c: "sky" },
                    { k: "absent", l: "غایب", c: "red" },
                  ].map(o => (
                    <button key={o.k} onClick={() => mark(s.userId, o.k)}
                      className={`px-2.5 py-1.5 rounded-[8px] text-[10px] font-black transition ${
                        attendance[s.userId] === o.k
                          ? `bg-${o.c}-500 text-white shadow-lg`
                          : `bg-${o.c}-500/10 text-${o.c}-400 hover:bg-${o.c}-500/25`
                      }`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={submit} className="px-6 py-3 rounded-[12px] gradient-button text-white font-black text-sm flex items-center gap-2">
            <Check className="w-4 h-4" /> ثبت حضور و غیاب این جلسه
          </button>
        </>
      )}
    </div>
  );
}

/* ============================= MANAGER REPORTS (Excel Downloads) ============================= */
function ManagerReportsTab() {
  const [loading, setLoading] = useState<string | null>(null);
  const download = async (type: string, label: string) => {
    setLoading(type);
    try {
      const res = await fetch(`/api/manager/report?type=${type}&format=excel`);
      if (!res.ok) { alert("خطا در دانلود گزارش"); setLoading(null); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e) { alert("خطا: " + (e as any)?.message); }
    setLoading(null);
  };

  const REPORTS = [
    { k: "students", l: "لیست هنرجویان", d: "نام، موبایل، دوره، وضعیت، پیشرفت و تاریخ ثبت‌نام", c: "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30", icon: Users },
    { k: "courses", l: "لیست دوره‌ها", d: "دوره‌ها با آمار ثبت‌نام، ظرفیت، شهریه و مدرس", c: "from-primary-500/15 to-primary-500/5 border-primary-500/30", icon: BookOpen },
    { k: "grades", l: "نمرات و کارنامه‌ها", d: "همه نمرات ثبت‌شده با تفکیک تئوری/عملی و وضعیت قبولی", c: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30", icon: Award },
    { k: "attendance", l: "حضور و غیاب", d: "لیست کامل حضور و غیاب هنرجویان با تاریخ و وضعیت", c: "from-amber-500/15 to-amber-500/5 border-amber-500/30", icon: CheckCircle },
    { k: "revenue", l: "درآمد فروش آنلاین", d: "خریدهای دوره‌های آنلاین با مبلغ، کمیسیون و خالص دریافتی", c: "from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-500/30", icon: Wallet },
    { k: "fees", l: "شهریه و اقساط", d: "همه شهریه‌ها، اقساط، هزینه‌های اضافه با تاریخ پرداخت", c: "from-rose-500/15 to-rose-500/5 border-rose-500/30", icon: FolderOpen },
  ];

  return (
    <div>
      <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><FolderOpen className="w-5 h-5 text-primary-400" /> گزارش‌گیری Excel</h2>
      <p className="text-slate-400 text-sm mb-6">با یک کلیک گزارش کامل هر بخش را به‌صورت فایل Excel دانلود کنید</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map(r => (
          <div key={r.k} className={`p-5 rounded-[18px] bg-gradient-to-br ${r.c} border relative overflow-hidden`}>
            <div className="w-11 h-11 rounded-[12px] bg-white/10 flex items-center justify-center mb-3">
              <r.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-black text-white mb-1">{r.l}</div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{r.d}</p>
            <button onClick={() => download(r.k, r.l)} disabled={loading === r.k} className="w-full py-2.5 rounded-[10px] bg-white/95 hover:bg-white text-slate-900 text-xs font-black flex items-center justify-center gap-2 disabled:opacity-60">
              {loading === r.k ? <Loader2 className="w-4 h-4 animate-spin" /> : <>📊 دانلود Excel</>}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-[12px] bg-primary-500/10 border border-primary-500/30 text-xs text-slate-300">
        💡 <b>نکته:</b> فایل‌های Excel با فرمت xlsx و ستون‌های فارسی راست‌چین صادر می‌شوند. می‌توانید مستقیم در Microsoft Excel یا Google Sheets باز کنید.
      </div>
    </div>
  );
}

/* ============================= MANAGER GROUPS TAB ============================= */
function ManagerGroupsTab({ data }: { data: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [openGroup, setOpenGroup] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState<any>({ title: "", description: "", courseId: "", type: "course", autoAddStudents: true });
  const courses = (data?.courses || []) as any[];

  const load = () => { setLoading(true); fetch("/api/groups").then(r => r.json()).then(d => { setItems(d.items || []); setLoading(false); }); };
  useEffect(load, []);

  const create = async () => {
    if (!form.title) { setMsg("❌ عنوان الزامی است"); return; }
    const r = await fetch("/api/groups", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "createGroup", ...form })});
    const d = await r.json();
    if (r.ok) { setMsg("✅ گروه ایجاد شد"); setCreating(false); setForm({ title: "", description: "", courseId: "", type: "course", autoAddStudents: true }); load(); }
    else setMsg("❌ " + (d.error || "خطا"));
  };

  if (openGroup) return <GroupChatView group={openGroup} onBack={() => { setOpenGroup(null); load(); }} isManager={true} />;

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black mb-1 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-primary-400" /> گروه‌های پیام‌رسان</h2>
          <p className="text-slate-400 text-sm">ایجاد گروه چت برای هر دوره — ارسال پیام گروهی به هنرجویان</p>
        </div>
        <button onClick={() => setCreating(!creating)} className="px-4 py-2 rounded-[12px] gradient-button text-white font-black text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> گروه جدید</button>
      </div>
      {msg && <div className={`mb-4 p-3 rounded-[10px] text-xs font-bold ${msg.startsWith("❌") ? "bg-error-500/15 text-error-400" : "bg-emerald-500/15 text-emerald-400"}`}>{msg}</div>}

      {creating && (
        <div className="mb-4 p-5 rounded-[16px] bg-[#111a2e] border border-white/10 space-y-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="عنوان گروه" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-sm font-bold" />
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} placeholder="توضیح (اختیاری)" className="w-full px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold resize-none" />
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold">
              <option value="course">دوره‌ای (چت هنرجویان یک دوره)</option>
              <option value="announcement">اطلاعیه (فقط اطلاعیه مدیر)</option>
              <option value="general">عمومی</option>
            </select>
            <select value={form.courseId} onChange={e => setForm({...form, courseId: e.target.value})} className="px-3 py-2 rounded-[8px] bg-white/85 text-slate-900 text-xs font-bold">
              <option value="">— دوره (اختیاری) —</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300 font-bold">
            <input type="checkbox" checked={form.autoAddStudents} onChange={e => setForm({...form, autoAddStudents: e.target.checked})} />
            افزودن خودکار همه هنرجویان تأیید‌شده این دوره
          </label>
          <div className="flex gap-2">
            <button onClick={create} className="flex-1 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black">ذخیره گروه</button>
            <button onClick={() => setCreating(false)} className="px-4 py-2.5 rounded-[10px] bg-white/10 text-slate-300 text-sm font-black">انصراف</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-[#111a2e] border border-white/5 rounded-[16px]">
          <MessageCircle className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-slate-500 text-sm">هیچ گروهی نساخته‌اید</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((g: any) => (
            <button key={g.id} onClick={() => setOpenGroup(g)} className="w-full text-right p-4 rounded-[14px] bg-[#111a2e] hover:bg-white/5 border border-white/10 transition flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black shrink-0">
                {(g.title || "?").charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-white text-sm">{g.title}</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-primary-500/20 text-primary-300">{g.type === "course" ? "دوره‌ای" : g.type === "announcement" ? "اطلاعیه" : "عمومی"}</span>
                  {g.unread_count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-black">{Number(g.unread_count).toLocaleString("fa-IR")} خوانده نشده</span>}
                </div>
                {g.last_message && <div className="text-[11px] text-slate-400 truncate mt-0.5">{g.last_message}</div>}
                <div className="text-[9px] text-slate-500 mt-1">👥 {g.member_count || 0} عضو • 💬 {g.msg_count || 0} پیام</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================= GROUP CHAT VIEW ============================= */
function GroupChatView({ group, onBack, isManager }: { group: any; onBack: () => void; isManager: boolean }) {
  const [data, setData] = useState<any>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useState<any>(null)[0];

  const load = () => fetch(`/api/groups?groupId=${group.id}`).then(r => r.json()).then(setData);
  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [group.id]);
  useEffect(() => {
    // auto-scroll
    const el = document.getElementById("group-msgs");
    if (el) el.scrollTop = el.scrollHeight;
  }, [data?.messages?.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/groups", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action: "sendMessage", groupId: group.id, content: text })});
    setText("");
    setSending(false);
    load();
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex items-center justify-between p-4 rounded-t-[16px] bg-[#111a2e] border border-white/10 border-b-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300"><ChevronLeft className="w-4 h-4 rotate-180" /></button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-black">{(group.title||"?").charAt(0)}</div>
          <div>
            <div className="font-black text-white text-sm">{group.title}</div>
            <div className="text-[10px] text-slate-400">{data?.members?.length || group.member_count || 0} عضو</div>
          </div>
        </div>
      </div>
      <div id="group-msgs" className="flex-1 overflow-y-auto p-4 bg-white/5 border-x border-white/10 space-y-2">
        {(data?.messages || []).map((m: any) => {
          const isMine = data?.currentUserId === m.sender_id;
          const isSystem = m.message_type === "system";
          if (isSystem) return <div key={m.id} className="text-center text-[10px] text-slate-500 py-2">{m.content}</div>;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] p-3 rounded-[14px] ${isMine ? "bg-primary-600 text-white" : m.sender_role === "manager" ? "bg-emerald-500/25 text-white border border-emerald-500/40" : "bg-white/10 text-white"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black opacity-80">{m.sender_name || "کاربر"}</span>
                  {m.sender_role === "manager" && <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black">مدیر</span>}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                <div className="text-[9px] opacity-60 mt-1 text-right">{new Date(m.created_at).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        {(data?.messages?.length || 0) === 0 && <div className="text-center py-10 text-slate-500 text-sm">هنوز پیامی ارسال نشده</div>}
      </div>
      <div className="p-3 bg-[#111a2e] border border-white/10 border-t-0 rounded-b-[16px] flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="پیام خود را بنویسید..." className="flex-1 px-3 py-2 rounded-[10px] bg-white/85 text-slate-900 text-sm font-bold" />
        <button onClick={send} disabled={sending || !text.trim()} className="px-4 py-2 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black disabled:opacity-50 flex items-center gap-1">
          <Send className="w-4 h-4" /> ارسال
        </button>
      </div>
    </div>
  );
}

/* ============================= MANAGER SUBSCRIPTION TAB ============================= */
function ManagerSubscriptionTab() {
  const [data, setData] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/manager/subscription").then(r => r.json()),
      fetch("/api/admin/plans").then(r => r.json()),
    ]).then(([d, p]) => { setData(d); setPlans(p.items || []); setLoading(false); });
  }, []);

  if (loading) return <div className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" /></div>;

  const cur = data?.current;
  const usage = data?.usage || {};
  const hist = data?.history || [];
  const isActive = cur?.status === "active" && (!cur.expires_at || new Date(cur.expires_at) > new Date());
  const daysLeft = cur?.expires_at ? Math.max(0, Math.ceil((new Date(cur.expires_at).getTime() - Date.now()) / 86400000)) : null;

  const usagePercent = (used: number, max: number) => max === 0 ? 0 : Math.min(100, Math.round((used / max) * 100));

  return (
    <div>
      <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-2"><Award className="w-5 h-5 text-amber-400" /> پلن اشتراک من</h2>
      <p className="text-slate-400 text-sm mb-6">وضعیت پلن فعلی، میزان مصرف، و امکان ارتقا</p>

      {/* Current plan card */}
      {cur ? (
        <div className={`p-6 rounded-[20px] mb-6 relative overflow-hidden ${
          cur.plan_color === "amber" ? "bg-gradient-to-br from-amber-500/25 to-amber-500/5 border-2 border-amber-500/50" :
          cur.plan_color === "purple" ? "bg-gradient-to-br from-purple-500/25 to-purple-500/5 border-2 border-purple-500/50" :
          cur.plan_color === "slate" ? "bg-gradient-to-br from-slate-500/25 to-slate-500/5 border-2 border-slate-500/50" :
          "bg-gradient-to-br from-primary-500/25 to-primary-500/5 border-2 border-primary-500/50"
        }`}>
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="text-[11px] font-black text-amber-300 mb-1">🏆 پلن فعال</div>
              <h3 className="text-2xl font-black text-white mb-1">{cur.plan_name}</h3>
              <p className="text-xs text-slate-300">{cur.plan_description}</p>
            </div>
            <div className="text-left">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black inline-block mb-2 ${isActive ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                {isActive ? "✓ فعال" : cur.status === "expired" ? "منقضی شده" : "لغو شده"}
              </span>
              {daysLeft !== null && (
                <div className={`text-xs font-black ${daysLeft <= 7 ? "text-red-400" : daysLeft <= 30 ? "text-amber-400" : "text-slate-300"}`}>
                  ⏰ {daysLeft.toLocaleString("fa-IR")} روز باقی‌مانده
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 rounded-[12px] bg-black/25">
              <div className="text-[10px] text-slate-400 mb-1">شروع اشتراک</div>
              <div className="text-xs font-black text-white">{new Date(cur.started_at).toLocaleDateString("fa-IR")}</div>
            </div>
            <div className="p-3 rounded-[12px] bg-black/25">
              <div className="text-[10px] text-slate-400 mb-1">تاریخ انقضا</div>
              <div className="text-xs font-black text-white">{cur.expires_at ? new Date(cur.expires_at).toLocaleDateString("fa-IR") : "—"}</div>
            </div>
            <div className="p-3 rounded-[12px] bg-black/25">
              <div className="text-[10px] text-slate-400 mb-1">هزینه</div>
              <div className="text-xs font-black text-emerald-400" dir="ltr">{Number(cur.price || 0).toLocaleString("fa-IR")} ت</div>
            </div>
            <div className="p-3 rounded-[12px] bg-black/25">
              <div className="text-[10px] text-slate-400 mb-1">کمیسیون سامانه</div>
              <div className="text-xs font-black text-amber-400">{cur.commission_percent}٪</div>
            </div>
          </div>

          {/* Usage bars */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-300 font-bold">📚 دوره‌ها: {usage.courses}/{cur.max_courses === 0 ? "∞" : cur.max_courses}</span>
                <span className="text-slate-400">{cur.max_courses === 0 ? "نامحدود" : `${usagePercent(usage.courses, cur.max_courses)}٪`}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-l from-primary-500 to-primary-300 transition-all" style={{ width: cur.max_courses === 0 ? "20%" : `${usagePercent(usage.courses, cur.max_courses)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-300 font-bold">👥 هنرجویان: {usage.students}/{cur.max_students === 0 ? "∞" : cur.max_students}</span>
                <span className="text-slate-400">{cur.max_students === 0 ? "نامحدود" : `${usagePercent(usage.students, cur.max_students)}٪`}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-l from-emerald-500 to-emerald-300 transition-all" style={{ width: cur.max_students === 0 ? "20%" : `${usagePercent(usage.students, cur.max_students)}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-300 font-bold">🎬 دوره‌های فروش آنلاین: {usage.shopCourses}/{cur.max_shop_courses === 0 ? "0 (غیرمجاز)" : cur.max_shop_courses}</span>
                <span className="text-slate-400">{cur.max_shop_courses === 0 ? "—" : `${usagePercent(usage.shopCourses, cur.max_shop_courses)}٪`}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-l from-amber-500 to-amber-300 transition-all" style={{ width: cur.max_shop_courses === 0 ? "0%" : `${usagePercent(usage.shopCourses, cur.max_shop_courses)}%` }} />
              </div>
            </div>
          </div>

          {/* Features */}
          {Array.isArray(cur.features) && cur.features.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-[10px] font-black text-slate-400 mb-2">امکانات پلن شما:</div>
              <div className="flex flex-wrap gap-1.5">
                {cur.features.map((f: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-white/10 text-[10px] font-bold text-white flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-[16px] bg-amber-500/15 border-2 border-amber-500/30 mb-6 text-center">
          <div className="text-lg font-black text-amber-300 mb-2">⚠ شما هنوز اشتراک فعالی ندارید</div>
          <p className="text-sm text-slate-300 mb-4">برای فعال‌سازی، یکی از پلن‌های زیر رو انتخاب کنید و با مدیر کل تماس بگیرید.</p>
        </div>
      )}

      {/* Available plans for upgrade */}
      <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary-400" /> پلن‌های قابل ارتقا
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {plans.filter((p: any) => Number(p.price) > 0 && p.id !== cur?.plan_id).map((p: any, idx: number) => {
          const c = p.color || "primary";
          const gradient =
            c === "amber" ? "from-amber-500 via-orange-500 to-yellow-500" :
            c === "purple" ? "from-fuchsia-500 via-purple-500 to-pink-500" :
            c === "slate" ? "from-slate-400 via-slate-500 to-slate-600" :
            "from-blue-500 via-cyan-500 to-teal-500";
          const glowFrom =
            c === "amber" ? "rgba(245,158,11,0.55)" :
            c === "purple" ? "rgba(168,85,247,0.55)" :
            c === "slate" ? "rgba(148,163,184,0.4)" :
            "rgba(59,130,246,0.55)";
          const glowTo =
            c === "amber" ? "rgba(217,119,6,0.35)" :
            c === "purple" ? "rgba(236,72,153,0.35)" :
            c === "slate" ? "rgba(100,116,139,0.25)" :
            "rgba(14,165,233,0.35)";

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative group ${p.is_popular ? "lg:scale-[1.03] z-10" : ""}`}
            >
              {/* Ambient glow */}
              <div
                className="absolute -inset-2 rounded-[32px] opacity-70 blur-2xl group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(60% 50% at 30% 20%, ${glowFrom} 0%, transparent 60%), radial-gradient(50% 50% at 70% 90%, ${glowTo} 0%, transparent 60%)`,
                }}
              />
              {/* Card */}
              <div
                className={`relative h-full flex flex-col rounded-[28px] overflow-hidden backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 ${
                  p.is_popular
                    ? "bg-gradient-to-br from-[#131a35]/95 via-[#0f1428]/95 to-[#0a0d1e]/95 border-2 border-amber-400/60"
                    : "bg-gradient-to-br from-[#0e1226]/95 via-[#111632]/95 to-[#0a0d1e]/95 border border-white/10 group-hover:border-white/25"
                }`}
              >
                {/* Popular ribbon */}
                {p.is_popular && (
                  <div className="relative py-2 bg-gradient-to-l from-amber-400 via-yellow-400 to-amber-400 text-slate-900 text-center text-xs font-black tracking-wide shadow-lg">
                    🏆 محبوب‌ترین انتخاب
                  </div>
                )}

                {/* Inner glow blobs */}
                <div
                  className="absolute -top-24 -right-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-70"
                  style={{ background: glowFrom }}
                />
                <div
                  className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-60"
                  style={{ background: glowTo }}
                />
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />

                <div className="relative p-7 flex-1 flex flex-col">
                  {/* Plan name + icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg text-xl`}>
                      {c === "amber" ? "🏆" : c === "purple" ? "💎" : c === "slate" ? "⚙️" : "🚀"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-2xl font-black text-white leading-tight">{p.name}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="text-sm text-slate-400 mb-6 leading-relaxed min-h-[40px]">
                    {p.description}
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-2" dir="ltr">
                      <span className={`text-4xl md:text-5xl font-black bg-gradient-to-l ${gradient} bg-clip-text text-transparent leading-none`}>
                        {Number(p.price).toLocaleString("fa-IR")}
                      </span>
                      <span className="text-sm text-slate-400 font-bold">تومان</span>
                    </div>
                    <div className="text-xs text-slate-500 font-bold mt-1">
                      برای {p.duration_days} روز
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {(p.features || []).map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-200 leading-relaxed">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                          c === "amber" ? "text-amber-300" :
                          c === "purple" ? "text-fuchsia-300" :
                          c === "slate" ? "text-slate-300" :
                          "text-cyan-300"
                        }`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits box */}
                  <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span>📚</span>
                      <span>{p.max_courses === 0 ? "دوره نامحدود" : `تا ${p.max_courses} دوره`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span>👥</span>
                      <span>{p.max_students === 0 ? "هنرجو نامحدود" : `تا ${p.max_students} هنرجو`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span>🎬</span>
                      <span>{p.max_shop_courses === 0 ? "بدون فروش آنلاین" : `${p.max_shop_courses} دوره فروش آنلاین`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <span>💰</span>
                      <span>کمیسیون سامانه: {p.commission_percent}٪</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href="tel:09159513179"
                    className={`block text-center py-3.5 rounded-2xl text-sm font-black shadow-lg hover:scale-[1.02] transition-transform text-white bg-gradient-to-l ${gradient}`}
                  >
                    📞 تماس برای فعال‌سازی
                  </a>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* History */}
      {hist.length > 0 && (
        <div>
          <h3 className="text-sm font-black text-white mb-3">📜 تاریخچه اشتراک‌ها</h3>
          <div className="bg-[#111a2e] border border-white/5 rounded-[16px] overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-right text-[10px] font-black text-slate-500 border-b border-white/5">
                  <th className="px-4 py-3">پلن</th>
                  <th className="px-4 py-3">وضعیت</th>
                  <th className="px-4 py-3">شروع</th>
                  <th className="px-4 py-3">پایان</th>
                  <th className="px-4 py-3">مبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {hist.map((h: any) => (
                  <tr key={h.id} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-bold text-white">{h.plan_name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${h.status === "active" ? "bg-emerald-500/20 text-emerald-400" : h.status === "expired" ? "bg-red-500/20 text-red-400" : "bg-slate-500/20 text-slate-400"}`}>
                        {h.status === "active" ? "فعال" : h.status === "expired" ? "منقضی" : "لغو شده"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-[10px]">{new Date(h.started_at).toLocaleDateString("fa-IR")}</td>
                    <td className="px-4 py-3 text-slate-500 text-[10px]">{h.expires_at ? new Date(h.expires_at).toLocaleDateString("fa-IR") : "—"}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold" dir="ltr">{Number(h.price || 0).toLocaleString("fa-IR")} ت</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


function AIStudioTab() {
  const [active, setActive] = useState<"course" | "sms" | "insta" | "chat">("course");
  const TOOLS: { key: any; label: string; icon: string; color: string }[] = [
    { key: "course", label: "توضیح دوره", icon: "📚", color: "from-blue-500 to-indigo-600" },
    { key: "sms", label: "پیامک تبلیغاتی", icon: "💬", color: "from-emerald-500 to-teal-600" },
    { key: "insta", label: "پست اینستاگرام", icon: "📸", color: "from-fuchsia-500 to-pink-600" },
    { key: "chat", label: "گفتگو با AI", icon: "🤖", color: "from-amber-500 to-orange-600" },
  ];
  const configs: any = {
    course: {
      mode: "content_course",
      title: "تولید توضیح دوره",
      subtitle: "توضیح جذاب و SEO دار",
      gradient: "from-blue-500 to-indigo-600",
      placeholder: "عنوان دوره + سطح + مخاطب رو بنویس (مثلا: فتوشاپ حرفه‌ای، پیشرفته، طراحان)",
      welcome: "سلام مدیر عزیز! 👋 عنوان دوره‌ات رو بنویس تا برات توضیح حرفه‌ای SEO دار بنویسم — شامل هوک، مزایا، مخاطب هدف و CTA.",
      quickPrompts: [
        "دوره فتوشاپ حرفه‌ای برای طراحان مبتدی",
        "دوره حسابداری کاربردی با نرم‌افزار هلو",
        "دوره خیاطی مجلسی زنانه",
      ],
      useStream: false,
    },
    sms: {
      mode: "content_sms",
      title: "تولید پیامک تبلیغاتی",
      subtitle: "۱۶۰ کاراکتری با CTA قوی",
      gradient: "from-emerald-500 to-teal-600",
      placeholder: "هدف پیامک رو بنویس (مثلا: دعوت به ثبت‌نام دوره فتوشاپ با ۳۰٪ تخفیف)",
      welcome: "چه پیامکی می‌خوای بسازم؟ هدف + پیشنهاد + مخاطب رو بگو، من ۳ نسخه جذاب می‌سازم.",
      quickPrompts: [
        "دعوت به دوره جدید کامپیوتر با ۲۵٪ تخفیف",
        "یادآوری قسط شهریه هنرجویان",
        "اعلام کلاس فوق‌العاده روز جمعه",
      ],
      useStream: false,
    },
    insta: {
      mode: "content_insta",
      title: "تولید پست اینستاگرام",
      subtitle: "کپشن + هشتگ + CTA",
      gradient: "from-fuchsia-500 to-pink-600",
      placeholder: "موضوع پست رو بنویس (مثلا: معرفی دوره جدید آرایشگری با گواهی)",
      welcome: "موضوع پست چیه؟ عنوان + توضیح کوتاه + هدفت (فروش/آگاهی/تعامل) رو بگو، پست کامل با کپشن و هشتگ می‌سازم.",
      quickPrompts: [
        "معرفی دوره جدید آرایشگری با گواهی رسمی",
        "معرفی استاد جدید آموزشگاه",
        "اعلام تخفیف ویژه ثبت‌نام تابستان",
      ],
      useStream: false,
    },
    chat: {
      mode: "general",
      title: "دستیار مدیر",
      subtitle: "پاسخ به هر سوال",
      gradient: "from-amber-500 to-orange-600",
      placeholder: "هر سوال یا مشاوره‌ای درباره مدیریت آموزشگاه ازم بپرس...",
      welcome: "سلام مدیر عزیز! هر سوالی درباره مدیریت آموزشگاه، جذب هنرجو، بازاریابی، فرآیندها و ... داری بپرس.",
      quickPrompts: [
        "چطور نرخ ثبت‌نامم رو افزایش بدم؟",
        "برای جذب هنرجو تازه چه کنم؟",
        "ایده تخفیف پاییز برای دوره‌ها بده",
      ],
      useStream: true,
    },
  };
  const cfg = configs[active];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">استودیوی هوش مصنوعی</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محتوای تبلیغاتی، توضیح دوره و پاسخ سوالات — همه با AI
          </p>
        </div>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`p-4 rounded-2xl border transition-all text-right ${
              active === t.key
                ? `bg-gradient-to-br ${t.color} border-white/20 shadow-lg`
                : "bg-white/[0.03] border-white/10 hover:border-white/20"
            }`}
          >
            <div className="text-2xl mb-1">{t.icon}</div>
            <div className="text-xs font-black text-white">{t.label}</div>
          </button>
        ))}
      </div>

      <AIToolPanel
        key={active}
        mode={cfg.mode}
        title={cfg.title}
        subtitle={cfg.subtitle}
        gradient={cfg.gradient}
        placeholder={cfg.placeholder}
        welcome={cfg.welcome}
        quickPrompts={cfg.quickPrompts}
        useStream={cfg.useStream}
        height="620px"
      />
    </div>
  );
}

