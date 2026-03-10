"use client";

import React, { useEffect, useRef } from "react";
import { howItWorksCards as steps } from "@/data/howItWorks";

const VIEWBOX_WIDTH = 1240;
const VIEWBOX_HEIGHT = 860;

const cardPositions = {
  tl: { left: 40, top: 40 },
  mr: { right: 40, left: "auto", top: 240 },
  bl: { left: 40, top: 520 },
  br: { right: 40, left: "auto", top: 720 },
};

const CARD_W = 520;
const CARD_H = 160;

// function IconDoc() {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
//     </svg>
//   );
// }

// function IconCheck() {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//     </svg>
//   );
// }

const stepIcons = [
  "/howitworks/page.svg",
  "/howitworks/verify.svg",
  "/howitworks/connect.svg",
  "/howitworks/collaborate.svg"
];

function PillBadge({ number, title, isPurple }) {
  const badgeBg = isPurple ? "bg-white" : "bg-[#1A1A1A]";
  const circleBg = isPurple ? "bg-[#F3E8FF]" : "bg-[#333333]";
  const textColor = isPurple ? "text-[#6B2A7A]" : "text-white";
  const numColor = isPurple ? "text-[#6B2A7A]" : "text-white";

  return (
    <div className={`inline-flex items-center gap-3 px-1.5 py-1.5 rounded-full ${badgeBg} shadow-sm mb-4`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${circleBg} ${numColor}`}>
        {number}
      </div>
      <span className={`text-base font-bold pr-4 ${textColor}`}>
        {title}
      </span>
    </div>
  );
}

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
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="0"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
              </marker>
            </defs>
            {/* Path A: Card 1 (tl) center-right -> down to Card 2 (mr) top-left area */}
            <path
              ref={pathARef}
              d="M 500 140 L 850 140 L 850 240"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
            {/* Path B: Card 2 (mr) center-bottom -> across -> down to Card 3 (bl) top-left area */}
            <path
              ref={pathBRef}
              d="M 970 440 L 970 480 L 230 480 L 230 520"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
            {/* Path C: Card 3 (bl) center-right -> down to Card 4 (br) top-left area */}
            <path
              ref={pathCRef}
              d="M 500 620 L 850 620 L 850 720"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="4 6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrowhead)"
            />
          </svg>

          <div ref={cardsWrapperRef} className="contents">
            {steps.map((step, i) => {
              const pos = cardPositions[step.position];
              const iconSrc = stepIcons[i];
              const isPurple = step.variant === "purple";
              return (
                <div
                  key={step.number}
                  data-how-card
                  className="absolute w-[460px] h-[200px] rounded-[32px] shadow-sm px-10 py-8 opacity-0 group overflow-hidden"
                  style={{
                    left: pos.left,
                    right: pos.right,
                    top: pos.top,
                    backgroundColor: isPurple ? "#6B2A7A" : "#F8F9FA",
                    color: isPurple ? "white" : "#1A1A1A",
                  }}
                >
                  <div className="relative z-10">
                    <PillBadge
                      number={step.number}
                      title={step.title}
                      isPurple={isPurple}
                    />
                    <p
                      className={`text-[17px] leading-relaxed font-medium pr-10 ${isPurple ? "text-white/90" : "text-gray-700"
                        }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  <div className={`absolute bottom-6 right-8 flex items-center justify-center w-12 h-12 ${isPurple ? "opacity-100" : "opacity-90"}`}>
                    <img
                      src={iconSrc}
                      alt={step.title}
                      className={`w-full h-full object-contain ${isPurple ? "brightness-0 invert" : ""}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical stack */}
        <div className="md:hidden space-y-6 max-w-lg mx-auto pt-4">
          {steps.map((step, i) => {
            const iconSrc = stepIcons[i];
            const isPurple = step.variant === "purple";
            return (
              <div key={step.number} className="relative">
                <div
                  className="relative w-full rounded-[24px] shadow-sm px-6 py-8 min-h-[200px] overflow-hidden"
                  style={{
                    backgroundColor: isPurple ? "#6B2A7A" : "#F8F9FA",
                    color: isPurple ? "white" : "#1A1A1A",
                  }}
                >
                  <div className="relative z-10">
                    <PillBadge
                      number={step.number}
                      title={step.title}
                      isPurple={isPurple}
                    />
                    <p
                      className={`text-[16px] leading-relaxed font-medium pr-8 ${isPurple ? "text-white/90" : "text-gray-700"
                        }`}
                    >
                      {step.description}
                    </p>
                  </div>
                  <div className={`absolute bottom-6 right-6 flex items-center justify-center w-10 h-10 ${isPurple ? "opacity-100" : "opacity-90"}`}>
                    <img
                      src={iconSrc}
                      alt={step.title}
                      className={`w-full h-full object-contain ${isPurple ? "brightness-0 invert" : ""}`}
                    />
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
