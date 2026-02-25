import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

/**
 * Upload KYC Documents
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
