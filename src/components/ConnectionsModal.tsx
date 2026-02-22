"use client";

import React, { useState, useEffect } from "react";
import { getFollowers, getFollowing } from "@/modules/networking/services/networking.service";
import FollowButton from "./FollowButton";
import Link from "next/link";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileId: string;
  initialTab: "followers" | "following";
}

export default function ConnectionsModal({ isOpen, onClose, profileId, initialTab }: ConnectionsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadList();
    }
  }, [isOpen, activeTab, verifiedOnly]);

  const loadList = async () => {
    setLoading(true);
    try {
      if (activeTab === "followers") {
        const data = await getFollowers(profileId, { verifiedOnly });
        setList(data);
      } else {
        const data = await getFollowing(profileId);
        setList(data);
      }
    } catch (error) {
      console.error("Error loading connections:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Networking</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-50">
          <button
            onClick={() => { setActiveTab("followers"); setVerifiedOnly(false); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "followers" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Followers {activeTab === "followers" && list.length > 0 && `(${list.length})`}
          </button>
          <button
            onClick={() => { setActiveTab("following"); setVerifiedOnly(false); }}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "following" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Following {activeTab === "following" && list.length > 0 && `(${list.length})`}
          </button>
        </div>

        {/* Filters (only for followers) */}
        {activeTab === "followers" && (
          <div className="px-6 py-3 bg-slate-50/50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Partners</p>
            <button 
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border ${
                verifiedOnly 
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              <svg className={`w-3 h-3 ${verifiedOnly ? 'text-white' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Only
            </button>
          </div>
        )}

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Network...</p>
            </div>
          ) : list.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {list.map((item) => {
                const profileInRange = activeTab === "followers" ? item.follower : item.following;
                // Double check to ensure we only show active profiles
                if (!profileInRange) return null;

                return (
                  <div key={item.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-center justify-between gap-4">
                    <Link 
                      href={`/profile/${profileInRange.documentId}`}
                      onClick={onClose}
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                        {profileInRange.profileImageUrl ? (
                          <img src={profileInRange.profileImageUrl} alt={profileInRange.company_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-black">
                            {profileInRange.company_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">
                            {profileInRange.company_name}
                          </p>
                          {(profileInRange.verified_badge || item.is_verified_follow) && (
                            <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5">
                          {profileInRange.business_type || profileInRange.user_type} • {profileInRange.city}
                        </p>
                        {item.is_mutual && (
                          <span className="mt-1 inline-flex bg-slate-100 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Mutual Partner</span>
                        )}
                      </div>
                    </Link>
                    
                    <FollowButton 
                      targetProfileId={profileInRange.documentId} 
                      className="px-4 py-1.5 text-[10px]"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 005.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                {verifiedOnly ? "No verified partners yet" : "Network list is empty"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
