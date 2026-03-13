import React from 'react';

export const PURPLE = '#612178';
export const PURPLE_LIGHT = '#E0CCF0';
export const ORANGE = '#FEA40C';

export const ChevronDownIcon = () => (
  <svg className="w-4 h-4 text-[#545454] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export const SELECT_WRAPPER = "relative flex items-center";
export const SELECT_CHEVRON = "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center z-10";
export const SELECT_BASE = "w-full pl-4 pr-12 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] appearance-none";
export const SELECT_BASE_SM = "w-full pl-4 pr-12 py-3 bg-white border border-[#D9D9D9] rounded-xl text-sm text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] appearance-none";
export const SELECT_COUNTRY_CODE = "min-w-[70px] sm:w-20 pl-3 pr-10 py-3 bg-white border border-[#D9D9D9] rounded-xl text-[#545454] font-normal font-sans focus:outline-none focus:border-[#612178] shrink-0 appearance-none";

export const SIDEBAR_TABS = [
  { id: 'company', label: 'Company Information' },
  { id: 'business', label: 'Business Information' },
  { id: 'kyc', label: 'KYC Verification' },
];

export const HOTEL_OPTIONS = ['Hotel', 'Resort', 'Boutique', 'Budget', '5 Star', '4 Star', '3 Star'];
export const BUSINESS_TYPE_OPTIONS = ['Restaurant', 'Hotel', 'Taxi Business', 'DMC', 'Tour Guide', 'TT Bus Services', 'Adventure Activity', 'Ayurveda Centre'];
export const COUNTRY_OPTIONS = ['India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Other'];
export const STATE_OPTIONS = ['Kerala', 'Maharashtra', 'Karnataka', 'Delhi', 'Other'];
export const CITY_OPTIONS = ['Kochi', 'Mumbai', 'Bangalore', 'Delhi', 'Dubai', 'Other'];
export const DESIGNATION_OPTIONS = ['Manager', 'Director', 'Owner', 'CEO', 'Other'];
export const BUSINESS_CATEGORY_OPTIONS = ['Hotel', 'Restaurant', 'DMC', 'Taxi Service', 'Tour Guide', 'Other'];
export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Malayalam', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Other'];

export const SOCIAL_MEDIA_OPTIONS = [
  { value: '', label: 'Select Platform' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'gmail', label: 'Gmail' },
  { value: 'other', label: 'Other' },
];

export const formatFileSize = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
};

export const getSocialMediaPlaceholder = (platform: string) => {
  switch (platform) {
    case 'linkedin': return 'Enter LinkedIn Profile URL';
    case 'instagram': return 'Enter Instagram Profile URL';
    case 'facebook': return 'Enter Facebook Profile URL';
    case 'twitter': return 'Enter Twitter / X Profile URL';
    case 'youtube': return 'Enter YouTube Channel URL';
    case 'gmail': return 'Enter Gmail Address';
    case 'other': return 'Enter Profile URL or Email';
    default: return 'Enter Profile URL or Email';
  }
};
