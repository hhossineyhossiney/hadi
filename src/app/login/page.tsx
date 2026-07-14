"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Eye, EyeOff, Loader2, Phone, Lock, GraduationCap, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { normalizePhone } from "@/lib/phone";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

type Role = "student" | "manager";

function LoginPageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const [step, setStep] = useState<"role" | "credentials">("role");
  const [role, setRole] = useState<Role>("student");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callback = search.get("callbackUrl") || "/my";

  const selectRole = (r: Role) => { setRole(r); setStep("credentials"); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const cleanPhone = normalizePhone(phone);
    if (!/^09\d{9}$/.test(cleanPhone)) {
      setError("لطفاً شماره موبایل معتبر وارد کنید (مثال: 09123456789)");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("رمز عبور را وارد کنید");
      setLoading(false);
      return;
    }
    const res = await signIn("credentials", {
      phone: cleanPhone, password,
      redirect: false,
      callbackUrl: callback,
    });
    if (res?.error) {
      setError("شماره موبایل یا رمز عبور اشتباه است");
      setLoading(false);
      return;
    }
    // Successful login → route intelligently via /my
    router.push(callback);
    router.refresh();
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 min-h-screen bg-gradient-to-br from-[#04152A] via-[#0B4F8B]/40 to-[#04152A] relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-md mx-auto px-4 py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#082D53]/85 backdrop-blur-xl rounded-[24px] border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-b from-primary-600/20 to-transparent text-center border-b border-white/5">
              <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary-500/40">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-xl font-black text-white mb-1">ورود به سامانه زبرخان</h1>
              <p className="text-[11px] text-slate-300">
                {step === "role" ? "نوع حساب کاربری خود را انتخاب کنید" : role === "student" ? "ورود به حساب هنرجو" : "ورود به حساب مدیر آموزشگاه"}
              </p>
            </div>

            {step === "role" && (
              <div className="p-6 space-y-3">
                <button
                  onClick={() => selectRole("student")}
                  className="w-full p-5 rounded-[16px] bg-gradient-to-br from-primary-500/20 to-primary-500/5 border-2 border-primary-500/40 hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/30 transition-all group text-right"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[14px] bg-primary-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-black text-white mb-1">🎓 هنرجو</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">ورود به پنل هنرجو — مشاهده دوره‌ها، نمرات، پرداخت‌ها و پیام‌ها</div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-primary-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => selectRole("manager")}
                  className="w-full p-5 rounded-[16px] bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-2 border-amber-500/40 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/30 transition-all group text-right"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[14px] bg-amber-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Building2 className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-black text-white mb-1">🏢 مدیر آموزشگاه</div>
                      <div className="text-[11px] text-slate-300 leading-relaxed">ورود به پنل مدیریت آموزشگاه — دوره‌ها، هنرجویان، نمرات و گزارش‌ها</div>
                    </div>
                    <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </button>

                <div className="pt-4 border-t border-white/5 text-center">
                  <p className="text-[11px] text-slate-400 mb-2">حساب ندارید؟</p>
                  <Link href="/register" className="inline-flex items-center gap-1 text-primary-300 text-sm font-black hover:text-primary-200">
                    <Sparkles className="w-4 h-4" /> ثبت‌نام رایگان
                  </Link>
                </div>
              </div>
            )}

            {step === "credentials" && (
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className={`flex items-center gap-3 p-3 rounded-[12px] ${role === "student" ? "bg-primary-500/15 border border-primary-500/30" : "bg-amber-500/15 border border-amber-500/30"}`}>
                  <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${role === "student" ? "bg-primary-500" : "bg-amber-500"}`}>
                    {role === "student" ? <GraduationCap className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-black text-white">
                      {role === "student" ? "ورود به عنوان هنرجو" : "ورود به عنوان مدیر آموزشگاه"}
                    </div>
                    <button type="button" onClick={() => setStep("role")} className="text-[10px] text-primary-300 hover:underline">
                      تغییر نقش
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-[10px] bg-error-500/15 text-error-400 text-xs font-bold"
                  >
                    ⚠ {error}
                  </motion.div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1.5">شماره موبایل</label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09123456789"
                      dir="ltr"
                      autoFocus
                      autoComplete="tel"
                      maxLength={11}
                      className="w-full px-4 py-3.5 pr-11 rounded-[14px] bg-white/95 text-slate-900 text-sm font-black outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Phone className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 block mb-1.5">رمز عبور</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      dir="ltr"
                      autoComplete="current-password"
                      className="w-full px-4 py-3.5 pr-11 pl-11 rounded-[14px] bg-white/95 text-slate-900 text-sm font-black outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Lock className="w-5 h-5 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-[14px] text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                    role === "student"
                      ? "gradient-button hover:gradient-button-hover shadow-primary-500/30"
                      : "bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30"
                  } disabled:opacity-60`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (role === "student" ? <GraduationCap className="w-5 h-5" /> : <Building2 className="w-5 h-5" />)}
                  {loading ? "در حال ورود..." : "ورود به پنل"}
                </button>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <button type="button" onClick={() => setStep("role")} className="text-slate-400 hover:text-white flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> بازگشت
                  </button>
                  <Link href="/register" className="text-primary-300 hover:text-primary-200 font-black">
                    حساب ندارید؟ ثبت‌نام →
                  </Link>
                </div>
              </form>
            )}
          </motion.div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-slate-400 text-xs hover:text-white flex items-center justify-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" /> بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
