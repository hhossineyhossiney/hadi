/**
 * Course schedule calculation utilities.
 * Handles Jalali date arithmetic without external deps.
 */

// ═════════════════ Jalali ↔ Gregorian conversion (Borkowski) ═════════════════
function div(a: number, b: number) { return ~~(a / b); }

function gregorianToJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) + div(gy2 + 399, 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * div(days, 12053);
  days %= 12053;
  jy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) { jy += div(days - 1, 365); days = (days - 1) % 365; }
  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return [jy, jm, jd];
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy = jy <= 979 ? 621 : 1600;
  jy -= jy <= 979 ? 0 : 979;
  let days = 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) + 78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
  gy += 400 * div(days, 146097);
  days %= 146097;
  if (days > 36524) { gy += 100 * div(--days, 36524); days %= 36524; if (days >= 365) days++; }
  gy += 4 * div(days, 1461);
  days %= 1461;
  if (days > 365) { gy += div(days - 1, 365); days = (days - 1) % 365; }
  let gd = days + 1;
  const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 1; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
  return [gy, gm, gd];
}

// Days of week: 0=Saturday, 1=Sunday, ..., 6=Friday (Persian convention)
export const WEEKDAYS = [
  { key: "saturday",  label: "شنبه",     idx: 0 },
  { key: "sunday",    label: "یکشنبه",   idx: 1 },
  { key: "monday",    label: "دوشنبه",   idx: 2 },
  { key: "tuesday",   label: "سه‌شنبه",  idx: 3 },
  { key: "wednesday", label: "چهارشنبه", idx: 4 },
  { key: "thursday",  label: "پنجشنبه",  idx: 5 },
  { key: "friday",    label: "جمعه",     idx: 6 },
];

/** Get day-of-week (0=Sat..6=Fri) for a Jalali date */
export function jalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun..6=Sat
  return (jsDay + 1) % 7; // 0=Sat..6=Fri
}

/** Parse Persian date "1404/06/15" or "۱۴۰۴/۰۶/۱۵" */
export function parseJalaliDate(input: string): { jy: number; jm: number; jd: number } | null {
  if (!input) return null;
  const clean = String(input)
    .replace(/[۰-۹]/g, (d: string) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[-.]/g, "/");
  const parts = clean.split("/").map((p) => parseInt(p.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { jy: parts[0], jm: parts[1], jd: parts[2] };
}

/** Format Jalali as "YYYY/MM/DD" */
export function formatJalali(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`;
}

/** Add days to a Jalali date */
export function addDaysJalali(jy: number, jm: number, jd: number, days: number): [number, number, number] {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  const d = new Date(gy, gm - 1, gd);
  d.setDate(d.getDate() + days);
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

/**
 * Calculate course end date & session dates.
 * @param startDate      Jalali start date "1404/06/15"
 * @param scheduleDays   e.g., ["saturday","monday","wednesday"]
 * @param sessionDurationMinutes  e.g., 90 (minutes per session)
 * @param totalHours     e.g., 40 (total course hours)
 * @returns { totalSessions, endDate, sessionDates[] }
 */
export function calculateCourseSchedule(
  startDate: string,
  scheduleDays: string[],
  sessionDurationMinutes: number,
  totalHours: number
): {
  totalSessions: number;
  endDate: string | null;
  sessionDates: string[];
  error?: string;
} {
  const start = parseJalaliDate(startDate);
  if (!start) return { totalSessions: 0, endDate: null, sessionDates: [], error: "تاریخ شروع نامعتبر" };
  if (!scheduleDays || scheduleDays.length === 0) {
    return { totalSessions: 0, endDate: null, sessionDates: [], error: "روزهای برگزاری انتخاب نشده" };
  }
  if (!sessionDurationMinutes || sessionDurationMinutes <= 0) {
    return { totalSessions: 0, endDate: null, sessionDates: [], error: "مدت جلسه نامعتبر" };
  }
  if (!totalHours || totalHours <= 0) {
    return { totalSessions: 0, endDate: null, sessionDates: [], error: "کل ساعت دوره نامعتبر" };
  }

  const totalMinutes = totalHours * 60;
  const totalSessions = Math.ceil(totalMinutes / sessionDurationMinutes);

  // Convert scheduleDays to Set of dayOfWeek indices
  const selectedDayIdx = new Set<number>();
  for (const dayKey of scheduleDays) {
    const wd = WEEKDAYS.find((w) => w.key === dayKey);
    if (wd) selectedDayIdx.add(wd.idx);
  }
  if (selectedDayIdx.size === 0) {
    return { totalSessions, endDate: null, sessionDates: [], error: "روزهای برگزاری معتبر نیست" };
  }

  // Walk day-by-day from start date, collecting scheduled sessions
  const sessionDates: string[] = [];
  let [jy, jm, jd] = [start.jy, start.jm, start.jd];
  let safety = 0;
  const MAX_ITERATIONS = 365 * 3; // safeguard: 3 years max

  while (sessionDates.length < totalSessions && safety < MAX_ITERATIONS) {
    const dow = jalaliDayOfWeek(jy, jm, jd);
    if (selectedDayIdx.has(dow)) {
      sessionDates.push(formatJalali(jy, jm, jd));
    }
    [jy, jm, jd] = addDaysJalali(jy, jm, jd, 1);
    safety++;
  }

  const endDate = sessionDates.length > 0 ? sessionDates[sessionDates.length - 1] : null;

  return { totalSessions, endDate, sessionDates };
}

/** Format weekday keys for display: "شنبه، دوشنبه، چهارشنبه" */
export function formatScheduleDays(days: string[]): string {
  if (!days || days.length === 0) return "";
  return days.map((d) => WEEKDAYS.find((w) => w.key === d)?.label || "").filter(Boolean).join("، ");
}
