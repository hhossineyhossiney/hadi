"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MessageCircle, Send, Loader2, User, Lock, ArrowRight, Search,
  MoreVertical, Archive, Trash2, Pin, Ban, Settings2, Bell, BellOff,
  Users, Menu, X, Circle, Smile, Paperclip, Plus, Filter, Clock,
  CheckCheck, Check, ShieldCheck,
} from "lucide-react";

interface Thread {
  id: number;
  contextType: string | null;
  contextId: number | null;
  lastMessageAt: string;
  isArchived: boolean;
  isPinned: boolean;
  other: { id: number; name: string; phone: string; avatar: string | null; role: string } | null;
  otherRole: string;
  lastMessage: { body: string; createdAt: string; senderId: number } | null;
  unread: number;
  isOnline: boolean;
}

interface Message {
  id: number;
  threadId: number;
  senderId: number;
  senderRole: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

type FilterKey = "active" | "archived";

function roleLabel(role: string): string {
  if (role === "admin") return "مدیر کل";
  if (role === "institute") return "آموزشگاه";
  if (role === "student") return "هنرجو";
  return "کاربر";
}

function relativeTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "الان";
  if (diff < 3600) return `${Math.floor(diff / 60)}د پیش`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}س پیش`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}ر پیش`;
  return d.toLocaleDateString("fa-IR");
}

