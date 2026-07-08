export interface CardTheme {
  gradient: string;
  badge: string;
  badgeSolid?: string;
  icon: string;
}

export const categoryThemes: Record<string, CardTheme> = {
  "کامپیوتر و فناوری اطلاعات": {
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
    badge: "bg-blue-50 text-blue-700",
    badgeSolid: "bg-blue-600",
    icon: "Monitor",
  },
  "خیاطی و طراحی لباس": {
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    badge: "bg-pink-50 text-pink-700",
    badgeSolid: "bg-pink-600",
    icon: "Scissors",
  },
  "خیاطی و طراحی دوخت": {
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    badge: "bg-pink-50 text-pink-700",
    badgeSolid: "bg-pink-600",
    icon: "Scissors",
  },
  "مراقبت و زیبایی": {
    gradient: "from-purple-600 via-violet-500 to-fuchsia-400",
    badge: "bg-purple-50 text-purple-700",
    badgeSolid: "bg-purple-600",
    icon: "Sparkles",
  },
  "خدمات تغذیه‌ای": {
    gradient: "from-amber-500 via-orange-500 to-red-400",
    badge: "bg-amber-50 text-amber-700",
    badgeSolid: "bg-amber-500",
    icon: "ChefHat",
  },
  "صنایع غذایی و آشپزی": {
    gradient: "from-amber-500 via-orange-500 to-red-400",
    badge: "bg-amber-50 text-amber-700",
    badgeSolid: "bg-amber-500",
    icon: "ChefHat",
  },
  "آموزش و زبان": {
    gradient: "from-emerald-600 via-green-500 to-teal-400",
    badge: "bg-emerald-50 text-emerald-700",
    badgeSolid: "bg-emerald-600",
    icon: "BookOpen",
  },
  "امور مالی و حسابداری": {
    gradient: "from-teal-600 via-cyan-500 to-sky-400",
    badge: "bg-teal-50 text-teal-700",
    badgeSolid: "bg-teal-600",
    icon: "Calculator",
  },
  "مکانیک، برق و الکترونیک": {
    gradient: "from-slate-700 via-slate-600 to-zinc-500",
    badge: "bg-slate-50 text-slate-700",
    badgeSolid: "bg-slate-700",
    icon: "Wrench",
  },
};

export const fallbackThemes: CardTheme[] = [
  { gradient: "from-blue-600 via-indigo-500 to-sky-400", badge: "bg-blue-50 text-blue-700", badgeSolid: "bg-blue-600", icon: "GraduationCap" },
  { gradient: "from-pink-600 via-rose-500 to-orange-400", badge: "bg-pink-50 text-pink-700", badgeSolid: "bg-pink-600", icon: "GraduationCap" },
  { gradient: "from-purple-600 via-violet-500 to-fuchsia-400", badge: "bg-purple-50 text-purple-700", badgeSolid: "bg-purple-600", icon: "GraduationCap" },
  { gradient: "from-amber-500 via-orange-500 to-red-400", badge: "bg-amber-50 text-amber-700", badgeSolid: "bg-amber-500", icon: "GraduationCap" },
  { gradient: "from-emerald-600 via-green-500 to-teal-400", badge: "bg-emerald-50 text-emerald-700", badgeSolid: "bg-emerald-600", icon: "GraduationCap" },
  { gradient: "from-cyan-600 via-sky-500 to-blue-400", badge: "bg-cyan-50 text-cyan-700", badgeSolid: "bg-cyan-600", icon: "GraduationCap" },
];

export function getTheme(categoryName?: string | null, index = 0): CardTheme {
  if (categoryName && categoryThemes[categoryName]) return categoryThemes[categoryName];
  return fallbackThemes[index % fallbackThemes.length];
}

export function getInstituteTheme(name: string, index = 0): CardTheme {
  if (name.includes("کامپیوتر") || name.includes("کتاب")) return categoryThemes["کامپیوتر و فناوری اطلاعات"];
  if (name.includes("خیاطی") || name.includes("دوخت") || name.includes("طراحی")) return categoryThemes["خیاطی و طراحی لباس"];
  if (name.includes("زیبایی") || name.includes("آکادمی") || name.includes("گریم") || name.includes("بهدخت") || name.includes("بانو")) return categoryThemes["مراقبت و زیبایی"];
  if (name.includes("تغذیه") || name.includes("آشپزی") || name.includes("طعم") || name.includes("قنادی")) return categoryThemes["خدمات تغذیه‌ای"];
  if (name.includes("زبان") || name.includes("آموزشی") || name.includes("دانایی") || name.includes("علم")) return categoryThemes["آموزش و زبان"];
  if (name.includes("حسابداری") || name.includes("مالی") || name.includes("بازرگانی") || name.includes("تراز")) return categoryThemes["امور مالی و حسابداری"];
  if (name.includes("برق") || name.includes("مکانیک") || name.includes("الکترون") || name.includes("صنعت") || name.includes("فنی")) return categoryThemes["مکانیک، برق و الکترونیک"];
  return fallbackThemes[index % fallbackThemes.length];
}
