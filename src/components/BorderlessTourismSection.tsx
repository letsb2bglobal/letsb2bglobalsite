"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
});

const ASSETS = "/a-borderless-tourism-section";

  const items = [
    {
      id: "global-reach",
      title: "Global Reach",
      description: "Connect across India + international markets",
      icon: `${ASSETS}/global-reach.png`,
    },
    {
      id: "trusted-partnerships",
      title: "Trusted Partnerships",
      description: "Build relationships with verified tourism and hospitality partners worldwide.",
      icon: `${ASSETS}/trusted-partnership.png`,
    },
    {
      id: "business-enquiries",
      title: "Business Enquiries",
      description: "Send and receive qualified enquiries directly through the platform.",
      icon: `${ASSETS}/business_enquiries.png`,
    },
    {
      id: "secure-messaging",
      title: "Secure Messaging",
      description: "Communicate with partners in a secure, professional environment.",
      icon: `${ASSETS}/secure-messaging.png`,
    },
  ];

export default function BorderlessTourismSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const accordionListRef = useRef<HTMLDivElement>(null);
  const introPlayedRef = useRef(false);

  // Set initial hidden state so elements don’t flash before intro
  useEffect(() => {
    const imagesEl = imagesRef.current;
    const headingEl = headingRef.current;
    const accordionList = accordionListRef.current;
    if (!imagesEl || !headingEl || !accordionList) return;
    gsap.set(imagesEl, { y: 80, opacity: 0 });
    gsap.set(headingEl, { x: -80, opacity: 0 });
    gsap.set(accordionList.querySelectorAll(".accordion-item"), { y: -36, opacity: 0 });
  }, []);

  // Intro timeline: images slide up → heading from left → accordions drop
  useEffect(() => {
    const section = sectionRef.current;
    const imagesEl = imagesRef.current;
    const headingEl = headingRef.current;
    const accordionList = accordionListRef.current;
    if (!section || !imagesEl || !headingEl || !accordionList) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || introPlayedRef.current) return;
        introPlayedRef.current = true;

        const accordionItems = accordionList.querySelectorAll(".accordion-item");
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
        tl.to(imagesEl, { y: 0, opacity: 1, duration: 1.2 })
          .to(headingEl, { x: 0, opacity: 1, duration: 0.5 }, "-=0.3")
          .to(accordionItems, { y: 0, opacity: 1, duration: 0.4, stagger: 0.08 }, "-=0.2");
      },
      { threshold: 0.7, rootMargin: "0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Scroll-driven accordion opening
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onScroll = () => {
      const rect = wrapper.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const wrapperHeight = rect.height;
      if (rect.bottom < 0) {
        setOpenId(items[items.length - 1].id);
        return;
      }
      if (rect.top > viewportHeight) {
        setOpenId(null);
        return;
      }
      if (wrapperHeight <= 0) {
        setOpenId(null);
        return;
      }
      // First accordion opens only when section is 100% in view (section top at or above viewport top)
      if (rect.top > 0) {
        setOpenId(null);
        return;
      }
      // Section fully in view: progress 0 = section top at viewport top, 1 = section bottom at viewport top
      const progress = Math.max(0, Math.min(1, -rect.top / wrapperHeight));
      const index = Math.min(items.length - 1, Math.max(0, Math.floor(progress * items.length)));
      setOpenId(items[index].id);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      style={{ height: "350vh" }}
    >
      <section
        ref={sectionRef}
        id="borderless-tourism"
        data-section="borderless-tourism"
        className="sticky top-0 left-0 right-0 min-h-screen flex flex-col justify-center bg-[#F8F8F8] py-16 lg:py-24 overflow-hidden"
      >
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left on desktop: Heading + Accordion — on mobile show second (below images) */}
          <div className={`${poppins.className} order-2 lg:order-none`}>
            <h2
              ref={headingRef}
              className="opacity-0 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[56px] font-black text-[#1a1625] leading-tight mb-10"
            >
              A Borderless Tourism
              <br />
              <span className="text-[#461E66]">Trade Network</span>
            </h2>
            <div ref={accordionListRef} className="space-y-3">
              {items.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="accordion-item opacity-0 rounded-2xl bg-gray-50/80 border border-gray-100 overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full flex items-center gap-4 p-5 lg:p-6 text-left hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden">
                        <Image
                          src={item.icon}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="flex-1 font-bold text-[#1a1625] text-lg lg:text-xl">
                        {item.title}
                      </span>
                      <span className="w-8 h-8 shrink-0 rounded-full overflow-hidden flex items-center justify-center">
                        <img
                          src={`${ASSETS}/${encodeURIComponent(isOpen ? "Icon akar-circle-chevron-up-fill.png" : "Icon akar-circle-chevron-down-fill.png")}`}
                          alt={isOpen ? "Collapse" : "Expand"}
                          className="w-full h-full object-cover"
                        />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 lg:px-6 lg:pb-6 pt-0">
                        <p className="pl-16 text-gray-800 font-medium text-base lg:text-lg leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right on desktop: Images — hidden on mobile */}
          <div ref={imagesRef} className="opacity-0 hidden lg:flex order-1 lg:order-none relative flex-row gap-3 lg:gap-4 items-start justify-end self-end">
            <div className="relative w-[200px] lg:w-[260px] aspect-[260/571] rounded-[20px] overflow-hidden border border-[#E3E3E3] bg-transparent mt-20 lg:mt-28">
              <Image
                src={`${ASSETS}/business-deal-handshake.png`}
                alt="Business deal handshake"
                fill
                className="object-cover object-top"
                sizes="260px"
              />
            </div>
            <div className="relative w-[200px] lg:w-[260px] aspect-[260/571] rounded-[20px] overflow-hidden border border-[#E3E3E3] bg-transparent">
              <Image
                src={`${ASSETS}/top-view-unrecognizable-people-planning-vacation-trip.png`}
                alt="Planning a vacation or business trip"
                fill
                className="object-cover object-top"
                sizes="260px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
