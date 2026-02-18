'use client';

import { useState, useEffect } from 'react';
import { getActiveMembershipPlans } from '@/modules/membership/services/membership.service';

export default function PricingPage() {
  const [verifiedDuration, setVerifiedDuration] = useState('months_3');
  const [premiumDuration, setPremiumDuration] = useState('months_3');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Choose Your Plan
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* CARD 1 — ENTRY (Free) */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">ENTRY</h2>
            <p className="text-2xl font-bold text-gray-900 mb-4">FREE</p>
            <p className="text-sm text-gray-600 mb-4">
              Team limit: <span className="font-medium">1 Member</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              <li>• Basic Profile</li>
            </ul>
            <button
              type="button"
              disabled
              className="mt-auto w-full py-2.5 px-4 bg-gray-200 text-gray-500 rounded-md font-medium cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* CARD 2 — VERIFIED */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">VERIFIED</h2>
            {verifiedPlan?.plan_name && (
              <p className="text-sm text-gray-500 mb-3">{verifiedPlan.plan_name}</p>
            )}
            <div className="mb-3">
              <label htmlFor="verified-duration" className="sr-only">Duration</label>
              <select
                id="verified-duration"
                value={verifiedDuration}
                onChange={(e) => setVerifiedDuration(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              >
                <option value="months_3">3 Months</option>
                <option value="months_12">Annual</option>
              </select>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 mb-4">Loading...</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">₹{verifiedPlan?.current_price ?? 2999}</p>
                <p className="text-sm text-gray-500 line-through">Market price: ₹{verifiedPlan?.market_price ?? 3999}</p>
                <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1 mb-4">{verifiedPlan?.discount_label ?? "25% OFF"}</span>
              </>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Team limit: <span className="font-medium">{verifiedPlan?.team_member_limit ?? 3} Members</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {(verifiedPlan?.features ?? ["Verified Badge", "3 Team Members"]).map((f: any, i: number) => (
                <li key={i}>• {typeof f === "string" ? f : f?.name ?? f?.label ?? ""}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-auto w-full py-2.5 px-4 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* CARD 3 — PREMIUM */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">PREMIUM</h2>
            {premiumPlan?.plan_name && (
              <p className="text-sm text-gray-500 mb-3">{premiumPlan.plan_name}</p>
            )}
            <div className="mb-3">
              <label htmlFor="premium-duration" className="sr-only">Duration</label>
              <select
                id="premium-duration"
                value={premiumDuration}
                onChange={(e) => setPremiumDuration(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-800"
              >
                <option value="months_3">3 Months</option>
                <option value="months_12">Annual</option>
              </select>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400 mb-4">Loading...</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900">₹{premiumPlan?.current_price ?? 14999}</p>
                <p className="text-sm text-gray-500 line-through">Market price: ₹{premiumPlan?.market_price ?? 19999}</p>
                <span className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded mt-1 mb-4">{premiumPlan?.discount_label ?? "25% OFF"}</span>
              </>
            )}
            <p className="text-sm text-gray-600 mb-4">
              Team limit: <span className="font-medium">{premiumPlan?.team_member_limit ?? 10} Members</span>
            </p>
            <ul className="text-sm text-gray-600 mb-6 space-y-2">
              {(premiumPlan?.features ?? ["Priority Support", "10 Team Members", "Analytics"]).map((f: any, i: number) => (
                <li key={i}>• {typeof f === "string" ? f : f?.name ?? f?.label ?? ""}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-auto w-full py-2.5 px-4 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
