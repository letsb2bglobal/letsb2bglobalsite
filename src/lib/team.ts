import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.letsb2b.com";

export interface TeamMember {
  id: number;
  documentId: string;
  role: "Owner" | "Admin" | "Manager" | "Staff" | "Viewer";
  status: "Active" | "Suspended" | "Invited";
  full_name?: string;
  email: string;
}

export interface TeamInvitation {
  id: number;
  documentId: string;
  email: string;
  role: string;
  status: string;
}

export interface MyPermissions {
  role: string;
  permissions: string[];
  isOwner: boolean;
}

/**
 * Fetch team members for a company
 */
export const getTeamMembers = async (companyDocumentId: string): Promise<TeamMember[]> => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/company-team-members?filters[company_profile][documentId]=${companyDocumentId}&populate=*`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch team members");
  }

  const result = await response.json();
  return result.data || [];
};

/**
 * Invite a new member
 */
export const inviteMember = async (data: {
  email: string;
  role: string;
  permission_level: string;
  company_profile_id: string;
}) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/team-invitations/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "Failed to send invitation");
  }

  return await response.json();
};

/**
 * Add a member directly without invitation token
 */
export const addDirectMember = async (data: {
  email: string;
  role: string;
  company_profile_id: string;
  full_name?: string;
  designation?: string;
}) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/company-team-members/add-direct`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.message || error?.error?.message || "Failed to add member directly");
  }

  return await response.json();
};

/**
 * Resend invitation
 */
export const resendInvitation = async (invitationId: string) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/team-invitations/${invitationId}/resend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to resend invitation");
  }

  return await response.json();
};

/**
 * Remove team member
 */
export const removeTeamMember = async (memberDocumentId: string) => {
  const token = getToken();
  const response = await fetch(`${API_URL}/api/company-team-members/${memberDocumentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "Failed to remove team member");
  }

  return await response.json();
};

/**
 * Accept invitation
 */
export const acceptInvitation = async (token: string) => {
  const authToken = getToken();
  const response = await fetch(`${API_URL}/api/team-invitations/accept`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "Failed to accept invitation");
  }

  return await response.json();
};

/**
 * Get current user's permissions
 */
export const getMyPermissions = async (): Promise<MyPermissions> => {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  try {
    const response = await fetch(`${API_URL}/api/company-team-members/my-permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return a default "Viewer" structure if no specific permissions found
        return { role: "Viewer", permissions: [], isOwner: false };
      }
      throw new Error("Failed to fetch permissions");
    }

    return await response.json();
  } catch (error) {
    console.error("Permission fetch error:", error);
    return { role: "Viewer", permissions: [], isOwner: false };
  }
};
