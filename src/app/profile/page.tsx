"use client";

import React, { useState, useEffect } from "react";
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
import { authenticatedFetch } from "@/lib/auth";
import { getUserPosts, type Post } from "@/lib/posts";
import MediaModal from "@/components/MediaModal";
import ProfileEditModal from "@/components/ProfileEditModal";
import ContactInfoModal from "@/components/ContactInfoModal";
import { ImageSection } from "@/lib/profile";
import TeamManagement from "@/components/TeamManagement";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useTeam } from "@/context/TeamContext";

interface Enquiry {
  id: number;
  documentId: string;
  fromUserId: number;
  toUserId: number;
  title: string;
  description: string;
  destination: string;
  messagestatus: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function ProfilePage() {
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
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Posts states
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // New Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false);

  // New Profile Edit Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
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

  const fetchEnquiries = async () => {
    if (!user?.id) return;

    setLoadingEnquiries(true);
    setShowEnquiries(true);

    try {
      const apiUrl =
        `https://api.letsb2b.com/api/enquiries` +
        `?filters[$or][0][fromUserId][$eq]=${user.id}` +
        `&filters[$or][1][toUserId][$eq]=${user.id}` +
        `&sort=createdAt:desc`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // ❌ NO Authorization header
        },
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Strapi error:", result);
        return;
      }

      setEnquiries(result.data || []);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const fetchUserPosts = async (userId: number) => {
    setLoadingPosts(true);
    try {
      const response = await getUserPosts(userId);
      if (response && response.data) {
        setUserPosts(response.data);
      }
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
            : `${data.company_name} is a leading ${data.category?.type} based in ${data.city}.`
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
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef] pb-12">
        {/* Navigation Bar Spacing */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800 hidden md:block">
              LET'S B2B
            </span>
          </div>
          <div className="flex items-center gap-6">
            <WorkspaceSwitcher />
            <button
              onClick={() => router.push("/")}
              className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
              <span className="text-[10px] font-medium hidden md:block">Home</span>
            </button>
            <button
              onClick={() => router.push("/messages")}
              className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
              </svg>
              <span className="text-[10px] font-medium hidden md:block">
                Messaging
              </span>
            </button>

            {(permissions?.isOwner || (profile && user && profile.userId === user.id)) && (
              <button
                onClick={() => {
                   setActiveProfileTab("team");
                   setAutoOpenInvite(true);
                }}
                className="group flex flex-col items-center text-gray-500 hover:text-green-600 transition-colors"
              >
                <div className="p-1 rounded-lg group-hover:bg-green-50 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-[10px] font-medium hidden md:block">Add Team</span>
              </button>
            )}

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex flex-col items-center text-blue-600 transition-colors"
            >
              <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border border-blue-600 cursor-pointer">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.company_name || "Profile"}
                    className="w-full h-full object-cover cursor-pointer"
                  />
                ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs select-none">
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
              )}
              </div>
              <span className="text-[10px] font-medium hidden md:block">Me</span>
            </button>
          </div>
        </div>

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
              alert("Failed to update gallery");
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

        <div className="max-w-5xl mx-auto mt-6 px-4">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
            {/* Background Cover */}
            <div
              onClick={() =>
                profile?.headerImageUrl &&
                setPreviewImage(profile.headerImageUrl)
              }
              className="h-48 w-full relative overflow-hidden cursor-pointer"
            >
              {profile?.headerImageUrl ? (
                <img
                  src={profile.headerImageUrl}
                  alt={`${profile.company_name} header`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 " />
              )}

              {/* Header Actions */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {profile?.headerImageUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHeaderImageDelete();
                    }}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-red-500/80 hover:text-white text-white/90 transition-all shadow-sm"
                    title="Remove cover photo"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                
                <label className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all cursor-pointer text-white shadow-sm">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleHeaderImageUpload}
                    disabled={saving}
                  />
                  <svg
                    className={`w-5 h-5 ${saving ? 'animate-pulse' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </label>
              </div>

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

                    {/* Image */}
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl bg-black"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Profile Image & Content Header */}
            <div className="px-6 pb-6">
              <div className="relative -mt-24 mb-4 w-40 group">
                <div
                  onClick={() =>
                    profile?.profileImageUrl && setShowImageModal(true)
                  }
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden relative cursor-pointer"
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
                  
                  {/* Overlay for actions */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <label className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 cursor-pointer text-white transition-all">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleProfileImageUpload}
                        disabled={saving}
                      />
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    
                    {profile?.profileImageUrl && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfileImageDelete();
                        }}
                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-red-500/80 text-white transition-all"
                        title="Remove profile picture"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    onClick={() => {
                      setModalTitle("Edit Header Information");
                     
                      setModalTitle("Edit Header Information");
                      setModalFields([
                        { key: "company_name", label: "Business Name", type: "text" },
                        { key: "profile_type", label: "Profile Type", type: "select", options: [
                          { label: "Individual", value: "Individual" },
                          { label: "Company", value: "Company" },
                          { label: "Association", value: "Association" },
                        ]},
                        { key: "business_type", label: "Business Type", type: "select", options: [
                          { label: "Travel Agent", value: "Travel Agent" },
                          { label: "Tour Operator", value: "Tour Operator" },
                          { label: "Destination Management Company (DMC)", value: "Destination Management Company (DMC)" },
                          { label: "Handling Partner", value: "Handling Partner" },
                          { label: "Hotel", value: "Hotel" },
                          { label: "Resort", value: "Resort" },
                          { label: "Homestay", value: "Homestay" },
                          { label: "Service Villas", value: "Service Villas" },
                          { label: "Apartments", value: "Apartments" },
                          { label: "Houseboats", value: "Houseboats" },
                          { label: "Cruise Liners", value: "Cruise Liners" },
                          { label: "Transport Provider", value: "Transport Provider" },
                          { label: "Activity / Experience Provider", value: "Activity / Experience Provider" },
                          { label: "Wellness Centres", value: "Wellness Centres" },
                          { label: "Ayurveda Centres", value: "Ayurveda Centres" },
                          { label: "Medical Tourism Facilitators", value: "Medical Tourism Facilitators" },
                          { label: "Tourism Associations", value: "Tourism Associations" },
                          { label: "Hospitality Institutions", value: "Hospitality Institutions" },
                          { label: "Training Organisations", value: "Training Organisations" },
                        ]},
                        { key: "category_items", label: "Business Categories", type: "categories", options: [
                          { label: "Travel Agent", value: "Travel Agent" },
                          { label: "Tour Operator", value: "Tour Operator" },
                          { label: "Destination Management Company (DMC)", value: "Destination Management Company (DMC)" },
                          { label: "Handling Partner", value: "Handling Partner" },
                          { label: "Hotel", value: "Hotel" },
                          { label: "Resort", value: "Resort" },
                          { label: "Homestay", value: "Homestay" },
                          { label: "Service Villas", value: "Service Villas" },
                          { label: "Apartments", value: "Apartments" },
                          { label: "Houseboats", value: "Houseboats" },
                          { label: "Cruise Liners", value: "Cruise Liners" },
                          { label: "Transport Provider", value: "Transport Provider" },
                          { label: "Activity / Experience Provider", value: "Activity / Experience Provider" },
                          { label: "Wellness Centres", value: "Wellness Centres" },
                          { label: "Ayurveda Centres", value: "Ayurveda Centres" },
                          { label: "Medical Tourism Facilitators", value: "Medical Tourism Facilitators" },
                          { label: "Tourism Associations", value: "Tourism Associations" },
                          { label: "Hospitality Institutions", value: "Hospitality Institutions" },
                          { label: "Training Organisations", value: "Training Organisations" },
                        ]},
                        { key: "city", label: "City", type: "text" },
                        { key: "state", label: "State", type: "text" },
                        { key: "country", label: "Country", type: "text" },
                        { key: "address_text", label: "Address Line", type: "textarea" },
                        { key: "google_map_link", label: "Google Map Link", type: "text" },
                      ]);
                      setModalInitialData(headerForm);
                      setOnModalSave(() => async (data: any) => {
                        await handleUpdateProfile(data);
                        setHeaderForm(data);
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Info
                  </button>
                  {(permissions?.isOwner || (profile && user && profile.userId === user.id)) && (
                    <button
                      onClick={() => {
                        setAutoOpenInvite(true);
                        setActiveProfileTab("team");
                      }}
                      className="px-4 py-1.5 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Add Member
                    </button>
                  )}
                  <button
                    onClick={fetchEnquiries}
                    className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Enquiries
                  </button>
                  <button className="px-4 py-1.5 border border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors cursor-pointer">
                    Resources
                  </button>
                </div>
              </div>
            </div>

            {showImageModal && profile?.profileImageUrl && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                onClick={() => setShowImageModal(false)}
              >
                {/* Stop click bubbling so image click doesn’t close */}
                <div
                  className="relative max-w-3xl w-full px-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="absolute -top-10 right-2 text-white text-3xl hover:scale-110 transition"
                  >
                    ×
                  </button>

                  {/* Large Image */}
                  <img
                    src={profile.profileImageUrl}
                    alt={profile.company_name}
                    className="w-full max-h-[80vh] object-contain rounded-lg shadow-2xl bg-black"
                  />
                </div>
              </div>
            )}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {activeProfileTab === "overview" ? (
              <>
                {/* Left Column (Main Content) */}
                <div className="md:col-span-2 space-y-6">
                  {/* About Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">About</h2>
                  <button
                    onClick={() => {
                      setModalTitle("Edit About");
                      setModalFields([{ key: "about", label: "About text", type: "textarea" }]);
                      setModalInitialData({ about: aboutText });
                      setOnModalSave(() => async (data: any) => {
                        const updatedData = { ...data };
                        
                        // Convert string back to Rich Text structure for about
                        if (updatedData.about && typeof updatedData.about === 'string') {
                          updatedData.about = [
                            {
                              type: "paragraph",
                              children: [
                                {
                                  type: "text",
                                  text: updatedData.about
                                }
                              ]
                            }
                          ];
                        }
                        
                        await handleUpdateProfile(updatedData);
                        setAboutText(data.about);
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aboutText}
                </p>
              </div>

              {/* Business Details Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Business Details</h2>
                  <button
                    onClick={() => {
                        setModalTitle("Edit Business Details");
                        setModalFields([
                          { key: "brand_tagline", label: "Brand Tagline", type: "text" },
                          { key: "legal_entity_name", label: "Legal Entity Name", type: "text" },
                          { key: "designation", label: "Designation", type: "text" },
                          { key: "vision_mission", label: "Vision & Mission", type: "textarea" },
                        ]);
                        const visionMission = (profile as any)?.vision_mission;
                        const visionMissionText = Array.isArray(visionMission) 
                            ? richTextToString(visionMission) 
                            : (visionMission || "");

                        setModalInitialData({
                          brand_tagline: (profile as any)?.brand_tagline || "",
                          legal_entity_name: profile?.legal_entity_name || "",
                          designation: profile?.designation || "",
                          vision_mission: visionMissionText,
                        });
                        setOnModalSave(() => async (data: any) => {
                          const updatedData = { ...data };
                          
                          // Convert string back to Rich Text structure for vision_mission
                          if (updatedData.vision_mission && typeof updatedData.vision_mission === 'string') {
                            updatedData.vision_mission = [
                              {
                                type: "paragraph",
                                children: [
                                  {
                                    type: "text",
                                    text: updatedData.vision_mission
                                  }
                                ]
                              }
                            ];
                          }
                          
                          await handleUpdateProfile(updatedData);
                        });
                        setIsEditModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Legal Entity Name</label>
                    <p className="text-gray-900 font-semibold">{profile?.legal_entity_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Designation</label>
                    <p className="text-gray-900 font-semibold">{profile?.designation || "N/A"}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-gray-50 pt-4">
                    <label className="text-xs font-bold text-gray-400 uppercase">Vision & Mission</label>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">
                      {Array.isArray((profile as any)?.vision_mission) 
                        ? richTextToString((profile as any)?.vision_mission) 
                        : ((profile as any)?.vision_mission || "N/A")}
                    </p>
                </div>
              </div>

              {/* Facilities & Amenities */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                    Facilities & Amenities
                  </h2>
                  <button 
                    onClick={() => {
                        setModalTitle("Manage Facilities & Amenities");
                        setModalFields([
                          { key: "amenities", label: "Facilities", type: "chips" },
                        ]);
                        setModalInitialData({
                          amenities: (profile?.amenities as string[]) || [],
                        });
                        setOnModalSave(() => async (data: any) => {
                          await handleUpdateProfile(data);
                        });
                        setIsEditModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile?.amenities && (profile.amenities as string[]).length > 0 ? (
                    (profile.amenities as string[]).map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-medium border border-gray-200">
                        {a}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No amenities listed.</p>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-md">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Joined
                </h2>
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 bg-blue-50 flex items-center justify-center rounded-lg border border-blue-100 shadow-sm flex-shrink-0">
                    <svg
                      className="w-8 h-8 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 5V3a1 1 0 011-1h8a1 1 0 011 1v2h5a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1h5zM8 4v1h8V4H8zm-3 3v12h14V7H5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xl text-gray-900">
                        {profile?.company_name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        profile?.user_type === 'seller' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {profile?.user_type}
                      </span>
                    </div>
                    <p className="text-gray-600 font-medium mt-1">
                      Full-time • {profile?.category?.type || "General Business"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile?.city}, {profile?.country}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Joined {profile ? new Date(profile.createdAt).toLocaleDateString("en-GB") : "N/A"}
                      </div>
                    </div>
                    {profile?.profile_status && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold border border-blue-100">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                        Status: Active
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Media Gallery
                  </h2>
                  <button 
                    onClick={() => setShowMediaModal(true)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all flex items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span className="text-sm font-bold">Manage Media</span>
                  </button>
                </div>

                {!profile?.image_sections || profile.image_sections.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500 text-sm">No media sections added yet.</p>
                    <button 
                      onClick={() => setShowMediaModal(true)}
                      className="mt-3 text-blue-600 font-bold text-sm hover:underline"
                    >
                      + Add images to showcase your services
                    </button>
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

              {/* My Posts Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    My Tradewall Posts
                  </h2>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
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
                        className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
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
                      You haven't posted anything on the Tradewall yet.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="mt-3 text-blue-600 font-bold text-sm hover:underline"
                    >
                      Go to Tradewall to create a post
                    </button>
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
                      <p className="text-xs text-gray-500">Website</p>
                      {profile?.website ? (
                        <a
                          href={profile.website}
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
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="text-gray-800 font-semibold text-sm">
                        {profile?.whatsapp ||
                          profile?.whatsapp ||
                          "Not provided"}
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
                        {contactForm.social_links?.linkedin && <a href={contactForm.social_links.linkedin} target="_blank" className="text-blue-600 hover:scale-110 transition">LI</a>}
                        {contactForm.social_links?.twitter && <a href={contactForm.social_links.twitter} target="_blank" className="text-blue-400 hover:scale-110 transition">TW</a>}
                      </div>
                    </div>
                  </div>
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
                  className="w-full mt-6 py-2 border border-blue-600 text-blue-600 font-bold rounded hover:bg-blue-50 transition-all text-sm cursor-pointer"
                >
                  Edit Contact Details
                </button>
              </div>

              {/* Market Reach */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Market Reach
                  </h2>
                  <button 
                    onClick={() => {
                      setModalTitle("Edit Market Reach");
                      setModalFields([
                        { key: "experience_years", label: "Years of Experience", type: "number" },
                        { key: "market_focus", label: "Market Focus", type: "text" },
                      ]);
                      setModalInitialData({
                        experience_years: profile?.experience_years || 0,
                        market_focus: profile?.market_focus || "",
                      });
                      setOnModalSave(() => async (data: any) => {
                        await handleUpdateProfile(data);
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
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
                    className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
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

              {/* Analytics Simulation */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Analytics
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      128 profile views
                    </p>
                    <p className="text-xs text-gray-500">
                      Discover who viewed your page.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      45 search appearances
                    </p>
                    <p className="text-xs text-gray-500">
                      See how often you appear in results.
                    </p>
                </div>
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
                  enquiries.map((enquiry) => (
                    <div
                      key={enquiry.id}
                      className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {enquiry.fromUserId === user?.id ? "TO" : "FR"}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {enquiry.title || "No Subject"}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {new Date(enquiry.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            enquiry.fromUserId === user?.id
                              ? "bg-blue-100 text-blue-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {enquiry.fromUserId === user?.id
                            ? "Sent"
                            : "Received"}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed ml-12">
                        {enquiry.description}
                      </p>
                      {enquiry.destination && (
                        <p className="text-[10px] text-gray-400 mt-2 ml-12 flex items-center gap-1 font-bold italic uppercase">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            ></path>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            ></path>
                          </svg>
                          {enquiry.destination}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
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
    </ProtectedRoute>
  );
}
