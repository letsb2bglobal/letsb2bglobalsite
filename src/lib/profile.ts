// User Profile API functions
import { getToken } from "./auth";

// profile.ts

export interface RichTextChild {
  text: string;
  type: string;
}

export interface RichTextBlock {
  type: string;
  children?: RichTextChild[];
}

export interface GalleryImage {
  url: string;
  name?: string;
  id?: number | string;
}

export interface CategoryItem {
  category: string;
  sub_categories: string[];
  description?: string;
}

export interface UserProfile {
  id: number;
  documentId: string;
  company_name: string;
  user_type: "agent" | "service_provider" | "seller" | "buyer" | "both";
  profile_type?: "Individual" | "Company" | "Association";
  email: string;

  country: string;
  city: string;
  state?: string;
  address_text?: string;
  google_map_link?: string;
  pincode?: string;

  // Agent fields
  full_name?: string;
  agency_name?: string;
  designation?: string;
  experience_years?: number;
  specialisation?: string;
  operating_markets?: string[];

  // Organization fields
  legal_entity_name?: string;
  business_type?: any; // was string, now can be string[]
  category_items?: CategoryItem[];
  market_focus?: string;
  languages_supported?: string[];
  certifications?: string[];

  about?: RichTextBlock[] | null;
  vision_mission?: RichTextBlock[] | null;
  website?: string;
  whatsapp?: string;
  social_links?: any;
  brand_tagline?: string;

  slug?: string;
  verified_badge?: boolean;
  founding_member?: boolean;
  profile_status?: "active" | "inactive";

  userId: number;

  profileImageUrl?: string | null;
  headerImageUrl?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  amenities?: string[] | null;

  image_sections?: ImageSection[];

  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  score?: number;

  // Networking attributes (counter caching)
  followers_count?: number;
  following_count?: number;

  gallery_images?: GalleryImage[];
  profile_sections?: any[];
}

export interface ImageSection {
  id?: number;
  Title: string;
  description?: string;
  order: number;
  imageUrls: string[];
  media_type?: "image" | "video";
  section_category?: string;
  visible_for_tier?: string;
}

export interface CreateProfileData {
  company_name?: string;
  user_type: "agent" | "service_provider" | "seller" | "buyer" | "both";
  profile_type?: "Individual" | "Company" | "Association";
  email: string;
  country: string;
  city: string;
  state?: string;
  address_text?: string;
  google_map_link?: string;
  pincode?: string;

  // Agent fields
  full_name?: string;
  agency_name?: string;
  designation?: string;
  experience_years?: number;
  specialisation?: string;
  operating_markets?: string[];

  // Organization fields
  legal_entity_name?: string;
  business_type?: any; // was string, now can be string[]
  category_items?: CategoryItem[];
  market_focus?: string;
  languages_supported?: string[];
  certifications?: string[];
  social_links?: any;
  brand_tagline?: string;
  vision_mission?: RichTextBlock[] | null;

  about?: RichTextBlock[] | null;

  website?: string;
  whatsapp?: string;

  slug: string;
  verified_badge?: boolean;
  founding_member?: boolean;
  profile_status?: "active" | "inactive";

  userId: number;

  profileImageUrl?: string;
  headerImageUrl?: string;

  latitude?: number;
  longitude?: number;

  amenities?: string[];

  image_sections?: ImageSection[];
}

export interface ProfileResponse {
  data: UserProfile[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Upload profile media files (images / documents)
 */
export const uploadProfileMedia = async (files: File[]): Promise<any> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  if (!files || files.length === 0) {
    throw new Error("No files provided");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  const formData = new FormData();

  // IMPORTANT: backend expects key = "files"
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await fetch(`${apiUrl}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ DO NOT set Content-Type for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to upload files");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading media:", error);
    throw error;
  }
};

/**
 * Get onboarding profile for Preview page (step 4)
 * URL: /api/user-profiles?filters[userId][$eq]=ID&populate=*&status=draft
 * Returns the draft profile with all steps 1–3 data populated.
 */
export const getOnboardingProfileDraft = async (
  userId: number
): Promise<UserProfile | null> => {
  const token = getToken();
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const params = new URLSearchParams({
      "filters[userId][$eq]": String(userId),
      populate: "*",
      status: "draft",
    });
    const url = `${apiUrl}/api/user-profiles?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      return null;
    }

    const result = await response.json();
    const data = result.data ?? result;
    const list = Array.isArray(data) ? data : data?.data ?? [data];
    const profile = list[0] ?? null;
    return profile as UserProfile | null;
  } catch (error) {
    console.warn("Error fetching onboarding profile draft:", error);
    return null;
  }
};

/**
 * Check if user profile exists for the given userId
 * URL: /api/user-profiles?filters[userId][$eq]=ID&populate=*
 */
export const checkUserProfile = async (
  userId: number,
  options: { 
    status?: string | null,
    populate?: string 
  } = {}
): Promise<UserProfile | null> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    // Default populate to wildcard if not specified
    const populateQuery = options.populate ? `populate=${options.populate}` : 'populate=*';
    const statusQuery = options.status ? `&status=${options.status}` : '';

