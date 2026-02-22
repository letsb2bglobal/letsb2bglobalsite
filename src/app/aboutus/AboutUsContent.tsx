'use client';

import React, { useState } from 'react';
import {
  Globe, ShieldCheck, MessageSquare, BarChart2,
  CheckCircle2, Users, Megaphone, ArrowRight,
  Mail, ChevronDown, ChevronUp, Star, Lock, Handshake
} from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    q: "Is Let's B2B only for tourism and hospitality?",
    a: "Yes. The platform is exclusively built for the tourism and hospitality industry, covering all verticals from travel agents and DMCs to hotels, transport, and wellness providers.",
  },
  {
    q: "Is verification mandatory?",
    a: "Yes. Verification is essential to maintain the trust and credibility that is the foundation of our platform. Only verified members receive full access to networking, messaging, and the Trade Wall.",
  },
  {
    q: "Can members message each other directly?",
    a: "Yes. Secure one-to-one business messaging is available between verified members, enabling professional digital communication.",
  },
  {
    q: "Does Let's B2B sell leads?",
    a: "No. The platform facilitates direct B2B enquiries and partnerships between verified members — not lead selling.",
  },
  {
    q: "Is the platform global?",
    a: "Yes. Let's B2B connects tourism trade partners across India and worldwide, encompassing inbound, outbound, and domestic tourism.",
  },
  {
    q: "Who can join Let's B2B?",
    a: "Both individual tourism/hospitality professionals and registered business entities can join. Individuals seeking networking and career growth, and companies seeking B2B partnerships, enquiries, and market expansion.",
  },
];

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
  {
    icon: Globe,
    title: "Global B2B Networking",
    desc: "Connect with verified tourism and hospitality professionals and businesses worldwide.",
  },
  {
    icon: Handshake,
    title: "Trusted Partnerships",
    desc: "Identify reliable partners for collaboration, contracting, and long-term trade relationships.",
  },
  {
    icon: Lock,
    title: "Secure One-to-One Messaging",
    desc: "Professional digital communication between verified members only.",
  },
  {
    icon: MessageSquare,
    title: "Business Enquiries & Trading",
    desc: "Receive and manage genuine B2B enquiries and trading opportunities relevant to your services.",
  },
  {
    icon: BarChart2,
    title: "Enquiry Management System",
    desc: "Track, respond to, and manage all business communications through a centralized dashboard.",
  },
  {
    icon: Megaphone,
    title: "Trade Wall & Industry Exchange",
    desc: "Share partnership requirements, hotel allotments, destination promotions, trade updates, and tourism event information.",
  },
];

const howItWorks = [
  "Register as an Individual Professional or Business Entity",
  "Complete your profile and submit verification details",
  "Get approved by the platform",
  "Connect digitally with verified global trade partners",
  "Collaborate, trade, and grow your business",
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="font-bold text-slate-900 text-sm leading-relaxed">{q}</p>
        <span className="text-blue-600 shrink-0 mt-0.5">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </div>
      {open && (
        <p className="mt-4 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </p>
      )}
    </div>
  );
}

