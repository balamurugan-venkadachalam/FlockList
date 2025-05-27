import { Request, Response } from 'express';
import { createChatService, type ChatRequest } from '../services/chatService';
import { v4 as uuidv4 } from 'uuid';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
// Define request body interface
interface ChatMessageRequest {
  message: string;
}

interface RequestWithUser extends Omit<Request<ParamsDictionary, any, ChatMessageRequest, ParsedQs>, 'user'> {
  user?: {
    userId: string;
    role: string;
  };
}

// Rule applied: Use functional and declarative programming patterns; avoid classes
export const chatController = {
  // Initialize the chat service with environment variables
  chatService: createChatService({
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: 0.7,
  }),

  // Handle chat messages
  async handleChatMessage(req: RequestWithUser, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
        return;
      }

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

      // Process the chat message
      const chatRequest: ChatRequest = {
        message,
        userId,
        sessionId
      };

      const response = await chatController.chatService.handleChat(chatRequest);

      // Rule applied: Always ensure the response format matches the OpenAPI specification
      res.status(200).json({
        success: true,
        message: response.message,
        sessionId: response.sessionId
      });
    } catch (error) {
      console.error('Chat controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    }
  },

  // Clear chat session
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

      // Clear the session
      chatController.chatService.clearSession(sessionId);
      
      // Clear the session cookie
      res.clearCookie('chatSessionId');

      res.status(200).json({
        success: true,
        message: 'Chat session cleared'
      });
    } catch (error) {
      console.error('Clear chat session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to clear chat session'
      });
    }
  }
};