    const url = `${apiUrl}/api/user-profiles/by-user/${userId}?${populateQuery}${statusQuery}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to check user profile");
    }

    const result = await response.json();
    const data = result.data || result;
    return data;
  } catch (error) {
    // Network errors (e.g. "Failed to fetch", CORS, API unreachable) - return null instead of throwing
    const isNetworkError = error instanceof TypeError && String((error as Error).message || "").includes("fetch");
    if (isNetworkError) {
      console.warn("Profile API unreachable, check NEXT_PUBLIC_API_URL and network:", error);
      return null;
    }
    console.error("Error checking user profile:", error);
    throw error;
  }
};

/**
 * Get all contexts for the current user (own profile + memberships)
 * URL: /api/user-profiles/me
 */
export const getMyContexts = async (): Promise<{
  exists: boolean;
  ownProfile: UserProfile | null;
  memberships: Array<{
    role: string;
    permission_level: string;
    company_profile: UserProfile;
  }>;
}> => {
  const token = getToken();
  if (!token) return { exists: false, ownProfile: null, memberships: [] };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      if (response.status === 404) return { exists: false, ownProfile: null, memberships: [] };
      console.warn("Failed to fetch user contexts:", response.status);
      return { exists: false, ownProfile: null, memberships: [] };
    }

    const result = await response.json();
    
    // Cache the primary profile in cookies for performance
    if (result.ownProfile) {
      const { setProfileData } = await import("./auth");
      setProfileData(result.ownProfile);
    }

    return result;
  } catch (error) {
    // Network errors (e.g. "Failed to fetch") - return safe fallback
    const isNetworkError = error instanceof TypeError && String((error as Error).message || "").includes("fetch");
    if (isNetworkError) {
      console.warn("User contexts API unreachable:", error);
    } else {
      console.error("Error fetching user contexts:", error);
    }
    return { exists: false, ownProfile: null, memberships: [] };
  }
};

/**
 * Get current user's profile
 * URL: /api/user-profiles/me
 */
export const getMyProfile = async (
  userId: number
): Promise<{ exists: boolean; profile?: UserProfile }> => {
  const token = getToken();
  if (!token) return { exists: false };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/by-user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return { exists: false };
      throw new Error("Failed to fetch my profile");
    }

    const result = await response.json();
    const profile = result.data || result;
    return { exists: !!profile, profile };
  } catch (error) {
    // Network errors (e.g. "Failed to fetch") - return safe fallback
    const isNetworkError = error instanceof TypeError && String((error as Error).message || "").includes("fetch");
    if (isNetworkError) {
      console.warn("Profile API unreachable:", error);
    } else {
      console.error("Error fetching my profile:", error);
    }
    return { exists: false };
  }
};

/**
 * Create a new user profile
 */
// export const createUserProfile = async (
//   profileData: CreateProfileData
// ): Promise<UserProfile> => {
//   const token = getToken();

//   if (!token) {
//     throw new Error("No authentication token found");
//   }

//   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

//   try {
//     const response = await fetch(`${apiUrl}/api/user-profiles`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         data: profileData,
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         errorData?.error?.message || "Failed to create user profile"
//       );
//     }

//     const data = await response.json();
//     return data.data;
//   } catch (error) {
//     console.error("Error creating user profile:", error);
//     throw error;
//   }
// };

export const createUserProfile = async (
  profileData: CreateProfileData
): Promise<UserProfile> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(
      `${apiUrl}/api/user-profiles?populate=image_sections`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: profileData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.error?.message || "Failed to create user profile"
      );
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  documentId: string,
  profileData: Partial<CreateProfileData>
): Promise<UserProfile> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  // Sanitize profileData to remove invalid fields for Strapi update
  const sanitizedData: any = {};
  
  // Only include defined and non-null values to avoid ValidationError for required fields
  Object.keys(profileData).forEach(key => {
    const val = (profileData as any)[key];
    if (val !== undefined && val !== null) {
      sanitizedData[key] = val;
    }
  });

  // 1. Remove root ID if present
  if (sanitizedData.id) {
    delete sanitizedData.id;
  }

  // 2. Sanitize image_sections (remove id and order to prevent Validation Error)
  if (sanitizedData.image_sections && Array.isArray(sanitizedData.image_sections)) {
    sanitizedData.image_sections = sanitizedData.image_sections.map((section: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, order, ...rest } = section;
      return rest;
    });
  }

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/${documentId}?populate=*`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: sanitizedData, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.error?.message || "Failed to update user profile"
      );
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

