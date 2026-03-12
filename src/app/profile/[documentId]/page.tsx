
"use client";
/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BadgeCheck,
  BarChart3,
  Camera,
  ChevronRight,
  Check,
  ExternalLink,
  Globe,
  ImageIcon,
  MessageCircleMore,
  Phone,
  Plus,
  Pencil,
  ChevronDown,
  ChevronUp,
  Share2,
  Star,
  TrendingUp,
} from "lucide-react";
import ProtectedRoute, { useAuth } from "@/components/ProtectedRoute";
import {
  getProfileByDocumentId,
  getMyContexts,
  updateUserProfile,
  updateImageSections,
  type UserProfile
} from "@/lib/profile";
import EnquiryModal from "@/components/EnquiryModal";
import ContactInfoModal from "@/components/ContactInfoModal";
import { deletePost, getPostsByUserId, getTradeWallFeed, type Post } from "@/lib/posts";
import { getOrCreateDirectThread } from "@/lib/enquiry";
import FollowButton from "@/components/FollowButton";
import ConnectionsModal from "@/components/ConnectionsModal";
import MediaModal from "@/components/MediaModal";
import ProfileEditModal from "@/components/ProfileEditModal";

type ProfileTab = "about" | "enquiries" | "analytics";

type GalleryItem = {
  url: string;
  name: string;
  mediaType?: string;
};

type SidebarSuggestion = {
  name: string;
  mutual: string;
};

type RichTextChild = {
  text?: string;
};

type RichTextBlock = {
  children?: RichTextChild[];
};

type SocialLinks = Partial<Record<"instagram" | "facebook" | "linkedin" | "pinterest" | "snapchat" | "telegram" | "twitter", string>>;

type ExtendedProfile = UserProfile & {
  social_links?: SocialLinks;
  brand_tagline?: string;
  response_rate?: number;
  rating_average?: number;
};

type PostContentBlock = {
  children?: Array<{ text?: string }>;
};

const trendingItems = [
  { topic: "Stay @ Munnar", growth: 23 },
  { topic: "Rent Car Goa", growth: 13 },
  { topic: "Budget Stay Calicut", growth: 5 },
  { topic: "Car Rent", growth: 5 },
  { topic: "Summer Stay Kerala", growth: 5 },
];

// Static until the new API exposes network recommendation data for profile pages.
const suggestedConnections: SidebarSuggestion[] = [
  { name: "Taj Vivanta Bangalore", mutual: "12 Mutual Connections" },
  { name: "JW Marriott", mutual: "7 Mutual Connections" },
  { name: "The Leela Palace", mutual: "21 Mutual Connections" },
  { name: "The Oberoi", mutual: "6 Mutual Connections" },
  { name: "Golden Palms", mutual: "7 Mutual Connections" },
  { name: "Elegance Bangalore", mutual: "13 Mutual Connections" },
];

// Static until the redesigned profile API sends service taxonomy for this block.
const fallbackServices = [
  "Planning & Consultation",
  "Accommodation Booking",
  "Transportation",
  "Group Travel",
  "Booking Service",
  "Tour Package",
  "Visa & Documentation",
];

// Static until the redesigned profile API sends destination coverage cards.
const fallbackDestinations = [
  { name: "Delhi", image: "/global-travel-network/travel_block.png" },
  { name: "Jaipur", image: "/global-travel-network/hotels_stays.png" },
  { name: "Kerala", image: "/global-travel-network/transport-mobility-block.png" },
];

const fallbackPortfolio = [
  {
    title: "Cultural Tourism",
    location: "Jaipur , India",
    description: "An unforgettable experience awaits you in this haven of luxury,complete",
    image: "/global-travel-network/travel_block.png",
  },
  {
    title: "Cultural Tourism",
    location: "Jaipur , India",
    description: "An unforgettable experience awaits you in this haven of luxury,complete",
    image: "/global-travel-network/hotels_stays.png",
  },
  {
    title: "Cultural Tourism",
    location: "Jaipur , India",
    description: "An unforgettable experience awaits you in this haven of luxury,complete",
    image: "/global-travel-network/transport-mobility-block.png",
  },
];

const operationalStrengths = [
  "12 years in travel industry",
  "20+ travel professionals",
  "4,500 travelers served annually",
  "Expertise in Europe, Southeast Asia, and the Middle East",
  "Uses Amadeus and Sabre booking systems",
  "Partnerships with 300+ hotels worldwide",
  "Multilingual support (English, Hindi, French)",
  "24/7 customer assistance",
];

const tradeTerms = [
  "12% standard agent commission",
  "Net rates available for tour operators",
  "30% advance payment required",
  "Balance payable 7 days before travel",
  "Free cancellation up to 21 days prior",
];

