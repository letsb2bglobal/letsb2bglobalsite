"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute";
import {
  checkUserProfile,
  type UserProfile,
} from "@/lib/profile";
import { isAuthenticated } from "@/lib/auth";
import { getTradeWallFeed, type Post } from "@/lib/posts";
import Header from "@/components/Header";
import SidebarLeft from "@/components/home/SidebarLeft";
import SidebarRight from "@/components/home/SidebarRight";
import Feed from "@/components/home/Feed";
import { useTeam } from "@/context/TeamContext";

export default function HomeRoute() {
  const router = useRouter();
  const user = useAuth();
  const { activeWorkspace } = useTeam();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated()) {
      router.push("/signin");
      return;
    }

    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const userProfile = await checkUserProfile(user.id);
        setProfile(userProfile);
        
        setPostsLoading(true);
        const response = await getTradeWallFeed();
        if (response && response.data) {
          setPosts(response.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setPostsLoading(false);
      }
    };

    fetchData();
  }, [mounted, user, router]);

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f2f8]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B3FA0]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f2f8]">
      
      <main className="max-w-[1350px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - 25% (lg:col-span-3) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <SidebarLeft profile={profile} />
          </div>

          {/* Feed - 50% (lg:col-span-6) */}
          <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">
            <Feed posts={posts} isLoading={postsLoading} />
          </div>

          {/* Right Sidebar - 25% (lg:col-span-3) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-[80px] self-start max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
            <SidebarRight />
          </div>
        </div>
      </main>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
