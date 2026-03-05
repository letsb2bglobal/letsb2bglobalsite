"use client";

import { useEffect } from "react";

/**
 * Runs ScrollTrigger.refresh() after fonts and a short delay when the landing
 * page mounts. Reduces jump-backs from layout shifts (images/fonts) and keeps
 * scrub/pin positions correct. Only mount this when the landing is visible.
 */
export default function LandingScrollTriggerRefresh() {
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    void import("gsap/ScrollTrigger").then((mod) => {
      if (cancelled) return;
      const ScrollTrigger = mod.default;

      const refresh = () => {
        if (!cancelled) ScrollTrigger.refresh();
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(refresh);
      } else {
        refresh();
      }
      timeoutId = setTimeout(refresh, 1200);
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return null;
}
