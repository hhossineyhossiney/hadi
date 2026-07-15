import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { db } from "@/db";
import { courses, institutes, categories, regions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const runQuery = (withNew: boolean) => {
    const fields: any = {
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
      regionName: regions.name,
    };
    if (withNew) {
      fields.registrationClosed = courses.registrationClosed;
      fields.registrationEnded = courses.registrationEnded;
    }
    return db
      .select(fields)
      .from(courses)
      .leftJoin(institutes, eq(courses.instituteId, institutes.id))
      .leftJoin(categories, eq(courses.categoryId, categories.id))
      .leftJoin(regions, eq(institutes.regionId, regions.id))
      .where(eq(courses.status, "approved"))
      .orderBy(sql`${courses.createdAt} DESC`);
  };

  let data: any[];
  try {
    data = await runQuery(true);
  } catch (error: any) {
    console.error("Falling back to legacy courses query:", error?.message);
    const rows = await runQuery(false);
    data = rows.map((row: any) => ({ ...row, registrationClosed: false, registrationEnded: false }));
  }

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-20 left-[8%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">COURSES</span>
            <h1 className="text-3xl lg:text-5xl font-black text-text-primary mb-3">
              دوره‌های <span className="gradient-text">مهارتی حرفه‌ای</span>
            </h1>
            <p className="text-text-secondary">
              {data.length.toLocaleString("fa-IR")} دوره فعال با مدرک رسمی فنی و حرفه‌ای در شهرستان زبرخان
            </p>
          </div>

          {data.length === 0 ? (
            <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-16 text-center text-text-secondary">
              هنوز دوره‌ای منتشر نشده است.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
              {data.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
