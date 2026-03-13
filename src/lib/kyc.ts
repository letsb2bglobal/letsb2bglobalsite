import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

/**
 * Upload KYC Documents (legacy helper – simple files[] upload).
 * Returns an array of uploaded file objects with S3 URLs.
 */
export const uploadKYCDocuments = async (files: File[]): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/api/kyc-documents/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Failed to upload KYC documents");
  }

  const result = await response.json();
  return result; // Result contains success: true and files array
};

// New structured KYC upload helper matching multipart/form-data curl
export interface KYCDocumentFiles {
  company_license?: File | null;
  gst_certificate?: File | null;
  pan_copy?: File | null;
  tourism_license?: File | null;
}

export interface KYCUploadData {
  year_of_establishment?: number;
  gst_number?: string;
  pan_number?: string;
  notes?: string;
}

export const getKycInfo = async (profileId: string) => {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_URL}/api/kyc-documents/profile/${profileId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch {
    return null;
  }
};

/**
 * Upload KYC documents + metadata using multipart/form-data.
 */
export const uploadKYCWithData = async (
  profileId: string,
  files: KYCDocumentFiles,
  data: KYCUploadData
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const formData = new FormData();

  if (files.company_license instanceof File) {
    formData.append("company_license", files.company_license);
  }
  if (files.gst_certificate instanceof File) {
    formData.append("gst_certificate", files.gst_certificate);
  }
  if (files.pan_copy instanceof File) {
    formData.append("pan_copy", files.pan_copy);
  }
  if (files.tourism_license instanceof File) {
    formData.append("tourism_license", files.tourism_license);
  }

  formData.append("data", JSON.stringify(data));

  const response = await fetch(`${API_URL}/api/kyc-documents/profile/${profileId}`, {
    method: "POST",
    headers: {
      // Let the browser set Content-Type with the proper boundary
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload KYC documents";
    try {
      const errorData = await response.json();
      message = errorData?.error?.message || message;
    } catch {
      // ignore JSON parse errors, keep default message
    }
    throw new Error(message);
  }

  return response.json();
};

export const updateKycMetadata = async (profileId: string, data: KYCUploadData) => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_URL}/api/kyc-documents/profile/${profileId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ data })
  });
  
  if (!response.ok) {
    throw new Error("Failed to update KYC metadata");
  }

  return response.json();
};
