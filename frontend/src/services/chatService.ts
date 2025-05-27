import axios from 'axios';
import { ChatMessage, ChatResponse } from '@/types/chat';

// Rule applied: Use TypeScript for all code; prefer interfaces over types
export interface ChatMessageRequest {
  message: string;
}

export interface ChatSessionResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
  error?: string;
}

export interface ChatHistoryResponse {
  success: boolean;
  history: Array<{
    role: string;
    content: string;
  }>;
  sessionId: string;
  error?: string;
}

// API base URL
const API_URL = '/api';

/**
 * Send a message to the chat API
 * @param message The message to send
 * @returns Promise with the chat response
 */
export const sendChatMessage = async (message: string): Promise<ChatSessionResponse> => {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Store session ID in local storage if provided
    if (response.data.sessionId) {
      localStorage.setItem('chatSessionId', response.data.sessionId);
    }
    
    return response.data;
  } catch (error: any) {
    // Rule applied: Implement proper error handling
    console.error('Chat service error:', error);
    throw error.response?.data?.error || error.message || 'Failed to send message';
  }
};

/**
 * Clear the current chat session
 * @returns Promise with the response
 */
export const clearChatSession = async (): Promise<ChatResponse> => {
  try {
    const response = await axios.post(`${API_URL}/chat/clear`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Remove session ID from local storage
    localStorage.removeItem('chatSessionId');
    
    return response.data;
  } catch (error: any) {
    console.error('Clear chat session error:', error);
    throw error.response?.data?.error || error.message || 'Failed to clear chat session';
  }
};

/**
 * Get chat history for the current session
 * @param sessionId Optional session ID (will use from localStorage if not provided)
 * @returns Promise with the chat history
 */
export const getChatHistory = async (sessionId?: string): Promise<ChatHistoryResponse> => {
  try {
    const chatSessionId = sessionId || localStorage.getItem('chatSessionId');
    
    if (!chatSessionId) {
      throw new Error('No active chat session');
    }
    
    const response = await axios.get(`${API_URL}/chat/history`, {
      params: { sessionId: chatSessionId },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Get chat history error:', error);
    throw error.response?.data?.error || error.message || 'Failed to get chat history';
  }
};

/**
 * Format a raw chat history entry to a ChatMessage
 * @param entry Raw chat history entry
 * @returns Formatted ChatMessage
 */
export const formatChatHistoryEntry = (entry: { role: string; content: string }): ChatMessage => {
  const isBotMessage = entry.role === 'assistant' || entry.role === 'system';
  
  return {
    message: entry.content,
    sentTime: new Date().toLocaleTimeString(),
    sender: isBotMessage ? 'bot' : 'user',
    direction: isBotMessage ? 'incoming' : 'outgoing'
  };
};

/**
 * Load chat history from the API and format it for the UI
 * @returns Promise with formatted chat messages
 */
export const loadFormattedChatHistory = async (): Promise<ChatMessage[]> => {
  try {
    const history = await getChatHistory();
    
    if (!history.history || !Array.isArray(history.history)) {
      return [];
    }
    
    // Skip the system message (first message)
    const userMessages = history.history.slice(1);
    
    return userMessages.map(formatChatHistoryEntry);
  } catch (error) {
    console.error('Failed to load formatted chat history:', error);
    return [];
  }
};
