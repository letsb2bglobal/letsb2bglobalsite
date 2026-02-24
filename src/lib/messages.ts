import { getToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

export interface Conversation {
  id: number;
  documentId: string;
  userAId: number;
  userBId: number;
  enquiryId?: number | null;
  isActive: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: number;
  documentId: string;
  conversationId: number;
  senderUserId: number;
  message: string;
  messageType: 'text' | 'image' | 'file';
  media?: any;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all conversations for the current user
 * Spec 2.1: GET /api/conversations?sort=lastMessageAt:desc
 * The backend automatically filters this to only show relevant threads.
 */
export const fetchUserConversations = async (): Promise<Conversation[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const query = new URLSearchParams({
    'sort': 'lastMessageAt:desc'
  });

  const response = await fetch(`${API_URL}/api/conversations?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch conversations");
  const result = await response.json();
  return result.data;
};

/**
 * Fetch a single conversation by its documentId
 */
export const fetchConversationById = async (convDocId: string): Promise<Conversation> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_URL}/api/conversations/${convDocId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) throw new Error("Failed to fetch conversation");
  const result = await response.json();
  return result.data;
};

/**
 * Find or create a conversation between two users
 * Spec 2.3: Check if exists between userA and userB, else create.
 */
export const getOrCreateConversation = async (userAId: number, userBId: number): Promise<Conversation> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  // Step 1: Check existing
  const findQuery = new URLSearchParams({
    'filters[$or][0][userAId]': userAId.toString(),
    'filters[$or][0][userBId]': userBId.toString(),
    'filters[$or][1][userAId]': userBId.toString(),
    'filters[$or][1][userBId]': userAId.toString()
  });

  const findRes = await fetch(`${API_URL}/api/conversations?${findQuery.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (findRes.ok) {
    const findResult = await findRes.json();
    // We need to find the one where BOTH match (Strapi OR might be loose)
    const match = findResult.data?.find((c: any) => 
      (Number(c.userAId) === userAId && Number(c.userBId) === userBId) ||
      (Number(c.userAId) === userBId && Number(c.userBId) === userAId)
    );
    if (match) return match;
  }

  // Step 2: Create
  const response = await fetch(`${API_URL}/api/conversations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        userAId,
        userBId,
        isActive: true,
        lastMessageAt: new Date().toISOString()
      }
    })
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || "Failed to start conversation");
  return result.data;
};

/**
 * Fetch messages for a conversation
 * Spec 2.2: GET /api/messages?filters[conversationId]=ID&sort=createdAt:asc
 */
export const fetchChatMessages = async (conversationId: number, lastCreatedAt?: string): Promise<Message[]> => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const query = new URLSearchParams({
    'filters[conversationId]': conversationId.toString(),
    'sort': 'createdAt:asc'
  });

  if (lastCreatedAt) {
    query.append('filters[createdAt][$gt]', lastCreatedAt);
  }

  const url = `${API_URL}/api/messages?${query.toString()}`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (e) {
    result = { raw: responseText };
  }

  if (!response.ok) {
    console.error("IM Fetch Error Body:", result);
    throw new Error(result?.error?.message || `IM Fetch Failed (${response.status})`);
  }
  
  return result.data;
};

/**
 * Send a chat message
 * Spec 2.4: POST /api/messages
 */
export const sendChatMessage = async (conversationId: number, text: string) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const response = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: {
        conversationId: conversationId,
        message: text,
        messageType: 'text'
      }
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message || "Failed to send message");
  }
  return await response.json();
};

/**
 * Upload chat media
 */
export const uploadChatMedia = async (conversationId: number, message: string, files: File[]) => {
  const token = getToken();
  if (!token) throw new Error("No auth token");

  const formData = new FormData();
  formData.append('data', JSON.stringify({ conversationId: conversationId, message }));
  files.forEach(file => formData.append('files', file));

  const response = await fetch(`${API_URL}/api/messages/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  if (!response.ok) throw new Error("Failed to upload media");
  return await response.json();
};
