"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Loader2, Lock, LayoutDashboard, BookOpen, TrendingUp, CalendarDays,
  MessageCircle, Bell, Award, Wallet, Heart, Briefcase, Phone, User,
  Play, ArrowLeft, ChevronLeft, Clock, GraduationCap, PlusCircle, Menu,
  Sparkles, Check, X, MapPin, BadgeCheck, Search, FolderOpen, Building2,
  Trash2, CheckCheck, LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";
import PersianDatePicker from "@/components/PersianDatePicker";

interface StudentReg {
  id: number;
  fullName: string;
  phone: string;
  status: string;
  createdAt: string;
  notes: string | null;
  certificateUrl: string | null;
  progress: number | null;
  sessionsAttended: number | null;
  isFavorite: boolean | null;
  courseId: number | null;
  courseTitle: string;
  courseSlug: string;
  courseImage: string | null;
  duration: string | null;
  price: string | null;
  totalSessions: number | null;
  instructor: string | null;
  instructorTitle: string | null;
  schedule: string | null;
  startDate: string | null;
  level: string | null;
  categoryName: string | null;
  instituteId: number | null;
  instituteUserId: number | null;
  instituteName: string | null;
  instituteSlug: string | null;
  institutePhone: string | null;
  instituteMobile: string | null;
  instituteAddress: string | null;
}

interface DashboardData {
  user: { id: number; name: string; phone: string; email: string; avatar: string | null } | null;
  registrations: StudentReg[];
  stats: {
    activeCourses: number;
    totalHours: number;
    certificates: number;
    walletBalance: number;
    pendingCount: number;
    completedCount: number;
    notificationsUnread: number;
  };
  upcomingSessions: any[];
}

type TabKey = "dashboard" | "courses" | "progress" | "schedule" | "chat" | "notifications" | "certificates" | "wallet" | "favorites" | "portfolio" | "profile";

const NAV_ITEMS: { key: TabKey; label: string; icon: any }[] = [
  { key: "dashboard", label: "داشبورد", icon: LayoutDashboard },
  { key: "courses", label: "دوره‌های من", icon: BookOpen },
  { key: "progress", label: "وضعیت پیشرفت", icon: TrendingUp },
  { key: "schedule", label: "تقویم آموزشی", icon: CalendarDays },
  { key: "chat", label: "چت با آموزشگاه", icon: MessageCircle },
  { key: "notifications", label: "اعلان‌ها", icon: Bell },
  { key: "certificates", label: "گواهینامه‌ها", icon: Award },
  { key: "wallet", label: "کیف پول و مالی", icon: Wallet },
  { key: "favorites", label: "علاقه‌مندی‌ها", icon: Heart },
  { key: "portfolio", label: "رزومه و نمونه‌کار", icon: Briefcase },
  { key: "profile", label: "ویرایش پروفایل", icon: User },
];

