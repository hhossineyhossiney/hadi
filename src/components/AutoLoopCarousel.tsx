"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AutoLoopCarouselProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T) => string | number;
  ariaLabel: string;
  intervalMs?: number;
  itemClassName?: string;
}

export default function AutoLoopCarousel<T>({
  items,
  renderItem,
  getKey,
  ariaLabel,
  intervalMs = 3200,
  itemClassName = "basis-[88%] sm:basis-[48%] lg:basis-[calc((100%-2rem)/3)]",
}: AutoLoopCarouselProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const shouldLoop = items.length > 1;

  const renderedItems = useMemo(
    () => (shouldLoop ? [0, 1, 2, 3, 4].flatMap((copy) => items.map((item, index) => ({ item, index, copy }))) : items.map((item, index) => ({ item, index, copy: 0 }))),
    [items, shouldLoop],
  );

  const getStep = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.children.length) return 0;
    const first = track.children[0] as HTMLElement;
    const style = window.getComputedStyle(track);
    const gap = Number.parseFloat(style.columnGap || style.gap || "0") || 0;
    return first.getBoundingClientRect().width + gap;
  }, []);

  const centerOnMiddleCopy = useCallback(() => {
    if (!shouldLoop || !viewportRef.current) return;
    const step = getStep();
    if (!step) return;
    // Start from the middle copy, leaving two full copies on each side.
    viewportRef.current.scrollLeft = step * items.length * 2;
  }, [getStep, items.length, shouldLoop]);

  useEffect(() => {
    const frame = requestAnimationFrame(centerOnMiddleCopy);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => centerOnMiddleCopy()) : null;
    if (observer && viewportRef.current) observer.observe(viewportRef.current);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [centerOnMiddleCopy]);

  useEffect(() => {
    if (!viewportRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.18 });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  const normalizeLoopPosition = useCallback(() => {
    const viewport = viewportRef.current;
    if (!shouldLoop || !viewport) return;
    const step = getStep();
    if (!step) return;
    const setWidth = step * items.length;
    const current = viewport.scrollLeft;

    let next: number | null = null;
    if (current >= setWidth * 4 - step * 0.2) {
      next = current - setWidth * 2;
    } else if (current <= setWidth + step * 0.2) {
      next = current + setWidth * 2;
    }
    if (next === null) return;

    // Jump between identical copies with snapping and smooth scrolling temporarily
    // disabled. The visible card stays identical, so the loop never runs backward.
    viewport.style.scrollBehavior = "auto";
    viewport.style.scrollSnapType = "none";
    viewport.scrollLeft = next;
    requestAnimationFrame(() => {
      viewport.style.removeProperty("scroll-behavior");
      viewport.style.removeProperty("scroll-snap-type");
    });
  }, [getStep, items.length, shouldLoop]);

  const handleScroll = useCallback(() => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(normalizeLoopPosition, 420);
  }, [normalizeLoopPosition]);

  const move = useCallback((direction: 1 | -1) => {
    const viewport = viewportRef.current;
    const step = getStep();
    if (!viewport || !step) return;
    viewport.scrollBy({ left: direction * step, behavior: "smooth" });
  }, [getStep]);

  const pauseTemporarily = useCallback(() => {
    setPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => setPaused(false), Math.max(intervalMs, 4200));
  }, [intervalMs]);

  useEffect(() => {
    if (!shouldLoop || paused || !visible) return;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const advance = () => {
      if (!document.hidden) move(1);
    };

    // Show movement almost immediately so users recognize the carousel.
    const firstMove = setTimeout(advance, 650);
    const timer = setInterval(advance, intervalMs);
    return () => {
      clearTimeout(firstMove);
      clearInterval(timer);
    };
  }, [intervalMs, move, paused, shouldLoop, visible]);

  useEffect(() => () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full min-w-0 max-w-full overflow-hidden [contain:layout_paint]"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={viewportRef}
        dir="ltr"
        className="w-full min-w-0 max-w-full overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-auto py-3 px-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
        onPointerDown={pauseTemporarily}
        onPointerUp={pauseTemporarily}
        onPointerCancel={pauseTemporarily}
      >
        <div ref={trackRef} className="flex w-full items-stretch gap-4">
          {renderedItems.map(({ item, index, copy }) => (
            <div
              key={`${copy}-${getKey(item)}-${index}`}
              dir="rtl"
              className={`shrink-0 snap-start ${itemClassName}`}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>

      {shouldLoop && (
        <>
          <button
            type="button"
            onClick={() => { pauseTemporarily(); move(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#071426]/85 border border-white/15 text-white shadow-xl backdrop-blur-md flex items-center justify-center hover:bg-primary-600 transition-colors"
            aria-label="اسلاید قبلی"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => { pauseTemporarily(); move(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-[#071426]/85 border border-white/15 text-white shadow-xl backdrop-blur-md flex items-center justify-center hover:bg-primary-600 transition-colors"
            aria-label="اسلاید بعدی"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-1" aria-hidden="true">
            <span className={`w-1.5 h-1.5 rounded-full ${paused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
            <span className="text-[9px] font-bold text-text-tertiary">{paused ? "کنترل دستی" : "نمایش خودکار"}</span>
          </div>
        </>
      )}
    </div>
  );
}