const certifications = [
  {
    name: "Certification 1",
    company: "Company Name",
    issued: "XX-XX-2026",
    image: "/global-travel-network/travel_block.png",
  },
  {
    name: "Certification 2",
    company: "Company Name",
    issued: "XX-XX-2026",
    image: "/global-travel-network/hotels_stays.png",
  },
];

const testimonials = [
  {
    name: "Nayla Usha",
    role: "Company Name & Position",
    time: "3 Days ago",
    text: "Vel in ac dictum urna donec donec. Placerat ultrices fames sit diam nunc pellentesque.",
    avatar: "",
  },
  {
    name: "Susan Roe",
    role: "Company Name & Position",
    time: "3 Days ago",
    text: "Vel in ac dictum urna donec donec. Placerat ultrices fames sit diam nunc pellentesque.",
    avatar: "",
  },
];

const tabLabelMap: Record<ProfileTab, string> = {
  about: "About Property",
  enquiries: "My Enquires",
  analytics: "Analytics",
};

const getInitials = (value?: string) =>
  (value || "LB")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const normalizeExternalUrl = (value?: string) => {
  if (!value) return "";
  return value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
};

const richTextToString = (blocks: RichTextBlock[] | null | undefined) => {
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block) => block.children?.map((child) => (child.text || "")).join(""))
    .join("\n")
    .trim();
};

const getBusinessTypeLabel = (profile: UserProfile) => {
  if (Array.isArray(profile.business_type)) {
    return profile.business_type.filter(Boolean).join(", ");
  }

  if (typeof profile.business_type === "string" && profile.business_type.trim()) {
    return profile.business_type;
  }

  if (profile.category_items?.length) {
    return profile.category_items.map((item) => item.category).filter(Boolean).join(", ");
  }

  return profile.user_type?.replaceAll("_", " ") || "Business";
};

const getProfileDescription = (profile: UserProfile) => {
  const aboutText = richTextToString(profile.about);
  const profileDetails = profile as ExtendedProfile;

  if (aboutText) return aboutText;
  if (profileDetails.brand_tagline) return String(profileDetails.brand_tagline);

  return "Profile description will be updated once the redesigned API exposes richer business content.";
};

const getLocationLine = (profile: UserProfile) => {
  return [profile.city, profile.state, profile.country].filter(Boolean).join(", ");
};

