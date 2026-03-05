'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, AlertTriangle, MessageSquare, Users, FileText } from 'lucide-react';
import LegalPageLayout, { LegalPageFooter } from '@/components/LegalPageLayout';

const sections = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Our Commitment",
    content: `Let's B2B is a professional B2B platform built exclusively for the tourism and hospitality industry. We are committed to maintaining a trusted, ethical, and professional environment where members can network, collaborate, and grow their businesses. This Code of Conduct sets out the standards of behaviour we expect from all members and the consequences of failing to meet them.`,
  },
  {
    id: 2,
    icon: CheckCircle2,
    title: "Professional Conduct",
    content: "All members must:",
    bullets: [
      "Provide accurate and truthful information about themselves and their business",
      "Communicate in a professional, respectful, and business-appropriate manner",
      "Use the platform only for legitimate B2B networking and trade purposes",
      "Respect the intellectual property and confidential information of others",
      "Cooperate with verification processes and platform governance",
    ],
  },
  {
    id: 3,
    icon: AlertTriangle,
    title: "Prohibited Behaviour",
    content: "The following are strictly prohibited on Let's B2B:",
    bullets: [
      "Spam, unsolicited promotions, or repetitive non-relevant messaging",
      "Misuse of messaging or enquiry features for non-business purposes",
      "Harassment, impersonation, or misrepresentation of identity or business",
      "Sharing false, misleading, defamatory, or unethical content",
      "Violation of intellectual property rights or confidentiality",
      "Any activity that could harm, abuse, or undermine the trust of other members or the platform",
    ],
  },
  {
    id: 4,
    icon: MessageSquare,
    title: "Messaging & Enquiries",
    content: "Our messaging and enquiry features are designed for genuine B2B communication. Members must not use them to send bulk or automated messages, unsolicited marketing, or content unrelated to tourism and hospitality business. Abuse may result in immediate restriction or termination of access.",
  },
  {
    id: 5,
    icon: Users,
    title: "Trade Wall & Public Content",
    content: "Content posted on the Trade Wall or other public areas must be relevant to the industry, professional, and in line with this Code of Conduct. Promotional or non-industry-related posts may be removed. Repeated violations may lead to account action.",
  },
  {
    id: 6,
    icon: FileText,
    title: "Enforcement",
    content: "Let's B2B reserves the right to investigate any reported or suspected breach of this Code of Conduct. We may warn, suspend, or permanently terminate accounts and membership without prior notice where we determine that a breach has occurred. We also reserve the right to report serious misconduct to relevant authorities where appropriate.",
  },
];

export default function CodeOfConductPage() {
  const lastUpdated = "February 23, 2026";

  return (
    <LegalPageLayout
      title="Code of Conduct"
      subtitle="Professional standards and expected behaviour on Let's B2B"
      lastUpdated={lastUpdated}
      badge="Legal"
    >
      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={`section-${s.id}`} className="scroll-mt-24">
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
      </div>

      <LegalPageFooter
        emailLabel="Questions about our Code of Conduct?"
        links={[
          { label: 'Terms & Conditions', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' },
        ]}
      />
    </LegalPageLayout>
  );
}
