// Authentication utility functions using js-cookie
import Cookies from 'js-cookie';

export interface User {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === 'production', // Only use secure in production (HTTPS)
  sameSite: 'strict' as const, // CSRF protection
};

const JWT_COOKIE_NAME = 'auth_token';
const USER_COOKIE_NAME = 'user_data';

/**
 * Store authentication data in cookies
 */
export const setAuthData = (jwt: string, user: User): void => {
  if (typeof window !== 'undefined') {
    // Store JWT token in cookie
    Cookies.set(JWT_COOKIE_NAME, jwt, COOKIE_OPTIONS);
    
    // Store user data in cookie
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
  }
};

/**
 * Get JWT token from cookies
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return Cookies.get(JWT_COOKIE_NAME) || null;
  }
  return null;
};

/**
 * Get user data from cookies
 */
export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userStr = Cookies.get(USER_COOKIE_NAME);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    Cookies.remove(JWT_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
  }
};

/**
 * Login API call
 */
export const login = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';
  
  const response = await fetch(`${apiUrl}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Login failed');
  }

  return data;
};

/**
 * Make authenticated API requests
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, { ...options, headers });
};