export default function PublicProfilePage() {
  // Single profile view for both owner and visitor (Twitter-style).
  // Owner: edit buttons in all sections. Visitor: same layout, no edit, Follow + button only.
  const params = useParams();
  const router = useRouter();
  const user = useAuth();
  const documentId = params.documentId as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("about");

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [isConnectionsModalOpen, setIsConnectionsModalOpen] = useState(false);
  const [connectionsInitialTab, setConnectionsInitialTab] = useState<"followers" | "following">("followers");
  const [networkingCounts, setNetworkingCounts] = useState({ followers: 0, following: 0 });
  const extendedProfile = profile as ExtendedProfile | null;
  const isOwner = !!user && (user.id === profile?.userId || user.documentId === documentId);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    photos: true,
    services: true,
    destinations: true,
    portfolio: true,
    operational: true,
    terms: true,
    certifications: true,
    testimonials: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalFields, setModalFields] = useState<any[]>([]);
  const [modalInitialData, setModalInitialData] = useState<any>({});
  const [onModalSave, setOnModalSave] = useState<(data: any) => Promise<void>>(() => async () => { });
  const [showMediaModal, setShowMediaModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (updates: any): Promise<void> => {
    if (!profile?.documentId) return;
    setSaving(true);
    try {
      // Data transformation for rich text fields if they are passed as strings
      const sanitizedUpdates = { ...updates };
      ['about', 'vision_mission'].forEach(key => {
        if (sanitizedUpdates[key] && typeof sanitizedUpdates[key] === 'string') {
          sanitizedUpdates[key] = [
            {
              type: "paragraph",
              children: [{ type: "text", text: sanitizedUpdates[key] }]
            }
          ];
        }
      });

      const updatedData = await updateUserProfile(profile.documentId, sanitizedUpdates);
      setProfile(updatedData);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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
    if (!openMenuPostId) return;

    const close = () => setOpenMenuPostId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenuPostId]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchNetworkingCounts(documentId);
    };

    window.addEventListener("networking:updated", handleUpdate);
    return () => window.removeEventListener("networking:updated", handleUpdate);
  }, [documentId]);

  const fetchUserPosts = async (userId: number) => {
    setLoadingPosts(true);

    try {
      let posts = await getPostsByUserId(userId);

      if (posts.length === 0) {
        const feed = await getTradeWallFeed(1, 100);
        posts = (feed?.data || []).filter((item) => item.userId === userId);
      }

      setUserPosts(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      setUserPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postDocumentId: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    setDeletingPostId(postDocumentId);

    try {
      await deletePost(postDocumentId);
      setUserPosts((current) => current.filter((item) => item.documentId !== postDocumentId));
    } catch (error: unknown) {
      console.error("Delete failed:", error);
      alert(error instanceof Error ? error.message : "Failed to delete post.");
    } finally {
      setDeletingPostId(null);
    }
  };

  const mediaGallery = useMemo<GalleryItem[]>(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

    return (profile?.image_sections || []).flatMap((section) =>
      (section.imageUrls || []).map((url) => ({
        url: url.startsWith("http") ? url : `${apiBase}${url}`,
        name: section.Title,
        mediaType: section.media_type,
      }))
    );
  }, [profile?.image_sections]);

  const photoGallery = mediaGallery.filter((item) => {
    const url = item.url.toLowerCase();
    return !url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/);
  });

  const heroGallery = photoGallery.slice(0, 3);
  const extraGalleryCount = Math.max(photoGallery.length - 3, 0);

  // Placeholder card images for sections where the API contract is not ready yet.
  const destinationCards = fallbackDestinations.map((item, index) => ({
    ...item,
    image: heroGallery[index]?.url || item.image,
  }));

  const socialLinks = [
    {
      key: "instagram",
      label: "Instagram",
      value: extendedProfile?.social_links?.instagram,
      bg: "bg-[#FDE8EF]",
      text: "text-[#D62976]",
    },
    {
      key: "facebook",
      label: "Facebook",
      value: extendedProfile?.social_links?.facebook,
      bg: "bg-[#E7F0FF]",
      text: "text-[#1877F2]",
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      value: extendedProfile?.social_links?.linkedin,
      bg: "bg-[#E8F4FD]",
      text: "text-[#0A66C2]",
    },
    {
      key: "pinterest",
      label: "Pinterest",
      value: extendedProfile?.social_links?.pinterest,
      bg: "bg-[#FDECEC]",
      text: "text-[#E60023]",
    },
    {
      key: "snapchat",
      label: "Snapchat",
      value: extendedProfile?.social_links?.snapchat,
      bg: "bg-[#FFF9D9]",
      text: "text-[#B99000]",
    },
    {
      key: "telegram",
      label: "Telegram",
      value: extendedProfile?.social_links?.telegram,
      bg: "bg-[#E8F7FD]",
      text: "text-[#229ED9]",
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      value: profile?.whatsapp ? `https://wa.me/${String(profile.whatsapp).replace(/\D/g, "")}` : "",
      bg: "bg-[#E9F9EF]",
      text: "text-[#25D366]",
    },
    {
      key: "twitter",
      label: "X",
      value: extendedProfile?.social_links?.twitter,
      bg: "bg-[#ECECEC]",
      text: "text-[#111111]",
    },
  ].filter((item) => item.value);

  const analyticsCards = [
    {
      label: "Followers",
      value: String(networkingCounts.followers),
      helper: "Live networking count",
    },
    {
      label: "Following",
      value: String(networkingCounts.following),
      helper: "Live networking count",
    },
    {
      label: "Tradewall Posts",
      value: loadingPosts ? "..." : String(userPosts.length),
      helper: "Fetched from current posts API",
    },
    {
      label: "Response Rate",
      value: `${Math.round((extendedProfile?.response_rate ?? 0) * 100)}%`,
      helper: "Static until the analytics payload expands",
    },
  ];
  useEffect(() => {
    const fetchProfile = async () => {
      if (!documentId) return;

      try {
        let data = await getProfileByDocumentId(documentId).catch(() => null);
        // Fallback: when viewing own profile, GET /me may succeed where GET /:documentId fails
        if (!data && user?.id) {
          const { ownProfile } = await getMyContexts();
          if (ownProfile?.documentId === documentId) data = ownProfile;
        }

        await fetchNetworkingCounts(documentId);

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
    };

    fetchProfile();
  }, [documentId, user?.id]);

  const handleMessageClick = async () => {
    if (!user?.id || !profile?.documentId) {
      router.push("/messages");
      return;
    }

    try {
      const thread = await getOrCreateDirectThread(profile.documentId);
      router.push(`/messages?convId=${thread.documentId}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
      router.push("/messages");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#6b2c91]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef] px-4">
        <div className="rounded-3xl border border-[#e2dbe9] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#21172d]">Profile Not Found</h1>
          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-full bg-[#6b2c91] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#572377]"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f2f1f6] pb-10">
        <div className="mx-auto max-w-[1320px] px-3 py-4 sm:px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px] md:mt-[90px] mt-[80px]">
            <main className="space-y-4 ">
              <section className="overflow-hidden rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.06)]">
                <div
                  className={`relative h-40 overflow-hidden sm:h-48 lg:h-56 ${profile.headerImageUrl ? "cursor-pointer" : ""}`}
                  onClick={() => { if (profile.headerImageUrl) { setPreviewImage(profile.headerImageUrl); } }}
                >
                  {profile.headerImageUrl ? (
                    <img
                      src={profile.headerImageUrl}
                      alt={`${profile.company_name} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#6b2c91] to-[#a34cb2]" />
                      <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.25)_0,rgba(255,255,255,0.25)_18%,transparent_19%),radial-gradient(circle_at_42%_-10%,rgba(255,255,255,0.15)_0,rgba(255,255,255,0.15)_22%,transparent_23%),radial-gradient(circle_at_75%_0,rgba(255,255,255,0.1)_0,rgba(255,255,255,0.1)_20%,transparent_21%)] opacity-80" />
                    </>
                  )}

                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file && profile?.documentId) {
                              const { updateHeaderImage } = await import("@/lib/profile");
                              await updateHeaderImage(profile.documentId, file);
                              window.location.reload();
                            }
                          };
                          input.click();
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#6b2c91] shadow-sm transition hover:bg-white"
                        aria-label="Change cover image"
                      >
                        <Pencil size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (profile.headerImageUrl) { setPreviewImage(profile.headerImageUrl); }
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#6b2c91] shadow-sm transition hover:bg-white"
                      aria-label="Preview cover image"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                </div>

                <div className="px-4 pb-5 sm:px-5 lg:px-6">
                  {/* Row 1: Avatar | Followers/Following | Action icons */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="-mt-8 flex flex-col gap-4 sm:-mt-10 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => { if (profile.profileImageUrl) { setPreviewImage(profile.profileImageUrl); } }}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white bg-[#f2edf6] shadow-md sm:h-24 sm:w-24 ${profile.profileImageUrl ? "cursor-pointer" : ""}`}
                      >
                        {profile.profileImageUrl ? (
                          <img src={profile.profileImageUrl} alt={profile.company_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-lg font-bold text-[#6b2c91]">
                            {getInitials(profile.company_name)}
                          </span>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-[#6b6176]">
                        <button
                          type="button"
                          onClick={() => {
                            setConnectionsInitialTab("followers");
                            setIsConnectionsModalOpen(true);
                          }}
                          className="transition hover:text-[#6b2c91]"
                        >
                          {networkingCounts.followers} Followers
                        </button>
                        <span className="h-1 w-1 rounded-full bg-[#8f7aa3]" />
                        <button
                          type="button"
                          onClick={() => {
                            setConnectionsInitialTab("following");
                            setIsConnectionsModalOpen(true);
                          }}
                          className="transition hover:text-[#6b2c91]"
                        >
                          {networkingCounts.following} Following
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => setIsContactModalOpen(true)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edf8] text-[#6b2c91] transition hover:bg-[#eadcf4]"
                        aria-label="View contact information"
                      >
                        <Phone size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleMessageClick}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edf8] text-[#6b2c91] transition hover:bg-[#eadcf4]"
                        aria-label="Send message"
                      >
                        <MessageCircleMore size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (navigator.share) { void navigator.share({ title: profile.company_name, url: window.location.href }); } }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f3edf8] text-[#6b2c91] transition hover:bg-[#eadcf4]"
                        aria-label="Share profile"
                      >
                        <Share2 size={16} />
                      </button>
                      <FollowButton targetProfileId={documentId} />
                      {!isOwner && (
                        <button
                          onClick={() => setIsInquiryModalOpen(true)}
                          className="rounded-full border border-[#dccfe8] px-4 py-2 text-sm font-medium text-[#4f425e] transition hover:border-[#6b2c91] hover:text-[#6b2c91]"
                        >
                          Enquiry
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Name, stars, type, location, description — below profile image; Edit icon next to name for owner */}
                  <div className="relative mt-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-semibold tracking-tight text-[#201627] sm:text-[2rem]">
                        {profile.company_name}
                      </h1>
                      {profile.verified_badge && (
                        <BadgeCheck className="text-[#1d72d8]" size={18} />
                      )}
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className={index < Math.round(Number(extendedProfile?.rating_average || 4)) ? "fill-[#f4cb53] text-[#f4cb53]" : "text-[#e1d8aa]"}
                        />
                      ))}
                      {isOwner && (
                        <button
                          onClick={() => {
                            setModalTitle("Edit Primary Identity");
                            setModalFields([
                              { key: "company_name", label: "Business Name", type: "text" },
                              { key: "business_type", label: "Business Type", type: "text" },
                              { key: "about", label: "About", type: "textarea" },
                            ]);
                            setModalInitialData({
                              company_name: profile.company_name,
                              business_type: profile.business_type,
                              about: richTextToString(profile.about),
                            });
                            setOnModalSave(() => handleUpdateProfile);
                            setIsEditModalOpen(true);
                          }}
                          className="p-2 text-[#6b2c91] transition hover:scale-110 hover:bg-[#f3edf8] rounded-full"
                          aria-label="Edit profile"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-[#7c7487]">{getBusinessTypeLabel(profile)}</p>
                    <p className="mt-1 text-sm text-[#7c7487]">
                      {getLocationLine(profile) || "Location details will be shown here"}
                    </p>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#36303f]">
                      {getProfileDescription(profile)}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-6 border-t border-[#ece7f1] pt-4">
                    {(Object.keys(tabLabelMap) as ProfileTab[]).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`relative pb-2 text-sm font-semibold transition ${activeTab === tab ? "text-[#1c1623]" : "text-[#72687f] hover:text-[#6b2c91]"
                          }`}
                      >
                        {tabLabelMap[tab]}
                        {activeTab === tab && (
                          <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#6b2c91]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {activeTab === "about" && (
                <>
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">About Property</h2>
                        {isOwner && (
                          <button
                            onClick={() => {
                              setModalTitle("Edit About");
                              setModalFields([{ key: "about", label: "About", type: "textarea" }]);
                              setModalInitialData({ about: richTextToString(profile.about) });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                      </div>
                      <ExternalLink size={18} className="text-[#6b2c91]" />
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#584f67]">{getProfileDescription(profile)}</p>

                    <div className="mt-6 rounded-2xl border border-[#ece7f1] bg-[#fdfcff] p-5">
                      <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="font-semibold text-[#201627]">Contact Person :</p>
                          <p className="mt-1 text-[#5f556b]">{profile.full_name || profile.company_name}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#201627]">Phone No. :</p>
                          <p className="mt-1 text-[#5f556b]">{profile.whatsapp || "91-XXXXXXXXXX"}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#201627]">E-mail ID :</p>
                          <p className="mt-1 break-all text-[#5f556b]">{profile.email}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-[#201627]">Website</p>
                          <a href={normalizeExternalUrl(profile.website)} target="_blank" rel="noreferrer" className="mt-1 block break-all text-[#6b2c91] hover:underline">
                            {profile.website || "www.company.com"}
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-semibold text-[#201627]">Social</h3>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {socialLinks.map((item) => (
                          <a
                            key={item.key}
                            href={normalizeExternalUrl(item.value)}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:-translate-y-1 ${item.bg} ${item.text}`}
                          >
                            <span className="text-xs font-bold">{item.label.slice(0, 1)}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("photos")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Photos</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setShowMediaModal(true); }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit photos"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.photos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); if (heroGallery[0]) { setPreviewImage(heroGallery[0].url); } }}
                        className="text-sm font-medium text-[#6b2c91] hover:underline"
                      >
                        View All
                      </button>
                    </div>

                    {expandedSections.photos && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {photoGallery.length > 0 ? (
                            photoGallery.slice(0, 3).map((item, index) => (
                              <div
                                key={index}
                                className="group relative aspect-[1.3/0.9] overflow-hidden rounded-2xl bg-[#f7f3f9] cursor-pointer"
                                onClick={() => setPreviewImage(item.url)}
                              >
                                <img src={item.url} alt={item.name || `Gallery ${index}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                                {index === 2 && extraGalleryCount > 0 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-bold text-white transition hover:bg-black/50">
                                    +{extraGalleryCount}
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            [
                              "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
                              "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2070&auto=format&fit=crop"
                            ].map((url, index) => (
                              <div
                                key={index}
                                className="group relative aspect-[1.3/0.9] overflow-hidden rounded-2xl bg-[#f7f3f9] cursor-pointer"
                                onClick={() => setPreviewImage(url)}
                              >
                                <img src={url} alt={`Gallery ${index}`} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                                {index === 2 && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-2xl font-bold text-white transition hover:bg-black/50">
                                    +13
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("services")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Services Offered</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTitle("Edit Services Offered");
                              setModalFields([
                                { key: "services", label: "Services (Add one by one)", type: "chips" }
                              ]);
                              setModalInitialData({ services: fallbackServices });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit services"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.services ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    {expandedSections.services && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <div className="flex flex-wrap gap-x-8 gap-y-4">
                          {fallbackServices.map((service) => (
                            <div key={service} className="inline-flex items-center gap-2 text-sm text-[#2f2838]">
                              <Check size={14} className="text-black" strokeWidth={3} />
                              <span>{service}</span>
                            </div>
                          ))}
                          <div className="inline-flex items-center gap-2 text-sm font-bold text-[#6b2c91]">
                            <Plus size={15} />
                            <span>9</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("destinations")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Destination Covered</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTitle("Edit Destinations Covered");
                              setModalFields([
                                { key: "destinations", label: "Destinations (Add one by one)", type: "chips" }
                              ]);
                              setModalInitialData({ destinations: fallbackDestinations.map(d => d.name) });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit destinations"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.destinations ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    {expandedSections.destinations && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {destinationCards.map((item, index) => (
                            <div key={item.name} className="relative aspect-[1.3/0.9] overflow-hidden rounded-2xl bg-[#f7f3f9]">
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-sm font-semibold text-white">
                                {item.name}
                              </div>
                              {index === 2 && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/35 text-2xl font-bold text-white">
                                  +13
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Product Portfolio */}
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("portfolio")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Product Portfolio</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTitle("Edit Product Portfolio");
                              setModalFields([
                                { key: "portfolio_summary", label: "Portfolio Summary", type: "textarea", placeholder: "General overview of your products..." }
                              ]);
                              setModalInitialData({ portfolio_summary: "" });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit portfolio"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.portfolio ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    {expandedSections.portfolio && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {fallbackPortfolio.map((item, idx) => (
                            <div key={idx} className="overflow-hidden rounded-2xl border border-[#ece7f1] bg-[#fdfcff] transition hover:shadow-md">
                              <img src={item.image} alt={item.title} className="aspect-[1.5/1] w-full object-cover" />
                              <div className="p-3">
                                <h4 className="text-sm font-bold text-[#201627]">{item.title}</h4>
                                <p className="mt-1 text-[11px] text-[#8b7b99]">{item.location}</p>
                                <p className="mt-2 text-xs leading-5 text-[#584f67] line-clamp-2">{item.description}</p>
                                <button className="mt-3 text-xs font-bold text-[#6b2c91] hover:underline">Read More..</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Operational Strength */}
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("operational")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Operational Strength</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTitle("Edit Operational Strength");
                              setModalFields([
                                { key: "strengths", label: "Strengths (Add one by one)", type: "chips" }
                              ]);
                              setModalInitialData({ strengths: operationalStrengths });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit operational strengths"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.operational ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    {expandedSections.operational && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <ul className="space-y-4">
                          {operationalStrengths.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-[#3d3249]">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>

                  {/* Trade Terms */}
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("terms")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Trade Terms</h2>
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalTitle("Edit Trade Terms");
                              setModalFields([
                                { key: "terms", label: "Trade Terms (Add one by one)", type: "chips" }
                              ]);
                              setModalInitialData({ terms: tradeTerms });
                              setOnModalSave(() => handleUpdateProfile);
                              setIsEditModalOpen(true);
                            }}
                            className="text-[#6b2c91] transition hover:scale-110"
                            aria-label="Edit trade terms"
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.terms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); /* View All action */ }}
                        className="text-sm font-medium text-[#6b2c91] hover:underline"
                      >
                        View All
                      </button>
                    </div>
                    {expandedSections.terms && (
                      <div className="border-t border-[#ece7f1] p-5">
                        <ul className="space-y-4">
                          {tradeTerms.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-[#3d3249]">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>

                  {/* Certification And Awards */}
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("certifications")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Certification And Awards</h2>
                        {isOwner && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); /* Add Certification action */ }}
                              className="text-[#6b2c91] transition hover:scale-110"
                              aria-label="Add certification"
                            >
                              <Plus size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalTitle("Edit Certifications Overview");
                                setModalFields([{ key: "cert_summary", label: "Certification Summary", type: "textarea" }]);
                                setModalInitialData({ cert_summary: "" });
                                setOnModalSave(() => handleUpdateProfile);
                                setIsEditModalOpen(true);
                              }}
                              className="text-[#6b2c91] transition hover:scale-110"
                              aria-label="Edit certifications"
                            >
                              <Pencil size={18} />
                            </button>
                          </div>
                        )}
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.certifications ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                      <div className="hidden items-center gap-2 sm:flex">
                        <span className="text-xs text-[#8b7b99]">Seen By Anyone</span>
                        <ChevronDown size={14} className="text-[#8b7b99]" />
                      </div>
                    </div>
                    {expandedSections.certifications && (
                      <div className="border-t border-[#ece7f1]">
                        {certifications.map((cert, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b border-[#ece7f1] p-5 last:border-0 transition hover:bg-[#fafafc]">
                            <div className="flex items-center gap-4">
                              <img src={cert.image} alt={cert.name} className="h-12 w-16 rounded object-cover border border-[#ece7f1]" />
                              <div>
                                <h4 className="text-sm font-bold text-[#201627]">{cert.name}</h4>
                                <p className="text-xs text-[#8b7b99]">{cert.company}</p>
                                <p className="mt-1 text-[11px] text-[#8b7b99]">Issued At : {cert.issued}</p>
                              </div>
                            </div>
                            <button className="rounded-md border border-[#cec2db] px-3 py-1.5 text-xs font-semibold text-[#6b2c91] transition hover:bg-[#6b2c91] hover:text-white">
                              View Certificate
                            </button>
                          </div>
                        ))}
                        <div className="p-4 text-center">
                          <button className="text-sm font-medium text-[#6b2c91] hover:underline">View All</button>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Testimonials */}
                  <section className="rounded-[20px] border border-[#ddd6e5] bg-white shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                    <div
                      onClick={() => toggleSection("testimonials")}
                      className="flex cursor-pointer select-none items-center justify-between p-5 transition-colors hover:bg-[#fafafc]"
                    >
                      <div className="flex items-center gap-4">
                        <h2 className="text-base font-semibold text-[#201627]">Testimonials</h2>
                        <span className="text-[#8b7a9f] transition hover:text-[#6b2c91]">
                          {expandedSections.testimonials ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </div>
                    </div>
                    {expandedSections.testimonials && (
                      <div className="border-t border-[#ece7f1]">
                        {testimonials.map((item, idx) => (
                          <div key={idx} className="border-b border-[#ece7f1] p-5 last:border-0 transition hover:bg-[#fafafc]">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-4">
                                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#f3edf8] border border-[#e5ddeb] overflow-hidden">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`} alt={item.name} />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-[#201627]">{item.name}</h4>
                                  <p className="text-xs text-[#8b7b99]">{item.role}</p>
                                  <p className="mt-2 text-sm leading-6 text-[#584f67]">{item.text}</p>
                                </div>
                              </div>
                              <span className="whitespace-nowrap text-xs text-[#8b7b99]">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {activeTab === "enquiries" && (
                <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-semibold text-[#201627]">My Enquires</h2>
                      <p className="mt-1 text-sm text-[#7c7487]">
                        The redesigned enquiry feed is pending a larger API payload. Current CTA is still connected.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsInquiryModalOpen(true)}
                      className="rounded-full bg-[#6b2c91] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#572377]"
                    >
                      Open Enquiry
                    </button>
                  </div>

                  <div className="mt-5 rounded-2xl border border-dashed border-[#dccfe8] bg-[#faf8fc] px-4 py-10 text-center">
                    <p className="text-sm font-medium text-[#3e334a]">Enquiry cards will be added in the next design iteration.</p>
                    <p className="mt-2 text-sm text-[#7c7487]">
                      For now the existing enquiry modal remains functional, and this panel is intentionally static.
                    </p>
                  </div>
                </section>
              )}

              {activeTab === "analytics" && (
                <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#6b2c91]" />
                    <h2 className="text-base font-semibold text-[#201627]">Analytics</h2>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {analyticsCards.map((item) => (
                      <div key={item.label} className="rounded-2xl border border-[#e7deef] bg-[#faf8fc] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b7b99]">{item.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-[#201627]">{item.value}</p>
                        <p className="mt-2 text-sm text-[#6f657a]">{item.helper}</p>
                      </div>
                    ))}
                  </div>

                  {userPosts.length > 0 && (
                    <div className="mt-6 rounded-2xl border border-[#e7deef] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-[#201627]">Recent Tradewall Posts</h3>
                        <span className="text-xs text-[#8b7b99]">Existing data binding</span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {userPosts.slice(0, 3).map((post) => (
                          <div key={post.documentId} className="rounded-2xl border border-[#f0ebf5] bg-[#fcfbfd] p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-[#201627]">
                                  {post.title || post.user_profile?.company_name || "Tradewall Post"}
                                </p>
                                <p className="mt-1 text-xs text-[#8b7b99]">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setOpenMenuPostId(openMenuPostId === post.documentId ? null : post.documentId);
                                  }}
                                  className="rounded-full p-2 text-[#7c7487] transition hover:bg-[#f2edf6]"
                                  aria-label="Post actions"
                                >
                                  <span className="block h-1 w-1 rounded-full bg-current" />
                                  <span className="mt-1 block h-1 w-1 rounded-full bg-current" />
                                  <span className="mt-1 block h-1 w-1 rounded-full bg-current" />
                                </button>

                                {openMenuPostId === post.documentId && (
                                  <div
                                    className="absolute right-0 top-10 z-20 min-w-32 overflow-hidden rounded-2xl border border-[#e7deef] bg-white shadow-lg"
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => {
                                        setOpenMenuPostId(null);
                                        router.push(`/?editPost=${post.documentId}`);
                                      }}
                                      className="block w-full px-4 py-2 text-left text-sm text-[#3d3249] transition hover:bg-[#f6f1fa]"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => {
                                        setOpenMenuPostId(null);
                                        handleDeletePost(post.documentId);
                                      }}
                                      disabled={deletingPostId === post.documentId}
                                      className="block w-full px-4 py-2 text-left text-sm text-[#b42318] transition hover:bg-[#fff1f1] disabled:opacity-60"
                                    >
                                      {deletingPostId === post.documentId ? "Deleting..." : "Delete"}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <p className="mt-3 text-sm leading-6 text-[#544a60]">
                              {post.description ||
                                (Array.isArray(post.content)
                                  ? post.content
                                    .map((block: PostContentBlock) => block.children?.map((child) => child.text || "").join(" "))
                                    .join(" ")
                                  : typeof post.content === "string"
                                    ? post.content
                                    : "No description available.")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </main>

            <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
              <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                <h3 className="text-sm font-bold text-[#6b2c91] uppercase tracking-wider">Trending Now!</h3>
                <div className="mt-5 space-y-4">
                  {trendingItems.map((item) => (
                    <div key={item.topic} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-[#3d3249]">{item.topic}</span>
                      <div className="flex items-center gap-1.5 font-bold text-[#289c42]">
                        <TrendingUp size={14} />
                        <span className="text-xs">+{item.growth}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#6b2c91] uppercase tracking-wider">Suggested Connections</h3>
                  <ChevronRight size={16} className="text-[#8b7b99]" />
                </div>
                <div className="mt-5 space-y-5">
                  {suggestedConnections.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ece7f1] bg-[#fdfcff] text-xs font-bold text-[#6b2c91]">
                          <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${item.name}`} className="rounded-full" alt="" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#201627]">{item.name}</p>
                          <p className="truncate text-[10px] text-[#8b7b99]">{item.mutual}</p>
                        </div>
                      </div>
                      <button className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#cec2db] text-[#6b2c91] transition hover:bg-[#6b2c91] hover:text-white">
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[20px] border border-[#ddd6e5] bg-white p-5 shadow-[0_8px_28px_rgba(49,27,63,0.05)]">
                <h3 className="text-sm font-bold text-[#6b2c91] uppercase tracking-wider">Popular Insights</h3>
                <div className="mt-5 overflow-hidden rounded-2xl border border-[#ece7f1]">
                  <div className="relative aspect-[1.1/0.9] cursor-pointer group">
                    <img src="/global-travel-network/travel_block.png" alt="Insights" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1230]/85 via-[#1a1230]/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1d72d8]">
                          <Globe size={12} />
                        </span>
                        <span>ABC Holiday&apos;s</span>
                        <BadgeCheck size={12} className="text-blue-400" />
                        <ExternalLink size={12} className="ml-auto opacity-70" />
                      </div>
                      <p className="mt-3 text-sm font-bold leading-5">
                        Inspire your next creative video campaign with destination storytelling.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>

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

        <MediaModal
          isOpen={showMediaModal}
          onClose={() => setShowMediaModal(false)}
          currentSections={profile?.image_sections || []}
          onSave={async (newSections) => {
            if (!profile?.documentId) return;
            setSaving(true);
            try {
              await updateImageSections(profile.documentId, newSections);
              const data = await getProfileByDocumentId(profile.documentId);
              if (data) setProfile(data);
              setShowMediaModal(false);
            } catch (error) {
              console.error("Error updating gallery:", error);
              alert("Failed to update gallery");
            } finally {
              setSaving(false);
            }
          }}
        />

        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={modalTitle}
          fields={modalFields}
          initialData={modalInitialData}
          onSave={onModalSave}
        />

        {previewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-12 right-0 text-4xl text-white transition hover:scale-110"
                aria-label="Close preview"
              >
                ×
              </button>
              <img src={previewImage} alt="Preview" className="max-h-[85vh] w-full rounded-2xl bg-black object-contain" />
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}




