// Rule applied: Use TypeScript for all code; prefer interfaces over types
import * as path from 'path';
import * as fs from 'fs';

// Function to check if a file exists
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    console.error(`Error checking if file exists at ${filePath}:`, error);
    return false;
  }
}

// Function to safely read a file
function safeReadFile(filePath: string): string | null {
  try {
    if (fileExists(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
    return null;
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    return null;
  }
}

// Check for .env files in different locations
const backendEnvPath = path.resolve(process.cwd(), '.env');
const projectRootEnvPath = path.resolve(process.cwd(), '..', '.env');

console.log('Environment File Check:');
console.log(`- Backend .env path: ${backendEnvPath}`);
console.log(`  Exists: ${fileExists(backendEnvPath)}`);

console.log(`- Project root .env path: ${projectRootEnvPath}`);
console.log(`  Exists: ${fileExists(projectRootEnvPath)}`);

// If the project root .env exists, check its contents (safely)
if (fileExists(projectRootEnvPath)) {
  const envContent = safeReadFile(projectRootEnvPath);
  if (envContent) {
    // Check for API keys without revealing them
    const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=');
    const hasAnthropicKey = envContent.includes('ANTHROPIC_API_KEY=');
    
    console.log('\nAPI Key Check in project root .env:');
    console.log(`- Contains OPENAI_API_KEY: ${hasOpenAIKey}`);
    console.log(`- Contains ANTHROPIC_API_KEY: ${hasAnthropicKey}`);
  }
}

// If the backend .env exists, check its contents (safely)
if (fileExists(backendEnvPath)) {
  const envContent = safeReadFile(backendEnvPath);
  if (envContent) {
    // Check for API keys without revealing them
    const hasOpenAIKey = envContent.includes('OPENAI_API_KEY=');
    const hasAnthropicKey = envContent.includes('ANTHROPIC_API_KEY=');
    
    console.log('\nAPI Key Check in backend .env:');
    console.log(`- Contains OPENAI_API_KEY: ${hasOpenAIKey}`);
    console.log(`- Contains ANTHROPIC_API_KEY: ${hasAnthropicKey}`);
  }
}

// Try loading with dotenv and check process.env
try {
  require('dotenv').config({ path: projectRootEnvPath });
  
  console.log('\nAfter loading project root .env:');
  console.log(`- process.env.OPENAI_API_KEY exists: ${!!process.env.OPENAI_API_KEY}`);
  if (process.env.OPENAI_API_KEY) {
    console.log(`- OPENAI_API_KEY length: ${process.env.OPENAI_API_KEY.length}`);
  }
  
  console.log(`- process.env.OPENAI_MODEL: ${process.env.OPENAI_MODEL || 'not set'}`);
} catch (error) {
  console.error('Error loading dotenv:', error);
}

// Print current working directory for reference
console.log('\nCurrent working directory:', process.cwd());
