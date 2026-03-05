"use client";

import React from "react";
import Typewriter from "typewriter-effect";

const SEGMENTS: { text: string; gray: boolean }[] = [
  { text: "We are a global ", gray: true },
  { text: "B2B networking", gray: false },
  { text: " and ", gray: true },
  { text: "trading platform", gray: false },
  { text: " built exclusively for tourism ", gray: true },
  { text: "& hospitality.", gray: false },
  { text: " Connect with ", gray: true },
  { text: "verified professionals", gray: false },
  { text: " and ", gray: true },
  { text: "businesses", gray: false },
  { text: " across markets.", gray: true },
];

function segmentToHtml(segment: { text: string; gray: boolean }): string {
  const style = segment.gray
    ? "color:#969696"
    : "font-weight:700;color:black";
  // Only escape < and > so they aren't parsed as HTML. Do not escape & or
  // the typewriter will show "&;" literally when it types character-by-character.
  const escaped = segment.text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<span style="${style};margin-right:10px">${escaped}</span>`;
}

export default function Section2Intro() {
  return (
    <section
      id="intro"
      data-section="intro"
      className="relative bg-white border-t-[3px] border-[#22c55e] py-16 lg:py-20"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e91e8c]" aria-hidden="true" />
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="pl-6 lg:pl-8 min-h-[12rem] sm:min-h-[14rem] md:min-h-[16rem] lg:min-h-[18rem] xl:min-h-[20rem]">
          <div
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-snug"
            aria-live="polite"
          >
            <Typewriter
              options={{
                cursor: "",
                delay: 50,
                skipAddStyles: true,
                wrapperClassName: "Typewriter__wrapper inline",
                cursorClassName: "hidden",
              }}
              onInit={(tw) => {
                SEGMENTS.forEach((seg) => {
                  tw.typeString(segmentToHtml(seg));
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
