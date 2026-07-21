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
import { signIn, useSession } from "next-auth/react";
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
  const { data: session, status: sessionStatus, update: updateSession } = useSession();
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
  const [autoLoginSucceeded, setAutoLoginSucceeded] = useState(false);
  const [autoLoginFailed, setAutoLoginFailed] = useState(false);
  const [error, setError] = useState("");
  const [showInfoValidation, setShowInfoValidation] = useState(false);

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
  const fullNameValid = form.fullName.trim().length >= 3;
  const phoneValid = /^09\d{9}$/.test(cleanPhone);
  const passValid = form.password.length >= 6;
  const passwordsEqual = form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;
  const passMatch = passValid && passwordsEqual;
  const passwordCharactersRemaining = Math.max(0, 6 - form.password.length);

  const infoValidationIssues = [
    !fullNameValid ? "نام و نام خانوادگی را حداقل با ۳ کاراکتر وارد کنید." : null,
    !phoneValid ? "شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود." : null,
    !passValid ? `رمز عبور باید حداقل ۶ کاراکتر باشد${form.password.length > 0 ? `؛ ${passwordCharactersRemaining} کاراکتر دیگر لازم است.` : "."}` : null,
    form.passwordConfirm.length === 0
      ? "تکرار رمز عبور را وارد کنید."
      : !passwordsEqual
        ? "رمز عبور و تکرار آن یکسان نیستند."
        : null,
  ].filter((issue): issue is string => Boolean(issue));

  const canNext1 = !!form.courseSlug && !duplicateReg;
  const canNext2 = infoValidationIssues.length === 0;

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

  const continueToOtp = async () => {
    setShowInfoValidation(true);
    setError("");
    if (!canNext2) return;
    setStep(3);
    await sendOtp();
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
      if (res.ok) {
        if (!isLoggedIn) {
          try {
            const loginResult = await signIn("credentials", {
              phone: cleanPhone,
              password: form.password,
              redirect: false,
              callbackUrl: "/dashboard",
            });

            if (loginResult?.error) {
              setAutoLoginFailed(true);
            } else {
              setAutoLoginSucceeded(true);
              await updateSession();
            }
          } catch {
            setAutoLoginFailed(true);
          }
        }
        setSuccess(true);
      } else {
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
  const accountSessionReady = isLoggedIn || autoLoginSucceeded;

  if (success) {
    return (
      <div className="register-content pt-28 pb-20">
        <div className="max-w-xl mx-auto px-3 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="register-wizard-card rounded-[28px] p-7 text-center sm:p-10">
            <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success-600" />
            </div>
            <h2 className="text-2xl font-black text-text-primary mb-3">ثبت‌نام با موفقیت انجام شد! 🎉</h2>
            <p className="text-text-secondary text-sm mb-2">
              دوره <b className="text-text-primary">{selectedCourse?.title}</b> برای شما رزرو شد.
            </p>
            <p className="text-text-tertiary text-xs mb-3">
              {isLoggedIn
                ? "درخواست شما در انتظار تأیید مدیر آموزشگاه است. می‌توانید در پنل هنرجو وضعیت را پیگیری کنید."
                : accountSessionReady
                  ? (<>شماره <span dir="ltr" className="font-bold text-text-primary">{cleanPhone}</span> تأیید شد و اکنون با حساب هنرجویی خود وارد سامانه هستید.</>)
                  : (<>شماره <span dir="ltr" className="font-bold text-text-primary">{cleanPhone}</span> تأیید شد و حساب شما ساخته شد.</>)}
            </p>
            {autoLoginFailed && (
              <div className="mb-5 rounded-[12px] border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-bold text-amber-600">
                حساب با موفقیت ساخته شد؛ برای ورود به پنل، یک‌بار شماره موبایل و رمز عبور خود را وارد کنید.
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={accountSessionReady ? "/dashboard" : `/login?callbackUrl=${encodeURIComponent("/dashboard")}`}
                className="px-8 py-3.5 rounded-[14px] text-white gradient-button font-bold text-sm shadow-lg shadow-primary-600/25">
                {accountSessionReady ? "ورود به پنل هنرجو" : "ورود امن به حساب"}
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
    <div className="register-content pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-3 sm:px-6 lg:px-8">
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
        <div className="register-stepper mb-7 flex items-center justify-between px-1 sm:mb-8">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all duration-500 ${
                  step > s.n ? "register-step register-step--done"
                  : step === s.n ? "register-step register-step--active scale-110"
                  : "register-step register-step--future"
                }`}>
                  {step > s.n ? <Check className="w-4 h-4" /> : s.n.toLocaleString("fa-IR")}
                </div>
                <span className={`whitespace-nowrap text-[9px] font-black sm:text-[10px] ${step >= s.n ? "register-step-label--active" : "register-step-label--future"}`}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 mb-6 h-0.5 flex-1 rounded-full transition-all duration-500 ${step > s.n ? "register-step-line--done" : "register-step-line--future"}`} />
              )}
            </div>
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
          className="register-wizard-card overflow-hidden rounded-[28px]">
          {error && <div className="m-6 mb-0 p-4 rounded-[14px] bg-error-50 text-error-600 text-sm font-bold">{error}</div>}

          {/* STEP 1 — Course selection (always) */}
          {step === 1 && (
            <div className="p-5 sm:p-7">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-[9px] font-black text-cyan-200">
                <BookOpen className="h-3.5 w-3.5" /> مسیر آموزشی خود را انتخاب کنید
              </div>
              <h2 className="mb-1 text-2xl font-black text-text-primary">انتخاب آموزشگاه و دوره</h2>
              <p className="mb-6 text-xs font-medium leading-6 text-text-tertiary">از میان دوره‌های فعال، گزینهٔ مناسب خود را انتخاب کنید.</p>
              <div className="relative mb-5">
                <Building2 className="pointer-events-none absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-cyan-300" />
                <select value={instituteFilter} onChange={(e) => setInstituteFilter(e.target.value)}
                  className="register-field w-full cursor-pointer rounded-[15px] border py-3.5 pl-4 pr-12 text-sm font-bold">
                  <option value="">همه آموزشگاه‌ها</option>
                  {institutes.map((inst) => <option key={inst} value={inst}>{inst}</option>)}
                </select>
              </div>
              {loadingCourses ? (
                <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-16" />)}</div>
              ) : (
                <div className="max-h-[23rem] space-y-3 overflow-y-auto pl-1 pr-0.5">
                  {filteredCourses.map((c) => {
                    const blockReason = getCourseBlockReason(c);
                    const alreadyReg = alreadyRegistered.find((r) => r.courseSlug === c.slug);
                    const cFull = !!blockReason;
                    const disabled = cFull || !!alreadyReg;
                    const selected = form.courseSlug === c.slug;
                    return (
                      <button key={c.slug} type="button" onClick={() => !disabled && setForm({ ...form, courseSlug: c.slug })} disabled={disabled}
                        aria-pressed={selected}
                        className={`register-course-option w-full rounded-[17px] border p-4 text-right transition-all sm:p-5 ${
                          disabled
                            ? "register-course-option--disabled cursor-not-allowed"
                            : selected
                              ? "register-course-option--selected cursor-pointer"
                              : "register-course-option--available cursor-pointer"
                        }`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className={`flex flex-wrap items-center gap-2 text-sm font-black ${
                              disabled ? "register-course-title--disabled" : selected ? "register-course-title--selected" : "register-course-title--available"
                            }`}>
                              <span>{c.title}</span>
                              {blockReason && <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black text-amber-200">{blockReason}</span>}
                              {alreadyReg && (
                                <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-black text-emerald-200">
                                  ✓ قبلاً ثبت‌نام شده
                                </span>
                              )}
                            </div>
                            <div className={`mt-1 text-[11px] font-bold ${disabled ? "text-slate-500" : selected ? "text-cyan-100/80" : "text-slate-400"}`}>{c.instituteName}</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <span className={`whitespace-nowrap text-xs font-black ${disabled ? "text-slate-500" : selected ? "text-cyan-100" : "text-emerald-300"}`}>
                              {c.price ? Number(c.price).toLocaleString("fa-IR") + " ت" : "رایگان"}
                            </span>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${
                              selected
                                ? "border-cyan-200 bg-cyan-300 text-[#04223a] shadow-[0_0_18px_rgba(103,232,249,0.4)]"
                                : disabled
                                  ? "border-slate-600 bg-slate-800/60 text-slate-500"
                                  : "border-slate-500 bg-slate-900/30 text-transparent"
                            }`}>
                              {selected ? <Check className="h-4 w-4" /> : alreadyReg ? <CheckCircle className="h-4 w-4" /> : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              {duplicateReg && (
                <div className="mt-4 flex items-start gap-2 rounded-[14px] border border-cyan-300/25 bg-cyan-300/10 p-4 text-xs font-bold text-cyan-100">
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
                className="register-primary-action mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-[15px] py-4 text-sm font-black transition-all disabled:cursor-not-allowed disabled:opacity-40">
                ادامه <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ================= LOGGED-IN FLOW: STEP 2 = FINAL CONFIRM ================= */}
          {isLoggedIn && step === 2 && (
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-text-primary">تأیید نهایی ثبت‌نام</h2>
                <span className="text-[10px] font-black text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> کاربر تأیید شده
                </span>
              </div>
              <p className="text-text-tertiary text-xs mb-6">بدون نیاز به تأیید پیامکی — فقط اطلاعات را بررسی و ثبت نهایی کنید</p>
              <div className="register-info-panel mb-6 space-y-3.5 rounded-[18px] border p-5 text-sm">
                <div className="flex justify-between"><span className="text-text-tertiary">دوره:</span><b>{selectedCourse?.title}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">آموزشگاه:</span><b>{selectedCourse?.instituteName}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">شهریه:</span><b className="text-primary-600">{selectedCourse?.price ? Number(selectedCourse.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}</b></div>
                <div className="border-t border-border-light pt-3.5 flex justify-between"><span className="text-text-tertiary">هنرجو:</span><b>{sessionUser?.name}</b></div>
                <div className="flex justify-between"><span className="text-text-tertiary">موبایل:</span><b dir="ltr">{sessionUser?.phone}</b></div>
              </div>
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">توضیحات (اختیاری)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="register-field mb-4 w-full resize-none rounded-[14px] border px-4 py-3 text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="register-secondary-action flex cursor-pointer items-center gap-1.5 rounded-[14px] border px-5 py-3.5 text-sm font-bold">
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
            <div className="space-y-4 p-5 sm:p-7">
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
                    className={`register-field w-full rounded-[14px] border px-4 py-3.5 pr-11 text-sm font-semibold ${
                      (showInfoValidation || form.fullName.length > 0) && !fullNameValid ? "border-error-500" : "border-border-default"}`}
                    placeholder="مثلاً: علی رضایی" autoComplete="name" aria-invalid={(showInfoValidation || form.fullName.length > 0) && !fullNameValid} />
                  <User className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {(showInfoValidation || form.fullName.length > 0) && !fullNameValid && (
                  <p className="text-[10px] text-error-500 font-bold mt-1">نام و نام خانوادگی باید حداقل ۳ کاراکتر باشد</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">شماره موبایل (دقیقاً ۱۱ رقم) *</label>
                <div className="relative">
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`register-field w-full rounded-[14px] border px-4 py-3.5 pr-11 text-sm font-semibold ${
                      (showInfoValidation || form.phone.length > 0) && !phoneValid ? "border-error-500" : "border-border-default"}`}
                    placeholder="09123456789" dir="ltr" maxLength={11} inputMode="numeric" autoComplete="tel"
                    aria-invalid={(showInfoValidation || form.phone.length > 0) && !phoneValid} />
                  <Phone className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  {phoneValid && <CheckCircle className="w-5 h-5 text-success-500 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {(showInfoValidation || form.phone.length > 0) && !phoneValid && (
                  <p className="text-[10px] text-error-500 font-bold mt-1">شماره باید ۱۱ رقم و با ۰۹ شروع شود</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">رمز عبور (حداقل ۶ کاراکتر) *</label>
                <div className="relative">
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`register-field w-full rounded-[14px] border px-4 py-3.5 pr-11 text-sm font-semibold ${
                      (showInfoValidation || form.password.length > 0) && !passValid ? "border-error-500" : "border-border-default"}`}
                    placeholder="••••••" dir="ltr" autoComplete="new-password"
                    aria-invalid={(showInfoValidation || form.password.length > 0) && !passValid} />
                  <Lock className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>
                {(showInfoValidation || form.password.length > 0) && !passValid && (
                  <p className="text-[10px] text-error-500 font-bold mt-1">
                    {form.password.length === 0
                      ? "رمز عبور را وارد کنید؛ حداقل ۶ کاراکتر"
                      : `رمز کوتاه است؛ ${passwordCharactersRemaining.toLocaleString("fa-IR")} کاراکتر دیگر وارد کنید`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">تکرار رمز عبور *</label>
                <div className="relative">
                  <input type="password" value={form.passwordConfirm} onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                    className={`register-field w-full rounded-[14px] border px-4 py-3.5 pr-11 text-sm font-semibold ${
                      (showInfoValidation && form.passwordConfirm.length === 0) || (form.passwordConfirm.length > 0 && !passwordsEqual)
                        ? "border-error-500"
                        : passMatch ? "register-field--valid" : "border-border-default"}`}
                    placeholder="••••••" dir="ltr" autoComplete="new-password"
                    aria-invalid={(showInfoValidation && form.passwordConfirm.length === 0) || (form.passwordConfirm.length > 0 && !passwordsEqual)} />
                  <ShieldCheck className="w-5 h-5 text-text-tertiary absolute right-3.5 top-1/2 -translate-y-1/2" />
                  {passMatch && <CheckCircle className="w-5 h-5 text-success-500 absolute left-3.5 top-1/2 -translate-y-1/2" />}
                </div>
                {showInfoValidation && form.passwordConfirm.length === 0 ? (
                  <p className="text-[10px] text-error-500 font-bold mt-1">تکرار رمز عبور را وارد کنید</p>
                ) : form.passwordConfirm.length > 0 && !passwordsEqual ? (
                  <p className="text-[10px] text-error-500 font-bold mt-1">رمزهای عبور یکسان نیستند</p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">توضیحات (اختیاری)</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="register-field w-full resize-none rounded-[14px] border px-4 py-3 text-sm" />
              </div>

              {showInfoValidation && !canNext2 && (
                <div role="alert" className="rounded-[14px] border border-error-500/35 bg-error-500/10 p-3.5 text-right">
                  <p className="text-xs font-black text-error-600">برای ادامه این موارد را اصلاح کنید:</p>
                  <ul className="mt-2 space-y-1 text-[10px] font-bold leading-5 text-error-600">
                    {infoValidationIssues.map((issue) => <li key={issue}>• {issue}</li>)}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button onClick={() => setStep(1)}
                  className="register-secondary-action flex cursor-pointer items-center gap-1.5 rounded-[14px] border px-5 py-3.5 text-sm font-bold">
                  <ArrowRight className="w-4 h-4" /> قبلی
                </button>
                <button disabled={loading} onClick={continueToOtp}
                  className="flex-1 py-3.5 rounded-[14px] text-sm font-black text-white gradient-button disabled:cursor-wait disabled:opacity-50 shadow-lg shadow-primary-600/25 flex items-center justify-center gap-2 cursor-pointer">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                  {loading ? "در حال ارسال..." : "ارسال کد تأیید پیامکی"}
                </button>
              </div>
            </div>
          )}

          {/* GUEST STEP 3: OTP */}
          {!isLoggedIn && step === 3 && (
            <div className="p-5 text-center sm:p-7">
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
                  className="register-field w-full rounded-[16px] border-2 px-4 py-4 text-center text-2xl font-black tracking-[0.5em]"
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
                  className="register-secondary-action flex cursor-pointer items-center gap-1.5 rounded-[14px] border px-5 py-3.5 text-sm font-bold">
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
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black text-text-primary">تأیید نهایی</h2>
                <span className="text-[10px] font-black text-success-600 bg-success-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> موبایل تأیید شد
                </span>
              </div>
              <p className="text-text-tertiary text-xs mb-6">اطلاعات را بررسی و ثبت‌نام را قطعی کنید</p>
              <div className="register-info-panel mb-6 space-y-3.5 rounded-[18px] border p-5 text-sm">
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
    <main className="register-page min-h-screen bg-bg-primary">
      <Navbar />
      <Suspense fallback={<div className="pt-28 pb-20 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}>
        <RegistrationWizard />
      </Suspense>
      <Footer />
    </main>
  );
}
