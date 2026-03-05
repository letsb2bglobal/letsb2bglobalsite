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
      "Connect with verified tourism professionals and businesses across India and international markets.",
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
          });
          tl.to(
            section,
            {
              opacity: 0,
              y: 80,
              ease: "power2.in",
              duration: 0.18,
            },
            0.82
          );
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
        id="features"
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
        <div className={`shrink-0 px-5 pt-12 lg:px-10 lg:pt-16 text-center ${poppins.className}`}>
          <div className="relative inline-block">
            <span
              className="pointer-events-none select-none block font-bold text-white"
              style={{ fontSize: "176px", lineHeight: "241px", opacity: 0.07 }}
              aria-hidden
            >
              Features
            </span>
            <h2
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-bold text-white"
              style={{ fontSize: "60px", lineHeight: "83px" }}
            >
              Features
            </h2>
          </div>
          <p
            className="mx-auto mt-4 max-w-2xl text-center font-normal text-white"
            style={{ fontSize: "20px", lineHeight: "32px" }}
          >
            Features that help tourism partners connect, collaborate, and trade
            with confidence. Built to support trusted partnerships and real business growth across
            global markets.
          </p>
        </div>

        {/* Horizontal scroll area: 9 features + 4 blank cards so last card scrolls off */}
        <div className="flex-1 min-h-0 px-5 lg:px-10 flex items-center">
          <div ref={containerRef} className="w-full overflow-hidden">
            <div
              ref={stripRef}
              className="flex gap-6 lg:gap-8 will-change-transform"
              style={{ width: "max-content" }}
            >
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex w-[85vw] max-w-[380px] shrink-0 flex-col items-start rounded-2xl p-6 text-left lg:w-[calc(33.333vw-2rem)] lg:max-w-[360px]"
                >
                  <div className="flex h-11 w-11 items-center justify-start text-white lg:h-12 lg:w-12">
                    <f.Icon />
                  </div>
                  <h3 className="mt-4 text-[23px] font-bold leading-tight text-white lg:text-[26px]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[18px] leading-relaxed text-white/75 lg:text-[21px]">
                    {f.description}
                  </p>
                </div>
              ))}
              {/* Blank cards so Industry Collaboration can scroll off before next section */}
              {[0, 1,2,3,4].map((i) => (
                <div
                  key={`blank-${i}`}
                  className="flex w-[85vw] max-w-[380px] shrink-0 lg:w-[calc(33.333vw-2rem)] lg:max-w-[360px]"
                  aria-hidden
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
