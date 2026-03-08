"use client";

import React from "react";
import { Plus } from "lucide-react";

const SuggestionsCard = () => {
  const suggestions = [
    { name: "Taj Vivanta Bangalore", mutual: "12" },
    { name: "JW Marriott", mutual: "4" },
    { name: "The Leela Palace", mutual: "8" },
    { name: "The Oberoi", mutual: "6" },
    { name: "Golden Palms", mutual: "3" },
    { name: "Elegance Bangalore", mutual: "15" },
  ];

  return (
    <div className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-5 mt-4">
      <h3 className="text-[14px] font-medium text-[#612178]">
        Suggested Connections
      </h3>

      <div className="flex flex-col gap-4">
        {suggestions.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 border border-gray-100 bg-[#f6f2f8] rounded-full flex items-center justify-center text-[10px] font-bold text-purple-800">
                {item.name.substring(0, 1)}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-gray-800 group-hover:text-[#6B3FA0] transition-colors leading-tight">
                  {item.name}
                </span>
                <span className="text-[12px] text-gray-400 font-medium">
                  {item.mutual} Mutual connections
                </span>
              </div>
            </div>
            <button className="p-1 px-2 border border-[#6B3FA0]/20 text-[#6B3FA0] hover:bg-[#6B3FA0] hover:text-white rounded-full transition-all">
              <Plus size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>




      <button className="text-[11px] font-bold text-[#6B3FA0] hover:underline mt-2">
        See All Suggestions
      </button>
    </div>
  );
};

export default SuggestionsCard;
