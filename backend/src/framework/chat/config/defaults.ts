import { ChatServiceConfig } from './types';

/**
 * Default configuration values for the chat service
 *
 */
export const defaultConfig: ChatServiceConfig = {
  apiKey: '',
  model: '',
  temperature: 0.7,
  maxCompletionTokens: 500,
  historyLimit: 10,
  provider: undefined // Will be determined based on model or API key
};
