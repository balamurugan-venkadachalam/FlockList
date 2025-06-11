import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../providers/types';
import { ChatSession, ChatSessionManager } from './types';
import { ValidationError } from '../../../types/errors';

//
const sessions = new Map<string, ChatSession>();

/**
 * Create an in-memory chat session manager
 *
 */
export function createMemorySessionManager(): ChatSessionManager {
  return {
    getOrCreateSession: (sessionId: string, userId: string): ChatSession => {
      // Generate a new session ID if not provided
      const chatSessionId = sessionId || uuidv4();
      
      // Return existing session if it exists
      if (sessions.has(chatSessionId)) {
        const session = sessions.get(chatSessionId)!;
        
        // Update the session's last updated time
        session.updatedAt = new Date();
        
        return session;
      }
      
      // Create a new session
      const newSession: ChatSession = {
        sessionId: chatSessionId,
        userId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store the new session
      sessions.set(chatSessionId, newSession);
      
      return newSession;
    },
    
    addMessage: (sessionId: string, message: ChatMessage): void => {
      if (!sessionId) {
        throw new ValidationError('Session ID is required');
      }
      
      // Get or create session
      const session = sessions.get(sessionId);
      
      if (!session) {
        throw new ValidationError(`Session ${sessionId} not found`);
      }
      
      // Add message to session
      session.messages.push(message);
      
      // Update session's last updated time
      session.updatedAt = new Date();
    },
    
    getMessages: (sessionId: string): ChatMessage[] => {
      if (!sessionId) {
        throw new ValidationError('Session ID is required');
      }
      
      // Get session
      const session = sessions.get(sessionId);
      
      if (!session) {
        return [];
      }
      
      return [...session.messages];
    },
    
    clearSession: (sessionId: string): void => {
      if (!sessionId) {
        throw new ValidationError('Session ID is required');
      }
      
      // Delete session
      sessions.delete(sessionId);
    },
    
    trimSessionHistory: (sessionId: string, maxMessages: number): ChatMessage[] => {
      if (!sessionId) {
        throw new ValidationError('Session ID is required');
      }
      
      // Get session
      const session = sessions.get(sessionId);
      
      if (!session) {
        return [];
      }
      
      // If we have fewer messages than the limit, return all messages
      if (session.messages.length <= maxMessages) {
        return [...session.messages];
      }
      
      // Keep system messages and the most recent messages up to the limit
      const systemMessages = session.messages.filter(msg => msg.role === 'system');
      const nonSystemMessages = session.messages.filter(msg => msg.role !== 'system');
      
      // Calculate how many non-system messages we can keep
      const maxNonSystemMessages = maxMessages - systemMessages.length;
      
      // Get the most recent non-system messages
      const recentMessages = nonSystemMessages.slice(-maxNonSystemMessages);
      
      // Combine system messages and recent messages
      const trimmedMessages = [...systemMessages, ...recentMessages];
      
      // Update the session with trimmed messages
      session.messages = trimmedMessages;
      
      return trimmedMessages;
    }
  };
}
