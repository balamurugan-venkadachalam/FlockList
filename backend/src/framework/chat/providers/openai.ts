import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { OpenAIConfig } from '../config/types';
import { ChatCompletionRequest, ChatCompletionResponse, ChatMessage, ChatProvider } from './types';

//
let client: OpenAI | null = null;
let config: OpenAIConfig = {
  apiKey: '',
  model: 'gpt-3.5-turbo'
};

/**
 * Create an OpenAI provider
 *
 */
export function createOpenAIProvider(): ChatProvider {
  return {
    getProviderName: () => 'openai',
    
    getModelName: () => config.model,
    
    initialize: (providerConfig: OpenAIConfig) => {
      try {
        config = {
          ...config,
          ...providerConfig,
          isO3Model: providerConfig.model.startsWith('o3-')
        };
        
        //
        if (!config.apiKey || config.apiKey.trim() === '') {
          throw new Error('OpenAI API key is missing or empty');
        }
        
        client = new OpenAI({
          apiKey: config.apiKey
        });
        
        // Verify the API key is set correctly
        console.log('OpenAI API key configured:', config.apiKey ? 'Yes (key length: ' + config.apiKey.length + ')' : 'No');
        
        console.log('OpenAI client initialized successfully for model:', config.model);
        
        if (config.isO3Model) {
          console.log(`Using ${config.model} model - temperature parameter will be omitted`);
        }
      } catch (error) {
        console.error('Error initializing OpenAI client:', error);
        throw new Error(`Failed to initialize OpenAI client: ${(error as Error).message}`);
      }
    },
    
    generateCompletion: async (request: ChatCompletionRequest): Promise<ChatCompletionResponse> => {
      if (!client) {
        throw new Error('OpenAI client not initialized');
      }
      
      try {
        // Convert messages to OpenAI format
        const messages = request.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })) as ChatCompletionMessageParam[];
        
        // Add system message if provided
        if (request.systemMessage) {
          messages.unshift({
            role: 'system',
            content: request.systemMessage
          });
        }
        
        // Call OpenAI API with model-specific parameters
        let requestParams: any;
        
        // Check if this is an o3-series model which has specific parameter requirements
        if (config.isO3Model) {
          // For o3-series models, use only the required parameters
          requestParams = {
            model: config.model,
            messages: messages,
          };
          console.log(`Using minimal parameters for ${config.model} model`);
        } else {
          // For other models, use all parameters
          requestParams = {
            model: config.model,
            messages: messages,
          };
          
          // Add temperature parameter if specified
          if (config.temperature !== undefined) {
            requestParams.temperature = config.temperature;
          }
          
          // Add max_tokens parameter if specified
          if (config.maxCompletionTokens) {
            requestParams.max_tokens = config.maxCompletionTokens;
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
        
        const completion = await client.chat.completions.create(requestParams);
        const responseMessage = completion.choices[0]?.message?.content || '';
        
        console.log('Received response from OpenAI');
        
        return {
          message: responseMessage,
          provider: 'openai',
          model: config.model
        };
      } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
      }
    },
    
    convertToStandardMessages: (messages: Array<ChatCompletionMessageParam>): ChatMessage[] => {
      return messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content as string
      }));
    },
    
    convertFromStandardMessages: (messages: ChatMessage[]): Array<ChatCompletionMessageParam> => {
      return messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
    }
  };
}
