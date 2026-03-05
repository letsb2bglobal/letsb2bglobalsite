"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";

const SEGMENTS: { text: string; gray: boolean }[] = [
  { text: "We are a global ", gray: true },
  { text: "B2B networking", gray: false },
  { text: " & ", gray: true },
  { text: "trading platform", gray: false },
  { text: " built exclusively for tourism ", gray: true },
  { text: "& hospitality.", gray: false },
  { text: " Connect with ", gray: true },
  { text: "verified professionals", gray: false },
  { text: " & ", gray: true },
  { text: "businesses", gray: false },
  { text: " across markets.", gray: true },
];

// Split into words, preserving leading and trailing spaces so spacing is correct
function getWords() {
  return SEGMENTS.flatMap((s) => {
    if (s.text.length <= 3) return [{ word: s.text, gray: s.gray }];
    const parts = s.text.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return s.text ? [{ word: s.text, gray: s.gray }] : [];
    const result: string[] = [];
    for (let i = 0; i < parts.length; i++) {
      const prefix = i === 0 && s.text.startsWith(" ") ? " " : "";
      const suffix = i === parts.length - 1 && s.text.endsWith(" ") ? " " : i < parts.length - 1 ? " " : "";
      result.push(prefix + parts[i] + suffix);
    }
    return result.map((word) => ({ word, gray: s.gray }));
  });
}

const WORDS = getWords();

const TOTAL_CHARS = WORDS.reduce((n, { word }) => n + word.length, 0);
const TYPING_DURATION = 6;
const CHAR_RATE = TYPING_DURATION / TOTAL_CHARS;

export default function Section2Intro() {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let tl: gsap.core.Timeline | null = null;

    const run = () => {
      const spans = container.querySelectorAll<HTMLSpanElement>(".word-reveal");
      if (!spans.length) return;

      let time = 0;
      const tweens: { el: HTMLSpanElement; start: number; duration: number; chars: number; fullWidth: number }[] = [];
      spans.forEach((el) => {
        const chars = el.textContent?.length ?? 1;
        const fullWidth = el.scrollWidth;
        const duration = chars * CHAR_RATE;
        tweens.push({ el, start: time, duration, chars, fullWidth });
        time += duration;
      });

      tweens.forEach(({ el }) => {
        gsap.set(el, { width: 0, overflow: "hidden", display: "inline-block", verticalAlign: "bottom" });
      });

      tl = gsap.timeline({ delay: 0.3 });
      const timeline = tl;
      tweens.forEach(({ el, start, duration, chars, fullWidth }) => {
        timeline.to(
          el,
          {
            width: fullWidth,
            duration,
            ease: `steps(${chars})`,
            overflow: "hidden",
          },
          start
        );
      });
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }

    return () => {
      tl?.kill();
      container.querySelectorAll<HTMLSpanElement>(".word-reveal").forEach((el) => {
        gsap.set(el, { clearProps: "width,overflow,display,verticalAlign" });
      });
    };
  }, []);

  return (
    <section
      id="intro"
      data-section="intro"
      className="relative bg-white border-t-[3px] border-[#22c55e] py-16 lg:py-20"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e91e8c]" aria-hidden="true" />
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="pl-6 lg:pl-8 min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem] lg:min-h-[18rem] xl:min-h-[20rem]">
          <p ref={containerRef} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-snug">
            {WORDS.map(({ word, gray }, i) => (
              <span
                key={i}
                className="word-reveal"
                style={
                  gray
                    ? { color: "#969696", marginRight: "10px" }
                    : { fontWeight: 700, color: "black", marginRight: "10px" }
                }
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
