"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link2, Plus, X } from "lucide-react";

interface ExternalLink {
  title: string;
  url: string;
}

const ExternalLinksInput = () => {
  const { setValue, watch } = useFormContext();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const links: ExternalLink[] = watch("externalLinks") || [];

  const addLink = () => {
    if (title && url) {
      const newLink = { title, url: url.startsWith("http") ? url : `https://${url}` };
      setValue("externalLinks", [...links, newLink]);
      setTitle("");
      setUrl("");
    }
  };

  const removeLink = (index: number) => {
    setValue("externalLinks", links.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#F7F7FB] rounded-2xl p-6 border border-gray-100">
      <label className="block text-xs font-black text-[#6B3FA0] uppercase tracking-[0.2em] mb-4">
        External Links Section
      </label>

      {/* Inputs */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Link Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Itinerary Sheet"
            className="w-full h-11 px-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
          />
        </div>
        <div className="flex-[1.5]">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            URL
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Link2 size={16} strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="google.drive.com/..."
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#6B3FA0]/20 outline-none font-bold text-[13px] transition-all"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={addLink}
          className="mt-5 self-end h-11 px-6 bg-[#6B3FA0] text-white rounded-xl font-bold text-[13px] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
        >
          <Plus size={16} strokeWidth={3} />
          <span>Add</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {links.map((link, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 py-3.5 bg-white border border-gray-100 rounded-xl shadow-sm animate-in slide-in-from-left duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[#6B3FA0]">
                <Link2 size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-gray-800 leading-none mb-1">
                  {link.title}
                </span>
                <span className="text-[10px] font-medium text-gray-400 truncate max-w-[200px]">
                  {link.url}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X size={16} strokeWidth={3} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExternalLinksInput;
