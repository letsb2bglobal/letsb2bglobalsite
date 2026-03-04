"use client";

import React from 'react';
import { BadgeCheck, Hotel } from 'lucide-react';
import { UserProfile } from '@/lib/profile';

interface ProfileCardProps {
  profile?: UserProfile | null;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div className="bg-white rounded-[12px] shadow-sm overflow-hidden border border-gray-100 mb-4">
      {/* Banner */}
      <div className="h-16 w-full bg-gradient-to-r from-[#6B3FA0] to-[#9d66e7]"></div>
      
      {/* Profile Info */}
      <div className="px-5 pb-5">
        <div className="relative -mt-8 mb-3">
          <div className="w-16 h-16 rounded-[20px] bg-white border-2 border-white shadow-md flex items-center justify-center text-[#6B3FA0] font-bold text-2xl overflow-hidden ring-1 ring-gray-100">
             {profile?.company_name?.[0]?.toUpperCase() || 'L'}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-bold text-gray-900 leading-tight">
               {profile?.company_name || 'Le Tourister'}
            </h2>
            <BadgeCheck size={16} className="text-[#6B3FA0] fill-[#6B3FA0]/10" />
          </div>
          <span className="text-[10px] font-medium text-gray-400">
            {profile?.email || 'contact@letourister.com'}
          </span>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f6f2f8] flex items-center justify-center text-[#6B3FA0]">
             <Hotel size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-gray-800">
               {profile?.business_type?.[0] || '5 Star Hotel'}
            </span>
            <span className="text-[9px] font-medium text-gray-400">
               {profile?.city || 'Kochi'}, {profile?.country || 'India'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
