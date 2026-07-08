"use client";

import { useCallback, useRef, useState } from "react";

export type UploadStatus = "idle" | "uploading" | "success" | "error" | "cancelled";

export interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100
  loadedBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
  etaSeconds: number | null;
  error: string | null;
}

const initialState: UploadState = {
  status: "idle",
  progress: 0,
  loadedBytes: 0,
  totalBytes: 0,
  speedBytesPerSec: 0,
  etaSeconds: null,
  error: null,
};

/**
 * Professional upload hook with real-time progress, speed and ETA,
 * built on XMLHttpRequest (fetch() does not expose upload progress
 * reliably across browsers). Works for any JSON payload containing
 * a base64 data URL (images/videos/documents) sent to a Next.js API route.
 */
export function useFileUpload<TResponse = any>() {
  const [state, setState] = useState<UploadState>(initialState);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const startTimeRef = useRef<number>(0);

  const reset = useCallback(() => setState(initialState), []);

  const cancel = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
    }
  }, []);

  const upload = useCallback(
    (url: string, body: Record<string, any>, method: "POST" | "PATCH" | "DELETE" = "POST"): Promise<TResponse> => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        startTimeRef.current = Date.now();

        setState({ ...initialState, status: "uploading" });

        xhr.open(method, url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        xhr.upload.onprogress = (e) => {
          if (!e.lengthComputable) return;
          const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
          const speed = elapsedSec > 0 ? e.loaded / elapsedSec : 0;
          const remainingBytes = e.total - e.loaded;
          const eta = speed > 0 ? remainingBytes / speed : null;

          setState({
            status: "uploading",
            progress: Math.round((e.loaded / e.total) * 100),
            loadedBytes: e.loaded,
            totalBytes: e.total,
            speedBytesPerSec: speed,
            etaSeconds: eta,
            error: null,
          });
        };

        xhr.onload = () => {
          let json: any = {};
          try {
            json = JSON.parse(xhr.responseText);
          } catch {
            /* ignore parse errors */
          }
          if (xhr.status >= 200 && xhr.status < 300) {
            setState((s) => ({ ...s, status: "success", progress: 100 }));
            resolve(json as TResponse);
          } else {
            const errMsg = json?.error || `خطای سرور (${xhr.status})`;
            setState((s) => ({ ...s, status: "error", error: errMsg }));
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => {
          setState((s) => ({ ...s, status: "error", error: "خطا در ارتباط با سرور" }));
          reject(new Error("Network error"));
        };

        xhr.onabort = () => {
          setState((s) => ({ ...s, status: "cancelled", error: "آپلود لغو شد" }));
          reject(new Error("Upload cancelled"));
        };

        xhr.send(JSON.stringify(body));
      });
    },
    []
  );

  return { state, upload, cancel, reset };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatSeconds(sec: number | null): string {
  if (sec === null || !isFinite(sec)) return "—";
  if (sec < 1) return "کمتر از ۱ ثانیه";
  if (sec < 60) return `${Math.ceil(sec)} ثانیه`;
  return `${Math.ceil(sec / 60)} دقیقه`;
}
