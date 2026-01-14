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

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  apiKey: string;
  model: string;
  temperature?: number;
  maxCompletionTokens?: number;
}

/**
 * OpenAI specific configuration
 */
export interface OpenAIConfig extends ProviderConfig {
  isO3Model?: boolean; // Flag for o3-series models with specific parameter requirements
}

/**
 * Anthropic specific configuration
 */
export interface AnthropicConfig extends ProviderConfig {
  // Anthropic-specific configuration options can be added here
}
