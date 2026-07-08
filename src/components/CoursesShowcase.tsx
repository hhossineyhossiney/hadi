"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  ArrowUpDown,
  ChevronDown,
  GraduationCap,
} from "lucide-react";
import CourseCard, { CourseCardData } from "@/components/CourseCard";

interface Institute {
  id: number;
  name: string;
  slug: string;
  regionName?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Props {
  courses: CourseCardData[];
  categories: Category[];
  institutes: Institute[];
  limit?: number;
  showViewAll?: boolean;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
}

type SortKey = "popular" | "cheap" | "expensive";
type LevelKey = "all" | "beginner" | "intermediate" | "advanced" | "comprehensive";

const sortLabels: Record<SortKey, string> = {
  popular: "محبوب‌ترین و برگزیده‌ها",
  cheap: "ارزان‌ترین شهریه",
  expensive: "گران‌ترین شهریه",
};

function detectLevelKey(title: string, desc?: string | null): LevelKey {
  const text = `${title} ${desc || ""}`.toLowerCase();
  if (/جامع|از\s*صفر|صفر\s*تا\s*صد/i.test(text)) return "comprehensive";
  if (/پیشرفته|advanced|expert/i.test(text)) return "advanced";
  if (/متوسط|intermediate/i.test(text)) return "intermediate";
  if (/مقدماتی|پایه|basic|beginner|شروع/i.test(text)) return "beginner";
  return "all";
}

export default function CoursesShowcase({
  courses,
  categories,
  institutes,
  limit = 6,
  showViewAll = true,
  title = "جدیدترین دوره‌های مهارتی در زبرخان",
  subtitle = "با اعطای مدرک رسمی و معتبر سازمان آموزش فنی و حرفه‌ای کشور (قابل ترجمه و استعلام)",
  eyebrow = "LATEST COURSES",
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedInst, setSelectedInst] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("popular");
  const [sortOpen, setSortOpen] = useState(false);

  const displayCategories = categories.slice(0, 6);

  const filtered = useMemo(() => {
    let list = [...courses];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.instructor || "").toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }
    if (selectedCat) {
      list = list.filter((c) => c.categoryName === selectedCat);
    }
    if (selectedInst) {
      list = list.filter((c) => c.instituteSlug === selectedInst);
    }
    if (selectedLevel !== "all") {
      list = list.filter((c) => detectLevelKey(c.title, c.description) === selectedLevel);
    }
    if (sortBy === "cheap") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "expensive") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else {
      list.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    }
    return list;
  }, [courses, query, selectedCat, selectedInst, selectedLevel, sortBy]);

  return (
    <section className="py-12 bg-bg-primary relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-100/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-primary-600 tracking-[0.2em] uppercase mb-3 block">
              {eyebrow}
            </span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-black text-text-primary mb-2"
            >
              {title}
            </motion.h2>
            <p className="text-text-secondary text-sm">{subtitle}</p>
          </div>

          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 bg-surface hover:bg-primary-50 border border-border-default hover:border-primary-300 rounded-[14px] px-4 py-3 text-sm font-black text-text-primary transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-primary-500" />
              <span className="text-text-tertiary text-xs">مرتب‌سازی بر اساس:</span>
              <span>{sortLabels[sortBy]}</span>
              <ChevronDown
                className={`w-4 h-4 text-text-tertiary transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {sortOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-[12px] bg-surface border border-border-default shadow-xl z-20 overflow-hidden">
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setSortBy(k);
                      setSortOpen(false);
                    }}
                    className={`w-full text-right px-4 py-3 text-sm font-bold transition-colors ${
                      sortBy === k
                        ? "bg-primary-50 text-primary-700"
                        : "hover:bg-bg-secondary text-text-secondary"
                    }`}
                  >
                    {sortLabels[k]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {displayCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedCat("")}
              className={`px-4 py-2 rounded-[12px] text-xs font-black transition-all ${
                selectedCat === ""
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                  : "bg-surface border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
              }`}
            >
              همه رشته‌ها
            </button>
            {displayCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCat(selectedCat === c.name ? "" : c.name)}
                className={`px-4 py-2 rounded-[12px] text-xs font-black transition-all ${
                  selectedCat === c.name
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                    : "bg-surface border border-border-default text-text-secondary hover:border-primary-300 hover:text-primary-600"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="bg-surface border border-border-default rounded-[18px] p-3 flex flex-col sm:flex-row gap-2.5 mb-8 shadow-sm">
          <div className="flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-[12px] bg-bg-secondary">
            <Search className="w-4 h-4 text-primary-400 shrink-0" />
            <input
              type="text"
              placeholder="جستجو در عنوان دوره، مدرس یا سرفصل..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary text-text-primary"
            />
          </div>
          <select
            value={selectedInst}
            onChange={(e) => setSelectedInst(e.target.value)}
            className="px-4 py-2.5 rounded-[12px] bg-bg-secondary text-sm outline-none text-text-secondary cursor-pointer min-w-[200px] font-medium"
          >
            <option value="">همه آموزشگاه‌های زبرخان</option>
            {institutes.map((i) => (
              <option key={i.id} value={i.slug}>
                {i.name} {i.regionName ? `(${i.regionName})` : ""}
              </option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as LevelKey)}
            className="px-4 py-2.5 rounded-[12px] bg-bg-secondary text-sm outline-none text-text-secondary cursor-pointer min-w-[150px] font-medium"
          >
            <option value="all">همه سطوح آموزشی</option>
            <option value="beginner">مقدماتی</option>
            <option value="intermediate">متوسط</option>
            <option value="advanced">پیشرفته</option>
            <option value="comprehensive">جامع از صفر تا صد</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-surface rounded-[20px] border border-border-default">
            <GraduationCap className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-40" />
            <p className="text-text-secondary text-sm">
              دوره‌ای با این فیلترها یافت نشد. فیلترها را تغییر دهید.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(limit && limit > 0 ? filtered.slice(0, limit) : filtered).map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}

        {showViewAll && (
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {limit && limit > 0 && filtered.length > limit && (
              <p className="text-text-tertiary text-xs">
                نمایش {limit} از {filtered.length} دوره
              </p>
            )}
            <Link
              href="/courses"
              className="flex items-center gap-2 px-6 py-3 rounded-[14px] bg-primary-600 hover:bg-primary-700 text-white font-black text-sm transition-all shadow-lg shadow-primary-600/25 group"
            >
              مشاهده همه دوره‌ها
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
        {!showViewAll && limit === 0 && (
          <div className="mt-8 text-center text-text-tertiary text-sm">
            نمایش {filtered.length} از {courses.length} دوره
          </div>
        )}
      </div>
    </section>
  );
}
