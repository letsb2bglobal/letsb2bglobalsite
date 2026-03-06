"use client";

import React, { useState } from "react";
import { faqs as faqsData } from "@/data/faqs";

const faqs = faqsData.map((faq, i) => ({
  id: `faq-${i + 1}`,
  question: faq.q,
  answer: faq.a,
}));

export default function FaqSection() {
  const [openId, setOpenId] = useState(faqs[0].id);

  return (
    <section
      id="faqs"
      className="w-full py-20 md:py-24 px-4 md:px-8"
      style={{ backgroundColor: "#F7EFEF" }}
    >
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <h2
            className="text-3xl font-bold tracking-tight md:text-4xl uppercase"
            style={{ color: "#0F1F3A" }}
          >
            FAQ&apos;s
          </h2>
          <p
            className="mx-auto mt-4 max-w-[720px] text-base leading-relaxed md:text-lg"
            style={{ color: "#3d4f6b" }}
          >
            Choose a plan that fits your business needs, from free listing to
            premium trade access. Upgrade anytime as your visibility and
            requirements grow.
          </p>
        </header>

        <div className="flex flex-col gap-5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-colors duration-200 ${
                  isOpen
                    ? "border-[#F2C7C0] bg-white"
                    : "border-gray-200/80 bg-[#EFE8E7] hover:border-gray-300 hover:shadow-sm"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`${faq.id}-answer`}
                  id={`${faq.id}-question`}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left md:p-6"
                >
                  <span
                    className="text-lg font-bold md:text-xl"
                    style={{ color: "#0F1F3A" }}
                  >
                    {faq.question}
                  </span>
                  <span
                    className="shrink-0 text-2xl font-light leading-none md:text-3xl"
                    style={{ color: "#0F1F3A" }}
                    aria-hidden
                  >
                    {isOpen ? "–" : "+"}
                  </span>
                </button>
                <div
                  id={`${faq.id}-answer`}
                  role="region"
                  aria-labelledby={`${faq.id}-question`}
                  className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`pb-5 pt-1 md:pb-6 md:pt-2 px-5 md:px-6 transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ color: "#3d4f6b" }}
                    >
                      <p className="text-base leading-relaxed">{faq.answer}</p>
                    </div>
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
