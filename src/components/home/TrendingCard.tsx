"use client";

import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

const TrendingCard = () => {
  const trendingItems = [
    { topic: 'Stay At Munnar', growth: 31 },
    { topic: 'Rent Car Goa', growth: 13 },
    { topic: 'Budget Stay Calicut', growth: 5 },
    { topic: 'Car Rent', growth: 8 },
    { topic: 'Summer Stay Kerala', growth: 12 }
  ];

  return (
    <div className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-[#6B3FA0]" />
        <h3 className="text-sm font-bold text-gray-800">Trending Now</h3>
      </div>

      <div className="flex flex-col gap-4">
        {trendingItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer">
            <span className="text-xs font-semibold text-gray-600 group-hover:text-[#6B3FA0] transition-colors">{item.topic}</span>
            <div className="flex items-center gap-1 text-green-500 font-bold text-[10px] bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
               <ArrowUpRight size={10} />
               <span>+{item.growth}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCard;
