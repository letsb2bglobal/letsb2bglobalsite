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
  user_profile: number;
}

/**
 * Upload KYC documents + metadata using multipart/form-data.
 * - Files are sent as fields:
 *   - files.company_license
 *   - files.gst_certificate
 *   - files.pan_copy
 *   - files.tourism_license
 * - Data object is stringified into a single "data" field.
 */
export const uploadKYCWithData = async (
  files: KYCDocumentFiles,
  data: KYCUploadData
): Promise<any> => {
  const token = getToken();
  if (!token) throw new Error("No authentication token found");

  const formData = new FormData();

  if (files.company_license instanceof File) {
    formData.append("files.company_license", files.company_license);
  }
  if (files.gst_certificate instanceof File) {
    formData.append("files.gst_certificate", files.gst_certificate);
  }
  if (files.pan_copy instanceof File) {
    formData.append("files.pan_copy", files.pan_copy);
  }
  if (files.tourism_license instanceof File) {
    formData.append("files.tourism_license", files.tourism_license);
  }

  formData.append("data", JSON.stringify(data));

  // Debug logging
  console.log("=== KYC Upload Debug ===");
  console.log("API URL:", `${API_URL}/api/kyc-documents/upload`);
  console.log("Data being sent:", data);
  console.log("Files:", {
    company_license: files.company_license?.name,
    gst_certificate: files.gst_certificate?.name,
    pan_copy: files.pan_copy?.name,
    tourism_license: files.tourism_license?.name,
  });

  const response = await fetch(`${API_URL}/api/kyc-documents/upload`, {
    method: "POST",
    headers: {
      // Let the browser set Content-Type with the proper boundary
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  // Debug response
  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    let message = "Failed to upload KYC documents";
    let errorDetails = null;
    try {
      errorDetails = await response.json();
      console.log("Error response:", errorDetails);
      message = errorDetails?.error?.message || message;
    } catch {
      console.log("Could not parse error response");
    }
    throw new Error(message);
  }

  const result = await response.json();
  console.log("Success response:", result);
  return result;
};
