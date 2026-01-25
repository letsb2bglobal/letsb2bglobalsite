export interface Conversation {
  id: number;
  documentId: string;
  userAId: number;
  userBId: number;
  enquiryId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface ConversationResponse {
  data: Conversation[];
  meta?: any;
}

export interface Message {
  id: number;
  documentId: string;
  conversationId: number;
  senderUserId: number;
  message: string;
  messageType: 'text';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface MessageResponse {
  data: Message[];
  meta?: any;
}

const API_URL = 'https://api.letsb2b.com/api';

/**
 * Find an existing conversation between two users
 */
export const findConversation = async (userAId: number, userBId: number): Promise<Conversation | null> => {
  try {
    // Check both directions (A->B and B->A)
    const apiUrl = `${API_URL}/conversations?filters[$or][0][$and][0][userAId][$eq]=${userAId}&filters[$or][0][$and][1][userBId][$eq]=${userBId}&filters[$or][1][$and][0][userAId][$eq]=${userBId}&filters[$or][1][$and][1][userBId][$eq]=${userAId}`;
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    if (result.data && result.data.length > 0) {
      return result.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error finding conversation:", error);
    return null;
  }
};

/**
 * Create a new conversation or return existing
 */
export const getOrCreateConversation = async (userAId: number, userBId: number, enquiryId: number | null = null) => {
  // 1. Check if exists
  const existing = await findConversation(userAId, userBId);
  if (existing) return existing;

  // 2. Create new if not
  try {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          userAId,
          userBId,
          enquiryId,
          isActive: true
        }
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "Failed to create conversation");
    return result.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

/**
 * Fetch all conversations for a user
 */
export const fetchUserConversations = async (userId: number): Promise<ConversationResponse> => {
  try {
    const apiUrl = `${API_URL}/conversations?filters[$or][0][userAId][$eq]=${userId}&filters[$or][1][userBId][$eq]=${userId}&sort=updatedAt:desc`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "Failed to fetch conversations");
    return result;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

/**
 * Fetch all messages for a conversation
 */
export const fetchMessages = async (conversationId: number): Promise<MessageResponse> => {
  try {
    const apiUrl = `${API_URL}/messages?filters[conversationId][$eq]=${conversationId}&sort=createdAt:asc`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "Failed to fetch messages");
    return result;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

/**
 * Send a new message
 */
export const sendMessage = async (conversationId: number, senderUserId: number, text: string) => {
  try {
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: {
          conversationId,
          senderUserId,
          message: text,
          messageType: "text",
          isRead: false
        }
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result?.error?.message || "Failed to send message");
    return result.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
