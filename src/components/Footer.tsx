'use client';

import React from 'react';
import Link from 'next/link';
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/aboutus' },
      { name: 'Features', href: '/aboutus#features' },
      { name: 'Membership Plans', href: '/pricing' },
      { name: 'Verification Policy', href: '/aboutus#verification' },
      { name: 'FAQ', href: '/aboutus#faq' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Code of Conduct', href: '/aboutus#conduct' },
    ],
    support: [
      { name: 'Feedback & Support', href: 'mailto:support@letsb2b.com' },
      { name: 'Report an Issue', href: 'mailto:support@letsb2b.com' },
      { name: 'Feature Requests', href: 'mailto:support@letsb2b.com' },
    ],
    social: [
      { name: 'LinkedIn', icon: Linkedin, href: '#' },
      { name: 'Twitter', icon: Twitter, href: '#' },
      { name: 'Instagram', icon: Instagram, href: '#' },
      { name: 'Facebook', icon: Facebook, href: '#' },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* ── Brand Column ── */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-blue-400 font-black text-3xl italic tracking-tighter">L</span>
              <span className="font-black text-white uppercase tracking-tight text-lg underline decoration-blue-500 decoration-4 underline-offset-4">
                Let's B2B
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              The global B2B networking and trading platform built exclusively for the tourism and hospitality industry.
            </p>
            <div className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300">Verified Members Only.</span>{' '}
                All members are verified to maintain trust, credibility, and a professional ecosystem.
              </p>
            </div>
            <div className="flex gap-3">
              {footerLinks.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="p-2.5 bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-white/10 rounded-xl transition-all"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Company Links ── */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-6">Company</h4>
            <ul className="space-y-3.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal Links ── */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-6">Legal</h4>
            <ul className="space-y-3.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Support ── */}
          <div>
            <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-6">Support</h4>
            <ul className="space-y-3.5">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Us</p>
              <a
                href="mailto:support@letsb2b.com"
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
              >
                <Mail className="w-4 h-4" />
                support@letsb2b.com
              </a>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs font-medium">
            © {currentYear} Let's B2B — Global Tourism &amp; Hospitality B2B Network. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
              Cookies
            </Link>
            <Link href="/aboutus#faq" className="text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-widest transition-colors">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
