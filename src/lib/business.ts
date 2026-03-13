import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

export interface BusinessInformation {
  documentId: string;
  businessCategory: string;
  businessSubCategory: string;
  yearsOfExperience: number;
  businessCard: string;
  additionalInfo: string;
  businessYouAreFindingFor: string[];
}

/**
 * Fetch business information for a specific profile.
 */
export const getBusinessInfo = async (profileId: string): Promise<BusinessInformation | null> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await fetch(`${API_URL}/api/business-informations/profile/${profileId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch business information");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching business info:", error);
    return null;
  }
};

/**
 * Unified submission for Business Info (Create/Update with Business Card).
 */
export const submitBusinessInfo = async (
  profileId: string,
  data: {
    businessCategory?: string;
    businessSubCategory?: string;
    yearsOfExperience?: number;
    additionalInfo?: string;
    businessYouAreFindingFor?: string[];
  },
  businessCard?: File | null
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const formData = new FormData();

  if (businessCard) {
    formData.append("businessCard", businessCard);
  }

  formData.append("data", JSON.stringify(data));

  const response = await fetch(`${API_URL}/api/business-informations/profile/${profileId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to submit business information");
  }

  return await response.json();
};

/**
 * Update Business Info metadata only.
 */
export const updateBusinessMetadata = async (
  profileId: string,
  data: {
    businessCategory?: string;
    businessSubCategory?: string;
    yearsOfExperience?: number;
    additionalInfo?: string;
    businessYouAreFindingFor?: string[];
  }
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_URL}/api/business-informations/profile/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to update business metadata");
  }

  return await response.json();
};
