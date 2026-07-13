"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X, FileText, ImagePlus, Trash2, Pencil, Loader2, Plus, Eye,
  BadgeCheck, Clock, XCircle, Save, FileType,
} from "lucide-react";
import UploadProgress from "@/components/UploadProgress";
import { useFileUpload } from "@/lib/useFileUpload";

interface StudentDocument {
  id: number;
  title: string;
  fileUrl: string;
  fileType: string;
  documentNumber: string | null;
  serialNumber: string | null;
  issueDate: string | null;
  validity: "valid" | "expired" | "pending_review";
  description: string | null;
  createdAt: string;
}

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_FILE_BYTES = 2_200_000; // ~1.5MB raw

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const VALIDITY_LABELS: Record<string, { label: string; icon: any; className: string }> = {
  valid: { label: "معتبر", icon: BadgeCheck, className: "bg-emerald-500/15 text-emerald-400" },
  expired: { label: "منقضی شده", icon: XCircle, className: "bg-error-500/15 text-error-400" },
  pending_review: { label: "در حال بررسی", icon: Clock, className: "bg-amber-500/15 text-amber-400" },
};

const emptyForm = {
  title: "",
  documentNumber: "",
  serialNumber: "",
  issueDate: "",
  validity: "pending_review" as "valid" | "expired" | "pending_review",
  description: "",
};

