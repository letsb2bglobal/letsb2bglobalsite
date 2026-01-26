import { getToken } from './auth';

export interface Post {
  id: number;
  documentId: string;
  userId: number;
  roleType: 'seller' | 'buyer';
  intentType: 'demand' | 'offer';
  title: string;
  content: any; // Strapi JSON content
  destinationCity: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CreatePostData {
  userId: number;
  roleType: 'seller' | 'buyer';
  intentType: 'demand' | 'offer';
  title: string;
  content: any;
  destinationCity: string;
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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export const getAllPosts = async (): Promise<PostResponse> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await fetch(`${apiUrl}/api/posts?sort=createdAt:desc`, {
      method: 'GET',
      // headers: {
      //   'Authorization': `Bearer ${token}`,
      //   'Content-Type': 'application/json',
      // },
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
  try {
    const response = await fetch(`${apiUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
