"use client";

import React from "react";
import Typewriter from "typewriter-effect";

export default function Section2Intro() {
  const segments = [
    { text: "We are a global ", gray: true },
    { text: "B2B networking and trading platform", gray: false },
    { text: " built exclusively to connect ", gray: true },
    { text: "verified businesses across the", gray: true },
    { text: "tourism and hospitality industry.", gray: false },
  ];

  return (
    <section
      id="intro"
      data-section="intro"
      className="relative bg-white border-t-[3px] border-emerald-500 py-10 lg:py-24"
    >
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="min-h-[10rem] sm:min-h-[12rem] md:min-h-[14rem] lg:min-h-[16rem]">
          <div
            className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-medium leading-[1.2] tracking-tight text-gray-900 break-words"
            aria-live="polite"
          >
            <Typewriter
              options={{
                cursor: "|",
                delay: 40,
                autoStart: true,
                loop: false,
              }}
              onInit={(tw) => {
                segments.forEach((seg) => {
                  const style = seg.gray
                    ? "color:#9ca3af;font-weight:400"
                    : "color:#111827;font-weight:800";
                  tw.typeString(`<span style="${style}">${seg.text}</span> `);
                });
                tw.callFunction(() => {
                  // After typing finishes, refresh GSAP triggers because height might have changed
                  import("gsap/ScrollTrigger").then((mod) => {
                    mod.default.refresh();
                  });
                });
                tw.start();
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
