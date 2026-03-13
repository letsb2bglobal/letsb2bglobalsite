"use client";

import React from "react";
import { BadgeCheck, ExternalLink } from "lucide-react";

const InsightsCard = () => {
  return (
    <div>
      {/* Title outside the card */}
      <h3 className="text-[15px] font-medium text-[#000000] ml-1 mb-3">
        Popular Insights
      </h3>
      
      {/* Card */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Header with company info */}
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AB</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">ABC Holiday&apos;s</span>
            <BadgeCheck size={16} className="text-blue-500 fill-blue-500" />
          </div>
          <ExternalLink size={16} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
        </div>
        
        {/* Image with overlay */}
        <div className="relative aspect-[16/10] cursor-pointer group overflow-hidden">
          <img
            src="/global-travel-network/travel_block.png"
            alt="Insights"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            {/* Tag */}
            <div className="inline-block px-2 py-1 bg-[#0a4d68] text-white text-[9px] font-bold uppercase tracking-wide rounded mb-2">
              Travel &amp; Tourism Ideas
            </div>
            <p className="text-white text-sm font-bold leading-5">
              Inspire Your Next Creative Video Campaign
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
