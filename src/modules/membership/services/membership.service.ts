import { getToken } from "@/lib/auth";

const API_URL = "https://api.letsb2b.com/api";

function getTokenForRequest(): string | null {
  if (typeof window === "undefined") return null;

  // 1) Primary source: auth cookie via auth.ts
  const fromCookie = getToken();
  if (fromCookie) return fromCookie;

  // 2) Token stored directly under "auth.token"
  const authTokenKey = localStorage.getItem("auth.token");
  if (authTokenKey) return authTokenKey;

  // 3) Token stored in a JSON object under "auth" (e.g. { token: "..." })
  const authObj = localStorage.getItem("auth");
  if (authObj) {
    try {
      const parsed = JSON.parse(authObj);
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore JSON parse errors and fall through
    }
  }

  // 4) Legacy keys
  const fromStorage = localStorage.getItem("auth_token") ?? localStorage.getItem("token");
  if (fromStorage) return fromStorage;

  // 5) Fallback: read raw cookie by name
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

export async function getMembershipStatus() {
  const headers = getAuthHeaders();

  const response = await fetch(
    `${API_URL}/membership-status`,
    {
      method: "GET",
      headers,
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  // API returns { data: { tier, is_active, expiry, message } }
  return data?.data ?? data ?? null;
}

export async function buySubscription(
  profileId: string,
  tier: string,
  durationCode: string
) {
  const baseUrl =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : API_URL;

  const token = getTokenForRequest();
  if (!token) {
    console.error("buySubscription: no JWT token found in storage/cookies");
    // Frontend-only friendly error message
    throw new Error("You must be logged in to purchase a subscription.");
  }

  const response = await fetch(
    `${baseUrl}/buy-subscription`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        profileId,
        tier,
        durationCode,
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Log full response body for debugging
    console.error("buySubscription error response", response.status, data);

    if (response.status === 403) {
      // Friendly, specific 403 message
      throw new Error("You do not have permission to perform this action.");
    }

    throw new Error(
      data?.error?.message ||
      data?.message ||
      `Request failed with status ${response.status}`
    );
  }

  return data;
}
