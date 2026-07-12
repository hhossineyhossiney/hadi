import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoriesBar from "@/components/StoriesBar";
import HeroSection from "@/components/HeroSection";
import QuickAccess from "@/components/QuickAccess";
import CategoryCards from "@/components/CategoryCards";
import InstitutesShowcase from "@/components/InstitutesShowcase";
import CoursesShowcase from "@/components/CoursesShowcase";
import StatsSection from "@/components/StatsSection";
import FaqSection from "@/components/FaqSection";
import VerifyLicenseBanner from "@/components/VerifyLicenseBanner";
import ShopShowcase from "@/components/ShopShowcase";
import { db } from "@/db";
import { categories, institutes, regions, courses, siteSettings } from "@/db/schema";
import { eq, count, sql, inArray, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rawCats = await db.select().from(categories).orderBy(categories.name);

  const cats = await Promise.all(
    rawCats.map(async (c) => {
      const courseRows = await db
        .select({ instituteId: courses.instituteId })
        .from(courses)
        .where(and(eq(courses.categoryId, c.id), eq(courses.status, "approved")));
      const activeCourseCount = courseRows.length;
      const uniqueInstitutes = new Set(courseRows.map((r) => r.instituteId)).size;
      return { ...c, activeCourseCount, instituteCount: uniqueInstitutes };
    })
  );

  const settingsRows = await db.select().from(siteSettings);
  const settingsMap: Record<string, number[]> = {};
  settingsRows.forEach((r) => (settingsMap[r.key] = (r.value as number[]) || []));
  const featuredInstituteIds = settingsMap["featured_institutes"] || [];
  const featuredCourseIds = settingsMap["featured_courses"] || [];

  const instituteBaseQuery = db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      address: institutes.address,
      description: institutes.description,
      phone: institutes.phone,
      mobile: institutes.mobile,
      rating: institutes.rating,
      reviewCount: institutes.reviewCount,
      isVerified: institutes.isVerified,
      regionName: regions.name,
      logo: institutes.logo,
      profilePhoto: institutes.profilePhoto,
      bannerImages: institutes.bannerImages,
      accessCode: institutes.accessCode,
      licenseNumber: institutes.licenseNumber,
      managerName: institutes.managerName,
      managerTitle: institutes.managerTitle,
      features: institutes.features,
      isYearAward: institutes.isYearAward,
      establishedYear: institutes.establishedYear,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id));

  const featuredInstitutes =
    featuredInstituteIds.length > 0
      ? await instituteBaseQuery.where(
          and(eq(institutes.status, "approved"), inArray(institutes.id, featuredInstituteIds))
        )
      : await instituteBaseQuery
          .where(eq(institutes.status, "approved"))
          .orderBy(sql`${institutes.rating} DESC`)
          .limit(6);

  const institutesWithCourseCount = await Promise.all(
    featuredInstitutes.map(async (inst) => {
      const courseCount = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.instituteId, inst.id))
        .then((res) => res[0]?.count || 0);
      return { ...inst, courseCount };
    })
  );

  const courseBaseQuery = db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      fullDescription: courses.fullDescription,
      duration: courses.duration,
      price: courses.price,
      originalPrice: courses.originalPrice,
      level: courses.level,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      startDate: courses.startDate,
      image: courses.image,
      categoryName: categories.name,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
    })
    .from(courses)
    .leftJoin(institutes, eq(courses.instituteId, institutes.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id));

  const latestCourses =
    featuredCourseIds.length > 0
      ? await courseBaseQuery.where(
          and(eq(courses.status, "approved"), inArray(courses.id, featuredCourseIds))
        )
      : await courseBaseQuery
          .where(eq(courses.status, "approved"))
          .orderBy(sql`${courses.createdAt} DESC`)
          .limit(12);

  const instituteListForFilter = await db
    .select({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      regionName: regions.name,
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(institutes.status, "approved"))
    .orderBy(institutes.name);

  return (
    <main className="min-h-screen">
      <Navbar />
      <StoriesBar />
      <HeroSection />
      <QuickAccess />
      <CategoryCards categories={cats} />

      <InstitutesShowcase institutes={institutesWithCourseCount} />

      <VerifyLicenseBanner />

      <ShopShowcase />

      <CoursesShowcase
        courses={latestCourses}
        categories={rawCats.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        institutes={instituteListForFilter}
      />

      <section className="py-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="gradient-dark rounded-[24px] p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-5 relative overflow-hidden border border-white/5">
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: "32px 32px",
              }}
            />
            <div className="relative text-center lg:text-right">
              <h2 className="text-2xl lg:text-3xl font-black text-white mb-2">
                آموزشگاه دارید؟ 🎓
              </h2>
              <p className="text-white/60 text-sm max-w-lg">
                آموزشگاه خود را در سامانه مرکز شماره ۱۲ ثبت کنید و هنرجویان بیشتری در سراسر شهرستان زبرخان جذب نمایید
              </p>
            </div>
            <a
              href="tel:09159513179"
              className="relative shrink-0 px-8 py-4 rounded-[14px] text-sm font-black text-navy-900 bg-white hover:bg-primary-50 shadow-2xl transition-all"
            >
              ثبت آموزشگاه رایگان — ۰۹۱۵۹۵۱۳۱۷۹
            </a>
          </div>
        </div>
      </section>

      <FaqSection />

      <StatsSection />
      <Footer />
    </main>
  );
}
