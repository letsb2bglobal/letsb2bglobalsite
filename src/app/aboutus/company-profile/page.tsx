"use client";

import Image from "next/image";
import { useState } from "react";

export default function CompanyProfilePage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categorySuggestions = [
    "Technology",
    "Manufacturing", 
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Construction",
    "Consulting",
    "Real Estate",
    "Transportation",
    "Agriculture",
    "Energy",
    "Entertainment",
    "Food & Beverage",
    "Hospitality"
  ];

  const filteredSuggestions = categorySuggestions.filter(
    (category) =>
      category.toLowerCase().includes(inputValue.toLowerCase()) &&
      !categories.includes(category)
  );

  const addCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter((cat) => cat !== categoryToRemove));
  };

  const removeLastCategory = () => {
    if (inputValue === "" && categories.length > 0) {
      setCategories(categories.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addCategory(inputValue.trim());
    } else if (e.key === "Backspace" && inputValue === "") {
      removeLastCategory();
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Header */}
      <header className="flex items-center justify-between px-8 py-4 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="LetsB2B Logo"
            width={36}
            height={36}
          />
          <span className="text-lg font-medium">
            Let’s <span className="font-bold">B2B</span>
          </span>
        </div>

        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white text-sm font-medium">?</div>
      </header>

      {/* Main Content */}
      <main className="flex justify-center py-10 bg-white">
        <div className="w-full max-w-md">
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-semibold">
              Hello John Doe, Welcome to Let’s <span className="font-bold">B2B</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              List your Company Lorem ipsum is simply dummy text of the printing
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-gray-400" />
              <span className="text-xs mt-1">Company info.</span>
            </div>

            <div className="w-20 h-px bg-gray-300" />

            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full border border-gray-400" />
              <span className="text-xs mt-1">KYC Verification</span>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <input className="input" placeholder="Company Name" />

            {/* Category Tag Input */}
            <div className="relative">
              <div 
                className="min-h-[48px] p-2 border border-gray-300 rounded-md flex flex-wrap gap-2 items-center cursor-text"
                onClick={() => document.getElementById('category-input')?.focus()}
              >
                {categories.map((category, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {category}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCategory(category);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 font-bold text-base leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  id="category-input"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  onFocus={() => setShowSuggestions(inputValue.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={categories.length === 0 ? "Category" : ""}
                  className="flex-1 outline-none min-w-[120px] px-2 py-1 text-sm"
                />
              </div>
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => addCategory(suggestion)}
                      className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <textarea
              className="input h-20 resize-none"
              placeholder="About (optional)"
            />

            <input className="input" placeholder="Phone Number" />
            <input className="input" placeholder="Address Line" />
            <input className="input" placeholder="Country" />
            <input className="input" placeholder="City" />
            <input className="input" placeholder="PIN" />

            {/* Logo Upload */}
            <div className="border rounded-md px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                Logo{" "}
                <span className="text-red-500 text-xs ml-2">
                  500x500px max file size 1mb
                </span>
              </span>
              <button
                type="button"
                className="px-3 py-1 border rounded text-sm"
              >
                Choose file
              </button>
            </div>

            <input className="input" placeholder="Website link (optional)" />
            <input className="input" placeholder="Facebook (optional)" />

            <div className="flex justify-end">
              <div className="text-sm flex items-center gap-2 text-gray-600 cursor-pointer">
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-white text-xs font-medium">+</div> Add Social Media Profile
              </div>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="w-full h-12 bg-blue-100 text-black font-medium rounded-md"
            >
              CONTINUE
            </button>

            <button
              type="button"
              className="w-full h-12 border rounded-md font-medium"
            >
              SKIP NOW
            </button>
          </form>
        </div>
      </main>

      {/* Tailwind reusable input style */}
      <style jsx global>{`
        .input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 14px;
        }
        .input:focus {
          outline: none;
          border-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
