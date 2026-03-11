"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  MoreHorizontal,
  Share2,
  MapPin,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  Info,
  Building2,
  Ticket,
  Briefcase,
  Car,
  Luggage,
  Stethoscope,
  HeartPulse,
  Activity,
  Loader2,
  Check,
  UserPlus,
} from "lucide-react";
import { createEnquiryThread } from "@/lib/enquiry";
import { useToast } from "@/components/Toast";
import { followUser, unfollowUser } from "@/lib/connections";

interface PostCardProps {
  author: {
    name: string;
    avatar: string;
    isFollowing: boolean;
  };
  time: string;
  title: string;
  description: string;
  type?: string;
  details?: any;
  imageUrl?: string;
  location?: string;
  date?: string;
  guests?: string;
  tags?: string[];
  budget?: {
    amount: number;
    currency: string;
    budgetType: string;
  };
  mediaItems?: any[];
  postDocumentId?: string;
  authorProfileId?: string;
  authorProfileNumericId?: number;
  currentUserProfileId?: number;
  connectionDocumentId?: string;
  onFollowChange?: (
    authorProfileId: string,
    isFollowing: boolean,
    connectionDocId?: string,
  ) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  author,
  time,
  title,
  description,
  type,
  details,
  imageUrl,
  location,
  date,
  guests,
  tags,
  budget,
  mediaItems,
  postDocumentId,
  authorProfileId,
  authorProfileNumericId,
  currentUserProfileId,
  connectionDocumentId,
  onFollowChange,
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [responding, setResponding] = useState(false);
  const [isFollowing, setIsFollowing] = useState(author.isFollowing);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentConnectionId, setCurrentConnectionId] =
    useState(connectionDocumentId);

  const handleRespond = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authorProfileId) {
      showToast("Cannot respond to this partner at the moment.", "error");
      return;
    }

    setResponding(true);
    try {
      // Step A: Create the Thread with 'enquiry' type as per guide
      const thread = await createEnquiryThread(
        authorProfileId,
        `Enquiry: ${title}`,
        "enquiry",
      );
      if (thread && thread.documentId) {
        router.push(`/enquiries?threadId=${thread.documentId}`);
      }
    } catch (error: any) {
      console.error("Error creating thread:", error);
      showToast(error.message || "Failed to initiate conversation", "error");
    } finally {
      setResponding(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentUserProfileId || !authorProfileNumericId) {
      showToast("Unable to follow at this time", "error");
      return;
    }

    // Don't allow following yourself
    if (currentUserProfileId === authorProfileNumericId) {
      return;
    }

    setFollowLoading(true);
    try {
      const connection = await followUser(
        currentUserProfileId,
        authorProfileNumericId,
      );
      setIsFollowing(true);
      setCurrentConnectionId(connection.documentId);
      showToast("Follow request sent!", "success");

      if (onFollowChange && authorProfileId) {
        onFollowChange(authorProfileId, true, connection.documentId);
      }
    } catch (error: any) {
      console.error("Error following user:", error);
      showToast(error.message || "Failed to follow user", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!currentConnectionId) {
      showToast("Unable to unfollow at this time", "error");
      return;
    }

    setFollowLoading(true);
    try {
      await unfollowUser(currentConnectionId);
      setIsFollowing(false);
      setCurrentConnectionId(undefined);
      showToast("Unfollowed successfully", "success");

      if (onFollowChange && authorProfileId) {
        onFollowChange(authorProfileId, false, undefined);
      }
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      showToast(error.message || "Failed to unfollow user", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  // Check if this is the current user's own post
  const isOwnPost =
    currentUserProfileId &&
    authorProfileNumericId &&
    currentUserProfileId === authorProfileNumericId;

  // const handleCardClick = () => {
  //   console.log("Clicking post:", title, "-> Post Document ID:", postDocumentId);
  //   if (postDocumentId) {
  //     router.push(`/profile/${postDocumentId}`);
  //   }
  // };

  const handleCardClick = () => {
    console.log("Opening profile:", authorProfileId);

    if (authorProfileId) {
      router.push(`/profile/${authorProfileId}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center font-bold text-gray-400">
            {author.name.substring(0, 1)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-900">
                {author.name}
              </span>
              {/* Follow/Following Button - Don't show for own posts */}
              {!isOwnPost && (
                <>
                  {isFollowing ? (
                    <button
                      onClick={handleUnfollow}
                      disabled={followLoading}
                      className="flex items-center gap-1 text-[14px] font-semibold text-[#006DCB] hover:text-red-500 transition-colors disabled:opacity-50"
                      title="Click to unfollow"
                    >
                      {followLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} strokeWidth={3} />
                      )}
                      <span>{followLoading ? "..." : "Following"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className="flex items-center gap-1 text-[14px] font-semibold text-[#006DCB] hover:text-[#5a3590] transition-colors disabled:opacity-50"
                    >
                      {followLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <UserPlus size={14} />
                      )}
                      <span>{followLoading ? "..." : "Follow"}</span>
                    </button>
                  )}
                </>
              )}
            </div>
            <span className="text-[10px] text-gray-500 font-medium">
              {time}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Type Badge */}
          {type && (
            <span className="px-3 py-1.5 bg-[#2196F3] text-white text-[11px] font-semibold rounded-md capitalize">
              {type === "medical_tourism" ? "Medical Tourism" : type}
            </span>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-[#6B3FA0] hover:bg-[#f6f2f8] rounded-full transition-all"
          >
            <Bookmark size={18} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-[#6B3FA0] hover:bg-[#f6f2f8] rounded-full transition-all"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 leading-snug">
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 leading-relaxed font-medium">
        {description}
      </p>

      {/* Media Rendering */}
      {mediaItems && mediaItems.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory -mx-2 px-2 scrollbar-thin scrollbar-thumb-purple-200">
          {mediaItems.map((item, idx) => (
            <div
              key={idx}
              className="flex-none shrink-0 w-[82%] sm:w-[68%] lg:w-[55%] rounded-[20px] overflow-hidden bg-[#faf8fc] aspect-[16/10] relative group/media border border-purple-50 shadow-sm transition-all hover:shadow-md snap-start"
            >
              {item.type === "videos" || item.mime?.startsWith("video/") ? (
                <video
                  src={item.url}
                  controls
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full object-cover"
                />
              ) : item.type === "documents" ||
                item.mime === "application/pdf" ||
                item.url?.endsWith(".pdf") ||
                item.url?.endsWith(".xlsx") ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 gap-3">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                    <FileText size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-gray-900 truncate max-w-[180px]">
                      {item.name || "document.pdf"}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {item.size
                        ? `${(item.size / 1024).toFixed(1)} KB`
                        : "PDF Document"}
                    </p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-indigo-100"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/media:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/600x400/f6f2f8/6B3FA0?text=LetsB2B";
                  }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        imageUrl && (
          <div className="rounded-[20px] overflow-hidden bg-gray-50 aspect-[21/9] relative group/img border border-gray-100 shadow-sm">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x400/f6f2f8/6B3FA0?text=LetsB2B";
              }}
            />
          </div>
        )
      )}

      {/* Specification Row - Conditional based on type */}
      {details && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#fbf9ff] rounded-[20px] border border-purple-50">
          {/* Common Fields */}
          {(type === "accommodation" ||
            type === "medical" ||
            type === "medical_tourism") &&
            details.propertyType && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <Building2 size={12} className="text-[#6B3FA0]" /> Property
                </span>
                <span className="text-xs font-black text-gray-800 capitalize leading-none">
                  {details.propertyType}
                </span>
              </div>
            )}
          {(type === "medical" || type === "medical_tourism") &&
            details.treatmentCategory && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <Stethoscope size={12} className="text-[#6B3FA0]" /> Treatment
                </span>
                <span className="text-xs font-black text-gray-800 capitalize leading-none">
                  {details.treatmentCategory}
                </span>
              </div>
            )}
          {type === "mice" && details.eventType && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Ticket size={12} className="text-[#6B3FA0]" /> Event Type
              </span>
              <span className="text-xs font-black text-gray-800 capitalize leading-none">
                {details.eventType}
              </span>
            </div>
          )}
          {type === "tours" && details.tourType && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <MapPin size={12} className="text-[#6B3FA0]" /> Tour Type
              </span>
              <span className="text-xs font-black text-gray-800 capitalize leading-none">
                {details.tourType} ({details.tourFormat || "N/A"})
              </span>
            </div>
          )}
          {type === "transportation" && details.serviceType && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Car size={12} className="text-[#6B3FA0]" /> Service
              </span>
              <span className="text-xs font-black text-gray-800 capitalize leading-none">
                {details.serviceType.replace("_", " ")}
              </span>
            </div>
          )}
          {type === "transportation" && details.vehicleType && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Car size={12} className="text-[#6B3FA0]" /> Vehicle
              </span>
              <span className="text-xs font-black text-gray-800 capitalize leading-none">
                {details.vehicleType}
              </span>
            </div>
          )}
          {(type === "medical" || type === "medical_tourism") &&
            details.serviceType && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  <HeartPulse size={12} className="text-[#6B3FA0]" /> Service
                </span>
                <span className="text-xs font-black text-gray-800 capitalize leading-none">
                  {details.serviceType}
                </span>
              </div>
            )}

          {/* Scale Fields */}
          {details.rooms && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Rooms
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.rooms} Unit(s)
              </span>
            </div>
          )}
          {details.participants && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Attendance
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.participants} PAX
              </span>
            </div>
          )}
          {details.passengers && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Users size={12} className="text-[#6B3FA0]" /> Passengers
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.passengers} PAX
              </span>
            </div>
          )}
          {details.patients && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Activity size={12} className="text-[#6B3FA0]" /> Patients
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.patients} PAX
              </span>
            </div>
          )}
          {details.attendants && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Attendants
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.attendants} PAX
              </span>
            </div>
          )}
          {details.timeline && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Timeline
              </span>
              <span className="text-xs font-black text-gray-800 leading-none capitalize">
                {details.timeline}
              </span>
            </div>
          )}
          {details.luggage && (
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                <Luggage size={12} className="text-[#6B3FA0]" /> Luggage
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.luggage} Bag(s)
              </span>
            </div>
          )}
          {details.starCategory && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Category
              </span>
              <span className="text-xs font-black text-amber-500 leading-none">
                {details.starCategory} Star
              </span>
            </div>
          )}
          {details.mealPlan && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Meal Plan
              </span>
              <span className="text-xs font-black text-gray-800 leading-none">
                {details.mealPlan}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Preferences / Tags Section */}
      {tags?.length ||
      details?.preferences?.length ||
      details?.inclusions?.length ||
      details?.specialInstructions?.length ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {/* Preferences and Inclusions render as distinct pills */}
          {Array.isArray(details?.preferences) &&
            details.preferences.map((p: string, i: number) => (
              <span
                key={`p-${i}`}
                className="px-3 py-1 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-green-100 flex items-center gap-1"
              >
                <CheckCircle2 size={10} /> {p}
              </span>
            ))}
          {Array.isArray(details?.inclusions) &&
            details.inclusions.map((inc: string, i: number) => (
              <span
                key={`inc-${i}`}
                className="px-3 py-1 bg-blue-50 text-blue-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-blue-100 flex items-center gap-1"
              >
                <Briefcase size={10} /> {inc}
              </span>
            ))}
          {Array.isArray(details?.specialInstructions) &&
            details.specialInstructions.map((si: string, i: number) => (
              <span
                key={`si-${i}`}
                className="px-3 py-1 bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-amber-100 flex items-center gap-1"
              >
                <Info size={10} /> {si}
              </span>
            ))}
          {Array.isArray(details?.additionalServices) &&
            details.additionalServices.map((as: string, i: number) => (
              <span
                key={`as-${i}`}
                className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-lg border border-indigo-100 flex items-center gap-1"
              >
                <Activity size={10} /> {as}
              </span>
            ))}
          {tags &&
            tags.map((tag, i) => (
              <span
                key={`tag-${i}`}
                className="px-3 py-1 bg-[#f6f2f8] text-[#6B3FA0] text-[9px] font-black uppercase tracking-wider rounded-lg border border-purple-50"
              >
                #{tag.trim()}
              </span>
            ))}
        </div>
      ) : null}

      {/* Footer Info Hub */}
      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 py-4 border-t border-gray-100 mt-2">
        {location && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-[#6B3FA0]">
              <MapPin size={14} />
            </div>
            <span className="text-xs font-black text-gray-900">{location}</span>
          </div>
        )}
        {date && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Calendar size={14} />
            </div>
            <span className="text-xs font-black text-gray-900">{date}</span>
          </div>
        )}
        {guests && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users size={14} />
            </div>
            <span className="text-xs font-black text-gray-900">{guests}</span>
          </div>
        )}
      </div>
      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-gray-500 hover:text-[#6B3FA0] transition-colors font-black text-[10px] uppercase tracking-[0.1em]"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
          {budget && budget.amount > 0 && (
            <div className="flex flex-col border-l border-gray-100 sm:pl-6">
              <span className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                Budget
              </span>
              <span className="text-sm font-black text-[#6B3FA0]">
                {budget.currency} {budget.amount.toLocaleString()}
                <span className="text-[10px] text-gray-400 ml-1 font-bold italic">
                  / {budget.budgetType?.replace("per", "")}
                </span>
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleRespond}
          disabled={responding}
          className="bg-[#6B3FA0] text-white sm:px-10 px-4 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all flex items-center gap-1 shadow-xl shadow-purple-100 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {responding ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {/* <span>{responding ? 'Connecting...' : 'Respond'}</span> */}
          <span>{responding ? "Sending.." : "Respond"}</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
