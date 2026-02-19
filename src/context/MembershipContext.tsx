"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getMembershipStatus } from "@/modules/membership/services/membership.service";

export type MembershipStatus = {
  tier: string;
  is_active: boolean;
  expiry: string | null;
  message?: string;
};

type MembershipContextValue = {
  status: MembershipStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadStatus() {
    try {
      setLoading(true);
      setError(null);
      const data = await getMembershipStatus();
      setStatus(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load membership status";
      setError(msg);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <MembershipContext.Provider value={{ status, loading, error, refresh: loadStatus }}>
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
