import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { chatController } from '../../../controllers/chatController';

describe('Chat Controller Unit Tests', () => {
  // Mock request and response objects
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockUserId: string;
  let mockSessionId: string;
  
  // Mock the OpenAI client
  beforeAll(() => {
    // Mock the chat service to avoid actual OpenAI API calls
    vi.spyOn(chatController.chatService, 'handleChat').mockImplementation(async (chatRequest) => {
      return {
        message: 'This is a mock response from the AI assistant.',
        sessionId: chatRequest.sessionId
      };
    });
    
    vi.spyOn(chatController.chatService, 'clearSession').mockImplementation(() => {
      // Mock implementation does nothing
    });
    
    // Set environment variables for testing
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.OPENAI_API_KEY = 'test-openai-api-key';
    process.env.OPENAI_MODEL = 'gpt-3.5-turbo';
  });
  
  beforeEach(() => {
    mockUserId = uuidv4();
    mockSessionId = uuidv4();
    
    // Reset mocks before each test
    mockRequest = {
      user: {
        userId: mockUserId,
        role: 'admin'
      },
      body: {},
      cookies: {}
    };
    
    // Create a mock response object with jest-like spies
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('handleChatMessage', () => {
    it('should process a chat message for authenticated user', async () => {
      // Arrange
      mockRequest.body = { message: 'Hello, TaskMaster!' };
      
      // Act
      await chatController.handleChatMessage(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        sessionId: expect.any(String)
      });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'chatSessionId',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          maxAge: expect.any(Number)
        })
      );
    });
    
    it('should use existing session ID from cookies if available', async () => {
      // Arrange
      mockRequest.body = { message: 'Follow-up message' };
      mockRequest.cookies = { chatSessionId: mockSessionId };
      
      // Act
      await chatController.handleChatMessage(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
        sessionId: mockSessionId
      });
      // Should not set a new cookie
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
    
    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockRequest.body = { message: 'Hello, TaskMaster!' };
      mockRequest.user = undefined;
      
      // Act
      await chatController.handleChatMessage(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated'
      });
    });
  });
  
  describe('clearChatSession', () => {
    it('should clear chat session for authenticated user', async () => {
      // Arrange
      mockRequest.cookies = { chatSessionId: mockSessionId };
      
      // Act
      await chatController.clearChatSession(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(chatController.chatService.clearSession).toHaveBeenCalledWith(mockSessionId);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('chatSessionId');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Chat session cleared'
      });
    });
    
    it('should return 400 when no session exists', async () => {
      // Arrange - no chatSessionId cookie
      mockRequest.cookies = {};
      
      // Act
      await chatController.clearChatSession(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'No active chat session'
      });
      expect(chatController.chatService.clearSession).not.toHaveBeenCalled();
    });
  });
  
  describe('Chat service with error handling', () => {
    it('should handle errors from the chat service', async () => {
      // Arrange
      mockRequest.body = { message: 'Trigger error' };
      mockRequest.cookies = { chatSessionId: mockSessionId };
      
      // Mock the chat service to throw an error
      vi.spyOn(chatController.chatService, 'handleChat').mockRejectedValueOnce(
        new Error('Chat service error')
      );
      
      // Act
      await chatController.handleChatMessage(mockRequest as any, mockResponse as any);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Failed to process chat message'
      });
    });
  });
});
