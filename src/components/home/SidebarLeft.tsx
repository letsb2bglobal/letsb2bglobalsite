"use client";

import React, { useState } from "react";
import ProfileCard from "./ProfileCard";
import ProgressCard from "./ProgressCard";
import { UserProfile } from "@/lib/profile";

interface SidebarLeftProps {
  profile?: UserProfile | null;
  expandable?: boolean;
}

const SidebarLeft: React.FC<SidebarLeftProps> = ({
  profile,
  expandable = false,
}) => {
  const [showMore, setShowMore] = useState(!expandable);

  return (
    <aside className="w-full flex flex-col">
      <ProfileCard profile={profile} showProgress={showMore} />

      {expandable && (
        <button
          type="button"
          onClick={() => setShowMore((prev) => !prev)}
          className="mt-2 self-center text-[12px] font-bold text-[#6B3FA0] hover:text-[#4d2c7a]"
        >
          {showMore ? "Show less" : "Show more"}
        </button>
      )}

      {!expandable && !showMore && <ProgressCard profile={profile} />}
    </aside>
  );
};

export default SidebarLeft;
