import { ChatMessage } from '../providers/types';

/**
 * Chat session interface
 *
 */
export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat session manager interface
 *
 */
export interface ChatSessionManager {
  /**
   * Get or create a session
   */
  getOrCreateSession: (sessionId: string, userId: string) => ChatSession;
  
  /**
   * Add a message to a session
   */
  addMessage: (sessionId: string, message: ChatMessage) => void;
  
  /**
   * Get all messages for a session
   */
  getMessages: (sessionId: string) => ChatMessage[];
  
  /**
   * Clear a session
   */
  clearSession: (sessionId: string) => void;
  
  /**
   * Trim session history to prevent token limit issues
   */
  trimSessionHistory: (sessionId: string, maxMessages: number) => ChatMessage[];
}
