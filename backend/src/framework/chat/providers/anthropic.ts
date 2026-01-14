import Anthropic from '@anthropic-ai/sdk';
import { MessageParam } from '@anthropic-ai/sdk/resources';
import { AnthropicConfig } from '../config/types';
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage, ChatProvider } from './types';

//
let client: Anthropic | null = null;
let config: AnthropicConfig = {
  apiKey: '',
  model: 'claude-3-5-sonnet'
};

/**
 * Create an Anthropic provider
 *
 */
export function createAnthropicProvider(): ChatProvider {
  return {
    getProviderName: () => 'anthropic',
    
    getModelName: () => config.model,
    
    initialize: (providerConfig: AnthropicConfig) => {
      try {
        config = {
          ...config,
          ...providerConfig
        };
        
        client = new Anthropic({
          apiKey: config.apiKey
        });
        
        console.log('Anthropic client initialized successfully for model:', config.model);
      } catch (error) {
        console.error('Error initializing Anthropic client:', error);
        throw new Error(`Failed to initialize Anthropic client: ${(error as Error).message}`);
      }
    },
    
    generateCompletion: async (request: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
      if (!client) {
        throw new Error('Anthropic client not initialized');
      }
      
      try {
        // Convert standard messages to Anthropic format
        const messages: MessageParam[] = request.messages.map(msg => {
          if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          } else if (msg.role === 'assistant') {
            return { role: 'assistant', content: msg.content };
          }
          // Skip system messages as they're handled separately
          return null;
        }).filter(Boolean) as MessageParam[];
        
        // Extract system message if present
        const systemContent = request.systemMessage || '';
        
        // Build request parameters
        const requestParams: any = {
          model: config.model,
          messages: messages,
          max_tokens: config.maxCompletionTokens || 1024,
        };
        
        // Add system message if provided
        if (systemContent) {
          requestParams.system = systemContent;
        }
        
        // Add temperature if specified
        if (config.temperature !== undefined) {
          requestParams.temperature = config.temperature;
        }
        
        // Log parameters safely
        console.log('Sending request to Anthropic with parameters:', JSON.stringify({
          model: requestParams.model,
          messages: '[trimmed for log]',
          system: systemContent ? '[present]' : '[not present]'
        }));
        
        const response = await client.messages.create(requestParams);
        
        // Handle the response content correctly
        let responseMessage = '';
        if (response.content[0] && 'text' in response.content[0]) {
          responseMessage = response.content[0].text;
        }
        
        console.log('Received response from Anthropic');
        
        return {
          message: responseMessage,
          provider: 'anthropic',
          model: config.model
        };
      } catch (error) {
        console.error('Anthropic API error:', error);
        throw error;
      }
    },
    
    convertToStandardMessages: (messages: Array<any>): ChatMessage[] => {
      return messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : 
                (msg.content[0] && 'text' in msg.content[0]) ? msg.content[0].text : ''
      }));
    },
    
    convertFromStandardMessages: (messages: ChatMessage[]): Array<MessageParam> => {
      return messages
        .filter(msg => msg.role !== 'system') // Filter out system messages
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));
    }
  };
}
