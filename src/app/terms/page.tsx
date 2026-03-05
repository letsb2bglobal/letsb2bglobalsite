'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText, ShieldCheck, BadgeCheck, Users,
  MessageSquare, Megaphone, AlertCircle, Scale,
  ArrowRight
} from 'lucide-react';
import LegalPageLayout, { LegalPageFooter } from '@/components/LegalPageLayout';

const sections = [
  { id: 1, icon: BadgeCheck, title: "Platform Purpose", content: `Let's B2B is a professional B2B platform designed exclusively for the tourism and hospitality industry. Its purpose is to facilitate networking, partnerships, business enquiries, and trade interactions between verified tourism and hospitality professionals and businesses globally.` },
  { id: 2, icon: Users, title: "Eligibility", bullets: ["Only individuals and businesses related to tourism and hospitality may register.", "Users must provide accurate, complete, and truthful information at all times.", "Registration is subject to verification and formal approval by the platform.", "Misrepresentation of identity or business nature will result in immediate termination."] },
  { id: 3, icon: BadgeCheck, title: "Membership & Access", bullets: ["Access levels and features depend on the membership type and plan selected.", "Paid memberships are subject to the pricing terms agreed at the time of subscription.", "Let's B2B reserves the right to modify, suspend, or terminate memberships for violations.", "Membership benefits are non-transferable and apply only to the registered entity."] },
  { id: 4, icon: ShieldCheck, title: "Verification", bullets: ["Verification is mandatory for full platform access.", "Let's B2B may request business documents or professional credentials at any time.", "Verification status may be revoked if information is found to be inaccurate or misleading.", "Verification does not guarantee specific business outcomes or results."] },
  { id: 5, icon: AlertCircle, title: "User Conduct", content: "All users must maintain professional conduct at all times. The following are strictly prohibited:", bullets: ["Spam, unsolicited promotions, or repetitive non-relevant messaging", "Harassment, impersonation, or misrepresentation", "Misuse of messaging features for non-business purposes", "Violation of intellectual property rights", "Sharing false, misleading, or unethical content", "Violations may result in suspension or permanent removal from the platform."] },
  { id: 6, icon: MessageSquare, title: "Messaging & Trade Wall", bullets: ["Messaging and Trade Wall access is available to verified members only.", "All content must be relevant, professional, and industry-related.", "Let's B2B is not responsible for agreements, transactions, or disputes made between members.", "Members are solely responsible for performing their own due diligence before engaging in any business arrangement."] },
  { id: 7, icon: Megaphone, title: "Trade Wall – Acceptable Use", content: "The Trade Wall is a professional exchange space. Permitted content includes:", bullets: ["Partnership requirements and allotment needs", "Destination promotions and service requirements", "Trade updates and industry announcements", "Tourism events and exhibition information", "Promotional or non-industry-related posts are not permitted."] },
  { id: 8, icon: Scale, title: "Limitation of Liability", content: `Let's B2B acts solely as a facilitator and is not a party to any business transaction between members. We do not guarantee the accuracy of member profiles, the completion of any trade deal, or the quality of services offered by members. Users bear full responsibility for their own business decisions and due diligence.` },
  { id: 9, icon: FileText, title: "Intellectual Property", content: `All content, trademarks, logos, and platform materials are the property of Let's B2B. Users may not copy, reproduce, distribute, or create derivative works without express written permission. User-generated content remains the property of the respective user, but by posting, users grant Let's B2B a non-exclusive license to display it on the platform.` },
  { id: 10, icon: AlertCircle, title: "Termination", content: `Let's B2B reserves the right to suspend or terminate access to the platform at any time for violations of these Terms, without prior notice. Upon termination, all licenses granted under these Terms will immediately cease.` },
  { id: 11, icon: FileText, title: "Amendments", content: `These Terms may be updated periodically to reflect changes in our services, legal requirements, or operational policies. Continued use of the platform following any update implies acceptance of the revised terms. We recommend reviewing these Terms regularly.` },
  { id: 12, icon: Scale, title: "Governing Law", content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of India.` },
];

export default function TermsOfService() {
  const lastUpdated = "February 23, 2026";

  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="Let's B2B — Global Tourism & Hospitality B2B Network"
      lastUpdated={lastUpdated}
      badge="Legal"
    >
      <div className="bg-[#6B3FA0]/10 border border-[#6B3FA0]/20 rounded-2xl p-5 flex items-start gap-4 mb-10">
        <AlertCircle className="w-5 h-5 text-[#6B3FA0] shrink-0 mt-0.5" />
        <p className="text-sm text-gray-700 leading-relaxed md:text-base">
          By accessing or using the Let's B2B platform, you agree to be bound by these Terms &amp; Conditions. If you do not agree, you must not access or use the platform. This platform is intended for <strong>tourism and hospitality B2B use only</strong>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest w-full mb-2">Jump to</p>
        {sections.map((s) => (
          <a key={s.id} href={`#section-${s.id}`} className="text-xs font-bold text-gray-600 hover:text-[#6B3FA0] px-3 py-1.5 bg-gray-100 rounded-full hover:bg-[#6B3FA0]/10 transition-all">
            {s.id}. {s.title}
          </a>
        ))}
      </div>

      {sections.map((s) => (
        <section key={s.id} id={`section-${s.id}`} className="mt-10 scroll-mt-24 first:mt-0">
          <div className="flex items-center gap-3 text-[#6B3FA0] mb-3">
            <s.icon className="w-5 h-5 shrink-0" />
            <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
              {s.id}. {s.title}
            </h2>
          </div>
          {s.content && <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-4">{s.content}</p>}
          {s.bullets && (
            <ul className="space-y-2.5 mt-3">
              {s.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-gray-600">
                  <ArrowRight className="w-4 h-4 text-[#6B3FA0] shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <LegalPageFooter
        emailLabel="Questions about these Terms?"
        links={[{ label: 'Privacy Policy', href: '/privacy' }]}
      />
    </LegalPageLayout>
  );
}
