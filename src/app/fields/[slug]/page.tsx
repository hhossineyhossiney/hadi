import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { categories, courses, institutes, regions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, Clock, Users, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .then((res) => res[0]);

  if (!category) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-secondary">
        <div className="text-center">
          <h1 className="text-2xl font-black text-text-primary mb-2">رشته یافت نشد</h1>
          <Link href="/fields" className="text-primary-600 hover:underline font-bold">
            بازگشت به رشته‌ها
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
      instituteName: institutes.name,
      instituteSlug: institutes.slug,
      regionName: regions.name,
    })
    .from(courses)
    .leftJoin(institutes, eq(courses.instituteId, institutes.id))
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(courses.categoryId, category.id))
    .orderBy(sql`${courses.createdAt} DESC`);

  const instituteList = await db
    .selectDistinct({
      id: institutes.id,
      name: institutes.name,
      slug: institutes.slug,
      address: institutes.address,
      mobile: institutes.mobile,
      rating: institutes.rating,
      regionName: regions.name,
    })
    .from(institutes)
    .leftJoin(courses, eq(courses.instituteId, institutes.id))
    .leftJoin(regions, eq(institutes.regionId, regions.id))
    .where(eq(courses.categoryId, category.id));

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/fields"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary-600 mb-6 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            بازگشت به رشته‌ها
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl font-black mb-3" style={{ color: category.color || "#18181B" }}>
              {category.name}
            </h1>
            <p className="text-text-secondary text-lg">{category.description}</p>
          </div>

          {instituteList.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-black text-text-primary mb-6">آموزشگاه‌ها</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instituteList.map((inst) => (
                  <Link
                    key={inst.id}
                    href={`/institutes/${inst.slug}`}
                    className="group block bg-surface rounded-[24px] border border-border-default hover:border-primary-200 hover-lift transition-all p-6"
                  >
                    <h3 className="font-bold text-text-primary group-hover:text-primary-600 transition-colors mb-2 text-lg">
                      {inst.name}
                    </h3>
                    {inst.address && (
                      <div className="flex items-center gap-1.5 text-text-tertiary text-sm mb-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="line-clamp-1">{inst.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      {inst.rating && (
                        <span className="text-accent-500 font-bold">
                          ⭐ {inst.rating}
                        </span>
                      )}
                      {inst.regionName && (
                        <span className="text-text-tertiary">{inst.regionName}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-black text-text-primary mb-6">دوره‌ها</h2>
            {courseList.length === 0 ? (
              <div className="bg-surface rounded-[24px] border border-border-default p-12 text-center">
                <p className="text-text-secondary">هنوز دوره‌ای در این رشته ثبت نشده است</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courseList.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group block bg-surface rounded-[24px] border border-border-default hover:border-primary-200 hover-lift transition-all duration-500 overflow-hidden"
                  >
                    <div
                      className="h-32 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, ${category.color || "#2563EB"}, ${category.color || "#2563EB"}99)` }}
                    >
                      <div
                        className="absolute inset-0 opacity-[0.12]"
                        style={{
                          backgroundImage: `radial-gradient(circle at 2px 2px, white 1.5px, transparent 0)`,
                          backgroundSize: "20px 20px",
                        }}
                      />
                      <div className="relative h-full flex flex-col items-center justify-center px-3 text-center">
                        <span className="text-white text-sm font-black leading-tight line-clamp-1">
                          {course.title}
                        </span>
                        <span className="text-white/80 text-[10px] font-bold mt-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/20">
                          دوره فنی و حرفه‌ای
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-text-primary group-hover:text-primary-600 transition-colors mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-text-tertiary mb-3 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-text-secondary mb-3">
                        {course.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {course.enrolledCount || 0}/{course.capacity || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-border-light">
                        <span className="text-xs text-text-secondary">{course.instituteName}</span>
                        <span className="text-sm font-black text-primary-600">
                          {course.price
                            ? Number(course.price).toLocaleString("fa-IR") + " تومان"
                            : "رایگان"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
