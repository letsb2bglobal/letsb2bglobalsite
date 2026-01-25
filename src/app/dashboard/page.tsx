'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { clearAuthData } from '@/lib/auth';
import { checkUserProfile, getAllUserProfiles, type UserProfile } from '@/lib/profile';
import Image from 'next/image';
import EnquiryModal from '@/components/EnquiryModal';
import { getOrCreateConversation } from '@/lib/messages';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);

  // Enquiry Modal States
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          // Fetch current user's profile for sidebar
          const userProfile = await checkUserProfile(user.id);
          setProfile(userProfile);
          setLoading(false);

          // Fetch all profiles for the feed
          const response = await getAllUserProfiles();
          if (response && response.data) {
            // Filter out the current user's profile
            const filteredProfiles = response.data.filter(p => p.userId !== user.id);
            setAllProfiles(filteredProfiles);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setAllLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/signin');
  };

  const handleConversationClick = async (targetUserId: number) => {
    if (!user?.id) return;
    try {
      await getOrCreateConversation(user.id, targetUserId);
      router.push('/messages');
    } catch (error) {
      console.error("Failed to start conversation:", error);
      router.push('/messages');
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef]">
        {/* Navigation Bar */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800 hidden md:block uppercase tracking-tight">Let's B2B</span>
          </div>
          <div className="flex bg-gray-100 rounded-md px-3 py-1.5 w-full max-w-md mx-4 items-center gap-2 border border-transparent focus-within:border-blue-500 transition-all">
             <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             <input type="text" placeholder="Search profiles, categories, or cities..." className="bg-transparent border-none outline-none text-sm w-full" />
          </div>
          <div className="flex items-center gap-6">
             <button onClick={() => router.push('/dashboard')} className="flex flex-col items-center text-gray-800 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                <span className="text-[10px] font-medium hidden md:block">Home</span>
             </button>
             <button onClick={() => router.push('/messages')} className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
                <span className="text-[10px] font-medium hidden md:block">Messaging</span>
             </button>
             <button onClick={() => router.push('/profile')} className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
                <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                  <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[8px]">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className="text-[10px] font-medium hidden md:block">Me</span>
             </button>
             <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors font-medium text-sm">Logout</button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Main Feed - Left Side (3 columns) */}
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-2">
               <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user?.username?.substring(0, 1).toUpperCase()}
                  </div>
                  <button className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3 px-4 text-left text-gray-500 hover:bg-gray-100 transition-all font-medium text-sm">
                    Find your next B2B partner...
                  </button>
               </div>
            </div>

            <div className="flex items-center gap-2 py-2">
               <div className="h-[1px] flex-1 bg-gray-300"></div>
               <span className="text-xs text-gray-500 font-medium px-2">RECENT PROFILES</span>
               <div className="h-[1px] flex-1 bg-gray-300"></div>
            </div>

            {allLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : allProfiles.length > 0 ? (
              allProfiles.map((p) => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                  <div className="h-24 w-full bg-gradient-to-r from-blue-50 to-indigo-50 relative border-b border-gray-100">
                    <div className="absolute -bottom-6 left-6 w-20 h-20 rounded-xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-blue-500 font-bold text-3xl overflow-hidden">
                       <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                          {p.company_name.substring(0, 1).toUpperCase()}
                       </div>
                    </div>
                  </div>
                  <div className="pt-8 pb-6 px-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 
                            onClick={() => router.push(`/profile/${p.documentId}`)}
                            className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {p.company_name}
                          </h3>
                          {p.user_type === 'seller' && (
                            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Seller</span>
                          )}
                          {p.user_type === 'buyer' && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Buyer</span>
                          )}
                        </div>
                        <p className="text-gray-600 font-medium text-sm mt-0.5">{p.category}</p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {p.city}, {p.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                         </button>
                         <button className="px-4 py-1.5 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all text-sm">
                            Connect
                         </button>
                      </div>
                    </div>
                    {p.about && (
                      <p className="mt-4 text-gray-700 text-sm line-clamp-2 leading-relaxed">
                        {p.about}
                      </p>
                    )}
                    <div className="mt-6 flex items-center gap-4 border-t border-gray-50 pt-4">
                       <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.757a2 2 0 011.708 3.033l-2.622 4.195A3 3 0 0115.31 19H8.158a2 2 0 01-1.615-.818l-3.914-5.187A2 2 0 013.91 10H5V4a2 2 0 012-2h2a2 2 0 012 2v6h3"></path></svg>
                          TRUST
                       </button>
                       <button 
                         onClick={() => {
                            setSelectedProfile(p);
                            setIsInquiryModalOpen(true);
                         }}
                         className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                          INQUIRE
                       </button>
                       <button 
                         onClick={() => handleConversationClick(p.userId)}
                         className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-wider"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          MESSAGE
                       </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                 </div>
                 <h3 className="text-lg font-bold text-gray-900">No profiles found</h3>
                 <p className="text-gray-500 mt-1">Be the first to connect with others!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Current User Mini Profile (1 column) */}
          <div className="space-y-4">
             <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm sticky top-20">
                <div className="h-16 w-full bg-gradient-to-br from-blue-600 to-indigo-700"></div>
                <div className="px-5 pb-5">
                   <div className="relative -mt-10 mb-3">
                      <div className="w-16 h-16 rounded-lg bg-white border-2 border-white shadow-md flex items-center justify-center text-blue-600 font-bold text-2xl overflow-hidden">
                         <div className="w-full h-full bg-blue-50 flex items-center justify-center">
                            {profile?.company_name?.substring(0, 1).toUpperCase() || user?.username?.substring(0, 1).toUpperCase()}
                         </div>
                      </div>
                   </div>
                   <div className="mb-4">
                      <h4 className="font-bold text-gray-900 hover:underline cursor-pointer" onClick={() => router.push('/profile')}>
                        {profile?.company_name || user?.username}
                      </h4>
                      <p className="text-gray-600 text-xs mt-0.5">{profile?.category || 'Complete your profile'}</p>
                      <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mt-1.5 inline-block">User ID: {profile?.userId || user?.id}</p>
                   </div>
                   
                   <div className="border-t border-gray-100 pt-3 space-y-3">
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => router.push('/profile')}>
                         <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600">Profile views</span>
                         <span className="text-[11px] font-bold text-blue-600">128</span>
                      </div>
                      <div className="flex justify-between items-center group cursor-pointer" onClick={() => router.push('/profile')}>
                         <span className="text-[11px] font-bold text-gray-500 group-hover:text-blue-600">Post impressions</span>
                         <span className="text-[11px] font-bold text-blue-600">45</span>
                      </div>
                   </div>

                   <div className="border-t border-gray-100 mt-3 pt-3">
                      <button 
                        onClick={() => router.push('/profile')}
                        className="w-full py-1.5 flex items-center justify-center gap-1.5 text-gray-600 hover:bg-gray-50 rounded transition-all text-xs font-bold border border-transparent hover:border-gray-200"
                      >
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v11z"></path></svg>
                         My Items
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm sticky top-[420px]">
                <h5 className="text-[11px] font-bold text-gray-900 mb-3 uppercase tracking-wider">Trending Categories</h5>
                <div className="space-y-2">
                   {['DMC', 'Travel Agency', 'Wholesaler', 'Consolidator'].map((cat) => (
                     <div key={cat} className="flex items-center gap-2 group cursor-pointer">
                        <span className="text-gray-400 font-bold text-sm">#</span>
                        <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 group-hover:underline">{cat}</span>
                     </div>
                   ))}
                </div>
                <button className="w-full mt-4 text-xs font-bold text-gray-500 hover:bg-gray-50 py-2 rounded transition-all border-t border-gray-100">
                   Discover more
                </button>
             </div>
          </div>

        </div>
      </div>
      
      {isInquiryModalOpen && selectedProfile && (
        <EnquiryModal 
          isOpen={isInquiryModalOpen} 
          onClose={() => setIsInquiryModalOpen(false)} 
          targetProfile={selectedProfile} 
        />
      )}
    </ProtectedRoute>
  );
}
