//
export * from './types';
export * from './defaults';
export * from './environment';

import { ChatServiceConfig } from './types';
import { defaultConfig } from './defaults';
import { loadEnvironmentConfig } from './environment';

/**
 * Create a merged configuration from defaults, environment variables, and explicit config
 *
 */
export function createConfig(config: Partial<ChatServiceConfig> = {}): ChatServiceConfig {
  // Load environment configuration
  const envConfig = loadEnvironmentConfig();
  
  // Merge configurations with priority: explicit config > environment > defaults
  const mergedConfig = { 
    ...defaultConfig, 
    ...envConfig,
    ...config
  };
  
  // Determine provider based on model name or API key format if not explicitly set
  if (!mergedConfig.provider) {
    if (mergedConfig.model.toLowerCase().startsWith('claude') || 
        (mergedConfig.apiKey && mergedConfig.apiKey.startsWith('sk-ant'))) {
      mergedConfig.provider = 'anthropic';
    } else {
      mergedConfig.provider = 'openai';
    }
  }
  
  return mergedConfig;
}
