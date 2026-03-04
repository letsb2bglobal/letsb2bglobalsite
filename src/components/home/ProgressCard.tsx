"use client";

import React from 'react';
import { ChevronRight, Info, Building2, ShieldCheck } from 'lucide-react';
import { UserProfile } from '@/lib/profile';

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
    <div className="bg-white rounded-[12px] shadow-sm p-5 border border-gray-100 flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {/* Progress Ring */}
        <div className="relative w-12 h-12 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#f6f2f8]" />
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={126} strokeDashoffset={126 - (126 * progress) / 100} className="text-[#6B3FA0] transition-all duration-1000" />
          </svg>
          <span className="absolute text-[10px] font-bold text-[#6B3FA0]">{progress}%</span>
        </div>
        <div className="flex flex-col">
          <h3 className="text-xs font-bold text-gray-800">Complete Profile</h3>
          <span className="text-[10px] text-gray-400 font-medium">Stand out in the market</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <PendingItem icon={<Info size={14} />} label="Update General Info" isCompleted={!!profile?.company_name} />
        <PendingItem icon={<Building2 size={14} />} label="Update Business Info" isCompleted={!!profile?.business_type?.length} />
        <PendingItem icon={<ShieldCheck size={14} />} label="Update KYC Registration" isCompleted={false} />
      </div>
    </div>
  );
};

const PendingItem = ({ icon, label, isCompleted }: { icon: React.ReactNode, label: string, isCompleted: boolean }) => (
  <div className={`flex items-center justify-between group cursor-pointer p-2 rounded-lg transition-all ${isCompleted ? 'bg-green-50/50 opacity-60' : 'hover:bg-gray-50'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-[#f6f2f8] text-gray-400 group-hover:text-[#6B3FA0]'}`}>
        {icon}
      </div>
      <span className={`text-[11px] font-bold ${isCompleted ? 'text-green-700' : 'text-gray-500 group-hover:text-gray-700'}`}>{label}</span>
    </div>
    {!isCompleted && <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />}
  </div>
);

export default ProgressCard;
