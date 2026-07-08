import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { db } from "@/db";
import { categories, courses, institutes } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";
import {
  Monitor,
  Scissors,
  Sparkles,
  ChefHat,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Monitor: <Monitor className="w-8 h-8" />,
  Scissors: <Scissors className="w-8 h-8" />,
  Sparkles: <Sparkles className="w-8 h-8" />,
  ChefHat: <ChefHat className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
};

const imageMap: Record<string, string> = {
  computer: "/images/cat-computer.jpg",
  tailoring: "/images/cat-tailoring.jpg",
  beauty: "/images/cat-beauty.jpg",
  culinary: "/images/cat-culinary.jpg",
  education: "/images/cat-education.jpg",
};

export const dynamic = "force-dynamic";

export default async function FieldsPage() {
  const cats = await db.select().from(categories).orderBy(categories.name);

  const catsWithCounts = await Promise.all(
    cats.map(async (cat) => {
      const courseCount = await db
        .select({ count: count() })
        .from(courses)
        .where(eq(courses.categoryId, cat.id))
        .then((res) => res[0]?.count || 0);
      const instituteCount = await db
        .select({ count: count() })
        .from(courses)
        .leftJoin(institutes, eq(courses.instituteId, institutes.id))
        .where(eq(courses.categoryId, cat.id))
        .then((res) => res.length);
      return { ...cat, courseCount, instituteCount };
    })
  );

  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">
              FIELDS
            </span>
            <h1 className="text-4xl font-black text-text-primary mb-3">رشته‌های آموزشی</h1>
            <p className="text-text-secondary text-lg">
              رشته مورد نظر خود را انتخاب و در بهترین آموزشگاه‌ها ثبت‌نام کنید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {catsWithCounts.map((cat) => (
              <Link
                key={cat.id}
                href={`/fields/${cat.slug}`}
                className="group block bg-surface rounded-[24px] border border-border-default hover:border-primary-200 hover-lift transition-all duration-500 overflow-hidden"
              >
                <div className="h-44 relative overflow-hidden">
                  <img
                    src={imageMap[cat.slug] || "/images/hero-bg.jpg"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div
                    className="absolute top-4 right-4 w-12 h-12 rounded-[14px] flex items-center justify-center backdrop-blur-md border border-white/20"
                    style={{ backgroundColor: `${cat.color}CC`, color: "#fff" }}
                  >
                    {iconMap[cat.icon || ""] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <div className="absolute bottom-4 right-4 left-4">
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <p className="text-white/70 text-sm line-clamp-1">{cat.description}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm mb-5">
                    <span className="text-primary-600 font-bold bg-primary-50 px-3 py-1 rounded-full">
                      {cat.courseCount} دوره
                    </span>
                    <span className="text-text-tertiary">{cat.instituteCount} آموزشگاه</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-600 font-bold group-hover:gap-3 transition-all">
                    <span>مشاهده دوره‌ها</span>
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