export default function AboutUs() {
  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative py-24 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 opacity-[0.06] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-black uppercase tracking-widest mb-8">
            Est. 2024 · Global Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Global Tourism &amp; Hospitality<br />
            <span className="text-blue-400">B2B Network</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-3xl mx-auto">
            Finding reliable and trusted business partners and connecting digitally for business growth and trading.
          </p>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-6">
                About Let's B2B
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                Built for the Tourism &amp; Hospitality Trade
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Let's B2B is a global B2B networking and trading platform built <strong>exclusively for the tourism and hospitality industry</strong>, enabling professionals and businesses to connect, collaborate, and grow across India and international markets.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                The platform is designed to address one of the most critical challenges in the industry — finding <strong>reliable, verified, and trusted business partners</strong>. With a strong focus on trust, verification, and professionalism, Let's B2B helps members expand their reach, strengthen partnerships, and grow their businesses sustainably.
              </p>
              <ul className="space-y-3">
                {[
                  "Verified tourism and hospitality professionals",
                  "Secure B2B networking and messaging",
                  "Pan-India presence with international reach",
                  "Ethical, transparent, and long-term partnerships",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-200 col-span-2">
                <Globe className="w-10 h-10 text-blue-200 mb-4" />
                <h3 className="font-bold text-lg mb-2">A Borderless Global Platform</h3>
                <p className="text-blue-100 text-sm leading-relaxed">Connecting businesses across inbound, outbound, and domestic tourism — across India and international markets.</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-slate-900 text-sm mb-1">Trust First</h3>
                <p className="text-xs text-slate-500">All members undergo verification before full access.</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl text-white">
                <Users className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-bold text-sm mb-1">Community Driven</h3>
                <p className="text-xs text-slate-400">Built on mutual growth and professional ethics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-white rounded-3xl p-10 border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Vision</h3>
              <p className="text-slate-600 leading-relaxed">
                To become the <strong>most trusted global B2B networking and trading platform</strong> for the tourism and hospitality industry.
              </p>
            </div>
            {/* Mission */}
            <div className="bg-slate-900 rounded-3xl p-10 text-white hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-black mb-4">Mission</h3>
              <ul className="space-y-3">
                {[
                  "Create a trusted global tourism trade network",
                  "Digitally connect verified tourism and hospitality professionals",
                  "Enable ethical, transparent, and long-term B2B partnerships",
                  "Support business growth and cross-border trading",
                  "Simplify global networking within the tourism ecosystem",
                ].map((m, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <ArrowRight className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── VERTICALS ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              Industry Coverage
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Tourism &amp; Hospitality Verticals</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Let's B2B covers the full spectrum of the tourism and hospitality trade ecosystem.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {verticals.map((v, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md transition-all">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                <span className="text-sm font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO CAN JOIN ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Who Can Join</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Let's B2B welcomes serious tourism professionals and businesses committed to ethical, long-term trade.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-10 border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-black text-slate-900 text-xl mb-3">Individual Professionals</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">Tourism and hospitality professionals seeking:</p>
              <ul className="space-y-2">
                {["Industry networking", "Career and professional growth", "Business collaboration opportunities"].map((i, k) => (
                  <li key={k} className="flex items-center gap-2 text-sm text-slate-700">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-600 rounded-3xl p-10 text-white hover:shadow-xl hover:shadow-blue-200 transition-shadow">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-black text-xl mb-3">Business Entities</h3>
              <p className="text-blue-100 text-sm mb-5 leading-relaxed">Registered tourism and hospitality companies seeking:</p>
              <ul className="space-y-2">
                {["Trusted B2B partnerships", "Business enquiries and trading opportunities", "Market expansion and global visibility"].map((i, k) => (
                  <li key={k} className="flex items-center gap-2 text-sm text-blue-100">
                    <ArrowRight className="w-3.5 h-3.5 text-blue-300" /> {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              What We Offer
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Everything You Need to Trade &amp; Grow</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-8 hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VERIFICATION ── */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <ShieldCheck className="w-14 h-14 text-blue-400 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Verification &amp; Trust Policy</h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Trust is the foundation of Let's B2B. All members undergo a structured verification process, which may include business registration or professional credentials, contact and identity verification, and platform review and approval.
          </p>
          <div className="bg-white/10 rounded-2xl p-6 text-left max-w-2xl mx-auto border border-white/10">
            <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mb-4">Verification may include</p>
            <ul className="space-y-3">
              {[
                "Business registration or professional credentials",
                "Contact and identity verification",
                "Platform review and approval",
              ].map((v, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> {v}
                </li>
              ))}
            </ul>
            <p className="text-slate-400 text-xs mt-6 border-t border-white/10 pt-4">
              Only verified members receive full access to networking, messaging, business enquiries, and the Trade Wall &amp; Industry Exchange.
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-500">Simple, structured, and secure — getting started is straightforward.</p>
          </div>
          <div className="space-y-4">
            {howItWorks.map((step, i) => (
              <div key={i} className="flex items-center gap-5 bg-white border border-slate-200 rounded-2xl px-6 py-5 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {i + 1}
                </div>
                <p className="font-semibold text-slate-800 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black mb-12">Why Choose Let's B2B</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              "Exclusively for tourism and hospitality",
              "Trusted and verified global network",
              "Designed for B2B networking and trading",
              "Pan-India presence with international reach",
              "Professional, secure, and ethical ecosystem",
            ].map((w, i) => (
              <div key={i} className="bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-blue-200 mb-3 mx-auto" />
                <p className="text-sm font-semibold text-blue-50 leading-relaxed text-center">{w}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-slate-50" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest mb-4">
              FAQ
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about Let's B2B.</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT & FEEDBACK ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact */}
            <div className="bg-slate-900 rounded-3xl p-10 text-white">
              <Mail className="w-10 h-10 text-blue-400 mb-6" />
              <h3 className="text-xl font-black mb-3">Feedback &amp; Support</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Your feedback helps us improve. Members can share suggestions, report misuse, or request feature enhancements.
              </p>
              <a
                href="mailto:support@letsb2b.com"
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 transition-colors px-5 py-3 rounded-xl font-bold text-sm"
              >
                <Mail className="w-4 h-4" />
                support@letsb2b.com
              </a>
            </div>
            {/* Code of Conduct */}
            <div className="bg-white rounded-3xl p-10 border border-slate-200">
              <ShieldCheck className="w-10 h-10 text-blue-600 mb-6" />
              <h3 className="text-xl font-black text-slate-900 mb-3">Code of Conduct</h3>
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">To maintain professionalism and protect all members:</p>
              <ul className="space-y-3">
                {[
                  "No spam or unsolicited promotions",
                  "No misuse of messaging or enquiries",
                  "Respect professional ethics",
                  "Violations may result in suspension or termination",
                ].map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMITMENT ── */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4">Our Commitment</p>
          <blockquote className="text-2xl font-black text-slate-900 leading-snug">
            "Let's B2B is not a social network. It is a professional tourism and hospitality <span className="text-blue-600">trade platform</span>, created for serious businesses and professionals who value credibility, trust, and sustainable growth."
          </blockquote>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Ready to Join the Network?</h2>
          <p className="text-slate-500 mb-10 max-w-xl mx-auto">Join thousands of verified tourism and hospitality professionals already trading, networking, and growing on Let's B2B.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase text-xs tracking-widest">
              Join the Network
            </Link>
            <Link href="/pricing" className="px-8 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">
              View Membership Plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
