import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

function getTokenForRequest(): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = getToken();
  if (fromCookie) return fromCookie;
  return localStorage.getItem("auth.token") || localStorage.getItem("token") || null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getTokenForRequest();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch all active membership plans
 * GET /api/membership-plans?filters[is_active][$eq]=true
 */
export async function getActiveMembershipPlans() {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/membership-plans?filters[is_active][$eq]=true`,
    { method: "GET", headers }
  );

  if (response.status === 403) return [];
  const data = await response.json().catch(() => null);
  return data?.data || [];
}

/**
 * Fetch details for a specific membership plan
 * GET /api/membership-plans/:documentId
 */
export async function getMembershipDetails(documentId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/membership-plans/${documentId}`,
    { method: "GET", headers }
  );
  const data = await response.json().catch(() => null);
  return data?.data || null;
}

/**
 * Fetch transaction history from the Ledger
 * GET /api/payment-transactions?filters[user_profile][documentId][$eq]=PROFILE_ID&sort=createdAt:desc
 */
export async function getTransactionHistory(profileId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/payment-transactions?filters[user_profile][documentId][$eq]=${profileId}&sort=createdAt:desc`,
    { method: "GET", headers }
  );
  const data = await response.json().catch(() => null);
  return data?.data || [];
}

/**
 * Fetch subscriptions for a user profile
 * GET /api/membership-subscriptions?filters[profile][documentId][$eq]=PROFILE_ID&sort=end_date:desc
 */
export async function getUserSubscriptions(profileId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/membership-subscriptions?filters[profile][documentId][$eq]=${profileId}&sort=end_date:desc`,
    { method: "GET", headers }
  );
  const data = await response.json().catch(() => null);
  return data?.data || [];
}

/**
 * Fetch current active membership status
 * GET /api/membership-status?profileId=PROFILE_ID
 */
export async function getMembershipStatus(profileId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/membership-status?profileId=${profileId}`,
    { method: "GET", headers }
  );
  const data = await response.json().catch(() => null);
  return data || null;
}