/**
 * Get all user profiles
 */
export const getAllUserProfiles = async (): Promise<ProfileResponse> => {
  const token = getToken();

  if (!token) {
    return { data: [] };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profiles");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
};

/**
 * Get a single profile by documentId
 */
export const getProfileByDocumentId = async (
  documentId: string
): Promise<UserProfile | null> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/${documentId}?populate=*`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    // API may return { data: profile } (Strapi) or the profile object at top level
    const profile = data?.data ?? data;
    return profile && typeof profile === "object" ? profile : null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Update user profile by numeric id (triggered from Add Additional Info button)
 * PUT /api/user-profiles/:id
 */
export interface UpdateUserProfilePayload {
  company_name?: string;
  business_type?: string[];
  rooms_count?: number;
  description?: string;
  languages?: string[];
  website_link?: string;
  country?: string;
  state?: string;
  city?: string;
  contact_person_name?: string;
  designation?: string;
  email?: string;
  phone_numbers?: string[];
  preferred_collaborations?: string[];
  [key: string]: unknown;
}

export const updateUserProfileById = async (
  profileId: number,
  data: UpdateUserProfilePayload
): Promise<UserProfile | null> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const url = `${apiUrl}/api/user-profiles/${profileId}`;
    const body = JSON.stringify({ data });

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = `Failed to update profile (${response.status})`;
      try {
        const err = JSON.parse(text);
        message = err?.error?.message || message;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    const result = await response.json();
    const profile = result.data ?? result;
    return profile as UserProfile;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const verifyUserProfile = async (userId: number): Promise<boolean> => {
  try {
    const profile = await checkUserProfile(userId);
    return profile !== null;
  } catch (error) {
    console.error("Error verifying user profile:", error);
    return false;
  }
};

/**
 * Update profile image
 */
export const updateProfileImage = async (
  documentId: string,
  image: File | string
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  let body: any;
  const headers: any = {
    Authorization: `Bearer ${token}`,
  };

  if (image instanceof File) {
    const formData = new FormData();
    formData.append("newImage", image);
    body = formData;
    // Don't set Content-Type for FormData
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ newImage: image });
  }

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/profile-image`,
    {
      method: "PATCH",
      headers,
      body,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to update profile image");
  }

  return await response.json();
};

/**
 * Delete profile image
 */
export const deleteProfileImage = async (
  documentId: string
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/profile-image`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to delete profile image");
  }

  return await response.json();
};

/**
 * Update header image
 */
export const updateHeaderImage = async (
  documentId: string,
  image: File | string
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  let body: any;
  const headers: any = {
    Authorization: `Bearer ${token}`,
  };

  if (image instanceof File) {
    const formData = new FormData();
    formData.append("newImage", image);
    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ newImage: image });
  }

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/header-image`,
    {
      method: "PATCH",
      headers,
      body,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to update header image");
  }

  return await response.json();
};

/**
 * Update company logo
 */
export const updateCompanyLogo = async (
  documentId: string,
  image: File | string
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  let body: any;
  const headers: any = {
    Authorization: `Bearer ${token}`,
  };

  if (image instanceof File) {
    const formData = new FormData();
    formData.append("newImage", image);
    body = formData;
  } else {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify({ newImage: image });
  }

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/logo`,
    {
      method: "PATCH",
      headers,
      body,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to update company logo");
  }

  return await response.json();
};

/**
 * Delete header image
 */
export const deleteHeaderImage = async (
  documentId: string
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/header-image`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to delete header image");
  }

  return await response.json();
};

/**
 * Update image sections (Gallery)
 */
export const updateImageSections = async (
  documentId: string,
  imageSections: ImageSection[]
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  const response = await fetch(
    `${apiUrl}/api/user-profiles/${documentId}/image-sections`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_sections: imageSections }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to update image sections");
  }

  return await response.json();
};

/**
 * Search user profiles by text and location
 */
