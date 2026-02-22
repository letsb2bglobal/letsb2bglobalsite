import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

function getAuthHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Follow a profile
 * POST /api/connections
 */
export async function followProfile(followerId: string | number, followingId: string | number) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/api/connections`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: {
        follower: followerId,
        following: followingId,
        status: "active"
      }
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to follow profile");
  }
  return data.data;
}

/**
 * Unfollow a profile (Permanent Deletion)
 * DELETE /api/connections/:id
 */
export async function unfollowProfile(connectionId: string | number) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/api/connections/${connectionId}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error?.message || "Failed to unfollow profile");
  }
  return true;
}

/**
 * Block a connection
 * PUT /api/connections/:id
 */
export async function blockConnection(connectionId: string | number) {
  const headers = getAuthHeaders();
  const response = await fetch(`${API_URL}/api/connections/${connectionId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      data: { status: "blocked" }
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "Failed to block connection");
  }
  return data.data;
}

/**
 * Check if following and get connection details
 * GET /api/connections?filters[follower][documentId][$eq]=A&filters[following][documentId][$eq]=B
 */
export async function getConnectionStatus(followerProfileId: string, followingProfileId: string) {
  const headers = getAuthHeaders();
  const response = await fetch(
    `${API_URL}/api/connections?filters[follower][documentId][$eq]=${followerProfileId}&filters[following][documentId][$eq]=${followingProfileId}`,
    { method: "GET", headers }
  );

  const data = await response.json();
  if (!response.ok) return null;
  return data.data?.[0] || null;
}

/**
 * Get the list of people following a profile
 * GET /api/connections?filters[following][documentId][$eq]=ID&filters[status]=active&populate=follower
 */
export async function getFollowers(profileId: string, options: { verifiedOnly?: boolean } = {}) {
  const headers = getAuthHeaders();
  // Filter for status=active and ensure follower relation exists
  let url = `${API_URL}/api/connections?filters[following][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[follower][id][$notNull]=true&populate=*`;
  
  if (options.verifiedOnly) {
    url += `&filters[is_verified_follow][$eq]=true`;
  }

  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  return data?.data || [];
}

/**
 * Get the list of people a profile is following
 * GET /api/connections?filters[follower][documentId][$eq]=ID&filters[status]=active&populate=following
 */
export async function getFollowing(profileId: string) {
  const headers = getAuthHeaders();
  // Filter for status=active and ensure following relation exists
  const url = `${API_URL}/api/connections?filters[follower][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[following][id][$notNull]=true&populate=*`;
  
  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  return data?.data || [];
}

/**
 * Check if a connection is mutual
 * GET /api/connections?filters[follower][documentId]=A&filters[following][documentId]=B&filters[is_mutual]=true
 */
export async function checkMutualStatus(followerId: string, followingId: string) {
  const headers = getAuthHeaders();
  const url = `${API_URL}/api/connections?filters[follower][documentId][$eq]=${followerId}&filters[following][documentId][$eq]=${followingId}&filters[is_mutual][$eq]=true`;
  
  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  return data?.data?.length > 0;
}

/**
 * Get real-time accurate counts from the connections collection meta
 */
export async function getNetworkingCounts(profileId: string) {
  const headers = getAuthHeaders();
  
  // Use fields=[id] and pageSize=1 to get ONLY metadata total with minimal payload
  const followersUrl = `${API_URL}/api/connections?filters[following][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[follower][id][$notNull]=true&pagination[pageSize]=1&fields[0]=id`;
  const followingUrl = `${API_URL}/api/connections?filters[follower][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[following][id][$notNull]=true&pagination[pageSize]=1&fields[0]=id`;

  try {
    const [followersRes, followingRes] = await Promise.all([
      fetch(followersUrl, { method: "GET", headers }),
      fetch(followingUrl, { method: "GET", headers })
    ]);

    const [followersData, followingData] = await Promise.all([
      followersRes.json(),
      followingRes.json()
    ]);

    return {
      followers: followersData?.meta?.pagination?.total || 0,
      following: followingData?.meta?.pagination?.total || 0
    };
  } catch (error) {
    console.error("Error fetching networking counts:", error);
    return { followers: 0, following: 0 };
  }
}
