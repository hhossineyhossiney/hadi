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
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useMobilePanelDrawer } from "@/components/panel/useMobilePanelDrawer";
import { normalizePhone } from "@/lib/phone";

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

type TabKey = "dashboard" | "courses" | "progress" | "schedule" | "chat" | "notifications" | "certificates" | "wallet" | "favorites" | "portfolio";

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
          <div onClick={() => setDrawerOpen(false)} className="lg:hidden fixed top-20 left-0 right-0 bottom-0 z-30 bg-black/70" />
        )}

        <aside className={`shrink-0 bg-[#0B1120] lg:border-l lg:border-white/5 lg:w-72 lg:static lg:translate-x-0
          fixed top-[80px] right-0 bottom-0 z-40 w-[85%] max-w-[320px] overflow-y-auto transition-transform duration-300 ease-out
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
  return (
    <div>
      <h2 className="text-xl font-black mb-6">دوره‌های من ({regs.length})</h2>
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
  return (
    <div>
      <h2 className="text-xl font-black mb-6">وضعیت پیشرفت</h2>
      {approved.length === 0 ? (
        <p className="text-slate-500 bg-white/5 border border-white/10 rounded-[16px] p-8 text-center">دوره فعالی ندارید.</p>
      ) : (
        <div className="space-y-4">
          {approved.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-[16px] p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-black text-white">{r.courseTitle}</h3>
                  <div className="text-[11px] text-slate-500">{r.instituteName}</div>
                </div>
                <div className="text-2xl font-black text-primary-300">{r.progress || 0}%</div>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden mb-3">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-primary-500 to-fuchsia-500" style={{ width: `${r.progress || 0}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white/5 rounded-[10px] py-2">
                  <div className="text-sm font-black text-emerald-400">{r.sessionsAttended || 0}</div>
                  <div className="text-[9px] text-slate-500">جلسه شرکت‌کرده</div>
                </div>
                <div className="bg-white/5 rounded-[10px] py-2">
                  <div className="text-sm font-black text-sky-400">{r.totalSessions || "—"}</div>
                  <div className="text-[9px] text-slate-500">کل جلسات</div>
                </div>
                <div className="bg-white/5 rounded-[10px] py-2">
                  <div className="text-sm font-black text-amber-400">{r.duration || "—"}</div>
                  <div className="text-[9px] text-slate-500">مدت دوره</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ SCHEDULE TAB ============ */
function ScheduleTab({ sessions, regs }: { sessions: any[]; regs: StudentReg[] }) {
  return (
    <div>
      <h2 className="text-xl font-black mb-6">تقویم آموزشی</h2>
      {sessions.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-[16px] p-8 text-center">
          <CalendarDays className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm mb-2">جلسه‌ای برنامه‌ریزی نشده است.</p>
          <p className="text-slate-600 text-[11px]">مدیر آموزشگاه می‌تواند جلسات را از پنل خود ثبت کند.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-[16px] p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-[12px] bg-primary-500/20 border border-primary-500/30 flex flex-col items-center justify-center shrink-0">
                <div className="text-[9px] text-primary-300 font-black">جلسه</div>
                <div className="text-sm font-black">{s.sessionNumber || i + 1}</div>
              </div>
              <div className="flex-1">
                <h4 className="font-black">{s.title || s.courseTitle}</h4>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{s.sessionDate || "—"}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.sessionTime || "—"}</span>
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{s.instituteName || "—"}</span>
                </div>
              </div>
              {s.meetingUrl && (
                <a href={s.meetingUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-[10px] bg-primary-600 text-white text-xs font-black cursor-pointer">ورود به کلاس</a>
              )}
            </div>
          ))}
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

/* ============ NOTIFICATIONS TAB ============ */
function NotificationsTab({ user }: { user: any }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetch(`/api/notifications?userId=${user.id}`)
      .then((r) => r.json()).then((d) => { setItems(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);
  return (
    <div>
      <h2 className="text-xl font-black mb-6">اعلان‌ها</h2>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /> :
        items.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
            <Bell className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-500 text-sm">اعلانی وجود ندارد.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} className={`bg-white/5 border rounded-[12px] p-4 ${n.isRead ? "border-white/10" : "border-primary-500/40 bg-primary-500/5"}`}>
                <h4 className="font-black text-sm">{n.title}</h4>
                {n.body && <p className="text-[12px] text-slate-400 mt-1">{n.body}</p>}
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

/* ============ WALLET ============ */
function WalletTab({ user, balance }: { user: any; balance: number }) {
  return (
    <div>
      <h2 className="text-xl font-black mb-6">کیف پول و مالی</h2>
      <div className="bg-gradient-to-br from-primary-600 to-purple-600 rounded-[24px] p-8 text-white mb-6">
        <div className="text-xs opacity-70 mb-2">موجودی کیف پول</div>
        <div className="text-4xl font-black" dir="ltr">{Number(balance || 0).toLocaleString("fa-IR")} <span className="text-lg">تومان</span></div>
      </div>
      <div className="text-center py-10 bg-white/5 border border-white/10 rounded-[16px]">
        <Wallet className="w-12 h-12 mx-auto text-slate-600 mb-3" />
        <p className="text-slate-500 text-sm">تراکنشی ثبت نشده است.</p>
      </div>
    </div>
  );
}

/* ============ FAVORITES ============ */
function FavoritesTab({ regs }: { regs: StudentReg[] }) {
  const favs = regs.filter((r) => r.isFavorite);
  return (
    <div>
      <h2 className="text-xl font-black mb-6">علاقه‌مندی‌ها</h2>
      {favs.length === 0 ? (
        <div className="text-center py-16 bg-white/5 border border-white/10 rounded-[16px]">
          <Heart className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">هنوز دوره‌ای به علاقه‌مندی‌ها اضافه نکرده‌اید.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favs.map((r) => (
            <div key={r.id} className="bg-white/5 border border-white/10 rounded-[16px] p-4 flex items-center gap-3">
              <Heart className="w-5 h-5 text-error-400 fill-error-400" />
              <div>
                <h4 className="font-black text-sm">{r.courseTitle}</h4>
                <div className="text-[11px] text-slate-500">{r.instituteName}</div>
              </div>
            </div>
          ))}
        </div>
      )}
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
