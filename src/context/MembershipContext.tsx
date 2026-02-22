"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback, useMemo } from "react";
import { 
  getActiveMembershipPlans, 
  getUserSubscriptions,
  getTransactionHistory,
  getMembershipStatus
} from "@/modules/membership/services/membership.service";
import { getUser, getProfileData, setProfileData } from "@/lib/auth";
import { checkUserProfile } from "@/lib/profile";

export type MembershipStatus = {
  tier: string;
  is_active: boolean;
  expiry: string | null;
  message?: string;
};

type MembershipContextValue = {
  status: MembershipStatus | null;
  plans: any[];
  subscriptions: any[];
  transactions: any[];
  activeProfile: any | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(false);
  const isFetching = useRef(false);

  const loadData = useCallback(async (force = false) => {
    if (!force && isInitialMount.current) return;
    if (isFetching.current) return;
    
    try {
      isFetching.current = true;
      setLoading(true);
      setError(null);
      const user = getUser();

      // 1. Fetch Plans (Public)
      const plansData = await getActiveMembershipPlans().catch(() => []);
      let fetchedPlans = Array.isArray(plansData) ? plansData : [];
      let fetchedSubs: any[] = [];
      let fetchedTrans: any[] = [];
      let activeProfileData: any = null;
      let derivedStatus: MembershipStatus = {
        tier: "FREE",
        is_active: false,
        expiry: null
      };

      if (user?.id) {
        // 2. Try to get Profile from cookies first, otherwise fetch
        let profile = getProfileData();
        
        if (!profile) {
          profile = await checkUserProfile(user.id).catch(() => null);
          if (profile) {
            setProfileData(profile);
          }
        }
        
        activeProfileData = profile;
        
        if (profile?.documentId) {
          const profileId = profile.documentId;
          
          // 3. Fetch Data using profileId
          const [subsData, transData, statusData] = await Promise.all([
            getUserSubscriptions(profileId).catch(() => []),
            getTransactionHistory(profileId).catch(() => []),
            getMembershipStatus(profileId).catch(() => null)
          ]);
          
          fetchedSubs = Array.isArray(subsData) ? subsData : [];
          fetchedTrans = Array.isArray(transData) ? transData : [];

          // 4. Status Derivation (Multi-Membership Aware)
          // We prioritize the actual subscription list as it's the source of truth
          const activeSubs = fetchedSubs.filter(s => s.is_active);
          
          if (activeSubs.length > 0) {
            // Sort by end_date descending to get the most relevant/latest active subscription
            const latestSub = [...activeSubs].sort((a, b) => 
              new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
            )[0];

            derivedStatus = {
              tier: latestSub.tier_id || latestSub.tier || "VERIFIED",
              is_active: true,
              expiry: latestSub.end_date || null,
              message: "Your premium trade credentials are currently active."
            };
          } else if (statusData) {
            // Fallback to the dedicated status API if no active list items found
            derivedStatus = {
              tier: statusData.tier || "FREE",
              is_active: statusData.is_active || false,
              expiry: statusData.expiry || null,
              message: statusData.message || (statusData.is_active ? "Your subscription is active." : "You are on the free plan.")
            };
          } else {
            // Ultimate fallback to FREE
            derivedStatus = {
              tier: "FREE",
              is_active: false,
              expiry: null,
              message: "Unlock global opportunities by upgrading your plan."
            };
          }
        }
      }

      // Batch state updates
      setPlans(fetchedPlans);
      setSubscriptions(fetchedSubs);
      setTransactions(fetchedTrans);
      setStatus(derivedStatus);
      setActiveProfile(activeProfileData);
      isInitialMount.current = true;

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load membership data";
      setError(msg);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = useCallback(() => loadData(true), [loadData]);

  const value = useMemo(() => ({
    status,
    plans,
    subscriptions,
    transactions,
    activeProfile,
    loading,
    error,
    refresh
  }), [status, plans, subscriptions, transactions, activeProfile, loading, error, refresh]);

  return (
    <MembershipContext.Provider value={value}>
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const ctx = useContext(MembershipContext);
  if (ctx === undefined) {
    throw new Error("useMembership must be used inside MembershipProvider");
  }
  return ctx;
}
