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
 * Get the list of people following a profile (people who follow this user)
 * GET /api/connections?filters[following][id]={numericId}&filters[status]=active&populate[follower][fields]=full_name,company_name,profileImageUrl
 */
export async function getFollowers(profileId: string | number, options: { verifiedOnly?: boolean; numericId?: number } = {}) {
  const headers = getAuthHeaders();
  
  // Use numeric ID if provided, otherwise use documentId
  const filterKey = options.numericId ? `filters[following][id]` : `filters[following][documentId][$eq]`;
  const filterValue = options.numericId || profileId;
  
  const fields = encodeURIComponent('full_name,company_name,profileImageUrl,documentId,verified_badge,business_type,city');
  let url = `${API_URL}/api/connections?${filterKey}=${filterValue}&filters[status]=active&populate[follower][fields]=${fields}`;
  
  if (options.verifiedOnly) {
    url += `&filters[is_verified_follow][$eq]=true`;
  }

  console.log('Fetching followers with URL:', url);
  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  console.log('Followers response:', data);
  return data?.data || [];
}

/**
 * Get the list of people a profile is following (who this user follows)
 * GET /api/connections?filters[follower][id]={numericId}&filters[status]=active&populate[following][fields]=full_name,company_name,profileImageUrl
 */
export async function getFollowing(profileId: string | number, options: { numericId?: number } = {}) {
  const headers = getAuthHeaders();
  
  // Use numeric ID if provided, otherwise use documentId
  const filterKey = options.numericId ? `filters[follower][id]` : `filters[follower][documentId][$eq]`;
  const filterValue = options.numericId || profileId;
  
  const fields = encodeURIComponent('full_name,company_name,profileImageUrl,documentId,verified_badge,business_type,city');
  const url = `${API_URL}/api/connections?${filterKey}=${filterValue}&filters[status]=active&populate[following][fields]=${fields}`;
  
  console.log('Fetching following with URL:', url);
  const response = await fetch(url, { method: "GET", headers });
  const data = await response.json();
  console.log('Following response:', data);
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
export async function getNetworkingCounts(profileId: string, numericId?: number) {
  const headers = getAuthHeaders();
  
  // Use numeric ID if provided for more reliable filtering
  let followersUrl: string;
  let followingUrl: string;
  
  if (numericId) {
    // Use numeric ID - more reliable
    followersUrl = `${API_URL}/api/connections?filters[following][id]=${numericId}&filters[status]=active&pagination[pageSize]=1&fields[0]=id`;
    followingUrl = `${API_URL}/api/connections?filters[follower][id]=${numericId}&filters[status]=active&pagination[pageSize]=1&fields[0]=id`;
  } else {
    // Fallback to documentId
    followersUrl = `${API_URL}/api/connections?filters[following][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[follower][id][$notNull]=true&pagination[pageSize]=1&fields[0]=id`;
    followingUrl = `${API_URL}/api/connections?filters[follower][documentId][$eq]=${profileId}&filters[status][$eq]=active&filters[following][id][$notNull]=true&pagination[pageSize]=1&fields[0]=id`;
  }

  console.log('Fetching networking counts:', { followersUrl, followingUrl });

  try {
    const [followersRes, followingRes] = await Promise.all([
      fetch(followersUrl, { method: "GET", headers }),
      fetch(followingUrl, { method: "GET", headers })
    ]);

    const [followersData, followingData] = await Promise.all([
      followersRes.json(),
      followingRes.json()
    ]);

    console.log('Networking counts response:', { followersData, followingData });

    return {
      followers: followersData?.meta?.pagination?.total || 0,
      following: followingData?.meta?.pagination?.total || 0
    };
  } catch (error) {
    console.error("Error fetching networking counts:", error);
    return { followers: 0, following: 0 };
  }
}
