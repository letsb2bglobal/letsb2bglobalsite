import { getToken } from "@/lib/auth";

const API_URL = "https://api.letsb2b.com/api";

function getTokenForRequest(): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = getToken();
  if (fromCookie) return fromCookie;
  const authTokenKey = localStorage.getItem("auth.token");
  if (authTokenKey) return authTokenKey;
  const authObj = localStorage.getItem("auth");
  if (authObj) {
    try {
      const parsed = JSON.parse(authObj);
      if (parsed?.token) return parsed.token;
    } catch {}
  }
  const fromStorage = localStorage.getItem("auth_token") ?? localStorage.getItem("token");
  if (fromStorage) return fromStorage;
  const match = document.cookie.match(/auth_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
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

export async function getActiveMembershipPlans() {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_URL}/membership-plans?filters[is_active][$eq]=true`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (response.status === 403) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data?.data || [];
}
