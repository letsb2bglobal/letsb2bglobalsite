// User Profile API functions
import { getToken } from './auth';

export interface UserProfile {
  id: number;
  documentId: string;
  company_name: string;
  user_type: 'seller' | 'buyer';
  category: string;
  country: string;
  city: string;
  website?: string;
  whatsapp?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CreateProfileData {
  company_name: string;
  user_type: 'seller' | 'buyer';
  category: string;
  country: string;
  city: string;
  website?: string;
  whatsapp?: string;
  userId: number;
}

export interface ProfileResponse {
  data: UserProfile[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Check if user profile exists for the given userId
 */
export const checkUserProfile = async (userId: number): Promise<UserProfile | null> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';
  
  try {
    const response = await fetch(
      `${apiUrl}/api/user-profiles?filters[userId]=${userId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check user profile');
    }

    const data: ProfileResponse = await response.json();
    
    // Return the first profile if it exists, otherwise null
    return data.data && data.data.length > 0 ? data.data[0] : null;
  } catch (error) {
    console.error('Error checking user profile:', error);
    throw error;
  }
};

/**
 * Create a new user profile
 */
export const createUserProfile = async (
  profileData: CreateProfileData
): Promise<UserProfile> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';
  
  try {
    const response = await fetch(`${apiUrl}/api/user-profiles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: profileData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to create user profile');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  documentId: string,
  profileData: Partial<CreateProfileData>
): Promise<UserProfile> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';
  
  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/${documentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: profileData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to update user profile');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Check if profile exists, if not redirect to profile creation
 * Returns true if profile exists, false if needs to be created
 */
export const verifyUserProfile = async (userId: number): Promise<boolean> => {
  try {
    const profile = await checkUserProfile(userId);
    return profile !== null;
  } catch (error) {
    console.error('Error verifying user profile:', error);
    return false;
  }
};
