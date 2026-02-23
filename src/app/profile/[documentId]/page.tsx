"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute, { useAuth } from "@/components/ProtectedRoute";
import { getProfileByDocumentId, type UserProfile } from "@/lib/profile";
import EnquiryModal from "@/components/EnquiryModal";
import ContactInfoModal from "@/components/ContactInfoModal";
import { getOrCreateConversation } from "@/lib/messages";
import { getUserPosts, type Post } from "@/lib/posts";
import FollowButton from "@/components/FollowButton";
import { useMembership } from "@/context/MembershipContext";
import ConnectionsModal from "@/components/ConnectionsModal";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuth();
  const documentId = params.documentId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Enquiry Modal States
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Preview Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Posts states
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Networking States
  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [connectionsInitialTab, setConnectionsInitialTab] = useState<"followers" | "following">("followers");
  const [networkingCounts, setNetworkingCounts] = useState({ followers: 0, following: 0 });

  const fetchNetworkingCounts = async (id: string) => {
    try {
      const { getNetworkingCounts } = await import("@/modules/networking/services/networking.service");
      const counts = await getNetworkingCounts(id);
      setNetworkingCounts(counts);
    } catch (error) {
      console.error("Failed to fetch counts:", error);
    }
  };

  useEffect(() => {
    const handleUpdate = (e: any) => {
       fetchNetworkingCounts(documentId);
    };

    window.addEventListener("networking:updated", handleUpdate);
    return () => window.removeEventListener("networking:updated", handleUpdate);
  }, [documentId]);

  const richTextToString = (blocks: any[] | null | undefined) => {
    if (!Array.isArray(blocks)) return "";

    return blocks
      .map((block) => block.children?.map((child: any) => child.text).join(""))
      .join("\n");
  };

  const fetchUserPosts = async (userId: number) => {
    setLoadingPosts(true);
    try {
      const posts = await getUserPosts(userId);
      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (documentId) {
        try {
          // Parallel fetch for profile and live counts
          const [data] = await Promise.all([
             getProfileByDocumentId(documentId),
             fetchNetworkingCounts(documentId)
          ]);
          
          if (data) {
            setProfile(data);
            if (data.userId) {
              fetchUserPosts(data.userId);
            }
          }
        } catch (error) {
          console.error("Error fetching public profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [documentId]);

  const handleMessageClick = async () => {
    if (!user?.id || !profile?.userId) return;
    try {
      await getOrCreateConversation(user.id, profile.userId);
      router.push("/messages");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      router.push("/messages");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Profile Not Found
          </h1>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef] pb-12">

        <div className="max-w-5xl mx-auto mt-6 px-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
            {/* Header Image */}
            <div
              onClick={() =>
                profile?.headerImageUrl &&
                setPreviewImage(profile.headerImageUrl)
              }
              className={`h-48 w-full relative overflow-hidden ${profile?.headerImageUrl ? "cursor-pointer" : ""}`}
            >
               {profile?.headerImageUrl ? (
                <img
                  src={profile.headerImageUrl}
                  alt={`${profile.company_name} header`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600" />
              )}
            </div>

            <div className="px-6 pb-6">
              <div className="relative -mt-24 mb-4 max-w-fit">
                <div
                    onClick={() =>
                      profile?.profileImageUrl && setPreviewImage(profile.profileImageUrl)
                    }
                    className={`w-40 h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden relative ${profile?.profileImageUrl ? "cursor-pointer" : ""}`}
                  >
                  <div className="w-full h-full rounded-full overflow-hidden bg-blue-50 flex items-center justify-center">
                    {profile?.profileImageUrl ? (
                      <img
                        src={profile.profileImageUrl}
                        alt={profile.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-blue-500 font-bold text-4xl">
                        {profile?.company_name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:justify-between md:items-start transition-all duration-300">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profile?.company_name?.toUpperCase()}
                    </h1>
                     <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase">
                       {(profile as any)?.profile_type || profile?.user_type}
                     </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 ml-2 uppercase">
                      ID: {profile?.userId}
                    </span>
                  </div>
                  {profile && (profile as any).brand_tagline && (
                    <p className="text-gray-500 italic text-sm mt-0.5">"{ (profile as any).brand_tagline }"</p>
                  )}
                  <p className="text-lg text-gray-600 mt-1 font-medium">
                    {/* Display primary business type */}
                    {profile?.business_type}
                    
                    {/* Display detailed categories if available */}
                    {profile?.category_items && profile.category_items.length > 0 && (
                      <span className="text-gray-400 text-sm ml-2 font-normal">
                        • {profile.category_items.map((cat, idx) => (
                            <span key={idx}>
                              {cat.category}
                              {cat.sub_categories && cat.sub_categories.length > 0 && ` (${cat.sub_categories.join(', ')})`}
                              {idx < (profile.category_items?.length || 0) - 1 ? ", " : ""}
                            </span>
                          ))}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {profile?.city}, {profile?.country} •{" "}
                    <span 
                      onClick={() => setIsContactModalOpen(true)}
                      className="text-blue-600 font-semibold hover:underline cursor-pointer"
                    >
                      Contact info
                    </span>
                  </p>

                  {/* Networking Counters */}
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
                    <div 
                      onClick={() => { setConnectionsInitialTab("followers"); setIsConnectionsModalOpen(true); }}
                      className="group cursor-pointer"
                    >
                      <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                        {networkingCounts.followers}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Followers</p>
                    </div>
                    <div 
                      onClick={() => { setConnectionsInitialTab("following"); setIsConnectionsModalOpen(true); }}
                      className="group cursor-pointer"
                    >
                      <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-none">
                        {networkingCounts.following}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Following</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 flex flex-wrap gap-3">
                  <FollowButton targetProfileId={documentId} />
                  <button
                    onClick={() => setIsInquiryModalOpen(true)}
                    className="px-6 py-2 border-2 border-slate-100 text-slate-700 font-bold rounded-full hover:bg-slate-50 transition-all flex items-center gap-2 bg-white"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Enquiry
                  </button>
                  <button
                    onClick={handleMessageClick}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {profile.about?.length
                    ? richTextToString(profile.about)
                    : `${profile.company_name} is a leading ${
                        profile.category_items?.[0]?.category || "business"
                      } based in ${
                        profile.city
                      }. Connect with us for premium B2B services.`}
                </p>
              </div>

               {/* Media Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Media Gallery
                  </h2>
                </div>

                {!profile?.image_sections || profile.image_sections.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No media sections added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-12">
                    {profile.image_sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => (
                        <div key={section.id}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {section.Title}
                          </h3>

                          {section.description && (
                            <p className="text-sm text-gray-500 mb-4">
                              {section.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {section.imageUrls.map((url, index) => {
                                const isVideo = section.media_type === 'video';
                                let videoContent = null;

                                if (isVideo) {
                                    // Check if YouTube
                                    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/"\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                                    if (ytMatch) {
                                        const videoId = ytMatch[1];
                                        videoContent = (
                                            <iframe 
                                                src={`https://www.youtube.com/embed/${videoId}`} 
                                                className="w-full h-full object-cover"
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                            />
                                        );
                                    } else {
                                        // Assume direct video or other
                                        videoContent = (
                                            <video controls className="w-full h-full object-cover bg-black">
                                                <source src={url} />
                                                Your browser does not support the video tag.
                                            </video>
                                        );
                                    }
                                }

                                return (
                                  <div
                                    key={index}
                                    className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 bg-gray-50 shadow-sm group"
                                  >
                                    {isVideo ? (
                                        videoContent
                                    ) : (
                                        <div 
                                            className="w-full h-full relative cursor-pointer"
                                            onClick={() => setPreviewImage(url)}
                                        >
                                            <img
                                              src={url}
                                              alt={`${section.Title}-${index}`}
                                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                                              <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                              </svg>
                                            </div>
                                        </div>
                                    )}
                                  </div>
                                );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Tradewall Posts Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Tradewall Posts
                  </h2>
                  <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {userPosts.length}
                  </span>
                </div>

                {loadingPosts ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-gray-50 rounded-xl animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : userPosts.length > 0 ? (
                  <div className="space-y-4">
                    {userPosts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {post.title}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              post.intentType === "demand"
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {post.intentType}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2 truncate">
                          {post.destinationCity} •{" "}
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {post.content && Array.isArray(post.content)
                            ? post.content
                                .map((block: any) =>
                                  block.children
                                    ?.map((child: any) => child.text)
                                    .join(" ")
                                )
                                .join(" ")
                            : typeof post.content === "string"
                            ? post.content
                            : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">
                      {profile.company_name} hasn't posted anything on the
                      Tradewall yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      ></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                        Website
                      </p>
                      {profile?.website ? (
                        <a
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank"
                          className="text-blue-600 font-semibold text-sm hover:underline"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm italic">
                          Not provided
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1.061a2.961 2.961 0 01-2.911-2.511 11.059 11.059 0 01-7.472-7.472A2.961 2.961 0 013 15.111V5z"
                      ></path>
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">
                        WhatsApp
                      </p>
                      <p className="text-gray-800 font-semibold text-sm">
                        {profile?.whatsapp || "Not provided"}
                      </p>
                    </div>
                  </div>
                   <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">Social Links</p>
                      <div className="flex gap-2 mt-1">
                        {(profile as any).social_links?.linkedin ? <a href={(profile as any).social_links.linkedin} target="_blank" className="text-blue-600 hover:scale-110 transition">LI</a> : <span className="text-gray-400 text-xs">-</span>}
                        {(profile as any).social_links?.twitter ? <a href={(profile as any).social_links.twitter} target="_blank" className="text-blue-400 hover:scale-110 transition">TW</a> : <span className="text-gray-400 text-xs">-</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

               {/* Market Reach */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Market Reach
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Years of Experience</p>
                    <p className="text-gray-900 font-semibold">{profile?.experience_years || 0} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Market Focus</p>
                    <p className="text-gray-900 font-semibold">{profile?.market_focus || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Operating Footprint */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Operating Footprint
                  </h2>
                </div>
                <div className="space-y-3">
                   { (profile as any)?.operating_locations && (profile as any).operating_locations.length > 0 ? (
                     (profile as any).operating_locations.map((loc: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                          {loc.city}, {loc.country}
                        </div>
                     ))
                   ) : (
                     <p className="text-sm text-gray-400 italic">No operating locations added.</p>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reusable Inquiry Modal */}
        {isInquiryModalOpen && profile && (
          <EnquiryModal
            isOpen={isInquiryModalOpen}
            onClose={() => setIsInquiryModalOpen(false)}
            targetProfile={profile}
          />
        )}
        
        <ContactInfoModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            profile={profile}
        />

        <ConnectionsModal
            isOpen={isConnectionsModalOpen}
            onClose={() => setIsConnectionsModalOpen(false)}
            profileId={documentId}
            initialTab={connectionsInitialTab}
        />

        {previewImage && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="relative max-w-5xl w-full px-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={() => setPreviewImage(null)}
                  className="absolute -top-10 right-2 text-white text-3xl hover:scale-110 transition"
                >
                  ×
                </button>

                {/* Large Image */}
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black"
                />
              </div>
            </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
