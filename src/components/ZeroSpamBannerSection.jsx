"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const MARQUEE_ITEMS = [
  "No spam or unsolicited promotions",
  "No misuse of messaging or enquiries",
  "Respect professional ethics",
  "Violations may lead to suspension/termination",
];

export default function ZeroSpamBannerSection() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes zero-spam-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .zero-spam-marquee-track {
            animation: zero-spam-marquee 20s linear infinite;
          }
          @media (prefers-reduced-motion: reduce) {
            .zero-spam-marquee-track {
              animation: none;
            }
          }
        `,
      }} />
      <section className="relative w-full overflow-hidden">
        {/* Top blush strip — 100px to align with diagonal bar overlap */}
        <div
          className="w-full shrink-0"
          style={{ backgroundColor: "#F6EFEF", height: "100px" }}
        />

        {/* Orange marquee bar — slight diagonal (-3deg) */}
        <div
          className="relative z-10 flex h-14 w-full -rotate-2 items-center overflow-hidden"
          style={{ backgroundColor: "#F57C00",top:"-35px", height:"80px" }}
        >
          {reduceMotion ? (
            <div className="flex w-full justify-center gap-6 px-4">
              {MARQUEE_ITEMS.map((text, i) => (
                <span key={i} className="whitespace-nowrap text-4xl font-bold text-white md:text-base">
                  ◆ {text}
                </span>
              ))}
            </div>
          ) : (
            <div className="flex w-full min-w-max items-center gap-8 overflow-hidden py-2">
              <div className="zero-spam-marquee-track flex min-w-max items-center gap-8">
                {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, i) => (
                  <span
                    key={i}
                    className="shrink-0 whitespace-nowrap text-sm font-bold text-white md:text-base"
                  >
                    ◆ {text}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark CTA block with grid overlay — pulled up 65px so rotated bar overlaps */}
        <div
          className="relative px-4 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20"
          style={{
            background: "linear-gradient(180deg, #0B0C10 0%, #14161C 100%)",
            marginTop: "-65px",
          }}
        >
          {/* Vertical grid lines overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              backgroundImage: `repeating-linear-gradient(
                to right,
                rgba(255,255,255,0.06) 0px,
                rgba(255,255,255,0.06) 1px,
                transparent 1px,
                transparent 60px
              )`,
            }}
          />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <h2 className="text-3xl pt-4 font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              LetsB2B is not a social network.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              It is a professional tourism and hospitality trade platform built
              for serious businesses that value credibility, trust, and
              sustainable growth.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/signup"
                className="inline-block w-full max-w-sm rounded-xl px-8 py-4 text-center text-lg font-medium text-white transition-opacity hover:opacity-95"
                style={{ backgroundColor: "#F57C00" }}
              >
                LetsB2B Now
              </Link>
            </div>
            <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-white/60">
              <span>Limited Spots</span>
              <span aria-hidden>•</span>
              <span>Verified Members</span>
              <span aria-hidden>•</span>
              <span>Exclusive Benefits</span>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
