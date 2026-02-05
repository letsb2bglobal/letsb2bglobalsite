"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchProfileProps {
  className?: string;
  placeholder?: string;
}

export default function SearchProfile({ 
  className = "", 
  placeholder = "Search profiles..." 
}: SearchProfileProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or filter profiles
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSearch} className={`flex bg-gray-100 rounded-md px-3 py-1.5 w-full max-w-md mx-4 items-center gap-2 border border-transparent focus-within:border-blue-500 transition-all ${className}`}>
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        className="bg-transparent border-none outline-none text-sm w-full"
      />
    </form>
  );
}
