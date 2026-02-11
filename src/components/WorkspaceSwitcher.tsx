"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTeam, Workspace } from "@/context/TeamContext";

export default function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, switchWorkspace } = useTeam();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeWorkspace || workspaces.length <= 1) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-all text-sm font-bold text-gray-700"
      >
        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center text-white text-[10px]">
          {activeWorkspace.label.substring(0, 1).toUpperCase()}
        </div>
        <span className="max-w-[120px] truncate">{activeWorkspace.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-100 bg-gray-50/50">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Switch Workspace</span>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {workspaces.map((ws) => {
              const isActive = activeWorkspace.data.documentId === ws.data.documentId;
              return (
                <button
                  key={ws.data.documentId}
                  onClick={() => {
                    switchWorkspace(ws);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                    isActive ? "bg-blue-50/50 text-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs ${
                    ws.type === 'OWNER' ? 'bg-blue-600' : 'bg-gray-400'
                  }`}>
                    {ws.label.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{ws.label}</div>
                    <div className="text-[10px] opacity-70 uppercase tracking-tighter">
                      {ws.type === 'OWNER' ? 'Personal Account' : `Team Member (${ws.role})`}
                    </div>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
