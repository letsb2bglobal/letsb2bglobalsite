"use client";

import React from 'react';
import { Sparkles, Play } from 'lucide-react';

const InsightsCard = () => {
  return (
    <div className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-4 mt-4">
      <div className="flex items-center gap-2">
         <Sparkles size={16} className="text-[#6B3FA0]" />
         <h3 className="text-sm font-bold text-gray-800">Popular Insights</h3>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[8px] text-gray-500">J</div>
        <span className="text-[10px] font-bold text-gray-800">JW Marriott</span>
      </div>

      <div className="rounded-xl aspect-square bg-[#f6f2f8] relative overflow-hidden group cursor-pointer border border-gray-50 shadow-sm">
        {/* Banner image placeholder */}
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
           <div className="w-10 h-10 bg-[#6B3FA0] rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-200 group-hover:scale-110 transition-transform">
             <Play size={16} fill="white" />
           </div>
           <p className="text-xs font-bold text-gray-800 leading-snug">Inspire Your Next Creative Video Campaign</p>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
           <span className="text-[10px] text-white font-bold">Watch Now</span>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
