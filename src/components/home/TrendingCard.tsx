"use client";

import React from "react";
import Image from "next/image";

const TrendingCard = () => {
  const trendingItems = [
    { topic: "Stay @ Munnar", growth: 23 },
    { topic: "Rent Car Goa", growth: 13 },
    { topic: "Budget Stay Calicut", growth: 5 },
    { topic: "Car Rent", growth: 5 },
    { topic: "Summer Stay Kerala", growth: 5 },
  ];

  return (
    <div>
      {/* Title outside the card */}
      <h3 className="text-[15px] font-medium text-[#000000] ml-1 mb-3">
        Trending Now!
      </h3>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col py-2">
          {trendingItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-[14px] text-gray-900">{item.topic}</span>

              <div className="flex items-center gap-1.5 text-[#1A8900] font-medium text-[14px]">
                <Image
                  src="/assets/icons/arrow-up.svg"
                  alt=""
                  width={17}
                  height={14}
                  className="shrink-0"
                />
                <span>+{item.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingCard;
