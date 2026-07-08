"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Search, GraduationCap, User, ShieldCheck, LogOut, Lock } from "lucide-react";
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
    { href: "/fields", label: "رشته‌ها" },
    { href: "/institutes", label: "آموزشگاه‌ها" },
    { href: "/courses", label: "دوره‌ها" },
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-[14px] gradient-button flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 group-hover:scale-105 transition-all duration-300">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold gradient-text leading-tight">
                آموزشگاه‌های آزاد فنی و حرفه‌ای زبرخان
              </span>
              <span className="text-[10px] text-text-tertiary font-bold -mt-0.5">
                مرکز شماره ۱۲ • ثبت‌نام آنلاین دوره‌های مهارتی
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
              <div className="flex items-center gap-2.5 bg-surface p-1.5 pl-3 rounded-[18px] border border-border-default shadow-sm">
                <div className="w-8 h-8 rounded-[12px] bg-primary-100 flex items-center justify-center text-primary-700 font-black text-sm">
                  {user.name ? user.name.charAt(0) : "U"}
                </div>

                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-text-primary">
                    {user.name || "کاربر پلتفرم"}
                  </span>
                  <span className="text-[10px] text-text-tertiary" dir="ltr">
                    {user.phone || ""}
                  </span>
                </div>

                {isAdmin ? (
                  <Link
                    href="/admin"
                    className="mr-2 px-3 py-1.5 rounded-[10px] text-xs font-bold text-white bg-secondary-600 hover:bg-secondary-700 transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    مدیریت
                  </Link>
                ) : user.role === "institute" ? (
                  <Link
                    href="/panel"
                    className="mr-2 px-3 py-1.5 rounded-[10px] text-xs font-bold text-white bg-primary-700 hover:bg-primary-800 transition-all flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    پنل آموزشگاه
                  </Link>
                ) : (
                  <Link
                    href={`/dashboard?phone=${encodeURIComponent(user.phone || "")}`}
                    className="mr-2 px-3 py-1.5 rounded-[10px] text-xs font-bold text-white gradient-button hover:gradient-button-hover transition-all flex items-center gap-1"
                  >
                    <User className="w-3.5 h-3.5" />
                    پنل من
                  </Link>
                )}

                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 rounded-[10px] text-error-500 hover:bg-error-50 transition-colors cursor-pointer"
                  title="خروج از حساب کاربری"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <ThemeToggle compact />
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

          {/* Theme toggle for the compact area next to mobile menu button */}
          <div className="lg:hidden flex items-center gap-1">
            <ThemeToggle compact />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
