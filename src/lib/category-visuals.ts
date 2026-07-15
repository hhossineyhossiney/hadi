// Central mapping of category → image + icon + color palette
// Auto-selects visuals based on keywords in the category or course title/description

export interface CategoryVisual {
  key: string;
  keywords: RegExp;
  image: string; // Unsplash URL (photo IDs, always available)
  icon: string; // emoji fallback + used as decorative
  palette: {
    glowFrom: string;
    glowTo: string;
    accent: string; // tailwind text color
    badge: string;
    button: string; // tailwind gradient tail
    bookmark: string;
  };
}

// Palettes reused across visuals
const PAL = {
  fuchsia: {
    glowFrom: "rgba(168, 85, 247, 0.55)",
    glowTo: "rgba(236, 72, 153, 0.35)",
    accent: "text-fuchsia-300",
    badge: "bg-fuchsia-500/20 border-fuchsia-400/40 text-fuchsia-200",
    button: "from-fuchsia-500 via-purple-500 to-pink-500",
    bookmark: "text-fuchsia-300",
  },
  blue: {
    glowFrom: "rgba(59, 130, 246, 0.55)",
    glowTo: "rgba(14, 165, 233, 0.35)",
    accent: "text-cyan-300",
    badge: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200",
    button: "from-blue-500 via-cyan-500 to-sky-500",
    bookmark: "text-cyan-300",
  },
  pink: {
    glowFrom: "rgba(236, 72, 153, 0.55)",
    glowTo: "rgba(244, 63, 94, 0.35)",
    accent: "text-pink-300",
    badge: "bg-pink-500/20 border-pink-400/40 text-pink-200",
    button: "from-pink-500 via-rose-500 to-red-500",
    bookmark: "text-pink-300",
  },
  amber: {
    glowFrom: "rgba(245, 158, 11, 0.55)",
    glowTo: "rgba(217, 119, 6, 0.35)",
    accent: "text-amber-300",
    badge: "bg-amber-500/20 border-amber-400/40 text-amber-200",
    button: "from-amber-500 via-yellow-500 to-orange-500",
    bookmark: "text-amber-300",
  },
  emerald: {
    glowFrom: "rgba(16, 185, 129, 0.55)",
    glowTo: "rgba(20, 184, 166, 0.35)",
    accent: "text-emerald-300",
    badge: "bg-emerald-500/20 border-emerald-400/40 text-emerald-200",
    button: "from-emerald-500 via-teal-500 to-cyan-500",
    bookmark: "text-emerald-300",
  },
  indigo: {
    glowFrom: "rgba(99, 102, 241, 0.55)",
    glowTo: "rgba(139, 92, 246, 0.35)",
    accent: "text-indigo-300",
    badge: "bg-indigo-500/20 border-indigo-400/40 text-indigo-200",
    button: "from-indigo-500 via-violet-500 to-purple-500",
    bookmark: "text-indigo-300",
  },
  red: {
    glowFrom: "rgba(239, 68, 68, 0.55)",
    glowTo: "rgba(219, 39, 119, 0.35)",
    accent: "text-red-300",
    badge: "bg-red-500/20 border-red-400/40 text-red-200",
    button: "from-red-500 via-rose-500 to-pink-500",
    bookmark: "text-red-300",
  },
  teal: {
    glowFrom: "rgba(20, 184, 166, 0.55)",
    glowTo: "rgba(59, 130, 246, 0.35)",
    accent: "text-teal-300",
    badge: "bg-teal-500/20 border-teal-400/40 text-teal-200",
    button: "from-teal-500 via-cyan-500 to-blue-500",
    bookmark: "text-teal-300",
  },
} as const;

// Curated Unsplash images (permanent URLs, no attribution required)
// Format: https://images.unsplash.com/photo-{ID}?w=400&q=80&auto=format&fit=crop
const IMG = (id: string, size = 400) =>
  `https://images.unsplash.com/photo-${id}?w=${size}&q=80&auto=format&fit=crop`;

