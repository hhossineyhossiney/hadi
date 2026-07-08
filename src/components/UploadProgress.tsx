"use client";

import { CheckCircle2, XCircle, X, Loader2 } from "lucide-react";
import { formatBytes, formatSeconds, type UploadState } from "@/lib/useFileUpload";

export default function UploadProgress({
  state,
  onCancel,
  fileName,
}: {
  state: UploadState;
  onCancel?: () => void;
  fileName?: string;
}) {
  if (state.status === "idle") return null;

  return (
    <div className="p-4 rounded-[14px] bg-bg-secondary border border-border-default">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {state.status === "uploading" && <Loader2 className="w-4 h-4 text-primary-600 animate-spin shrink-0" />}
          {state.status === "success" && <CheckCircle2 className="w-4 h-4 text-success-600 shrink-0" />}
          {(state.status === "error" || state.status === "cancelled") && (
            <XCircle className="w-4 h-4 text-error-600 shrink-0" />
          )}
          <span className="text-xs font-bold text-text-primary truncate">
            {fileName || "در حال آپلود فایل..."}
          </span>
        </div>
        {state.status === "uploading" && onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded-full hover:bg-error-50 text-error-500 shrink-0 cursor-pointer"
            title="لغو آپلود"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="h-2 rounded-full bg-border-light overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-200 ${
            state.status === "error" || state.status === "cancelled"
              ? "bg-error-500"
              : state.status === "success"
              ? "bg-success-500"
              : "gradient-button"
          }`}
          style={{ width: `${state.progress}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-bold text-text-tertiary">
        <span>{state.progress}٪</span>
        {state.status === "uploading" && (
          <>
            <span>
              {formatBytes(state.loadedBytes)} از {formatBytes(state.totalBytes)}
            </span>
            <span>{formatBytes(state.speedBytesPerSec)}/ثانیه</span>
            <span>زمان باقی‌مانده: {formatSeconds(state.etaSeconds)}</span>
          </>
        )}
        {state.status === "success" && <span className="text-success-600">آپلود با موفقیت انجام شد</span>}
        {state.status === "error" && <span className="text-error-600">{state.error}</span>}
        {state.status === "cancelled" && <span className="text-error-600">آپلود لغو شد</span>}
      </div>
    </div>
  );
}
