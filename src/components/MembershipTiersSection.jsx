"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";

const tiers = [
  {
    id: "entry",
    name: "Entry/Basic",
    price: "0",
    description:
      "Get listed on the platform with a basic business profile and directory visibility.",
    features: [
      "Basic listing",
      "Directory visibility",
      "Priority early access",
    ],
    variant: "light",
    badge: null,
    buttonClass:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold rounded-xl",
  },
  {
    id: "verified",
    name: "VERIFIED",
    price: "399",
    description:
      "Build trust with a verified badge, digital business card, and direct business chat access.",
    features: [
      "Verified badge",
      "Digital business card",
      "1-to-1 business chat",
      "Enquiry notifications",
      "Company dashboard",
    ],
    variant: "purple",
    badge: "Most Popular",
    buttonClass:
      "bg-white text-[#461E66] hover:bg-gray-100 font-semibold rounded-xl",
  },
  {
    id: "premium",
    name: "PREMIUM",
    price: "599",
    description:
      "Boost your visibility with priority placement, media uploads, and enhanced profile features.",
    features: [
      "Priority search placement",
      "Mini website dashboard",
      "Photo & video gallery",
      "Enquiry wall access",
    ],
    variant: "light",
    badge: null,
    buttonClass:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold rounded-xl",
  },
  {
    id: "tradewall",
    name: "TRADEWALL",
    price: "999",
    description:
      "Access buyer requirements, respond to trade enquiries, and promote your offerings to serious buyers.",
    features: [
      "Buyer requirement wall",
      "Seller responses",
      "Flyer & video promotions",
      "Subscription access",
    ],
    variant: "light",
    badge: "Premium",
    buttonClass:
      "bg-amber-400 text-gray-900 hover:bg-amber-500 font-semibold rounded-xl",
  },
];

function CheckIcon({ className }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function MembershipTiersSection() {
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
        const title = section.querySelector(".mt-title");
        const subtitle = section.querySelector(".mt-subtitle");
        const cardEls = section.querySelectorAll(".mt-card");

        gsap.set(title, { opacity: 0, y: 18 });
        gsap.set(subtitle, { opacity: 0, y: 14 });
        if (reduce) {
          gsap.set(cardEls, { opacity: 0 });
        } else {
          gsap.set(cardEls, {
            opacity: 0,
            y: 28,
            scale: 0.97,
            transformOrigin: "50% 100%",
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
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        )
          .fromTo(
            subtitle,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
            "-=0.3"
          )
          .fromTo(
            cardEls,
            reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.97 },
            reduce
              ? { opacity: 1, duration: 0.5, stagger: { each: 0.08, from: "start" }, ease: "power2.out" }
              : {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  duration: 0.7,
                  stagger: { each: 0.1, from: "start" },
                  ease: "power3.out",
                },
            "-=0.2"
          )
          .add(() => {
            if (reduce) return;
            cardEls.forEach((el) => {
              const amplitude = gsap.utils.random(3, 6);
              const dur = gsap.utils.random(4, 6);
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

      cleanupRef.current = () => ctx.revert();
    });

    return () => {
      mounted = false;
      cleanupRef.current?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="membership-tiers"
      className="relative w-full bg-white py-20 md:py-24 px-4 md:px-8"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="mb-14 text-center">
          <h2 className="mt-title opacity-0 text-3xl font-bold tracking-tight text-[#0f172a] md:text-4xl lg:text-[2.75rem]">
            Membership Tiers
          </h2>
          <p className="mt-subtitle opacity-0 mx-auto mt-4 max-w-[720px] text-base leading-relaxed text-gray-600 md:text-lg">
            Choose a plan that fits your business needs, from free listing to
            premium trade access. Upgrade anytime as your visibility and
            requirements grow.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const isPurple = tier.variant === "purple";
            return (
              <article
                key={tier.id}
                className={`mt-card relative flex flex-col rounded-2xl border p-6 opacity-0 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md md:p-8 ${
                  isPurple
                    ? "border-transparent bg-[#461E66] text-white"
                    : "border-gray-200 bg-white text-gray-900"
                }`}
              >
                {tier.badge && (
                  <span
                    className={`absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-semibold ${
                      isPurple
                        ? "bg-amber-400 text-gray-900"
                        : "bg-amber-400 text-gray-900"
                    }`}
                  >
                    {tier.badge}
                  </span>
                )}
                <h3 className="text-lg font-bold md:text-xl">{tier.name}</h3>
                <p className="mt-2 text-2xl font-bold md:text-3xl">
                  ₹ {tier.price}
                </p>
                <p
                  className={`mt-3 text-sm leading-relaxed ${
                    isPurple ? "text-white/90" : "text-gray-600"
                  }`}
                >
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckIcon
                        className={
                          isPurple
                            ? "shrink-0 text-white"
                            : "shrink-0 text-gray-700"
                        }
                      />
                      <span
                        className={isPurple ? "text-white/95" : "text-gray-700"}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/pricing"
                  className={`mt-8 block w-full py-3 text-center text-sm transition-colors ${tier.buttonClass}`}
                >
                  Get Started
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
