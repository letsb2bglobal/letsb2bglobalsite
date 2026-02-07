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

export interface CategoryItem {
  type: string;
  subtype?: string;
  description?: string;
}


export interface UserProfile {
  id: number;
  documentId: string;
  company_name: string;
  user_type: "seller" | "buyer";

  category: {
    type: string;
  } | null;

  country: string;
  city: string;

  about?: RichTextBlock[] | null;
  website?: string;
  whatsapp?: string;

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

  /** ✅ ADD THIS */
  image_sections?: ImageSection[];

  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ImageSection {
  id?: number;
  Title: string;
  description?: string;
  order: number;
  imageUrls: string[];
}

export interface CreateProfileData {
  company_name: string;
  user_type: "seller" | "buyer";
  country: string;
  city: string;

  about?: RichTextBlock[];

  website?: string;
  whatsapp?: string;

  slug: string;
  verified_badge?: boolean;
  founding_member?: boolean;
  profile_status?: "active" | "inactive";

  userId: number;

  profileImageUrl?: string;
  headerImageUrl?: string;

  // category?: {
  //   type: string;
  //   subtype?: string;
  //   description?: string;
  // };

    // categories?: CategoryItem[];

    
  category?: {
    type: string;
    subtype?: string;
    description?: string;
  };

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
 * Check if user profile exists for the given userId
 */
export const checkUserProfile = async (
  userId: number
): Promise<UserProfile | null> => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

  try {
    const response = await fetch(
      `${apiUrl}/api/user-profiles?filters[userId]=${userId}&populate=image_sections`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to check user profile");
    }

    const data: ProfileResponse = await response.json();

    // Return the first profile if it exists, otherwise null
    return data.data && data.data.length > 0 ? data.data[0] : null;
  } catch (error) {
    console.error("Error checking user profile:", error);
    throw error;
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

  try {
    const response = await fetch(`${apiUrl}/api/user-profiles/${documentId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: profileData,
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
    throw new Error("No authentication token found");
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
    const response = await fetch(`${apiUrl}/api/user-profiles/${documentId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
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
