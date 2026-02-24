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

// ─── Cookie configuration ──────────────────────────────────────────────────
const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
};

const JWT_COOKIE_NAME     = 'auth_token';
const USER_COOKIE_NAME    = 'user_data';
const PROFILE_COOKIE_NAME = 'profile_data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

// ─── Cookie helpers ────────────────────────────────────────────────────────

export const setAuthData = (jwt: string, user: User): void => {
  if (typeof window !== 'undefined') {
    Cookies.set(JWT_COOKIE_NAME, jwt, COOKIE_OPTIONS);
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), COOKIE_OPTIONS);
  }
};

export const setProfileData = (profile: any): void => {
  if (typeof window !== 'undefined' && profile) {
    Cookies.set(PROFILE_COOKIE_NAME, JSON.stringify(profile), COOKIE_OPTIONS);
  }
};

export const getProfileData = (): any | null => {
  if (typeof window !== 'undefined') {
    const raw = Cookies.get(PROFILE_COOKIE_NAME);
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
  }
  return null;
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return Cookies.get(JWT_COOKIE_NAME) || null;
  }
  return null;
};

export const getUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const raw = Cookies.get(USER_COOKIE_NAME);
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => getToken() !== null;

export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    Cookies.remove(JWT_COOKIE_NAME);
    Cookies.remove(USER_COOKIE_NAME);
    Cookies.remove(PROFILE_COOKIE_NAME);
  }
};

// ─── Auth API helpers ──────────────────────────────────────────────────────

/**
 * Flow 2 — Login
 * POST /api/auth/local
 * Throws 'UNVERIFIED_EMAIL' if account exists but email not confirmed.
 */
export const login = async (
  identifier: string,
  password: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg: string = data?.error?.message || 'Login failed';
    if (msg.toLowerCase().includes('not confirmed')) {
      throw new Error('UNVERIFIED_EMAIL');
    }
    throw new Error(msg);
  }

  return data;
};

// ─── Flow 1 — Sign Up ─────────────────────────────────────────────────────

/**
 * Step 1: Register — send email + username + password.
 * Backend sends OTP to email on success.
 */
export const register = async (
  email: string,
  username: string,
  password: string
): Promise<{ message: string; email: string }> => {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Registration failed');
  return data;
};

/**
 * Step 2: Verify signup OTP → returns jwt + user (auto-logged-in).
 */
export const verifySignupOtp = async (
  email: string,
  otp: string
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/verify-signup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'OTP verification failed');
  return data;
};

/**
 * Resend signup OTP.
 */
export const resendSignupOtp = async (
  email: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/auth/resend-signup-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Resend failed');
  return data;
};

// ─── Flow 3 — Reset Password ──────────────────────────────────────────────

/**
 * Step 1: Send forgot-password OTP to email.
 */
export const forgotPasswordOtp = async (
  email: string
): Promise<{ message: string }> => {
  const response = await fetch(`${API_URL}/api/auth/forgot-password-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Failed to send OTP');
  return data;
};

/**
 * Step 2: Verify reset OTP → returns resetToken (keep in memory only).
 */
export const verifyResetOtp = async (
  email: string,
  otp: string
): Promise<{ message: string; resetToken: string }> => {
  const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Invalid or expired OTP');
  return data;
};

/**
 * Step 3: Set new password with resetToken → returns jwt + user (auto-logged-in).
 */
export const updatePassword = async (
  email: string,
  resetToken: string,
  newPassword: string
): Promise<AuthResponse & { message: string }> => {
  const response = await fetch(`${API_URL}/api/auth/update-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, resetToken, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || 'Password update failed');
  return data;
};

// ─── Authenticated fetch helper ───────────────────────────────────────────

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getToken();
  if (!token) throw new Error('No authentication token found');

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};
