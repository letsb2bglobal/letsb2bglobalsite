"use client";

import React, { useEffect, useRef } from "react";
import { howItWorksCards as steps } from "@/data/howItWorks";

const VIEWBOX_WIDTH = 1240;
const VIEWBOX_HEIGHT = 860;

const cardPositions = {
  tl: { left: 60, top: 40 },
  mr: { right: 60, left: "auto", top: 240 },
  bl: { left: 60, top: 500 },
  br: { right: 60, left: "auto", top: 680 },
};

const CARD_W = 520;
const CARD_H = 160;

function IconRegister() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconVerify() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconConnect() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconCollaborate() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-80"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

const stepIcons = [IconRegister, IconVerify, IconConnect, IconCollaborate];

export default function HowItWorksFlow() {
  const sectionRef = useRef(null);
  const pathARef = useRef(null);
  const pathBRef = useRef(null);
  const pathCRef = useRef(null);
  const cardsWrapperRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([gsapModule, stModule]) => {
        if (!mounted) return;
        const gsap = gsapModule.default;
        const ScrollTrigger = stModule.default;
        gsap.registerPlugin(ScrollTrigger);

        const section = sectionRef.current;
        const pathA = pathARef.current;
        const pathB = pathBRef.current;
        const pathC = pathCRef.current;
        const cardsWrapper = cardsWrapperRef.current;
        if (!section || !cardsWrapper) return;

        const ctx = gsap.context(() => {
          const cards = Array.from(
            cardsWrapper.querySelectorAll("[data-how-card]")
          );
          const paths = [pathA, pathB, pathC].filter(Boolean);

          if (headingRef.current)
            gsap.set(headingRef.current, { opacity: 0, y: 16 });
          if (subtitleRef.current)
            gsap.set(subtitleRef.current, { opacity: 0, y: 12 });
          cards.forEach((card) => gsap.set(card, { opacity: 0, y: 24 }));
          paths.forEach((path) => {
            if (!path) return;
            const len = path.getTotalLength();
            path.style.strokeDashoffset = String(len);
          });

          const tl = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "+=1000",
              scrub: 1,
              once: false,
            },
          });

          const cardDur = 0.6;
          const pathDur = 0.9;

          if (headingRef.current)
            tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.4 });
          if (subtitleRef.current)
            tl.to(subtitleRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.35,
            }, "-=0.25");

          if (cards[0])
            tl.to(cards[0], { opacity: 1, y: 0, duration: cardDur }, "+=0.15");
          if (pathA)
            tl.to(pathA, { strokeDashoffset: 0, duration: pathDur }, "+=0.12");
          if (cards[1])
            tl.to(cards[1], { opacity: 1, y: 0, duration: cardDur }, "+=0.1");
          if (pathB)
            tl.to(pathB, { strokeDashoffset: 0, duration: pathDur }, "+=0.12");
          if (cards[2])
            tl.to(cards[2], { opacity: 1, y: 0, duration: cardDur }, "+=0.1");
          if (pathC)
            tl.to(pathC, { strokeDashoffset: 0, duration: pathDur }, "+=0.12");
          if (cards[3])
            tl.to(cards[3], { opacity: 1, y: 0, duration: cardDur }, "+=0.1");
        }, section);

        cleanupRef.current = () => {
          ctx.revert();
          scrollTriggerRef.current = null;
        };
      }
    );

    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full bg-white py-10 md:py-14 px-4 md:px-8 overflow-hidden"
    >
      <div className="max-w-[1240px] mx-auto">
        <h2
          ref={headingRef}
          className="opacity-0 text-4xl md:text-5xl font-bold text-gray-900 text-center mb-4"
        >
          How It Works
        </h2>
        <p
          ref={subtitleRef}
          className="opacity-0 text-gray-600 text-center text-base md:text-lg max-w-xl mx-auto mb-12 md:mb-0"
        >
          Four simple steps to join and grow on the network.
        </p>

        {/* Desktop: zig-zag layout with SVG connectors */}
        <div
          className="hidden md:block relative w-full mx-auto"
          style={{ height: VIEWBOX_HEIGHT }}
        >
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Path A: Card1 right-center → right → down to Card2 left-center */}
            <path
              ref={pathARef}
              d="M 580 120 L 660 120 L 660 320"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeDasharray="12 10"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Path B: Card2 bottom-center → down → left across gap → down to Card3 left-center */}
            <path
              ref={pathBRef}
              d="M 920 400 L 920 450 L 60 450 L 60 580"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeDasharray="12 10"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Path C: Card3 right-center → right → down to Card4 left-center */}
            <path
              ref={pathCRef}
              d="M 580 580 L 660 580 L 660 760"
              stroke="#9CA3AF"
              strokeWidth="4"
              strokeDasharray="12 10"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div ref={cardsWrapperRef} className="contents">
          {steps.map((step, i) => {
            const pos = cardPositions[step.position];
            const Icon = stepIcons[i];
            const isPurple = step.variant === "purple";
            return (
              <div
                key={step.number}
                data-how-card
                className="absolute w-[520px] h-[180px] rounded-3xl shadow-sm flex items-center gap-6 px-8 py-6 opacity-0"
                style={{
                  left: pos.left,
                  right: pos.right,
                  top: pos.top,
                  backgroundColor: isPurple ? "#6B2A7A" : "#F5F6F8",
                  color: isPurple ? "white" : "#111827",
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1.5 mb-3 ${
                      isPurple
                        ? "bg-white/20 text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/30 text-sm font-bold">
                      {step.number}
                    </span>
                    <span className="text-lg font-semibold">{step.title}</span>
                  </div>
                  <p
                    className={`text-lg leading-relaxed ${
                      isPurple ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    {step.description}
                  </p>
                </div>
                <div
                  className={`shrink-0 ${
                    isPurple ? "text-white" : "text-gray-700"
                  }`}
                >
                  <Icon />
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {/* Mobile: vertical stack */}
        <div className="md:hidden space-y-6 max-w-lg mx-auto pt-4">
          {steps.map((step, i) => {
            const Icon = stepIcons[i];
            const isPurple = step.variant === "purple";
            return (
              <div key={step.number} className="relative flex">
                {i < steps.length - 1 && (
                  <div
                    className="absolute left-6 top-[72px] bottom-0 w-0 border-l-4 border-dashed border-gray-300 -mb-6"
                    style={{ height: "calc(100% + 24px)" }}
                  />
                )}
                <div
                  className="relative w-full rounded-3xl shadow-sm flex items-center gap-4 px-6 py-6 min-h-[160px]"
                  style={{
                    backgroundColor: isPurple ? "#6B2A7A" : "#F5F6F8",
                    color: isPurple ? "white" : "#111827",
                  }}
                >
                  <div
                    className={`shrink-0 ${
                      isPurple ? "text-white" : "text-gray-700"
                    }`}
                  >
                    <Icon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1.5 mb-2 ${
                        isPurple
                          ? "bg-white/20 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                    >
                      <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white/30 text-sm font-bold">
                        {step.number}
                      </span>
                      <span className="text-lg font-semibold">{step.title}</span>
                    </div>
                    <p
                      className={`text-lg leading-relaxed ${
                        isPurple ? "text-white/90" : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
