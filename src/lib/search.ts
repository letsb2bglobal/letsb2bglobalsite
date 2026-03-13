import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

export interface BusinessProfile {
  id: number;
  full_name?: string;
  company_name?: string;
  profileImageUrl?: string;
  business_type?: string;
  city?: string;
  tagline?: string;
}

export interface PostSearchResult {
  id: number;
  title?: string;
  description?: string;
  location?: string;
  company_name?: string;
  createdAt?: string;
}

export async function searchBusinessProfiles(text: string, location: string) {
  const token = getToken();
  if (!text && !location) return [];

  const params = new URLSearchParams();
  if (text) params.set("text", text);
  if (location) params.set("location", location);

  const url = `${API_URL}/api/user-profiles/search?${params.toString()}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) {
    console.error("Search API error", res.status);
    return [];
  }

  const data = await res.json();
  // Expecting Strapi-style { data: [...] } but fall back to raw array
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  return items.map((item: any) => {
    const attrs = item.attributes || item;
    return {
      id: attrs.id ?? item.id,
      full_name: attrs.full_name,
      company_name: attrs.company_name,
      profileImageUrl: attrs.profileImageUrl,
      business_type: attrs.business_type,
      city: attrs.city,
      tagline: attrs.tagline,
    } as BusinessProfile;
  });
}

export async function searchPosts(text: string, location: string) {
  const token = getToken();
  if (!text && !location) return [];

  const params = new URLSearchParams();
  if (text) params.set("text", text);
  if (location) params.set("location", location);

  const url = `${API_URL}/api/posts/search?${params.toString()}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { method: "GET", headers });

    // If custom search endpoint returns 404 when there are no matches,
    // treat it as "no results" instead of an error.
    if (res.status === 404) {
      return [];
    }

    if (!res.ok) {
      console.error("Post search API error", res.status);
      return [];
    }

    const data = await res.json();
    const items = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

    return items.map((item: any) => {
      const attrs = item.attributes || item;
      return {
        id: attrs.id ?? item.id,
        title: attrs.title,
        description: attrs.description || attrs.summary || attrs.content,
        location: attrs.location,
        company_name: attrs.company_name,
        createdAt: attrs.createdAt,
      } as PostSearchResult;
    });
  } catch (err) {
    console.error("Post search network error", err);
    return [];
  }
}


