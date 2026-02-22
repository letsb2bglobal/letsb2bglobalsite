import { getToken } from './auth';

export interface Post {
  id: number;
  documentId: string;
  userId: number;
  description: string;
  destination: string;
  category?: { id: number; documentId: string; name: string };
  user_profile?: { id: number; company_name: string };
  status?: 'Open' | 'Closed';
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media?: any[];
  score?: number;
  _type?: 'post' | 'enquiry';
  _score?: number;
  // Legacy fields kept for backward-compat during transition
  title?: string;
  content?: any;
  roleType?: 'seller' | 'buyer';
  intentType?: 'demand' | 'offer';
  destinationCity?: string;
}

export interface PostResponse {
  data: Post[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface CreatePostData {
  userId: number;
  description: string;
  destination: string;
  category: string; // documentId of category
  media?: number[]; // optional file IDs
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export const getAllPosts = async (): Promise<PostResponse> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/posts?sort=createdAt:desc`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const createPost = async (postData: CreatePostData): Promise<Post> => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');
  
  try {
    const response = await fetch(`${apiUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: postData,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.error?.message || 'Failed to create post');
    }

    return result.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};
export const getUserPosts = async (userId: number): Promise<PostResponse> => {
  try {
    const response = await fetch(
      `${apiUrl}/api/posts?filters[userId][$eq]=${userId}&sort=createdAt:desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

/**
 * Search posts by text and location
 */
export const searchPosts = async (
  text: string,
  location: string
): Promise<PostResponse> => {
  const params = new URLSearchParams();
  if (text) params.append("text", text);
  if (location) params.append("location", location);

  try {
    const response = await fetch(`${apiUrl}/api/posts/search?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to search posts");
    }

    const result = await response.json();
    
    // Handle both raw array and Strapi-style response { data: [] }
    if (Array.isArray(result)) {
      return { data: result };
    }
    
    return result;
  } catch (error) {
    console.error("Error searching posts:", error);
    throw error;
  }
};

/**
 * Log user engagement activity to improve feed ranking
 */
export const logActivity = async (data: {
  user: number;
  action_type: 'view' | 'click' | 'save' | 'reply';
  item_id: string; // documentId
  item_type: 'post' | 'enquiry';
}): Promise<void> => {
  const token = getToken();
  try {
    await fetch(`${apiUrl}/api/activity-logs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ data }),
    });
  } catch (error) {
    console.error("Activity logging failed:", error);
  }
};

/**
 * Get the unified TradeWall feed (Posts + Enquiries)
 */
export const getTradeWallFeed = async (page: number = 1, pageSize: number = 10): Promise<PostResponse> => {
  const token = getToken();
  try {
    const response = await fetch(`${apiUrl}/api/trade-wall?page=${page}&pageSize=${pageSize}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch TradeWall feed");
    return await response.json();
  } catch (error) {
    console.error("TradeWall error:", error);
    throw error;
  }
};

/**
 * Search the TradeWall with intelligent ranking
 */
export const searchTradeWall = async (params: {
  q?: string;
  category?: string; // documentId
  city?: string;
}): Promise<PostResponse> => {
  const token = getToken();
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.append("q", params.q);
  if (params.category) searchParams.append("category", params.category);
  if (params.city) searchParams.append("city", params.city);

  try {
    const response = await fetch(`${apiUrl}/api/trade-wall/search?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) throw new Error("Search failed");
    return await response.json();
  } catch (error) {
    console.error("TradeWall search error:", error);
    throw error;
  }
};
