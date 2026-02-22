'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Settings, Eye, AlertCircle, CheckCircle2, ArrowRight, FileText } from 'lucide-react';

const cookieTypes = [
  {
    name: "Strictly Necessary Cookies",
    badge: "Always Active",
    badgeColor: "bg-green-100 text-green-700",
    desc: "These cookies are essential for the platform to function and cannot be switched off. They are set in response to actions made by you such as logging in, setting your preferences, or filling in forms.",
    examples: ["Authentication session tokens", "Security and fraud prevention cookies", "Load balancing cookies"],
  },
  {
    name: "Functional Cookies",
    badge: "Optional",
    badgeColor: "bg-blue-100 text-blue-700",
    desc: "These cookies allow the platform to remember choices you make and provide enhanced, more personalized features such as remembered language preferences and workspace settings.",
    examples: ["Language and region preferences", "Last visited profile or workspace", "UI customization preferences"],
  },
  {
    name: "Analytics Cookies",
    badge: "Optional",
    badgeColor: "bg-amber-100 text-amber-700",
    desc: "These cookies help us understand how members interact with the platform by collecting anonymous usage statistics. This information helps us improve the platform experience.",
    examples: ["Page visit counts and duration", "Feature usage patterns", "Error reporting and diagnostics"],
  },
  {
    name: "Performance Cookies",
    badge: "Optional",
    badgeColor: "bg-purple-100 text-purple-700",
    desc: "These cookies help us ensure the platform runs efficiently by monitoring performance, identifying bottlenecks, and measuring the speed of page loads.",
    examples: ["Page load time measurements", "API response tracking", "Platform health monitoring"],
  },
];

const sections = [
  {
    id: 1, icon: Cookie, title: "What Are Cookies?",
    content: `Cookies are small text files that are placed on your device when you visit the Let's B2B platform. They help the platform remember your preferences and actions over a period of time so you don't have to re-enter them whenever you return. Cookies can also be used to measure how you use the platform and to improve your experience.`,
  },
  {
    id: 2, icon: ShieldCheck, title: "How We Use Cookies",
    content: `Let's B2B uses cookies for the following purposes:`,
    bullets: [
      "To keep you logged in securely during your session",
      "To remember your workspace and account preferences",
      "To understand how members use the platform and improve functionality",
      "To monitor platform performance and stability",
      "To ensure platform security and prevent unauthorized access",
    ],
  },
  {
    id: 4, icon: Settings, title: "Managing Your Cookies",
    content: `You can control and manage cookies in your browser settings. Most browsers allow you to:`,
    bullets: [
      "View cookies stored on your device",
      "Block or delete specific cookies",
      "Block all cookies from being set",
      "Allow only certain websites to set cookies",
      "Note: Blocking strictly necessary cookies may prevent you from logging in or using core platform features.",
    ],
  },
  {
    id: 5, icon: Eye, title: "Third-Party Cookies",
    content: `In limited cases, trusted third-party services we use (such as payment processors and analytics tools) may set their own cookies. These are subject to the respective third-party's privacy and cookie policies. We do not control these cookies and they are used only as needed for platform operations.`,
  },
  {
    id: 6, icon: AlertCircle, title: "Cookie Retention",
    bullets: [
      "Session cookies — deleted when you close your browser",
      "Persistent cookies — stored for up to 12 months depending on their purpose",
      "You can delete cookies at any time via your browser settings",
    ],
  },
  {
    id: 7, icon: FileText, title: "Changes to This Policy",
    content: `We may update this Cookie Policy from time to time as our platform evolves or legal requirements change. Please review this policy periodically. Continued use of the platform after changes implies acceptance of the updated Cookie Policy.`,
  },
];

export default function CookiesPolicy() {
  const lastUpdated = "February 23, 2026";
  const [expandedCookie, setExpandedCookie] = useState<number | null>(null);

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-slate-900 px-8 py-14 text-white relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-amber-600/10 rounded-full -mr-36 -mb-36 blur-3xl" />
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full -ml-24 -mt-24 blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-5">
                Legal Center
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Cookie Policy</h1>
              <p className="text-slate-400 text-sm">Let's B2B — Global Tourism &amp; Hospitality B2B Network</p>
              <p className="text-slate-500 text-xs mt-2">Last Updated: {lastUpdated}</p>
            </div>
          </div>

          {/* Intro notice */}
          <div className="bg-amber-50 p-5 border-b border-amber-100 flex items-start gap-4">
            <Cookie className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900/80 leading-relaxed">
              Let's B2B uses cookies to ensure you get the best experience on our platform. By continuing to use Let's B2B, you agree to our use of cookies as described in this policy. You may manage cookie preferences in your browser settings.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10">

            {/* Opening sections */}
            {sections.slice(0, 2).map((s) => (
              <section key={s.id} id={`section-${s.id}`}>
                <div className="flex items-center gap-3 text-amber-600 mb-3">
                  <s.icon className="w-5 h-5 shrink-0" />
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {s.id}. {s.title}
                  </h2>
                </div>
                {s.content && <p className="text-slate-600 leading-relaxed text-sm mb-3">{s.content}</p>}
                {s.bullets && (
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Cookie Types */}
            <section id="section-3">
              <div className="flex items-center gap-3 text-amber-600 mb-5">
                <Settings className="w-5 h-5" />
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">3. Types of Cookies We Use</h2>
              </div>
              <div className="space-y-4">
                {cookieTypes.map((ct, i) => (
                  <div
                    key={i}
                    onClick={() => setExpandedCookie(expandedCookie === i ? null : i)}
                    className="border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-amber-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Cookie className="w-4 h-4 text-amber-500 shrink-0" />
                        <h3 className="font-bold text-slate-900 text-sm">{ct.name}</h3>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${ct.badgeColor}`}>
                        {ct.badge}
                      </span>
                    </div>
                    {expandedCookie === i && (
                      <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                        <p className="text-sm text-slate-600 leading-relaxed">{ct.desc}</p>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Examples</p>
                          <ul className="space-y-1">
                            {ct.examples.map((ex, j) => (
                              <li key={j} className="flex items-center gap-2 text-xs text-slate-500">
                                <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" /> {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Remaining sections */}
            {sections.slice(2).map((s) => (
              <section key={s.id} id={`section-${s.id}`} className="scroll-mt-20">
                <div className="flex items-center gap-3 text-amber-600 mb-3">
                  <s.icon className="w-5 h-5 shrink-0" />
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
                    {s.id}. {s.title}
                  </h2>
                </div>
                {s.content && <p className="text-slate-600 leading-relaxed text-sm mb-3">{s.content}</p>}
                {s.bullets && (
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                        <ArrowRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> {b}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {/* Footer */}
            <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-1 text-center md:text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cookie questions?</p>
                <a href="mailto:support@letsb2b.com" className="text-sm text-amber-600 font-semibold hover:underline">
                  support@letsb2b.com
                </a>
              </div>
              <div className="flex gap-3">
                <Link href="/privacy" className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all text-xs">
                  Privacy Policy →
                </Link>
                <Link href="/terms" className="px-5 py-2 bg-slate-100 text-slate-600 font-bold rounded-full hover:bg-slate-200 transition-all text-xs">
                  Terms →
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