export const CATEGORY_VISUALS: CategoryVisual[] = [
  // ─── BEAUTY / آرایشگری / زیبایی ─────────────────
  {
    key: "hair_braid",
    keywords: /(بافت\s*مو|بافت|شینیون|مو\s*زنانه)/i,
    // Image: braided hair from behind
    image: IMG("1519699047748-de8e457a634e"),
    icon: "🎀",
    palette: PAL.fuchsia,
  },
  {
    key: "lash_extension",
    keywords: /(اکستنشن\s*مژه|مژه|lash)/i,
    image: IMG("1583241800698-e8ab01830a07"),
    icon: "👁️",
    palette: PAL.indigo,
  },
  {
    key: "hair_cut",
    keywords: /(کوتاهی|کوتاه\s*مو|hair\s*cut|آرایش\s*مو|رنگ\s*مو|میکاپ|میکآپ)/i,
    image: IMG("1560066984-138dadb4c035"),
    icon: "💇‍♀️",
    palette: PAL.pink,
  },
  {
    key: "nail",
    keywords: /(ناخن|کاشت\s*ناخن|مانیکور|پدیکور|nail)/i,
    image: IMG("1604654894610-df63bc536371"),
    icon: "💅",
    palette: PAL.amber,
  },
  {
    key: "makeup",
    keywords: /(آرایش|میکاپ|makeup|میک\s*آپ)/i,
    image: IMG("1522337660859-02fbefca4702"),
    icon: "💄",
    palette: PAL.pink,
  },
  {
    key: "skincare",
    keywords: /(پوست|مراقبت\s*پوست|فیشیال|facial)/i,
    image: IMG("1570172619644-dfd03ed5d881"),
    icon: "✨",
    palette: PAL.pink,
  },
  {
    key: "beauty_general",
    keywords: /(زیبایی|beauty|مراقبت)/i,
    image: IMG("1487412720507-e7ab37603c6f"),
    icon: "💖",
    palette: PAL.pink,
  },

  // ─── COMPUTER / IT ─────────────────
  {
    key: "icdl",
    keywords: /(icdl|آی\s*سی\s*دی\s*ال)/i,
    image: IMG("1516321318423-f06f85e504b3"),
    icon: "💻",
    palette: PAL.blue,
  },
  {
    key: "photoshop",
    keywords: /(فتوشاپ|photoshop|طراحی\s*گرافیک|graphic)/i,
    image: IMG("1611532736597-de2d4265fba3"),
    icon: "🎨",
    palette: PAL.indigo,
  },
  {
    key: "web_dev",
    keywords: /(وب|web|html|css|javascript|react|next|فرانت)/i,
    image: IMG("1461749280684-dccba630e2f6"),
    icon: "🌐",
    palette: PAL.blue,
  },
  {
    key: "programming",
    keywords: /(برنامه\s*نویسی|python|پایتون|java|programming|کدنویسی)/i,
    image: IMG("1517694712202-14dd9538aa97"),
    icon: "⌨️",
    palette: PAL.indigo,
  },
  {
    key: "office",
    keywords: /(office|word|excel|powerpoint|اکسل|ورد|پاورپوینت)/i,
    image: IMG("1454165804606-c3d57bc86b40"),
    icon: "📊",
    palette: PAL.blue,
  },
  {
    key: "computer_general",
    keywords: /(کامپیوتر|فناوری|it|رایانه)/i,
    image: IMG("1498050108023-c5249f4df085"),
    icon: "💻",
    palette: PAL.blue,
  },

  // ─── SEWING / خیاطی ─────────────────
  {
    key: "sewing",
    keywords: /(خیاطی|طراحی\s*لباس|دوخت|sewing|خیاط|لباس|پوشاک)/i,
    // Sewing machine / fabric
    image: IMG("1594736797933-d0501ba2fe65"),
    icon: "🧵",
    palette: PAL.fuchsia,
  },
  {
    key: "fashion_design",
    keywords: /(طراحی\s*مد|fashion|مد)/i,
    image: IMG("1558769132-cb1aea458c5e"),
    icon: "👗",
    palette: PAL.pink,
  },

  // ─── COOKING / آشپزی ─────────────────
  {
    key: "pastry",
    keywords: /(شیرینی|قنادی|pastry|کیک|cake)/i,
    image: IMG("1587248720327-8eb72564be1e"),
    icon: "🧁",
    palette: PAL.amber,
  },
  {
    key: "cooking",
    keywords: /(آشپزی|cook|طباخی|غذا)/i,
    image: IMG("1556909114-f6e7ad7d3136"),
    icon: "🍳",
    palette: PAL.amber,
  },
  {
    key: "nutrition",
    keywords: /(تغذیه|nutrition|رژیم|diet)/i,
    image: IMG("1490645935967-10de6ba17061"),
    icon: "🥗",
    palette: PAL.emerald,
  },
  {
    key: "barista",
    keywords: /(باریستا|قهوه|coffee|barista)/i,
    image: IMG("1495474472287-4d71bcdd2085"),
    icon: "☕",
    palette: PAL.amber,
  },

  // ─── LANGUAGE / زبان ─────────────────
  {
    key: "english",
    keywords: /(انگلیسی|english|ielts|toefl|آیلتس|تافل)/i,
    image: IMG("1503676260728-1c00da094a0b"),
    icon: "🗣️",
    palette: PAL.emerald,
  },
  {
    key: "language",
    keywords: /(زبان|language|عربی|فرانسه|آلمانی|ترکی)/i,
    image: IMG("1546410531-bb4caa6b424d"),
    icon: "🌍",
    palette: PAL.teal,
  },

  // ─── ACCOUNTING / حسابداری ─────────
  {
    key: "accounting",
    keywords: /(حسابداری|accounting|هلو|مالی|بورس)/i,
    image: IMG("1554224155-6726b3ff858f"),
    icon: "📈",
    palette: PAL.emerald,
  },

  // ─── PHOTOGRAPHY / عکاسی ─────────
  {
    key: "photography",
    keywords: /(عکاسی|photo|photography|فیلمبرداری)/i,
    image: IMG("1502920917128-1aa500764cbd"),
    icon: "📷",
    palette: PAL.indigo,
  },

  // ─── MUSIC / موسیقی ─────────
  {
    key: "music",
    keywords: /(موسیقی|music|پیانو|گیتار|آواز)/i,
    image: IMG("1511671782779-c97d3d27a1d4"),
    icon: "🎵",
    palette: PAL.indigo,
  },

  // ─── SPORT / ورزش ─────────
  {
    key: "fitness",
    keywords: /(ورزش|بدنسازی|fitness|یوگا|تناسب)/i,
    image: IMG("1571019613454-1cb2f99b2d8b"),
    icon: "💪",
    palette: PAL.red,
  },

  // ─── ART / هنر ─────────
  {
    key: "art",
    keywords: /(نقاشی|هنر|art|paint)/i,
    image: IMG("1513475382585-d06e58bcb0e0"),
    icon: "🎨",
    palette: PAL.fuchsia,
  },

  // ─── BUSINESS ─────────
  {
    key: "business",
    keywords: /(کسب\s*و\s*کار|بازاریابی|marketing|مدیریت|business)/i,
    image: IMG("1507003211169-0a1dd7228f2d"),
    icon: "💼",
    palette: PAL.blue,
  },

  // ─── ELECTRIC / برق ─────────
  {
    key: "electric",
    keywords: /(برق|electric|سیم\s*کشی|electrical)/i,
    image: IMG("1621905251189-08b45d6a269e"),
    icon: "⚡",
    palette: PAL.amber,
  },

  // ─── MECHANIC ─────────
  {
    key: "mechanic",
    keywords: /(مکانیک|خودرو|automotive|mechanic|تعمیر)/i,
    image: IMG("1486262715619-67b85e0b08d3"),
    icon: "🔧",
    palette: PAL.red,
  },

  // ─── EDUCATION generic ─────────
  {
    key: "education",
    keywords: /(آموزش|education|training|تدریس)/i,
    image: IMG("1503676260728-1c00da094a0b"),
    icon: "🎓",
    palette: PAL.indigo,
  },
];

// Rotating fallback for when nothing matches
const FALLBACKS: CategoryVisual[] = [
  {
    key: "generic_purple",
    keywords: /.*/,
    image: IMG("1543269865-cbf427effbad"),
    icon: "📚",
    palette: PAL.fuchsia,
  },
  {
    key: "generic_blue",
    keywords: /.*/,
    image: IMG("1481627834876-b7833e8f5570"),
    icon: "🎓",
    palette: PAL.blue,
  },
  {
    key: "generic_pink",
    keywords: /.*/,
    image: IMG("1523240795612-9a054b0db644"),
    icon: "✨",
    palette: PAL.pink,
  },
];

/**
 * Find best visual for a category/course by matching keywords in given texts.
 * Prefers earlier match. Falls back to rotating default.
 */
export function pickCategoryVisual(
  ...texts: (string | null | undefined)[]
): CategoryVisual {
  const combined = texts.filter(Boolean).join(" ").toLowerCase();
  if (combined.trim()) {
    for (const v of CATEGORY_VISUALS) {
      if (v.keywords.test(combined)) return v;
    }
  }
  // Fallback rotates on hash of first non-empty text
  const seed = (texts.find(Boolean) || "0").toString();
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return FALLBACKS[h % FALLBACKS.length];
}
