import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  DatabaseError,
  AuthorizationError
} from '../types/errors';
import { User } from '../models/User';

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
 * Configuration for the chat service
 */
export interface ChatServiceConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxCompletionTokens: number;
  historyLimit: number;
  provider?: 'openai' | 'anthropic';
}

// Store conversation histories by session ID (in-memory storage)
const sessionMessages = new Map<string, Array<ChatCompletionMessageParam>>();

// AI client instances
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

// Default configuration - will be populated from environment variables
const defaultConfig: ChatServiceConfig = {
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxCompletionTokens: 500,
  historyLimit: 10,
  provider: undefined // Will be determined based on model or API key
};

// Current configuration
let currentConfig: ChatServiceConfig = { ...defaultConfig };

/**
 * Initialize the AI client with configuration
 */
export function initializeChatService(config: Partial<ChatServiceConfig> = {}): void {
  console.log('initializeChatService called with config:', JSON.stringify(config));
  console.log('Environment variables loaded:', Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('ANTHROPIC')));
  
  // Attempt to read from .env file directly if not already loaded
  try {
    require('dotenv').config();
    console.log('Attempted to reload .env file');
  } catch (error) {
    console.warn('Error loading dotenv:', error);
  }
  
  // Read API keys from environment variables
  const openaiApiKey = process.env.OPENAI_API_KEY || '';
  // Ensure we use a valid model name - gpt-3.5-turbo is the correct full name
  const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
  const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet';
  
  // Log the exact model name for debugging
  console.log('OpenAI model from env:', process.env.OPENAI_MODEL);
  
  // For debugging
  console.log('Environment variables after reload:', Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('ANTHROPIC')));
  
  // Determine which API key and model to use
  let envApiKey = '';
  let envModel = '';
  let provider: 'openai' | 'anthropic' = 'openai';
  
  // Prefer Anthropic if that API key is available
  if (anthropicApiKey) {
    envApiKey = anthropicApiKey;
    envModel = anthropicModel;
    provider = 'anthropic';
    console.log('Using Anthropic API key with model:', anthropicModel);
  } else if (openaiApiKey) {
    envApiKey = openaiApiKey;
    envModel = openaiModel;
    provider = 'openai';
    console.log('Using OpenAI API key with model:', openaiModel);
  }
  
  console.log('Environment API Key available:', !!envApiKey);
  console.log('Environment Model available:', !!envModel);
  
  if (envApiKey) {
    console.log('API Key starts with:', envApiKey.substring(0, 10) + '...');
  }
  
  if (envModel) {
    console.log('Model is:', envModel);
  }
  
  // Merge configurations with environment variables taking precedence
  currentConfig = { 
    ...defaultConfig, 
    ...config,
    apiKey: envApiKey || config.apiKey || '',
    model: envModel || config.model || 'gpt-3.5-turbo',
    provider: provider || config.provider || 'openai'
  };
  
  // Double-check provider based on the model or API key format
  if (currentConfig.model.toLowerCase().startsWith('claude') || 
      (currentConfig.apiKey && currentConfig.apiKey.startsWith('sk-ant'))) {
    currentConfig.provider = 'anthropic';
  } else if (currentConfig.apiKey && currentConfig.apiKey.startsWith('sk-')) {
    currentConfig.provider = 'openai';
  } else {
    // Default to OpenAI if we can't determine from the API key format
    currentConfig.provider = 'openai';
  }
  
  console.log('Using provider:', currentConfig.provider);
  
  if (!currentConfig.apiKey) {
    console.error('API key is missing. Chat functionality will not work.');
    return;
  }
  
  try {
    // Initialize the appropriate client based on the provider
    if (currentConfig.provider === 'anthropic') {
      anthropicClient = new Anthropic({
        apiKey: currentConfig.apiKey
      });
      console.log('Anthropic client initialized successfully for model:', currentConfig.model);
    } else {
      // For OpenAI, we need to handle different model types
      const isO3Model = currentConfig.model.startsWith('o3-');
      
      openaiClient = new OpenAI({
        apiKey: currentConfig.apiKey
      });
      console.log('OpenAI client initialized successfully for model:', currentConfig.model);
      
      // Log model-specific parameter requirements
      if (isO3Model) {
        console.log(`Using ${currentConfig.model} model - temperature parameter will be omitted`);
      }
    }
  } catch (error) {
    console.error('Error initializing AI client:', error);
  }
}

/**
 * Get the system message for the chat
 */
function getSystemMessage(): ChatCompletionMessageParam {
  return {
    role: "system",
    content: `You are TaskMaster's AI assistant, designed to help users with task management and organization.
    You can help with:
    - Creating and organizing tasks
    - Setting priorities and deadlines
    - Managing flocks (teams/groups)
    - Answering questions about the application
    
    Always be helpful, concise, and friendly. If you don't know something, admit it and suggest alternatives.
    Current date: ${new Date().toISOString().split('T')[0]}`
  };
}

/**
 * Get or create a conversation history for a session
 */
function getSessionHistory(sessionId: string): Array<ChatCompletionMessageParam> {
  if (!sessionMessages.has(sessionId)) {
    sessionMessages.set(sessionId, [getSystemMessage()]);
  }
  return sessionMessages.get(sessionId)!;
}

/**
 * Trim conversation history to prevent token limit issues
 */
function trimConversationHistory(messages: Array<ChatCompletionMessageParam>): Array<ChatCompletionMessageParam> {
  // Always keep the system message (first message)
  const systemMsg = messages[0];
  
  // If we have more messages than the limit, trim the oldest ones (but keep the system message)
  if (messages.length > currentConfig.historyLimit! + 1) {
    // Calculate how many messages to remove
    const excessMessages = messages.length - (currentConfig.historyLimit! + 1);
    // Remove the oldest messages (after the system message)
    messages = [systemMsg, ...messages.slice(excessMessages + 1)];
  }
  
  return messages;
}

