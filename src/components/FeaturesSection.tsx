"use client";

import React, { useEffect, useRef } from "react";
import { Poppins } from "next/font/google";
import {
  IconGlobe,
  IconShieldCheck,
  IconSearch,
  IconMessage,
  IconGrid,
  IconClipboardList,
  IconMapPin,
  IconUser,
  IconHandshake,
} from "./FeaturesSection/FeatureIcons";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const FEATURES = [
  {
    title: "Global B2B Networking",
    description:
      "Connect with verified travel & tourism businesses across India and International markets.",
    Icon: IconGlobe,
  },
  {
    title: "Verified Trade Partners",
    description:
      "Every member goes through a verification process to ensure credibility and trust within the network.",
    Icon: IconShieldCheck,
  },
  {
    title: "Business Enquiries",
    description:
      "Post and receive genuine B2B enquiries for accommodation, tours, transport, and tourism services.",
    Icon: IconSearch,
  },
  {
    title: "Secure Messaging",
    description:
      "Communicate directly with verified members through private professional messaging.",
    Icon: IconMessage,
  },
  {
    title: "Trade Wall",
    description:
      "Share partnership needs, destination promotions, trade opportunities, and industry announcements.",
    Icon: IconGrid,
  },
  {
    title: "Enquiry Management",
    description:
      "Track, manage, and respond to all enquiries from a centralized dashboard.",
    Icon: IconClipboardList,
  },
  {
    title: "Global Market Access",
    description:
      "Expand your reach and connect with tourism partners across multiple markets and destinations.",
    Icon: IconMapPin,
  },
  {
    title: "Professional Profiles",
    description:
      "Showcase your company, services, destinations, and expertise to the global tourism trade.",
    Icon: IconUser,
  },
  {
    title: "Industry Collaboration",
    description:
      "Build long-term partnerships with travel agents, DMCs, hotels, transport providers, and tourism professionals.",
    Icon: IconHandshake,
  },
];

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const wrap = wrapRef.current;
    const container = containerRef.current;
    const strip = stripRef.current;
    if (!section || !wrap || !container || !strip) return;

    let mounted = true;
    const cleanupRef: { current: (() => void) | null } = { current: null };

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, stModule]) => {
      if (!mounted) return;
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.default;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.defaults({ anticipatePin: 1 });

      const ctx = gsap.context(() => {
        let tl: ReturnType<typeof gsap.timeline> | null = null;

        function build() {
          if (!container || !strip) return;
          if (tl) {
            tl.scrollTrigger?.kill();
            tl.kill();
            tl = null;
          }

          const containerWidth = container.clientWidth;
          const stripWidth = strip.scrollWidth;
          const maxX = Math.max(stripWidth - containerWidth, 0);

          gsap.set(strip, { x: 0 });
          gsap.set(section, { opacity: 1, y: 0 });

          tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap,
              start: "top top",
              end: "bottom top",
              scrub: true,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
          tl.to(strip, {
            x: -maxX,
            ease: "none",
            duration: 1,
          });
        }

        build();
        ScrollTrigger.addEventListener("refreshInit", build);

        cleanupRef.current = () => {
          ScrollTrigger.removeEventListener("refreshInit", build);
          if (tl) {
            tl.scrollTrigger?.kill();
            tl.kill();
          }
          ctx.revert();
        };
      }, wrap);
    });

    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative"
      style={{ height: "200vh" }}
    >
      <section
        ref={sectionRef}
        data-section="features"
        className="sticky top-0 left-0 right-0 z-0 h-screen w-full overflow-hidden"
      >
        {/* Video background - no overlay */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            src="/our-features-section/our-featuers-v2.mp4"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Title + subtitle */}
          <div className={`shrink-0 w-full px-4 pt-8 sm:px-5 sm:pt-10 md:pt-12 lg:px-10 lg:pt-16 text-center ${poppins.className}`}>
            <div className="relative w-full min-h-[72px] sm:min-h-[90px] md:min-h-[100px] flex items-center justify-center">
              <span
                className="pointer-events-none select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-white whitespace-nowrap text-[100px] leading-[1.1] sm:text-[140px] md:text-[160px] lg:text-[200px] lg:leading-[1.2]"
                style={{ opacity: 0.07 }}
                aria-hidden
              >
                Features
              </span>
              <h2
                className="relative left-0 right-0 font-bold text-white text-[40px] leading-tight sm:text-[50px] md:text-[58px] lg:text-[68px]"
              >
                Features
              </h2>
            </div>
            <p
              className="mx-auto mt-4 sm:mt-5 max-w-2xl text-center font-normal text-white text-lg leading-snug sm:text-xl lg:text-2xl"
              style={{ lineHeight: "1.5" }}
            >
              Enabling tourism partners to connect, collaborate, and trade with confidence. Built to support trusted partnerships and real business growth across global markets.
            </p>
          </div>

          {/* Horizontal scroll area: 9 features + 4 blank cards so last card scrolls off */}
          <div className="flex-1 min-h-0 px-4 sm:px-5 lg:px-10 flex items-center pb-8 sm:pb-10">
            <div ref={containerRef} className="w-full overflow-hidden">
              <div
                ref={stripRef}
                className="flex gap-4 sm:gap-5 lg:gap-8 will-change-transform"
                style={{ width: "max-content" }}
              >
                {FEATURES.map((f) => (
                  <div
                    key={f.title}
                    className="flex w-[82vw] min-w-[280px] max-w-[400px] shrink-0 flex-col items-start rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-6 text-left lg:w-[calc(33.333vw-2rem)] lg:min-w-0 lg:max-w-[360px]"
                  >
                    <div className="flex h-10 w-10 sm:h-11 sm:w-11 lg:h-12 lg:w-12 items-center justify-start text-white">
                      <f.Icon />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[28px]">
                      {f.title}
                    </h3>
                    <p className="mt-2 sm:mt-3 text-base leading-relaxed text-white/75 sm:text-lg lg:text-[22px]">
                      {f.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}