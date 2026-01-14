import { ChatCompletionMessageParam } from 'openai/resources';
import { ProviderConfig } from '../config/types';

/**
 * Message format for chat providers
 *
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Chat completion request parameters
 */
export interface ChatCompletionRequest {
  messages: ChatMessage[];
  systemMessage?: string;
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  message: string;
  provider: string;
  model: string;
}

/**
 * Chat provider interface
 *
 */
export interface ChatProvider {
  /**
   * Get the provider name
   */
  getProviderName: () => string;
  
  /**
   * Get the model name
   */
  getModelName: () => string;
  
  /**
   * Initialize the provider with configuration
   */
  initialize: (config: ProviderConfig) => void;
  
  /**
   * Generate a chat completion
   */
  generateCompletion: (request: ChatCompletionRequest) => Promise<ChatCompletionResponse>;
  
  /**
   * Convert provider-specific message format to standard format
   */
  convertToStandardMessages: (messages: Array<ChatCompletionMessageParam>) => ChatMessage[];
  
  /**
   * Convert standard message format to provider-specific format
   */
  convertFromStandardMessages: (messages: ChatMessage[]) => Array<any>;
}
