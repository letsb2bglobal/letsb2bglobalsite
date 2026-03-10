'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send, Loader2, ArrowRight } from 'lucide-react';
import GreenBarMarquee from '@/components/GreenBarMarquee';

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a topic' },
  { value: 'general', label: 'General enquiry' },
  { value: 'support', label: 'Support' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'verification', label: 'Verification' },
  { value: 'other', label: 'Other' },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: subject.trim() || 'General enquiry',
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('success');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#080604]">
      {/* Hero — dark base + subtle amber glow from bottom-left (#f7a319 scheme, darker) */}
      <section className="relative flex flex-col min-h-[70vh] overflow-hidden bg-[#080604]">
        {/* Gradient: subtle dark amber at bottom-left, mostly dark */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 120% 100% at 0% 100%, rgba(139,80,20,0.35) 0%, rgba(90,50,12,0.2) 25%, rgba(40,22,8,0.12) 50%, transparent 65%),
              #080604
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
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Contact Us
            </h1>
            <p className="text-base text-white/80 mt-3 max-w-xl sm:text-lg sm:mt-4">
              Get in touch for support, feedback, or partnership enquiries. We&apos;re here to help.
            </p>
            <div className="flex flex-col gap-2 mt-5 sm:flex-row sm:flex-wrap sm:gap-3 sm:mt-6">
              <a
                href="#contact"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-white text-[#1a1625] font-bold rounded-full hover:bg-white/95 transition-colors text-sm"
              >
                Get in Touch
              </a>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3.5 bg-[#f7a319] text-[#1a1625] font-bold rounded-full hover:bg-[#e89410] transition-colors text-sm"
              >
                Join the Network
              </Link>
            </div>
            <Link
              href="#contact"
              className="inline-flex items-center justify-center w-12 h-12 mt-8 rounded-full border border-white/30 text-white/90 hover:bg-white/10 hover:text-white transition-all"
              aria-label="Scroll to contact form"
            >
              <ArrowRight className="w-5 h-5 -rotate-45" />
            </Link>
          </div>
        </div>
        <div className="relative z-10 shrink-0">
          <GreenBarMarquee />
        </div>
      </section>

      {/* Contact section */}
      <section
        id="contact"
        className="relative bg-white border-t-[3px] border-[#22c55e] py-16 lg:py-20"
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#e91e8c]" aria-hidden="true" />
        <div className="w-full max-w-[1440px] mx-auto px-5 lg:px-10">
          <div className="pl-6 lg:pl-8">
            <div className="max-w-4xl mx-auto">
              {/* Contact form */}
              <div className="mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-2 tracking-tight">
                  Send us a message
                </h2>
                <p className="text-base text-gray-600 mb-8 md:text-lg">
                  Fill out the form below and we&apos;ll get back to you as soon as we can.
                </p>

                {status === 'success' && (
                  <div className="mb-6 p-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#166534] font-medium text-base">
                    Thank you for reaching out. We&apos;ve received your message and will get back to you soon.
                  </div>
                )}
                {status === 'error' && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 font-medium text-base">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-bold text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] focus:border-transparent transition-all"
                        disabled={status === 'sending'}
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-sm font-bold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] focus:border-transparent transition-all"
                        disabled={status === 'sending'}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-subject" className="block text-sm font-bold text-gray-700 mb-2">
                      Topic
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] focus:border-transparent transition-all"
                      disabled={status === 'sending'}
                    >
                      {SUBJECT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-bold text-gray-700 mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="How can we help?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0] focus:border-transparent transition-all resize-y min-h-[120px]"
                      disabled={status === 'sending'}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#6B3FA0] text-white font-bold rounded-full hover:bg-[#5a3590] disabled:opacity-70 disabled:cursor-not-allowed transition-all uppercase text-xs tracking-widest"
                  >
                    {status === 'sending' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Feedback & Support */}
                <div className="bg-[#1a1625] rounded-2xl p-8 lg:p-10 text-white">
                  <Mail className="w-10 h-10 text-[#22c55e] mb-6" />
                  <h2 className="text-xl md:text-2xl font-black mb-3 tracking-tight">Feedback &; Support</h2>
                  <p className="text-white/80 text-base leading-relaxed mb-6 md:text-lg">
                    Have a question, suggestion, or need help? Reach out and we&apos;ll get back to you as soon as possible.
                  </p>
                  <a
                    href="mailto:support@letsb2b.com"
                    className="inline-flex items-center gap-3 bg-[#6B3FA0] hover:bg-[#5a3590] transition-colors px-5 py-3 rounded-full font-bold text-sm md:text-base"
                  >
                    <Mail className="w-4 h-4" />
                    support@letsb2b.com
                  </a>
                </div>

                {/* General Enquiries */}
                <div className="bg-gray-50 rounded-2xl p-8 lg:p-10 border border-gray-200">
                  <MessageSquare className="w-10 h-10 text-[#6B3FA0] mb-6" />
                  <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-3 tracking-tight">General Enquiries</h2>
                  <p className="text-gray-600 text-base leading-relaxed mb-6 md:text-lg">
                    For partnership opportunities, verification queries, or platform information, email us at the address below.
                  </p>
                  <a
                    href="mailto:support@letsb2b.com"
                    className="inline-flex items-center gap-3 bg-white border-2 border-[#6B3FA0] text-[#6B3FA0] hover:bg-[#6B3FA0] hover:text-white transition-colors px-5 py-3 rounded-full font-bold text-sm md:text-base"
                  >
                    <Send className="w-4 h-4" />
                    support@letsb2b.com
                  </a>
                </div>
              </div>

              {/* Join CTA */}
              <div className="mt-12 text-center">
                <p className="text-base text-gray-600 mb-6 md:text-lg">
                  Ready to join the global tourism & hospitality B2B network?
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#6B3FA0] text-white font-bold rounded-full hover:bg-[#5a3590] transition-all shadow-lg uppercase text-xs tracking-widest"
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 font-bold rounded-full hover:bg-gray-50 transition-all uppercase text-xs tracking-widest"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
