"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute, { useAuth } from "@/components/ProtectedRoute";
import {
  checkUserProfile,
  updateUserProfile,
  uploadProfileMedia,
  updateProfileImage,
  updateHeaderImage,
  deleteProfileImage,
  deleteHeaderImage,
  updateImageSections,
  type UserProfile,
} from "@/lib/profile";
import { fetchEnquiryThreads, type EnquiryThread } from "@/lib/enquiry";
import { authenticatedFetch } from "@/lib/auth";
import { getUserPosts, type Post } from "@/lib/posts";
import MediaModal from "@/components/MediaModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import ContactInfoModal from "@/components/ContactInfoModal";
import { ImageSection } from "@/lib/profile";
import TeamManagement from "@/components/TeamManagement";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useTeam } from "@/context/TeamContext";
import { useMembership } from "@/context/MembershipContext";
import ConnectionsModal from "@/components/ConnectionsModal";

// Interface is now using EnquiryThread from lib/enquiry

function ProfileContent() {
  const router = useRouter();
  const user = useAuth();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tabs
  const [activeProfileTab, setActiveProfileTab] = useState<"overview" | "team">("overview");
  const [autoOpenInvite, setAutoOpenInvite] = useState(false);
  const { permissions, activeWorkspace } = useTeam();
  const { status: membershipStatus, loading: membershipLoading } = useMembership();

  // Edit states

  const [showImageModal, setShowImageModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form states
  const [headerForm, setHeaderForm] = useState<{
    company_name: string;
    profile_type: "Individual" | "Company" | "Association";
    business_type: string;
    category_items: any[];
    country: string;
    state: string;
    city: string;
    address_text: string;
    google_map_link: string;
  }>({
    company_name: "",
    profile_type: "Individual",
    business_type: "",
    category_items: [],
    country: "",
    state: "",
    city: "",
    address_text: "",
    google_map_link: "",
  });

  const [aboutText, setAboutText] = useState("");
  const [contactForm, setContactForm] = useState({
    website: "",
    whatsapp: "",
    social_links: {} as any,
  });

  const [businessForm, setBusinessForm] = useState({
    brand_tagline: "",
    designation: "",
    legal_entity_name: "",
    experience_years: 0,
    market_focus: "",
  });

  // Enquiry states
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [enquiries, setEnquiries] = useState<EnquiryThread[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Posts states
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // New Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false);

  // New Profile Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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
    if (profile?.documentId) {
      fetchNetworkingCounts(profile.documentId);
    }
  }, [profile?.documentId]);

  useEffect(() => {
    const handleUpdate = () => {
       if (profile?.documentId) fetchNetworkingCounts(profile.documentId);
    };

    window.addEventListener("networking:updated", handleUpdate);
    return () => window.removeEventListener("networking:updated", handleUpdate);
  }, [profile?.documentId]);

  const [modalTitle, setModalTitle] = useState("");
  const [modalFields, setModalFields] = useState<any[]>([]);
  const [modalInitialData, setModalInitialData] = useState<any>({});
  const [onModalSave, setOnModalSave] = useState<(data: any) => Promise<void>>(() => async () => {});

  const richTextToString = (blocks: any[] | null | undefined) => {
    if (!Array.isArray(blocks)) return "";

    return blocks
      .map((block) => block.children?.map((child: any) => child.text).join(""))
      .join("\n");
  };

  const fetchEnquiries = async (silent = false) => {
    if (!user?.id) return;

    if (!silent) {
      setLoadingEnquiries(true);
      setShowEnquiries(true);
    }

    try {
      const threadList = await fetchEnquiryThreads();
      setEnquiries(threadList);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      if (!silent) setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchEnquiries(true);
    }
  }, [user?.id]);

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
      // Use activeWorkspace data if available, otherwise fallback to checkUserProfile
      let data = activeWorkspace?.data || null;
      
      if (!data && user?.id) {
        try {
          data = await checkUserProfile(user.id);
        } catch (error) {
          console.error("Error fetching profile fallback:", error);
        }
      }

      if (data) {
        setProfile(data);
        setHeaderForm({
          company_name: data.company_name,
          profile_type: (data as any).profile_type || "Individual",
          business_type: data.business_type || "",
          category_items: data.category_items || [],
          country: data.country,
          state: (data as any).state || "",
          city: data.city,
          address_text: (data as any).address_text || "",
          google_map_link: (data as any).google_map_link || "",
        });

        setAboutText(
          data.about?.length
            ? richTextToString(data.about)
            : `${data.company_name} is a leading ${data.category_items?.[0]?.category || "business"} based in ${data.city}.`
        );

        setContactForm({
          website: data.website || "",
          whatsapp: data.whatsapp || "",
          social_links: (data as any).social_links || {},
        });

        setBusinessForm({
          brand_tagline: (data as any).brand_tagline || "",
          designation: data.designation || "",
          legal_entity_name: data.legal_entity_name || "",
          experience_years: data.experience_years || 0,
          market_focus: data.market_focus || "",
        });
        
        // Use the userId from the actual profile data for posts
        fetchUserPosts(data.userId);
        setLoading(false);
      } else if (user?.id && !activeWorkspace) {
        // Only redirect if we definitely don't have a profile and workspace isn't loading
        router.push("/complete-profile");
      }
    };
    fetchProfile();
  }, [user, router, activeWorkspace]);
  
  useEffect(() => {
    if (searchParams.get("action") === "add-member") {
      setActiveProfileTab("team");
      setAutoOpenInvite(true);
    }
  }, [searchParams]);

  const handleUpdateProfile = async (updates: any) => {
    if (!profile?.documentId) return;
    setSaving(true);
    try {
      const updatedData = await updateUserProfile(profile.documentId, updates);
      setProfile(updatedData);
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Placeholder for header updates (now handled by modal)

  const saveContact = async () => {
    await handleUpdateProfile(contactForm);
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.documentId) return;

    setSaving(true);
    try {
      const uploadRes = await uploadProfileMedia([file]);
      const imageUrl = uploadRes[0].url;
      await updateProfileImage(profile.documentId, imageUrl);
      
      // Refresh profile data
      const updatedProfile = await checkUserProfile(user!.id);
      if (updatedProfile) setProfile(updatedProfile);
      
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("Failed to upload profile image");
    } finally {
      setSaving(false);
    }
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.documentId) return;

    setSaving(true);
    try {
      const uploadRes = await uploadProfileMedia([file]);
      const imageUrl = uploadRes[0].url;
      await updateHeaderImage(profile.documentId, imageUrl);
      
      // Refresh profile data
      const updatedProfile = await checkUserProfile(user!.id);
      if (updatedProfile) setProfile(updatedProfile);
      
    } catch (error) {
      console.error("Error uploading header image:", error);
      alert("Failed to upload header image");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageDelete = async () => {
    if (!profile?.documentId) return;
    if (!confirm("Are you sure you want to remove your profile picture?")) return;

    setSaving(true);
    try {
      await deleteProfileImage(profile.documentId);
      const updatedProfile = await checkUserProfile(user!.id);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (error) {
      console.error("Error deleting profile image:", error);
      alert("Failed to delete profile image");
    } finally {
      setSaving(false);
    }
  };

  const handleHeaderImageDelete = async () => {
    if (!profile?.documentId) return;
    if (!confirm("Are you sure you want to remove your cover photo?")) return;

    setSaving(true);
    try {
      await deleteHeaderImage(profile.documentId);
      const updatedProfile = await checkUserProfile(user!.id);
      if (updatedProfile) setProfile(updatedProfile);
    } catch (error) {
      console.error("Error deleting header image:", error);
      alert("Failed to delete header image");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl animate-pulse -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl animate-pulse translate-x-1/2 translate-y-1/2" />
        
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 relative">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-2xl" />
            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-2xl animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-black text-2xl italic">L</span>
            </div>
          </div>
          <p className="mt-6 text-xs font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            Polishing your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef] pb-24 font-inter relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,_rgba(59,130,246,0.03)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,_rgba(99,102,241,0.03)_0%,_transparent_50%)]" />
        </div>
        
        {/* Fancy Modals */}
        <MediaModal 
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          onSave={async (newSections) => {
            if (!profile?.documentId) return;
            setSaving(true);
            try {
              await updateImageSections(profile.documentId, newSections);
              const updatedProfile = await checkUserProfile(user!.id);
              if (updatedProfile) setProfile(updatedProfile);
              setShowMediaModal(false);
            } catch (error) {
              console.error("Error updating gallery:", error);
            } finally {
              setSaving(false);
            }
          }}
          currentSections={profile?.image_sections || []}
        />

        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={modalTitle}
          fields={modalFields}
          initialData={modalInitialData}
          onSave={onModalSave}
        />

        <div className="max-w-4xl mx-auto pt-12 px-4 space-y-8">
          {/* Main Identity Card */}
          <div className="premium-card relative group/identity">
            {/* Cover Image Area */}
            <div className="h-64 w-full relative group/cover">
              {profile?.headerImageUrl ? (
                <img
                  src={profile.headerImageUrl}
                  alt="header"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                </div>
              )}
              
              <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover/cover:opacity-100 transition-all duration-300 translate-y-2 group-hover/cover:translate-y-0">
                <label className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all cursor-pointer text-white border border-white/20 shadow-xl">
                  <input type="file" className="hidden" accept="image/*" onChange={handleHeaderImageUpload} />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </label>
                {profile?.headerImageUrl && (
                  <button onClick={handleHeaderImageDelete} className="p-3 bg-red-500/10 backdrop-blur-md rounded-2xl hover:bg-red-500 text-red-100 border border-red-500/20 transition-all shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Content - LinkedIn Style Layout */}
            <div className="px-10 pb-12 relative">
              <div className="flex flex-col items-start gap-6 -mt-16 md:-mt-20 px-4">
                {/* Profile Image - Overlapping Left */}
                <div className="relative group/avatar">
                  <div className="w-32 md:w-40 h-32 md:w-40 rounded-3xl bg-white p-1.5 shadow-2xl relative z-10 overflow-hidden ring-8 ring-white">
                    {profile?.profileImageUrl ? (
                      <img src={profile.profileImageUrl} alt="profile" className="w-full h-full object-cover rounded-2xl md:rounded-3xl" />
                    ) : (
                      <div className="w-full h-full rounded-2xl md:rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-4xl">
                        {profile?.company_name?.charAt(0) || "B"}
                      </div>
                    )}
                  </div>
                  
                  <label className="absolute bottom-2 right-2 z-20 p-2.5 bg-white text-slate-600 rounded-xl shadow-lg hover:bg-slate-50 transition-all cursor-pointer border border-slate-100 scale-90 md:scale-100">
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </label>
                </div>

                {/* Primary Identity Info - Now stacked below image */}
                <div className="w-full text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                      {profile?.company_name}
                    </h1>
                    {profile?.verified_badge && (
                      <div className="text-blue-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="text-lg font-bold text-slate-600 mb-4 tracking-tight uppercase">
                    {profile?.business_type} • {profile?.city}, {profile?.country}
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => { setConnectionsInitialTab("followers"); setIsConnectionsModalOpen(true); }} className="text-sm font-black text-blue-600 hover:underline">
                      {networkingCounts.followers} {profile?.user_type === 'seller' ? 'Clients' : 'Followers'}
                    </button>
                    <span className="text-slate-300">•</span>
                    <button onClick={() => { setConnectionsInitialTab("following"); setIsConnectionsModalOpen(true); }} className="text-sm font-black text-slate-600 hover:underline">
                      {networkingCounts.following} Network Size
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6 px-4">
                <button 
                  onClick={() => {
                    setModalTitle("Edit Primary Identity");
                    setModalFields([
                      { key: "company_name", label: "Business Name", type: "text" },
                      { key: "profile_type", label: "Profile Type", type: "select", options: ["Individual", "Company", "Association"] },
                      { key: "business_type", label: "Primary Business Type", type: "text" },
                      { key: "legal_entity_name", label: "Legal Entity Name", type: "text" },
                      { key: "designation", label: "Authority Designation", type: "text" },
                      { key: "about", label: "About Identity", type: "textarea" },
                      { key: "vision_mission", label: "Vision & Mission", type: "textarea" },
                      { key: "category_items", label: "Categories & Specialties", type: "categories" },
                      { key: "city", label: "City", type: "text" },
                      { key: "country", label: "Country", type: "text" },
                    ]);
                    setModalInitialData({
                      company_name: profile?.company_name || "",
                      profile_type: (profile as any)?.profile_type || "Individual",
                      business_type: profile?.business_type || "",
                      legal_entity_name: profile?.legal_entity_name || "",
                      designation: profile?.designation || "",
                      about: aboutText,
                      vision_mission: Array.isArray(profile?.vision_mission) ? richTextToString(profile?.vision_mission) : profile?.vision_mission || "",
                      category_items: profile?.category_items || [],
                      city: profile?.city || "",
                      country: profile?.country || "",
                    });
                    setOnModalSave(() => async (data: any) => {
                      const updatedData = { ...data };
                      if (updatedData.about && typeof updatedData.about === 'string') {
                        updatedData.about = [{ type: "paragraph", children: [{ type: "text", text: updatedData.about }] }];
                      }
                      if (updatedData.vision_mission && typeof updatedData.vision_mission === 'string') {
                        updatedData.vision_mission = [{ type: "paragraph", children: [{ type: "text", text: updatedData.vision_mission }] }];
                      }
                      await handleUpdateProfile(updatedData);
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 uppercase tracking-widest text-[10px]"
                >
                  Edit profile
                </button>
                <button 
                  onClick={() => setIsContactModalOpen(true)}
                  className="px-8 py-3 bg-white text-slate-700 font-black rounded-full hover:bg-slate-50 transition-all border-2 border-slate-200 uppercase tracking-widest text-[10px]"
                >
                  Contact Info
                </button>
                <button 
                  onClick={() => fetchEnquiries()}
                  className="px-4 py-3 bg-slate-100 text-slate-600 font-black rounded-full hover:bg-slate-200 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Inbox
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex border-b border-gray-200">
            <button
              onClick={() => {
                setActiveProfileTab("overview");
                setAutoOpenInvite(false);
              }}
              className={`px-8 py-4 text-sm font-bold transition-all ${
                activeProfileTab === "overview"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              Overview
            </button>
            {(permissions?.isOwner || (profile && user && profile.userId === user.id)) && (
              <button
                onClick={() => setActiveProfileTab("team")}
                className={`px-8 py-4 text-sm font-bold transition-all ${
                  activeProfileTab === "team"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Team Management
              </button>
            )}
          </div>

          {activeProfileTab === "overview" ? (
            <>
              <div className="flex flex-col gap-6 mt-6">
                {/* Main Content Vertical Stack */}
                <div className="flex flex-col gap-8">
                  
                  
                  {/* About Section - BLUE Accent */}
                  <div className="premium-card p-12 relative group bg-white border-2 border-slate-100 hover:border-blue-400/30 transition-all duration-500 border-t-8 border-t-blue-600 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-700" />
                    
                    <div className="flex justify-between items-center mb-10 relative z-10">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">About Identity</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Core Business Profile</p>
                      </div>
                      <button
                        onClick={() => {
                          setModalTitle("Edit Identity & Legal");
                          setModalFields([
                            { key: "about", label: "About text", type: "textarea" },
                            { key: "legal_entity_name", label: "Legal Entity Name", type: "text" },
                            { key: "designation", label: "Authority Designation", type: "text" }
                          ]);
                          setModalInitialData({ 
                            about: aboutText,
                            legal_entity_name: profile?.legal_entity_name,
                            designation: profile?.designation
                          });
                          setOnModalSave(() => async (data: any) => {
                            const updatedData = { ...data };
                            if (updatedData.about && typeof updatedData.about === 'string') {
                              updatedData.about = [{ type: "paragraph", children: [{ type: "text", text: updatedData.about }] }];
                            }
                            await handleUpdateProfile(updatedData);
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-4 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm group-hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>

                    <div className="prose prose-slate max-w-none relative z-10">
                      <p className="text-lg font-bold text-slate-600 leading-[1.6] whitespace-pre-wrap italic decoration-blue-100 decoration-4">
                        {aboutText || "Describe your business legacy and vision..."}
                      </p>
                    </div>
                    
                    <div className="mt-16 pt-10 border-t border-slate-100 relative z-10">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vision & Leadership Mission</h3>
                        <button
                          onClick={() => {
                            setModalTitle("Edit Vision & Mission");
                            setModalFields([{ key: "vision_mission", label: "Vision & Mission", type: "textarea" }]);
                            setModalInitialData({ 
                              vision_mission: Array.isArray(profile?.vision_mission) 
                                ? richTextToString(profile?.vision_mission) 
                                : profile?.vision_mission || "" 
                            });
                            setOnModalSave(() => async (data: any) => {
                              const updatedData = { ...data };
                              if (updatedData.vision_mission && typeof updatedData.vision_mission === 'string') {
                                updatedData.vision_mission = [{ type: "paragraph", children: [{ type: "text", text: updatedData.vision_mission }] }];
                              }
                              await handleUpdateProfile(updatedData);
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-lg font-medium text-slate-500 italic bg-blue-50/30 p-8 rounded-3xl border border-blue-100/50 leading-relaxed">
                        {Array.isArray((profile as any)?.vision_mission) 
                          ? richTextToString((profile as any)?.vision_mission) 
                          : ((profile as any)?.vision_mission || "Define your path to global business excellence...")}
                      </p>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-100 relative z-10">
                      <div className="p-8 bg-slate-50 rounded-3xl group/sub shadow-sm transition-all hover:shadow-md hover:bg-white border-2 border-transparent hover:border-blue-100 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Legal Registration</p>
                          <p className="text-xl font-black text-slate-900 group-hover/sub:text-blue-700">{profile?.legal_entity_name || "N/A"}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setModalTitle("Edit Legal Registration");
                            setModalFields([{ key: "legal_entity_name", label: "Legal Entity Name", type: "text" }]);
                            setModalInitialData({ legal_entity_name: profile?.legal_entity_name });
                            setOnModalSave(() => async (data: any) => {
                              await handleUpdateProfile(data);
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-3xl group/sub shadow-sm transition-all hover:shadow-md hover:bg-white border-2 border-transparent hover:border-blue-100 flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Principal Authority</p>
                          <p className="text-xl font-black text-slate-900 group-hover/sub:text-blue-700">{profile?.designation || "N/A"}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setModalTitle("Edit Principal Authority");
                            setModalFields([{ key: "designation", label: "Authority Designation", type: "text" }]);
                            setModalInitialData({ designation: profile?.designation });
                            setOnModalSave(() => async (data: any) => {
                              await handleUpdateProfile(data);
                            });
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Market Reach - ORANGE Accent */}
                  <div className="premium-card p-6 relative group bg-white border-2 border-slate-100 hover:border-orange-400/30 transition-all duration-500 border-t-4 border-t-orange-600 overflow-hidden max-w-4xl">
                    <div className="flex justify-between items-center mb-6 relative z-10">
                      <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Marketplace Reach</h2>
                      </div>
                      <button
                        onClick={() => {
                          setModalTitle("Manage Market Reach");
                          setModalFields([
                            { key: "experience_years", label: "Years of Experience", type: "number" },
                            { key: "market_focus", label: "Market Focus (Direct/B2B/etc)", type: "text" },
                          ]);
                          setModalInitialData({
                            experience_years: (profile as any)?.experience_years || 0,
                            market_focus: (profile as any)?.market_focus || "",
                          });
                          setOnModalSave(() => async (data: any) => {
                            await handleUpdateProfile(data);
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-orange-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                      <div className="p-5 bg-orange-50/30 rounded-2xl border border-orange-100/50 group/reach transition-all">
                        <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-1">Corporate Legacy</p>
                        <p className="text-2xl font-black text-slate-900 leading-none">{(profile as any)?.experience_years || "0"}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Years of Industry Excellence</p>
                      </div>

                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group/reach transition-all">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Dominance</p>
                        <p className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">{(profile as any)?.market_focus || "General Business"}</p>
                        <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-tighter">Core Market Specialization</p>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Gallery - PURPLE Accent */}
                  <div className="premium-card p-12 relative group bg-white border-2 border-slate-100 hover:border-purple-400/30 transition-all duration-500 border-t-8 border-t-purple-600">
                    <div className="flex justify-between items-center mb-12">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Visual Portfolio</h2>
                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mt-1">Showcasing Excellence</p>
                      </div>
                      <button 
                        onClick={() => setShowMediaModal(true)}
                        className="p-4 bg-slate-50 text-slate-400 hover:bg-purple-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center gap-3 group/btn"
                      >
                        <svg className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-black uppercase tracking-widest px-2 border-l border-slate-200">Manage Sections</span>
                      </button>
                    </div>

                    {!profile?.image_sections || profile.image_sections.length === 0 ? (
                      <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 group-hover:bg-purple-50/30 transition-colors">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-200 group-hover:text-purple-300 transition-colors">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">No Media Assets Found</p>
                        <p className="text-slate-500 font-medium mb-10">Your visual narrative starts here. Add high-impact media to wow your network.</p>
                        <button 
                          onClick={() => setShowMediaModal(true)}
                          className="px-10 py-4 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 uppercase tracking-widest text-xs"
                        >
                          + Create First Section
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-20">
                        {profile.image_sections
                          .sort((a, b) => a.order - b.order)
                          .map((section) => (
                            <div key={section.id} className="group/section">
                              <div className="flex items-end gap-6 mb-8">
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                                  {section.Title}
                                </h3>
                                <div className="h-0.5 flex-1 bg-slate-100 mb-2 transition-all group-hover/section:bg-purple-100" />
                                {section.media_type && (
                                  <span className="px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-purple-100 mb-1">
                                    {section.media_type}
                                  </span>
                                )}
                              </div>

                              {section.description && (
                                <p className="text-xl font-medium text-slate-500 mb-10 leading-relaxed italic border-l-4 border-purple-200 pl-6">
                                  {section.description}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                {section.imageUrls.map((url, index) => {
                                    const isVideo = section.media_type === 'video';
                                    let videoContent = null;

                                    if (isVideo) {
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
                                        className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] border-4 border-white shadow-lg shadow-slate-200 group/media transition-all hover:shadow-2xl hover:scale-[1.03] hover:-rotate-1"
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
                                                  className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent opacity-0 group-hover/media:opacity-100 transition-all flex items-center justify-center pointer-events-none">
                                                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/40 shadow-2xl scale-50 group-hover/media:scale-100 transition-all duration-500">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                                    </svg>
                                                  </div>
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


                  {/* Contact Information - GREEN Accent */}
                  <div className="premium-card p-6 relative group bg-white border-2 border-slate-100 hover:border-green-400/30 transition-all duration-500 border-t-4 border-t-green-600 max-w-4xl">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Direct Connections</h2>
                      </div>
                      <button
                        onClick={() => {
                          setModalTitle("Edit Contact Details");
                          setModalFields([
                            { key: "website", label: "Website", type: "text" },
                            { key: "whatsapp", label: "WhatsApp Number", type: "text" },
                            { key: "linkedin", label: "LinkedIn URL", type: "text" },
                            { key: "twitter", label: "Twitter URL", type: "text" },
                          ]);
                          setModalInitialData({
                            website: profile?.website || "",
                            whatsapp: profile?.whatsapp || "",
                            linkedin: contactForm.social_links?.linkedin || "",
                            twitter: contactForm.social_links?.twitter || "",
                          });
                          setOnModalSave(() => async (data: any) => {
                            const { website, whatsapp, linkedin, twitter } = data;
                            await handleUpdateProfile({ 
                              website, 
                              whatsapp, 
                              social_links: { ...contactForm.social_links, linkedin, twitter } 
                            });
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-green-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover/item:text-blue-600 group-hover/item:bg-blue-50 transition-all border border-slate-100 group-hover/item:border-blue-100">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Web Interface</p>
                          {profile?.website ? (
                            <a href={profile.website} target="_blank" className="text-sm font-black text-slate-900 hover:text-blue-600 transition-colors tracking-tight">
                              {profile.website.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-sm font-black text-slate-300 italic tracking-tight">Unavailable</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 group/item">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover/item:text-green-600 group-hover/item:bg-green-50 transition-all border border-slate-100 group-hover/item:border-green-100">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1.061a2.961 2.961 0 01-2.911-2.511 11.059 11.059 0 01-7.472-7.472A2.961 2.961 0 013 15.111V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">B2B Messaging</p>
                          <p className="text-sm font-black text-slate-900 tracking-tight">
                            {profile?.whatsapp || "Not Linked"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Presence:</span>
                       <div className="flex gap-4">
                        {contactForm.social_links?.linkedin && (
                          <a href={contactForm.social_links.linkedin} target="_blank" className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-600 hover:text-white transition-all">LinkedIn Authority</a>
                        )}
                        {contactForm.social_links?.twitter && (
                          <a href={contactForm.social_links.twitter} target="_blank" className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-400 transition-all">Global Feed</a>
                        )}
                        {!contactForm.social_links?.linkedin && !contactForm.social_links?.twitter && (
                          <p className="text-[10px] font-bold text-slate-300 italic">No professional networks connected</p>
                        )}
                       </div>
                    </div>
                  </div>

                  {/* Membership & Trust - CYAN Accent */}
                  <div className="premium-card p-6 relative group bg-white border-2 border-slate-100 hover:border-cyan-400/30 transition-all duration-500 border-t-4 border-t-cyan-500 max-w-4xl">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Credential Status</h2>
                    {membershipLoading ? (
                      <div className="flex items-center gap-4 text-cyan-500 font-black italic text-xs animate-pulse">
                        <div className="w-4 h-4 border-2 border-cyan-200 border-t-cyan-500 rounded-full animate-spin" />
                        Validating Tier...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="p-4 bg-cyan-50/30 rounded-2xl border border-cyan-100/50">
                          <p className="text-[8px] font-black text-cyan-600 uppercase tracking-[0.2em] mb-1">Service Tier</p>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{membershipStatus?.tier || "Standard"}</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Verification</p>
                          <p className={`text-sm font-black uppercase tracking-tight ${membershipStatus?.is_active ? 'text-green-600' : 'text-slate-300'}`}>
                            {membershipStatus?.is_active ? "Verified" : "Pending"}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Valid Until</p>
                          <p className="text-sm font-black text-slate-900 tabular-nums tracking-tight">
                            {membershipStatus?.expiry && !isNaN(Date.parse(membershipStatus.expiry)) 
                              ? new Date(membershipStatus.expiry).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
                              : "LIFETIME"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operating Footprint - INDIGO Accent */}
                  <div className="premium-card p-12 relative group bg-white border-2 border-slate-100 hover:border-indigo-400/30 transition-all duration-500 border-t-8 border-t-indigo-600">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Geographic Reach</h2>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">Global Operating Footprint</p>
                      </div>
                      <button 
                        onClick={() => {
                          setModalTitle("Manage Operating Footprint");
                          setModalFields([
                            { key: "operating_locations", label: "Locations", type: "locations" }
                          ]);
                          setModalInitialData({
                            operating_locations: (profile as any)?.operating_locations || []
                          });
                          setOnModalSave(() => async (data: any) => {
                            await handleUpdateProfile(data);
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="p-4 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm group-hover:scale-110"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                       { (profile as any)?.operating_locations && (profile as any).operating_locations.length > 0 ? (
                         (profile as any).operating_locations.map((loc: any, i: number) => (
                            <div key={i} className="px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] flex items-center gap-4 text-lg font-black text-slate-800 hover:border-indigo-200 hover:bg-white hover:shadow-xl hover:scale-105 transition-all cursor-default uppercase">
                              <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.8)]" />
                              {loc.city}, <span className="text-slate-400 text-sm font-bold">{loc.country}</span>
                            </div>
                         ))
                       ) : (
                         <div className="w-full py-12 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
                           <p className="text-lg font-black uppercase tracking-tighter">Localized Operations</p>
                           <p className="text-sm font-bold mt-2 italic">Add international hubs to increase search visibility</p>
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Market Intelligence - SLATE Accent */}
                  <div className="premium-card p-12 relative group bg-white border-2 border-slate-200 hover:border-slate-900/10 transition-all duration-500 overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 translate-y-1/2 -z-10" />
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-12 flex items-center gap-4">
                      Market Intelligence
                      <span className="px-3 py-1 bg-slate-900 text-white text-[10px] rounded-lg animate-pulse">LIVE</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                      <div className="flex items-center gap-8 group/stat">
                        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-2xl transition-transform group-hover/stat:rotate-6">
                           <p className="text-2xl font-black">128</p>
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Views</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">Profile Visibility</p>
                          <p className="text-sm font-bold text-slate-500 mt-1">Institutional entities that explored your profile.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 group/stat">
                         <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex flex-col items-center justify-center text-white shadow-2xl transition-transform group-hover/stat:scale-110">
                           <p className="text-2xl font-black">{enquiries.length}</p>
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Enquiries</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">Business Flow</p>
                          <p className="text-sm font-bold text-slate-500 mt-1">Active negotiation threads in your business inbox.</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 group/stat">
                         <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-900 border-2 border-slate-200 group-hover/stat:bg-slate-900 group-hover/stat:text-white transition-all">
                           <p className="text-2xl font-black">45</p>
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Hits</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">Search Power</p>
                          <p className="text-sm font-bold text-slate-500 mt-1">Appearance in high-intent industry searches.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Conversations Preview */}
                  {enquiries.length > 0 && (
                    <div className="premium-card p-12 relative group bg-white border-2 border-slate-100 hover:border-slate-900/10 transition-all duration-500">
                       <div className="flex justify-between items-center mb-10">
                          <div>
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Recent Conversations</h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Last active negotiation threads</p>
                          </div>
                          <button 
                            onClick={() => fetchEnquiries()}
                            className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest"
                          >
                            Open Inbox
                          </button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {enquiries.slice(0, 4).map(thread => {
                            const otherCompany = Number(thread.from_company?.userId) === Number(user?.id) 
                              ? thread.to_company 
                              : thread.from_company;

                            return (
                              <div 
                                key={thread.documentId}
                                onClick={() => router.push(`/messages?threadId=${thread.documentId}&mode=enquiry`)}
                                className="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl hover:border-indigo-200 hover:bg-white hover:shadow-xl transition-all group/thread cursor-pointer"
                              >
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-100 group-hover/thread:scale-110 transition-transform">
                                      {otherCompany?.company_name?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-black text-slate-900 uppercase tracking-tight truncate">
                                        {otherCompany?.company_name || thread.title}
                                      </h4>
                                      <p className="text-[10px] text-slate-400 font-bold truncate mt-0.5">{thread.last_message_preview || "No messages yet"}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-300 group-hover/thread:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}

                  {/* My Tradewall Posts Section - BOTTOM Activity */}
                  <div id="tradewall-posts"
 className="premium-card p-12 relative group bg-white border-2 border-slate-100 hover:border-blue-400/30 transition-all duration-500 border-t-8 border-t-blue-600">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">My Tradewall Posts</h2>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Direct Market Activity</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 text-xs font-black px-5 py-2 rounded-full border border-blue-100">
                        {userPosts.length} ACTIVE SIGNALS
                      </span>
                    </div>

                    {loadingPosts ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-48 bg-slate-50 rounded-[2.5rem] animate-pulse" />
                        ))}
                      </div>
                    ) : userPosts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {userPosts.map((post) => (
                          <div
                            key={post.id}
                            className={`p-10 rounded-[2.5rem] border-2 transition-all hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group/post ${
                              post.intentType === "demand" 
                              ? "bg-red-50/30 border-red-100 hover:border-red-300" 
                              : "bg-green-50/30 border-green-100 hover:border-green-300"
                            }`}
                          >
                            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[10px] font-black uppercase tracking-widest text-white ${
                              post.intentType === "demand" ? "bg-red-600" : "bg-green-600"
                            }`}>
                              {post.intentType}
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-4 pr-12 group-hover/post:text-blue-700 transition-colors line-clamp-2">
                              {post.title}
                            </h4>
                            <p className="text-sm font-bold text-slate-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {post.destinationCity} • {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                            <div className="text-base font-medium text-slate-600 line-clamp-3 leading-relaxed">
                              {post.content && Array.isArray(post.content)
                                ? post.content
                                    .map((block: any) =>
                                      block.children?.map((child: any) => child.text).join(" ")
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
                      <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100">
                        <p className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Market Quiet</p>
                        <p className="text-slate-400 font-medium mt-2">Broadcast your first demand/supply signal to the global network.</p>
                        <button
                          onClick={() => router.push("/")}
                          className="mt-8 px-10 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all shadow-xl uppercase tracking-widest text-xs"
                        >
                          Go to Tradewall
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="md:col-span-3">
              {profile?.documentId && (
                <TeamManagement 
                  companyProfileDocumentId={profile.documentId} 
                  initOpenInvite={autoOpenInvite}
                />
              )}
            </div>
          )}
        </div>
      </div>


{/* Enquiry Modal */}
{showEnquiries && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your Enquiries
                  </h2>
                  <p className="text-sm text-gray-500">
                    View and manage your business messages
                  </p>
                </div>
                <button
                  onClick={() => setShowEnquiries(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingEnquiries ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">
                      Fetching your messages...
                    </p>
                  </div>
                ) : enquiries.length > 0 ? (
                  enquiries.map((thread) => {
                    const otherCompany = Number(thread.from_company?.userId) === Number(user?.id) 
                      ? thread.to_company 
                      : thread.from_company;
                    
                    return (
                      <div
                        key={thread.documentId}
                        onClick={() => router.push(`/messages?threadId=${thread.documentId}`)}
                        className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-100">
                              {otherCompany?.company_name?.substring(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 tracking-tight">
                                {otherCompany?.company_name || thread.title}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {new Date(thread.last_message_at || thread.updatedAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                   
                        </div>
                        <p className="text-slate-600 text-xs font-medium leading-relaxed mt-2 pl-2 border-l-2 border-slate-100">
                          {thread.last_message_preview || "No preview available"}
                        </p>
                        
                        <div className="mt-3 flex justify-end">
                          <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            Open Workspace
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-10 h-10 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        ></path>
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      No enquiries yet
                    </p>
                    <p className="text-sm text-gray-400">
                      Your business inquiries will appear here
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowEnquiries(false)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Save Indicator */}
        {saving && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
            Updating Profile...
          </div>
        )}
     
      <ContactInfoModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        profile={profile}
      />

      {profile?.documentId && (
        <ConnectionsModal
          isOpen={isConnectionsModalOpen}
          onClose={() => setIsConnectionsModalOpen(false)}
          profileId={profile.documentId}
          initialTab={connectionsInitialTab}
        />
      )}
    </ProtectedRoute>
  );
}
export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
