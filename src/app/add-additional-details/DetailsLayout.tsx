'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDetails } from './DetailsContext';
import SignupHeader from '@/components/SignupHeader';

const PURPLE = '#612178';
const SIDEBAR_TABS = [
  { id: 'company', label: 'Company Information' },
  { id: 'business', label: 'Business Information' },
  { id: 'kyc', label: 'KYC Verification' },
];

export default function DetailsLayoutComponent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { 
    activeTab, 
    handleSave, 
    handleCancel, 
    saving, 
    loading,
    completionPercent 
  } = useDetails();

  return (
    <>
      {/* Global Loader Overlay */}
      {(loading || saving) && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center gap-3">
            <svg className="animate-spin w-8 h-8 text-[#612178]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm font-semibold text-gray-800">
              {loading ? 'Fetching details...' : 'Saving changes...'}
            </p>
          </div>
        </div>
      )}

      <div className="min-h-screen min-h-dvh flex flex-col bg-gray-100 overflow-x-hidden">
        <header className="flex-shrink-0">
        <SignupHeader sticky />
      </header>
      <div className="flex-1 min-w-0 overflow-x-hidden">
        <div className="flex flex-col min-h-0 flex-1 min-w-0 overflow-x-hidden">
          <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6 min-w-0">
            {/* Header - Title, subtitle, Cancel/Save buttons */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-[28px] font-semibold text-gray-900 leading-tight mt-0">Add Additional Details</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">This Info will be shown on your public profile</p>
              </div>
              <div className="flex flex-row items-center gap-2 sm:gap-3 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center h-9 sm:h-10 px-4 sm:px-5 rounded-[16px] font-semibold text-xs sm:text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center h-9 sm:h-10 px-4 sm:px-5 rounded-[16px] font-semibold text-xs sm:text-sm text-white transition-colors disabled:opacity-60"
                  style={{ backgroundColor: PURPLE }}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col lg:flex-row min-h-0 min-w-0 overflow-hidden">
              <div className="flex flex-1 flex-col lg:flex-row gap-6 w-full min-w-0 overflow-y-auto overflow-x-hidden">
                {/* Left: Profile Completed card */}
                <aside className="w-full lg:w-[260px] shrink-0 mb-6 lg:mb-0 min-w-0 max-w-full">
                  <div
                    className="rounded-[16px] p-5 w-full max-w-full lg:w-[260px]"
                    style={{
                      minHeight: 242.14,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D9D9D9',
                      boxShadow: '0px 4px 4px 0px #00000040',
                    }}
                  >
                    <p className="font-bold text-gray-900 mb-3">Profile Completed</p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                          <path fill="none" stroke="#E5E7EB" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path fill="none" strokeWidth="3" strokeDasharray={`${completionPercent}, 100`} strokeLinecap="round" stroke="#F22822" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color: '#F22822' }}>
                          {completionPercent}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Complete Your Profile To Be Verified</p>
                    </div>
                    <nav className="space-y-1">
                      {SIDEBAR_TABS.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => router.push(`/add-additional-details/${tab.id}`)}
                          className="w-full text-left px-4 rounded-[8px] text-sm font-semibold transition-all"
                          style={{
                            width: '100%',
                            height: 41.97,
                            backgroundColor: activeTab === tab.id ? '#E7C7F2' : '#FFFFFF',
                            color: '#1F1E25',
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </aside>

                {/* Right: Main content */}
                <div className="flex-1 min-w-0 w-full overflow-hidden">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
