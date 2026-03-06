"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Info,
  Building2,
  ShieldCheck,
  ChevronsRight,
  MapPin,
  LayoutDashboard,
  Handshake,
  User,
  Mail,
  Bookmark,
  Clock,
  Network,
} from "lucide-react";
import { UserProfile } from "@/lib/profile";
import Image from "next/image"
interface ProgressCardProps {
  profile?: UserProfile | null;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ profile }) => {
  // Simple progress calculation
  const getProgress = () => {
    if (!profile) return 0;
    let points = 0;
    if (profile.company_name) points += 25;
    if (profile.business_type?.length) points += 25;
    if (profile.city) points += 25;
    if (profile.profileImageUrl) points += 25;
    return points;
  };

  const progress = getProgress();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-[#f6f2f8]"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={126}
              strokeDashoffset={126 - (126 * progress) / 100}
              className="text-[#6B3FA0] transition-all duration-1000"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-[#6B3FA0]">
            {progress}%
          </span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-gray-800">Complete Profile</h3>
          <span className="text-[10px] text-gray-400 font-medium">
            Stand out in the market
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-0">
        <PendingItem
          icon={
            profile?.company_name ? (
              <Image
                src="/assets/icons/green-verify.svg"
                alt="verified"
                width={18}
                height={18}
              />
            ) : (
              <Info size={18} />
            )
          }
          label="Update General Info"
          isCompleted={!!profile?.company_name}
        />

        <PendingItem
          icon={
            profile?.business_type?.length ? (
              <Image
                src="/assets/icons/green-verify.svg"
                alt="verified"
                width={18}
                height={18}
              />
            ) : (
              <Building2 size={18} />
            )
          }
          label="Update Business Info"
          isCompleted={!!profile?.business_type?.length}
        />

        <PendingItem
          icon={
            false ? (
              <Image
                src="/assets/icons/green-verify.svg"
                alt="verified"
                width={18}
                height={18}
              />
            ) : (
              <ShieldCheck size={18} />
            )
          }
          label="Update KYC Registration"
          isCompleted={false}
        />
      </div>
      <div className="border-t border-gray-200 mt-5"></div>
      <div className="flex flex-col gap-0">
        {[
          { icon: ChevronsRight, label: "Industry", href: "/home" },
          { icon: MapPin, label: "Location", href: "/home" },
          { icon: LayoutDashboard, label: "Dashboard", href: "/home" },
          { icon: Handshake, label: "Partner", href: "/home" },
          { icon: User, label: "Vendor", href: "/home" },
          { icon: Mail, label: "Enquiries", href: "/enquiries" },
          { icon: Bookmark, label: "Saved", href: "/home" },
          { icon: Clock, label: "My Posts", href: "/home" },
          { icon: Network, label: "My Networks", href: "/home" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-2 rounded-lg transition-all text-[#434343] hover:text-[#6B3FA0] hover:bg-gray-50 group"
            >
              <div className="w-7 h-7 flex items-center justify-center text-[#434343] group-hover:text-[#6B3FA0]">
                <Icon size={18} />
              </div>
              <span className="text-[14px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const PendingItem = ({
  icon,
  label,
  isCompleted,
}: {
  icon: React.ReactNode;
  label: string;
  isCompleted: boolean;
}) => (
<div
  className={`flex items-center justify-between group cursor-pointer p-2 rounded-lg transition-all hover:bg-gray-50 ${
    isCompleted ? "" : ""
  }`}
>
  <div className="flex items-center gap-2">
    <div
      className={`w-7 h-7 flex items-center justify-center ${
        isCompleted
          ? "text-green-600"
          : "text-gray-400 group-hover:text-[#6B3FA0]"
      }`}
    >
      {icon}
    </div>

    <span
      className={`text-[14px] font-medium ${
        isCompleted
          ? "text-[#434343]"
          : "text-gray-500 group-hover:text-gray-700"
      }`}
    >
      {label}
    </span>
  </div>

  {/* {!isCompleted && (
    <ChevronRight
      size={14}
      className="text-gray-300 group-hover:text-gray-500"
    />
  )} */}
</div>  
);

export default ProgressCard;
