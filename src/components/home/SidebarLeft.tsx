"use client";

import React from 'react';
import ProfileCard from './ProfileCard';
import ProgressCard from './ProgressCard';
import { UserProfile } from '@/lib/profile';

interface SidebarLeftProps {
  profile?: UserProfile | null;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({ profile }) => {
  return (
    <aside className="w-full flex flex-col">
      <ProfileCard profile={profile} />
      <ProgressCard profile={profile} />
    </aside>
  );
};

export default SidebarLeft;
