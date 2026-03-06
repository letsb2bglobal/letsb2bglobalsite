"use client";

import React from 'react';
import Image from 'next/image';

const TrendingCard = () => {
  const trendingItems = [
    { topic: 'Stay @ Munnar', growth: 23 },
    { topic: 'Rent Car Goa', growth: 13 },
    { topic: 'Budget Stay Calicut', growth: 5 },
    { topic: 'Car Rent', growth: 5 },
    { topic: 'Summer Stay Kerala', growth: 5 }
  ];

  return (
    <div className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <h3 className="text-[14px] font-medium text-[#612178]">Trending Now!</h3>
      </div>

      <div className="flex flex-col gap-2">
        {trendingItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group cursor-pointer">
            <span className="text-xs font-semibold text-gray-600 group-hover:text-[#6B3FA0] transition-colors">{item.topic}</span>
            <div className="flex items-center gap-1.5 text-[#1A8900] font-bold text-[10px]">
              <Image src="/assets/icons/arrow-up.svg" alt="" width={12} height={12} className="shrink-0" />
              <span>+{item.growth}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCard;
