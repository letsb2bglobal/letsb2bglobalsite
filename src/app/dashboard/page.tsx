'use client';

import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';
import { clearAuthData } from '@/lib/auth';
import { useState, useEffect } from 'react';
import { checkUserProfile, type UserProfile } from '@/lib/profile';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const userProfile = await checkUserProfile(user.id);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error loading profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleLogout = () => {
    clearAuthData();
    router.push('/signin');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Welcome back, {user?.username || user?.email}!
            </h2>
            <p className="text-gray-600">
              You are successfully logged in to the Let's B2B platform.
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Your Profile Information
            </h3>
            <div className="space-y-3">
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Email:</span>
                <span className="text-gray-600">{user?.email}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Username:</span>
                <span className="text-gray-600">{user?.username}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">User ID:</span>
                <span className="text-gray-600">{user?.id}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Provider:</span>
                <span className="text-gray-600">{user?.provider}</span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Confirmed:</span>
                <span className={`px-2 py-1 rounded text-xs ${user?.confirmed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user?.confirmed ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Status:</span>
                <span className={`px-2 py-1 rounded text-xs ${user?.blocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {user?.blocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              <div className="flex border-b pb-2">
                <span className="font-medium text-gray-700 w-32">Joined:</span>
                <span className="text-gray-600">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Company Profile Card */}
          {isLoadingProfile ? (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ) : profile ? (
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Company Profile</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  profile.user_type === 'seller' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {profile.user_type.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex border-b pb-2">
                  <span className="font-medium text-gray-700 w-32">Company:</span>
                  <span className="text-gray-600">{profile.company_name}</span>
                </div>
                
                <div className="flex border-b pb-2">
                  <span className="font-medium text-gray-700 w-32">Category:</span>
                  <span className="text-gray-600">{profile.category}</span>
                </div>
                
                <div className="flex border-b pb-2">
                  <span className="font-medium text-gray-700 w-32">Location:</span>
                  <span className="text-gray-600">{profile.city}, {profile.country}</span>
                </div>
                
                {profile.website && (
                  <div className="flex border-b pb-2">
                    <span className="font-medium text-gray-700 w-32">Website:</span>
                    <a 
                      href={profile.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                
                {profile.whatsapp && (
                  <div className="flex border-b pb-2">
                    <span className="font-medium text-gray-700 w-32">WhatsApp:</span>
                    <span className="text-gray-600">{profile.whatsapp}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => router.push('/profile')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  View / Edit Profile →
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                Profile Incomplete
              </h3>
              <p className="text-yellow-700 mb-4">
                Please complete your company profile to access all features.
              </p>
              <button
                onClick={() => router.push('/complete-profile')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium"
              >
                Complete Profile Now
              </button>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This is a protected route. Only authenticated users can access this page.
              If you try to access this page without logging in, you'll be redirected to the signin page.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
