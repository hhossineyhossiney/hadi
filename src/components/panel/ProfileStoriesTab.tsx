"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  UserCircle2, ImagePlus, Trash2, Loader2, Film, Archive, ArrowUp, ArrowDown,
  CalendarClock, Plus, X, Eye, RotateCcw,
} from "lucide-react";
import ImageCropperModal from "@/components/ImageCropperModal";
import UploadProgress from "@/components/UploadProgress";
import { useFileUpload } from "@/lib/useFileUpload";

const MAX_PROFILE_PHOTO_BYTES = 5_000_000; // raw file size before crop (5MB source ok, output is compressed)
const MAX_STORY_IMAGE_BYTES = 5_000_000; // raw source file
const MAX_STORY_VIDEO_BYTES = 15_000_000; // raw source file (compressed via data URL, capped again server-side)
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg"];

interface StoryRecord {
  id: number;
  mediaUrl: string;
  mediaType: string;
  caption: string | null;
  sortOrder: number;
  publishAt: string;
  expiresAt: string;
  isArchived: boolean;
  isExpired: boolean;
  viewCount: number;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ProfileStoriesTab({ institute, refresh }: { institute: any; refresh: () => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black mb-1">پروفایل و استوری</h2>
        <p className="text-slate-400 text-sm">مدیریت عکس پروفایل و استوری‌های روزانه آموزشگاه (نمایش در صفحه اصلی سایت)</p>
      </div>
      <ProfilePhotoSection institute={institute} refresh={refresh} />
      <StoriesSection />
    </div>
  );
}

/* ============================= PROFILE PHOTO SECTION ============================= */
function ProfilePhotoSection({ institute, refresh }: { institute: any; refresh: () => void }) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, upload, cancel, reset } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    setMsg(null);
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setMsg({ type: "err", text: "فرمت فایل مجاز نیست. فقط JPG، PNG و WEBP پذیرفته می‌شود" });
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_BYTES) {
      setMsg({ type: "err", text: "حجم فایل اصلی باید کمتر از ۵ مگابایت باشد" });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setCropSrc(dataUrl);
  };

  const handleCropDone = async (croppedDataUrl: string) => {
    setCropSrc(null);
    reset();
    try {
      await upload("/api/manager/profile-photo", { image: croppedDataUrl });
      setMsg({ type: "ok", text: "✅ عکس پروفایل با موفقیت به‌روزرسانی شد" });
      refresh();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message || "خطا در آپلود" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("آیا از حذف عکس پروفایل مطمئن هستید؟")) return;
    setDeleting(true);
    const res = await fetch("/api/manager/profile-photo", { method: "DELETE" });
    setDeleting(false);
    if (res.ok) { setMsg({ type: "ok", text: "✅ عکس پروفایل حذف شد" }); refresh(); }
    else setMsg({ type: "err", text: "خطا در حذف عکس" });
  };

  return (
    <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserCircle2 className="w-4 h-4 text-primary-400" />
        <h3 className="font-black text-white text-sm">عکس پروفایل آموزشگاه</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="relative shrink-0">
          {institute.profilePhoto ? (
            <img src={institute.profilePhoto} alt="" className="w-28 h-28 rounded-full object-cover border-4 border-white/10" />
          ) : (
            <div className="w-28 h-28 rounded-full bg-primary-600/20 border-4 border-white/10 flex items-center justify-center">
              <span className="text-3xl font-black text-primary-300">{institute.name?.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 w-full space-y-3">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            این عکس در نوار استوری صفحه اصلی و هدر صفحه آموزشگاه شما نمایش داده می‌شود. فرمت مجاز: JPG، PNG، WEBP — حداکثر ۵ مگابایت (قبل از برش).
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="px-4 py-2.5 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-xs font-black cursor-pointer flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4" /> {institute.profilePhoto ? "تغییر عکس" : "آپلود عکس"}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              />
            </label>
            {institute.profilePhoto && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 rounded-[12px] bg-error-500/15 hover:bg-error-500/25 text-error-400 text-xs font-black cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} حذف عکس
              </button>
            )}
          </div>

          {state.status !== "idle" && (
            <UploadProgress state={state} onCancel={cancel} fileName="عکس پروفایل" />
          )}

          {msg && (
            <div className={`text-xs font-bold p-2.5 rounded-[10px] ${msg.type === "ok" ? "bg-success-500/10 text-success-400" : "bg-error-500/10 text-error-400"}`}>
              {msg.text}
            </div>
          )}
        </div>
      </div>

      {cropSrc && (
        <ImageCropperModal imageSrc={cropSrc} onCancel={() => setCropSrc(null)} onCropComplete={handleCropDone} />
      )}
    </div>
  );
}

