import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { courses, institutes, categories, regions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Clock, Users, Building2, MapPin } from "lucide-react";
import { getTheme } from "@/lib/cardTheme";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const data = await db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      duration: courses.duration,
      price: courses.price,
      originalPrice: courses.originalPrice,
      level: courses.level,
      capacity: courses.capacity,
      enrolledCount: courses.enrolledCount,
      instructor: courses.instructor,
      startDate: courses.startDate,
      categoryName: categories.name,
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      regionName: regions.name,
    })
    .from(courses)
    .leftJoin(institutes, eq(courses.instituteId, institutes.id))
    .leftJoin(categories, eq(courses.categoryId, categories.id))
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(courses.status, "approved"))
    .orderBy(sql`${courses.createdAt} DESC`);

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">
              COURSES
            </span>
            <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-2">دوره‌های مهارتی</h1>
            <p className="text-text-secondary">
              {data.length} دوره فعال با مدرک رسمی فنی و حرفه‌ای در شهرستان زبرخان
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {data.map((course, i) => {
              const theme = getTheme(course.categoryName, i);
              const cap = course.capacity || 0;
              const filled = course.enrolledCount || 0;
              const pct = cap > 0 ? Math.min(100, Math.round((filled / cap) * 100)) : 0;
              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group block bg-surface rounded-[20px] border border-border-default hover:border-primary-200 hover-lift transition-all duration-500 overflow-hidden"
                >
                  <div className={`relative h-32 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
                    <div
                      className="absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
                        backgroundSize: "20px 20px",
                      }}
                    />
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                    <div className="relative h-full flex flex-col items-center justify-center px-3 text-center">
                      <span className="text-white text-sm font-black leading-tight line-clamp-1">{course.title}</span>
                      <span className="text-white/75 text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/20">
                        {course.categoryName}
                      </span>
                    </div>
                    {course.startDate && (
                      <span className="absolute top-2.5 right-2.5 text-[9px] font-black text-white bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20">
                        شروع: {course.startDate}
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary font-bold mb-1.5">
                      <Building2 className="w-3.5 h-3.5 text-primary-400" />
                      <span className="line-clamp-1">{course.instituteName}</span>
                    </div>
                    {course.regionName && (
                      <div className="flex items-center gap-1.5 text-[10px] text-text-tertiary mb-2.5">
                        <MapPin className="w-3 h-3" /> {course.regionName}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-text-secondary mb-3">
                      {course.duration && (
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{course.duration}</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{filled}/{cap}</span>
                    </div>
                    {/* capacity bar */}
                    <div className="h-1.5 rounded-full bg-bg-secondary overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${pct >= 80 ? "bg-error-500" : "gradient-button"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light">
                      <span className="text-sm font-black text-primary-600">
                        {course.price ? Number(course.price).toLocaleString("fa-IR") + " تومان" : "رایگان"}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${theme.badge}`}>
                        ثبت‌نام سریع
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
