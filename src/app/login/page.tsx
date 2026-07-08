"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Eye, EyeOff, Loader2, Phone, Lock, ShieldCheck, User } from "lucide-react";
import { normalizePhone } from "@/lib/phone";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanPhone = normalizePhone(phone);

    if (!cleanPhone) {
      setError("لطفاً شماره موبایل معتبر وارد کنید");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone: cleanPhone,
        password,
      });

      if (res?.ok && !res?.error) {
        if (cleanPhone === "09159513179" || cleanPhone === "09150000000") {
          window.location.href = "/admin";
        } else {
          window.location.href = `/dashboard?phone=${encodeURIComponent(cleanPhone)}`;
        }
      } else {
        setError("شماره موبایل یا رمز عبور اشتباه است");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setPhone("09159513179");
    setPassword("123456");
  };

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-600 mb-6 transition-colors font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به صفحه اصلی
          </Link>

          <div className="bg-surface rounded-[28px] border border-border-default overflow-hidden shadow-xl shadow-black/5">
            <div className="p-8 border-b border-border-default">
              <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-2 block">
                AUTHENTICATION
              </span>
              <h1 className="text-2xl font-black text-text-primary mb-2">
                ورود به حساب کاربری
              </h1>
              <p className="text-text-secondary text-sm">
                با شماره همراه و رمز عبور وارد شوید
              </p>
            </div>

            {/* Info Banner */}
            <div className="p-5 bg-primary-50/50 border-b border-border-light">
              <p className="text-xs text-text-secondary leading-relaxed">
                💡 هنرجوی گرامی: با همان <b>شماره موبایل و رمز عبوری</b> که هنگام ثبت‌نام دوره انتخاب کردید وارد شوید.
              </p>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="mt-3 w-full p-2.5 rounded-[12px] bg-white border border-primary-200 text-primary-700 text-xs font-bold hover:bg-primary-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                ورود مدیر پلتفرم
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="p-4 rounded-[14px] bg-error-50 text-error-600 text-sm font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-[16px] border border-border-default bg-bg-secondary text-text-primary outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-100 transition-all font-semibold"
                    placeholder="۰۹۱۵۹۵۱۳۱۷۹"
                    dir="ltr"
                  />
                  <Phone className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 pr-11 rounded-[16px] border border-border-default bg-bg-secondary text-text-primary outline-none focus:border-primary-400 focus:ring-[3px] focus:ring-primary-100 transition-all font-semibold"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <Lock className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[16px] text-lg font-black text-white gradient-button hover:gradient-button-hover shadow-xl shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    در حال ورود...
                  </>
                ) : (
                  "ورود به سیستم"
                )}
              </button>

              <div className="text-center pt-2 border-t border-border-light text-sm text-text-secondary">
                هنوز در دوره‌ای ثبت‌نام نکرده‌اید؟{" "}
                <Link href="/register" className="font-bold text-primary-600 hover:underline">
                  ثبت‌نام آنلاین
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