export const searchUserProfiles = async (
  text: string,
  location: string
): Promise<ProfileResponse> => {
  const token = getToken();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
  
  // Clean up parameters
  const params = new URLSearchParams();
  if (text) params.append("text", text);
  if (location) params.append("location", location);

  try {
    const response = await fetch(`${baseUrl}/api/user-profiles/search?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to search user profiles");
    }

    const result = await response.json();
    
    // Handle both raw array and Strapi-style response { data: [] }
    if (Array.isArray(result)) {
      return { data: result };
    }
    
    return result;
  } catch (error) {
    console.error("Error searching user profiles:", error);
    throw error;
  }
};
/**
 * Complete a profile step using the new 3-part flow API
 */
export const completeProfileStep = async (
  step: number,
  data: any
): Promise<{ success: boolean; data: any; nextStep?: number; userType?: string }> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/complete-step`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ step, data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to complete step ${step}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error completing step ${step}:`, error);
    throw error;
  }
};

/**
 * Onboarding step payload - matches POST /api/user-profiles/onboarding-step contract.
 * Each step sends only the relevant fields; backend persists and returns onboarding_step for resume.
 */
export interface OnboardingStepPayload {
  step: number;
  business_type?: string[];
  company_name?: string;
  business_details?: Record<string, unknown>;
  preferred_collaborations?: string[];
}

export interface OnboardingStepResponse {
  success: boolean;
  data?: Record<string, unknown>;
  onboarding_step?: number;
  nextStep?: number;
  userType?: string;
}

/**
 * Complete a profile onboarding step using the new 4-part flow API.
 * Body format: { data: payload }
 */
export const completeOnboardingStep = async (
  payload: OnboardingStepPayload
): Promise<OnboardingStepResponse> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const url = `${apiUrl}/api/user-profiles/onboarding-step`;
    const body = JSON.stringify({ data: payload });
    console.log("[completeOnboardingStep] POST", url, "payload:", payload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await response.text();

    if (!response.ok) {
      let message = `Failed to complete onboarding step (${response.status})`;
      try {
        const errorData = JSON.parse(text);
        message = errorData?.error?.message || message;
      } catch {
        if (text) message = text;
      }
      throw new Error(message);
    }

    if (!text) return { success: true };

    try {
      return JSON.parse(text) as OnboardingStepResponse;
    } catch {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error(`Error completing onboarding step:`, error);
    throw error;
  }
};

/**
 * Get profile by document ID using custom endpoint provided by user
 */
export const getProfileByDocumentIdCustom = async (
  documentId: string
): Promise<UserProfile | null> => {
  const token = getToken();

  if (!token) {
    // throw new Error("No authentication token found");
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(
      `${apiUrl}/api/user-profiles/by-document/${documentId}?populate[0]=image_sections&populate[1]=category_items&populate[2]=profile_image&populate[3]=header_image`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) return null;
      // throw new Error("Failed to fetch user profile by document ID");
      return null;
    }

    const result = await response.json();
    const data = result.data || result;
    return data;
  } catch (error) {
    console.error("Error fetching user profile by document ID:", error);
    throw error;
  }
};

/**
 * Single Endpoint for Everything (Update)
 * POST /api/user-profiles/:profileId/update-profile
 */
export const saveFullProfile = async (
  profileId: string,
  textData: {
    company_name?: string;
    about?: string;
    category?: { main: string; sub: string[] };
    sub_categories?: string[];
    social_links?: Record<string, string>;
    country?: string;
    state?: string;
    city?: string;
    contact_person_name?: string;
    mobile_number?: string;
    email?: string;
    website?: string;
  },
  profileImageFile?: File,
  galleryFiles?: File[]
): Promise<any> => {
  const token = getToken();
  if (!token) return { success: false, error: 'No token' };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
  const formData = new FormData();

  // 1. All text fields as JSON string
  formData.append('data', JSON.stringify(textData));

  // 2. Profile image (optional)
  if (profileImageFile) {
    formData.append('profile_image', profileImageFile);
  }

  // 3. Gallery photos (optional, multiple)
  if (galleryFiles?.length) {
    galleryFiles.forEach(file => formData.append('photos', file));
  }

  try {
    const res = await fetch(`${apiUrl}/api/user-profiles/${profileId}/update-profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    return await res.json();
  } catch (error) {
    console.error("Error saving full profile:", error);
    return { success: false, error };
  }
};

/**
 * Delete a Gallery Photo
 * DELETE /api/user-profiles/:profileId/gallery
 */
export const deleteGalleryPhoto = async (profileId: string, imageUrl: string): Promise<any> => {
  const token = getToken();
  if (!token) return { success: false };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
  try {
    const res = await fetch(`${apiUrl}/api/user-profiles/${profileId}/gallery`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: imageUrl })
    });
    return await res.json();
  } catch (error) {
    console.error("Error deleting gallery photo:", error);
    return { success: false };
  }
};

/**
 * Fetch Full Profile (Everything in One Call)
 * GET /api/user-profiles/:profileId?populate[profile_sections][populate][profile_items]=*&populate[gallery_images]=*
 */
export const getFullProfile = async (profileId: string): Promise<UserProfile | null> => {
  const token = getToken();
  if (!token) return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";
  try {
    const params = new URLSearchParams({
      "populate[profile_sections][populate][profile_items]": "*",
      "populate[gallery_images]": "*",
      "populate[profile_image]": "*", 
    });
    
    const response = await fetch(`${apiUrl}/api/user-profiles/${profileId}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch full profile: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error("Error fetching full profile:", error);
    return null;
  }
};
