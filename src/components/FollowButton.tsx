"use client";

import React, { useState, useEffect } from "react";
import { 
  followProfile, 
  unfollowProfile, 
  getConnectionStatus 
} from "@/modules/networking/services/networking.service";
import { useMembership } from "@/context/MembershipContext";

interface FollowButtonProps {
  targetProfileId: string;
  className?: string;
}

export default function FollowButton({ targetProfileId, className = "" }: FollowButtonProps) {
  const { activeProfile } = useMembership();
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (!activeProfile?.documentId || !targetProfileId) {
        setLoading(false);
        return;
      }
      
      // Don't follow yourself
      if (activeProfile.documentId === targetProfileId) {
        setLoading(false);
        return;
      }

      try {
        const conn = await getConnectionStatus(activeProfile.documentId, targetProfileId);
        setConnection(conn);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [activeProfile?.documentId, targetProfileId]);

  const handleFollow = async () => {
    if (!activeProfile?.documentId) {
      alert("Please complete your profile to follow others.");
      return;
    }

    setActionLoading(true);
    try {
      if (connection) {
        // Unfollow
        await unfollowProfile(connection.documentId || connection.id);
        setConnection(null);
      } else {
        // Follow
        const newConn = await followProfile(activeProfile.documentId, targetProfileId);
        setConnection(newConn);
      }
      
      // Dispatch event to refresh counters elsewhere
      window.dispatchEvent(new CustomEvent("networking:updated", { 
        detail: { profileId: targetProfileId } 
      }));
    } catch (error) {
      console.error("Follow action failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !activeProfile || activeProfile.documentId === targetProfileId) {
    return null;
  }

  const isFollowing = !!connection;

  return (
    <button
      onClick={handleFollow}
      disabled={actionLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2 min-w-[120px] justify-center
        ${isFollowing 
          ? isHovered 
            ? "bg-rose-50 text-rose-600 border-2 border-rose-200"
            : "border-2 border-slate-200 text-slate-700 bg-white" 
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"}
        ${actionLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      {actionLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
      ) : isFollowing ? (
        isHovered ? (
          "Unfollow"
        ) : (
          <>
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            Following
          </>
        )
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Follow
        </>
      )}
    </button>
  );
}
