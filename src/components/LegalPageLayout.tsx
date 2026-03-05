'use client';

import React from 'react';
import Link from 'next/link';
import { FileText } from 'lucide-react';

type LegalPageLayoutProps = {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
  badge?: string;
  children: React.ReactNode;
};

export default function LegalPageLayout({
  title,
  subtitle = "Let's B2B — Global Tourism & Hospitality B2B Network",
  lastUpdated,
  badge = 'Legal',
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#1a1625]">
      {/* Hero — same style as homepage / About Us */}
      <section className="relative flex flex-col bg-[#1a1625] overflow-hidden">
        <div className="relative z-10 flex flex-1 min-h-0 flex-col justify-center w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-10 pt-24 pb-12 sm:pb-16">
          <div className="py-4 sm:py-6">
            {badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                {badge}
              </div>
            )}
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base text-white/90 mt-3 max-w-xl sm:text-lg sm:mt-4">
                {subtitle}
              </p>
            )}
            {lastUpdated && (
              <p className="text-white/70 text-sm mt-2">Last updated: {lastUpdated}</p>
            )}
          </div>
        </div>
      </section>

      {/* Content section — white with green bar + left accent */}
      <section className="relative bg-white border-t-[3px] border-[#22c55e] py-16 lg:py-20">
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e91e8c]" aria-hidden="true" />
        <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="pl-6 lg:pl-8">
            <div className="max-w-4xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function LegalPageFooter({
  emailLabel,
  links,
}: {
  emailLabel?: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="pt-10 mt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
      {emailLabel && (
        <div className="space-y-1 text-center md:text-left">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{emailLabel}</p>
          <a href="mailto:support@letsb2b.com" className="text-sm text-[#6B3FA0] font-semibold hover:underline">
            support@letsb2b.com
          </a>
        </div>
      )}
      <div className="flex flex-wrap gap-3 justify-center">
        {links.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-[#6B3FA0]/10 hover:text-[#6B3FA0] transition-all text-sm"
          >
            {label} →
          </Link>
        ))}
        <button
          type="button"
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-[#1a1625] text-white font-bold rounded-full hover:bg-[#2d2640] transition-all text-sm flex items-center gap-2"
        >
          <FileText className="w-3.5 h-3.5" /> Print
        </button>
      </div>
    </div>
  );
}
