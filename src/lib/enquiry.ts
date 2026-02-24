import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export interface EnquiryThread {
  id: number;
  documentId: string;
  title: string;
  thread_type: 'enquiry' | 'direct';
  last_message_at: string;
  last_message_preview: string;
  from_company?: {
    company_name: string;
    profileImageUrl: string;
    documentId: string;
    userId: number;
  };
  to_company?: {
    company_name: string;
    profileImageUrl: string;
    documentId: string;
    userId: number;
  };
  last_message_sender?: {
    full_name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryMessage {
  id: number;
  documentId: string;
  message_body: string;
  sender_profile: {
    full_name: string;
    profileImageUrl: string;
    documentId: string;
    userId: number;
  };
  custom_attachments?: any[];
  createdAt: string;
}

export interface ThreadParticipant {
  id: number;
  documentId: string;
  unread_count: number;
  last_read_at: string;
}

/**
 * Fetch the inbox (list of threads)
 * The backend automatically filters these to only show threads where the authenticated user is a participant.
 */
export const fetchEnquiryThreads = async (): Promise<EnquiryThread[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const query = new URLSearchParams({
    'populate[from_company][fields][0]': 'company_name',
    'populate[from_company][fields][1]': 'profileImageUrl',
    'populate[from_company][fields][2]': 'documentId',
    'populate[from_company][fields][3]': 'userId',
    'populate[to_company][fields][0]': 'company_name',
    'populate[to_company][fields][1]': 'profileImageUrl',
    'populate[to_company][fields][2]': 'documentId',
    'populate[to_company][fields][3]': 'userId',
    'populate[last_message_sender][fields][0]': 'full_name',
    'sort': 'last_message_at:desc'
  });

  const response = await fetch(`${API_URL}/api/enquiry-threads?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch inbox");
  const result = await response.json();
  return result.data;
};

/**
 * Start a new enquiry (Step 1: Create Thread, Step 2: Send Message)
 */
export const startEnquiry = async (toCompanyProfileId: string, title: string, initialMessage: string) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  // Step 1: Create Thread
  const threadResponse = await fetch(`${API_URL}/api/enquiry-threads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        title,
        to_company: toCompanyProfileId,
        thread_type: 'enquiry'
      }
    })
  });

  if (!threadResponse.ok) {
    const error = await threadResponse.json();
    throw new Error(error?.error?.message || "Failed to create thread");
  }
  const threadResult = await threadResponse.json();
  const threadDocId = threadResult.data.documentId;

  // Step 2: Send Initial Message
  await sendEnquiryMessage(threadDocId, initialMessage);

  return threadResult.data;
};

/**
 * Send a message in a thread
 */
export const sendEnquiryMessage = async (threadId: string, body: string, attachments: any[] = []) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_URL}/api/enquiry-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        thread: threadId,
        message_body: body,
        attachments
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "Failed to send message");
  }
  return await response.json();
};

/**
 * Load conversation history
 */
export const fetchEnquiryMessages = async (threadId: string, page = 1): Promise<EnquiryMessage[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const query = new URLSearchParams({
    'filters[thread][documentId][$eq]': threadId,
    'populate[sender_profile][fields][0]': 'full_name',
    'populate[sender_profile][fields][1]': 'profileImageUrl',
    'populate[sender_profile][fields][2]': 'documentId',
    'populate[sender_profile][fields][3]': 'userId',
    'pagination[page]': page.toString(),
    'pagination[pageSize]': '30',
    'sort': 'createdAt:asc'
  });

  const response = await fetch(`${API_URL}/api/enquiry-messages?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch messages");
  const result = await response.json();
  return result.data;
};

/**
 * Mark thread as read
 */
export const markThreadAsRead = async (threadId: string, userId: number) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  // Step 1: Find participant record
  const query = new URLSearchParams({
    'filters[thread][documentId][$eq]': threadId,
    'filters[user_profile][userId][$eq]': userId.toString()
  });

  const findResponse = await fetch(`${API_URL}/api/thread-participants?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!findResponse.ok) return;
  const findResult = await findResponse.json();
  const participant = findResult.data?.[0];

  if (!participant) return;

  // Step 2: Update unread count
  await fetch(`${API_URL}/api/thread-participants/${participant.documentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        unread_count: 0,
        last_read_at: new Date().toISOString()
      }
    })
  });
};

/**
 * Upload binary media
 */
export const uploadEnquiryMedia = async (threadId: string, body: string, files: File[]) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const formData = new FormData();
  formData.append('data', JSON.stringify({ thread: threadId, message_body: body }));
  files.forEach(file => formData.append('files', file));

  const response = await fetch(`${API_URL}/api/enquiry-messages/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error?.message || "Failed to upload media");
  }
  return await response.json();
};

/**
 * Find or create a direct message thread with another profile
 */
export const getOrCreateDirectThread = async (targetProfileDocumentId: string): Promise<EnquiryThread> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_URL}/api/enquiry-threads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        title: "Direct Message",
        to_company: targetProfileDocumentId,
        thread_type: 'direct'
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to start direct message");
  }
  
  return result.data;
};

/**
 * Fetch a single thread by its documentId
 */
export const fetchEnquiryThreadById = async (threadId: string): Promise<EnquiryThread> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const query = new URLSearchParams({
    'populate[from_company][fields][0]': 'company_name',
    'populate[from_company][fields][1]': 'profileImageUrl',
    'populate[from_company][fields][2]': 'documentId',
    'populate[from_company][fields][3]': 'userId',
    'populate[to_company][fields][0]': 'company_name',
    'populate[to_company][fields][1]': 'profileImageUrl',
    'populate[to_company][fields][2]': 'documentId',
    'populate[to_company][fields][3]': 'userId',
    'populate[last_message_sender][fields][0]': 'full_name',
  });

  const response = await fetch(`${API_URL}/api/enquiry-threads/${threadId}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Thread not found");
  const result = await response.json();
  return result.data;
};
