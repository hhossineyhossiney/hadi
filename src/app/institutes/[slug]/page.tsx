import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstituteBannerSlider from "@/components/InstituteBannerSlider";
import { db } from "@/db";
import { institutes, regions, courses, categories, reviews, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pruneInstitute } from "@/lib/media-url";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Star,
  BadgeCheck,
  Clock,
  Users,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  Award,
  BookOpen,
  Navigation,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Approximate coordinates for Zeberkhan county regions
const regionCoords: Record<string, { lat: number; lng: number }> = {
  "قدمگاه": { lat: 36.1049, lng: 59.0641 },
  "درود": { lat: 36.091, lng: 59.112 },
  "اسحاق‌آباد": { lat: 36.053, lng: 59.011 },
  "خور": { lat: 36.033, lng: 59.121 },
  "خرو": { lat: 36.147, lng: 59.262 },
};

export default async function InstituteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const institute = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      description: institutes.description,
      address: institutes.address,
      phone: institutes.phone,
      mobile: institutes.mobile,
      email: institutes.email,
      rating: institutes.rating,
      reviewCount: institutes.reviewCount,
      isVerified: institutes.isVerified,
      images: institutes.images,
      bannerImages: institutes.bannerImages,
      regionName: regions.name,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(institutes.slug, slug))
    .then((res) => res[0] ? pruneInstitute(res[0]) : res[0]);

  if (!institute) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <h1 className="text-2xl font-black text-text-primary mb-2">آموزشگاه یافت نشد</h1>
          <Link href="/institutes" className="text-primary-600 hover:underline font-bold">
            بازگشت به لیست آموزشگاه‌ها
          </Link>
        </div>
      </main>
    );
  }

  const courseList = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      duration: courses.duration,
      price: courses.price,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      startDate: courses.startDate,
      categoryName: categories.name,
    })
    .from(courses)
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.instituteId, institute.id));

  const reviewList = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      userName: users.name,
    })
    .from(reviews)
    .leftJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.instituteId, institute.id));

  const coords = regionCoords[institute.regionName || ""] || regionCoords["قدمگاه"];
  const bbox = `${coords.lng - 0.02},${coords.lat - 0.012},${coords.lng + 0.02},${coords.lat + 0.012}`;

  return (
    <main className="min-h-screen bg-bg-primary">
      <Navbar />

      {/* ===== Hero Banner ===== */}
      <div className="relative h-[340px] lg:h-[420px] overflow-hidden">
        {Array.isArray(institute.bannerImages) && (institute.bannerImages as string[]).length > 0 ? (
          <InstituteBannerSlider images={institute.bannerImages as string[]} />
        ) : (
          <img src="/images/institute-cover.jpg" alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3A]/95 via-[#0B1B3A]/50 to-[#0B1B3A]/20" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-end gap-5">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[20px] gradient-button shadow-2xl flex flex-col items-center justify-center shrink-0 border-2 border-white/40">
                <span className="text-3xl">🎓</span>
                <span className="text-[8px] font-black text-white/90 mt-0.5">فنی و حرفه‌ای</span>
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  {institute.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-secondary-500/90 px-2.5 py-1 rounded-full backdrop-blur-sm">
                      <BadgeCheck className="w-3.5 h-3.5" /> تأیید شده
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    <MapPin className="w-3 h-3" /> {institute.regionName}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-4xl font-black text-white mb-1.5">{institute.name}</h1>
                <div className="flex items-center gap-2 text-white/80">
                  <Star className="w-4 h-4 text-accent-400 fill-accent-400" />
                  <span className="font-black text-white">{institute.rating || "—"}</span>
                  <span className="text-xs text-white/50">({institute.reviewCount || 0} نظر هنرجویان)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Sticky Action Bar ===== */}
      <div className="sticky top-0 z-40 glass border-b border-border-default shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {(institute.mobile || institute.phone) && (
              <a
                href={`tel:${institute.mobile || institute.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-surface border border-border-default text-text-primary text-xs font-bold hover:border-primary-300 hover:text-primary-600 transition-all shrink-0"
              >
                <Phone className="w-4 h-4 text-primary-500" /> تماس
              </a>
            )}
            {institute.mobile && (
              <a
                href={`https://wa.me/${institute.mobile.replace(/^0/, "+98")}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-secondary-50 border border-secondary-200 text-secondary-700 text-xs font-bold hover:bg-secondary-100 transition-all shrink-0"
              >
                <MessageCircle className="w-4 h-4" /> واتساپ
              </a>
            )}
            <a
              href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] bg-surface border border-border-default text-text-primary text-xs font-bold hover:border-primary-300 hover:text-primary-600 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4 text-primary-500" /> مسیریابی
            </a>
          </div>
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-[12px] text-xs font-black text-white gradient-button hover:gradient-button-hover shadow-lg shadow-primary-600/25 transition-all shrink-0"
          >
            ثبت‌نام سریع
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ===== About + Trust badges ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-surface rounded-[20px] border border-border-default p-7">
            <h2 className="text-lg font-black text-text-primary mb-3">درباره آموزشگاه</h2>
            <p className="text-text-secondary leading-relaxed text-sm mb-5">{institute.description}</p>
            {institute.address && (
              <div className="flex items-start gap-2.5 p-4 rounded-[14px] bg-bg-secondary text-sm">
                <MapPin className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                <span className="text-text-secondary font-medium">{institute.address}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, title: "دارای مجوز رسمی", desc: "سازمان فنی و حرفه‌ای کشور", color: "text-secondary-600 bg-secondary-50 border-secondary-200" },
              { icon: BadgeCheck, title: "هویت تأیید شده", desc: "توسط پلتفرم زبرخان آموزش", color: "text-primary-600 bg-primary-50 border-primary-200" },
              { icon: Award, title: `${courseList.length} دوره فعال`, desc: "با مدرک رسمی پایان دوره", color: "text-accent-600 bg-accent-50 border-accent-200" },
            ].map((b) => (
              <div key={b.title} className={`flex items-center gap-3.5 p-4 rounded-[16px] border ${b.color.split(" ").slice(1).join(" ")}`}>
                <b.icon className={`w-6 h-6 shrink-0 ${b.color.split(" ")[0]}`} />
                <div>
                  <div className="text-sm font-black text-text-primary">{b.title}</div>
                  <div className="text-[11px] text-text-tertiary">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Courses Grid ===== */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-text-primary mb-6">دوره‌های آموزشی</h2>
          {courseList.length === 0 ? (
            <div className="bg-surface rounded-[20px] border border-border-default p-12 text-center">
              <BookOpen className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
              <p className="text-text-secondary">هنوز دوره‌ای ثبت نشده است</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courseList.map((course) => {
                const cap = course.capacity || 0;
                const filled = course.enrolledCount || 0;
                const pct = cap > 0 ? Math.min(100, Math.round((filled / cap) * 100)) : 0;
                return (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group block bg-surface rounded-[20px] border border-border-default hover:border-primary-200 hover-lift transition-all duration-500 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
                          {course.categoryName}
                        </span>
                        <span className="text-[11px] font-black text-text-primary">
                          {course.price ? Number(course.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}
                        </span>
                      </div>
                      <h3 className="font-black text-text-primary group-hover:text-primary-600 transition-colors mb-2">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-text-tertiary mb-4">
                        {course.duration && (
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                        )}
                        {course.startDate && (
                          <span className="flex items-center gap-1">📅 {course.startDate}</span>
                        )}
                      </div>
                      {/* Capacity tracker */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                          <span className="text-text-tertiary flex items-center gap-1"><Users className="w-3 h-3" /> ظرفیت تکمیل‌شده</span>
                          <span className={pct >= 80 ? "text-error-500" : "text-primary-600"}>{filled} / {cap}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct >= 80 ? "bg-error-500" : "gradient-button"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-full text-center py-2.5 rounded-[12px] text-xs font-black text-white gradient-button group-hover:gradient-button-hover transition-all">
                        ثبت‌نام سریع
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Gallery / Portfolio ===== */}
        {Array.isArray(institute.images) && (institute.images as string[]).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-black text-text-primary mb-6">گالری و نمونه‌کارها</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(institute.images as string[]).map((img, i) => (
                <div key={i} className="rounded-[16px] overflow-hidden border border-border-default aspect-square hover-lift bg-surface">
                  <img src={img} alt={`نمونه‌کار ${institute.name} — ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Map Embed ===== */}
        <div className="mb-12">
          <h2 className="text-xl font-black text-text-primary mb-6">موقعیت روی نقشه</h2>
          <div className="bg-surface rounded-[20px] border border-border-default overflow-hidden">
            <iframe
              title="موقعیت آموزشگاه"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`}
              className="w-full h-[320px] border-0"
              loading="lazy"
            />
            <div className="p-4 flex items-center justify-between">
              <span className="text-xs text-text-tertiary font-medium">{institute.address}</span>
              <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-primary-50 text-primary-700 text-xs font-bold hover:bg-primary-100 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> دریافت مسیر
              </a>
            </div>
          </div>
        </div>

        {/* ===== Reviews ===== */}
        {reviewList.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-text-primary mb-6">نظرات هنرجویان</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviewList.map((review) => (
                <div key={review.id} className="bg-surface rounded-[20px] border border-border-default p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? "text-accent-400 fill-accent-400" : "text-border-strong"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-text-tertiary">{review.userName || "هنرجو"}</span>
                  </div>
                  <p className="text-text-secondary text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10">
          <Link href="/institutes" className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-600 transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> مشاهده سایر آموزشگاه‌ها
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
