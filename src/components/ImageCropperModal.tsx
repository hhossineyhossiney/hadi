"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { X, Check, ZoomIn } from "lucide-react";
import { getCroppedImage, type CropArea } from "@/lib/cropImage";

export default function ImageCropperModal({
  imageSrc,
  onCancel,
  onCropComplete,
}: {
  imageSrc: string;
  onCancel: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = useCallback((_area: any, areaPixels: CropArea) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const result = await getCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(result);
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
      <div className="bg-surface rounded-[20px] overflow-hidden w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h3 className="font-black text-text-primary text-sm">برش عکس پروفایل</h3>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-bg-secondary cursor-pointer">
            <X className="w-4 h-4 text-text-tertiary" />
          </button>
        </div>

        <div className="relative w-full h-80 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <ZoomIn className="w-4 h-4 text-text-tertiary shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary-600 cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-[12px] text-sm font-bold text-text-secondary bg-bg-secondary border border-border-default cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleConfirm}
              disabled={processing || !croppedAreaPixels}
              className="flex-1 py-3 rounded-[12px] text-sm font-black text-white gradient-button disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" /> {processing ? "در حال پردازش..." : "تأیید و ذخیره"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
