"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InstituteCard from "@/components/InstituteCard";
import CourseCard from "@/components/CourseCard";
import {
  Search,
  MapPin,
  BookOpen,
  ArrowUpDown,
  Building2,
  GraduationCap,
} from "lucide-react";

interface Institute {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  description?: string | null;
  phone: string | null;
  mobile: string | null;
  rating: string | null;
  reviewCount: number | null;
  isVerified: boolean | null;
  regionName: string | null;
  courseCount: number;
  logo?: string | null;
  profilePhoto?: string | null;
  bannerImages?: unknown;
  accessCode?: string | null;
  licenseNumber?: string | null;
  managerName?: string | null;
  managerTitle?: string | null;
  features?: string[] | null;
  isYearAward?: boolean | null;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fullDescription?: string | null;
  duration: string | null;
  price: string | null;
  originalPrice?: string | null;
  capacity: number | null;
  enrolledCount: number | null;
  instructor: string | null;
  startDate?: string | null;
  image?: string | null;
  categoryName: string | null;
  categorySlug?: string | null;
  instituteName: string | null;
  instituteSlug: string | null;
  regionName: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const initialRegion = searchParams.get("region") || "";
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState(initialQ);
  const [region, setRegion] = useState(initialRegion);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"popular" | "cheap" | "expensive">("popular");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [instRes, courseRes] = await Promise.all([
        fetch(`/api/institutes?q=${encodeURIComponent(query)}&region=${region}`),
        fetch(`/api/courses?q=${encodeURIComponent(query)}`),
      ]);
      const instData = await instRes.json();
      const courseData = await courseRes.json();
      setInstitutes(instData);
      setCourses(courseData);
      setLoading(false);
    }
    fetchData();
  }, [query, region]);

  const filteredSortedCourses = useMemo(() => {
    let list = [...courses];
    if (category) {
      list = list.filter(
        (c) =>
          c.categorySlug === category ||
          (c.categoryName &&
            categories.find((cc) => cc.slug === category)?.name === c.categoryName)
      );
    }
    if (sortBy === "cheap") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "expensive") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      list.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    }
    return list;
  }, [courses, category, sortBy, categories]);

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">
            SEARCH
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary mb-4">
            جستجو در دوره‌ها و آموزشگاه‌ها
          </h1>
          <div className="bg-surface rounded-[24px] shadow-lg border border-border-default p-4 flex flex-col lg:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-[16px] bg-bg-secondary">
              <Search className="w-5 h-5 text-primary-400 shrink-0" />
              <input
                type="text"
                placeholder="جستجوی رشته، دوره یا آموزشگاه..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary text-text-primary"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-[16px] bg-bg-secondary">
              <MapPin className="w-4 h-4 text-primary-400" />
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="bg-transparent text-sm outline-none text-text-secondary cursor-pointer min-w-[100px]"
              >
                <option value="">همه مناطق</option>
                <option value="qadamgah">قدمگاه</option>
                <option value="dorud">درود</option>
                <option value="eshaqabad">اسحاق‌آباد</option>
                <option value="khor">خور</option>
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-[16px] bg-bg-secondary">
              <BookOpen className="w-4 h-4 text-primary-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-transparent text-sm outline-none text-text-secondary cursor-pointer min-w-[120px]"
              >
                <option value="">همه رشته‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {institutes.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-primary-600" />
                  <h2 className="text-xl font-black text-text-primary">
                    آموزشگاه‌ها ({institutes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {institutes.map((inst, i) => (
                    <InstituteCard
                      key={inst.id}
                      institute={{
                        ...inst,
                        licenseNumber: inst.licenseNumber || null,
                        managerName: inst.managerName
                          ? (inst.managerTitle ? `${inst.managerTitle} ${inst.managerName}` : inst.managerName)
                          : null,
                      }}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredSortedCourses.length > 0 && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary-600" />
                    <h2 className="text-xl font-black text-text-primary">
                      دوره‌ها ({filteredSortedCourses.length})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 bg-surface border border-border-default rounded-[14px] p-1.5">
                    <ArrowUpDown className="w-4 h-4 text-text-tertiary mx-2" />
                    <button
                      onClick={() => setSortBy("popular")}
                      className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all ${
                        sortBy === "popular"
                          ? "bg-primary-600 text-white"
                          : "text-text-secondary hover:bg-primary-50"
                      }`}
                    >
                      محبوب‌ترین
                    </button>
                    <button
                      onClick={() => setSortBy("cheap")}
                      className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all ${
                        sortBy === "cheap"
                          ? "bg-primary-600 text-white"
                          : "text-text-secondary hover:bg-primary-50"
                      }`}
                    >
                      ارزان‌ترین
                    </button>
                    <button
                      onClick={() => setSortBy("expensive")}
                      className={`px-3 py-1.5 rounded-[10px] text-[11px] font-bold transition-all ${
                        sortBy === "expensive"
                          ? "bg-primary-600 text-white"
                          : "text-text-secondary hover:bg-primary-50"
                      }`}
                    >
                      گران‌ترین
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-7">
                  {filteredSortedCourses.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                  ))}
                </div>
              </div>
            )}

            {institutes.length === 0 && filteredSortedCourses.length === 0 && (
              <div className="text-center py-20 bg-surface rounded-[24px] border border-border-default">
                <Search className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-40" />
                <p className="text-text-secondary text-lg font-bold">نتیجه‌ای یافت نشد</p>
                <p className="text-text-tertiary mt-2 text-sm">
                  لطفاً عبارت دیگری را امتحان کنید یا فیلترها را تغییر دهید
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-bg-secondary">
      <Navbar />
      <Suspense
        fallback={
          <div className="pt-28 pb-20 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full" />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
