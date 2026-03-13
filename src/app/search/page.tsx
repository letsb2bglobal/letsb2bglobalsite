"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, MoreVertical } from "lucide-react";
import TrendingCard from "@/components/home/TrendingCard";
import SuggestionsCard from "@/components/home/SuggestionsCard";
import InsightsCard from "@/components/home/InsightsCard";
import { searchBusinessProfiles, searchPosts, BusinessProfile, PostSearchResult } from "@/lib/search";

const mockBusinesses = [
  {
    id: 1,
    name: "Taj Vivanta Bangalore",
    location: "Bangalore, Karnataka, India",
    type: "Hotel",
    tagline: "Stunning 27-acre resort amidst forests in Western Ghats",
  },
  {
    id: 2,
    name: "JW Marriott",
    location: "Kochi, Kerala, India",
    type: "Hotel",
    tagline: "Luxury waterfront hotel with world-class hospitality",
  },
  {
    id: 3,
    name: "The Leela Palace",
    location: "Kochi, Kerala, India",
    type: "Hotel",
    tagline: "Iconic palace hotel with enchanting backwater views",
  },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";

  const [activeTab, setActiveTab] = useState<"business" | "enquiries">("business");
  const [keyword, setKeyword] = useState(query);
  const [showAllBusinesses, setShowAllBusinesses] = useState(false);
  const [businessResults, setBusinessResults] = useState<BusinessProfile[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  React.useEffect(() => {
    const text = keyword || query;
    const loc = location;
    let cancelled = false;
    const run = async () => {
      if (!text && !loc) {
        setBusinessResults([]);
        setPostResults([]);
        return;
      }

      setLoadingBusinesses(true);
      setLoadingPosts(true);
      try {
        const [biz, posts] = await Promise.all([
          searchBusinessProfiles(text, loc),
          searchPosts(text, loc),
        ]);
        if (!cancelled) {
          setBusinessResults(biz);
          setPostResults(posts);
        }
      } catch (e) {
        console.error("Failed to search business profiles", e);
        if (!cancelled) {
          setBusinessResults([]);
          setPostResults([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBusinesses(false);
          setLoadingPosts(false);
        }
      }
    };
    run();

    return () => {
      cancelled = true;
    };
  }, [keyword, query, location]);

  return (
    <div className="min-h-screen bg-[#f5f7fb] pt-[72px]">
      {/* <main className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-10 py-4 lg:py-8 flex flex-col lg:flex-row gap-6"> */}
      <main className="mx-auto px-4 md:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-12 gap-6 max-w-[1350px] mx-auto">
          {/* Main content column */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Top tabs + search / filters */}
            <div className="bg-white rounded-[24px] shadow-[0_12px_40px_rgba(15,23,42,0.06)] border border-slate-100 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-100 px-4 sm:px-6 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("business")}
                  className={`relative px-4 sm:px-6 pb-3 text-sm md:text-[15px] font-semibold transition-colors ${
                    activeTab === "business"
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Business
                  {activeTab === "business" && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#6B3FA0]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("enquiries")}
                  className={`relative px-4 sm:px-6 pb-3 text-sm md:text-[15px] font-semibold transition-colors ${
                    activeTab === "enquiries"
                      ? "text-slate-900"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Enquiries
                  {activeTab === "enquiries" && (
                    <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#6B3FA0]" />
                  )}
                </button>
              </div>

              {/* Search input, dropdowns and active chip */}
              <div className="px-4 sm:px-6 py-4 space-y-3 bg-[#f5f7ff]">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-9 sm:h-10 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-semibold placeholder:text-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 sm:px-4 h-9 sm:h-10 text-[11px] sm:text-xs font-semibold text-slate-700 hover:border-[#6B3FA0]/70"
                    >
                      Categories
                      <span className="ml-1 text-xs">▾</span>
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 sm:px-4 h-9 sm:h-10 text-[11px] sm:text-xs font-semibold text-slate-700 hover:border-[#6B3FA0]/70"
                    >
                      Sub Categories
                      <span className="ml-1 text-xs">▾</span>
                    </button>
                  </div>
                </div>

                {keyword && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setKeyword("")}
                      className="inline-flex items-center gap-2 rounded-full bg-[#f3e9ff] px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#6B3FA0]"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6B3FA0] text-white text-[9px]">
                        #
                      </span>
                      <span className="max-w-[160px] truncate">{keyword}</span>
                      <span className="text-xs">&times;</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Businesses Section */}
            {activeTab === "business" && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                <div className="flex items-center justify-between gap-2 p-5">
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900">
                    Businesses
                  </h2>
                </div>

                <div className="p-0">
                  {loadingBusinesses && (
                    <div className="flex items-center justify-center py-8 text-[11px] sm:text-xs text-slate-500">
                      Loading matching businesses...
                    </div>
                  )}
                  {!loadingBusinesses && businessResults.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-[11px] sm:text-xs text-slate-400">
                      No businesses found for your search.
                    </div>
                  )}
                  {(showAllBusinesses ? businessResults : businessResults.slice(0, 3)).map(
                    (biz) => {
                      const name = biz.full_name || biz.company_name || "Unknown Business";
                      const locationLabel = biz.city || "Location not specified";
                      const tagline = biz.tagline || "No tagline available";
                      return (
                      <div
                        key={biz.id}
                        className="flex items-start justify-between gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#f3e9ff] flex items-center justify-center text-[11px] sm:text-xs font-bold text-[#6b3fa0] shrink-0">
                            {name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[13px] sm:text-sm md:text-[15px] font-bold text-slate-900 truncate">
                              {name}
                            </p>
                            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                              {locationLabel}
                            </p>
                            <p className="text-[11px] sm:text-xs text-[#6b3fa0] font-semibold truncate">
                              {tagline}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            className="flex items-center gap-2 px-5 py-1.5 bg-[#6B3FA0] text-white text-sm font-medium rounded-lg hover:bg-[#5a3590] transition-colors"
                          >
                            <MessageSquare size={16} />
                            Message
                          </button>
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="More options"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* View all footer - only if more than 5 results */}
                {businessResults.length > 5 && (
                  <div className="border-t border-slate-100 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => setShowAllBusinesses((prev) => !prev)}
                      className="text-[11px] sm:text-xs font-semibold text-[#6b3fa0] hover:text-black"
                    >
                      {showAllBusinesses ? "View Less" : "View All"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Enquiries Section */}
            {(activeTab === "business" || activeTab === "enquiries") && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
                <div className="flex items-center justify-between gap-2 p-5">
                  <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900">
                    Enquiries
                  </h2>
                </div>

                <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                  {loadingPosts && (
                    <div className="flex items-center justify-center py-8 text-[11px] sm:text-xs text-slate-500">
                      Loading matching enquiries...
                    </div>
                  )}
                  {!loadingPosts && postResults.length === 0 && (
                    <div className="flex items-center justify-center py-8 text-[11px] sm:text-xs text-slate-400">
                      No enquiries found for your search.
                    </div>
                  )}
                  {postResults.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {postResults.map((item) => {
                        const title = item.title || "Enquiry";
                        const description = item.description || "No description available.";
                        const locationLabel = item.location || "Location not specified";
                        const company =
                          item.company_name || businessResults[0]?.company_name || "Business";
                        return (
                          <article
                            key={item.id}
                            className="border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col gap-3 hover:border-[#e2d4ff] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ffe9f0] flex items-center justify-center text-[11px] sm:text-xs font-bold text-[#e11d48]">
                                  {company.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-[12px] sm:text-[13px] font-semibold text-slate-900">
                                    {company}
                                  </p>
                                  {item.createdAt && (
                                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                                      {new Date(item.createdAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button className="text-slate-400 hover:text-slate-600">
                                ⋮
                              </button>
                            </div>

                            <h3 className="text-[13px] sm:text-sm md:text-[15px] font-bold text-slate-900">
                              {title}
                            </h3>

                            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-3">
                              {description}
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <p className="text-[10px] sm:text-[11px] text-slate-400">
                                {locationLabel}
                              </p>
                              <button className="px-3 sm:px-4 py-1.5 rounded-full bg-[#6B3FA0] text-white text-[11px] sm:text-xs font-semibold hover:bg-black transition-colors">
                                Respond
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* View all footer - only if more than 2 posts */}
                {postResults.length > 2 && (
                  <div className="border-t border-slate-100 px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeTab === "business") {
                          setActiveTab("enquiries");
                        }
                      }}
                      className="text-[11px] sm:text-xs font-semibold text-[#6b3fa0] hover:text-black"
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Cards below main content - visible below lg */}
            <div className="lg:hidden flex flex-col gap-4 mt-6">
              {/* Row: Trending + Suggestions on md to lg, stacked on small */}
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                <TrendingCard />
                <SuggestionsCard />
              </div>
              {/* Full-width Insights below */}
              <InsightsCard />
            </div>
          </div>

          {/* Right Sidebar - on large screens only */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <TrendingCard />
            <SuggestionsCard />
            <InsightsCard />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] pt-[72px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#e9ddff] border-t-[#6B3FA0] rounded-full animate-spin" />
            <p className="text-sm text-slate-500">Loading search results...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
