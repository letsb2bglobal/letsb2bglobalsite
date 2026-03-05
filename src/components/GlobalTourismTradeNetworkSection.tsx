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
}: {
  title: string;
  imageSrc: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      data-card
      className="opacity-0 flex relative rounded-2xl overflow-hidden min-h-[180px] md:min-h-[220px] lg:min-h-[240px] shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    >
      <Image
        src={imageSrc}
        alt=""
        fill
        className="object-cover object-center"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-black/50" aria-hidden />
      <span className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 text-white font-bold text-base lg:text-lg leading-snug text-left z-10">
        {title}
      </span>
    </Link>
  );
}

function SolidCard({
  title,
  href = "/signup",
}: {
  title: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      data-card
      className="opacity-0 flex rounded-2xl overflow-hidden min-h-[180px] md:min-h-[220px] lg:min-h-[240px] bg-neutral-900 shadow-lg hover:shadow-xl transition-shadow cursor-pointer items-end justify-start p-5 lg:p-6"
    >
      <span className="text-white font-bold text-base lg:text-lg leading-snug text-left">
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

      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Label + Heading + Body — pinned while right scrolls */}
          <div className={`${poppins.className} lg:sticky lg:top-24 self-start`}>
            <p
              data-gt-label
              className="opacity-0 text-left font-semibold text-[#040534]"
              style={{ fontSize: "18px", lineHeight: "48px" }}
            >
              GLOBAL TOURISM TRADE NETWORK
            </p>
            <h2
              data-gt-heading
              className="opacity-0 text-left font-bold text-black mt-2 mb-6"
              style={{ fontSize: "44px", lineHeight: "1.2" }}
            >
              Who can connect and trade on LetsB2B?
            </h2>
            <p
              className="text-left font-medium text-black mb-4"
              style={{ fontSize: "26px", lineHeight: "1.4" }}
            >
              <span data-gt-line className="opacity-0 block">
                LetsB2B brings together industry players who are actively looking to collaborate, contract services, and build trusted trade partnerships.
              </span>
            </p>
            <p
              className="text-left font-normal text-black"
              style={{ fontSize: "22px", lineHeight: "1.5" }}
            >
              <span data-gt-line className="opacity-0 block">
                Whether you are an individual professional seeking industry connections or a registered business looking for reliable trade partners,
              </span>
              <span data-gt-line className="opacity-0 block mt-2">
                LetsB2B helps you connect with the right people and opportunities across India and international markets.
              </span>
            </p>
          </div>

          {/* Right: Hero card + cards grid — scrolls */}
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* Hero: large purple rounded card */}
            <div
              data-card
              className="opacity-0 rounded-2xl lg:rounded-3xl bg-[#461E66] p-8 lg:p-10 text-white text-left shadow-lg"
            >
              <h2 className="text-2xl lg:text-3xl font-bold mb-4">
                Explore Verified Tourism Trade Partners
              </h2>
              <p className="text-white/90 text-base lg:text-lg leading-relaxed">
                Join a growing global network of tourism and hospitality professionals actively looking for business partnerships and trade opportunities.
              </p>
            </div>

            {/* Row 1: two cards side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ImageCard
                title="Travel Agents & Tour Operators"
                imageSrc={`${BASE}/travel_block.png`}
              />
              <SolidCard title="Destination Management Companies (DMCs)" />
            </div>

            {/* Row 2: one full-width image card */}
            <ImageCard
              title="Hotels, Resorts & Homestays"
              imageSrc={`${BASE}/hotels_stays.png`}
            />

            {/* Row 3: three equal-width cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <ImageCard
                title="Transport & Mobility Providers"
                imageSrc={`${BASE}/transport-mobility-block.png`}
              />
              <SolidCard title="Experience & Adventure Providers" />
              <ImageCard
                title="Tourism Technology & Service Providers"
                imageSrc={`${BASE}/tourism-technology.png`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
