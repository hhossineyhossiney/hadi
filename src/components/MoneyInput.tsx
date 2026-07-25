"use client";
import { Wallet } from "lucide-react";

// Convert Persian/Arabic digits to English for internal storage
const toEnglishDigits = (str: string): string => {
  const persianMap: Record<string, string> = {
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
  };
  return str.replace(/[۰-۹٠-٩]/g, (d) => persianMap[d] || d);
};

// Convert English digits to Persian
const toPersianDigits = (str: string): string => {
  const map: Record<string, string> = { "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴", "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹" };
  return str.replace(/[0-9]/g, (d) => map[d] || d);
};

// Format number with commas and Persian digits
const formatMoney = (value: string): string => {
  const clean = toEnglishDigits(String(value || "")).replace(/[^0-9]/g, "");
  if (!clean) return "";
  const withCommas = clean.replace(/\B(?=(\d{3})+(?!\d))/g, "،");
  return toPersianDigits(withCommas);
};

// Persian number to word (for tooltip like "۲ میلیون تومان")
export const formatMoneyWord = (value: string | number): string => {
  const num = Number(toEnglishDigits(String(value || "")).replace(/[^0-9]/g, ""));
  if (!num) return "";
  if (num >= 1_000_000_000) return toPersianDigits((num / 1_000_000_000).toFixed(1).replace(/\.0$/, "")) + " میلیارد تومان";
  if (num >= 1_000_000) return toPersianDigits((num / 1_000_000).toFixed(1).replace(/\.0$/, "")) + " میلیون تومان";
  if (num >= 1000) return toPersianDigits((num / 1000).toFixed(0)) + " هزار تومان";
  return toPersianDigits(String(num)) + " تومان";
};

interface Props {
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showWord?: boolean; // show "۲ میلیون تومان" hint under input
}

export default function MoneyInput({
  value,
  onChange,
  placeholder = "مبلغ به تومان",
  required,
  className = "",
  disabled,
  showWord = true,
}: Props) {
  const display = formatMoney(String(value || ""));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toEnglishDigits(e.target.value).replace(/[^0-9]/g, "");
    onChange(raw); // store clean English digits
  };

  const word = showWord && value ? formatMoneyWord(value) : "";

  return (
    <div className="relative w-full min-w-0">
      <input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        onFocus={(event) => event.currentTarget.select()}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        required={required}
        disabled={disabled}
        dir="ltr"
        className={`h-12 w-full min-w-0 rounded-[12px] border border-white/10 bg-[#0B1120] py-3 pr-4 pl-16 text-right text-sm font-bold text-white placeholder:text-slate-500 sm:pl-20 ${className}`}
        style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif" }}
      />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
        <span className="text-[11px] font-black text-emerald-400">تومان</span>
        <Wallet className="w-3.5 h-3.5 text-emerald-500" />
      </div>
      {word && (
        <div className="text-[10px] font-bold text-emerald-300 mt-1 px-1">
          ≈ {word}
        </div>
      )}
    </div>
  );
}
