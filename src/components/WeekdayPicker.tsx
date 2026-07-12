"use client";
import { WEEKDAYS } from "@/lib/schedule";

interface Props {
  value: string[]; // ["saturday", "monday", ...]
  onChange: (days: string[]) => void;
  disabled?: boolean;
}

export default function WeekdayPicker({ value, onChange, disabled }: Props) {
  const toggle = (dayKey: string) => {
    if (disabled) return;
    if (value.includes(dayKey)) {
      onChange(value.filter((d) => d !== dayKey));
    } else {
      onChange([...value, dayKey]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {WEEKDAYS.map((w) => {
        const active = value.includes(w.key);
        const isFriday = w.key === "friday";
        return (
          <button
            key={w.key}
            type="button"
            onClick={() => toggle(w.key)}
            disabled={disabled}
            className={`px-3 py-2 rounded-[10px] text-xs font-black transition-all cursor-pointer border-2 ${
              active
                ? "bg-primary-600 text-white border-primary-500 shadow-lg shadow-primary-600/25"
                : isFriday
                  ? "bg-error-500/10 text-error-400 border-error-500/30 hover:border-error-500/60"
                  : "bg-[#0B1120] text-slate-300 border-white/10 hover:border-primary-500/40"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {w.label}
          </button>
        );
      })}
    </div>
  );
}
