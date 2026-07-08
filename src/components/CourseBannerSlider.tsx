"use client";

import { useState, useEffect } from "react";

export default function CourseBannerSlider({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % images.length), 3500);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full h-48 lg:h-64 rounded-[20px] overflow-hidden mb-8 shadow-lg border border-border-default">
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === active ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="absolute top-3 right-3 z-10">
        <span className="text-[11px] font-black text-white bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
          بنر تبلیغاتی دوره
        </span>
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${i === active ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