function StudentDashboardContent() {
  const { data: session } = useSession();
  const sessionUser = session?.user as any;
  const searchParams = useSearchParams();
  const phoneParam = searchParams.get("phone") || "";
  const defaultPhone = sessionUser?.phone || phoneParam || "";

  const [inputPhone, setInputPhone] = useState(defaultPhone);
  const [activePhone, setActivePhone] = useState(defaultPhone);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<TabKey>("dashboard");
  const { open: drawerOpen, setOpen: setDrawerOpen } = useMobilePanelDrawer();

  useEffect(() => {
    if (sessionUser?.phone) {
      setInputPhone(sessionUser.phone);
      setActivePhone(sessionUser.phone);
    }
  }, [sessionUser?.phone]);

  useEffect(() => {
    if (!activePhone) return;
    setLoading(true);
    fetch(`/api/student/dashboard?phone=${encodeURIComponent(normalizePhone(activePhone))}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activePhone]);

  // Not logged in yet
  if (!activePhone) {
    return (
      <div className="pt-28 pb-20 max-w-md mx-auto px-4">
        <div className="bg-[#0f172a] rounded-[24px] border border-white/10 p-8 text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-[16px] bg-primary-600 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black mb-2">پنل هنرجو</h2>
          <p className="text-slate-400 text-sm mb-6">برای مشاهده اطلاعات، شماره موبایل خود را وارد کنید یا از حساب کاربری وارد شوید.</p>
          <input value={inputPhone} onChange={(e) => setInputPhone(e.target.value)}
            placeholder="09159999999" dir="ltr"
            className="w-full px-4 py-3 rounded-[12px] bg-[#1e293b] border border-white/10 text-center text-white mb-3" />
          <button onClick={() => setActivePhone(inputPhone)}
            className="w-full py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white font-black cursor-pointer">
            ورود به پنل هنرجو
          </button>
          <Link href="/login" className="block mt-4 text-primary-300 text-xs font-bold">ورود با حساب کاربری &larr;</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="pt-28 pb-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  const displayName = data?.user?.name || "هنرجوی گرامی";
  const stats = data?.stats || { activeCourses: 0, totalHours: 0, certificates: 0, walletBalance: 0, pendingCount: 0, completedCount: 0, notificationsUnread: 0 };
  const regs = data?.registrations || [];

  return (
    <div className="pt-20 bg-[#0B1120] min-h-screen text-white">
      <div className="lg:flex lg:flex-row lg:min-h-[calc(100vh-80px)]">
        {/* Mobile top compact bar */}
        <div className="lg:hidden sticky top-20 z-30 bg-[#0B1120]/95 backdrop-blur-lg border-b border-white/10 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-[12px] bg-primary-600/20 hover:bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-300 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white truncate">{NAV_ITEMS.find(n => n.key === tab)?.label || "پنل هنرجو"}</div>
            <div className="text-[10px] text-primary-300 font-bold truncate">{displayName}</div>
          </div>
          <button onClick={() => setTab("notifications")} className="relative w-9 h-9 rounded-[10px] bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer">
            <Bell className="w-4 h-4" />
            {stats.notificationsUnread > 0 && (
              <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-error-500 text-[9px] font-black flex items-center justify-center">
                {stats.notificationsUnread}
              </span>
            )}
          </button>
        </div>

        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        )}

        <aside className={`shrink-0 bg-[#0B1120] lg:border-l lg:border-white/5 lg:w-72 lg:static lg:translate-x-0
          fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
          ${drawerOpen ? "translate-x-0 block" : "translate-x-full hidden lg:block lg:translate-x-0"}`}
          style={{ boxShadow: drawerOpen ? "-20px 0 60px rgba(0,0,0,0.5)" : undefined }}>
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
              <span className="text-base font-black">پنل هنرجو</span>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button key={item.key} onClick={() => { setTab(item.key); setDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-sm font-bold transition-all cursor-pointer text-right relative ${
                  tab === item.key
                    ? "bg-white/8 text-white ring-1 ring-primary-500/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.key === "notifications" && stats.notificationsUnread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-error-500 text-white text-[10px] font-black flex items-center justify-center">
                    {stats.notificationsUnread}
                  </span>
                )}
                {tab === item.key && <ChevronLeft className="w-4 h-4 text-primary-400" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Top header with welcome + user */}
          <div className="hidden lg:flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl lg:text-2xl font-black">
                خوش آمدید، <span className="text-primary-300">{displayName}</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setTab("notifications")} className="relative w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer">
                <Bell className="w-4 h-4" />
                {stats.notificationsUnread > 0 && (
                  <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-error-500 text-[9px] font-black flex items-center justify-center">
                    {stats.notificationsUnread}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-white/5 border border-white/10">
                <div className="text-xs">
                  <div className="font-black">هنرجو</div>
                  <div className="text-[10px] text-slate-400" dir="ltr">{activePhone}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {tab === "dashboard" && <DashboardOverview data={data} stats={stats} regs={regs} setTab={setTab} />}
          {tab === "courses" && <MyCoursesTab regs={regs} />}
          {tab === "progress" && <ProgressTab regs={regs} />}
          {tab === "schedule" && <ScheduleTab sessions={data?.upcomingSessions || []} regs={regs} />}
          {tab === "chat" && <ChatTab regs={regs} user={data?.user} />}
          {tab === "notifications" && <NotificationsTab user={data?.user} />}
          {tab === "certificates" && <CertificatesTab regs={regs} />}
          {tab === "wallet" && <WalletTab user={data?.user} balance={stats.walletBalance} />}
          {tab === "favorites" && <FavoritesTab regs={regs} />}
          {tab === "portfolio" && <PortfolioTab user={data?.user} />}
          {tab === "profile" && <ProfileTab />}
        </main>
      </div>
    </div>
  );
}

/* ============ DASHBOARD OVERVIEW (main screen matching reference image) ============ */
function DashboardOverview({ data, stats, regs, setTab }: any) {
  const currentCourse = regs.find((r: StudentReg) => r.status === "approved" && (r.progress || 0) < 100) || regs.find((r: StudentReg) => r.status === "approved");
  const upcomingClasses = (data?.upcomingSessions || []).slice(0, 4);

  const statCards = [
    { label: "دوره‌های فعال", value: stats.activeCourses, unit: "دوره", icon: Play, color: "bg-white/5" },
    { label: "ساعات آموزش", value: `+${stats.totalHours}`, unit: "ساعت", icon: Clock, color: "bg-white/5" },
    { label: "مدرک‌های دریافت شده", value: stats.certificates, unit: "گواهینامه", icon: TrendingUp, color: "bg-white/5" },
    { label: "موجودی کیف پول", value: Number(stats.walletBalance || 0).toLocaleString("fa-IR"), unit: "تومان", icon: Wallet, color: "bg-white/5" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className={`${c.color} border border-white/10 rounded-[20px] p-5 relative`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center">
                <c.icon className="w-5 h-5 text-primary-300" />
              </div>
              <div className="text-[11px] text-slate-400 font-bold">{c.label}</div>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <div className="text-3xl font-black text-white">{c.value}</div>
              <div className="text-[10px] text-slate-500 font-bold">{c.unit}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue learning */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[24px] p-6">
          <h3 className="text-base font-black mb-5">ادامه یادگیری</h3>
          {currentCourse ? (
            <div className="flex flex-col md:flex-row gap-5 items-start">
              <div className="w-full md:w-40 h-40 rounded-[16px] bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 relative overflow-hidden">
                {currentCourse.courseImage ? (
                  <img src={currentCourse.courseImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Play className="w-12 h-12 text-white/80" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-cyan-500 hover:bg-cyan-400 flex items-center justify-center cursor-pointer transition-colors">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full">
                <div className="text-[11px] font-black text-primary-300 mb-1">
                  {currentCourse.categoryName || "دوره فنی و حرفه‌ای"}
                </div>
                <h4 className="text-lg font-black text-white mb-4">{currentCourse.courseTitle}</h4>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-400">میزان پیشرفت: {currentCourse.progress || 0}%</span>
                  <span className="text-slate-500 text-[11px]">
                    {currentCourse.sessionsAttended || 0} جلسه از {currentCourse.totalSessions || "—"} جلسه
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-4">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full transition-all"
                    style={{ width: `${currentCourse.progress || 0}%` }}
                  />
                </div>
                <Link href={`/courses/${currentCourse.courseSlug}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-[14px] bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-black transition-colors">
                  ادامه مشاهده جلسه {(currentCourse.sessionsAttended || 0) + 1}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-sm">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              هنوز دوره‌ای در حال گذراندن ندارید.
            </div>
          )}
        </div>

        {/* Upcoming classes */}
        <div className="bg-white/5 border border-white/10 rounded-[24px] p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black">کلاس‌های آینده</h3>
            <button onClick={() => setTab("schedule")} className="text-[11px] text-primary-300 font-black hover:text-primary-200 cursor-pointer flex items-center gap-1">
              مشاهده همه <ChevronLeft className="w-3 h-3" />
            </button>
          </div>
          {upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 rounded-[14px] p-3">
                  <div className="w-12 h-12 rounded-[10px] bg-primary-500/20 flex flex-col items-center justify-center shrink-0 border border-primary-500/30">
                    <div className="text-[8px] text-primary-300 font-black">جلسه</div>
                    <div className="text-sm font-black">{i + 1}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate">{s.courseTitle || s.title}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {s.sessionDate || "—"} ساعت {s.sessionTime || "—"}
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-600 text-[11px]">
              موردی برای نمایش در روزهای دیگر نیست
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ MY COURSES TAB ============ */
function MyCoursesTab({ regs }: { regs: StudentReg[] }) {
  const [recommended, setRecommended] = useState<any[]>([]);
  const [loadingRec, setLoadingRec] = useState(true);

  useEffect(() => {
    fetch("/api/student/recommended-courses")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setRecommended(d) : setRecommended([]))
      .catch(() => setRecommended([]))
      .finally(() => setLoadingRec(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black">دوره‌های من ({regs.length})</h2>
        <p className="text-slate-500 text-sm mt-1">دوره‌هایی که شما در آن‌ها ثبت‌نام کرده‌اید.</p>
      </div>
      {regs.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-[20px]">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500">شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید.</p>
          <Link href="/courses" className="inline-block mt-4 px-5 py-2.5 rounded-[10px] bg-primary-600 text-white text-sm font-black">مشاهده دوره‌ها</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regs.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-[16px] p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-primary-300 mb-1">{r.categoryName || "دوره"}</div>
                  <h3 className="font-black text-white mb-1 line-clamp-1">{r.courseTitle}</h3>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {r.instituteName}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
              {r.status === "approved" && (
                <>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>پیشرفت</span>
                    <span>{r.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-3">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full" style={{ width: `${r.progress || 0}%` }} />
                  </div>
                </>
              )}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                {r.instructor && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{r.instructor}</span>}
                {r.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════ RECOMMENDED COURSES SECTION (distinct amber/gold theme) ═══════════ */}
      {!loadingRec && recommended.length > 0 && (
        <div className="mt-10">
          <div className="relative bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-2 border-dashed border-amber-500/40 rounded-[20px] p-6">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" /> پیشنهاد ویژه برای شما
            </div>

            <div className="mb-4 mt-2">
              <h3 className="text-base font-black text-amber-300 flex items-center gap-2">
                <Award className="w-5 h-5" />
                دوره‌های پیشنهادی
              </h3>
              <p className="text-[11px] text-amber-200/80 mt-1">
                این دوره‌ها توسط مرکز فنی و حرفه‌ای به شما پیشنهاد می‌شوند و شامل دوره‌های خود شما نیستند.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommended.map((c) => (
                <Link key={c.id} href={`/courses/${c.courseSlug || c.slug}`}
                  className="bg-white/5 hover:bg-amber-500/5 border border-amber-500/30 hover:border-amber-500/60 rounded-[14px] p-4 transition-all group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-black text-amber-400 mb-1">{c.categoryName || "دوره"}</div>
                      <h4 className="font-black text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">{c.title}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" /> {c.instituteName}
                      </div>
                    </div>
                    <div className="text-amber-500 shrink-0"><ChevronLeft className="w-4 h-4" /></div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/20">
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      {c.instructor && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{c.instructor}</span>}
                      {c.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.duration}</span>}
                    </div>
                    <div className="text-xs font-black text-amber-400">
                      {c.price ? Number(c.price).toLocaleString("fa-IR") + " ت" : "رایگان"}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/courses" className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-amber-300 hover:text-amber-200">
              مشاهده همه دوره‌ها <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    approved: { label: "تأیید شده", color: "bg-emerald-500/20 text-emerald-400" },
    pending: { label: "در انتظار", color: "bg-amber-500/20 text-amber-400" },
    rejected: { label: "رد شده", color: "bg-error-500/20 text-error-400" },
  };
  const s = map[status] || map.pending;
  return <span className={`text-[10px] font-black px-2 py-1 rounded-full ${s.color}`}>{s.label}</span>;
}

/* ============ PROGRESS TAB ============ */
function ProgressTab({ regs }: { regs: StudentReg[] }) {
  const approved = regs.filter((r) => r.status === "approved");
  const toPersian = (str: string | number) => String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black">وضعیت پیشرفت</h2>
        <p className="text-slate-500 text-sm mt-1">
          درصد پیشرفت هر دوره را ببینید. این اطلاعات را مدیر آموزشگاه به‌روزرسانی می‌کند و شما فقط مشاهده می‌کنید.
        </p>
      </div>
      {approved.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[16px] p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-1">هنوز در دوره تأییدشده‌ای نیستید.</p>
          <p className="text-slate-600 text-[11px]">وقتی مدیر آموزشگاه ثبت‌نام شما را تأیید کند، پیشرفت اینجا نمایش داده می‌شود.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approved.map((r) => {
            const p = r.progress || 0;
            const sessAtt = r.sessionsAttended || 0;
            const totSess = r.totalSessions || 0;
            const isDone = p >= 100;
            return (
              <div key={r.id} className={`border rounded-[16px] p-5 ${isDone ? "bg-emerald-500/5 border-emerald-500/30" : "bg-white/5 border-white/10"}`}>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-white">{r.courseTitle}</h3>
                      {isDone && <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">🎉 تکمیل شد</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {r.instituteName}
                    </div>
                    {r.instructor && (
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> مدرس: {r.instructor}
                      </div>
                    )}
                  </div>
                  <div className={`text-3xl font-black ${isDone ? "text-emerald-400" : "text-primary-300"}`}>
                    {toPersian(p)}<span className="text-lg">%</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-4">
                  <div className={`h-full transition-all ${isDone ? "bg-emerald-500" : "bg-gradient-to-r from-cyan-500 via-primary-500 to-fuchsia-500"}`}
                    style={{ width: `${p}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-[10px] py-2">
                    <div className="text-lg font-black text-emerald-400">{toPersian(sessAtt)}</div>
                    <div className="text-[9px] text-slate-500">جلسه حضور</div>
                  </div>
                  <div className="bg-white/5 rounded-[10px] py-2">
                    <div className="text-lg font-black text-sky-400">{totSess ? toPersian(totSess) : "—"}</div>
                    <div className="text-[9px] text-slate-500">کل جلسات</div>
                  </div>
                  <div className="bg-white/5 rounded-[10px] py-2">
                    <div className="text-sm font-black text-amber-400">{r.duration || "—"}</div>
                    <div className="text-[9px] text-slate-500">مدت دوره</div>
                  </div>
                </div>
                {r.certificateUrl && isDone && (
                  <a href={r.certificateUrl} download={`گواهینامه-${r.courseTitle}.png`}
                    className="mt-3 w-full py-2 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2">
                    <Award className="w-4 h-4" /> دانلود گواهینامه دوره
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ SCHEDULE TAB ============ */
function ScheduleTab({ sessions, regs }: { sessions: any[]; regs: StudentReg[] }) {
  const [rows, setRows] = useState<any[]>(sessions || []);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    setLoading(true);
    fetch("/api/student/schedule")
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows(sessions || []))
      .finally(() => setLoading(false));
  }, []);

  // Group sessions by course
  const grouped: Record<string, any[]> = {};
  rows.forEach((s) => {
    const key = s.courseTitle || "بدون دوره";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  // Parse a Persian date "1404/05/15" and compare to today (best-effort)
  const parsePersianDate = (str: string): number => {
    if (!str) return 0;
    const clean = String(str).replace(/[۰-۹]/g, (d: string) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[-.]/g, "/");
    const parts = clean.split("/").map((x) => parseInt(x.trim(), 10));
    if (parts.length !== 3 || parts.some(isNaN)) return 0;
    return parts[0] * 10000 + parts[1] * 100 + parts[2];
  };
  // Today in Jalali (approximate)
  const now = new Date();
  const jy = now.getFullYear() - 621;
  const todayApprox = jy * 10000 + (now.getMonth() + 1) * 100 + now.getDate();

  const filteredRows = rows.filter((s) => {
    if (filter === "all") return true;
    const d = parsePersianDate(s.sessionDate);
    if (filter === "upcoming") return d === 0 || d >= todayApprox;
    if (filter === "past") return d !== 0 && d < todayApprox;
    return true;
  });

  const toPersian = (str: string | number) => String(str).replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black">تقویم آموزشی</h2>
        <p className="text-slate-500 text-sm mt-1">
          جلسات دوره‌های ثبت‌نامی شما ({rows.length} جلسه). مدیر آموزشگاه جلسات را از پنل خود ثبت می‌کند.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 bg-white/5 border border-white/10 rounded-[12px] p-1 w-fit">
        {[
          { v: "all" as const, l: "همه" },
          { v: "upcoming" as const, l: "آینده" },
          { v: "past" as const, l: "گذشته" },
        ].map((f) => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold ${filter === f.v ? "bg-primary-600 text-white" : "text-slate-400"}`}>
            {f.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
      ) : filteredRows.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[16px] p-8 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-2">
            {rows.length === 0 ? "جلسه‌ای برنامه‌ریزی نشده است." : "جلسه‌ای در این دسته وجود ندارد."}
          </p>
          <p className="text-slate-600 text-[11px]">مدیر آموزشگاه می‌تواند جلسات را از پنل «تقویم جلسات دوره‌ها» ثبت کند.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRows.map((s) => {
            const d = parsePersianDate(s.sessionDate);
            const isPast = d !== 0 && d < todayApprox;
            const isToday = d === todayApprox;
            return (
              <div key={s.id} className={`border rounded-[16px] p-4 flex items-center gap-4 ${
                isToday ? "bg-primary-500/10 border-primary-500/40"
                : isPast ? "bg-white/5 border-white/10 opacity-60"
                : "bg-white/5 border-white/10"
              }`}>
                <div className={`w-14 h-14 rounded-[12px] border flex flex-col items-center justify-center shrink-0 ${
                  isToday ? "bg-primary-500/30 border-primary-400" : "bg-primary-500/20 border-primary-500/30"
                }`}>
                  <div className="text-[9px] text-primary-300 font-black">جلسه</div>
                  <div className="text-sm font-black">{toPersian(s.sessionNumber || "?")}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-sm">{s.title}</h4>
                    {isToday && <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">امروز</span>}
                    {s.attended && <span className="text-[9px] font-black bg-primary-500/20 text-primary-300 px-2 py-0.5 rounded-full">✓ حضور</span>}
                  </div>
                  <div className="text-[11px] text-primary-300 font-bold mt-0.5 truncate">{s.courseTitle}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    {s.sessionDate && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{toPersian(s.sessionDate)}</span>}
                    {s.sessionTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.sessionTime}</span>}
                    {s.duration && <span>مدت: {s.duration}</span>}
                    {s.instituteName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{s.instituteName}</span>}
                  </div>
                </div>
                {s.isOnline && s.meetingUrl && !isPast && (
                  <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black cursor-pointer shrink-0">
                    ورود به کلاس
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ CHAT TAB (placeholder — real chat added in phase 5) ============ */
function ChatTab({ regs, user }: { regs: StudentReg[]; user: any }) {
  // Group by institute (using instituteId as key, but use instituteUserId for real chat target)
  const seen = new Set<number>();
  const institutes = regs.reduce<{ id: number; userId: number | null; name: string | null; mobile: string | null }[]>((acc, r) => {
    if (r.instituteId && !seen.has(r.instituteId)) {
      seen.add(r.instituteId);
      acc.push({ id: r.instituteId, userId: r.instituteUserId, name: r.instituteName, mobile: r.instituteMobile });
    }
    return acc;
  }, []);
  return (
    <div>
      <h2 className="text-xl font-black mb-2">چت با آموزشگاه</h2>
      <p className="text-slate-500 text-sm mb-6">با مدیر هر آموزشگاهی که در دوره‌های آن ثبت‌نام کرده‌اید، مستقیم گفتگو کنید.</p>
      {institutes.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
          <MessageCircle className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">شما در هیچ آموزشگاهی ثبت‌نام نکرده‌اید.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {institutes.map((i) => {
            const hasManager = !!i.userId;
            const href = hasManager ? `/chat?with=${i.userId}&role=institute` : "#";
            return (
              <Link key={i.id} href={href}
                onClick={(e) => { if (!hasManager) { e.preventDefault(); alert("مدیر این آموزشگاه هنوز حساب کاربری فعال ندارد. لطفاً از طریق شماره تماس ارتباط برقرار کنید."); } }}
                className={`flex items-center gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-[16px] p-4 transition-colors ${!hasManager ? "opacity-60" : ""}`}>
                <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-black">{i.name}</h4>
                  <div className="text-[11px] text-slate-500">
                    {hasManager ? "آموزشگاه فنی و حرفه‌ای زبرخان" : "مدیر هنوز حساب فعال ندارد"}
                    {i.mobile && ` • ${i.mobile}`}
                  </div>
                </div>
                <MessageCircle className={`w-5 h-5 ${hasManager ? "text-primary-400" : "text-slate-600"}`} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ============ NOTIFICATIONS TAB — functional ============ */
function NotificationsTab({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };
  const markAllRead = async () => {
    setBusy(true);
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
    load();
    setBusy(false);
  };
  const deleteOne = async (id: number) => {
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };
  const deleteAll = async () => {
    if (!confirm("حذف تمام اعلان‌ها؟")) return;
    setBusy(true);
    await fetch("/api/notifications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteAll: true }) });
    load();
    setBusy(false);
  };

  const unread = items.filter((n) => !n.isRead).length;

  const typeIcon = (type: string) => {
    if (type === "success") return "✅";
    if (type === "error") return "❌";
    if (type === "warning") return "⚠️";
    if (type === "enrollment") return "📝";
    if (type === "chat") return "💬";
    return "🔔";
  };
  const typeColor = (type: string) => {
    if (type === "success") return "border-emerald-500/40 bg-emerald-500/5";
    if (type === "error") return "border-error-500/40 bg-error-500/5";
    if (type === "warning") return "border-amber-500/40 bg-amber-500/5";
    return "border-primary-500/40 bg-primary-500/5";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black">اعلان‌ها {unread > 0 && <span className="text-primary-300 text-sm">({unread} خوانده‌نشده)</span>}</h2>
          <p className="text-slate-500 text-sm mt-1">جدیدترین اعلان‌های شما ({items.length})</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} disabled={busy} className="px-3 py-2 rounded-[10px] bg-primary-500/15 text-primary-300 text-xs font-black flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" /> علامت‌گذاری همه به‌عنوان خوانده‌شده
            </button>
          )}
          {items.length > 0 && (
            <button onClick={deleteAll} disabled={busy} className="px-3 py-2 rounded-[10px] bg-error-500/15 text-error-400 text-xs font-black flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> حذف همه
            </button>
          )}
        </div>
      </div>
      {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div> :
        items.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
            <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">اعلانی وجود ندارد.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`bg-white/5 border rounded-[12px] p-4 relative ${n.isRead ? "border-white/10 opacity-75" : typeColor(n.type)}`}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl shrink-0">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-sm">{n.title}</h4>
                    {n.body && <p className="text-[12px] text-slate-400 mt-1">{n.body}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-600">
                      <span dir="ltr">{new Date(n.createdAt).toLocaleString("fa-IR")}</span>
                      {!n.isRead && <span className="text-primary-300 font-black">● جدید</span>}
                    </div>
                    {n.link && (
                      <Link href={n.link} className="inline-block mt-2 text-primary-300 text-[11px] font-black">
                        مشاهده جزئیات ←
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!n.isRead && (
                      <button onClick={() => markRead(n.id)} className="p-1.5 rounded-[8px] hover:bg-white/10 text-primary-300" title="علامت خوانده‌شده">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => deleteOne(n.id)} className="p-1.5 rounded-[8px] hover:bg-error-500/15 text-error-400" title="حذف">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

/* ============ CERTIFICATES ============ */
function CertificatesTab({ regs }: { regs: StudentReg[] }) {
  const certs = regs.filter((r) => r.certificateUrl);
  return (
    <div>
      <h2 className="text-xl font-black mb-6">گواهینامه‌ها ({certs.length})</h2>
      {certs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
          <Award className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">هنوز گواهینامه‌ای صادر نشده است.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certs.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden">
              <div className="h-40 bg-gradient-to-br from-amber-500 to-orange-500 relative">
                {r.certificateUrl && <img src={r.certificateUrl} alt="" className="w-full h-full object-cover" />}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-full bg-black/50 text-white text-[10px] font-black flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> اصیل
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-black text-sm">{r.courseTitle}</h4>
                <div className="text-[11px] text-slate-500 mt-1">{r.instituteName}</div>
                {r.certificateUrl && (
                  <a href={r.certificateUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-primary-300 text-[11px] font-black">مشاهده گواهینامه &larr;</a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ WALLET — full functional ============ */
function WalletTab({ user, balance }: { user: any; balance: number }) {
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chargeOpen, setChargeOpen] = useState(false);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeLoading, setChargeLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/student/wallet")
      .then((r) => r.json())
      .then((d) => {
        if (d.balance !== undefined) setCurrentBalance(d.balance);
        setTransactions(d.transactions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const parseAmount = (s: string): number => {
    const clean = s.replace(/[۰-۹]/g, d => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^\d]/g, "");
    return Number(clean) || 0;
  };
  const displayAmount = (v: string) => {
    const n = parseAmount(v);
    if (!n) return "";
    return n.toLocaleString("fa-IR");
  };

  const doCharge = async () => {
    const amt = parseAmount(chargeAmount);
    if (amt < 10000) {
      setMsg({ type: "err", text: "حداقل مبلغ شارژ ۱۰,۰۰۰ تومان است" });
      return;
    }
    setChargeLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/student/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deposit", amount: amt, description: "شارژ آنلاین کیف پول" }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: `کیف پول با موفقیت ${amt.toLocaleString("fa-IR")} تومان شارژ شد.` });
        setChargeAmount("");
        setChargeOpen(false);
        load();
      } else {
        setMsg({ type: "err", text: d.error || "خطا در شارژ" });
      }
    } catch {
      setMsg({ type: "err", text: "خطا در ارتباط با سرور" });
    } finally {
      setChargeLoading(false);
    }
  };

  const quickAmounts = [100_000, 500_000, 1_000_000, 5_000_000];

  const txIcon = (type: string) => {
    if (type === "deposit") return <ArrowLeft className="w-4 h-4 text-emerald-400 rotate-[135deg]" />;
    if (type === "payment") return <BookOpen className="w-4 h-4 text-primary-400" />;
    if (type === "refund") return <ArrowLeft className="w-4 h-4 text-amber-400 rotate-[-45deg]" />;
    return <Wallet className="w-4 h-4 text-slate-400" />;
  };
  const txLabel = (type: string) => {
    if (type === "deposit") return "شارژ";
    if (type === "withdraw") return "برداشت";
    if (type === "payment") return "پرداخت دوره";
    if (type === "refund") return "بازپرداخت";
    return type;
  };

  return (
    <div>
      <h2 className="text-xl font-black mb-6">کیف پول و مالی</h2>

      {msg && (
        <div className={`mb-4 p-3 rounded-[12px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-error-500/15 text-error-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-[24px] p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="relative">
          <div className="text-xs opacity-80 mb-2">موجودی کیف پول شما</div>
          <div className="text-4xl font-black mb-4" dir="ltr">
            {Number(currentBalance || 0).toLocaleString("fa-IR")} <span className="text-lg opacity-80">تومان</span>
          </div>
          <button
            onClick={() => setChargeOpen(!chargeOpen)}
            className="px-5 py-2.5 rounded-[12px] bg-white text-primary-700 font-black text-sm flex items-center gap-2 shadow-lg"
          >
            <PlusCircle className="w-4 h-4" /> شارژ کیف پول
          </button>
        </div>
      </div>

      {/* Charge form */}
      {chargeOpen && (
        <div className="mb-6 bg-white/5 border border-white/10 rounded-[16px] p-5">
          <h3 className="font-black text-sm mb-3">شارژ کیف پول</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {quickAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setChargeAmount(String(a))}
                className="py-2 rounded-[10px] bg-primary-500/15 hover:bg-primary-500/30 text-primary-300 text-xs font-black transition-colors"
              >
                {a.toLocaleString("fa-IR")} ت
              </button>
            ))}
          </div>
          <div className="relative">
            <input
              type="text"
              value={displayAmount(chargeAmount)}
              onChange={(e) => setChargeAmount(e.target.value.replace(/[^\d۰-۹]/g, ""))}
              placeholder="مبلغ به تومان (حداقل ۱۰,۰۰۰)"
              dir="ltr"
              className="w-full px-4 py-3 pl-20 rounded-[12px] bg-[#0B1120] border border-white/10 text-white text-right font-bold"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 text-xs font-black pointer-events-none">
              تومان
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={doCharge}
              disabled={chargeLoading || !chargeAmount}
              className="flex-1 py-3 rounded-[12px] bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {chargeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              پرداخت و شارژ
            </button>
            <button
              onClick={() => { setChargeOpen(false); setChargeAmount(""); }}
              className="px-4 py-3 rounded-[12px] bg-white/10 text-white text-sm font-black cursor-pointer"
            >
              انصراف
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">
            💡 در حال حاضر پرداخت آزمایشی است. با راه‌اندازی درگاه، پرداخت واقعی فعال می‌شود.
          </p>
        </div>
      )}

      {/* Transactions */}
      <div>
        <h3 className="font-black text-sm mb-3 text-slate-300">تاریخچه تراکنش‌ها</h3>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 bg-white/5 border border-white/10 rounded-[16px]">
            <Wallet className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">تراکنشی ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="bg-white/5 border border-white/10 rounded-[12px] p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center shrink-0">
                  {txIcon(t.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-sm">{txLabel(t.type)}</div>
                  {t.description && <div className="text-[10px] text-slate-500 truncate">{t.description}</div>}
                  <div className="text-[9px] text-slate-600 mt-0.5" dir="ltr">
                    {new Date(t.createdAt).toLocaleString("fa-IR")}
                  </div>
                </div>
                <div className={`text-sm font-black shrink-0 ${t.type === "deposit" || t.type === "refund" ? "text-emerald-400" : "text-error-400"}`}>
                  {t.type === "deposit" || t.type === "refund" ? "+" : "−"}
                  {Number(t.amount).toLocaleString("fa-IR")}
                  <span className="text-[10px] font-bold opacity-70 mr-1">ت</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ FAVORITES — with real toggle & remove ============ */
function FavoritesTab({ regs }: { regs: StudentReg[] }) {
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/student/favorites")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) ? setFavs(d) : setFavs([]))
      .catch(() => setFavs([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const remove = async (courseId: number) => {
    setBusy(courseId);
    try {
      await fetch("/api/student/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">علاقه‌مندی‌ها</h2>
          <p className="text-slate-500 text-sm">دوره‌های مورد علاقه شما ({favs.length} دوره)</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
      ) : favs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
          <Heart className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-2">هنوز دوره‌ای به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
          <Link href="/courses" className="inline-block mt-2 px-5 py-2 rounded-[10px] bg-primary-600 text-white text-xs font-black">
            مشاهده دوره‌ها
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favs.map((f) => (
            <div key={f.registrationId} className="bg-white/5 border border-white/10 rounded-[16px] p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-primary-300 mb-1">{f.categoryName || "دوره"}</div>
                  <h3 className="font-black text-white line-clamp-1">{f.courseTitle}</h3>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />{f.instituteName}
                  </div>
                </div>
                <button
                  onClick={() => remove(f.courseId)}
                  disabled={busy === f.courseId}
                  className="p-2 rounded-[10px] bg-error-500/15 text-error-400 hover:bg-error-500/25 cursor-pointer"
                  title="حذف از علاقه‌مندی‌ها"
                >
                  {busy === f.courseId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4 fill-error-400" />}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <div className="text-xs">
                  <span className="text-slate-500">شهریه: </span>
                  <b className="text-emerald-400">{f.price ? Number(f.price).toLocaleString("fa-IR") + " ت" : "رایگان"}</b>
                </div>
                <Link
                  href={`/courses/${f.courseSlug}`}
                  className="px-3 py-1.5 rounded-[8px] bg-primary-600 text-white text-[11px] font-black flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" /> مشاهده دوره
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ PROFILE — full edit ============ */
function ProfileTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });

  const load = () => {
    setLoading(true);
    fetch("/api/student/profile")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const save = async (extra: any = {}) => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...extra }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: "اطلاعات با موفقیت ذخیره شد." });
        load();
      } else {
        setMsg({ type: "err", text: d.error || "خطا در ذخیره" });
      }
    } catch {
      setMsg({ type: "err", text: "خطا در ارتباط با سرور" });
    } finally { setSaving(false); }
  };

  const uploadAvatar = (file: File) => {
    if (file.size > 500_000) { setMsg({ type: "err", text: "حجم عکس باید کمتر از ۵۰۰KB باشد" }); return; }
    const reader = new FileReader();
    reader.onload = () => save({ avatar: reader.result });
    reader.readAsDataURL(file);
  };

  const changePassword = async () => {
    if (passForm.newPassword.length < 6) {
      setMsg({ type: "err", text: "رمز جدید حداقل ۶ کاراکتر" }); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: "رمز عبور با موفقیت تغییر کرد." });
        setPassForm({ currentPassword: "", newPassword: "" });
        setShowPass(false);
      } else {
        setMsg({ type: "err", text: d.error || "خطا در تغییر رمز" });
      }
    } finally { setSaving(false); }
  };

  if (loading || !data) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  const set = (k: string, v: any) => setData({ ...data, [k]: v });

  return (
    <div>
      <h2 className="text-xl font-black mb-2">ویرایش پروفایل</h2>
      <p className="text-slate-500 text-sm mb-6">اطلاعات شخصی و تماس خود را به‌طور کامل مدیریت کنید.</p>

      {msg && (
        <div className={`mb-4 p-3 rounded-[12px] text-xs font-bold ${msg.type === "ok" ? "bg-emerald-500/15 text-emerald-300" : "bg-error-500/15 text-error-400"}`}>
          {msg.text}
        </div>
      )}

      {/* Avatar */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-4 flex items-center gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl overflow-hidden">
            {data.avatar ? (
              <img src={data.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (data.firstName || data.name || "?")[0]
            )}
          </div>
          <label className="absolute bottom-0 left-0 w-7 h-7 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center cursor-pointer shadow-lg">
            <PlusCircle className="w-4 h-4" />
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
          </label>
        </div>
        <div className="flex-1">
          <div className="font-black text-white">{data.name || "بدون نام"}</div>
          <div className="text-[11px] text-slate-500" dir="ltr">{data.phone}</div>
          <div className="text-[10px] text-slate-600 mt-1">عکس پروفایل: کلیک روی آیکون + برای آپلود</div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-4">
        <h3 className="font-black text-sm mb-4 text-primary-300">اطلاعات هویتی</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">نام</label>
            <input value={data.firstName} onChange={(e) => set("firstName", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">نام خانوادگی</label>
            <input value={data.lastName} onChange={(e) => set("lastName", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">کد ملی (۱۰ رقم)</label>
            <input value={data.nationalId} onChange={(e) => set("nationalId", e.target.value.replace(/[^\d۰-۹]/g, ""))}
              dir="ltr" maxLength={10}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">تاریخ تولد</label>
            <PersianDatePicker value={data.birthDate} onChange={(v) => set("birthDate", v)} placeholder="انتخاب تاریخ تولد" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">جنسیت</label>
            <select value={data.gender || ""} onChange={(e) => set("gender", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white cursor-pointer">
              <option value="">— انتخاب کنید —</option>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">تحصیلات</label>
            <select value={data.education || ""} onChange={(e) => set("education", e.target.value)}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white cursor-pointer">
              <option value="">— انتخاب کنید —</option>
              <option value="under-diploma">زیر دیپلم</option>
              <option value="diploma">دیپلم</option>
              <option value="associate">کاردانی</option>
              <option value="bachelor">کارشناسی</option>
              <option value="master">کارشناسی ارشد</option>
              <option value="phd">دکترا</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-4">
        <h3 className="font-black text-sm mb-4 text-primary-300">اطلاعات تماس</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">شماره موبایل</label>
            <input value={data.phone} disabled dir="ltr"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-slate-400 cursor-not-allowed" />
            <p className="text-[10px] text-slate-600 mt-1">برای تغییر شماره با پشتیبانی تماس بگیرید.</p>
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">ایمیل</label>
            <input value={data.email} onChange={(e) => set("email", e.target.value)}
              placeholder="you@example.com" dir="ltr"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          </div>
          <div className="md:col-span-2">
            <label className="text-[11px] font-bold text-slate-400 mb-1 block">آدرس کامل</label>
            <textarea value={data.address} onChange={(e) => set("address", e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-4">
        <h3 className="font-black text-sm mb-4 text-primary-300">درباره من</h3>
        <textarea value={data.bio} onChange={(e) => set("bio", e.target.value)} rows={3}
          placeholder="خلاصه‌ای درباره خود بنویسید..."
          className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
      </div>

      {/* Notifications */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-black text-sm text-primary-300 mb-1">اعلان‌ها</h3>
            <p className="text-[11px] text-slate-500">دریافت اعلان درباره دوره‌ها، پیام‌ها و به‌روزرسانی‌ها</p>
          </div>
          <button
            onClick={() => set("notificationsEnabled", !data.notificationsEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${data.notificationsEnabled ? "bg-emerald-500" : "bg-white/10"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${data.notificationsEnabled ? "left-0.5" : "left-[26px]"}`} />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={() => save()}
        disabled={saving}
        className="w-full py-3.5 rounded-[14px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2 mb-4"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        ذخیره تغییرات
      </button>

      {/* Password Change */}
      <div className="bg-white/5 border border-white/10 rounded-[16px] p-5">
        <button onClick={() => setShowPass(!showPass)} className="w-full flex items-center justify-between text-right">
          <div>
            <h3 className="font-black text-sm text-primary-300">تغییر رمز عبور</h3>
            <p className="text-[11px] text-slate-500">برای امنیت بیشتر، رمز عبور خود را عوض کنید</p>
          </div>
          <ChevronLeft className={`w-5 h-5 text-slate-400 transition-transform ${showPass ? "-rotate-90" : ""}`} />
        </button>
        {showPass && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
            <input type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
              placeholder="رمز فعلی" dir="ltr"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
            <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder="رمز جدید (حداقل ۶ کاراکتر)" dir="ltr"
              className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
            <button onClick={changePassword} disabled={saving || !passForm.currentPassword || !passForm.newPassword}
              className="w-full py-2.5 rounded-[10px] bg-amber-500 hover:bg-amber-600 text-white text-sm font-black disabled:opacity-50">
              تغییر رمز
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============ PORTFOLIO ============ */
function PortfolioTab({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", link: "" });

  const load = () => {
    if (!user?.id) { setLoading(false); return; }
    setLoading(true);
    fetch(`/api/student/portfolio?userId=${user.id}`).then((r) => r.json())
      .then((d) => { setItems(d || []); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [user?.id]);

  const add = async () => {
    if (!form.title.trim()) return;
    await fetch("/api/student/portfolio", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId: user.id }),
    });
    setForm({ title: "", description: "", imageUrl: "", link: "" });
    setShowForm(false);
    load();
  };

  const remove = async (id: number) => {
    if (!confirm("حذف این نمونه‌کار؟")) return;
    await fetch("/api/student/portfolio", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, userId: user.id }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">رزومه و نمونه‌کار</h2>
          <p className="text-slate-500 text-sm">نمونه‌کارهای خود را برای نمایش در پروفایل اضافه کنید.</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 rounded-[10px] bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black cursor-pointer flex items-center gap-1.5">
            <PlusCircle className="w-4 h-4" /> نمونه‌کار جدید
          </button>
        )}
      </div>
      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-[16px] p-4 mb-6 space-y-3">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان *"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="توضیح کوتاه"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white resize-none" />
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="لینک تصویر" dir="ltr"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="لینک نمونه‌کار (اختیاری)" dir="ltr"
            className="w-full px-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/10 text-sm text-white" />
          <div className="flex gap-2">
            <button onClick={add} className="flex-1 py-2.5 rounded-[10px] bg-primary-600 text-white text-xs font-black cursor-pointer">ذخیره</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-[10px] bg-white/10 text-white text-xs font-black cursor-pointer">لغو</button>
          </div>
        </div>
      )}
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /> :
        items.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
            <Briefcase className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">هنوز نمونه‌کاری اضافه نکرده‌اید.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-[16px] overflow-hidden">
                {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-32 object-cover" />}
                <div className="p-4">
                  <h4 className="font-black text-sm">{p.title}</h4>
                  {p.description && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-primary-300 text-[11px] font-black">مشاهده &larr;</a>}
                    <button onClick={() => remove(p.id)} className="text-error-400 text-[11px] font-black cursor-pointer">حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <main className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <Suspense fallback={<div className="pt-28 pb-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}>
        <StudentDashboardContent />
      </Suspense>
    </main>
  );
}
