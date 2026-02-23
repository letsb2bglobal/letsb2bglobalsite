"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/ProtectedRoute"; // Using the hook
import {
  getAllUserProfiles,
  checkUserProfile,
  searchUserProfiles,
  type UserProfile,
} from "@/lib/profile";
import { clearAuthData, isAuthenticated } from "@/lib/auth";
import Cookies from "js-cookie";
import EnquiryModal from "@/components/EnquiryModal";
import PostModal from "@/components/PostModal";
import { getOrCreateConversation } from "@/lib/messages";
import { getTradeWallFeed, searchTradeWall, logActivity, deletePost, type Post } from "@/lib/posts";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useTeam } from "@/context/TeamContext";
import { Search, MapPin } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const user = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [allProfilesList, setAllProfilesList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { activeWorkspace, permissions } = useTeam();
  const [allLoading, setAllLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Enquiry Modal States
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(
    null
  );

  // Tabs and Posts States
  const [activeTab, setActiveTab] = useState<"profiles" | "tradewall">(
    "profiles"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // Search States
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

useEffect(() => {
  if (!mounted) return;

  // Auth check (client-only, safe)
  if (!isAuthenticated()) {
    router.push("/signin");
    return;
  }

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      const userProfile = await checkUserProfile(user.id);
      setProfile(userProfile);
      setLoading(false);

      const response = await getAllUserProfiles();
      if (response?.data) {
        setAllProfilesList(response.data);
        setAllProfiles(response.data.filter(p => p.userId !== user.id));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setAllLoading(false);
    }
  };

  fetchData();
}, [mounted, user, router]);


  const fetchPosts = async () => {
    if (searchText || locationText) return; 
    setPostsLoading(true);
    try {
      const response = await getTradeWallFeed();
      if (response && response.data) {
        setPosts(response.data);
        
        // Log view for initial items
        if (user?.id) {
          response.data.forEach(item => {
            logActivity({
              user: user.id,
              action_type: "view",
              item_id: item.documentId,
              item_type: item._type || "post"
            });
          });
        }
      }
    } catch (error) {
      console.error("Error fetching TradeWall:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "tradewall" && !searchText && !locationText) {
      fetchPosts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleDeletePost = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setDeletingPostId(documentId);
    try {
      await deletePost(documentId);
      setPosts((prev) => prev.filter((p) => p.documentId !== documentId));
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err?.message || 'Failed to delete post.');
    } finally {
      setDeletingPostId(null);
    }
  };

  // Handle Debounced Search
  useEffect(() => {
    if (!mounted) return;

    const handler = setTimeout(async () => {
      if (!searchText && !locationText) {
        // If empty, reload initial data if needed or just return if already showing all
        if (activeTab === "profiles") {
          setAllLoading(true);
          const response = await getAllUserProfiles();
          if (response?.data) {
            setAllProfiles(response.data.filter(p => p.userId !== user?.id));
          }
          setAllLoading(false);
        } else {
          fetchPosts();
        }
        return;
      }

      setIsSearching(true);
      try {
        if (activeTab === "profiles") {
          setAllLoading(true);
          const response = await searchUserProfiles(searchText, locationText);
          if (response?.data) {
            setAllProfiles(response.data.filter(p => p.userId !== user?.id));
          }
        } else {
          setPostsLoading(true);
          const response = await searchTradeWall({
            q: searchText,
            city: locationText,
            category: profile?.category_items?.[0]?.category // Simplified category search
          });
          if (response?.data) {
            setPosts(response.data);
          }
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
        setAllLoading(false);
        setPostsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(handler);
  }, [searchText, locationText, activeTab, mounted]);

  const handleLogout = () => {
    clearAuthData();
    router.push("/signin");
  };

  const handleConversationClick = async (targetUserId: number) => {
    if (!user?.id) return;
    try {
      // Check if exists or create new
      await getOrCreateConversation(user.id, targetUserId);
      router.push("/messages");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      // Even if it fails (e.g. unique constraint if already exists), we navigateto messages
      router.push("/messages");
    }
  };

  const handleOpenInquiry = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setIsInquiryModalOpen(true);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getProfileDocId = (userId: number) => {
    // Also check current user's profile which might be in profile state or allProfilesList
    const found = allProfilesList.find((p) => p.userId === userId);
    return found?.documentId;
  };

  // if (loading && !profile && isAuthenticated()) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  // Block rendering until hydration completes
  if (!mounted) return null;

  // Loading state (NO auth checks here)
  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, we'll just return null as the useEffect handles redirect
  // if (!isAuthenticated()) return null;

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      {/* Search Bar section relocated to top of content or integrated into header */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 md:px-20">
        <div className="max-w-6xl mx-auto flex bg-gray-100 rounded-lg overflow-hidden w-full items-center gap-0 border border-transparent focus-within:border-blue-500 transition-all shadow-sm">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 border-r border-gray-200">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Business name or service..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="w-1/3 flex items-center gap-2 px-3 py-2 bg-gray-50/50">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Destination..."
              className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
            />
          </div>
          {isSearching && (
            <div className="pr-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-4 gap-6 pb-10">
        {/* Main Feed */}
        <div className="md:col-span-3 space-y-4">
          {/* Profile Completeness Banner */}
          {activeTab === "tradewall" && (!profile?.latitude || !profile?.longitude || !profile?.category_items?.length) && (
            <div className="bg-indigo-600 rounded-xl p-4 text-white flex justify-between items-center shadow-lg animate-in slide-in-from-top duration-500">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Improve your matches!</p>
                  <p className="text-xs text-indigo-100">Complete your profile location and category for intelligent ranking.</p>
                </div>
              </div>
              <button 
                onClick={() => router.push("/profile")}
                className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg text-xs font-black uppercase hover:bg-indigo-50 transition-colors"
              >
                Fix Now
              </button>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-200 mb-4 bg-white rounded-t-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("profiles")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === "profiles"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/30"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Partner Profiles
            </button>
            <button
              onClick={() => setActiveTab("tradewall")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                activeTab === "tradewall"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              Tradewall Feed
            </button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <div className="h-[1px] flex-1 bg-gray-300"></div>
            <span className="text-xs text-gray-500 font-bold px-2 uppercase tracking-widest">
              {activeTab === "profiles"
                ? "Recommended for you"
                : "Latest Opportunities"}
            </span>
            <div className="h-[1px] flex-1 bg-gray-300"></div>
          </div>

          {activeTab === "profiles" ? (
            allLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                  >
                    <div className="h-20 bg-gray-100 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : allProfiles.length > 0 ? (
              allProfiles.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="h-20 w-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="px-6 pb-6 relative">
                    <div className="absolute -top-10 left-6 w-20 h-20 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-blue-500 font-bold text-3xl overflow-hidden">
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                        {p.company_name.substring(0, 1).toUpperCase()}
                      </div>
                    </div>

                    <div className="pt-12">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              onClick={() =>
                                router.push(`/profile/${p.documentId}`)
                              }
                              className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {p.company_name.toUpperCase()}
                            </h3>
                            {p.user_type === "seller" ? (
                              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                Seller
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                Buyer
                              </span>
                            )}
                            {p.score && (
                              <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded border border-amber-100 flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {p.score} Match
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 font-medium text-sm">
                              {p.category_items?.[0]?.category || ""}
                          </p>
                          <p className="text-gray-500 text-xs mt-1 flex items-center gap-1 font-medium">
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            {p.city}, {p.country}
                          </p>
                        </div>
                        <button
                          onClick={() => handleOpenInquiry(p)}
                          className="px-6 py-1.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all text-sm shadow-sm hover:shadow-md"
                        >
                          Inquire
                        </button>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-50 flex gap-6">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            ></path>
                          </svg>
                          Recommend
                        </button>
                        <button
                          onClick={() => handleConversationClick(p.userId)}
                          className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            ></path>
                          </svg>
                          MESSAGE
                        </button>
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            ></path>
                          </svg>
                          SHARE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">
                  No profiles available
                </h3>
                <p className="text-gray-500">
                  Try searching for other categories or check back later.
                </p>
              </div>
            )
          ) : /* Tradewall Feed */
          postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
                  <div className="h-20 bg-gray-50 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden p-6 space-y-4"
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div
                    onClick={() => {
                      const docId = getProfileDocId(post.userId);
                      if (docId) router.push(`/profile/${docId}`);
                      else if (post.userId === user?.id) router.push("/profile");
                    }}
                    className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform shrink-0"
                  >
                    {(post.user_profile?.company_name || "?").substring(0, 1).toUpperCase()}
                  </div>

                  {/* Header info */}
                  <div className="flex-1 min-w-0">
                    <p
                      onClick={() => {
                        const docId = getProfileDocId(post.userId);
                        if (docId) router.push(`/profile/${docId}`);
                        else if (post.userId === user?.id) router.push("/profile");
                      }}
                      className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate text-sm"
                    >
                      {post.user_profile?.company_name || post.title || "B2B Partner"}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {(post.destination || post.destinationCity) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                          {post.destination || post.destinationCity}
                        </span>
                      )}
                      {(() => {
                        const cat = post.category;
                        const catStr = Array.isArray(cat)
                          ? cat.join(', ')
                          : typeof cat === 'string' ? cat : null;
                        return catStr ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {catStr}
                          </span>
                        ) : null;
                      })()}
                      <span className="text-[10px] text-gray-400 font-medium">{formatTime(post.createdAt)}</span>
                      {(post._score !== undefined && post._score >= 0.7) && (
                        <span className="bg-amber-50 text-amber-600 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-amber-100 flex items-center gap-1">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                          Best Match
                        </span>
                      )}
                      {post.status === "Closed" && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">Closed</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                  {post.description
                    || (Array.isArray(post.content)
                      ? post.content.map((b: any) => b.children?.map((c: any) => c.text).join(" ")).join(" ")
                      : typeof post.content === "string" ? post.content : "No description available.")}
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center gap-4">
                  <button
                    onClick={() => user?.id && logActivity({ user: user.id, action_type: 'click', item_id: post.documentId, item_type: post._type || 'post' })}
                    className="text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.757m-9.488 9.21a.75.75 0 01-1.114 0l-3.23-3.23a.75.75 0 010-1.114l3.23-3.23a.75.75 0 011.114 0l3.23 3.23a.75.75 0 010 1.114l-3.23 3.23z" />
                    </svg>
                    Connect
                  </button>
                  <button
                    onClick={() => user?.id && logActivity({ user: user.id, action_type: 'reply', item_id: post.documentId, item_type: post._type || 'post' })}
                    className="text-xs font-bold text-gray-500 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Reply
                  </button>
                  {/* Owner actions — only visible to the post creator */}
                  {post.userId === user?.id && (
                    <>
                      <div className="ml-auto flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingPost(post);
                            setIsPostModalOpen(true);
                          }}
                          className="text-xs font-bold text-amber-500 hover:text-amber-700 uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.documentId)}
                          disabled={deletingPostId === post.documentId}
                          className="text-xs font-bold text-red-400 hover:text-red-600 uppercase tracking-wider flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingPostId === post.documentId ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">
                No posts available
              </h3>
              <p className="text-gray-500">
                Be the first one to post a B2B opportunity!
              </p>
              <button
                onClick={() => setIsPostModalOpen(true)}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all text-sm"
              >
                Create Post
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - User Profile Card */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="h-16 w-full bg-blue-600"></div>
              <div className="px-5 pb-5">
                <div
                  className="relative -mt-10 mb-3 cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <div className="w-16 h-16 rounded-xl bg-white border-2 border-white shadow-md flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden hover:scale-105 transition-transform">
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                      {profile?.company_name?.substring(0, 1).toUpperCase() ||
                        user?.username?.substring(0, 1).toUpperCase()}
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h4
                    className="font-bold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                    onClick={() => router.push("/profile")}
                  >
                    {(activeWorkspace?.data.company_name || profile?.company_name || user?.username || "User").toUpperCase()}
                  </h4>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium">
                     {activeWorkspace?.data.category_items?.[0]?.category || profile?.category_items?.[0]?.category || "Professional at Let's B2B"}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  <div
                    className="flex justify-between items-center group cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                      Profile views
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">
                      128
                    </span>
                  </div>
                  <div
                    className="flex justify-between items-center group cursor-pointer"
                    onClick={() => router.push("/profile")}
                  >
                    <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600 transition-colors">
                      Post impressions
                    </span>
                    <span className="text-[11px] font-bold text-blue-600">
                      45
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-3 pt-3">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full py-1.5 flex items-center justify-center gap-1.5 text-gray-700 hover:bg-gray-50 rounded transition-all text-xs font-bold border border-gray-100"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1h-1V6a4 4 0 00-4-4zM8 6a2 2 0 114 0v1H8V6zm-1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    My Network
                  </button>
                </div>
              </div>
            </div>

            {/* Post Button below mini profile */}
            <button
              onClick={() => setIsPostModalOpen(true)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-12 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Create New Post
            </button>
          </div>

        </div>
      </div>

      {/* Reusable Enquiry Modal */}
      {isInquiryModalOpen && selectedProfile && (
        <EnquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => setIsInquiryModalOpen(false)}
          targetProfile={selectedProfile}
        />
      )}

      {/* Post Modal — Create or Edit */}
      {isPostModalOpen && (
        <PostModal
          isOpen={isPostModalOpen}
          onClose={() => {
            setIsPostModalOpen(false);
            setEditingPost(null);
          }}
          editPost={editingPost}
          onPostCreated={() => {
            // After create: switch to tradewall tab.
            // The tab-change useEffect will fire fetchPosts() once — no double call.
            if (activeTab === 'tradewall') {
              fetchPosts();
            } else {
              setActiveTab('tradewall');
            }
          }}
          onPostUpdated={() => {
            // After edit: refresh in-place (single fetch)
            fetchPosts();
          }}
        />
      )}
    </div>
  );
}
