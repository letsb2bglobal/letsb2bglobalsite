'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Settings, Eye, AlertCircle, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import LegalPageLayout, { LegalPageFooter } from '@/components/LegalPageLayout';

const cookieTypes = [
  { name: "Strictly Necessary Cookies", badge: "Always Active", badgeColor: "bg-[#22c55e]/10 text-[#22c55e]", desc: "These cookies are essential for the platform to function and cannot be switched off. They are set in response to actions made by you such as logging in, setting your preferences, or filling in forms.", examples: ["Authentication session tokens", "Security and fraud prevention cookies", "Load balancing cookies"] },
  { name: "Functional Cookies", badge: "Optional", badgeColor: "bg-[#6B3FA0]/10 text-[#6B3FA0]", desc: "These cookies allow the platform to remember choices you make and provide enhanced, more personalized features such as remembered language preferences and workspace settings.", examples: ["Language and region preferences", "Last visited profile or workspace", "UI customization preferences"] },
  { name: "Analytics Cookies", badge: "Optional", badgeColor: "bg-[#6B3FA0]/10 text-[#6B3FA0]", desc: "These cookies help us understand how members interact with the platform by collecting anonymous usage statistics. This information helps us improve the platform experience.", examples: ["Page visit counts and duration", "Feature usage patterns", "Error reporting and diagnostics"] },
  { name: "Performance Cookies", badge: "Optional", badgeColor: "bg-[#6B3FA0]/10 text-[#6B3FA0]", desc: "These cookies help us ensure the platform runs efficiently by monitoring performance, identifying bottlenecks, and measuring the speed of page loads.", examples: ["Page load time measurements", "API response tracking", "Platform health monitoring"] },
];

const sections = [
  { id: 1, icon: Cookie, title: "What Are Cookies?", content: `Cookies are small text files that are placed on your device when you visit the LetsB2B platform. They help the platform remember your preferences and actions over a period of time so you don't have to re-enter them whenever you return. Cookies can also be used to measure how you use the platform and to improve your experience.` },
  { id: 2, icon: ShieldCheck, title: "How We Use Cookies", content: `LetsB2B uses cookies for the following purposes:`, bullets: ["To keep you logged in securely during your session", "To remember your workspace and account preferences", "To understand how members use the platform and improve functionality", "To monitor platform performance and stability", "To ensure platform security and prevent unauthorized access"] },
  { id: 4, icon: Settings, title: "Managing Your Cookies", content: `You can control and manage cookies in your browser settings. Most browsers allow you to:`, bullets: ["View cookies stored on your device", "Block or delete specific cookies", "Block all cookies from being set", "Allow only certain websites to set cookies", "Note: Blocking strictly necessary cookies may prevent you from logging in or using core platform features."] },
  { id: 5, icon: Eye, title: "Third-Party Cookies", content: `In limited cases, trusted third-party services we use (such as payment processors and analytics tools) may set their own cookies. These are subject to the respective third-party's privacy and cookie policies. We do not control these cookies and they are used only as needed for platform operations.` },
  { id: 6, icon: AlertCircle, title: "Cookie Retention", bullets: ["Session cookies — deleted when you close your browser", "Persistent cookies — stored for up to 12 months depending on their purpose", "You can delete cookies at any time via your browser settings"] },
  { id: 7, icon: FileText, title: "Changes to This Policy", content: `We may update this Cookie Policy from time to time as our platform evolves or legal requirements change. Please review this policy periodically. Continued use of the platform after changes implies acceptance of the updated Cookie Policy.` },
];

export default function CookiesPolicy() {
  const lastUpdated = "February 23, 2026";
  const [expandedCookie, setExpandedCookie] = useState<number | null>(null);

  return (
    <LegalPageLayout
      title="Cookie Policy"
      subtitle="LetsB2B — Global Tourism & Hospitality B2B Network"
      lastUpdated={lastUpdated}
      badge="Legal"
    >
      <div className="bg-[#6B3FA0]/10 border border-[#6B3FA0]/20 rounded-2xl p-5 flex items-start gap-4 mb-10">
        <Cookie className="w-5 h-5 text-[#6B3FA0] shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 leading-relaxed md:text-base">
          LetsB2B uses cookies to ensure you get the best experience on our platform. By continuing to use LetsB2B, you agree to our use of cookies as described in this policy. You may manage cookie preferences in your browser settings.
        </p>
      </div>

      {sections.slice(0, 2).map((s) => (
        <section key={s.id} id={`section-${s.id}`} className="scroll-mt-24 mb-10">
          <div className="flex items-center gap-3 text-[#6B3FA0] mb-3">
            <s.icon className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">{s.id}. {s.title}</h2>
          </div>
          {s.content && <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-3">{s.content}</p>}
          {s.bullets && (
            <ul className="space-y-2.5">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section id="section-3" className="mb-10 scroll-mt-24">
        <div className="flex items-center gap-3 text-[#6B3FA0] mb-5">
          <Settings className="w-5 h-5" />
          <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">3. Types of Cookies We Use</h2>
        </div>
        <div className="space-y-4">
          {cookieTypes.map((ct, i) => (
            <div
              key={i}
              onClick={() => setExpandedCookie(expandedCookie === i ? null : i)}
              className="border border-gray-200 rounded-2xl p-5 cursor-pointer hover:border-[#6B3FA0]/40 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Cookie className="w-4 h-4 text-[#6B3FA0] shrink-0" />
                  <h3 className="font-bold text-gray-900 text-base">{ct.name}</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ct.badgeColor}`}>{ct.badge}</span>
              </div>
              {expandedCookie === i && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <p className="text-base text-gray-600 leading-relaxed">{ct.desc}</p>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Examples</p>
                    <ul className="space-y-1">
                      {ct.examples.map((ex, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <ArrowRight className="w-3 h-3 text-[#6B3FA0] shrink-0" /> {ex}
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

      {sections.slice(2).map((s) => (
        <section key={s.id} id={`section-${s.id}`} className="mb-10 scroll-mt-24">
          <div className="flex items-center gap-3 text-[#6B3FA0] mb-3">
            <s.icon className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">{s.id}. {s.title}</h2>
          </div>
          {s.content && <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-3">{s.content}</p>}
          {s.bullets && (
            <ul className="space-y-2.5">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-gray-600">
                  <ArrowRight className="w-4 h-4 text-[#6B3FA0] shrink-0 mt-0.5" /> {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <LegalPageFooter
        emailLabel="Cookie questions?"
        links={[
          { label: 'Privacy Policy', href: '/privacy' },
          { label: 'Terms & Conditions', href: '/terms' },
        ]}
      />
    </LegalPageLayout>
  );
}
