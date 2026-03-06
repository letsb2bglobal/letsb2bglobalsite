"use client";

import React from "react";
import { BadgeCheck, Hotel } from "lucide-react";
import { UserProfile } from "@/lib/profile";
import Image from "next/image";
import ProgressCard from "./ProgressCard";
interface ProfileCardProps {
  profile?: UserProfile | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-[12px] shadow-sm overflow-hidden border border-gray-100 mb-4">
      {/* Banner */}
      {/* <div className="h-16 w-full bg-gradient-to-r from-[#6B3FA0] to-[#9d66e7]"></div> */}

      {/* Profile Info */}
      <div className="px-5 pb-5">
        <div className="relative mt-5 mb-3">
          <div className="w-22 h-22 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center text-[#6B3FA0] font-bold text-2xl overflow-hidden ring-1 ring-gray-100">
            {profile?.company_name?.[0]?.toUpperCase() || "L"}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 ">
            <h2 className="text-[18px] font-bold text-gray-900 leading-tight">
              {profile?.company_name || "Le Tourister"}
            </h2>

            <Image
              src="/assets/icons/verify.png"
              width={21}
              height={21}
              alt="verify"
            />
          </div>
          <span className="flex items-center gap-1 text-[12px] font-medium text-gray-400 mt-1">
            <Image
              src="/assets/icons/location.png"
              alt="Location"
              width={15}
              height={16}
              className="mr-1.5"
            />
            {profile?.city || profile?.state
              ? [profile?.city, profile?.state].filter(Boolean).join(" - ")
              : "Location"}
          </span>
          <span className="text-[12px] font-medium text-[#000000] mt-1">
            {typeof profile?.about === "string" && profile.about
              ? profile.about
              : "About the Company"}
          </span>

          <div className="border-t border-gray-200 mt-5"></div>

          <div className="mt-4">
            <ProgressCard profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
