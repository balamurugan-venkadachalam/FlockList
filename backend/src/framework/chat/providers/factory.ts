import { ChatServiceConfig } from '../config/types';
import { ChatProvider } from './types';
import { createOpenAIProvider } from './openai';
import { createAnthropicProvider } from './anthropic';

/**
 * Create a chat provider based on configuration
 *
 */
export function createChatProvider(config: ChatServiceConfig): ChatProvider {
  // Determine which provider to use based on configuration
  const providerName = config.provider || 'openai';
  
  let provider: ChatProvider;
  
  if (providerName === 'anthropic') {
    provider = createAnthropicProvider();
  } else {
    provider = createOpenAIProvider();
  }
  
  // Initialize the provider with configuration
  provider.initialize({
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxCompletionTokens: config.maxCompletionTokens
  });
  
  return provider;
}
