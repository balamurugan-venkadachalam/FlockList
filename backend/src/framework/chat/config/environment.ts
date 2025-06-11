import { ChatServiceConfig } from './types';
import { defaultConfig } from './defaults';

/**
 * Load configuration from environment variables
 *
 */
export function loadEnvironmentConfig(): Partial<ChatServiceConfig> {
  try {
    // Load environment variables from multiple locations
    const { loadEnvFiles } = require('./load-env');
    loadEnvFiles();
    
    // Read API keys from environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY || '';
    // Ensure we use a valid model name - gpt-3.5-turbo is the correct full name
    const openaiModel = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY || '';
    const anthropicModel = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet';
    
    // Validate API keys
    if (openaiApiKey) {
      console.log(`OpenAI API key found (length: ${openaiApiKey.length})`);
    } else {
      console.warn('OpenAI API key is missing');
    }
    
    if (anthropicApiKey) {
      console.log(`Anthropic API key found (length: ${anthropicApiKey.length})`);
    } else {
      console.warn('Anthropic API key is missing');  
    }
    
    // Log available environment variables for debugging (safely)
    console.log('Environment variables loaded:', Object.keys(process.env)
      .filter(key => key.includes('OPENAI') || key.includes('ANTHROPIC'))
      .map(key => `${key}: ${key.includes('KEY') ? '[REDACTED]' : process.env[key]}`));
    
    // Determine which API key and model to use
    let envApiKey = '';
    let envModel = '';
    let provider: 'openai' | 'anthropic' | undefined = undefined;
    
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
    
    return {
      apiKey: envApiKey,
      model: envModel,
      provider
    };
  } catch (error) {
    console.error('Error loading environment configuration:', error);
    return {};
  }
}
