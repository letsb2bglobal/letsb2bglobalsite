"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const STATS = [
  "200+ DMC across Kerala",
  "120+ Hotels In GOA",
  "100+ Travel Agents Across Thailand",
  "100+ Tour Operators Across India",
  "200+ DMC across India",
  "80+ MICE Partners",
  "150+ Inbound Tour Operators",
  "90+ Hotels in Rajasthan",
  "110+ Travel Agents in Dubai",
];

export default function GreenBarMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const width = el.offsetWidth / 2;
    const tween = gsap.to(el, {
      x: -width,
      duration: 30,
      repeat: -1,
      ease: "none",
    });

    return () => tween.kill();
  }, []);

  return (
    <div className="overflow-hidden bg-[#22c55e] py-[0.96rem]">
      <div
        ref={trackRef}
        className="flex gap-8 sm:gap-12 text-white font-semibold text-base whitespace-nowrap"
        style={{ width: "max-content" }}
      >
        {[...STATS, ...STATS].map((text, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-12">
            <span>{text}</span>
            <span className="text-white/50 select-none">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}
