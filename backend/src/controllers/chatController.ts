import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import {
  processChatMessage,
  clearChatSession,
  getChatHistory,
  initializeChatService,
  updateChatConfig,
  type ChatMessageRequest
} from '../services/chatService';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError
} from '../types/errors';

// Define request body interface
interface ChatRequestBody {
  message: string;
}

interface RequestWithUser extends Omit<Request<ParamsDictionary, any, ChatRequestBody, ParsedQs>, 'user'> {
  user?: {
    userId: string;
    role: string;
  };
}

// Rule applied: Use functional and declarative programming patterns; avoid classes
export const chatController = {
  /**
   * Initialize the chat service
   */
  initialize(): void {
    // Initialize the chat service with environment variables
    initializeChatService({
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 500,
      historyLimit: 10
    });
  },

  /**
   * Handle chat messages
   */
  async handleChatMessage(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      const userId = req.user?.userId;
      
      // Get or create a session ID from cookies
      let sessionId = req.cookies?.chatSessionId;
      if (!sessionId) {
        sessionId = uuidv4();
        res.cookie('chatSessionId', sessionId, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      // Process the chat message using the service layer
      const response = await processChatMessage({
        message,
        userId: userId || '',
        sessionId
      });

      // Rule applied: Always ensure the response format matches the OpenAPI specification
      res.status(200).json({
        success: true,
        message: response.message,
        sessionId: response.sessionId
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      
      // Handle different types of errors
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else if (error instanceof AuthenticationError) {
        res.status(401).json({
          success: false,
          error: error.message
        });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          error: error.message
        });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to process chat message'
        });
      }
    }
  },

  /**
   * Clear chat session
   */
  async clearChatSession(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const sessionId = req.cookies?.chatSessionId;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'No active chat session'
        });
        return;
      }

      // Clear the session using the service layer
      clearChatSession(sessionId);
      
      // Clear the session cookie
      res.clearCookie('chatSessionId');

      res.status(200).json({
        success: true,
        message: 'Chat session cleared'
      });
    } catch (error) {
      console.error('Clear chat session error:', error);
      
      // Handle different types of errors
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to clear chat session'
        });
      }
    }
  },

  /**
   * Get chat history for a session
   */
  async getChatHistory(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const sessionId = req.cookies?.chatSessionId || req.query.sessionId as string;
      
      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
        return;
      }

      // Get chat history using the service layer
      const history = getChatHistory(sessionId);

      res.status(200).json({
        success: true,
        history,
        sessionId
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          error: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to get chat history'
        });
      }
    }
  }
};

// Initialize the chat service when the controller is loaded
chatController.initialize();
