'use client';

import React, { useState } from 'react';
import {
  Globe, ShieldCheck, MessageSquare, BarChart2,
  CheckCircle2, Users, Megaphone, ArrowRight,
  Mail, ChevronDown, ChevronUp, Star, Lock, Handshake
} from 'lucide-react';
import Link from 'next/link';
import GreenBarMarquee from '@/components/GreenBarMarquee';
import { faqs } from '@/data/faqs';
import { howItWorksSteps } from '@/data/howItWorks';

const verticals = [
  "Travel Agents & Tour Operators",
  "Destination Management Companies (DMCs)",
  "Hotels, Resorts, Villas & Homestays",
  "Transport, Cruise & Mobility Providers",
  "MICE, Event & Wedding Planners",
  "Wellness, Ayurveda & Medical Tourism Providers",
  "Adventure, Activity & Experience Providers",
  "Guides, Tour Managers & Freelance Professionals",
  "Tourism & Travel Technology Companies",
];

const features = [
  { icon: Globe, title: "Global B2B Networking", desc: "Connect with verified tourism and hospitality professionals and businesses worldwide." },
  { icon: Handshake, title: "Trusted Partnerships", desc: "Identify reliable partners for collaboration, contracting, and long-term trade relationships." },
  { icon: Lock, title: "Secure One-to-One Messaging", desc: "Professional digital communication between verified members only." },
  { icon: MessageSquare, title: "Business Enquiries & Trading", desc: "Receive and manage genuine B2B enquiries and trading opportunities relevant to your services." },
  { icon: BarChart2, title: "Enquiry Management System", desc: "Track, respond to, and manage all business communications through a centralized dashboard." },
  { icon: Megaphone, title: "Trade Wall & Industry Exchange", desc: "Share partnership requirements, hotel allotments, destination promotions, trade updates, and tourism event information." },
];

const howItWorks = howItWorksSteps;

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="bg-white border border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-[#6B3FA0]/40 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-bold text-gray-900 text-base leading-relaxed">{q}</p>
        <span className="text-[#6B3FA0] shrink-0 mt-0.5">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </div>
      {open && (
        <p className="mt-4 text-base text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
          {a}
        </p>
      )}
    </div>
  );
}

function SectionWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative bg-white border-t-[3px] border-[#22c55e] py-16 lg:py-20 ${className}`}>
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e91e8c]" aria-hidden="true" />
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="pl-6 lg:pl-8">
          {children}
        </div>
      </div>
    </section>
  );
}

