'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { getProfileByDocumentId, type UserProfile } from '@/lib/profile';
import Cookies from 'js-cookie';
import EnquiryModal from '@/components/EnquiryModal';
import { getOrCreateConversation } from '@/lib/messages';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuth();
  const documentId = params.documentId as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Enquiry Modal States
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (documentId) {
        try {
          const data = await getProfileByDocumentId(documentId);
          if (data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Error fetching public profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [documentId]);

  const handleMessageClick = async () => {
    if (!user?.id || !profile?.userId) return;
    try {
      await getOrCreateConversation(user.id, profile.userId);
      router.push('/messages');
    } catch (error) {
      console.error("Failed to start conversation:", error);
      router.push('/messages');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Profile Not Found</h1>
          <button onClick={() => router.push('/')} className="mt-4 text-blue-600 font-bold hover:underline">Back to Feed</button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef] pb-12">
        {/* Navigation Bar */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800">LET'S B2B</span>
          </div>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back
          </button>
        </div>

        <div className="max-w-5xl mx-auto mt-6 px-4">
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
              <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-indigo-600 relative"></div>
              
              <div className="px-6 pb-6">
                 <div className="relative -mt-24 mb-4">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden">
                       <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-4xl">
                          {profile?.company_name.substring(0, 1).toUpperCase()}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div>
                       <div className="flex items-center gap-2">
                          <h1 className="text-3xl font-bold text-gray-900">{profile?.company_name}</h1>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">{profile?.user_type}</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 uppercase">ID: {profile?.userId}</span>
                       </div>
                       <p className="text-lg text-gray-600 mt-1">{profile?.category}</p>
                       <p className="text-gray-500 text-sm mt-1">{profile?.city}, {profile?.country}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                       <button 
                         onClick={() => setIsInquiryModalOpen(true)}
                         className="px-6 py-2 border border-blue-600 text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-all flex items-center gap-2"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                          Enquiry
                       </button>
                       <button 
                         onClick={handleMessageClick}
                         className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                          Message
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="md:col-span-2 space-y-6">
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                       {profile.about || `${profile.company_name} is a leading ${profile.category} based in ${profile.city}. Connect with us for premium B2B services.`}
                    </p>
                 </div>

                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Experience</h2>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 bg-blue-50 flex items-center justify-center rounded border border-blue-100">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M7 5V3a1 1 0 011-1h8a1 1 0 011 1v2h5a1 1 0 011 1v14a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1h5zM8 4v1h8V4H8zm-3 3v12h14V7H5z"/></svg>
                       </div>
                       <div>
                          <h3 className="font-bold text-gray-900">{profile?.company_name}</h3>
                          <p className="text-gray-700 text-sm">Full-time • {profile?.category}</p>
                          <p className="text-gray-500 text-sm mt-1">{profile?.city}, {profile?.country}</p>
                          <p className="text-gray-500 text-sm mt-2">Active on Let's B2B since {new Date(profile.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Company Details</h2>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                          <div>
                             <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Website</p>
                             {profile?.website ? (
                               <a href={profile.website} target="_blank" className="text-blue-600 font-semibold text-sm hover:underline">{profile.website}</a>
                             ) : (
                               <span className="text-gray-400 text-sm italic">Not provided</span>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1.061a2.961 2.961 0 01-2.911-2.511 11.059 11.059 0 01-7.472-7.472A2.961 2.961 0 013 15.111V5z"></path></svg>
                          <div>
                             <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">WhatsApp</p>
                             <p className="text-gray-800 font-semibold text-sm">{profile?.whatsapp || 'Not provided'}</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Reusable Inquiry Modal */}
        {isInquiryModalOpen && profile && (
          <EnquiryModal 
            isOpen={isInquiryModalOpen} 
            onClose={() => setIsInquiryModalOpen(false)} 
            targetProfile={profile} 
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
