import { v4 as uuidv4 } from 'uuid';
import { ChatServiceConfig, createConfig } from './config';
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage, ChatProvider, createChatProvider } from './providers';
import { ChatSessionManager, createMemorySessionManager } from './session';
import { ValidationError, DatabaseError } from '../../types/errors';



// Service instances
let provider: ChatProvider | null = null;
let sessionManager: ChatSessionManager;
let serviceConfig: ChatServiceConfig;

// Initialize session manager
sessionManager = createMemorySessionManager();

/**
 * Interface for chat message request
 */
export interface ChatMessageRequest {
  message: string;
  userId: string;
  sessionId?: string;
}

/**
 * Interface for chat message response
 */
export interface ChatMessageResponse {
  message: string;
  sessionId: string;
}

/**
 * Initialize the chat service with configuration
 *
 */
export function initializeChatService(config: Partial<ChatServiceConfig> = {}): void {
  console.log('initializeChatService called with config:', JSON.stringify({
    ...config,
    apiKey: config.apiKey ? '[REDACTED]' : undefined
  }));
  
  // Load environment variables from multiple locations
  const { loadEnvFiles } = require('./config/load-env');
  loadEnvFiles();
  
  // Create configuration by merging defaults, environment variables, and explicit config
  serviceConfig = createConfig(config);
  
  // Validate API key before creating provider
  if (!serviceConfig.apiKey || serviceConfig.apiKey.trim() === '') {
    console.error('API key is missing or empty. Chat service will not function properly.');
    console.error('Please set the appropriate environment variable: OPENAI_API_KEY or ANTHROPIC_API_KEY');
  }
  
  // Create provider based on configuration
  try {
    provider = createChatProvider(serviceConfig);
    console.log(`Chat service initialized with ${provider.getProviderName()} provider using model ${provider.getModelName()}`);
  } catch (error) {
    console.error('Error initializing chat provider:', error);
    throw new Error(`Failed to initialize chat provider: ${(error as Error).message}`);
  }
}

/**
 * Get system message for the chat
 */
export function getSystemMessage(): ChatMessage {
  return {
    role: 'system',
    content: `You are a helpful assistant. Today is ${new Date().toISOString().split('T')[0]}.`
  };
}

/**
 * Process a chat message and get a response
 *
 */
export async function processChatMessage(params: ChatMessageRequest): Promise<ChatMessageResponse> {
  try {
    if (!provider) {
      throw new Error('Chat service not initialized');
    }
    
    const { message, userId, sessionId: requestedSessionId } = params;
    
    // Validate message
    if (!message || !message.trim()) {
      throw new ValidationError('Message is required');
    }
    
    // Get or create a session
    const session = sessionManager.getOrCreateSession(requestedSessionId || '', userId);
    const chatSessionId = session.sessionId;
    
    // Get session messages
    let messages = sessionManager.getMessages(chatSessionId);
    
    // Add system message if not present
    if (!messages.some(msg => msg.role === 'system')) {
      const systemMessage = getSystemMessage();
      sessionManager.addMessage(chatSessionId, systemMessage);
      messages = sessionManager.getMessages(chatSessionId);
    }
    
    // Add user message to history
    const userMessage: ChatMessage = {
      role: 'user',
      content: message
    };
    sessionManager.addMessage(chatSessionId, userMessage);
    
    // Trim conversation history to prevent token limit issues
    const trimmedMessages = sessionManager.trimSessionHistory(chatSessionId, serviceConfig.historyLimit);
    
    // Generate completion from provider
    const completion = await provider.generateCompletion({
      messages: trimmedMessages,
      systemMessage: getSystemMessage().content
    });
    
    // Add assistant response to history
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: completion.message
    };
    sessionManager.addMessage(chatSessionId, assistantMessage);
    
    return {
      message: completion.message,
      sessionId: chatSessionId,
    };
  } catch (error) {
    console.error("Chat service error:", error);
    throw new DatabaseError(`Failed to process chat message: ${(error as Error).message}`);
  }
}

/**
 * Clear a chat session's history
 */
export function clearChatSession(sessionId: string): void {
  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }
  
  sessionManager.clearSession(sessionId);
}

/**
 * Get all messages for a session
 */
export function getChatHistory(sessionId: string): Array<ChatMessage> {
  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }
  
  return sessionManager.getMessages(sessionId);
}

/**
 * Update chat service configuration
 */
export function updateChatConfig(config: Partial<ChatServiceConfig>): void {
  // Create new configuration by merging current config with updates
  serviceConfig = { ...serviceConfig, ...config };
  
  // Reinitialize provider if API key or model changes
  if (config.apiKey || config.model || config.provider) {
    initializeChatService(serviceConfig);
  }
}
