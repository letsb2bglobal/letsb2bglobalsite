"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { X, Hash } from "lucide-react";

const TagsInput = () => {
  const { setValue, watch } = useFormContext();
  const [inputValue, setInputValue] = useState("");
  const tags: string[] = watch("tags") || [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^#/, "");
      if (!tags.includes(newTag)) {
        setValue("tags", [...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue("tags", tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="bg-[#F7F7FB] rounded-2xl p-6 border border-gray-100">
      <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-4">
        Tags Section
      </label>

      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-100 text-[#6B3FA0] rounded-full shadow-sm animate-in zoom-in duration-300"
          >
            <Hash size={12} strokeWidth={3} className="opacity-50" />
            <span className="text-[11px] font-bold tracking-tight">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-red-500 transition-colors"
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <Hash size={16} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type tag and press Enter... (e.g. luxury, family)"
          className="w-full h-11 pl-10 pr-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
        * enter to create tag
      </p>
    </div>
  );
};

export default TagsInput;
