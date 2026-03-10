"use client";

import React, { useEffect, useRef } from "react";

const cards = [
  {
    title: "Tourism Industry Focused",
    body: "LetsB2B is built exclusively for tourism and hospitality professionals, ensuring that every connection, enquiry, and collaboration is relevant to the travel trade ecosystem.",
    iconSrc: "/tourism-industry.svg",
    colSpan: 1,
  },
  {
    title: "Verified Trade Network",
    body: "Every member goes through a structured verification process to ensure credibility, professionalism, and trust within the network. This helps eliminate fake enquiries and unreliable partners.",
    iconSrc: "/verified-tradenetwork.svg",
    colSpan: 1,
  },
  {
    title: "Genuine Business Opportunities",
    body: "LetsB2B enables direct B2B enquiries, partnership requests, and contracting opportunities between verified tourism businesses. No lead selling. No irrelevant promotions.",
    iconSrc: "/genuine-business-opportunity.svg",
    colSpan: 1,
  },
  {
    title: "Secure & Professional Communication",
    body: "Members can communicate through secure one-to-one messaging designed specifically for professional B2B collaboration within the tourism industry.",
    iconSrc: "/secure-business.svg",
    colSpan: 2,
  },
  {
    title: "Built on Trust & Ethics",
    body: "LetsB2B operates on a strict code of conduct that promotes ethical business practices, professional behavior, and meaningful industry collaboration. Spam, misuse, and unsolicited promotions are not allowed.",
    iconSrc: "/trust-etics.svg",
    colSpan: 1,
  },
];

export default function WhyChooseLetsB2B() {
  const sectionRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;

    let mounted = true;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]).then(([gsapModule, stModule]) => {
      if (!mounted) return;
      const gsap = gsapModule.default;
      const ScrollTrigger = stModule.default;
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const ctx = gsap.context(() => {
        const title = section.querySelector(".why-title");
        const subtitle = section.querySelector(".why-subtitle");
        const cardEls = section.querySelectorAll(".why-card");

        gsap.set(title, { opacity: 0, y: 18 });
        gsap.set(subtitle, { opacity: 0, y: 14 });
        if (reduce) {
          gsap.set(cardEls, { opacity: 0 });
        } else {
          gsap.set(cardEls, {
            opacity: 0,
            y: 30,
            scale: 0.98,
            rotateX: 6,
            transformPerspective: 900,
            transformOrigin: "50% 60%",
          });
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });

        tl.fromTo(
          title,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
        )
          .fromTo(
            subtitle,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
            "-=0.35"
          )
          .fromTo(
            cardEls,
            reduce
              ? { opacity: 0 }
              : {
                opacity: 0,
                y: 30,
                scale: 0.98,
                rotateX: 6,
              },
            reduce
              ? { opacity: 1, duration: 0.5, ease: "power2.out", stagger: { each: 0.08, from: "start" } }
              : {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.9,
                ease: "power3.out",
                stagger: { each: 0.12, from: "start" },
              },
            "-=0.25"
          )
          .add(() => {
            if (reduce) return;
            cardEls.forEach((el) => {
              const amplitude = gsap.utils.random(4, 8);
              const dur = gsap.utils.random(3.5, 5.5);
              gsap.to(el, {
                y: amplitude,
                duration: dur,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              });
            });
          });
      }, sectionRef);

      const cardElements = section.querySelectorAll(".why-card");
      const cleanupFns = [];

      cardElements.forEach((cardEl) => {
        const spotlight = cardEl.querySelector(".why-spotlight");
        if (!spotlight) return;

        const onMove = (e) => {
          const rect = cardEl.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          cardEl.style.setProperty("--mx", `${x}px`);
          cardEl.style.setProperty("--my", `${y}px`);
          if (reduce) return;
          const w = rect.width;
          const h = rect.height;
          const relX = (e.clientX - rect.left) / w;
          const relY = (e.clientY - rect.top) / h;
          const rotX = (relY - 0.5) * 6;
          const rotY = (relX - 0.5) * 8;
          gsap.to(cardEl, {
            rotateX: rotX,
            rotateY: rotY,
            y: -4,
            scale: 1.015,
            duration: 0.25,
            ease: "power2.out",
            overwrite: true,
          });
          spotlight.style.opacity = "1";
        };

        const onLeave = () => {
          cardEl.style.removeProperty("--mx");
          cardEl.style.removeProperty("--my");
          if (!reduce) {
            gsap.to(cardEl, {
              rotateX: 0,
              rotateY: 0,
              y: 0,
              scale: 1,
              duration: 0.35,
              ease: "power2.out",
            });
          }
          spotlight.style.opacity = "0";
        };

        cardEl.addEventListener("mousemove", onMove, { passive: true });
        cardEl.addEventListener("mouseleave", onLeave);
        cleanupFns.push(() => {
          cardEl.removeEventListener("mousemove", onMove);
          cardEl.removeEventListener("mouseleave", onLeave);
        });
      });

      cleanupRef.current = () => {
        cleanupFns.forEach((fn) => fn());
        ctx.revert();
      };
    });

    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-white py-20 md:py-24 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/why-choose-us.png')",
      }}
    >
      <div className="relative mx-auto max-w-[1200px] px-5 md:px-8">
        <header className="mb-14 text-center">
          <h2 className="why-title opacity-0 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl lg:text-[2.75rem]">
            Why Choose LetsB2B
          </h2>
          <p className="why-subtitle opacity-0 mx-auto mt-4 max-w-[720px] text-base leading-relaxed text-gray-600 md:text-lg">
            LetsB2B is built exclusively for the tourism and hospitality industry
            to create a trusted, professional, and efficient global trade
            network.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {cards.map((card, i) => {
            const bgColor = i % 2 === 0 ? "#E4E5F7" : "#F1E8F9";
            return (
              <article
                key={card.title}
                className={`why-card relative flex flex-col rounded-2xl border border-gray-200/80 p-8 opacity-0 shadow-sm ${card.colSpan === 2 ? "lg:col-span-2" : ""}`}
                style={{
                  backgroundColor: bgColor,
                  transformOrigin: "50% 60%",
                  transformPerspective: 900,
                }}
              >
                <div
                  className="why-spotlight pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200"
                  style={{
                    background: "radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.55), transparent 60%)",
                  }}
                  aria-hidden
                />
                <div className="why-icon relative z-10 mb-5 flex h-16 w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl">
                  <img
                    src={card.iconSrc}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </div>
                <h3 className="relative z-10 text-xl font-bold text-[#0f172a] md:text-2xl">
                  {card.title}
                </h3>
                <p className="relative z-10 mt-3 text-[15px] leading-relaxed text-gray-600">
                  {card.body}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
