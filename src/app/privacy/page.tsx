'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck, Lock, Eye, FileText, Scale,
  CheckCircle2, Users, AlertCircle, Server
} from 'lucide-react';
import LegalPageLayout, { LegalPageFooter } from '@/components/LegalPageLayout';

const dataCollected = [
  { title: "Identity Data", items: "Full name, business name, professional title, profile photo" },
  { title: "Contact Data", items: "Email address, phone numbers, business address, WhatsApp" },
  { title: "Business Data", items: "Company registration, trade credentials, industry category" },
  { title: "Verification Documents", items: "GST, CIN, trade license, professional credentials (where applicable)" },
  { title: "Platform Usage Data", items: "Login activity, messages sent, Trade Wall posts, enquiries" },
  { title: "Technical Data", items: "IP address, browser type, device, location, cookies" },
];

const sections = [
  { id: 1, icon: Eye, title: "Introduction", content: `Let's B2B respects your privacy and is committed to protecting your personal and business information. This Privacy Policy explains how we collect, use, store, and protect data when you use our platform — a global B2B networking and trading platform exclusively for the tourism and hospitality industry.` },
  { id: 3, icon: Lock, title: "How We Use Your Information", bullets: ["Profile creation, verification, and approval", "Enabling secure B2B networking and messaging between verified members", "Processing membership subscriptions and payments", "Improving platform experience and personalising your feed", "Sending platform notifications, updates, and announcements", "Compliance, security monitoring, and fraud prevention"] },
  { id: 4, icon: Server, title: "Data Protection & Security", bullets: ["Secure encrypted data storage at all times", "User data is never sold to third parties", "Access is limited to authorized Let's B2B personnel only", "We use industry-standard security protocols and access controls", "Regular security audits are conducted to protect your information"] },
  { id: 5, icon: Users, title: "Third-Party Sharing", content: "We do not sell or rent your personal data. Information may be shared only in the following circumstances:", bullets: ["When legally required (e.g. regulatory compliance, law enforcement requests)", "With verified service providers needed for platform operations (e.g. payment processors)", "During verification checks via authorized third-party verification services"] },
  { id: 6, icon: ShieldCheck, title: "Data Retention", content: `We retain your personal and business data for as long as your account is active or as required by law. If you request account deletion, your data will be removed within 30 days, except where retention is required for legal or regulatory purposes.` },
  { id: 7, icon: Scale, title: "Your Rights", bullets: ["Request access to the personal data we hold about you", "Request correction of inaccurate or incomplete information", "Request deletion of your account and associated data", "Withdraw consent for data processing (subject to legal obligations)", "Object to certain types of data processing", "To exercise your rights, contact us at support@letsb2b.com"] },
  { id: 8, icon: AlertCircle, title: "Children's Privacy", content: `Let's B2B is a professional B2B platform intended for adults and businesses only. We do not knowingly collect data from individuals under the age of 18. If you believe a minor has registered, please contact us immediately.` },
  { id: 9, icon: FileText, title: "Changes to This Policy", content: `We may update this Privacy Policy from time to time to reflect changes in our services or legal requirements. When we make significant changes, we will notify you via email or a prominent notice on the platform. Continued use of the platform after changes implies acceptance.` },
];

export default function PrivacyPolicy() {
  const lastUpdated = "February 23, 2026";

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Let's B2B — Global Tourism & Hospitality B2B Network"
      lastUpdated={lastUpdated}
      badge="Legal"
    >
      <section id="section-1" className="scroll-mt-24">
        <div className="flex items-center gap-3 text-[#6B3FA0] mb-3">
          <Eye className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">1. Introduction</h2>
        </div>
        <p className="text-gray-600 leading-relaxed text-base md:text-lg">{sections[0].content}</p>
      </section>

      <section id="section-2" className="mt-10 scroll-mt-24">
        <div className="flex items-center gap-3 text-[#6B3FA0] mb-4">
          <FileText className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">2. Information We Collect</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {dataCollected.map((d, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-[#6B3FA0]/30 transition-colors">
              <h3 className="font-bold text-gray-900 text-sm mb-1">{d.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{d.items}</p>
            </div>
          ))}
        </div>
      </section>

      {sections.slice(1).map((s) => (
        <section key={s.id} id={`section-${s.id}`} className="mt-10 scroll-mt-24">
          <div className="flex items-center gap-3 text-[#6B3FA0] mb-3">
            <s.icon className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
              {s.id}. {s.title}
            </h2>
          </div>
          {s.content && <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-3">{s.content}</p>}
          {s.bullets && (
            <ul className="space-y-2.5">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <LegalPageFooter
        emailLabel="Privacy inquiries"
        links={[
          { label: 'Terms & Conditions', href: '/terms' },
          { label: 'Cookie Policy', href: '/cookies' },
        ]}
      />
    </LegalPageLayout>
  );
}