/**
 * Process a chat message and get a response
 */
export async function processChatMessage(params: ChatMessageRequest): Promise<ChatMessageResponse> {
  const { message, userId, sessionId } = params;

  if (!userId) {
    throw new AuthenticationError('User not authenticated');
  }

  if (!message || message.trim() === '') {
    throw new ValidationError('Message cannot be empty');
  }

  // Ensure OpenAI client is initialized
  if (!openaiClient && !anthropicClient) {
    initializeChatService();
    if (!openaiClient && !anthropicClient) {
      throw new DatabaseError('Failed to initialize chat service');
    }
  }

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Generate session ID if not provided
  const chatSessionId = sessionId || `session_${userId}_${Date.now()}`;
  
  try {
    // Get conversation history
    const messages = getSessionHistory(chatSessionId);
    
    // Add user message to history
    messages.push({ role: "user", content: message });
    
    // Trim history if needed
    const trimmedMessages = trimConversationHistory(messages);
    
    let responseMessage = "I'm sorry, I couldn't process that request.";
    
    // Call the appropriate AI API based on the provider
    if (currentConfig.provider === 'anthropic' && anthropicClient) {
      console.log('Using Anthropic API for chat');
      
      // Convert OpenAI format messages to Anthropic format
      // Anthropic only supports 'user' and 'assistant' roles
      const userAndAssistantMessages = trimmedMessages.filter(
        msg => msg.role === 'user' || msg.role === 'assistant'
      );
      
      const anthropicMessages: MessageParam[] = userAndAssistantMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content as string
      }));
      
      // Extract system message for Anthropic's system parameter
      const systemMessage = trimmedMessages.find(msg => msg.role === 'system');
      const systemContent = systemMessage?.content as string || undefined;
      
      console.log('Sending message to Anthropic with system prompt:', systemContent ? 'Yes' : 'No');
      
      try {
        // Prepare request parameters for Anthropic
        const requestParams: any = {
          model: currentConfig.model,
          messages: anthropicMessages,
        };
        
        // Add system message if available
        if (systemContent) {
          requestParams.system = systemContent;
        }
        
        // Add temperature if applicable
        requestParams.temperature = currentConfig.temperature;
        
        // Add max_tokens parameter
        requestParams.max_tokens = currentConfig.maxCompletionTokens || 500;
        
        console.log('Sending request to Anthropic with parameters:', JSON.stringify({
          ...requestParams,
          messages: '[trimmed for log]',
          system: systemContent ? '[present]' : '[not present]'
        }));
        
        const response = await anthropicClient.messages.create(requestParams);
        
        // Handle the response content correctly
        if (response.content[0] && 'text' in response.content[0]) {
          responseMessage = response.content[0].text;
        }
        console.log('Received response from Anthropic');
      } catch (anthropicError) {
        console.error('Anthropic API error:', anthropicError);
        throw anthropicError;
      }
    } else if (openaiClient) {
      console.log('Using OpenAI API for chat');
      
      try {
        // Call OpenAI API with model-specific parameters
        let requestParams: any;
        
        // Check if this is an o3-series model which has specific parameter requirements
        const isO3Model = currentConfig.model.startsWith('o3-');
        
        if (isO3Model) {
          // For o3-series models, use only the required parameters
          requestParams = {
            model: currentConfig.model,
            messages: trimmedMessages,
          };
          console.log(`Using minimal parameters for ${currentConfig.model} model`);
        } else {
          // For other models, use all parameters
          requestParams = {
            model: currentConfig.model,
            messages: trimmedMessages,
            temperature: currentConfig.temperature,
          };
          
          // Add max_tokens parameter if specified
          if (currentConfig.maxCompletionTokens) {
            requestParams.max_tokens = currentConfig.maxCompletionTokens;
          }
        }
        
        // Log parameters safely without causing errors for undefined values
        const logParams: any = {
          model: requestParams.model,
          messages: '[trimmed for log]'
        };
        
        // Only add parameters that exist
        if (requestParams.temperature !== undefined) {
          logParams.temperature = requestParams.temperature;
        }
        
        if (requestParams.max_tokens !== undefined) {
          logParams.max_tokens = requestParams.max_tokens;
        }
        
        console.log('Sending request to OpenAI with parameters:', JSON.stringify(logParams));
        
        const completion = await openaiClient.chat.completions.create(requestParams);

        responseMessage = completion.choices[0]?.message?.content || responseMessage;
        console.log('Received response from OpenAI');
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        throw openaiError;
      }
    } else {
      throw new Error(`No AI client initialized for provider: ${currentConfig.provider}`);
    }
  
    // Add assistant response to history
    trimmedMessages.push({ role: "assistant", content: responseMessage });
    
    // Update session history
    sessionMessages.set(chatSessionId, trimmedMessages);

    return {
      message: responseMessage,
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
  
  sessionMessages.delete(sessionId);
}

/**
 * Get all messages for a session
 */
export function getChatHistory(sessionId: string): Array<ChatCompletionMessageParam> {
  if (!sessionId) {
    throw new ValidationError('Session ID is required');
  }
  
  return sessionMessages.has(sessionId) 
    ? [...sessionMessages.get(sessionId)!] 
    : [];
}

/**
 * Update chat service configuration
 */
export function updateChatConfig(config: Partial<ChatServiceConfig>): void {
  currentConfig = { ...currentConfig, ...config };
  
  // Reinitialize client if API key changes
  if (config.apiKey) {
    initializeChatService(currentConfig);
  }
}
