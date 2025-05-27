import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { chatController } from '../../../controllers/chatController';
import { createChatService, type ChatRequest, type ChatResponse } from '../../../services/chatService';

interface MockResponse {
  status: ReturnType<typeof vi.fn>;
  json: ReturnType<typeof vi.fn>;
  cookie: ReturnType<typeof vi.fn>;
  clearCookie: ReturnType<typeof vi.fn>;
}

// Mock the chat service
vi.mock('../../../services/chatService', () => ({
  createChatService: vi.fn(() => ({
    handleChat: vi.fn().mockResolvedValue({
      message: 'Test response',
      sessionId: 'test-session-id'
    }),
    clearSession: vi.fn()
  })),
  // Export types to satisfy TypeScript
  ChatRequest: {},
  ChatResponse: {}
}));
describe('Chat Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: MockResponse;
  const mockChatService = createChatService({} as any);
  
  beforeEach(() => {
    mockRequest = {
      body: { message: 'Test message' },
      user: { userId: 'user123', role: 'admin' },
      cookies: { chatSessionId: 'test-session-id' }
    };
    
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
      clearCookie: vi.fn()
    };

    // Reset mocks before each test
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.clearAllMocks();
  });
  
  describe('handleChatMessage', () => {
    it('should return a successful response with message', async () => {
      await chatController.handleChatMessage(
        mockRequest as Request, 
        mockResponse as unknown as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Test response',
        sessionId: 'test-session-id'
      });
    });
    
    it('should create a new session if none exists', async () => {
      mockRequest.cookies = {};
      
      await chatController.handleChatMessage(
        mockRequest as Request, 
        mockResponse as unknown as Response
      );
      
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });
    
    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;
      
      await chatController.handleChatMessage(
        mockRequest as Request, 
        mockResponse as unknown as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User not authenticated'
      });
    });
  });
  
  describe('clearChatSession', () => {
    it('should clear the session and return success', async () => {
      await chatController.clearChatSession(
        mockRequest as Request, 
        mockResponse as unknown as Response
      );
      
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('chatSessionId');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Chat session cleared'
      });
    });
    
    it('should return 400 if no session exists', async () => {
      mockRequest.cookies = {};
      
      await chatController.clearChatSession(
        mockRequest as Request, 
        mockResponse as unknown as Response
      );
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'No active chat session'
      });
    });
  });
});
