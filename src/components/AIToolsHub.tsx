"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, X, Loader2, Copy, Check, Send, Brain } from "lucide-react";
import { AI_TOOLS, CATEGORY_META, type AITool, type ToolCategory } from "@/lib/ai-tools";

const CATEGORIES: (ToolCategory | "all")[] = [
  "all",
  "students",
  "teachers",
  "centers",
  "content",
  "bi",
  "voice",
  "automation",
];

export default function AIToolsHub() {
  const [cat, setCat] = useState<ToolCategory | "all">("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<AITool | null>(null);

  const filtered = useMemo(() => {
    return AI_TOOLS.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (q.trim()) {
        const needle = q.trim().toLowerCase();
        return (
          t.title.toLowerCase().includes(needle) ||
          t.desc.toLowerCase().includes(needle) ||
          t.id.toLowerCase().includes(needle)
        );
      }
      return true;
    });
  }, [cat, q]);

  return (
    <div className="relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-[#04091A]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-fuchsia-500/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      {/* Hero */}
      <section className="pt-32 lg:pt-40 pb-10 lg:pb-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mx-auto mb-6 w-20 h-20"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 blur-2xl opacity-70" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-2xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4"
            style={{ letterSpacing: "-0.03em" }}
          >
            <span className="bg-gradient-to-l from-fuchsia-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
              {AI_TOOLS.length}+
            </span>{" "}
            ابزار AI عملیاتی
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-base text-slate-400 mb-8"
          >
            روی هر کارت کلیک کن، اطلاعات وارد کن، خروجی حرفه‌ای بگیر.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-xl mx-auto mb-8"
          >
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجو در ابزارها..."
              className="w-full h-12 pr-12 pl-4 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:border-fuchsia-500/50"
            />
          </motion.div>

          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 justify-start md:justify-center">
            {CATEGORIES.map((c) => {
              const meta = c === "all" ? null : CATEGORY_META[c];
              const active_ = cat === c;
              const count = c === "all" ? AI_TOOLS.length : AI_TOOLS.filter((t) => t.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-black transition-all ${
                    active_
                      ? c === "all"
                        ? "bg-white text-slate-900 border-white"
                        : `bg-gradient-to-l ${meta?.gradient} text-white border-white/20`
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span>{c === "all" ? "🌟" : meta?.icon}</span>
                  <span>{c === "all" ? "همه" : meta?.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active_ ? "bg-black/20" : "bg-white/10"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              ابزاری با این جستجو یافت نشد
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((t, i) => {
                const meta = CATEGORY_META[t.category];
                return (
                  <motion.button
                    key={t.id}
                    onClick={() => setActive(t)}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 8) * 0.03 }}
                    className="group relative text-right"
                  >
                    <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-40 blur-lg transition-opacity duration-500 pointer-events-none`} />
                    <div className="relative h-full p-5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all duration-300 group-hover:-translate-y-1 overflow-hidden">
                      <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-gradient-to-br ${meta.gradient} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 pointer-events-none`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform`}>
                          {t.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-black text-white leading-tight mb-1">
                            {t.title}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                            {t.desc}
                          </p>
                        </div>
                      </div>
                      <div className="relative mt-3 flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${meta.accent}`}>
                          {meta.icon} {meta.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> استفاده →
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {active && <ToolModal tool={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
function ToolModal({ tool, onClose }: { tool: AITool; onClose: () => void }) {
  const meta = CATEGORY_META[tool.category];
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    tool.inputs.forEach((i) => (seed[i.name] = ""));
    return seed;
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/ai/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toolId: tool.id, inputs }),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) {
        setError(j.error || "خطا در پردازش");
      } else {
        setResult(j.text || "");
      }
    } catch (e: any) {
      setError(e?.message || "خطا در ارتباط");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const disabled = loading || !inputs[tool.inputs[0]?.name || ""]?.trim();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md"
      />
      <motion.div
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.97 }}
        className="fixed z-[81] inset-x-2 top-6 bottom-6 md:inset-x-auto md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-[720px] md:max-h-[85vh] flex flex-col rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden"
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className={`shrink-0 px-5 py-4 bg-gradient-to-l ${meta.gradient} flex items-center gap-3`}>
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-xl">
            {tool.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-white leading-tight">{tool.title}</div>
            <div className="text-[10px] font-bold text-white/80 mt-0.5">{tool.desc}</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/15 flex items-center justify-center"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Inputs */}
          {tool.inputs.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-black text-slate-300 mb-1.5">
                {f.label}
                {f === tool.inputs[0] && <span className="text-fuchsia-400 mr-1">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={inputs[f.name] || ""}
                  onChange={(e) => setInputs({ ...inputs, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500/50 focus:outline-none text-sm text-white placeholder-slate-500 px-3 py-2 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={inputs[f.name] || ""}
                  onChange={(e) => setInputs({ ...inputs, [f.name]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 focus:border-fuchsia-500/50 focus:outline-none text-sm text-white placeholder-slate-500 px-3 py-2"
                />
              )}
            </div>
          ))}

          {/* Result */}
          {(loading || result || error) && (
            <div className="pt-3 border-t border-white/5">
              <div className="text-xs font-black text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                خروجی AI
              </div>
              {loading && (
                <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center gap-2 text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  در حال پردازش...
                </div>
              )}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-200 text-sm">
                  ❌ {error}
                </div>
              )}
              {result && (
                <div className="relative group p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {result}
                  <button
                    onClick={copy}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center transition-opacity"
                    title="کپی"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer button */}
        <div className="shrink-0 p-4 border-t border-white/5">
          <button
            onClick={run}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-black text-white bg-gradient-to-l ${meta.gradient} shadow-lg hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "در حال تولید..." : "تولید با AI"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
