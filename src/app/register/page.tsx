"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft, ArrowRight, CheckCircle, Loader2, Phone, Lock, User,
  BookOpen, Building2, Check, ShieldCheck, MessageSquare, RefreshCw,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { normalizePhone } from "@/lib/phone";

interface CourseOpt {
  id: number; slug: string; title: string; instituteName: string;
  price: string | null; duration?: string | null;
  capacity?: number; enrolledCount?: number;
  registrationClosed?: boolean; registrationEnded?: boolean;
}

const STEPS_GUEST = [
  { n: 1, title: "انتخاب دوره" },
  { n: 2, title: "اطلاعات و رمز" },
  { n: 3, title: "تأیید پیامکی" },
  { n: 4, title: "ثبت نهایی" },
];

const STEPS_LOGGED = [
  { n: 1, title: "انتخاب دوره" },
  { n: 2, title: "ثبت نهایی" },
];

function RegistrationWizard() {
  const { data: session, status: sessionStatus } = useSession();
  const sessionUser = session?.user as any;
  const isLoggedIn = sessionStatus === "authenticated" && !!sessionUser?.id;

  const searchParams = useSearchParams();
  const preselectedCourse = searchParams.get("course");

  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<CourseOpt[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [instituteFilter, setInstituteFilter] = useState("");
  const [form, setForm] = useState({
    fullName: "", phone: "", password: "", passwordConfirm: "",
    courseSlug: preselectedCourse || "", notes: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Courses that this user has already registered for
  const [alreadyRegistered, setAlreadyRegistered] = useState<Array<{ courseId: number; courseSlug: string; courseTitle: string; status: string }>>([]);
  const [checkingReg, setCheckingReg] = useState(false);

  // Fetch user's existing registrations (to prevent duplicates)
  useEffect(() => {
    if (!isLoggedIn) return;
    setCheckingReg(true);
    fetch("/api/student/registrations")
      .then((r) => r.json())
      .then((d) => setAlreadyRegistered(d.registered || []))
      .catch(() => setAlreadyRegistered([]))
      .finally(() => setCheckingReg(false));
  }, [isLoggedIn]);

  // Prefill from session if logged in
  useEffect(() => {
    if (isLoggedIn && sessionUser) {
      setForm((prev) => ({
        ...prev,
        fullName: sessionUser.name || "",
        phone: sessionUser.phone || "",
      }));
    }
  }, [isLoggedIn, sessionUser]);

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => {
        setCourses(data.map((c: any) => ({
          id: c.id, slug: c.slug, title: c.title,
          instituteName: c.instituteName, price: c.price, duration: c.duration,
          capacity: c.capacity, enrolledCount: c.enrolledCount,
          registrationClosed: c.registrationClosed, registrationEnded: c.registrationEnded,
        })));
        setLoadingCourses(false);
      })
      .catch(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setInterval(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [otpTimer]);

  const institutes = Array.from(new Set(courses.map((c) => c.instituteName))).filter(Boolean);

  // If a specific course is preselected (user came from course page),
  // show ONLY that course in the list to avoid confusion.
  const filteredCourses = preselectedCourse
    ? courses.filter((c) => c.slug === preselectedCourse)
    : instituteFilter
      ? courses.filter((c) => c.instituteName === instituteFilter)
      : courses;

  const selectedCourse = courses.find((c) => c.slug === form.courseSlug);

  // Check if the currently selected course is already registered
  const duplicateReg = form.courseSlug
    ? alreadyRegistered.find((r) => r.courseSlug === form.courseSlug)
    : null;

  const cleanPhone = normalizePhone(form.phone);
  const phoneValid = /^09\d{9}$/.test(cleanPhone);
  const passValid = form.password.length >= 6;
  const passMatch = form.password === form.passwordConfirm && form.passwordConfirm.length > 0;

  const canNext1 = !!form.courseSlug && !duplicateReg;
  const canNext2 = form.fullName.trim().length >= 3 && phoneValid && passValid && passMatch;

  // Course availability check
  const getCourseBlockReason = (c?: CourseOpt): string | null => {
    if (!c) return null;
    if (c.registrationClosed) return "ثبت‌نام متوقف شده";
    if (c.registrationEnded) return "زمان ثبت‌نام تمام شده";
    if (typeof c.capacity === "number" && c.capacity > 0 && (c.enrolledCount || 0) >= c.capacity) {
      return "تکمیل ظرفیت";
    }
    return null;
  };
  const selectedBlockReason = getCourseBlockReason(selectedCourse);
  const isCourseFull = !!selectedBlockReason;

  const sendOtp = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: cleanPhone }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setOtpSent(true); setOtpTimer(120);
        if (data.devCode) setDevCode(data.devCode);
      } else {
        setError(data.error || "خطا در ارسال کد");
      }
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: cleanPhone, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setOtpVerified(true); setStep(isLoggedIn ? 2 : 4);
      } else {
        setError(data.error || "کد نادرست است");
      }
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      const courseRes = await fetch(`/api/courses/${form.courseSlug}`);
      const courseData = await courseRes.json();
      if (!courseRes.ok || !courseData?.id) {
        setError("خطا در دریافت اطلاعات دوره"); setLoading(false); return;
      }
      const payload = isLoggedIn
        ? { courseId: courseData.id, notes: form.notes } // session-based; server pulls user data
        : {
            courseId: courseData.id, fullName: form.fullName, phone: cleanPhone,
            password: form.password, notes: form.notes,
          };
      const res = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) setSuccess(true);
      else {
        const d = await res.json();
        if (d.requiresLogin) {
          setError("این شماره قبلاً ثبت‌شده. لطفاً وارد حساب کاربری خود شوید.");
        } else if (d.duplicate) {
          setError("شما قبلاً در این دوره ثبت‌نام کرده‌اید. به پنل هنرجو مراجعه کنید.");
        } else {
          setError(d.error || "خطا در ثبت‌نام");
        }
      }
    } catch { setError("خطا در ارتباط با سرور"); }
    finally { setLoading(false); }
  };

  const STEPS = isLoggedIn ? STEPS_LOGGED : STEPS_GUEST;

  if (success) {
    return (
      <div className="pt-28 pb-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-[24px] p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-600" />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-3">ثبت‌نام با موفقیت انجام شد! 🎉</h2>
            <p className="text-text-secondary text-sm mb-2">
              دوره <b className="text-text-primary">{selectedCourse?.title}</b> برای شما رزرو شد.
            </p>
            <p className="text-text-tertiary text-xs mb-8">
              {isLoggedIn
                ? "درخواست شما در انتظار تأیید مدیر آموزشگاه است. می‌توانید در پنل هنرجو وضعیت را پیگیری کنید."
                : (
                  <>شماره <span dir="ltr" className="font-bold text-text-primary">{cleanPhone}</span> تأیید پیامکی شد و حساب شما فعال است.</>
                )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={isLoggedIn ? "/dashboard" : `/dashboard?phone=${encodeURIComponent(cleanPhone)}`}
                className="px-8 py-3.5 rounded-[14px] text-white gradient-button font-bold text-sm shadow-lg shadow-primary-600/25">
                {isLoggedIn ? "بازگشت به داشبورد" : "ورود به پنل هنرجو"}
              </Link>
              <Link href="/courses" className="px-8 py-3.5 rounded-[14px] text-text-primary bg-surface border border-border-default font-bold text-sm">
                ثبت‌نام دوره دیگر
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-600 mb-6 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> بازگشت به صفحه اصلی
        </Link>

        {/* Logged-in banner */}
        {isLoggedIn && (
          <div className="mb-5 p-4 rounded-[16px] bg-gradient-to-l from-emerald-500/15 to-emerald-500/5 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black text-emerald-300">
                خوش آمدید {sessionUser?.name || ""}
              </div>
              <div className="text-[11px] text-emerald-200 mt-0.5">
                شما وارد حساب کاربری خود شده‌اید — نیازی به دریافت مجدد کد پیامکی نیست.
              </div>
            </div>
          </div>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-1">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ${
                  step > s.n ? "bg-success-500 text-white"
                  : step === s.n ? "gradient-button text-white shadow-lg shadow-primary-600/30 scale-110"
                  : "bg-surface text-text-tertiary border border-border-default"
                }`}>
                  {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap ${step >= s.n ? "text-text-primary" : "text-text-tertiary"}`}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1.5 mb-5 rounded-full transition-all duration-500 ${step > s.n ? "bg-success-500" : "bg-border-default"}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="glass-card rounded-[24px] overflow-hidden">
          {error && <div className="m-6 mb-0 p-4 rounded-[14px] bg-error-50 text-error-600 text-sm font-bold">{error}</div>}

          {/* STEP 1 — Course selection (always) */}
          {step === 1 && (
            <div className="p-7">
              <h2 className="text-xl font-black text-text-primary mb-1">انتخاب آموزشگاه و دوره</h2>
              <p className="text-text-tertiary text-xs mb-6">دوره مورد نظر خود را انتخاب نمایید</p>
              <select value={instituteFilter} onChange={(e) => setInstituteFilter(e.target.value)}
                className="w-full px-4 py-3 mb-4 rounded-[14px] border border-border-default bg-white/70 text-sm font-semibold cursor-pointer">
                <option value="">همه آموزشگاه‌ها</option>
                {institutes.map((inst) => <option key={inst} value={inst}>{inst}</option>)}
              </select>
              {loadingCourses ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {filteredCourses.map((c) => {
                    const blockReason = getCourseBlockReason(c);
                    const alreadyReg = alreadyRegistered.find((r) => r.courseSlug === c.slug);
                    const cFull = !!blockReason;
                    const disabled = cFull || !!alreadyReg;
                    return (
                      <button key={c.slug} type="button" onClick={() => !disabled && setForm({ ...form, courseSlug: c.slug })} disabled={disabled}
                        className={`w-full text-right p-4 rounded-[14px] border transition-all ${
                          disabled
                            ? "opacity-60 cursor-not-allowed border-border-default bg-white/40"
                            : form.courseSlug === c.slug
                              ? "border-primary-500 bg-primary-50/80 shadow-md shadow-primary-500/10 cursor-pointer"
                              : "border-border-default bg-white/60 hover:border-primary-200 cursor-pointer"
                        }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-black text-text-primary flex items-center gap-2 flex-wrap">
                              {c.title}
                              {blockReason && <span className="text-[9px] font-black bg-error-500/20 text-error-600 px-2 py-0.5 rounded-full">{blockReason}</span>}
                              {alreadyReg && (
                                <span className="text-[9px] font-black bg-primary-500/20 text-primary-700 px-2 py-0.5 rounded-full">
                                  ✓ قبلاً ثبت‌نام شده
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-text-tertiary mt-0.5">{c.instituteName}</div>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-black text-primary-600">
                              {c.price ? Number(c.price).toLocaleString("fa-IR") + " ت" : "رایگان"}
                            </span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              form.courseSlug === c.slug ? "border-primary-500 bg-primary-500" : "border-border-strong"}`}>
                              {form.courseSlug === c.slug && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {duplicateReg && (
                <div className="mt-4 p-4 rounded-[12px] bg-primary-500/10 border-2 border-primary-500/40 text-primary-700 text-xs font-bold flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-black mb-1">شما قبلاً در دوره «{duplicateReg.courseTitle}» ثبت‌نام کرده‌اید</div>
                    <div className="font-normal opacity-80">
                      وضعیت فعلی: {duplicateReg.status === "approved" ? "تأیید شده ✅" : duplicateReg.status === "rejected" ? "رد شده ❌" : "در انتظار تأیید ⏳"}
                      <br />می‌توانید به پنل هنرجو مراجعه کنید یا دوره دیگری انتخاب کنید.
                    </div>
                    <Link href="/dashboard" className="inline-block mt-2 px-3 py-1.5 rounded-[8px] bg-primary-600 text-white text-[11px] font-black">
                      مشاهده در پنل هنرجو
                    </Link>
                  </div>
                </div>
              )}
              {isCourseFull && !duplicateReg && (
                <div className="mt-4 p-3 rounded-[12px] bg-error-500/10 text-error-600 text-xs font-bold">
                  ⚠️ این دوره در حال حاضر قابل ثبت‌نام نیست ({selectedBlockReason}).
                </div>
              )}
              <button disabled={!canNext1 || isCourseFull} onClick={() => setStep(2)}
                className="mt-6 w-full py-3.5 rounded-[14px] text-sm font-black text-white gradient-button disabled:opacity-40 shadow-lg shadow-primary-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer">
                ادامه <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= LOGGED-IN FLOW: STEP 2 = FINAL CONFIRM ================= */}
          {isLoggedIn && step === 2 && (
            <div className="p-7">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-text-primary">تأیید نهایی ثبت‌نام</h2>
                <span className="text-[10px] font-black text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> کاربر تأیید شده
                </span>
              </div>
              <p className="text-text-tertiary text-xs mb-6">بدون نیاز به تأیید پیامکی — فقط اطلاعات را بررسی و ثبت نهایی کنید</p>
              <div className="rounded-[16px] bg-white/70 border border-border-light p-5 space-y-3.5 text-sm mb-6">
                <div className="flex justify-between"><span className="text-text-tertiary">دوره:</span><b>{selectedCourse?.title}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">آموزشگاه:</span><b>{selectedCourse?.instituteName}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">شهریه:</span><b className="text-primary-600">{selectedCourse?.price ? Number(selectedCourse.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}</b></div>
                <div className="border-t border-border-light pt-3.5 flex justify-between"><span className="text-text-tertiary">هنرجو:</span><b>{sessionUser?.name}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">موبایل:</span><b dir="ltr">{sessionUser?.phone}</b></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">توضیحات (اختیاری)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-[14px] border border-border-default bg-white/70 text-sm resize-none mb-4" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-[14px] text-sm font-bold text-text-secondary bg-white/60 border border-border-default flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-4 h-4" /> قبلی
                </button>
                <button disabled={loading} onClick={handleSubmit}
                  className="flex-1 py-3.5 rounded-[14px] text-sm font-black text-white bg-success-600 hover:bg-success-700 disabled:opacity-50 shadow-lg shadow-success-500/25 flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</> : <><CheckCircle className="w-4 h-4" /> تأیید و ثبت‌نام قطعی</>}
                </button>
              </div>
            </div>
          )}

          {/* ================= GUEST FLOW: STEP 2 - Info + password ================= */}
          {!isLoggedIn && step === 2 && (
            <div className="p-7 space-y-4">
              <div>
                <h2 className="text-xl font-black text-text-primary mb-1">اطلاعات هنرجو و رمز عبور</h2>
                <p className="text-text-tertiary text-xs">شماره موبایل واقعی وارد کنید — کد تأیید پیامکی ارسال می‌شود</p>
                <div className="mt-2 text-[11px]">
                  <Link href="/login" className="text-primary-600 font-bold hover:underline">
                    قبلاً ثبت‌نام کرده‌اید؟ وارد حساب کاربری خود شوید
                  </Link>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">نام و نام خانوادگی *</label>
                <div className="relative">
                  <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full px-4 py-3.5 pr-11 rounded-[14px] border border-border-default bg-white/70 text-sm font-semibold" placeholder="مثلاً: علی رضایی" />
                  <User className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">شماره موبایل (دقیقاً ۱۱ رقم) *</label>
                <div className="relative">
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full px-4 py-3.5 pr-11 rounded-[14px] border bg-white/70 text-sm font-semibold ${
                      form.phone && !phoneValid ? "border-error-500" : "border-border-default"}`}
                    placeholder="09123456789" dir="ltr" maxLength={11} />
                  <Phone className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  {phoneValid && <CheckCircle className="w-5 h-5 text-success-500 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {form.phone && !phoneValid && (
                  <p className="text-[10px] text-error-500 font-bold mt-1">شماره باید ۱۱ رقم و با ۰۹ شروع شود</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">رمز عبور (حداقل ۶ کاراکتر) *</label>
                <div className="relative">
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`w-full px-4 py-3.5 pr-11 rounded-[14px] border bg-white/70 text-sm font-semibold ${
                      form.password && !passValid ? "border-error-500" : "border-border-default"}`}
                    placeholder="••••••" dir="ltr" />
                  <Lock className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">تکرار رمز عبور *</label>
                <div className="relative">
                  <input type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                    className={`w-full px-4 py-3.5 pr-11 rounded-[14px] border bg-white/70 text-sm font-semibold ${
                      form.passwordConfirm && !passMatch ? "border-error-500" : passMatch ? "border-success-500" : "border-border-default"}`}
                    placeholder="••••••" dir="ltr" />
                  <ShieldCheck className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  {passMatch && <CheckCircle className="w-5 h-5 text-success-500 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {form.passwordConfirm && !passMatch && (
                  <p className="text-[10px] text-error-500 font-bold mt-1">رمزهای عبور یکسان نیستند</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">توضیحات (اختیاری)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-[14px] border border-border-default bg-white/70 text-sm resize-none" />
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-[14px] text-sm font-bold text-text-secondary bg-white/60 border border-border-default flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-4 h-4" /> قبلی
                </button>
                <button disabled={!canNext2 || loading}
                  onClick={async () => { setStep(3); await sendOtp(); }}
                  className="flex-1 py-3.5 rounded-[14px] text-sm font-black text-white gradient-button disabled:opacity-40 shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 cursor-pointer">
                  <MessageSquare className="w-4 h-4" /> ارسال کد تأیید پیامکی
                </button>
              </div>
            </div>
          )}

          {/* GUEST STEP 3: OTP */}
          {!isLoggedIn && step === 3 && (
            <div className="p-7 text-center">
              <div className="w-16 h-16 rounded-[18px] bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-black text-text-primary mb-1">تأیید شماره موبایل</h2>
              <p className="text-text-tertiary text-xs mb-1">
                کد ۵ رقمی به شماره <span dir="ltr" className="font-black text-text-primary">{cleanPhone}</span> ارسال شد
              </p>
              {devCode && (
                <div className="inline-block mt-2 mb-1 px-4 py-2 rounded-[12px] bg-accent-50 border border-accent-200 text-accent-600 text-xs font-black">
                  ⚠️ حالت آزمایشی — کد شما: <span className="text-lg tracking-[0.3em]" dir="ltr">{devCode}</span>
                </div>
              )}
              <div className="max-w-[220px] mx-auto my-5">
                <input type="tel" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                  className="w-full text-center text-2xl font-black tracking-[0.5em] px-4 py-4 rounded-[16px] border-2 border-primary-200 bg-white/80"
                  placeholder="─────" dir="ltr" maxLength={5} autoFocus />
              </div>
              <div className="flex items-center justify-center gap-4 mb-6 text-xs">
                {otpTimer > 0 ? (
                  <span className="text-text-tertiary font-bold">ارسال مجدد تا {otpTimer} ثانیه دیگر</span>
                ) : (
                  <button onClick={sendOtp} disabled={loading}
                    className="flex items-center gap-1.5 text-primary-600 font-black cursor-pointer hover:underline">
                    <RefreshCw className="w-3.5 h-3.5" /> ارسال مجدد کد
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setStep(2); setOtpSent(false); setDevCode(""); }}
                  className="px-5 py-3.5 rounded-[14px] text-sm font-bold text-text-secondary bg-white/60 border border-border-default flex items-center gap-1.5 cursor-pointer">
                  <ArrowRight className="w-4 h-4" /> ویرایش شماره
                </button>
                <button disabled={otpCode.length !== 5 || loading} onClick={verifyOtp}
                  className="flex-1 py-3.5 rounded-[14px] text-sm font-black text-white gradient-button disabled:opacity-40 shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  تأیید کد
                </button>
              </div>
            </div>
          )}

          {/* GUEST STEP 4: Final confirm */}
          {!isLoggedIn && step === 4 && (
            <div className="p-7">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-text-primary">تأیید نهایی</h2>
                <span className="text-[10px] font-black text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> موبایل تأیید شد
                </span>
              </div>
              <p className="text-text-tertiary text-xs mb-6">اطلاعات را بررسی و ثبت‌نام را قطعی کنید</p>
              <div className="rounded-[16px] bg-white/70 border border-border-light p-5 space-y-3.5 text-sm mb-6">
                <div className="flex justify-between"><span className="text-text-tertiary">دوره:</span><b>{selectedCourse?.title}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">آموزشگاه:</span><b>{selectedCourse?.instituteName}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">شهریه:</span><b className="text-primary-600">{selectedCourse?.price ? Number(selectedCourse.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}</b></div>
                <div className="border-t border-border-light pt-3.5 flex justify-between"><span className="text-text-tertiary">هنرجو:</span><b>{form.fullName}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">موبایل (تأیید شده ✓):</span><b dir="ltr">{cleanPhone}</b></div>
              </div>
              <button disabled={loading} onClick={handleSubmit}
                className="w-full py-4 rounded-[14px] text-sm font-black text-white bg-success-600 hover:bg-success-700 disabled:opacity-50 shadow-lg shadow-success-500/25 flex items-center justify-center gap-2 cursor-pointer">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> در حال ثبت...</> : <><CheckCircle className="w-4 h-4" /> تأیید و ثبت‌نام قطعی</>}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />
      <Suspense fallback={<div className="pt-28 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
        <RegistrationWizard />
      </Suspense>
      <Footer />
    </main>
  );
}
