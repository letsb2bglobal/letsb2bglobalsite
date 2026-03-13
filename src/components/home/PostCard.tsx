"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  Bookmark,
  MoreVertical,
  Share2,
  MapPin,
  Users,
  BedDouble,
  Loader2,
  Check,
  MessageCircle,
  CheckCircle,
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

// Helper to get avatar background color
const getAvatarColor = (name: string) => {
  const colors = [
    "#6B3FA0",
    "#2196F3",
    "#E91E63",
    "#4CAF50",
    "#FF9800",
    "#00BCD4",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

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
    if (currentUserProfileId === authorProfileNumericId) return;

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

  const isOwnPost =
    currentUserProfileId &&
    authorProfileNumericId &&
    currentUserProfileId === authorProfileNumericId;

  const handleCardClick = () => {
    if (authorProfileId) {
      router.push(`/profile/${authorProfileId}`);
    }
  };

  // Format type for display
  const getTypeLabel = (t: string) => {
    const labels: Record<string, string> = {
      accommodation: "Accommodation",
      tours: "Tours",
      transportation: "Transportation",
      mice: "MICE",
      medical_tourism: "Medical Tourism",
    };
    return labels[t] || t;
  };

  // Get type badge background color
  const getTypeBgColor = (t: string) => {
    const colors: Record<string, string> = {
      accommodation: "#2E9021",
      tours: "#DBA104",
      transportation: "#42B7EB",
      mice: "#2196F3",
      medical_tourism: "#AB71EF",
    };
    return colors[t] || "#2196F3";
  };

  // Get guests display string based on post type
  const getGuestsDisplay = () => {
    if (guests) return guests;
    
    // For accommodation and tours
    if (details?.adults !== undefined && details?.adults !== null) {
      const parts = [];
      parts.push(`${details.adults} Adult${details.adults > 1 ? "s" : ""}`);
      if (details.children !== undefined && details.children !== null && details.children > 0) {
        parts.push(`${details.children} Children`);
      }
      return parts.join(" | ");
    }
    
    // For transportation
    if (details?.passengers) {
      return `${details.passengers} Passenger${details.passengers > 1 ? "s" : ""}`;
    }
    
    // For medical tourism
    if (details?.patients) {
      const parts = [`${details.patients} Patient${details.patients > 1 ? "s" : ""}`];
      if (details.attendants) {
        parts.push(`${details.attendants} Attendant${details.attendants > 1 ? "s" : ""}`);
      }
      return parts.join(" | ");
    }
    
    // For MICE
    if (details?.participants) {
      return `${details.participants} Participant${details.participants > 1 ? "s" : ""}`;
    }
    
    return null;
  };

  // Get rooms display
  const getRoomsDisplay = () => {
    if (details?.rooms) {
      const roomCategory = details.roomCategory 
        ? details.roomCategory.charAt(0).toUpperCase() + details.roomCategory.slice(1) 
        : "Deluxe";
      return `${details.rooms} ${roomCategory} Room${details.rooms > 1 ? "s" : ""}`;
    }
    return null;
  };

  // Get additional info based on type
  const getAdditionalInfo = () => {
    const info: string[] = [];
    
    // Star category
    if (details?.starCategory) {
      const stars = details.starCategory.replace("star", " Star");
      info.push(stars);
    }
    
    // Meal plan
    if (details?.mealPlan) {
      info.push(details.mealPlan);
    }
    
    // Tour type and format
    if (details?.tourType) {
      const formatted = details.tourType.charAt(0).toUpperCase() + details.tourType.slice(1);
      info.push(`${formatted} Tour`);
    }
    
    // Service type for transportation
    if (details?.serviceType && type === "transportation") {
      const formatted = details.serviceType.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
      info.push(formatted);
    }
    
    // Vehicle type
    if (details?.vehicleType) {
      const formatted = details.vehicleType.charAt(0).toUpperCase() + details.vehicleType.slice(1);
      info.push(formatted);
    }
    
    // Event type for MICE
    if (details?.eventType) {
      const formatted = details.eventType.charAt(0).toUpperCase() + details.eventType.slice(1);
      info.push(`${formatted} Event`);
    }
    
    // Treatment category for medical
    if (details?.treatmentCategory) {
      const formatted = details.treatmentCategory.charAt(0).toUpperCase() + details.treatmentCategory.slice(1);
      info.push(formatted);
    }
    
    return info;
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-gray-100 flex flex-col gap-3 md:gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          {/* Avatar */}
          <div
            className="w-10 h-10 md:w-11 md:h-11 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center shrink-0"
            style={{
              backgroundColor: author.avatar
                ? "transparent"
                : getAvatarColor(author.name),
            }}
          >
            {author.avatar ? (
              <img
                src={author.avatar}
                alt={author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-white">
                {author.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[13px] md:text-[18px] font-medium text-[#000000] truncate">
                {author.name}
              </span>
              {/* Follow/Following Button */}
              {!isOwnPost && (
                <>
                  {isFollowing ? (
                    <button
                      onClick={handleUnfollow}
                      disabled={followLoading}
                      className="flex items-center gap-1 text-[12px] md:text-[14px] font-medium text-[#0095F6] hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {followLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} strokeWidth={3} />
                      )}
                      <span>Following</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleFollow}
                      disabled={followLoading}
                      className="flex items-center gap-1 text-[12px] md:text-[14px] font-medium text-[#0095F6] hover:text-[#0077CC] transition-colors disabled:opacity-50"
                    >
                      {followLoading ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span>+ Follow</span>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            <span className="text-[11px] md:text-[12px] text-[#000000]">
              {time}
            </span>
          </div>
        </div>

        {/* Right side - Type badge and actions */}
        <div className="flex items-center gap-1 md:gap-2 shrink-0">
          {type && (
            <span 
              className="px-2 md:px-3 py-1 text-white text-[10px] md:text-[12px] font-medium rounded-full"
              style={{ backgroundColor: getTypeBgColor(type) }}
            >
              {getTypeLabel(type)}
            </span>
          )}
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
          >
            <Bookmark size={18} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-[14px] md:text-[18px] font-medium text-[#000000]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[12px] md:text-[14px] text-gray-600 leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      {/* Check-in / Check-out dates - Accommodation & Tours */}
      {(details?.checkIn || details?.checkOut) && (
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[12px] md:text-[14px]">
          {details.checkIn && (
            <div className="flex items-center gap-1.5">
              <Image
                src="assets/icons/location-green.svg"
                alt="location"
                width={11}
                height={11}
              />
              <span className="text-gray-500">Check-in:</span>
              <span className="font-semibold text-gray-900">
                {details.checkIn}
              </span>
              {details.checkInTime && (
                <span className="text-gray-600">{details.checkInTime}</span>
              )}
            </div>
          )}
          {details.checkOut && (
            <div className="flex items-center gap-1.5">
              <Image
                src="assets/icons/location-red.svg"
                alt="location"
                width={11}
                height={11}
              />
              <span className="text-gray-500">Check-out:</span>
              <span className="font-semibold text-gray-900">
                {details.checkOut}
              </span>
              {details.checkOutTime && (
                <span className="text-gray-600">{details.checkOutTime}</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Start / End dates - MICE */}
      {(details?.startDate || details?.endDate) && (
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[12px] md:text-[14px]">
          {details.startDate && (
            <div className="flex items-center gap-1.5">
              <Image
                src="assets/icons/location-green.svg"
                alt="location"
                width={11}
                height={11}
              />
              <span className="text-gray-500">Start Date:</span>
              <span className="font-semibold text-gray-900">
                {details.startDate}
              </span>
            </div>
          )}
          {details.endDate && (
            <div className="flex items-center gap-1.5">
              <Image
                src="assets/icons/location-red.svg"
                alt="location"
                width={11}
                height={11}
              />
              <span className="text-gray-500">End Date:</span>
              <span className="font-semibold text-gray-900">
                {details.endDate}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Date & Time - Transportation */}
      {details?.dateTime && (
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-[12px] md:text-[14px]">
          <div className="flex items-center gap-1.5">
            <Image
              src="assets/icons/location-green.svg"
              alt="location"
              width={11}
              height={11}
            />
            <span className="text-gray-500">Date & Time:</span>
            <span className="font-semibold text-gray-900">
              {new Date(details.dateTime).toLocaleString('en-IN', { 
                dateStyle: 'medium', 
                timeStyle: 'short' 
              })}
            </span>
          </div>
        </div>
      )}

      {/* Info Row - Location, Guests, Rooms, Additional Info */}
      {(location || getGuestsDisplay() || getRoomsDisplay() || details?.luggage) && (
        <div className="flex flex-wrap items-center gap-3 md:gap-0 md:divide-x md:divide-gray-200 text-[12px] md:text-[14px] text-gray-600 py-2 border-y border-gray-100">
          {location && (
            <div className="flex items-center gap-1.5 md:pr-4">
              <MapPin size={14} className="text-gray-400" />
              <span>{location}</span>
            </div>
          )}
          {getGuestsDisplay() && (
            <div className="flex items-center gap-1.5 md:px-4">
              <Users size={14} className="text-gray-400" />
              <span>{getGuestsDisplay()}</span>
            </div>
          )}
          {getRoomsDisplay() && (
            <div className="flex items-center gap-1.5 md:px-4">
              <BedDouble size={14} className="text-gray-400" />
              <span>{getRoomsDisplay()}</span>
            </div>
          )}
          {details?.luggage && (
            <div className="flex items-center gap-1.5 md:pl-4">
              <span>🧳</span>
              <span>{details.luggage} Luggage</span>
            </div>
          )}
        </div>
      )}

      {/* Additional Info Row - Star Category, Meal Plan, Tour Type, etc. */}
      {getAdditionalInfo().length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] md:text-[13px]">
          {getAdditionalInfo().map((info, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-50 text-[#006DCB] font-medium rounded-md"
            >
              {info}
            </span>
          ))}
        </div>
      )}

      {/* Special Preferences Section */}
      {details?.preferences && details.preferences.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Special Preferences
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.preferences.map((pref: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000 ]" />
                <span>{pref}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inclusions Section */}
      {details?.inclusions && details.inclusions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Inclusions
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.inclusions.map((inc: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{inc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Instructions - Transportation */}
      {details?.specialInstructions && details.specialInstructions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Special Instructions
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.specialInstructions.map((instruction: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Additional Services - Medical Tourism */}
      {details?.additionalServices && details.additionalServices.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Additional Services Required
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.additionalServices.map((service: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline - Medical Tourism */}
      {details?.timeline && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Timeline
          </span>
          <div className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]">
            <CheckCircle size={14} className="text-[#000000]" />
            <span className="capitalize">{details.timeline}</span>
          </div>
        </div>
      )}

      {/* Venue Requirements - MICE */}
      {details?.venueRequirements && details.venueRequirements.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Venue Requirements
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.venueRequirements.map((req: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Requirements - MICE */}
      {details?.technicalRequirements && details.technicalRequirements.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Technical Support
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.technicalRequirements.map((req: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Food & Beverage - MICE */}
      {details?.foodAndBeverage && details.foodAndBeverage.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Food & Beverage
          </span>
          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2">
            {details.foodAndBeverage.map((item: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]"
              >
                <CheckCircle size={14} className="text-[#000000]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Status - MICE */}
      {details?.decisionStatus && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] md:text-[15px] font-medium text-[#006DCB]">
            Decision Status
          </span>
          <div className="flex items-center gap-1.5 text-[11px] md:text-[15px] text-[#000000]">
            <CheckCircle size={14} className="text-[#000000]" />
            <span className="capitalize">{details.decisionStatus}</span>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-0.5 bg-gray-100 text-[#000000] text-[11px] md:text-[12px] font-medium rounded-full border border-gray-200"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Media Items */}
      {mediaItems && mediaItems.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {mediaItems.map((item, idx) => (
            <div
              key={idx}
              className="flex-none w-[200px] md:w-[240px] rounded-xl overflow-hidden bg-gray-100 aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {item.type === "videos" || item.mime?.startsWith("video/") ? (
                <video
                  src={item.url}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={item.url}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://placehold.co/400x225/f6f2f8/6B3FA0?text=LetsB2B";
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fallback single image */}
      {!mediaItems?.length && imageUrl && (
        <div className="rounded-xl overflow-hidden bg-gray-100 aspect-video max-w-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/400x225/f6f2f8/6B3FA0?text=LetsB2B";
            }}
          />
        </div>
      )}

      {/* Footer - Budget and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 mt-1">
        <div className="flex items-center justify-center gap-3 md:gap-4 text-center">
          {budget && budget.amount > 0 && (
            <div className="flex items-center justify-center gap-1 text-[12px] md:text-[17px]">
              <span className="text-[#000000]">Budget range : </span>
              <span className="font-medium text-[#E91E63] text-[22px]">
                {budget.currency === "INR" ? "₹" : budget.currency}
                {budget.amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={handleRespond}
            disabled={responding}
            className="flex items-center gap-1.5 bg-[#6B3FA0] text-white px-4 md:px-5 py-1 md:py-1 rounded-lg text-[12px] md:text-[14px] hover:bg-[#5a3590] transition-colors disabled:opacity-70"
          >
            {responding ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MessageCircle size={14} />
            )}
            <span>{responding ? "..." : "Respond"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
