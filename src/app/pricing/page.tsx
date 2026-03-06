'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import GreenBarMarquee from '@/components/GreenBarMarquee';
import MembershipTiersSection from '@/components/MembershipTiersSection';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0a12] flex flex-col">
      {/* Hero — dark base + purple gradient from bottom-left (#6b297c scheme) */}
      <section className="relative flex flex-col min-h-[70vh] overflow-hidden bg-[#0f0a12]">
        {/* Gradient: purple/violet at bottom-left, fading to dark toward top-right */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 140% 120% at 0% 100%, #6b297c 0%, #7a3590 18%, #8b3fa0 32%, #4a1a60 50%, rgba(20,10,28,0.92) 70%, transparent 85%),
              #0f0a12
            `,
          }}
          aria-hidden
        />
        {/* Subtle noise texture */}
        <div
          className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        {/* Abstract dark shapes (right side) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="absolute right-0 top-1/4 w-64 h-64 rounded-full border border-white/[0.04] bg-gradient-to-br from-white/[0.02] to-transparent" />
          <div className="absolute right-[10%] top-1/3 w-48 h-48 rotate-12 border border-white/[0.03] bg-white/[0.02] rounded-3xl" />
          <div className="absolute right-[5%] bottom-1/4 w-72 h-40 -rotate-6 border border-white/[0.04] bg-black/20 rounded-full blur-sm" />
        </div>

        <div className="relative z-10 flex flex-1 min-h-0 flex-col justify-center w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-10 pt-24 pb-12 sm:pb-16">
          <div className="py-4 sm:py-6 max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Membership Plans
            </h1>
            <p className="text-base text-white/80 mt-3 max-w-xl sm:text-lg sm:mt-4">
              Choose the right plan to grow your business network and unlock global trade opportunities.
            </p>
            <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:flex-wrap sm:gap-3 sm:mt-6">
              <a
                href="#membership-tiers"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-white text-[#1a1625] font-bold rounded-full hover:bg-white/95 transition-colors text-sm"
              >
                View Plans
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-[#6b297c] text-white font-bold rounded-full hover:bg-[#5a2270] transition-colors text-sm"
              >
                Get Started
              </Link>
            </div>
            <Link
              href="#membership-tiers"
              className="inline-flex items-center justify-center w-12 h-12 mt-8 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Scroll to plans"
            >
              <ArrowRight className="w-5 h-5 -rotate-45" />
            </Link>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <GreenBarMarquee />
        </div>
      </section>

      {/* Same pricing section as homepage */}
      <MembershipTiersSection />
    </div>
  );
}
