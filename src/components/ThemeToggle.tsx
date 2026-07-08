"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme)) || "dark";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  };

  if (!mounted) return <div className={compact ? "w-9 h-9" : "w-16 h-9"} />;

  if (compact) {
    return (
      <button
        onClick={toggle}
        aria-label={theme === "dark" ? "روشن کردن" : "تاریک کردن"}
        title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}
        className="relative w-9 h-9 rounded-full flex items-center justify-center glass hover:border-[var(--neon-cyan)] transition-all cursor-pointer group"
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4 text-primary-400 group-hover:text-primary-300 group-hover:rotate-45 transition-all duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-primary-600 group-hover:text-primary-700 group-hover:-rotate-12 transition-all duration-300" />
        )}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
             style={{ boxShadow: "0 0 24px var(--primary-glow)" }} />
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? "روشن کردن" : "تاریک کردن"}
      className="relative w-16 h-9 rounded-full glass border border-[var(--border-default)] transition-all cursor-pointer group overflow-hidden"
    >
      <span className={`absolute top-1 w-7 h-7 rounded-full transition-all duration-500 flex items-center justify-center shadow-lg ${
        theme === "dark"
          ? "right-1 bg-gradient-to-br from-primary-400 to-primary-600"
          : "right-8 bg-gradient-to-br from-amber-300 to-amber-500"
      }`}>
        {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-white" /> : <Sun className="w-3.5 h-3.5 text-white" />}
      </span>
      <span className={`absolute inset-0 flex items-center transition-opacity ${theme === "dark" ? "opacity-0" : "opacity-100"}`}>
        <Sun className="w-3 h-3 text-amber-500 mr-2 opacity-50" />
      </span>
      <span className={`absolute inset-0 flex items-center justify-end pr-2 transition-opacity ${theme === "dark" ? "opacity-100" : "opacity-0"}`}>
        <Moon className="w-3 h-3 text-primary-400 opacity-50" />
      </span>
    </button>
  );
}
