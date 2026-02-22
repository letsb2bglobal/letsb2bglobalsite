
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getActiveMembershipPlans } from "@/modules/membership/services/membership.service";
import { useMembership } from "@/context/MembershipContext";
import { handlePayment } from "@/lib/razorpay";
import { getUser } from "@/lib/auth";
import { getMyProfile } from "@/lib/profile";
import PaymentStatusModal from "@/components/PaymentStatusModal";

export default function SilverPlanPage() {
  const { 
    plans,
    loading: membershipLoading
  } = useMembership();

  const [plan, setPlan] = useState<any>(null);
  const [paying, setPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [paymentError, setPaymentError] = useState("");
  const user = getUser();
  const router = useRouter();

  useEffect(() => {
    if (plans.length > 0) {
      const silver = plans.find((p: any) => p.tier_id === "SILVER");
      setPlan(silver);
    }
  }, [plans]);

  const handleBuy = async () => {
    if (!user) {
      alert("Please sign in to buy a subscription.");
      return;
    }
    if (!plan) return;

    try {
      setPaying(true);
      const { profile } = await getMyProfile(user.id);
      
      const userInfo = {
        id: user.id,
        name: profile?.full_name || profile?.company_name || user.username,
        email: user.email,
        mobile: profile?.whatsapp || "",
        profileId: profile?.documentId || "",
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
        setPaymentError("Payment verification failed.");
      }
    } catch (err: any) {
      if (err.message && err.message.includes("cancelled")) {
        console.log("Cancelled");
      } else {
        console.error("Payment failed", err);
        setPaymentStatus("error");
        setPaymentError(err.message || "Failed to process payment.");
      }
    } finally {
      setPaying(false);
    }
  };

  if (membershipLoading) return <div className="min-h-screen flex items-center justify-center">Loading Silver Plan Details...</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-slate-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <button 
            onClick={() => router.push('/pricing')}
            className="mb-6 text-sm font-bold text-blue-600 hover:underline uppercase tracking-widest"
          >
            ← All Plans
          </button>
          <h1 className="text-5xl font-black text-slate-900 mb-6 uppercase">Silver Membership</h1>
          <p className="text-xl text-slate-600 leading-relaxed mb-10">
            Empower your growing business with enhanced visibility, more team slots, and priority networking tools.
          </p>
          
          <div className="flex flex-col items-center">
            <div className="text-4xl font-black text-slate-900 mb-2">₹{plan?.current_price ?? 7999}</div>
            <p className="text-slate-500 text-sm mb-8">per 3 months (quarterly)</p>
            <button
              onClick={handleBuy}
              disabled={paying}
              className="px-12 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-gray-400"
            >
              {paying ? "Processing..." : "Upgrade to Silver Now"}
            </button>
          </div>
        </div>
      </div>

      {/* Features Detail */}
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">5 Team Members</h3>
                <p className="text-slate-600 text-sm">Expand your reach by adding more colleagues to manage enquiries and lead generation.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Silver Verified Badge</h3>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Silver Verified Badge</h3>
                <p className="text-slate-600 text-sm">Instantly build trust with potential partners with the official Silver Verification status.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Priority in Search</h3>
                <p className="text-slate-600 text-sm">Your profile appears higher in search results, giving you 3x more exposures than free profiles.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Direct Enquiries</h3>
                <p className="text-slate-600 text-sm">Receive direct enquiries from potential buyers and sellers with no messaging limits.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison CTA */}
      <div className="bg-slate-900 py-20 px-4 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Need even more power?</h2>
          <p className="text-slate-400 mb-10">Check out our Verified and Premium plans for maximum visibility and exclusive tools.</p>
          <button 
            onClick={() => router.push('/pricing')}
            className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-all"
          >
            Compare All Plans
          </button>
        </div>
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
