"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, User, ShieldCheck, LogOut, Lock } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "صفحه اصلی" },
    { href: "/courses", label: "دوره‌ها" },
    { href: "/shop", label: "فروشگاه" },
    { href: "/institutes", label: "آموزشگاه‌ها" },
    { href: "/ai/tools", label: "🤖 ابزارهای AI" },
    { href: "/for-institutes", label: "برای مدیران آموزشگاه" },
    { href: "/pricing", label: "پلن‌ها" },
  ];

  const user = session?.user as any;
  const isAdmin = user?.role === "admin" || user?.phone === "09159513179" || user?.phone === "09150000000";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
          : "glass"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand — compact single-line title on mobile */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0 flex-1 lg:flex-none shrink">
            <div className="relative w-11 h-11 lg:w-12 lg:h-12 rounded-[12px] overflow-hidden shrink-0 bg-[#071a33] border border-amber-400/35 shadow-[0_6px_22px_rgba(20,184,166,0.2)] group-hover:scale-105 transition-transform duration-300">
              <img
                src="/images/fanixo-logo.png"
                alt="لوگوی فَنی‌اکسو"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0 leading-none rounded-[10px] px-1.5 py-1 bg-white/[0.025] lg:bg-transparent">
              <span
                className="font-black text-text-primary whitespace-nowrap leading-tight tracking-[-0.045em] drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]"
                style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif", fontSize: "clamp(10px, 2.8vw, 16px)" }}
              >
                آموزشگاه‌های آزاد فنی و حرفه‌ای زبرخان
              </span>
              <span
                className="text-primary-400 font-extrabold whitespace-nowrap mt-1 tracking-wide"
                style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif", fontSize: "clamp(8px, 2.05vw, 11px)" }}
              >
                مرکز شماره ۱۲
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-primary-600 transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full bg-primary-500 group-hover:w-5 transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/search"
              className="p-2.5 rounded-xl text-text-tertiary hover:text-primary-600 hover:bg-primary-50 transition-all"
              title="جستجو"
            >
              <Search className="w-5 h-5" />
            </Link>

            {status === "authenticated" && user ? (
              <UserMenu user={user} isAdmin={isAdmin} />
            ) : status === "loading" ? (
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <div className="w-24 h-9 rounded-[12px] bg-white/5 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle compact />
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-[14px] text-xs font-bold text-white gradient-button hover:gradient-button-hover shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all flex items-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  ورود / ثبت‌نام
                </Link>
              </div>
            )}
          </div>

          {/* Mobile action buttons (right side) */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            {status === "authenticated" && user ? (
              <UserMenuMobile user={user} isAdmin={isAdmin} />
            ) : status === "unauthenticated" ? (
              <Link
                href="/login"
                className="px-3 py-2 rounded-xl bg-primary-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
              >
                <User className="w-3.5 h-3.5" /> ورود
              </Link>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-primary-50 transition-colors shrink-0"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden glass border-t border-white/20"
          >
            <div className="px-4 py-5 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-semibold text-text-secondary hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-border-default">
                <span className="text-xs font-bold text-text-secondary">حالت نمایش</span>
                <ThemeToggle compact />
              </div>

              {status === "authenticated" && user ? (
                <div className="pt-3 border-t border-border-default space-y-2">
                  <div className="px-4 py-2 bg-primary-50/50 rounded-[14px] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-text-primary">{user.name}</p>
                      <p className="text-[10px] text-text-tertiary" dir="ltr">{user.phone}</p>
                    </div>
                    {isAdmin ? (
                      <span className="text-[10px] font-black text-secondary-700 bg-secondary-100 px-2.5 py-1 rounded-full">
                        مدیر کل
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full">
                        هنرجو
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="text-center px-4 py-2.5 rounded-[12px] text-xs font-bold text-white bg-secondary-600"
                      >
                        پنل مدیریت
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard?phone=${encodeURIComponent(user.phone || "")}`}
                        onClick={() => setIsOpen(false)}
                        className="text-center px-4 py-2.5 rounded-[12px] text-xs font-bold text-white gradient-button"
                      >
                        پنل هنرجو
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="px-4 py-2.5 rounded-[12px] text-xs font-bold text-error-600 bg-error-50 hover:bg-error-100 transition-colors"
                    >
                      خروج از حساب
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pt-3 border-t border-border-default">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full text-center px-5 py-3 rounded-[14px] text-sm font-bold text-white gradient-button"
                  >
                    ورود / ثبت‌نام با موبایل
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ═════════ USER MENU (desktop) — Dropdown with panel + logout ═════════ */
function UserMenu({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const roleLabel = isAdmin ? "مدیر کل سامانه" : user.role === "institute" ? "مدیر آموزشگاه" : "هنرجو";
  const roleColor = isAdmin ? "from-purple-500 to-fuchsia-500" : user.role === "institute" ? "from-amber-500 to-orange-500" : "from-primary-500 to-secondary-500";
  const roleEmoji = isAdmin ? "👑" : user.role === "institute" ? "🏢" : "🎓";
  const panelHref = "/my";

  useEffect(() => {
    const close = (e: any) => {
      if (!e.target.closest?.("[data-user-menu]")) setOpen(false);
    };
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative flex items-center gap-2" data-user-menu>
      <ThemeToggle compact />
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 pl-3 rounded-[16px] bg-surface border border-border-default hover:border-primary-500/50 transition-all cursor-pointer"
      >
        <div className={`w-9 h-9 rounded-[12px] bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-black shadow-lg`}>
          {user.name ? user.name.charAt(0) : "U"}
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs font-black text-text-primary flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {user.name || "کاربر"}
          </div>
          <div className="text-[10px] text-text-tertiary">{roleEmoji} {roleLabel}</div>
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-[18px] bg-[var(--bg-glass-card)] border border-[var(--border-default)] shadow-2xl overflow-hidden z-[100] animate-fade-in-scale">
          <div className={`p-4 bg-gradient-to-br ${roleColor} text-white`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-black">
                {user.name ? user.name.charAt(0) : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-sm truncate">{user.name || "کاربر"}</div>
                <div className="text-[11px] opacity-90 truncate" dir="ltr">{user.phone || user.email || ""}</div>
                <div className="text-[10px] mt-0.5 opacity-80">{roleEmoji} {roleLabel}</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span className="opacity-90">در سامانه فعال هستید</span>
            </div>
          </div>

          <div className="p-2">
            <Link href={panelHref} onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-primary-500/10 text-text-primary transition group">
              <div className="w-9 h-9 rounded-[10px] bg-primary-500/15 text-primary-500 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-black">ورود به پنل من</div>
                <div className="text-[10px] text-text-tertiary">داشبورد، دوره‌ها، مدیریت</div>
              </div>
            </Link>

            <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-3 p-3 rounded-[12px] hover:bg-white/5 text-text-primary transition">
              <div className="w-9 h-9 rounded-[10px] bg-white/5 flex items-center justify-center">
                <span className="text-sm">🏠</span>
              </div>
              <div className="flex-1"><div className="text-xs font-black">صفحه اصلی</div></div>
            </Link>

            <button
              onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
              className="w-full flex items-center gap-3 p-3 rounded-[12px] hover:bg-error-500/10 text-error-500 transition mt-1"
            >
              <div className="w-9 h-9 rounded-[10px] bg-error-500/15 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-black">خروج از حساب</div>
                <div className="text-[10px] opacity-70">پایان جلسه</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═════════ USER MENU (mobile) — bottom-sheet style ═════════ */
function UserMenuMobile({ user, isAdmin }: { user: any; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const roleLabel = isAdmin ? "مدیر کل" : user.role === "institute" ? "مدیر آموزشگاه" : "هنرجو";
  const roleColor = isAdmin ? "from-purple-500 to-fuchsia-500" : user.role === "institute" ? "from-amber-500 to-orange-500" : "from-primary-500 to-secondary-500";
  const roleEmoji = isAdmin ? "👑" : user.role === "institute" ? "🏢" : "🎓";

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg`}
        title={user.name || "پنل من"}
      >
        {user.name ? user.name.charAt(0) : "U"}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--bg-canvas)]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center pt-20 sm:pt-0" onClick={() => setOpen(false)}>
          <div className="w-full sm:max-w-md max-h-[calc(100dvh-5rem)] overflow-y-auto bg-[var(--bg-glass-card)] border-b sm:border border-[var(--border-default)] rounded-b-[24px] sm:rounded-[24px] animate-fade-in-scale shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className={`p-5 bg-gradient-to-br ${roleColor} text-white relative`}>
              <button onClick={() => setOpen(false)} className="absolute left-3 top-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[16px] bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-black shrink-0">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-base truncate">{user.name || "کاربر"}</div>
                  <div className="text-[11px] opacity-90 truncate" dir="ltr">{user.phone || user.email || ""}</div>
                  <div className="text-[11px] mt-1 opacity-90">{roleEmoji} {roleLabel}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>در سامانه فعال هستید</span>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <Link href="/my" onClick={() => setOpen(false)} className="w-full flex items-center gap-3 p-3.5 rounded-[14px] bg-primary-500/10 hover:bg-primary-500/20 text-text-primary transition">
                <div className="w-10 h-10 rounded-[12px] bg-primary-500 text-white flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-black">ورود به پنل من</div>
                  <div className="text-[10px] text-text-tertiary">داشبورد کامل</div>
                </div>
              </Link>

              <Link href="/" onClick={() => setOpen(false)} className="w-full flex items-center gap-3 p-3.5 rounded-[14px] hover:bg-white/5 text-text-primary transition">
                <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center shrink-0"><span>🏠</span></div>
                <div className="flex-1 text-right"><div className="text-sm font-black">صفحه اصلی</div></div>
              </Link>

              <Link href="/shop" onClick={() => setOpen(false)} className="w-full flex items-center gap-3 p-3.5 rounded-[14px] hover:bg-white/5 text-text-primary transition">
                <div className="w-10 h-10 rounded-[12px] bg-white/5 flex items-center justify-center shrink-0"><span>🎬</span></div>
                <div className="flex-1 text-right"><div className="text-sm font-black">فروشگاه دوره‌ها</div></div>
              </Link>

              <button
                onClick={() => { setOpen(false); signOut({ callbackUrl: "/" }); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-[14px] hover:bg-error-500/10 text-error-500 transition mt-2 border-t border-[var(--border-default)] pt-4"
              >
                <div className="w-10 h-10 rounded-[12px] bg-error-500/15 flex items-center justify-center shrink-0">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-black">خروج از حساب</div>
                  <div className="text-[10px] opacity-70">پایان جلسه شما</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
