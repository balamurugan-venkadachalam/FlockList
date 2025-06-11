//
import * as path from 'path';
import * as fs from 'fs';

/**
 * Load environment variables from .env files in multiple locations
 *
 */
export function loadEnvFiles(): void {
  try {
    const dotenv = require('dotenv');
    
    // Try to load from backend directory first
    const backendEnvPath = path.resolve(process.cwd(), '.env');
    
    // Then try to load from project root directory
    const projectRootEnvPath = path.resolve(process.cwd(), '..', '.env');
    
    // Check which files exist
    const backendEnvExists = fs.existsSync(backendEnvPath);
    const projectRootEnvExists = fs.existsSync(projectRootEnvPath);
    
    console.log('Checking for .env files:');
    console.log(`- Backend .env (${backendEnvPath}): ${backendEnvExists ? 'Found' : 'Not found'}`);
    console.log(`- Project root .env (${projectRootEnvPath}): ${projectRootEnvExists ? 'Found' : 'Not found'}`);
    
    // Create a merged environment object
    const mergedEnv: Record<string, string> = {};
    
    // Function to read and parse .env file
    const parseEnvFile = (filePath: string): Record<string, string> => {
      try {
        if (!fs.existsSync(filePath)) return {};
        
        const content = fs.readFileSync(filePath, 'utf8');
        const env: Record<string, string> = {};
        
        content.split('\n').forEach(line => {
          // Skip comments and empty lines
          if (!line || line.startsWith('#')) return;
          
          // Parse key=value pairs
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
          if (match) {
            const key = match[1];
            let value = match[2];
            
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || 
                (value.startsWith('\'') && value.endsWith('\'')))
            {
              value = value.substring(1, value.length - 1);
            }
            
            env[key] = value;
          }
        });
        
        return env;
      } catch (error) {
        console.warn(`Error parsing .env file ${filePath}:`, error);
        return {};
      }
    };
    
    // Parse both .env files
    const projectRootEnv = projectRootEnvExists ? parseEnvFile(projectRootEnvPath) : {};
    const backendEnv = backendEnvExists ? parseEnvFile(backendEnvPath) : {};
    
    // Merge environments (backend takes precedence)
    Object.assign(mergedEnv, projectRootEnv, backendEnv);
    
    // Set environment variables
    Object.entries(mergedEnv).forEach(([key, value]) => {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
    
    // Log available API keys (safely)
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    console.log('API keys after loading and merging .env files:');
    console.log(`- OPENAI_API_KEY: ${openaiKey ? `Found (length: ${openaiKey.length})` : 'Not found'}`);
    console.log(`- ANTHROPIC_API_KEY: ${anthropicKey ? `Found (length: ${anthropicKey.length})` : 'Not found'}`);
    console.log(`- OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'not set'}`);
    
    // If no API keys were found, warn the user
    if (!openaiKey && !anthropicKey) {
      console.warn('No API keys found in any .env file. Chat service will not function properly.');
    }
  } catch (error) {
    console.error('Error loading environment files:', error);
  }
}

// Execute directly if this file is run directly
if (require.main === module) {
  loadEnvFiles();
}
