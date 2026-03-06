"use client";

import React from 'react';
import { MessageSquare, Zap, ShieldCheck, Share2, ArrowRight } from 'lucide-react';

const EnquiryArchitecture = () => {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-purple-50/50 mb-6 overflow-hidden relative group">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#6B3FA0] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-200">
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Real-Time Enquiry Engine</h2>
            <p className="text-[10px] font-black text-[#6B3FA0] uppercase tracking-[0.2em]">Next-Gen B2B Communication Architecture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (Hidden on mobile) */}
          <div className="hidden md:block absolute top-1/2 left-[30%] w-[10%] h-[2px] bg-gradient-to-r from-purple-100 to-indigo-100 -translate-y-full"></div>
          <div className="hidden md:block absolute top-1/2 left-[60%] w-[10%] h-[2px] bg-gradient-to-r from-indigo-100 to-purple-100 -translate-y-full"></div>

          {/* Step 1: Frontend */}
          <div className="flex flex-col items-center text-center gap-4 p-5 rounded-2xl bg-[#faf8fc] border border-purple-50 hover:border-purple-200 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#6B3FA0] border border-purple-50">
              <MessageSquare size={28} />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase mb-1">Frontend Layer</h3>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-2">Socket.io Client managed via <span className="text-[#6B3FA0]">useEnquirySocket()</span> custom hook for instant reactivity.</p>
            </div>
          </div>

          {/* Step 2: Protocol */}
          <div className="flex flex-col items-center text-center gap-4 p-5 rounded-2xl bg-[#f8faff] border border-indigo-50 hover:border-indigo-200 transition-all hover:shadow-lg scale-105 shadow-md">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 border border-indigo-50">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase mb-1">Secure Protocol</h3>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-2">WSS (Websocket Secure) with JWT Authentication middleware & thread participant validation.</p>
            </div>
          </div>

          {/* Step 3: Backend */}
          <div className="flex flex-col items-center text-center gap-4 p-5 rounded-2xl bg-[#fdf8fa] border border-pink-50 hover:border-pink-200 transition-all hover:shadow-lg">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-pink-600 border border-pink-50">
              <Zap size={28} />
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase mb-1">Backend Core</h3>
              <p className="text-[10px] text-gray-500 font-bold leading-relaxed px-2">Strapi Real-time Service handles DB persistence & broadcats events to thread rooms instantly.</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-${i * 100 + 100} flex items-center justify-center text-[10px] font-black text-white`}>
                  {i === 1 ? 'UI' : i === 2 ? 'WS' : 'DB'}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Optimized for high-concurrency B2B trade threads</span>
          </div>

          <button className="flex items-center gap-2 text-[#6B3FA0] font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all">
            Technical Docs <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnquiryArchitecture;
