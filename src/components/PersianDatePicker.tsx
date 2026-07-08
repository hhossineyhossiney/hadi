"use client";
import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronRight, ChevronLeft, X } from "lucide-react";

// ============ Jalali (Persian) date conversion (Gregorian ↔ Jalali) ============
// Based on Kazimierz M. Borkowski's algorithm — accurate, no dependencies

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

function isJalaliLeap(jy: number): boolean {
  const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178];
  let jp = breaks[0];
  let jump = 0;
  for (let i = 1; i < breaks.length; i++) {
    const jm = breaks[i]; jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;
  if (n < jump) { if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33; const leap = (((n + 1) % 33) - 1) % 4; return leap === -1 || leap === 3; }
  return false;
}

function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return isJalaliLeap(jy) ? 30 : 29;
}

const PERSIAN_MONTHS = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
const PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"]; // Saturday first

const toPersianDigits = (str: string | number): string => {
  const map: Record<string, string> = { "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴", "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹" };
  return String(str).replace(/[0-9]/g, (d) => map[d] || d);
};

const toEnglishDigits = (str: string): string => {
  const map: Record<string, string> = { "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9" };
  return str.replace(/[۰-۹]/g, (d) => map[d] || d);
};

// Parse an existing value ("۱۴۰۳/۰۵/۱۵" or "1403/05/15" or "1403-5-15")
function parseJalali(input: string): { jy: number; jm: number; jd: number } | null {
  if (!input) return null;
  const clean = toEnglishDigits(input).replace(/[-.]/g, "/");
  const parts = clean.split("/").map((p) => parseInt(p.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { jy: parts[0], jm: parts[1], jd: parts[2] };
}

// Get Gregorian day-of-week for a Jalali date (0=Sat, 6=Fri per Persian convention)
function jalaliDayOfWeek(jy: number, jm: number, jd: number): number {
  const [gy, gm, gd] = jalaliToGregorian(jy, jm, jd);
  const jsDay = new Date(gy, gm - 1, gd).getDay(); // 0=Sun ... 6=Sat
  return (jsDay + 1) % 7; // 0=Sat, 1=Sun, ..., 6=Fri
}

interface Props {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function PersianDatePicker({
  value = "",
  onChange,
  placeholder = "انتخاب تاریخ",
  required,
  className = "",
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Today in Jalali
  const now = new Date();
  const [ty, tm] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Current view month/year (calendar navigation)
  const parsed = parseJalali(value);
  const [viewY, setViewY] = useState(parsed?.jy || ty);
  const [viewM, setViewM] = useState(parsed?.jm || tm);
  const selected = parsed;

  useEffect(() => {
    if (parsed) {
      setViewY(parsed.jy);
      setViewM(parsed.jm);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const displayValue = value ? toPersianDigits(value.replace(/-/g, "/")) : "";

  const daysInMonth = daysInJalaliMonth(viewY, viewM);
  const firstWeekday = jalaliDayOfWeek(viewY, viewM, 1);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const goPrevMonth = () => {
    if (viewM === 1) { setViewM(12); setViewY(viewY - 1); }
    else setViewM(viewM - 1);
  };
  const goNextMonth = () => {
    if (viewM === 12) { setViewM(1); setViewY(viewY + 1); }
    else setViewM(viewM + 1);
  };
  const goPrevYear = () => setViewY(viewY - 1);
  const goNextYear = () => setViewY(viewY + 1);

  const selectDay = (d: number) => {
    const formatted = `${viewY}/${String(viewM).padStart(2, "0")}/${String(d).padStart(2, "0")}`;
    onChange(formatted);
    setOpen(false);
  };

  const clearValue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      <div
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full px-4 py-3 pr-11 rounded-[12px] border border-white/10 bg-[#0B1120] text-sm font-bold text-white cursor-pointer flex items-center justify-between gap-2 ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary-500/50"}`}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="w-4 h-4 text-primary-400 shrink-0" />
          <span className={displayValue ? "text-white" : "text-slate-500"}>
            {displayValue || placeholder}
          </span>
        </div>
        {displayValue && !disabled && (
          <button type="button" onClick={clearValue} className="p-1 rounded hover:bg-white/10 shrink-0" title="پاک کن">
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value || ""}
          onChange={() => {}}
          required
          tabIndex={-1}
          aria-hidden
          style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        />
      )}

      {open && !disabled && (
        <div
          className="absolute z-[100] top-full mt-2 right-0 bg-[#111a2e] border border-white/20 rounded-[16px] shadow-2xl p-3 w-[290px]"
          style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
        >
          {/* Header — year/month nav */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={goPrevYear} className="p-1.5 rounded-[8px] hover:bg-white/10 text-slate-300" title="سال قبل">
                <ChevronRight className="w-4 h-4" />
                <ChevronRight className="w-4 h-4 -mt-3.5 -mr-1" />
              </button>
              <button type="button" onClick={goPrevMonth} className="p-1.5 rounded-[8px] hover:bg-white/10 text-slate-300" title="ماه قبل">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm font-black text-white">
              {PERSIAN_MONTHS[viewM - 1]} {toPersianDigits(viewY)}
            </div>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={goNextMonth} className="p-1.5 rounded-[8px] hover:bg-white/10 text-slate-300" title="ماه بعد">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" onClick={goNextYear} className="p-1.5 rounded-[8px] hover:bg-white/10 text-slate-300" title="سال بعد">
                <ChevronLeft className="w-4 h-4" />
                <ChevronLeft className="w-4 h-4 -mt-3.5 -ml-1" />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {PERSIAN_WEEKDAYS.map((wd, i) => (
              <div key={i} className={`text-center text-[10px] font-black py-1.5 ${i === 6 ? "text-error-400" : "text-slate-400"}`}>
                {wd}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const isToday = d === parseInt(String(new Date().getDate())) && viewY === ty && viewM === tm && d === (() => {
                const [_, __, td] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
                return td;
              })();
              const isSelected = selected && selected.jy === viewY && selected.jm === viewM && selected.jd === d;
              const isFriday = i % 7 === 6;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => selectDay(d)}
                  className={`aspect-square rounded-[8px] text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                      : isToday
                        ? "bg-primary-500/20 text-primary-300 ring-1 ring-primary-500/40"
                        : isFriday
                          ? "text-error-400 hover:bg-white/5"
                          : "text-white hover:bg-white/5"
                  }`}
                >
                  {toPersianDigits(d)}
                </button>
              );
            })}
          </div>

          {/* Footer — quick today button */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                const [tyN, tmN, tdN] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
                onChange(`${tyN}/${String(tmN).padStart(2, "0")}/${String(tdN).padStart(2, "0")}`);
                setOpen(false);
              }}
              className="px-3 py-1.5 rounded-[8px] bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-black"
            >
              امروز
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-[8px] bg-white/10 hover:bg-white/20 text-white text-[11px] font-black"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
