'use client';

import { useState, useEffect } from 'react';
import { useMembership } from '@/context/MembershipContext';
import { handlePayment } from '@/lib/razorpay';
import PaymentStatusModal from '@/components/PaymentStatusModal';
import { getUser } from '@/lib/auth';
import { getMyProfile } from '@/lib/profile';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const { 
    status: membershipStatus, 
    plans, 
    subscriptions, 
    transactions,
    activeProfile,
    loading: membershipLoading,
    refresh
  } = useMembership();

  const [selectedDurations, setSelectedDurations] = useState<{[key: string]: string}>({});
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState("");
  const router = useRouter();
  const user = getUser();

  // Initialize selected durations if plans are available
  useEffect(() => {
    if (plans.length > 0 && Object.keys(selectedDurations).length === 0) {
      const initialDurations: {[key: string]: string} = {};
      plans.forEach(plan => {
        if (!initialDurations[plan.tier_id]) {
          initialDurations[plan.tier_id] = plan.duration_code;
        }
      });
      setSelectedDurations(initialDurations);
    }
  }, [plans]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getPlansByTier = (tier: string) => {
    return plans.filter(p => p.tier_id === tier);
  };

  const getSelectedPlan = (tier: string) => {
    const duration = selectedDurations[tier];
    return plans.find(p => p.tier_id === tier && p.duration_code === duration);
  };

  const uniqueTiers = Array.from(new Set(plans.map(p => p.tier_id)));

  async function handleBuy(tier: string) {
    const user = getUser();
    if (!user) {
      alert("Please sign in to continue.");
      return;
    }

    try {
      setPaying(true);
      const plan = getSelectedPlan(tier);
      
      if (!plan) {
        alert("Plan not found.");
        return;
      }

      // Step 0.5: Get User Profile Document ID (MANDATORY for Handshake)
      // We prioritize the activeProfile from context, but fetch it fresh if missing
      let profileData = activeProfile;
      if (!profileData) {
        const { exists, profile: fetchedProfile } = await getMyProfile(user.id);
        if (exists && fetchedProfile) {
          profileData = fetchedProfile;
        }
      }

      if (!profileData || !profileData.documentId) {
        alert("Please complete your business profile before purchasing a subscription.");
        router.push("/complete-profile");
        return;
      }

      const userInfo = {
        id: user.id,
        name: profileData.full_name || profileData.company_name || user.username,
        email: user.email,
        mobile: profileData.whatsapp || "",
        profileId: profileData.documentId,
      };

      const result = await handlePayment(
        {
          documentId: plan.documentId,
          current_price: plan.current_price,
          plan_name: plan.plan_name,
          tier_id: plan.tier_id,
          duration_code: plan.duration_code
        }, 
        userInfo,
        () => setPaymentStatus("verifying")
      );

      if (result.success) {
        setPaymentStatus("success");
      } else {
        setPaymentStatus("error");
        setPaymentError("Payment verification failed. Please contact support if amount was deducted.");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("cancelled")) {
        console.log("Payment cancelled by user");
      } else {
        console.error("Payment failed:", err);
        setPaymentStatus("error");
        setPaymentError(err.message || "Failed to initialize payment.");
      }
    } finally {
      setPaying(false);
    }
  }

  if (membershipLoading && uniqueTiers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] animate-pulse text-center">Synchronizing Membership Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">
          Membership Plans
        </h1>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
          Choose the right plan to grow your business network and unlock global trade opportunities.
        </p>

        {membershipStatus && (
          <div className="max-w-4xl mx-auto mb-16 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-15"></div>
            <div className="relative bg-white rounded-3xl border border-blue-50 p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-6 z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                  membershipStatus.is_active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-1">Authentication Context</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{membershipStatus.tier}</span>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 ${
                      membershipStatus.is_active 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${membershipStatus.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                      {membershipStatus.is_active ? 'Active Status' : 'Inactive'}
                    </div>
                  </div>
                  {membershipStatus.expiry && (
                    <div className="flex items-center gap-2 mt-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-bold">Renewal Date: {formatDate(membershipStatus.expiry)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end gap-2 z-10">
                {membershipStatus.message && (
                  <div className="text-center md:text-right px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-600 font-bold italic">"{membershipStatus.message}"</p>
                  </div>
                )}
                {!membershipStatus.is_active && membershipStatus.tier !== 'FREE' && (
                  <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest mt-1">Action Required: Signature Verification Pending</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {uniqueTiers.map((tier) => {
            const tierPlans = getPlansByTier(tier);
            const activePlan = getSelectedPlan(tier) || tierPlans[0];
            const isPremium = tier.toUpperCase() === 'PREMIUM';
            const isVerified = tier.toUpperCase() === 'VERIFIED';
            const isEntry = tier.toUpperCase() === 'ENTRY' || (activePlan && activePlan.current_price === 0);

            if (!activePlan) return null;

            return (
              <div 
                key={tier}
                className={`
                  rounded-2xl shadow-sm p-8 flex flex-col transition-all relative
                  ${isPremium ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white border border-gray-200'}
                  ${isVerified ? 'shadow-xl border-2 border-blue-600 scale-105 z-10' : 'hover:shadow-md'}
                `}
              >
                {isVerified && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Popular
                  </div>
                )}
                
                <h2 className={`text-xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-gray-800'}`}>
                  {tier}
                </h2>
                <p className={`text-xs mb-6 uppercase tracking-wider ${isPremium ? 'text-slate-400' : 'text-gray-500'}`}>
                  {activePlan.plan_name}
                </p>

                <div className="mb-6">
                  {isEntry ? (
                    <span className="text-4xl font-extrabold text-gray-900 uppercase">Free</span>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold ${isPremium ? 'text-white' : 'text-gray-900'}`}>
                          ₹{activePlan.current_price}
                        </span>
                        {activePlan.market_price > activePlan.current_price && (
                          <span className={`text-sm line-through ${isPremium ? 'text-slate-500' : 'text-gray-500'}`}>
                            ₹{activePlan.market_price}
                          </span>
                        )}
                      </div>
                      {activePlan.discount_label && (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${isPremium ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50'}`}>
                          {activePlan.discount_label}
                        </span>
                      )}
                      <p className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${isPremium ? 'text-slate-500' : 'text-gray-400'}`}>
                        / {activePlan.duration_code === 'months_3' ? 'Quarterly' : activePlan.duration_code === 'months_12' ? 'Yearly' : activePlan.duration_code}
                      </p>
                    </>
                  )}
                </div>

                <div className={`mb-6 pt-6 border-t ${isPremium ? 'border-slate-800' : 'border-gray-50'}`}>
                  <p className={`text-sm font-bold mb-3 ${isPremium ? 'text-slate-200' : 'text-gray-900'}`}>
                    {isEntry ? "What's included:" : tier + " benefits:"}
                  </p>
                  <ul className={`text-sm space-y-3 ${isPremium ? 'text-slate-400' : 'text-gray-600'}`}>
                    {activePlan.features?.map((f: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${isPremium ? 'text-blue-400' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {typeof f === "string" ? f : f?.name ?? f?.label ?? ""}
                      </li>
                    ))}
                    {activePlan.team_member_limit && (
                      <li className="flex items-center gap-2">
                        <svg className={`w-4 h-4 ${isPremium ? 'text-blue-400' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        {activePlan.team_member_limit} Team Members
                      </li>
                    )}
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={paying || isEntry}
                  onClick={() => handleBuy(tier)}
                  className={`
                    mt-auto w-full py-3 rounded-xl font-bold transition-all disabled:bg-gray-400 uppercase text-xs tracking-widest
                    ${isEntry ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                    ${isPremium && !isEntry ? 'bg-white text-slate-900 hover:bg-slate-100' : ''}
                    ${!isPremium && !isEntry ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200' : ''}
                  `}
                >
                  {isEntry ? "Current Plan" : (paying ? "Processing..." : "Buy Now")}
                </button>
              </div>
            );
          })}
        </div>

        {/* Transaction History & Subscriptions */}
        {user && (
          <div className="mt-24 grid gap-10 md:grid-cols-2">
            {/* History Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Billing Audit Log</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-slate-100">Live Feed</span>
              </div>
              <div className="p-0">
                {transactions.length > 0 ? (
                  <ul className="divide-y divide-slate-50">
                    {transactions.map((t) => (
                      <li key={t.id} className="px-8 py-5 hover:bg-blue-50/30 transition-all cursor-default">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                {t.membership_plan?.plan_name || t.plan_id || 'Premium Subscription'}
                              </p>
                              <span className="text-[10px] font-bold text-slate-400">({t.currency || 'INR'})</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Date:</span>
                                <span className="text-[10px] font-bold text-slate-500">{formatDate(t.createdAt)}</span>
                              </div>
                              <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Order:</span>
                                <span className="text-[10px] font-mono text-slate-500">{t.order_id || t.razorpay_order_id || 'N/A'}</span>
                              </div>
                              {t.payment_id && (
                                <>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full hidden sm:block"></span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Pay ID:</span>
                                    <span className="text-[10px] font-mono text-slate-500">{t.payment_id}</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {t.status === 'failed' && t.failure_reason && (
                              <p className="text-[9px] font-bold text-rose-500 mt-2 p-2 bg-rose-50 rounded-lg inline-flex items-center gap-2">
                                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Reason: {t.failure_reason}
                              </p>
                            )}
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">₹{t.amount}</p>
                            <span className={`mt-2 inline-flex text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border ${
                              t.status === 'captured' 
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                : t.status === 'failed'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No transaction records found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Subscriptions Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">Active Credentials</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest tracking-tighter">Valid</span>
                </div>
              </div>
              <div className="p-0">
                {subscriptions.length > 0 ? (
                  <ul className="divide-y divide-slate-50">
                    {subscriptions.map((s) => (
                      <li key={s.id} className="px-8 py-6 hover:bg-blue-50/30 transition-all">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-black text-slate-900 tracking-tight uppercase leading-none">{s.tier}</p>
                              {s.is_active && (
                                <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Active</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-[10px] font-bold uppercase tracking-wider">Valid Until: {formatDate(s.end_date)}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                            <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-16 text-center">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No active credentials</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <PaymentStatusModal 
        status={paymentStatus}
        errorMsg={paymentError}
        onClose={() => {
          if (paymentStatus === "success") {
            router.push("/payment/success");
          }
          setPaymentStatus("idle");
        }}
      />
    </div>
  );
}
