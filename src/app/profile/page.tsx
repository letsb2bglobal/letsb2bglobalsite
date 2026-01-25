'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { checkUserProfile, updateUserProfile, type UserProfile } from '@/lib/profile';
import { authenticatedFetch } from '@/lib/auth';

interface Enquiry {
  id: number;
  documentId: string;
  fromUserId: number;
  toUserId: number;
  title: string;
  description: string;
  destination: string;
  messagestatus: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Edit states
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  
  // Form states
  const [headerForm, setHeaderForm] = useState({
    company_name: '',
    category: '',
    country: '',
    city: '',
    user_type: 'seller' as 'seller' | 'buyer'
  });
  
  const [aboutText, setAboutText] = useState('');
  const [contactForm, setContactForm] = useState({
    website: '',
    whatsapp: ''
  });

  // Enquiry states
  const [showEnquiries, setShowEnquiries] = useState(false);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

 const fetchEnquiries = async () => {
  if (!user?.id) return;

  setLoadingEnquiries(true);
  setShowEnquiries(true);

  try {
    const apiUrl =
      `https://api.letsb2b.com/api/enquiries` +
      `?filters[$or][0][fromUserId][$eq]=${user.id}` +
      `&filters[$or][1][toUserId][$eq]=${user.id}` +
      `&sort=createdAt:desc`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
        // ❌ NO Authorization header
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Strapi error:", result);
      return;
    }

    setEnquiries(result.data || []);
  } catch (error) {
    console.error("Error fetching enquiries:", error);
  } finally {
    setLoadingEnquiries(false);
  }
};


  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const data = await checkUserProfile(user.id);
          if (data) {
            setProfile(data);
            setHeaderForm({
              company_name: data.company_name,
              category: data.category,
              country: data.country,
              city: data.city,
              user_type: data.user_type
            });
            setAboutText(data.company_name + " is a leading " + data.category + " based in " + data.city + ". We specialize in providing top-tier B2B services.");
            setContactForm({
              website: data.website || '',
              whatsapp: data.whatsapp || ''
            });
          } else {
            router.push('/company-profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user, router]);

  const handleUpdateProfile = async (updates: any) => {
    if (!profile?.documentId) return;
    setSaving(true);
    try {
      const updatedData = await updateUserProfile(profile.documentId, updates);
      setProfile(updatedData);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveHeader = async () => {
    const success = await handleUpdateProfile(headerForm);
    if (success) setIsEditingHeader(false);
  };

  const saveContact = async () => {
    await handleUpdateProfile(contactForm);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f2ef]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef] pb-12">
        {/* Navigation Bar Spacing */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800 hidden md:block">LET'S B2B</span>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => router.push('/dashboard')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</button>
             <button onClick={() => router.push('/messages')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Messages</button>
             <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
               <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                 {user?.username?.substring(0, 2).toUpperCase()}
               </div>
             </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-6 px-4">
           {/* Profile Card */}
           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
              {/* Background Cover */}
              <div className="h-48 w-full bg-gradient-to-r from-blue-400 to-indigo-600 relative">
                 <button className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                 </button>
              </div>

              {/* Profile Image & Content Header */}
              <div className="px-6 pb-6">
                 <div className="relative -mt-24 mb-4">
                    <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden group">
                       <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-4xl">
                          {profile?.company_name.substring(0, 1).toUpperCase()}
                       </div>
                       <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex transition-all cursor-pointer">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                       </div>
                    </div>
                 </div>

                 {!isEditingHeader ? (
                   <div className="flex flex-col md:flex-row md:justify-between md:items-start transition-all duration-300">
                      <div>
                         <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold text-gray-900">{profile?.company_name}</h1>
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded uppercase">{profile?.user_type}</span>
                             <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100 ml-2 uppercase">ID: {profile?.userId}</span>
                         </div>
                         <p className="text-lg text-gray-600 mt-1">{profile?.category}</p>
                         <p className="text-gray-500 text-sm mt-1">{profile?.city}, {profile?.country} • <span className="text-blue-600 font-semibold hover:underline cursor-pointer">Contact info</span></p>
                      </div>
                      <div className="mt-4 md:mt-0 flex gap-2">
                         <button 
                           onClick={() => setIsEditingHeader(true)}
                           className="px-4 py-1.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors flex items-center gap-2"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            Edit Profile
                         </button>
                          <button 
                            onClick={fetchEnquiries}
                            className="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                             Enquiries
                          </button>
                          <button className="px-4 py-1.5 border border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors">Resources</button>
                       </div>
                   </div>
                 ) : (
                   <div className="space-y-4 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input 
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Company Name"
                           value={headerForm.company_name}
                           onChange={(e) => setHeaderForm({...headerForm, company_name: e.target.value})}
                         />
                         <input 
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Category"
                           value={headerForm.category}
                           onChange={(e) => setHeaderForm({...headerForm, category: e.target.value})}
                         />
                         <input 
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="Country"
                           value={headerForm.country}
                           onChange={(e) => setHeaderForm({...headerForm, country: e.target.value})}
                         />
                         <input 
                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                           placeholder="City"
                           value={headerForm.city}
                           onChange={(e) => setHeaderForm({...headerForm, city: e.target.value})}
                         />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setIsEditingHeader(false)}
                          className="px-4 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={saveHeader}
                          disabled={saving}
                          className="px-6 py-1.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors flex items-center"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                   </div>
                 )}
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Left Column (Main Content) */}
              <div className="md:col-span-2 space-y-6">
                 {/* About Section */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative group">
                    <div className="flex justify-between items-center mb-4">
                       <h2 className="text-xl font-bold text-gray-900">About</h2>
                       {!isEditingAbout && (
                         <button 
                            onClick={() => setIsEditingAbout(true)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                         >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                         </button>
                       )}
                    </div>
                    
                    {!isEditingAbout ? (
                       <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {aboutText}
                       </p>
                    ) : (
                       <div className="space-y-4">
                          <textarea 
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={aboutText}
                            onChange={(e) => setAboutText(e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setIsEditingAbout(false)}
                              className="px-4 py-1.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-full transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              disabled={saving}
                              onClick={() => setIsEditingAbout(false)} // Simulation for now
                              className="px-6 py-1.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
                            >
                              Save
                            </button>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Company Details */}
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
                          <p className="text-gray-500 text-sm mt-2">Active since {profile ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Right Column (Sidebar) */}
              <div className="space-y-6">
                 {/* Contact Information */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h2>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                          <div>
                             <p className="text-xs text-gray-500">Website</p>
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
                             <p className="text-xs text-gray-500">WhatsApp</p>
                             <p className="text-gray-800 font-semibold text-sm">{profile?.whatsapp || profile?.whatsapp || 'Not provided'}</p>
                          </div>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        const newWebsite = prompt("Enter new website URL:", profile?.website || "");
                        if (newWebsite !== null) {
                          handleUpdateProfile({ website: newWebsite });
                        }
                      }}
                      className="w-full mt-6 py-2 border border-blue-600 text-blue-600 font-bold rounded hover:bg-blue-50 transition-all text-sm"
                    >
                       Edit Contact Details
                    </button>
                 </div>

                 {/* Analytics Simulation */}
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Analytics</h2>
                    <div className="flex items-center gap-3 mb-4">
                       <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                       <div>
                          <p className="text-sm font-bold text-gray-800">128 profile views</p>
                          <p className="text-xs text-gray-500">Discover who viewed your page.</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/></svg>
                       <div>
                          <p className="text-sm font-bold text-gray-800">45 search appearances</p>
                          <p className="text-xs text-gray-500">See how often you appear in results.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Enquiry Modal */}
        {showEnquiries && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Your Enquiries</h2>
                  <p className="text-sm text-gray-500">View and manage your business messages</p>
                </div>
                <button 
                  onClick={() => setShowEnquiries(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingEnquiries ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500 font-medium">Fetching your messages...</p>
                  </div>
                ) : enquiries.length > 0 ? (
                  enquiries.map((enquiry) => (
                    <div key={enquiry.id} className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                            {enquiry.fromUserId === user?.id ? 'TO' : 'FR'}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">
                              {enquiry.title || 'No Subject'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {new Date(enquiry.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          enquiry.fromUserId === user?.id 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {enquiry.fromUserId === user?.id ? 'Sent' : 'Received'}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed ml-12">
                        {enquiry.description}
                      </p>
                      {enquiry.destination && (
                        <p className="text-[10px] text-gray-400 mt-2 ml-12 flex items-center gap-1 font-bold italic uppercase">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {enquiry.destination}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end">
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                    </div>
                    <p className="text-gray-500 font-medium">No enquiries yet</p>
                    <p className="text-sm text-gray-400">Your business inquiries will appear here</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={() => setShowEnquiries(false)}
                  className="px-6 py-2 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Save Indicator */}
        {saving && (
          <div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
            Updating Profile...
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
