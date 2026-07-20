"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Send, X, Sparkles, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const WELCOME: Msg = {
  role: "assistant",
  content:
    "سلام 👋 من مشاور هوشمند فَنیکسو هستم و به اطلاعات زنده آموزشگاه‌ها و دوره‌ها دسترسی دارم. درباره تعداد آموزشگاه‌ها، شهریه، مدرس، آدرس، ثبت‌نام یا انتخاب مسیر یادگیری از من بپرس.",
};

function RichMessage({ content }: { content: string }) {
  const parts = content.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, index) => part.startsWith("http") ? (
        <a key={index} href={part.replace(/[)،.]+$/, "")} target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline underline-offset-2 break-all">
          {part}
        </a>
      ) : <span key={index}>{part}</span>)}
    </>
  );
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pulse, setPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // hide pulse after 12s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 12000);
    return () => clearTimeout(t);
  }, []);

  // load persisted
  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai_chat_v1");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) setMsgs(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("ai_chat_v1", JSON.stringify(msgs));
    } catch {}
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  async function send(overrideText?: string | unknown) {
    const text = (typeof overrideText === "string" ? overrideText : input).trim();
    if (!text || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);

    // add empty assistant slot
    setMsgs((m) => [...m, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "general", messages: next }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "خطا در ارتباط" }));
        setMsgs((m) => {
          const c = [...m];
          c[c.length - 1] = {
            role: "assistant",
            content: `❌ ${err.error || "خطای سرور"}`,
          };
          return c;
        });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const ln of lines) {
          const s = ln.trim();
          if (!s.startsWith("data:")) continue;
          const data = s.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const j = JSON.parse(data);
            if (j.delta) {
              acc += j.delta;
              setMsgs((m) => {
                const c = [...m];
                c[c.length - 1] = { role: "assistant", content: acc };
                return c;
              });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: `❌ ${e.message || "خطا"}` };
        return c;
      });
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMsgs([WELCOME]);
    try {
      localStorage.removeItem("ai_chat_v1");
    } catch {}
  }

  const quickPrompts = [
    "چند آموزشگاه فعال در هر منطقه داریم؟",
    "دوره‌های کامپیوتر را با قیمت و مدرس معرفی کن",
    "برای ورود سریع به بازار کار کدام دوره مناسب‌تر است؟",
    "دوره‌های آنلاین تخفیف‌دار و لینک خریدشان را بگو",
  ];

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => {
              setOpen(true);
              setPulse(false);
            }}
            className="fixed right-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-[55] sm:bottom-6 sm:right-6 sm:z-[70] group"
            aria-label="گفتگو با دستیار هوشمند"
          >
            {pulse && (
              <span className="absolute inset-0 rounded-full bg-fuchsia-500 animate-ping opacity-60" />
            )}
            <span className="relative flex items-center gap-2 pl-3 pr-4 py-3 rounded-full bg-gradient-to-l from-fuchsia-500 via-purple-500 to-blue-500 shadow-2xl shadow-fuchsia-500/40 hover:scale-105 transition-transform">
              <Bot className="w-5 h-5 text-white" />
              <span className="text-xs font-black text-white hidden sm:inline">
                دستیار هوشمند
              </span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm sm:hidden"
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed z-[71] inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[400px] h-[85vh] sm:h-[600px] max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#0a0f1f] border border-white/10 shadow-2xl overflow-hidden"
              style={{ direction: "rtl" }}
            >
              {/* Header */}
              <div className="relative shrink-0 px-4 py-3 bg-gradient-to-l from-fuchsia-600 via-purple-600 to-blue-600 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white leading-tight">
                    مشاور هوشمند فَنیکسو
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-white/80">
                      آنلاین • پاسخ فوری
                    </span>
                  </div>
                </div>
                <button
                  onClick={clearChat}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  title="پاک کردن گفتگو"
                >
                  <Trash2 className="w-4 h-4 text-white/70" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center"
                  title="بستن"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Messages */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#04091A]"
              >
                {msgs.map((m, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        m.role === "user"
                          ? "bg-blue-500"
                          : "bg-gradient-to-br from-fuchsia-500 to-purple-600"
                      }`}
                    >
                      {m.role === "user" ? (
                        <span className="text-xs font-black text-white">من</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-blue-500/20 border border-blue-500/30 text-white rounded-tr-sm"
                          : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
                      }`}
                    >
                      {m.content ? <RichMessage content={m.content} /> : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          در حال تایپ...
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Quick prompts when only welcome */}
                {msgs.length === 1 && !loading && (
                  <div className="pt-2 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      پیشنهاد سوال:
                    </div>
                    {quickPrompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => send(p)}
                        className="w-full text-right px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] text-xs font-bold text-slate-300 transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="shrink-0 p-3 border-t border-white/5 bg-[#0a0f1f]">
                <div className="flex items-end gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-2 focus-within:border-fuchsia-500/50 transition-colors">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={1}
                    placeholder="پیامت رو بنویس..."
                    disabled={loading}
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-24 py-1.5 px-1"
                  />
                  <button
                    onClick={send}
                    disabled={loading || !input.trim()}
                    className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-l from-fuchsia-500 to-purple-600 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="mt-1.5 text-[9px] text-slate-500 text-center">
                  متصل به اطلاعات زنده فَنیکسو • Enter برای ارسال، Shift+Enter برای خط جدید
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