function ChatContent() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const searchParams = useSearchParams();
  const withUserId = searchParams.get("with");
  const otherRoleParam = searchParams.get("role") || "institute";

  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("active");
  const [search, setSearch] = useState("");
  const [threadMenu, setThreadMenu] = useState<number | null>(null);
  const [headerMenu, setHeaderMenu] = useState(false);
  // Mobile drawers
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // 3-dot drawer
  const [notifSound, setNotifSound] = useState(true);
  const [muteAll, setMuteAll] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const loadThreads = () => {
    const params = new URLSearchParams({ filter });
    if (search) params.set("search", search);
    fetch(`/api/chat/threads?${params}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setThreads(d); })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (status === "authenticated") loadThreads();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, filter, search]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const t = setInterval(loadThreads, 8000);
    return () => clearInterval(t);
  }, [status, filter, search]);

  useEffect(() => {
    if (!withUserId || status !== "authenticated") return;
    fetch("/api/chat/threads", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otherUserId: Number(withUserId), otherRole: otherRoleParam }),
    }).then((r) => r.json()).then((d) => {
      if (d.ok && d.thread) {
        setActiveThreadId(d.thread.id);
        setFilter("active");
        setTimeout(loadThreads, 300);
      }
    });
  }, [withUserId, otherRoleParam, status]);

  useEffect(() => {
    if (!activeThreadId) return;
    fetch(`/api/chat/messages?threadId=${activeThreadId}`)
      .then((r) => r.json()).then((d) => { if (Array.isArray(d)) setMessages(d); });
    const t = setInterval(() => {
      fetch(`/api/chat/messages?threadId=${activeThreadId}`)
        .then((r) => r.json()).then((d) => { if (Array.isArray(d)) setMessages(d); });
    }, 4000);
    return () => clearInterval(t);
  }, [activeThreadId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeThreadId || sending) return;
    setSending(true);
    const body = input;
    setInput("");
    await fetch("/api/chat/messages", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThreadId, body }),
    });
    const d = await fetch(`/api/chat/messages?threadId=${activeThreadId}`).then((r) => r.json());
    setMessages(d);
    loadThreads();
    setSending(false);
  };

  const doThreadAction = async (threadId: number, action: string) => {
    if (action === "delete") {
      if (!confirm("حذف کامل این گفتگو؟")) { setThreadMenu(null); return; }
      await fetch("/api/chat/threads", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      if (activeThreadId === threadId) setActiveThreadId(null);
    } else if (action === "clear") {
      if (!confirm("پاک‌سازی همه پیام‌ها؟")) { setThreadMenu(null); return; }
      await fetch("/api/chat/clear", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      if (activeThreadId === threadId) setMessages([]);
    } else {
      await fetch("/api/chat/threads", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId, action }),
      });
    }
    setThreadMenu(null);
    setHeaderMenu(false);
    loadThreads();
  };

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center px-4">
        <div className="bg-white/5 rounded-[24px] border border-white/10 p-8 text-center max-w-md">
          <Lock className="w-12 h-12 mx-auto text-primary-400 mb-3" />
          <h2 className="text-lg font-black mb-2 text-white">ورود لازم است</h2>
          <p className="text-slate-400 text-sm mb-4">برای دسترسی به چت، ابتدا وارد حساب کاربری شوید.</p>
          <a href="/login" className="inline-block px-5 py-2.5 rounded-[10px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black transition-colors">ورود به حساب</a>
        </div>
      </div>
    );
  }
  if (loading && !threads.length) return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
    </div>
  );

  const active = threads.find((t) => t.id === activeThreadId);
  const teamThreads = threads.filter(t => t.otherRole === "admin");

  return (
    <div className="min-h-screen bg-[#0B1120] pt-20 pb-16 lg:pb-4" dir="rtl">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-4">

        {/* =================== MOBILE VIEW =================== */}
        <div className="lg:hidden">
          {activeThreadId && active ? (
            /* --- MOBILE: single conversation view --- */
            <div className="bg-[#111a2e] border border-white/10 rounded-[20px] overflow-hidden flex flex-col h-[calc(100vh-160px)]">
              {/* Header */}
              <div className="p-3 border-b border-white/10 flex items-center gap-2.5 relative">
                <button onClick={() => setActiveThreadId(null)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                  <ArrowRight className="w-4 h-4" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                    {active.other?.name?.[0] || "?"}
                  </div>
                  {active.isOnline && <div className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#111a2e]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-white text-sm truncate">{active.other?.name}</h4>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    {active.isOnline ? <span className="text-emerald-400">آنلاین</span> : "آفلاین"}
                    <span className="text-slate-600">•</span>
                    <span>{roleLabel(active.otherRole)}</span>
                  </div>
                </div>
                <button onClick={() => setHeaderMenu(!headerMenu)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {headerMenu && (
                  <div className="absolute left-3 top-14 z-30 bg-[#0B1120] border border-white/10 rounded-[12px] shadow-2xl overflow-hidden min-w-[180px]">
                    <button onClick={() => doThreadAction(active.id, active.isPinned ? "unpin" : "pin")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 text-right">
                      <Pin className="w-3.5 h-3.5" /> {active.isPinned ? "برداشتن سنجاق" : "سنجاق‌کردن"}
                    </button>
                    <button onClick={() => doThreadAction(active.id, active.isArchived ? "unarchive" : "archive")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 text-right">
                      <Archive className="w-3.5 h-3.5" /> {active.isArchived ? "خارج از بایگانی" : "بایگانی"}
                    </button>
                    <button onClick={() => doThreadAction(active.id, "clear")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-400 hover:bg-white/5 text-right">
                      <Clock className="w-3.5 h-3.5" /> پاک‌سازی پیام‌ها
                    </button>
                    <button onClick={() => doThreadAction(active.id, "delete")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-error-400 hover:bg-white/5 text-right">
                      <Trash2 className="w-3.5 h-3.5" /> حذف چت
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.05), transparent 50%)" }}>
                {messages.length === 0 && (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    اولین پیام را ارسال کنید
                  </div>
                )}
                {messages.map((m) => {
                  const isMe = user && Number(user.id) === m.senderId;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                      <div className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-bl-md"
                          : "bg-white/10 text-white rounded-br-md border border-white/5"
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? "text-white/70" : "text-slate-400"}`}>
                          <span>{new Date(m.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                          {isMe && (m.isRead ? <CheckCheck className="w-3 h-3 text-cyan-300" /> : <Check className="w-3 h-3" />)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-2.5 border-t border-white/10 bg-[#0B1120]/50 flex items-center gap-1.5">
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"><Paperclip className="w-4 h-4" /></button>
                <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400"><Smile className="w-4 h-4" /></button>
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="اینجا بنویسید..."
                  className="flex-1 px-3 py-2 rounded-[12px] bg-[#111a2e] border border-white/10 text-sm text-white outline-none" />
                <button onClick={send} disabled={sending || !input.trim()}
                  className="p-2 rounded-[12px] bg-gradient-to-br from-cyan-500 to-primary-600 disabled:opacity-50 text-white">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ) : (
            /* --- MOBILE: ultra clean threads list --- */
            <div className="bg-[#111a2e] border border-white/10 rounded-[20px] overflow-hidden flex flex-col h-[calc(100vh-160px)] relative">
              {/* Minimal header: just title + 3-dot */}
              <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary-400" />
                <h3 className="font-black text-white flex-1">
                  {filter === "archived" ? "بایگانی چت‌ها" : "چت‌ها"}
                </h3>
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-slate-300 relative">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Threads list */}
              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 ? (
                  <div className="text-center p-10 text-slate-500 text-xs">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    {filter === "archived" ? "چت بایگانی‌شده‌ای ندارید" : "هنوز گفتگویی ندارید"}
                  </div>
                ) : threads.map((t) => (
                  <button key={t.id} onClick={() => setActiveThreadId(t.id)}
                    className="w-full text-right p-3 border-b border-white/5 hover:bg-white/5 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black">
                        {t.other?.name?.[0] || "?"}
                      </div>
                      {t.isOnline && <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111a2e]" />}
                      {t.isPinned && <Pin className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-black text-sm text-white truncate">{t.other?.name || "کاربر"}</h4>
                        <span className="text-[9px] text-slate-500 shrink-0">
                          {t.lastMessage ? relativeTime(t.lastMessage.createdAt) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[11px] text-slate-400 truncate flex-1">
                          {t.isOnline && <span className="text-emerald-400">آنلاین • </span>}
                          {t.lastMessage?.body || "هنوز پیامی نیست"}
                        </p>
                        {t.unread > 0 && (
                          <span className="text-[9px] font-black bg-primary-500 text-white px-1.5 py-0.5 rounded-full shrink-0">{t.unread}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Mobile drawer: settings & filters */}
              {mobileMenuOpen && (
                <>
                  <div onClick={() => setMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden" />
                  <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[320px] bg-[#111a2e] border-l border-white/10 z-50 lg:hidden overflow-y-auto animate-slide-in-right">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Settings2 className="w-4 h-4 text-primary-400" />
                        <h3 className="font-black text-white">تنظیمات چت</h3>
                      </div>
                      <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 space-y-5">
                      {/* Search */}
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">جستجو</div>
                        <div className="relative">
                          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                          <input value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="جستجو در چت‌ها..."
                            className="w-full pr-9 pl-3 py-2.5 rounded-[10px] bg-[#0B1120] border border-white/5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-primary-500/40" />
                        </div>
                      </div>

                      {/* Filters */}
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">فیلتر گفتگوها</div>
                        <div className="space-y-1">
                          <button onClick={() => { setFilter("active"); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-sm font-bold ${
                              filter === "active" ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-white/5"
                            }`}>
                            <Circle className={`w-2 h-2 ${filter === "active" ? "fill-emerald-400 text-emerald-400" : ""}`} />
                            فعال ({threads.filter(t => !t.isArchived).length})
                          </button>
                          <button onClick={() => { setFilter("archived"); setMobileMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-sm font-bold ${
                              filter === "archived" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"
                            }`}>
                            <Archive className="w-4 h-4" />
                            بایگانی‌شده
                          </button>
                        </div>
                      </div>

                      {/* Chat settings */}
                      <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">تنظیمات</div>
                        <div className="space-y-1">
                          <label className="flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-white/5">
                            <span className="text-xs text-slate-300 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> رمزنگاری</span>
                            <input type="checkbox" defaultChecked className="accent-primary-500" />
                          </label>
                          <label className="flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-white/5">
                            <span className="text-xs text-slate-300 flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> صدای اعلان</span>
                            <input type="checkbox" checked={notifSound} onChange={(e) => setNotifSound(e.target.checked)} className="accent-primary-500" />
                          </label>
                          <label className="flex items-center justify-between px-3 py-2.5 rounded-[10px] hover:bg-white/5">
                            <span className="text-xs text-slate-300 flex items-center gap-2"><BellOff className="w-3.5 h-3.5" /> بی‌صدا کردن همه</span>
                            <input type="checkbox" checked={muteAll} onChange={(e) => setMuteAll(e.target.checked)} className="accent-primary-500" />
                          </label>
                        </div>
                      </div>

                      {/* Team chats */}
                      {teamThreads.length > 0 && (
                        <div>
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">چت‌های تیمی</div>
                          <div className="space-y-1">
                            {teamThreads.slice(0, 5).map(t => (
                              <button key={t.id} onClick={() => { setActiveThreadId(t.id); setMobileMenuOpen(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-slate-300 hover:bg-white/5">
                                <Circle className={`w-2 h-2 ${t.isOnline ? "fill-emerald-400 text-emerald-400" : "text-slate-600"}`} />
                                <span className="truncate">{t.other?.name || "کاربر"}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Info */}
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 px-3 text-xs text-slate-400">
                          <User className="w-3.5 h-3.5" />
                          {user?.name || "کاربر"}
                          <span className="text-[10px] text-slate-600">— {roleLabel(user?.role || "student")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* =================== DESKTOP VIEW (unchanged from before) =================== */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-3 px-4">
            <div className="flex items-center gap-2 text-slate-300">
              <MessageCircle className="w-5 h-5 text-primary-400" />
              <h1 className="text-lg font-black text-white">مرکز چت</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                <User className="w-3.5 h-3.5" />
                {user?.name || "کاربر"}
                <span className="text-[10px] text-slate-500">— {roleLabel(user?.role || "student")}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[240px_320px_1fr_240px] gap-3 h-[calc(100vh-140px)]">
            {/* Filters sidebar */}
            <aside className="bg-[#111a2e] border border-white/10 rounded-[20px] p-3 overflow-y-auto">
              <div className="mb-3">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 mb-2">چت‌های من</div>
                <button onClick={() => setFilter("active")}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-sm font-bold ${filter === "active" ? "bg-emerald-500/15 text-emerald-300" : "text-slate-400 hover:bg-white/5"}`}>
                  <Circle className={`w-2 h-2 ${filter === "active" ? "fill-emerald-400 text-emerald-400" : "text-slate-500"}`} />
                  فعال
                </button>
                <button onClick={() => setFilter("archived")}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-sm font-bold ${filter === "archived" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5"}`}>
                  <Archive className="w-4 h-4" /> بایگانی‌شده
                </button>
              </div>
              {teamThreads.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 mb-2">چت‌های تیمی</div>
                  {teamThreads.slice(0, 5).map(t => (
                    <button key={t.id} onClick={() => setActiveThreadId(t.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-sm text-slate-300 hover:bg-white/5 ${activeThreadId === t.id ? "bg-white/5" : ""}`}>
                      <Circle className={`w-2 h-2 ${t.isOnline ? "fill-emerald-400 text-emerald-400" : "text-slate-600"}`} />
                      <span className="truncate">{t.other?.name || "کاربر"}</span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider px-2 mb-2">تیکت‌های پشتیبانی</div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs text-slate-400">
                    <MessageCircle className="w-3.5 h-3.5" /> همه
                    <span className="mr-auto text-[10px] text-slate-500">{threads.length}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Threads */}
            <aside className="bg-[#111a2e] border border-white/10 rounded-[20px] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/10">
                <h3 className="font-black text-white">Chats</h3>
              </div>
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="جستجو..."
                    className="w-full pr-9 pl-3 py-2 rounded-[10px] bg-[#0B1120] border border-white/5 text-xs text-white outline-none focus:border-primary-500/40" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {threads.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 text-xs">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    هنوز گفتگویی ندارید
                  </div>
                ) : threads.map((t) => (
                  <div key={t.id} className={`relative border-b border-white/5 hover:bg-white/5 ${activeThreadId === t.id ? "bg-white/5" : ""}`}>
                    <button onClick={() => setActiveThreadId(t.id)} className="w-full text-right p-3 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black">
                          {t.other?.name?.[0] || "?"}
                        </div>
                        {t.isOnline && <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111a2e]" />}
                        {t.isPinned && <Pin className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-sm text-white truncate">{t.other?.name || "کاربر"}</h4>
                          <span className="text-[9px] text-slate-500 shrink-0">
                            {t.lastMessage ? relativeTime(t.lastMessage.createdAt) : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <p className="text-[11px] text-slate-400 truncate flex-1">
                            {t.isOnline && <span className="text-emerald-400">آنلاین • </span>}
                            {t.lastMessage?.body || "هنوز پیامی نیست"}
                          </p>
                          {t.unread > 0 && (
                            <span className="text-[9px] font-black bg-primary-500 text-white px-1.5 py-0.5 rounded-full">{t.unread}</span>
                          )}
                        </div>
                      </div>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setThreadMenu(threadMenu === t.id ? null : t.id); }}
                      className="absolute left-2 top-3 p-1 rounded hover:bg-white/10 text-slate-500">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    {threadMenu === t.id && (
                      <div className="absolute left-2 top-8 z-30 bg-[#0B1120] border border-white/10 rounded-[10px] shadow-2xl overflow-hidden min-w-[140px]">
                        <button onClick={() => doThreadAction(t.id, t.isPinned ? "unpin" : "pin")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
                          <Pin className="w-3 h-3" /> {t.isPinned ? "برداشتن سنجاق" : "سنجاق"}
                        </button>
                        <button onClick={() => doThreadAction(t.id, t.isArchived ? "unarchive" : "archive")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">
                          <Archive className="w-3 h-3" /> {t.isArchived ? "خارج از بایگانی" : "بایگانی"}
                        </button>
                        <button onClick={() => doThreadAction(t.id, "clear")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-white/5">
                          <Trash2 className="w-3 h-3" /> پاک‌سازی
                        </button>
                        <button onClick={() => doThreadAction(t.id, "delete")} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-error-400 hover:bg-white/5">
                          <Trash2 className="w-3 h-3" /> حذف
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </aside>

            {/* Messages */}
            <main className="bg-[#111a2e] border border-white/10 rounded-[20px] overflow-hidden flex flex-col">
              {active ? (
                <>
                  <div className="p-4 border-b border-white/10 flex items-center gap-3 relative">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center text-white font-black">
                        {active.other?.name?.[0] || "?"}
                      </div>
                      {active.isOnline && <div className="absolute bottom-0 left-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#111a2e]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white truncate">{active.other?.name}</h4>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        {active.isOnline ? <span className="text-emerald-400">آنلاین</span> : "آفلاین"}
                        <span className="text-slate-600">•</span>
                        <span>{roleLabel(active.otherRole)}</span>
                      </div>
                    </div>
                    <button onClick={() => setHeaderMenu(!headerMenu)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {headerMenu && (
                      <div className="absolute left-3 top-14 z-30 bg-[#0B1120] border border-white/10 rounded-[12px] shadow-2xl overflow-hidden min-w-[180px]">
                        <button onClick={() => doThreadAction(active.id, active.isArchived ? "unarchive" : "archive")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 text-right">
                          <Archive className="w-3.5 h-3.5" /> {active.isArchived ? "خارج از بایگانی" : "بایگانی"}
                        </button>
                        <button onClick={() => doThreadAction(active.id, "delete")} className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-error-400 hover:bg-white/5 text-right">
                          <Trash2 className="w-3.5 h-3.5" /> حذف چت
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(59,130,246,0.05), transparent 50%)" }}>
                    {messages.length === 0 && (
                      <div className="text-center py-16 text-slate-500 text-xs">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        اولین پیام را ارسال کنید
                      </div>
                    )}
                    {messages.map((m) => {
                      const isMe = user && Number(user.id) === m.senderId;
                      return (
                        <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe ? "bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-bl-md" : "bg-white/10 text-white rounded-br-md border border-white/5"
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{m.body}</p>
                            <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? "text-white/70" : "text-slate-400"}`}>
                              <span>{new Date(m.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}</span>
                              {isMe && (m.isRead ? <CheckCheck className="w-3 h-3 text-cyan-300" /> : <Check className="w-3 h-3" />)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={endRef} />
                  </div>
                  <div className="p-3 border-t border-white/10 bg-[#0B1120]/50 flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400"><Paperclip className="w-4 h-4" /></button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400"><Smile className="w-4 h-4" /></button>
                    <input value={input} onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                      placeholder="اینجا بنویسید..."
                      className="flex-1 px-4 py-2.5 rounded-[14px] bg-[#111a2e] border border-white/10 text-sm text-white outline-none focus:border-primary-500/40" />
                    <button onClick={send} disabled={sending || !input.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px] bg-gradient-to-br from-cyan-500 to-primary-600 disabled:opacity-50 text-white text-xs font-black">
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      ارسال
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 p-6">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">یک گفتگو را از لیست انتخاب کنید</p>
                  </div>
                </div>
              )}
            </main>

            {/* Settings */}
            <aside className="bg-[#111a2e] border border-white/10 rounded-[20px] p-4 overflow-y-auto space-y-5">
              <div>
                <h4 className="font-black text-white mb-3">مدیریت چت</h4>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">عملیات چت</div>
                  <button onClick={() => active && doThreadAction(active.id, "clear")} disabled={!active} className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs text-error-400 hover:bg-white/5 disabled:opacity-40">
                    <Trash2 className="w-3.5 h-3.5" /> حذف گفتگو
                  </button>
                  <button onClick={() => active && doThreadAction(active.id, active.isArchived ? "unarchive" : "archive")} disabled={!active} className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40">
                    <Archive className="w-3.5 h-3.5" /> {active?.isArchived ? "خارج از بایگانی" : "بایگانی چت"}
                  </button>
                  <button onClick={() => active && doThreadAction(active.id, "clear")} disabled={!active} className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40">
                    <Clock className="w-3.5 h-3.5" /> پاک‌سازی تاریخچه
                  </button>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">تنظیمات چت</div>
                <div className="space-y-1">
                  <label className="flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-white/5">
                    <span className="text-xs text-slate-300 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> رمزنگاری</span>
                    <input type="checkbox" defaultChecked className="accent-primary-500" />
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-white/5">
                    <span className="text-xs text-slate-300 flex items-center gap-2"><Bell className="w-3.5 h-3.5" /> صدای اعلان</span>
                    <input type="checkbox" checked={notifSound} onChange={(e) => setNotifSound(e.target.checked)} className="accent-primary-500" />
                  </label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-[10px] hover:bg-white/5">
                    <span className="text-xs text-slate-300 flex items-center gap-2"><BellOff className="w-3.5 h-3.5" /> بی‌صدا کردن</span>
                    <input type="checkbox" checked={muteAll} onChange={(e) => setMuteAll(e.target.checked)} className="accent-primary-500" />
                  </label>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1120] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-400" /></div>}>
      <ChatContent />
    </Suspense>
  );
}
