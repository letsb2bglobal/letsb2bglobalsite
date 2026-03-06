import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export interface EnquiryThread {
  id: number;
  documentId: string;
  title: string;
  thread_type: 'enquiry' | 'direct' | 'support' | 'broadcast' | 'internal';
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

/**
 * Fetch the inbox (list of threads)
 * The backend automatically filters these to only show threads where the authenticated user is a participant.
 */
export const fetchEnquiryThreads = async (): Promise<EnquiryThread[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  // Using the exact format from the technical guide
  const queryString = "populate[from_company][fields]=company_name,profileImageUrl,documentId&" +
                     "populate[to_company][fields]=company_name,profileImageUrl,documentId&" +
                     "sort=last_message_at:desc";

  const response = await fetch(`${API_URL}/api/enquiry-threads?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch inbox");
  const result = await response.json();
  return result.data;
};

/**
 * Step A: Create the Thread
 * thread_type: 'enquiry' for post-based, 'direct' for user-to-user DM
 */
export const createEnquiryThread = async (targetProfileDocId: string, title: string, threadType: 'enquiry' | 'direct' = 'enquiry'): Promise<EnquiryThread> => {
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
        title,
        to_company: targetProfileDocId,
        thread_type: threadType
      }
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || "Failed to create thread");
  }
  return result.data;
};

/**
 * Send a message in a thread (Scenario A or fallback for Scenario B)
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
 * Fetch conversation history (Step 4)
 */
export const fetchEnquiryMessages = async (threadId: string, page = 1): Promise<EnquiryMessage[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const queryParams = [
    `filters[thread][documentId][$eq]=${threadId}`,
    `populate[sender_profile][fields]=full_name,profileImageUrl,documentId,userId`,
    `sort=createdAt:asc`,
    `pagination[page]=${page}`,
    `pagination[pageSize]=50`
  ].join('&');

  const response = await fetch(`${API_URL}/api/enquiry-messages?${queryParams}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch messages");
  const result = await response.json();
  return result.data;
};

/**
 * Upload binary media (Scenario B)
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
 * Legacy support for old components while transitioning
 */
export const getOrCreateDirectThread = async (targetProfileDocumentId: string): Promise<EnquiryThread> => {
  return createEnquiryThread(targetProfileDocumentId, "Direct Message", 'direct');
};

export const startEnquiry = async (toCompanyProfileId: string, title: string, initialMessage: string) => {
  const thread = await createEnquiryThread(toCompanyProfileId, title, 'enquiry');
  await sendEnquiryMessage(thread.documentId, initialMessage);
  return thread;
};

export const fetchEnquiryThreadById = async (threadId: string): Promise<EnquiryThread> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const queryString = "populate[from_company][fields]=company_name,profileImageUrl,documentId&" +
                     "populate[to_company][fields]=company_name,profileImageUrl,documentId&" +
                     "populate[last_message_sender][fields]=full_name";

  const response = await fetch(`${API_URL}/api/enquiry-threads/${threadId}?${queryString}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Thread not found");
  const result = await response.json();
  return result.data;
};

export const markThreadAsRead = async (threadId: string, userId: number) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const findQuery = `filters[thread][documentId][$eq]=${threadId}&filters[user_profile][userId][$eq]=${userId}`;
  const findResponse = await fetch(`${API_URL}/api/thread-participants?${findQuery}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!findResponse.ok) return;
  const findResult = await findResponse.json();
  const participant = findResult.data?.[0];

  if (!participant) return;

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