function SectionDark({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`relative bg-[#1a1625] text-white py-16 lg:py-20 ${className}`}>
      <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
        <div className="pl-6 lg:pl-8">
          {children}
        </div>
      </div>
    </section>
  );
}

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-[#1a1625]">

      {/* Hero — dark base + warm gradient from bottom-left (no card overlay) */}
      <section
        className="relative flex flex-col min-h-[70vh] overflow-hidden bg-[#0a0a0a]"
      >
        {/* Gradient: deep red/orange at bottom-left, fading to dark toward top-right */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 140% 120% at 0% 100%, #8b2508 0%, #a63c0a 18%, #c2410c 32%, #6b2a08 50%, rgba(20,12,8,0.9) 70%, transparent 85%),
              #0a0a0a
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white/90 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              Less Noise, Pure Business B2B
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Global Tourism &; Hospitality<br />
              <span className="text-[#22c55e]">B2B Network</span>
            </h1>
            <p className="text-base text-white/80 mt-3 max-w-xl sm:text-lg sm:mt-4">
              Finding reliable and trusted business partners and connecting digitally for business growth and trading.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center w-12 h-12 mt-8 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Learn more"
            >
              <ArrowRight className="w-5 h-5 rotate-[-45deg]" />
            </Link>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <GreenBarMarquee />
        </div>
      </section>

      {/* About */}
      <SectionWrapper>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6B3FA0]/10 text-[#6B3FA0] rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                About Let&apos;s B2B
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                Built for the Tourism &; Hospitality Trade
              </h2>
              <p className="text-base text-gray-600 leading-relaxed mb-8 md:text-lg">
                Let&apos;s B2B is a global B2B networking and trading platform <strong>exclusively for the tourism and hospitality industry</strong>. We help members find reliable, verified partners and connect digitally across India and international markets — with a focus on trust, verification, and long-term partnerships.
              </p>
              <ul className="space-y-3">
                {["Verified tourism and hospitality professionals", "Secure B2B networking and messaging", "Pan-India and international reach", "Ethical, transparent partnerships"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 font-medium text-base">
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                <ShieldCheck className="w-8 h-8 text-[#6B3FA0] mb-3" />
                <h3 className="font-bold text-gray-900 text-base mb-1">Trust First</h3>
                <p className="text-sm text-gray-500">All members undergo verification before full access.</p>
              </div>
              <div className="bg-[#1a1625] p-5 rounded-2xl text-white">
                <Users className="w-8 h-8 text-[#22c55e] mb-3" />
                <h3 className="font-bold text-base mb-1">Community Driven</h3>
                <p className="text-sm text-white/80">Built on mutual growth and professional ethics.</p>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Vision & Mission */}
      <section className="relative bg-gray-50 py-16 lg:py-20">
        <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="pl-6 lg:pl-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-[#6B3FA0] rounded-2xl flex items-center justify-center mb-6">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight">Vision</h3>
                  <p className="text-base text-gray-600 leading-relaxed md:text-lg">
                    To become the <strong>most trusted global B2B platform</strong> for tourism and hospitality trade.
                  </p>
                </div>
                <div className="bg-[#1a1625] rounded-2xl p-8 lg:p-10 text-white hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-[#6B3FA0]/40 rounded-2xl flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-6 h-6 text-[#22c55e]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-4 tracking-tight">Mission</h3>
                  <ul className="space-y-3">
                    {["A trusted global tourism trade network", "Digital connection for verified professionals", "Ethical B2B partnerships and business growth"].map((m, i) => (
                      <li key={i} className="flex items-start gap-3 text-base text-white/90 md:text-lg">
                        <ArrowRight className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Verticals */}
      <SectionWrapper>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6B3FA0]/10 text-[#6B3FA0] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Industry Coverage
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Tourism &; Hospitality Verticals</h2>
            <p className="text-base text-gray-500 max-w-2xl mx-auto md:text-lg">Let&apos;s B2B covers the full spectrum of the tourism and hospitality trade ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 hover:border-[#6B3FA0]/40 hover:bg-[#6B3FA0]/5 transition-all">
                <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
                <span className="text-base font-semibold text-gray-800 md:text-lg">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Who Can Join */}
      <section className="relative bg-gray-50 py-16 lg:py-20">
        <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="pl-6 lg:pl-8">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Who Can Join</h2>
                <p className="text-base text-gray-500 max-w-xl mx-auto md:text-lg">Tourism professionals and businesses committed to ethical trade.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200 hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-[#6B3FA0]/10 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-[#6B3FA0]" />
                  </div>
                  <h3 className="font-black text-gray-900 text-xl md:text-2xl mb-3 tracking-tight">Individual Professionals</h3>
                  <p className="text-gray-500 text-base mb-5 leading-relaxed md:text-lg">Tourism and hospitality professionals seeking:</p>
                  <ul className="space-y-2">
                    {["Industry networking", "Career and professional growth", "Business collaboration opportunities"].map((i, k) => (
                      <li key={k} className="flex items-center gap-2 text-base text-gray-700 md:text-lg">
                        <ArrowRight className="w-3.5 h-3.5 text-[#6B3FA0]" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-[#6B3FA0] rounded-2xl p-8 lg:p-10 text-white hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-black text-xl md:text-2xl mb-3 tracking-tight">Business Entities</h3>
                  <p className="text-white/90 text-base mb-5 leading-relaxed md:text-lg">Registered tourism and hospitality companies seeking:</p>
                  <ul className="space-y-2">
                    {["Trusted B2B partnerships", "Business enquiries and trading opportunities", "Market expansion and global visibility"].map((i, k) => (
                      <li key={k} className="flex items-center gap-2 text-base text-white/90 md:text-lg">
                        <ArrowRight className="w-3.5 h-3.5 text-[#22c55e]" /> {i}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <SectionWrapper>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6B3FA0]/10 text-[#6B3FA0] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              What We Offer
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Platform Features</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 hover:shadow-xl hover:-translate-y-1 transition-all hover:border-[#6B3FA0]/30">
                <div className="w-12 h-12 bg-[#6B3FA0]/10 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-[#6B3FA0]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-lg md:text-xl">{f.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed md:text-lg">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Verification */}
      <SectionDark id="verification">
        <div className="max-w-3xl mx-auto text-center">
          <ShieldCheck className="w-14 h-14 text-[#22c55e] mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 tracking-tight">Verification &; Trust Policy</h2>
          <p className="text-base text-white/80 leading-relaxed mb-10 md:text-lg">
            All members undergo a structured verification process. This may include business or professional credentials, contact and identity checks, and platform approval.
          </p>
          <div className="bg-white/10 rounded-2xl p-6 text-left max-w-2xl mx-auto border border-white/10">
            <ul className="space-y-3">
              {["Business registration or professional credentials", "Contact and identity verification", "Platform review and approval"].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-base text-white/90 md:text-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" /> {v}
                </li>
              ))}
            </ul>
            <p className="text-white/70 text-sm mt-6 border-t border-white/10 pt-4 md:text-base">
              Only verified members receive full access to networking, messaging, enquiries, and the Trade Wall.
            </p>
          </div>
        </div>
      </SectionDark>

      {/* How It Works */}
      <SectionWrapper>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-base text-gray-500 md:text-lg">Simple, structured, and secure — getting started is straightforward.</p>
          </div>
          <div className="space-y-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-center gap-5 bg-white border border-gray-200 rounded-2xl px-6 py-5 hover:border-[#6B3FA0]/40 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-[#6B3FA0] text-white font-black text-sm flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="font-semibold text-gray-800 text-base md:text-lg">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* FAQ */}
      <section className="py-16 lg:py-20 bg-gray-50" id="faq">
        <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="pl-6 lg:pl-8">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#6B3FA0]/10 text-[#6B3FA0] rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  FAQ
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 mb-4 tracking-tight">Frequently Asked Questions</h2>
                <p className="text-base text-gray-500 md:text-lg">Everything you need to know about Let&apos;s B2B.</p>
              </div>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <FAQItem key={i} q={faq.q} a={faq.a} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Code of Conduct */}
      <SectionWrapper>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#1a1625] rounded-2xl p-8 lg:p-10 text-white">
              <Mail className="w-10 h-10 text-[#22c55e] mb-6" />
              <h3 className="text-xl md:text-2xl font-black mb-3 tracking-tight">Feedback &; Support</h3>
              <p className="text-white/80 text-base leading-relaxed mb-6 md:text-lg">
                Share suggestions, report misuse, or request features. We use your feedback to improve the platform.
              </p>
              <a
                href="mailto:support@letsb2b.com"
                className="inline-flex items-center gap-3 bg-[#6B3FA0] hover:bg-[#5a3590] transition-colors px-5 py-3 rounded-full font-bold text-sm md:text-base"
              >
                <Mail className="w-4 h-4" />
                support@letsb2b.com
              </a>
            </div>
            <div className="bg-white rounded-2xl p-8 lg:p-10 border border-gray-200">
              <ShieldCheck className="w-10 h-10 text-[#6B3FA0] mb-6" />
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-3 tracking-tight">Code of Conduct</h3>
              <p className="text-gray-500 text-base mb-5 leading-relaxed md:text-lg">
                We expect professional conduct, no spam or misuse of messaging, and respect for ethics. Violations may lead to suspension or termination.
              </p>
              <Link href="/conduct" className="inline-flex items-center gap-2 text-[#6B3FA0] font-bold text-sm md:text-base hover:underline">
                Read full Code of Conduct <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* Commitment */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-5 lg:px-10 text-center">
          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-4 md:text-base">Our Commitment</p>
          <blockquote className="text-2xl font-black text-gray-900 leading-snug tracking-tight md:text-3xl">
            &quot;Let&apos;s B2B is a <span className="text-[#6B3FA0]">professional trade platform</span> for tourism and hospitality — for businesses and professionals who value credibility, trust, and sustainable growth.&quot;
          </blockquote>
        </div>
      </section>

      {/* CTA */}
      <SectionWrapper>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight sm:text-4xl md:text-5xl">Ready to Join?</h2>
          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto md:text-lg">Join verified tourism and hospitality professionals trading and growing on Let&apos;s B2B.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-[#6B3FA0] text-white font-bold rounded-full hover:bg-[#5a3590] transition-all shadow-lg uppercase text-xs tracking-widest">
              Join the Network
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 font-bold rounded-full hover:bg-gray-50 transition-all uppercase text-xs tracking-widest">
              View Membership Plans
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
