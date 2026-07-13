import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstitutesFilter from "@/components/InstitutesFilter";
import { db } from "@/db";
import { institutes, regions, courses } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { pruneInstitute } from "@/lib/media-url";

export const dynamic = "force-dynamic";

export default async function InstitutesPage() {
  const data = await db
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
    })
    .from(institutes)
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(institutes.status, "approved"))
    .orderBy(sql`${institutes.rating} DESC`);

  const result = await Promise.all(
    data.map(async (inst) => {
      const courseCount = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.instituteId, inst.id))
        .then((res) => res[0]?.count || 0);
      return pruneInstitute({ ...inst, courseCount });
    })
  );

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 bg-secondary-50 border border-secondary-200 tracking-[0.15em] uppercase mb-4 px-3 py-1 rounded-full">
              TOP INSTITUTES IN ZEBERKHAN
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-3">
              آموزشگاه‌های برتر دارای مجوز رسمی
            </h1>
            <p className="text-text-secondary max-w-3xl mx-auto leading-relaxed">
              تمامی آموزشگاه‌های زیر دارای پروانه رسمی از مرکز فنی و حرفه‌ای شماره ۱۲ شهرستان
              زبرخان بوده و مدارک بین‌المللی صادر می‌کنند. ({result.length} آموزشگاه فعال)
            </p>
          </div>
          <InstitutesFilter institutes={result} />
        </div>
      </div>
      <Footer />
    </main>
  );
}
