'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Lock, Eye, FileText, Scale,
  CheckCircle2, Users, AlertCircle, ArrowRight, Server
} from 'lucide-react';

const dataCollected = [
  { title: "Identity Data", items: "Full name, business name, professional title, profile photo" },
  { title: "Contact Data", items: "Email address, phone numbers, business address, WhatsApp" },
  { title: "Business Data", items: "Company registration, trade credentials, industry category" },
  { title: "Verification Documents", items: "GST, CIN, trade license, professional credentials (where applicable)" },
  { title: "Platform Usage Data", items: "Login activity, messages sent, Trade Wall posts, enquiries" },
  { title: "Technical Data", items: "IP address, browser type, device, location, cookies" },
];

const sections = [
  {
    id: 1, icon: Eye, title: "Introduction",
    content: `Let's B2B respects your privacy and is committed to protecting your personal and business information. This Privacy Policy explains how we collect, use, store, and protect data when you use our platform — a global B2B networking and trading platform exclusively for the tourism and hospitality industry.`,
  },
  {
    id: 3, icon: Lock, title: "How We Use Your Information",
    bullets: [
      "Profile creation, verification, and approval",
      "Enabling secure B2B networking and messaging between verified members",
      "Processing membership subscriptions and payments",
      "Improving platform experience and personalising your feed",
      "Sending platform notifications, updates, and announcements",
      "Compliance, security monitoring, and fraud prevention",
    ],
  },
  {
    id: 4, icon: Server, title: "Data Protection & Security",
    bullets: [
      "Secure encrypted data storage at all times",
      "User data is never sold to third parties",
      "Access is limited to authorized Let's B2B personnel only",
      "We use industry-standard security protocols and access controls",
      "Regular security audits are conducted to protect your information",
    ],
  },
  {
    id: 5, icon: Users, title: "Third-Party Sharing",
    content: "We do not sell or rent your personal data. Information may be shared only in the following circumstances:",
    bullets: [
      "When legally required (e.g. regulatory compliance, law enforcement requests)",
      "With verified service providers needed for platform operations (e.g. payment processors)",
      "During verification checks via authorized third-party verification services",
    ],
  },
  {
    id: 6, icon: ShieldCheck, title: "Data Retention",
    content: `We retain your personal and business data for as long as your account is active or as required by law. If you request account deletion, your data will be removed within 30 days, except where retention is required for legal or regulatory purposes.`,
  },
  {
    id: 7, icon: Scale, title: "Your Rights",
    bullets: [
      "Request access to the personal data we hold about you",
      "Request correction of inaccurate or incomplete information",
      "Request deletion of your account and associated data",
      "Withdraw consent for data processing (subject to legal obligations)",
      "Object to certain types of data processing",
      "To exercise your rights, contact us at support@letsb2b.com",
    ],
  },
  {
    id: 8, icon: AlertCircle, title: "Children's Privacy",
    content: `Let's B2B is a professional B2B platform intended for adults and businesses only. We do not knowingly collect data from individuals under the age of 18. If you believe a minor has registered, please contact us immediately.`,
  },
  {
    id: 9, icon: FileText, title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. When we make significant changes, we will notify you via email or a prominent notice on the platform. Continued use of the platform after changes implies acceptance.`,
  },
];

export default function PrivacyPolicy() {
  const lastUpdated = "February 23, 2026";

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-slate-900 px-8 py-14 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 rounded-full -mr-36 -mt-36 blur-3xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
                Legal Center
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Privacy Policy</h1>
              <p className="text-slate-400 text-sm">Let's B2B — Global Tourism &amp; Hospitality B2B Network</p>
              <p className="text-slate-500 text-xs mt-2">Last Updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-10">

            {/* Intro section */}
            <section id="section-1">
              <div className="flex items-center gap-3 text-blue-600 mb-3">
                <Eye className="w-5 h-5" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">1. Introduction</h2>
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">{sections[0].content}</p>
            </section>

            {/* Data Collected */}
            <section id="section-2">
              <div className="flex items-center gap-3 text-blue-600 mb-4">
                <FileText className="w-5 h-5" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">2. Information We Collect</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dataCollected.map((d, i) => (
                  <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors">
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{d.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{d.items}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Remaining sections */}
            {sections.slice(1).map((s, idx) => (
              <section key={s.id} id={`section-${s.id}`} className="scroll-mt-20">
                <div className="flex items-center gap-3 text-blue-600 mb-3">
                  <s.icon className="w-5 h-5 shrink-0" />
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {s.id}. {s.title}
                  </h2>
                </div>
                {s.content && (
                  <p className="text-slate-600 leading-relaxed text-sm mb-3">{s.content}</p>
                )}
                {s.bullets && (
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Footer */}
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Privacy inquiries</p>
                <a href="mailto:support@letsb2b.com" className="text-sm text-blue-600 font-semibold hover:underline">
                  support@letsb2b.com
                </a>
              </div>
              <div className="flex gap-3">
                <Link href="/terms" className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all text-xs">
                  Terms &amp; Conditions →
                </Link>
                <Link href="/cookies" className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all text-xs">
                  Cookie Policy →
                </Link>
                <button onClick={() => window.print()} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all text-xs flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
