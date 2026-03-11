"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute, { useAuth } from "@/components/ProtectedRoute";
import { getMyContexts } from "@/lib/profile";

/**
 * /profile — Redirects the logged-in user to their own profile page.
 * Uses GET /api/user-profiles/me (same as "My profile" click) to get documentId.
 */
function ProfileRedirect() {
  const router = useRouter();
  const user = useAuth();
  const [status, setStatus] = useState<"loading" | "redirect" | "no-profile">("loading");

  useEffect(() => {
    if (!user?.id) return;

    const resolveAndRedirect = async () => {
      const { exists, ownProfile } = await getMyContexts();

      if (exists && ownProfile?.documentId) {
        setStatus("redirect");
        router.replace(`/profile/${ownProfile.documentId}`);
      } else {
        setStatus("no-profile");
        router.replace("/complete-profile");
      }
    };

    resolveAndRedirect();
  }, [user?.id, router]);

  if (status !== "loading") return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f2ef]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#6b2c91]" />
        <p className="mt-4 text-sm font-medium text-slate-500">Taking you to your profile...</p>
      </div>
    </ProtectedRoute>
  );
}

export default ProfileRedirect;
