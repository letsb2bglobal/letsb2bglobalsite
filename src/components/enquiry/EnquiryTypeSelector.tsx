"use client";

import React from "react";
import { Bed, Map, Car, Users, HeartPulse } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { EnquiryType } from "@/lib/validations/enquiry";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ENQUIRY_TYPES = [
  { id: "accommodation", label: "Accommodation", icon: Bed },
  { id: "tours", label: "Tours", icon: Map },
  { id: "transportation", label: "Transportation", icon: Car },
  { id: "mice", label: "MICE", icon: Users },
  { id: "medical_tourism", label: "Medical Tourism", icon: HeartPulse },
];

interface EnquiryTypeSelectorProps {
  selected: string;
  onChange: (type: EnquiryType) => void;
}

const EnquiryTypeSelector: React.FC<EnquiryTypeSelectorProps> = ({
  selected,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
      {ENQUIRY_TYPES.map((type) => {
        const Icon = type.icon;
        const isActive = selected === type.id;

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id as EnquiryType)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group active:scale-95",
              isActive
                ? "border-[#6B3FA0] bg-[#6B3FA0]/5 text-[#6B3FA0]"
                : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:bg-gray-50"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all",
                isActive
                  ? "bg-[#6B3FA0] text-white shadow-lg shadow-purple-200"
                  : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
              )}
            >
              <Icon size={24} strokeWidth={2} />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-center">
              {type.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default EnquiryTypeSelector;
