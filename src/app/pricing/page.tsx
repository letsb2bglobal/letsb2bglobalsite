'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { useTeam } from '@/context/TeamContext';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher';
import { clearAuthData, getUser } from '@/lib/auth';
import { checkUserProfile } from '@/lib/profile';
import { getActiveMembershipPlans, buySubscription } from '@/modules/membership/services/membership.service';
import { useMembership } from '@/context/MembershipContext';

export default function PricingPage() {
  const router = useRouter();
  const user = useAuth();
  const { permissions } = useTeam();
  const [verifiedDuration, setVerifiedDuration] = useState('months_3');
  const [premiumDuration, setPremiumDuration] = useState('months_3');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { status: membershipStatus, loading: membershipLoading } = useMembership();

  useEffect(() => {
    async function loadProfile() {
      const user = getUser();
      if (!user) {
        router.replace('/signin');
        return;
      }
      try {
        const response = await checkUserProfile(user.id);
        console.log("checkUserProfile full response:", response);

        const r = response as any;
        const normalizedProfile =
          r?.documentId
            ? r
            : r?.data?.documentId
            ? r.data
            : r?.data?.attributes
            ? { ...r.data.attributes, documentId: r.data.documentId }
            : null;

        console.log("User ID:", user?.id);
        console.log("Normalized Profile:", normalizedProfile);

        setProfile(normalizedProfile);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, [router]);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        const data = await getActiveMembershipPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load plans", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  const getPlan = (tier: string, duration: string) => {
    return plans.find(
      (plan) =>
        plan.tier_id === tier &&
        plan.duration_code === duration
    );
  };

  const verifiedPlan = getPlan("VERIFIED", verifiedDuration);
  const premiumPlan = getPlan("PREMIUM", premiumDuration);

  const durationMap: Record<string, string> = {
    months_3: "3_months",
    months_6: "6_months",
    months_12: "12_months",
  };

  async function handleBuy(tier: string, duration: string) {
    if (!profile?.documentId) return;
    try {
      const backendDuration = durationMap[duration] ?? duration;
      const response = await buySubscription(
        profile.documentId,
        tier,
        backendDuration
      );

      console.log("Buy subscription response:", response);
    } catch (err: any) {
      console.error("Buy failed:", err.message);
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef]">
        {/* Navigation Bar */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800 hidden md:block">LET&apos;S B2B</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block">Pricing</h1>
          <div className="flex items-center gap-6">
            <WorkspaceSwitcher />
            <button onClick={() => router.push('/')} className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
              <span className="text-[10px] font-medium hidden md:block">Home</span>
            </button>
            <button onClick={() => router.push('/messages')} className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" /></svg>
              <span className="text-[10px] font-medium hidden md:block">Messaging</span>
            </button>
            {permissions?.isOwner && (
              <button onClick={() => router.push('/profile?action=add-member')} className="flex flex-col items-center text-gray-500 hover:text-green-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                <span className="text-[10px] font-medium hidden md:block">Add Team</span>
              </button>
            )}
            <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
              <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[8px]">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
              </div>
              <span className="text-[10px] font-medium hidden md:block">Me</span>
            </button>
            <Link href="/pricing" className="flex flex-col items-center text-blue-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-[10px] font-medium hidden md:block">Pricing</span>
            </Link>
            <button onClick={() => { clearAuthData(); router.push('/signin'); }} className="text-gray-500 hover:text-red-600 transition-colors font-medium text-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Choose Your Plan
            </h1>
            <p className="text-gray-500 text-center mt-2">
              Select the membership that fits your business needs
            </p>
          </div>

          {!membershipLoading && membershipStatus && (
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6 mb-8 border">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Your membership</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Tier:</span> {membershipStatus.tier}</p>
                <p><span className="font-medium">Active:</span> {membershipStatus.is_active ? 'Yes' : 'No'}</p>
                {membershipStatus.expiry && <p><span className="font-medium">Expiry:</span> {membershipStatus.expiry}</p>}
              </div>
              {membershipStatus.message && <p className="text-gray-500 text-sm mt-3">{membershipStatus.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* CARD 1 — ENTRY (Free) */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">ENTRY</h2>
            <p className="text-3xl font-bold text-gray-800 mb-4">FREE</p>
            <p className="text-sm text-gray-600 mb-4">
              Team limit: <span className="font-medium">1 Member</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Basic Profile</li>
            </ul>
            <button
              type="button"
              disabled
              className="mt-6 w-full bg-gray-200 text-gray-600 py-2 rounded-lg cursor-not-allowed font-medium"
            >
              Current Plan
            </button>
          </div>

          {/* CARD 2 — VERIFIED */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">VERIFIED</h2>
            {verifiedPlan?.plan_name && (
              <p className="text-sm text-gray-500 mb-2">{verifiedPlan.plan_name}</p>
            )}
            <div>
              <label htmlFor="verified-duration" className="sr-only">Duration</label>
              <select
                id="verified-duration"
                value={verifiedDuration}
                onChange={(e) => setVerifiedDuration(e.target.value)}
                className="mt-3 border rounded-md px-3 py-2 text-sm w-full text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="months_3">3 Months</option>
                <option value="months_12">Annual</option>
              </select>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 mb-4 mt-2">Loading...</p>
            ) : (
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">₹{verifiedPlan?.current_price ?? 2999}</p>
                <p className="line-through text-gray-400 text-sm">Market price: ₹{verifiedPlan?.market_price ?? 3999}</p>
                <span className="inline-block text-green-600 text-sm font-medium mt-1">{verifiedPlan?.discount_label ?? "25% OFF"}</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4 mt-2">
              Team limit: <span className="font-medium">{verifiedPlan?.team_member_limit ?? 3} Members</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {(verifiedPlan?.features ?? ["Verified Badge", "3 Team Members"]).map((f: any, i: number) => (
                <li key={i}>• {typeof f === "string" ? f : f?.name ?? f?.label ?? ""}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleBuy("VERIFIED", verifiedDuration)}
              disabled={!profile || loadingProfile}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>

          {/* CARD 3 — PREMIUM */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">PREMIUM</h2>
            {premiumPlan?.plan_name && (
              <p className="text-sm text-gray-500 mb-2">{premiumPlan.plan_name}</p>
            )}
            <div>
              <label htmlFor="premium-duration" className="sr-only">Duration</label>
              <select
                id="premium-duration"
                value={premiumDuration}
                onChange={(e) => setPremiumDuration(e.target.value)}
                className="mt-3 border rounded-md px-3 py-2 text-sm w-full text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="months_3">3 Months</option>
                <option value="months_12">Annual</option>
              </select>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 mb-4 mt-2">Loading...</p>
            ) : (
              <div className="mt-2">
                <p className="text-3xl font-bold text-gray-900">₹{premiumPlan?.current_price ?? 14999}</p>
                <p className="line-through text-gray-400 text-sm">Market price: ₹{premiumPlan?.market_price ?? 19999}</p>
                <span className="inline-block text-green-600 text-sm font-medium mt-1">{premiumPlan?.discount_label ?? "25% OFF"}</span>
              </div>
            )}
            <p className="text-sm text-gray-600 mb-4 mt-2">
              Team limit: <span className="font-medium">{premiumPlan?.team_member_limit ?? 10} Members</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {(premiumPlan?.features ?? ["Priority Support", "10 Team Members", "Analytics"]).map((f: any, i: number) => (
                <li key={i}>• {typeof f === "string" ? f : f?.name ?? f?.label ?? ""}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => handleBuy("PREMIUM", premiumDuration)}
              disabled={!profile || loadingProfile}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
          </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
