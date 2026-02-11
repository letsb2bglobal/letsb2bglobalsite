"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { acceptInvitation } from "@/lib/team";
import { isAuthenticated } from "@/lib/auth";
import { useToast } from "@/components/Toast";
import AuthLayout from "@/components/AuthLayout";

function JoinTeamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing invitation token.");
    }

    if (!isAuthenticated()) {
      showToast("Please sign in to accept the invitation", "info");
      router.push(`/signin?redirect=/join-team?token=${token}`);
    }
  }, [token, router]);

  const handleAccept = async () => {
    if (!token) return;
    setIsLoading(true);
    setError("");
    try {
      await acceptInvitation(token);
      showToast("Successfully joined the team!", "success");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation. The link might be expired.");
      showToast("Failed to join team", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">
        🤝
      </div>
      <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">You're Invited!</h1>
      <p className="text-gray-500 leading-relaxed mb-10 font-medium">
        You've been invited to join a company team on Let's B2B. By accepting, you'll gain access to their dashboard and collaborative tools.
      </p>

      <button
        onClick={handleAccept}
        disabled={isLoading || !token}
        className="w-full py-4.5 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 group"
      >
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <>
            ACCEPT & JOIN TEAM
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>

      <button
        onClick={() => router.push("/")}
        disabled={isLoading}
        className="w-full mt-4 py-3 text-gray-400 text-xs font-bold hover:text-gray-600 transition-all"
      >
        MAYBE LATER
      </button>
    </div>
  );
}

export default function JoinTeamPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div className="animate-pulse bg-white rounded-3xl h-64 w-full max-w-md"></div>}>
        <JoinTeamContent />
      </Suspense>
    </AuthLayout>
  );
}
