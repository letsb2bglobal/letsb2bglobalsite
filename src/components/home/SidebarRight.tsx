"use client";

import React from 'react';
import TrendingCard from './TrendingCard';
import SuggestionsCard from './SuggestionsCard';
import InsightsCard from './InsightsCard';

const SidebarRight = () => {
  return (
    <aside className="w-full flex flex-col">
      <TrendingCard />
      <SuggestionsCard />
      <InsightsCard />
    </aside>
  );
};

export default SidebarRight;
