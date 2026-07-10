"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  Phone,
  Star,
  CheckCircle,
  Calendar,
  User,
  BookOpen,
  Heart,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import CourseBannerSlider from "@/components/CourseBannerSlider";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fullDescription: string | null;
  duration: string | null;
  price: string | null;
  capacity: number | null;
  enrolledCount: number | null;
  instructor: string | null;
  requirements: string | null;
  schedule: string | null;
  startDate: string | null;
  bannerImages: string[] | null;
  registrationClosed?: boolean | null;
  registrationEnded?: boolean | null;
  categoryName: string | null;
  categorySlug: string | null;
  instituteName: string | null;
  instituteSlug: string | null;
  institutePhone: string | null;
  instituteMobile: string | null;
  instituteAddress: string | null;
  regionName: string | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const { status: sessionStatus } = useSession();
  const isLoggedIn = sessionStatus === "authenticated";
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favBusy, setFavBusy] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      const res = await fetch(`/api/courses/${params.slug}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [params.slug]);

  // Check if this course is in favorites
  useEffect(() => {
    if (!isLoggedIn || !course?.id) return;
    fetch("/api/student/favorites")
      .then((r) => r.json())
      .then((favs) => {
        if (Array.isArray(favs)) {
          setIsFav(favs.some((f: any) => f.courseId === course.id));
        }
      })
      .catch(() => {});
  }, [isLoggedIn, course?.id]);

  const toggleFav = async () => {
    if (!isLoggedIn) {
      alert("برای افزودن به علاقه‌مندی‌ها ابتدا وارد حساب کاربری شوید.");
      window.location.href = "/login";
      return;
    }
    if (!course?.id) return;
    setFavBusy(true);
    try {
      if (isFav) {
        await fetch("/api/student/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        });
        setIsFav(false);
      } else {
        await fetch("/api/student/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id }),
        });
        setIsFav(true);
      }
    } finally {
      setFavBusy(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-secondary">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-bg-secondary">
        <Navbar />
        <div className="pt-28 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-black text-text-primary mb-2">دوره یافت نشد</h1>
            <Link href="/courses" className="text-primary-600 hover:underline font-bold">
              بازگشت به لیست دوره‌ها
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const spotsLeft = (course.capacity || 0) - (course.enrolledCount || 0);

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به دوره‌ها
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface rounded-[28px] border border-border-default overflow-hidden mb-8"
          >
            <div className="h-56 gradient-hero relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-primary-400/20 blur-3xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <span className="text-white/70 text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-3">
                  دوره مهارتی با مدرک رسمی فنی و حرفه‌ای
                </span>
                <h2 className="text-2xl lg:text-4xl font-black text-white leading-tight">
                  {course.title}
                </h2>
                <span className="text-white/60 text-xs font-bold mt-2">
                  {course.instituteName}
                </span>
              </div>
            </div>

            <div className="p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-sm font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                  {course.categoryName}
                </span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  course.requirements && course.requirements.includes("بدون پیش‌نیاز")
                    ? "text-secondary-700 bg-secondary-50"
                    : "text-accent-600 bg-accent-50"
                }`}>
                  {course.requirements && course.requirements.includes("بدون پیش‌نیاز") ? "🟢 سطح: مبتدی" : "🟡 سطح: پیشرفته"}
                </span>
                {spotsLeft > 0 && spotsLeft <= 3 && (
                  <span className="text-sm font-bold text-error-600 bg-error-50 px-3 py-1 rounded-full animate-pulse">
                    ⚡ فقط {spotsLeft} ظرفیت باقی‌مانده
                  </span>
                )}
              </div>

              {/* Capacity tracker bar */}
              <div className="mb-6 p-4 rounded-[16px] bg-bg-secondary border border-border-light">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="text-text-secondary">ظرفیت تکمیل‌شده دوره</span>
                  <span className={
                    (course.capacity || 0) > 0 && ((course.enrolledCount || 0) / (course.capacity || 1)) >= 0.8
                      ? "text-error-500"
                      : "text-primary-600"
                  }>
                    {course.enrolledCount || 0} از {course.capacity || 0} نفر
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface overflow-hidden border border-border-light">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      (course.capacity || 0) > 0 && ((course.enrolledCount || 0) / (course.capacity || 1)) >= 0.8
                        ? "bg-error-500"
                        : "gradient-button"
                    }`}
                    style={{
                      width: `${(course.capacity || 0) > 0 ? Math.min(100, Math.round(((course.enrolledCount || 0) / (course.capacity || 1)) * 100)) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-4">
                {course.title}
              </h1>

              {Array.isArray(course.bannerImages) && course.bannerImages.length > 0 && (
                <CourseBannerSlider images={course.bannerImages} />
              )}

              <p className="text-text-secondary text-lg mb-8">{course.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {course.duration && (
                  <div className="p-4 rounded-[16px] bg-bg-secondary text-center">
                    <Clock className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs text-text-tertiary">مدت زمان</p>
                    <p className="font-bold text-text-primary">{course.duration}</p>
                  </div>
                )}
                <div className="p-4 rounded-[16px] bg-bg-secondary text-center">
                  <Users className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-text-tertiary">ظرفیت</p>
                  <p className="font-bold text-text-primary">
                    {course.enrolledCount || 0} / {course.capacity || 0}
                  </p>
                </div>
                <div className="p-4 rounded-[16px] bg-bg-secondary text-center">
                  <Star className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                  <p className="text-xs text-text-tertiary">هزینه</p>
                  <p className="font-bold text-text-primary">
                    {course.price
                      ? Number(course.price).toLocaleString("fa-IR") + " تومان"
                      : "رایگان"}
                  </p>
                </div>
                {course.instructor && (
                  <div className="p-4 rounded-[16px] bg-bg-secondary text-center">
                    <User className="w-5 h-5 text-primary-600 mx-auto mb-2" />
                    <p className="text-xs text-text-tertiary">استاد</p>
                    <p className="font-bold text-text-primary">{course.instructor}</p>
                  </div>
                )}
              </div>

              {course.fullDescription && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-600" />
                    توضیحات کامل
                  </h2>
                  <p className="text-text-secondary leading-relaxed">{course.fullDescription}</p>
                </div>
              )}

              {course.requirements && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                    پیش‌نیازها
                  </h2>
                  <p className="text-text-secondary leading-relaxed">{course.requirements}</p>
                </div>
              )}

              {course.schedule && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-text-primary mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    زمان‌بندی
                  </h2>
                  <p className="text-text-secondary leading-relaxed">{course.schedule}</p>
                </div>
              )}

              <div className="p-6 rounded-[20px] bg-bg-secondary mb-8">
                <h2 className="text-xl font-bold text-text-primary mb-4">اطلاعات آموزشگاه</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.instituteName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-primary-50 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">آموزشگاه</p>
                        <Link
                          href={`/institutes/${course.instituteSlug}`}
                          className="font-bold text-text-primary hover:text-primary-600 transition-colors"
                        >
                          {course.instituteName}
                        </Link>
                      </div>
                    </div>
                  )}
                  {course.instituteAddress && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-primary-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">آدرس</p>
                        <p className="font-bold text-text-primary">{course.instituteAddress}</p>
                      </div>
                    </div>
                  )}
                  {(course.institutePhone || course.instituteMobile) && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-primary-50 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">تماس</p>
                        <p className="font-bold text-text-primary" dir="ltr">
                          {course.instituteMobile || course.institutePhone}
                        </p>
                      </div>
                    </div>
                  )}
                  {course.regionName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-primary-50 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-xs text-text-tertiary">منطقه</p>
                        <p className="font-bold text-text-primary">{course.regionName}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(() => {
                const isFull = (course.capacity || 0) > 0 && (course.enrolledCount || 0) >= (course.capacity || 0);
                const blocked = course.registrationClosed || course.registrationEnded || isFull;
                const reason = course.registrationClosed
                  ? { text: "ثبت‌نام در این دوره متوقف شده است", sub: "توسط مدیر آموزشگاه غیرفعال شده", color: "error" }
                  : course.registrationEnded
                    ? { text: "زمان ثبت‌نام این دوره به پایان رسیده", sub: "مهلت ثبت‌نام تمام شده است", color: "purple" }
                    : isFull
                      ? { text: "ظرفیت این دوره تکمیل شده است", sub: `${course.enrolledCount} از ${course.capacity} نفر ثبت‌نام کرده‌اند`, color: "amber" }
                      : null;

                if (blocked && reason) {
                  const colorMap: Record<string, string> = {
                    error: "bg-error-500/15 border-error-500/40 text-error-600",
                    purple: "bg-purple-500/15 border-purple-500/40 text-purple-600",
                    amber: "bg-amber-500/15 border-amber-500/40 text-amber-600",
                  };
                  return (
                    <div className={`mb-4 rounded-[16px] border-2 p-5 text-center ${colorMap[reason.color]}`}>
                      <div className="text-lg font-black mb-1">⚠️ {reason.text}</div>
                      <div className="text-xs opacity-80">{reason.sub}</div>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="flex flex-col sm:flex-row gap-4">
                {(course.registrationClosed || course.registrationEnded || ((course.capacity || 0) > 0 && (course.enrolledCount || 0) >= (course.capacity || 0))) ? (
                  <button
                    disabled
                    className="flex-1 text-center px-8 py-4 rounded-[16px] text-lg font-black text-white bg-slate-500 cursor-not-allowed opacity-70"
                  >
                    ثبت‌نام غیرفعال است
                  </button>
                ) : (
                  <Link
                    href={`/register?course=${course.slug}`}
                    className="flex-1 text-center px-8 py-4 rounded-[16px] text-lg font-black text-white gradient-button hover:gradient-button-hover shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all"
                  >
                    ثبت‌نام در دوره
                  </Link>
                )}
                <button
                  onClick={toggleFav}
                  disabled={favBusy}
                  className={`px-6 py-4 rounded-[16px] text-sm font-bold border-2 transition-all flex items-center gap-2 justify-center ${
                    isFav
                      ? "bg-error-500/15 border-error-500 text-error-600"
                      : "bg-white/60 border-border-default text-text-secondary hover:border-error-300 hover:text-error-500"
                  }`}
                  title={isFav ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
                >
                  {favBusy ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isFav ? "fill-error-500" : ""}`} />
                  )}
                  {isFav ? "در علاقه‌مندی‌ها" : "علاقه‌مند شدن"}
                </button>
                {course.instituteMobile && (
                  <a
                    href={`https://wa.me/${course.instituteMobile.replace(/^0/, "+98")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 rounded-[16px] text-lg font-bold text-secondary-700 bg-secondary-50 border border-secondary-200 hover:bg-secondary-100 transition-colors text-center"
                  >
                    مشاوره واتساپ
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
