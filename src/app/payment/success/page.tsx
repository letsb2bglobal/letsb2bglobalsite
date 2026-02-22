
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMembership } from "@/context/MembershipContext";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { refresh } = useMembership();

  useEffect(() => {
    // Refresh membership status after successful payment
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-8">
          Your subscription has been activated successfully. Thank you for choosing LetsB2B Global.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            Go to Home
          </button>
          <button
            onClick={() => router.push("/pricing")}
            className="w-full py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
