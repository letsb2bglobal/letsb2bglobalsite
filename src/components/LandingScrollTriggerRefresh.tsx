"use client";

import { useEffect, useRef } from "react";

/**
 * Centralized ScrollTrigger.refresh() for the landing page.
 * Mount only when the landing is visible. Waits for fonts, then refresh; fallback after 1s; debounced resize (width change only).
 */
export default function LandingScrollTriggerRefresh() {
  const lastWidthRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    let fallbackId: ReturnType<typeof setTimeout> | undefined;
    let resizeId: ReturnType<typeof setTimeout> | undefined;

    void import("gsap/ScrollTrigger").then((mod) => {
      if (cancelled) return;
      const ScrollTrigger = mod.default;

      const refresh = () => {
        if (!cancelled) ScrollTrigger.refresh();
        if (typeof process !== "undefined" && process.env.NODE_ENV === "development") {
          console.log("Active Triggers:", ScrollTrigger.getAll().length);
        }
      };

      document.fonts?.ready.then(() => {
        if (!cancelled) refresh();
      });

      fallbackId = setTimeout(refresh, 1000);

      const onResize = () => {
        const w = window.innerWidth;
        if (lastWidthRef.current !== null && lastWidthRef.current !== w) {
          if (resizeId) clearTimeout(resizeId);
          resizeId = setTimeout(() => {
            resizeId = undefined;
            if (!cancelled) refresh();
          }, 200);
        }
        lastWidthRef.current = w;
      };

      lastWidthRef.current = window.innerWidth;
      window.addEventListener("resize", onResize);

      cleanupRef.current = () => {
        cancelled = true;
        if (fallbackId) clearTimeout(fallbackId);
        if (resizeId) clearTimeout(resizeId);
        window.removeEventListener("resize", onResize);
        cleanupRef.current = null;
      };
    });

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
  }, []);

  return null;
}
