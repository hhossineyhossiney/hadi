"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Loader2, Sparkles, Copy, Check, Trash2 } from "lucide-react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  mode: "tutor" | "general" | "content_course" | "content_sms" | "content_insta";
  title: string;
  subtitle: string;
  gradient: string;
  placeholder: string;
  quickPrompts?: string[];
  welcome: string;
  useStream?: boolean; // true → chat streaming, false → one-shot generate
  height?: string;
}

export default function AIToolPanel({
  mode,
  title,
  subtitle,
  gradient,
  placeholder,
  quickPrompts = [],
  welcome,
  useStream = true,
  height = "600px",
}: Props) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: welcome }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs]);

  async function sendStream(next: Msg[]) {
    setMsgs((m) => [...m, { role: "assistant", content: "" }]);
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, messages: next }),
    });
    if (!res.ok || !res.body) {
      const err = await res.json().catch(() => ({ error: "خطا در ارتباط" }));
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: `❌ ${err.error || "خطا"}` };
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
        const d = s.slice(5).trim();
        if (d === "[DONE]") continue;
        try {
          const j = JSON.parse(d);
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
  }

  async function sendOneShot(userMsg: string) {
    setMsgs((m) => [...m, { role: "assistant", content: "" }]);
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:
          mode === "content_course"
            ? "course"
            : mode === "content_sms"
            ? "sms"
            : mode === "content_insta"
            ? "insta"
            : "course",
        prompt: userMsg,
      }),
    });
    const j = await res.json().catch(() => ({ error: "خطا" }));
    setMsgs((m) => {
      const c = [...m];
      c[c.length - 1] = {
        role: "assistant",
        content: j.text || `❌ ${j.error || "خطا"}`,
      };
      return c;
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...msgs, { role: "user" as const, content: text }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      if (useStream) await sendStream(next);
      else await sendOneShot(text);
    } catch (e: any) {
      setMsgs((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: `❌ ${e.message}` };
        return c;
      });
    } finally {
      setLoading(false);
    }
  }

  function copy(txt: string, idx: number) {
    navigator.clipboard.writeText(txt);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  }

  return (
    <div
      className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 flex flex-col"
      style={{ height }}
    >
      {/* Header */}
      <div className={`shrink-0 px-5 py-4 bg-gradient-to-l ${gradient} flex items-center gap-3`}>
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-black text-white leading-tight">{title}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-[10px] font-bold text-white/90">{subtitle}</span>
          </div>
        </div>
        <button
          onClick={() => setMsgs([{ role: "assistant", content: welcome }])}
          className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center"
          title="پاک کردن"
        >
          <Trash2 className="w-4 h-4 text-white/80" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#04091A]">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                m.role === "user"
                  ? "bg-blue-500"
                  : `bg-gradient-to-br ${gradient}`
              }`}
            >
              {m.role === "user" ? (
                <span className="text-xs font-black text-white">من</span>
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`group relative flex-1 max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-500/20 border border-blue-500/30 text-white rounded-tr-sm"
                  : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm"
              }`}
            >
              {m.content || (
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  در حال پردازش...
                </span>
              )}
              {m.role === "assistant" && m.content && (
                <button
                  onClick={() => copy(m.content, i)}
                  className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center transition-opacity"
                  title="کپی"
                >
                  {copiedIdx === i ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-white" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {msgs.length === 1 && quickPrompts.length > 0 && !loading && (
          <div className="pt-2 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              پیشنهاد سوال:
            </div>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(p);
                  setTimeout(() => send(), 50);
                }}
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
        <div className="flex items-end gap-2 rounded-2xl bg-white/[0.04] border border-white/10 p-2 focus-within:border-white/25 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 py-1.5 px-1"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-l ${gradient} hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
