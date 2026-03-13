"use client";

import React from "react";
import { Plus, ChevronRight } from "lucide-react";

const SuggestionsCard = () => {
  const suggestions = [
    { name: "Taj Vivanta Bangalore", mutual: 2, logoColor: "#f5e6d3" },
    { name: "JW Marriott", mutual: 7, logoColor: "#8b4513" },
    { name: "The Leela Palace", mutual: 21, logoColor: "#1a1a2e" },
    { name: "The Oberoi", mutual: 5, logoColor: "#daa520" },
    { name: "Golden Plams", mutual: 7, logoColor: "#2e8b57" },
    { name: "Elegance Bangalore", mutual: 3, logoColor: "#4a0e4e" },
  ];

  return (
    <div>
      {/* Title outside the card with arrow */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-medium text-[#000000] ml-1">
          Suggested Connections
        </h3>
        <ChevronRight
          size={18}
          className="text-gray-400 cursor-pointer hover:text-gray-600"
        />
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: item.logoColor }}
                >
                  {item.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-semibold text-gray-900">
                    {item.name}
                  </span>
                  <span className="text-[12px] text-gray-500">
                    {item.mutual} Mutual Connection
                    {item.mutual !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <button className="w-7 h-7 flex items-center justify-center border border-[#434343] text-gray-500 hover:bg-[#434343] hover:border-gray-400 hover:text-white rounded-full transition-all">
                <Plus size={14} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsCard;