/* ============================= STORIES SECTION ============================= */
function StoriesSection() {
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [preview, setPreview] = useState<StoryRecord | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/manager/stories");
    if (res.ok) setStories(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const activeStories = stories.filter((s) => !s.isArchived && !s.isExpired);
  const archivedOrExpired = stories.filter((s) => s.isArchived || s.isExpired);

  const handleArchive = async (storyId: number, archive: boolean) => {
    await fetch("/api/manager/stories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, isArchived: archive }),
    });
    fetchStories();
  };

  const handleDelete = async (storyId: number) => {
    if (!confirm("آیا از حذف کامل این استوری مطمئن هستید؟")) return;
    await fetch("/api/manager/stories", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId }),
    });
    fetchStories();
  };

  const handleReorder = async (index: number, direction: -1 | 1) => {
    const newOrder = [...activeStories];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    const orderedIds = newOrder.map((s) => s.id);
    // Optimistic update
    setStories((prev) => {
      const others = prev.filter((s) => s.isArchived || s.isExpired);
      return [...newOrder, ...others];
    });
    await fetch("/api/manager/stories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", orderedIds }),
    });
    fetchStories();
  };

  const handleExtend = async (storyId: number) => {
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch("/api/manager/stories", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId, expiresAt: newExpiry, isArchived: false }),
    });
    if (res.ok) { setMsg({ type: "ok", text: "✅ استوری برای ۲۴ ساعت دیگر تمدید شد" }); fetchStories(); }
  };

  return (
    <div className="bg-[#111a2e] border border-white/5 rounded-[18px] p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-primary-400" />
          <h3 className="font-black text-white text-sm">استوری‌های آموزشگاه</h3>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          disabled={activeStories.length >= 10}
          className="px-4 py-2.5 rounded-[12px] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> افزودن استوری
        </button>
      </div>
      <p className="text-[11px] text-slate-500 mb-5">
        حداکثر ۱۰ استوری فعال مجاز است ({activeStories.length}/۱۰). بعد از پایان زمان انقضا، استوری به‌صورت خودکار از صفحه اصلی حذف می‌شود.
      </p>

      {msg && (
        <div className={`mb-4 text-xs font-bold p-2.5 rounded-[10px] ${msg.type === "ok" ? "bg-success-500/10 text-success-400" : "bg-error-500/10 text-error-400"}`}>
          {msg.text}
        </div>
      )}

      {showAdd && <AddStoryForm onDone={(m) => { setMsg(m); setShowAdd(false); fetchStories(); }} onCancel={() => setShowAdd(false)} />}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
      ) : (
        <>
          {activeStories.length === 0 && !showAdd && (
            <div className="text-center py-10 text-slate-500 text-sm">هنوز استوری فعالی ندارید</div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            {activeStories.map((s, index) => (
              <div key={s.id} className="relative group rounded-[14px] overflow-hidden border border-white/10 aspect-[9/16] bg-black">
                {s.mediaType === "video" ? (
                  <video src={s.mediaUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={s.mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <button onClick={() => setPreview(s)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer" title="پیش‌نمایش">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => handleReorder(index, -1)} disabled={index === 0} className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 cursor-pointer">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => handleReorder(index, 1)} disabled={index === activeStories.length - 1} className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-30 cursor-pointer">
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => handleArchive(s.id, true)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer" title="آرشیو">
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-full bg-error-500/80 hover:bg-error-500 text-white cursor-pointer" title="حذف">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-black/50 rounded-full px-2 py-0.5">
                  <Eye className="w-2.5 h-2.5 text-white" />
                  <span className="text-[9px] text-white font-bold">{s.viewCount}</span>
                </div>
              </div>
            ))}
          </div>

          {archivedOrExpired.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 pt-4 border-t border-white/5">
                <Archive className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] font-black text-slate-400">آرشیو‌شده / منقضی ({archivedOrExpired.length})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {archivedOrExpired.map((s) => (
                  <div key={s.id} className="relative group rounded-[14px] overflow-hidden border border-white/10 aspect-[9/16] bg-black opacity-60">
                    {s.mediaType === "video" ? (
                      <video src={s.mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={s.mediaUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5">
                      <span className="text-[9px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full">
                        {s.isExpired ? "منقضی شده" : "آرشیو‌شده"}
                      </span>
                      <div className="flex gap-1.5">
                        <button onClick={() => handleExtend(s.id)} className="p-1.5 rounded-full bg-primary-500/80 hover:bg-primary-500 text-white cursor-pointer" title="تمدید ۲۴ ساعته">
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-full bg-error-500/80 hover:bg-error-500 text-white cursor-pointer" title="حذف">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/85 z-[200] flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="relative max-w-xs w-full aspect-[9/16] rounded-[16px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {preview.mediaType === "video" ? (
              <video src={preview.mediaUrl} className="w-full h-full object-cover" controls autoPlay />
            ) : (
              <img src={preview.mediaUrl} alt="" className="w-full h-full object-cover" />
            )}
            <button onClick={() => setPreview(null)} className="absolute top-2 left-2 p-2 rounded-full bg-black/50 text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================= ADD STORY FORM ============================= */
function AddStoryForm({ onDone, onCancel }: { onDone: (msg: { type: "ok" | "err"; text: string }) => void; onCancel: () => void }) {
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [expiresIn, setExpiresIn] = useState("24"); // hours
  const { state, upload, cancel, reset } = useFileUpload();

  const handleFile = async (file: File) => {
    const allowed = mediaType === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
    const maxSize = mediaType === "image" ? MAX_STORY_IMAGE_BYTES : MAX_STORY_VIDEO_BYTES;

    if (!allowed.includes(file.type)) {
      onDone({ type: "err", text: `فرمت فایل مجاز نیست (${mediaType === "image" ? "JPG/PNG/WEBP" : "MP4/WEBM/OGG"})` });
      return;
    }
    if (file.size > maxSize) {
      onDone({ type: "err", text: `حجم فایل باید کمتر از ${mediaType === "image" ? "۵" : "۱۵"} مگابایت باشد` });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setPreview(dataUrl);
  };

  const handleSubmit = async () => {
    if (!preview) { onDone({ type: "err", text: "لطفاً یک فایل انتخاب کنید" }); return; }
    reset();
    const publishAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + Number(expiresIn) * 60 * 60 * 1000).toISOString();
    try {
      await upload("/api/manager/stories", { mediaUrl: preview, mediaType, caption: caption || null, publishAt, expiresAt });
      onDone({ type: "ok", text: "✅ استوری با موفقیت منتشر شد" });
    } catch (e: any) {
      onDone({ type: "err", text: e.message || "خطا در آپلود استوری" });
    }
  };

  return (
    <div className="bg-[#0B1120] border border-white/10 rounded-[16px] p-5 mb-6 space-y-4">
      <div className="flex items-center gap-2">
        {(["image", "video"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setMediaType(t); setPreview(null); }}
            className={`px-4 py-2 rounded-[10px] text-xs font-black cursor-pointer ${mediaType === t ? "bg-primary-600 text-white" : "bg-white/5 text-slate-400"}`}
          >
            {t === "image" ? "تصویر" : "ویدئو"}
          </button>
        ))}
      </div>

      {!preview ? (
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/15 rounded-[14px] py-10 cursor-pointer hover:border-primary-500/50 transition-colors">
          <ImagePlus className="w-8 h-8 text-slate-500" />
          <span className="text-xs text-slate-400 font-bold">
            برای آپلود {mediaType === "image" ? "تصویر" : "ویدئو"} کلیک کنید
          </span>
          <input
            type="file"
            accept={mediaType === "image" ? "image/jpeg,image/jpg,image/png,image/webp" : "video/mp4,video/webm,video/ogg"}
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="relative w-40 mx-auto aspect-[9/16] rounded-[14px] overflow-hidden border border-white/10">
          {mediaType === "video" ? (
            <video src={preview} className="w-full h-full object-cover" controls />
          ) : (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          )}
          <button
            onClick={() => setPreview(null)}
            className="absolute top-1.5 left-1.5 p-1.5 rounded-full bg-black/60 text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div>
        <label className="text-[11px] font-bold text-slate-400 block mb-1.5">توضیح کوتاه (اختیاری)</label>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={255}
          placeholder="مثلاً: کلاس امروز آموزشگاه"
          className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-semibold text-white placeholder:text-slate-600"
        />
      </div>

      <div>
        <label className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-1.5">
          <CalendarClock className="w-3.5 h-3.5" /> مدت نمایش استوری
        </label>
        <select
          value={expiresIn}
          onChange={(e) => setExpiresIn(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-bold text-white cursor-pointer"
        >
          <option value="6">۶ ساعت</option>
          <option value="12">۱۲ ساعت</option>
          <option value="24">۲۴ ساعت (پیش‌فرض)</option>
          <option value="48">۴۸ ساعت</option>
          <option value="72">۳ روز</option>
          <option value="168">۷ روز</option>
        </select>
      </div>

      {state.status !== "idle" && <UploadProgress state={state} onCancel={cancel} fileName={`استوری ${mediaType === "image" ? "تصویری" : "ویدئویی"}`} />}

      <div className="flex gap-2">
        <button onClick={onCancel} className="px-4 py-2.5 rounded-[10px] text-xs font-bold text-slate-400 bg-white/5 cursor-pointer">
          انصراف
        </button>
        <button
          onClick={handleSubmit}
          disabled={!preview || state.status === "uploading"}
          className="flex-1 py-2.5 rounded-[10px] text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
        >
          {state.status === "uploading" ? "در حال انتشار..." : "انتشار استوری"}
        </button>
      </div>
    </div>
  );
}
