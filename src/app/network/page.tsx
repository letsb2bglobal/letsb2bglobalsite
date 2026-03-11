"use client";

import React, { useState } from "react";
import {
  Search,
  MapPin,
  MessageSquare,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import TrendingCard from "@/components/home/TrendingCard";
import SuggestionsCard from "@/components/home/SuggestionsCard";

type TabType = "connections" | "invitations" | "suggestions";

interface Connection {
  id: string;
  name: string;
  logo?: string;
  location: string;
}

const mockConnections: Connection[] = [
  {
    id: "1",
    name: "Taj Vivanta Bangalore",
    logo: "/assets/logos/taj.png",
    location: "Bangalore, Karnataka, India",
  },
  {
    id: "2",
    name: "JW Marriott",
    logo: "/assets/logos/marriott.png",
    location: "Kochi, Kerala, India",
  },
  {
    id: "3",
    name: "The Leela Palace",
    logo: "/assets/logos/leela.png",
    location: "Kochi, Kerala, India",
  },
  {
    id: "4",
    name: "The Oberoi",
    logo: "/assets/logos/oberoi.png",
    location: "Kochi, Kerala, India",
  },
  {
    id: "5",
    name: "Golden Palms",
    logo: "/assets/logos/golden.png",
    location: "Kochi, Kerala, India",
  },
  {
    id: "6",
    name: "Elegance Bangalore",
    logo: "/assets/logos/elegance.png",
    location: "Bangalore, Karnataka, India",
  },
];

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<TabType>("connections");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recently_added");

  const tabs: { id: TabType; label: string }[] = [
    { id: "connections", label: "Connections" },
    { id: "invitations", label: "Invitations" },
    { id: "suggestions", label: "Suggestions" },
  ];

  const filteredConnections = mockConnections.filter((conn) =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#f6f2f8] pt-[72px]">
      <main className="mx-auto px-4 md:px-6 lg:px-10 py-6">
        <div className="grid grid-cols-12 gap-6 max-w-[1350px] mx-auto">
          {/* Left Sidebar Spacer - visible from lg and up */}
          {/* <div className="hidden lg:block lg:col-span-3" /> */}

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              {/* Tabs */}
              <div className="border-b border-gray-100">
                <div className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-6 py-4 text-[16px] font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? "text-[#6B3FA0]"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-5 right-5 h-[2px] bg-[#6B3FA0] mb-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
              {/* Search and Sort Bar */}
              <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center gap-4">
                  <span className="text-[14px] font-semibold text-[#000000]">
                    209 connections
                  </span>
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-4 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B3FA0]/20 focus:border-[#6B3FA0] w-[200px] sm:w-[240px] md:w-[280px] lg:w-[330px] xl:w-[370px]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <button className="flex items-center gap-1 text-sm font-semibold text-gray-700 hover:text-[#6B3FA0]">
                    Recently added
                    <ChevronDown size={16} />
                  </button>
                </div>
              </div>

              {/* Connections List */}
              <div className="divide-y divide-gray-50">
                {filteredConnections.map((connection) => (
                  <ConnectionCard key={connection.id} connection={connection} />
                ))}
              </div>
            </div>

            {/* Cards below main content - visible below lg (two columns) */}
            <div className="lg:hidden grid grid-cols-2 gap-4 mt-6">
              <TrendingCard />
              <SuggestionsCard />
            </div>
          </div>

          {/* Right Sidebar - visible from lg and up */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <TrendingCard />
            <SuggestionsCard />
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

function ConnectionCard({ connection }: { connection: Connection }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
      <div className="flex items-center gap-4">
        {/* Profile Image */}
        <div className="w-14 h-14 rounded-full border border-gray-100 bg-white flex items-center justify-center overflow-hidden shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f8f4fc] to-[#efe8f5] flex items-center justify-center text-[#6B3FA0] font-bold text-lg">
            {connection.name.substring(0, 1)}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <h4 className="text-[15px] font-bold text-gray-900 hover:text-[#6B3FA0] cursor-pointer transition-colors">
            {connection.name}
          </h4>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin size={14} className="shrink-0" />
            <span className="text-[13px]">{connection.location}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-5 py-2 bg-[#6B3FA0] text-white text-sm font-semibold rounded-lg hover:bg-[#5a3590] transition-colors">
          <MessageSquare size={16} />
          Message
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  View Profile
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                  Remove Connection
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50">
                  Report
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
