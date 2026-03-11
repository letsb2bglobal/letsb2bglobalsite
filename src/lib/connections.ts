import { getToken } from './auth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export interface ConnectionUser {
  id: number;
  documentId?: string;
  full_name?: string;
  company_name?: string;
  profileImageUrl?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Connection {
  id: number;
  documentId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  follower?: ConnectionUser;
  following?: ConnectionUser;
}

export interface ConnectionsResponse {
  data: Connection[];
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
 * Get pending invitations for the current user
 * These are connection requests where others want to connect with the user
 */
export const getPendingInvitations = async (userProfileId: number): Promise<Connection[]> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const params = new URLSearchParams({
      'filters[status]': 'pending',
      'filters[following][id]': String(userProfileId),
      'populate[follower][fields]': 'full_name,company_name,profileImageUrl,city,state,country',
    });

    const response = await fetch(`${apiUrl}/api/connections?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }

    const result: ConnectionsResponse = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    throw error;
  }
};

/**
 * Accept a connection invitation
 */
export const acceptInvitation = async (connectionDocumentId: string): Promise<Connection> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/connections/${connectionDocumentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          status: 'accepted',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to accept invitation');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

/**
 * Reject/Ignore a connection invitation
 */
export const rejectInvitation = async (connectionDocumentId: string): Promise<Connection> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/connections/${connectionDocumentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          status: 'rejected',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to reject invitation');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    throw error;
  }
};

/**
 * Follow a user - creates a new connection request
 * @param followerId - The ID of the user who is following (current user's profile ID)
 * @param followingId - The ID of the user being followed (target user's profile ID)
 */
export const followUser = async (followerId: number | string, followingId: number | string): Promise<Connection> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/connections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          follower: String(followerId),
          following: String(followingId),
          status: 'pending',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Failed to follow user');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

/**
 * Unfollow a user - deletes the connection
 * @param connectionDocumentId - The documentId of the connection to delete
 */
export const unfollowUser = async (connectionDocumentId: string): Promise<void> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/connections/${connectionDocumentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to unfollow user');
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

/**
 * Check if the current user is following a specific user
 * Returns the connection if exists, null otherwise
 * @param followerId - Current user's profile ID
 * @param followingId - Target user's profile ID
 */
export const getConnectionStatus = async (
  followerId: number | string, 
  followingId: number | string
): Promise<Connection | null> => {
  const token = getToken();
  
  if (!token) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      'filters[follower][id]': String(followerId),
      'filters[following][id]': String(followingId),
    });

    const response = await fetch(`${apiUrl}/api/connections?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const result: ConnectionsResponse = await response.json();
    return result.data?.[0] || null;
  } catch (error) {
    console.error('Error checking connection status:', error);
    return null;
  }
};

/**
 * Get all connections for a user (both following and followers)
 * @param userProfileId - The user's profile ID
 */
export const getUserConnections = async (userProfileId: number): Promise<{
  following: Connection[];
  followers: Connection[];
}> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Fetch connections where user is the follower (people they follow)
    const followingParams = new URLSearchParams({
      'filters[follower][id]': String(userProfileId),
      'filters[status][$in][0]': 'pending',
      'filters[status][$in][1]': 'accepted',
      'populate[following][fields]': 'full_name,company_name,profileImageUrl',
    });

    // Fetch connections where user is being followed (their followers)
    const followersParams = new URLSearchParams({
      'filters[following][id]': String(userProfileId),
      'filters[status]': 'accepted',
      'populate[follower][fields]': 'full_name,company_name,profileImageUrl',
    });

    const [followingRes, followersRes] = await Promise.all([
      fetch(`${apiUrl}/api/connections?${followingParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }),
      fetch(`${apiUrl}/api/connections?${followersParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      }),
    ]);

    const followingData: ConnectionsResponse = await followingRes.json();
    const followersData: ConnectionsResponse = await followersRes.json();

    return {
      following: followingData.data || [],
      followers: followersData.data || [],
    };
  } catch (error) {
    console.error('Error fetching user connections:', error);
    throw error;
  }
};