export default function StudentDocumentsModal({
  registrationId,
  studentName,
  onClose,
}: {
  registrationId: number;
  studentName: string;
  onClose: () => void;
}) {
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StudentDocument | null>(null);
  const { state, upload, cancel, reset } = useFileUpload();

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/manager/documents?registrationId=${registrationId}`);
    if (res.ok) setDocs(await res.json());
    setLoading(false);
  }, [registrationId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleFileSelect = async (file: File) => {
    setMsg(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setMsg({ type: "err", text: "فرمت فایل مجاز نیست. فقط PDF، JPG و PNG پذیرفته می‌شود" });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setMsg({ type: "err", text: "حجم فایل باید کمتر از ۱.۵ مگابایت باشد" });
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setFilePreview(dataUrl);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setFilePreview(null);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (doc: StudentDocument) => {
    setForm({
      title: doc.title,
      documentNumber: doc.documentNumber || "",
      serialNumber: doc.serialNumber || "",
      issueDate: doc.issueDate || "",
      validity: doc.validity,
      description: doc.description || "",
    });
    setFilePreview(null);
    setEditingId(doc.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { setMsg({ type: "err", text: "عنوان مدرک الزامی است" }); return; }
    if (!editingId && !filePreview) { setMsg({ type: "err", text: "لطفاً فایل مدرک را انتخاب کنید" }); return; }

    reset();
    try {
      if (editingId) {
        const payload: any = { documentId: editingId, ...form };
        if (filePreview) payload.fileUrl = filePreview;
        await upload("/api/manager/documents", payload, "PATCH");
        setMsg({ type: "ok", text: "✅ مدرک با موفقیت ویرایش شد" });
      } else {
        await upload("/api/manager/documents", { registrationId, fileUrl: filePreview, ...form }, "POST");
        setMsg({ type: "ok", text: "✅ مدرک با موفقیت ثبت شد" });
      }
      resetForm();
      fetchDocs();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message || "خطا در ثبت مدرک" });
    }
  };

  const handleDelete = async (documentId: number) => {
    if (!confirm("آیا از حذف این مدرک مطمئن هستید؟")) return;
    const res = await fetch("/api/manager/documents", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    });
    if (res.ok) { setMsg({ type: "ok", text: "✅ مدرک حذف شد" }); fetchDocs(); }
    else setMsg({ type: "err", text: "خطا در حذف مدرک" });
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-white/10 rounded-[20px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0B1120] z-10 flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h3 className="font-black text-white text-base">مدیریت مدارک هنرجو</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{studentName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[10px] hover:bg-white/10 text-slate-400 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {msg && (
            <div className={`text-xs font-bold p-3 rounded-[10px] ${msg.type === "ok" ? "bg-success-500/10 text-success-400" : "bg-error-500/10 text-error-400"}`}>
              {msg.text}
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 rounded-[12px] bg-primary-600 hover:bg-primary-700 text-white text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> افزودن مدرک جدید
            </button>
          )}

          {showForm && (
            <div className="bg-[#111a2e] border border-white/10 rounded-[16px] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">{editingId ? "ویرایش مدرک" : "افزودن مدرک جدید"}</span>
                <button onClick={resetForm} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">عنوان مدرک *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثلاً: مدرک پایان دوره ICDL"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-semibold text-white placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">شماره مدرک</label>
                  <input
                    value={form.documentNumber}
                    onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-semibold text-white"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">شماره سریال</label>
                  <input
                    value={form.serialNumber}
                    onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-semibold text-white"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">تاریخ صدور</label>
                  <input
                    value={form.issueDate}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    placeholder="۱۴۰۳/۰۵/۱۲"
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-semibold text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1.5">وضعیت اعتبار</label>
                  <select
                    value={form.validity}
                    onChange={(e) => setForm({ ...form, validity: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs font-bold text-white cursor-pointer"
                  >
                    <option value="pending_review">در حال بررسی</option>
                    <option value="valid">معتبر</option>
                    <option value="expired">منقضی شده</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">توضیحات</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-white/5 border border-white/10 text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  فایل مدرک {editingId ? "(اختیاری — برای جایگزینی)" : "*"}
                </label>
                {!filePreview ? (
                  <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/15 rounded-[12px] py-6 cursor-pointer hover:border-primary-500/50 transition-colors">
                    <ImagePlus className="w-5 h-5 text-slate-500" />
                    <span className="text-xs text-slate-400 font-bold">انتخاب فایل (PDF / JPG / PNG)</span>
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/jpg,image/png"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-[10px] bg-white/5 border border-white/10">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileType className="w-4 h-4 text-primary-400" /> فایل انتخاب شد
                    </span>
                    <button onClick={() => setFilePreview(null)} className="text-error-400 cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {state.status !== "idle" && <UploadProgress state={state} onCancel={cancel} fileName="مدرک هنرجو" />}

              <button
                onClick={handleSubmit}
                disabled={state.status === "uploading"}
                className="w-full py-2.5 rounded-[10px] text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> {editingId ? "ذخیره تغییرات" : "ثبت مدرک"}
              </button>
            </div>
          )}

          {/* Documents list */}
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
          ) : docs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">هنوز مدرکی برای این هنرجو ثبت نشده است</div>
          ) : (
            <div className="space-y-3">
              {docs.map((doc) => {
                const validityInfo = VALIDITY_LABELS[doc.validity] || VALIDITY_LABELS.pending_review;
                return (
                  <div key={doc.id} className="bg-[#111a2e] border border-white/5 rounded-[14px] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-[10px] bg-primary-500/15 flex items-center justify-center shrink-0">
                          {doc.fileType === "pdf" ? <FileText className="w-5 h-5 text-primary-400" /> : <ImagePlus className="w-5 h-5 text-primary-400" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">{doc.title}</div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-slate-500">
                            {doc.documentNumber && <span>شماره: {doc.documentNumber}</span>}
                            {doc.serialNumber && <span>سریال: {doc.serialNumber}</span>}
                            {doc.issueDate && <span>صدور: {doc.issueDate}</span>}
                          </div>
                          <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-black ${validityInfo.className}`}>
                            <validityInfo.icon className="w-2.5 h-2.5" /> {validityInfo.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setPreviewDoc(doc)} className="p-1.5 rounded-[8px] bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer" title="مشاهده">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => startEdit(doc)} className="p-1.5 rounded-[8px] bg-primary-500/15 hover:bg-primary-500/30 text-primary-400 cursor-pointer" title="ویرایش">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)} className="p-1.5 rounded-[8px] bg-error-500/15 hover:bg-error-500/30 text-error-400 cursor-pointer" title="حذف">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {doc.description && <p className="text-[11px] text-slate-500 mt-2.5 pt-2.5 border-t border-white/5">{doc.description}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-black/85 z-[210] flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="relative max-w-2xl w-full max-h-[85vh] bg-white rounded-[14px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {previewDoc.fileType === "pdf" ? (
              <iframe src={previewDoc.fileUrl} className="w-full h-[80vh]" title={previewDoc.title} />
            ) : (
              <img src={previewDoc.fileUrl} alt={previewDoc.title} className="w-full h-auto object-contain" loading="lazy" decoding="async" />
            )}
            <button onClick={() => setPreviewDoc(null)} className="absolute top-2 left-2 p-2 rounded-full bg-black/60 text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
