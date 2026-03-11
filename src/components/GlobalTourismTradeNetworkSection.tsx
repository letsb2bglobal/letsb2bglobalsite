"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const BASE = "/global-travel-network";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

function ImageCard({
  title,
  imageSrc,
  href = "/signup",
  className = "",
  align = "items-end",
}: {
  title: string;
  imageSrc: string;
  href?: string;
  className?: string;
  align?: "items-center" | "items-end";
}) {
  return (
    <Link
      href={href}
      data-card
      className={`opacity-0 group relative rounded-2xl md:rounded-3xl overflow-hidden min-h-[140px] md:min-h-[180px] shadow-sm hover:shadow-md transition-all cursor-pointer ${className}`}
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" aria-hidden />
      <div className={`absolute inset-0 p-5 md:p-6 flex ${align} justify-start z-10`}>
        <span
          className="text-white font-semibold text-base md:text-lg lg:text-[22px] lg:leading-[1.4] text-left max-w-full whitespace-pre-line"
        >
          {title}
        </span>
      </div>
    </Link>
  );
}

function SolidCard({
  title,
  href = "/signup",
  color = "bg-black",
  className = "",
}: {
  title: string;
  href?: string;
  color?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      data-card
      className={`opacity-0 flex rounded-2xl md:rounded-3xl overflow-hidden min-h-[140px] md:min-h-[180px] ${color} shadow-sm hover:shadow-md transition-all cursor-pointer items-end justify-start p-5 md:p-6 group ${className}`}
    >
      <span
        className="text-white font-semibold text-base md:text-lg lg:text-[22px] lg:leading-[1.4] text-left group-hover:scale-105 transition-transform duration-500 max-w-full whitespace-pre-line"
      >
        {title}
      </span>
    </Link>
  );
}

function createParticles(
  count: number,
  width: number,
  height: number
): Particle[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const spread = Math.min(width, height) * 0.15;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: centerX + (Math.random() - 0.5) * spread,
      y: centerY + (Math.random() - 0.5) * spread,
      vx: 0,
      vy: 0,
      size: 1 + Math.random() * 2,
      alpha: 0.85 + Math.random() * 0.15,
    });
  }
  return particles;
}

function burstParticles(particles: Particle[], width: number, height: number) {
  const centerX = width / 2;
  const centerY = height / 2;
  particles.forEach((p) => {
    const angle = Math.atan2(p.y - centerY, p.x - centerX);
    const speed = 2 + Math.random() * 5;
    p.vx = speed * Math.cos(angle);
    p.vy = speed * Math.sin(angle);
  });
}

export default function GlobalTourismTradeNetworkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const tickerRef = useRef<((time: number) => void) | null>(null);
  const scrollTriggerRef = useRef<{ kill: () => void } | null>(null);
  const resizeRef = useRef<(() => void) | null>(null);
  const contextRef = useRef<{ revert: () => void } | null>(null);
  const triggeredRef = useRef(false);

  const resizeCanvas = useCallback(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const rect = section.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count =
      typeof window !== "undefined" && window.innerWidth < 768 ? 100 : 220;
    particlesRef.current = createParticles(count, w, h);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const canvasWrapper = canvasWrapperRef.current;
    if (!section || !canvas || !canvasWrapper) return;

    let mounted = true;

    void Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, stModule]) => {
      if (!mounted) return;
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.default;
      gsap.registerPlugin(ScrollTrigger);

      resizeCanvas();

      const handleResize = () => {
        resizeCanvas();
      };
      window.addEventListener("resize", handleResize);
      resizeRef.current = handleResize;

      const ctx = gsap.context(() => {
        const ctx2 = canvas.getContext("2d");
        if (!ctx2) return;

        const dpr = window.devicePixelRatio || 1;

        const draw = () => {
          const rect = section.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;

          ctx2.save();
          ctx2.setTransform(1, 0, 0, 1, 0, 0);
          ctx2.clearRect(0, 0, canvas.width, canvas.height);
          ctx2.scale(dpr, dpr);

          particlesRef.current.forEach((p) => {
            ctx2.beginPath();
            ctx2.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx2.fillStyle = `rgba(230, 220, 255, ${p.alpha})`;
            ctx2.fill();
          });

          ctx2.restore();
        };

        const update = () => {
          const rect = section.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;
          particlesRef.current.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
          });
          draw();
        };

        scrollTriggerRef.current = ScrollTrigger.create({
          trigger: section,
          start: "top 85%",
          once: true,
          onEnter: () => {
            if (triggeredRef.current) return;
            triggeredRef.current = true;

            const label = section.querySelector<HTMLElement>("[data-gt-label]");
            const heading = section.querySelector<HTMLElement>("[data-gt-heading]");
            const lines = section.querySelectorAll<HTMLElement>("[data-gt-line]");
            const cards = section.querySelectorAll<HTMLElement>("[data-card]");

            gsap.set([label, heading].filter(Boolean), { opacity: 0, x: -32 });
            gsap.set(lines, { opacity: 0, y: 12 });
            gsap.set(cards, { opacity: 0, y: 24 });
            gsap.set(canvasWrapper, { opacity: 1 });

            const tl = gsap.timeline({
              defaults: { ease: "power2.out" },
            });

            if (label) {
              tl.fromTo(label, { opacity: 0, x: -32 }, { opacity: 1, x: 0, duration: 0.4 });
            }
            if (heading) {
              tl.fromTo(
                heading,
                { opacity: 0, x: -32 },
                { opacity: 1, x: 0, duration: 0.45 },
                "-=0.25"
              );
            }
            tl.fromTo(
              lines,
              { opacity: 0, y: 12 },
              { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
              lines.length ? "-=0.1" : 0
            )
              .add(() => {
                const rect = section.getBoundingClientRect();
                burstParticles(particlesRef.current, rect.width, rect.height);
                tickerRef.current = update;
                gsap.ticker.add(update);
                gsap.to(canvasWrapper, {
                  opacity: 0,
                  duration: 1,
                  ease: "power2.out",
                });
                gsap.to(cards, {
                  y: 0,
                  opacity: 1,
                  stagger: 0.15,
                  ease: "power3.out",
                  duration: 0.5,
                  delay: 1,
                });
                setTimeout(() => {
                  gsap.ticker.remove(update);
                  tickerRef.current = null;
                }, 1000);
              }, 0);
          },
        });

        const label = section.querySelector<HTMLElement>("[data-gt-label]");
        const heading = section.querySelector<HTMLElement>("[data-gt-heading]");
        const lines = section.querySelectorAll<HTMLElement>("[data-gt-line]");
        const cards = section.querySelectorAll<HTMLElement>("[data-card]");
        if (label) gsap.set(label, { opacity: 0, x: -32 });
        if (heading) gsap.set(heading, { opacity: 0, x: -32 });
        gsap.set(lines, { opacity: 0, y: 12 });
        gsap.set(cards, { opacity: 0, y: 24 });
      }, section);
      contextRef.current = ctx;
    });

    return () => {
      mounted = false;
      const handleResize = resizeRef.current;
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
        resizeRef.current = null;
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
      const tickerCallback = tickerRef.current;
      tickerRef.current = null;
      if (tickerCallback) {
        void import("gsap").then((m) => m.default.ticker.remove(tickerCallback));
      }
      contextRef.current?.revert();
      contextRef.current = null;
    };
  }, [resizeCanvas]);

  return (
    <section
      ref={sectionRef}
      id="global-tourism-trade-network"
      data-section="global-tourism-trade-network"
      className="relative bg-white py-16 lg:py-24"
    >
      {/* Canvas overlay: particles reveal */}
      <div
        ref={canvasWrapperRef}
        className="absolute inset-0 pointer-events-none z-20"
        aria-hidden
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ display: "block" }}
        />
      </div>

      <div className={`w-full max-w-[1440px] mx-auto px-5 lg:px-10 relative z-10 ${poppins.className}`}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-start">
          {/* Left: Label + Heading + Body — pinned while right scrolls */}
          <div className="lg:sticky lg:top-24 self-start lg:col-span-2">
            <p
              data-gt-label
              className="opacity-0 text-left font-bold tracking-widest text-gray-900 uppercase mb-3"
              style={{ fontSize: "11px" }}
            >
              GLOBAL TOURISM TRADE NETWORK
            </p>
            <h2
              data-gt-heading
              className="opacity-0 text-left font-bold text-gray-900 mb-6"
              style={{ fontSize: "clamp(28px, 3.5vw, 42px)", lineHeight: "1.2" }}
            >
              Who can connect and trade on LetsB2B?
            </h2>
            <div className="space-y-5">
              <p
                data-gt-line
                className="opacity-0 text-left font-medium text-gray-900 leading-relaxed"
                style={{ fontSize: "18px" }}
              >
                LetsB2B brings together industry players who are actively looking to collaborate, contract services, and build trusted trade partnerships.
              </p>
              <p
                data-gt-line
                className="opacity-0 text-left font-medium text-gray-600 leading-relaxed"
                style={{ fontSize: "16px" }}
              >
                Whether you are an individual professional seeking industry connections or a registered business looking for reliable trade partners, LetsB2B helps you connect with the right people and opportunities across India and international markets.
              </p>
            </div>
          </div>

          {/* Right: Hero card + cards grid */}
          <div className="flex flex-col gap-3 md:gap-4 lg:col-span-3">
            {/* Hero Card */}
            <div
              data-card
              className="opacity-0 rounded-[20px] bg-[#612A79] border border-[#E3E3E3] p-6 md:p-8 text-white text-left shadow-sm min-h-[130px] flex flex-col justify-end"
            >
              <h3 className="text-lg md:text-xl lg:text-[24px] lg:leading-[1.4] font-semibold mb-2">
                Explore Verified Tourism Trade Partners
              </h3>
              <p className="text-white/90 text-[14px] md:text-[15px] leading-relaxed max-w-3xl">
                Join a growing global network of tourism and hospitality professionals actively looking for business partnerships and trade opportunities.
              </p>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              <ImageCard
                title={"Travel Agents &\nTour Operators"}
                imageSrc={`${BASE}/travel_block.png`}
                className="md:col-span-2 min-h-[100px] lg:min-h-[120px]"
              />
              <SolidCard
                title="Destination Management Companies (DMCs)"
                color="bg-black"
                className="min-h-[100px] lg:min-h-[120px]"
              />
            </div>

            {/* Row 3 */}
            <ImageCard
              title="Hotels, Resorts & Homestays"
              imageSrc={`${BASE}/hotels_stays.png`}
              className="min-h-[80px] lg:min-h-[100px]"
            />

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <ImageCard
                title="Transport & Mobility Providers"
                imageSrc={`${BASE}/transport-mobility-block.png`}
                className="min-h-[110px] lg:min-h-[130px]"
              />
              <SolidCard
                title="Experience & Adventure Providers"
                color="bg-black"
                className="min-h-[110px] lg:min-h-[130px]"
              />
              <ImageCard
                title="Tourism Technology & Service Providers"
                imageSrc={`${BASE}/tourism-technology.png`}
                className="min-h-[110px] lg:min-h-[130px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
