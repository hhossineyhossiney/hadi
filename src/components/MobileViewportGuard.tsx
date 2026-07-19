"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Some Android browsers preserve a previous horizontal document offset after a
 * wide carousel or an older cached layout. Keep the document at x=0 while
 * leaving nested horizontal scrollers (carousels/tables) untouched.
 */
export default function MobileViewportGuard() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    const root = document.documentElement;
    const body = document.body;
    root.style.overflowX = "hidden";
    body.style.overflowX = "hidden";

    const resetHorizontalOffset = () => {
      const scroller = document.scrollingElement;
      const offset = window.scrollX || scroller?.scrollLeft || root.scrollLeft || body.scrollLeft || 0;
      if (Math.abs(offset) < 0.5) return;
      const top = window.scrollY;
      if (scroller) scroller.scrollLeft = 0;
      root.scrollLeft = 0;
      body.scrollLeft = 0;
      window.scrollTo({ left: 0, top, behavior: "auto" });
    };

    const frame = requestAnimationFrame(resetHorizontalOffset);
    const shortTimer = window.setTimeout(resetHorizontalOffset, 120);
    const settleTimer = window.setTimeout(resetHorizontalOffset, 700);
    window.addEventListener("scroll", resetHorizontalOffset, { passive: true });
    window.addEventListener("resize", resetHorizontalOffset, { passive: true });
    window.addEventListener("orientationchange", resetHorizontalOffset, { passive: true });
    window.addEventListener("pageshow", resetHorizontalOffset, { passive: true });
    window.addEventListener("touchend", resetHorizontalOffset, { passive: true });
    window.visualViewport?.addEventListener("resize", resetHorizontalOffset, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(shortTimer);
      clearTimeout(settleTimer);
      window.removeEventListener("scroll", resetHorizontalOffset);
      window.removeEventListener("resize", resetHorizontalOffset);
      window.removeEventListener("orientationchange", resetHorizontalOffset);
      window.removeEventListener("pageshow", resetHorizontalOffset);
      window.removeEventListener("touchend", resetHorizontalOffset);
      window.visualViewport?.removeEventListener("resize", resetHorizontalOffset);
    };
  }, [pathname]);

  return null;
}
