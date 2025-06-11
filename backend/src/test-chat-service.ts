// Rule applied: Use TypeScript for all code; prefer interfaces over types
import { initializeChatService, processChatMessage } from './framework/chat';
import dotenv from 'dotenv';

// Force reload environment variables
dotenv.config({ override: true });

// Print environment variables for debugging (safely)
console.log('Environment variables:');
Object.keys(process.env)
  .filter(key => key.includes('OPENAI') || key.includes('ANTHROPIC'))
  .forEach(key => {
    console.log(`${key}: ${key.includes('KEY') ? '[REDACTED]' : process.env[key]}`);
  });

// Initialize chat service
console.log('\nInitializing chat service...');
initializeChatService();

// Test chat message processing
async function testChatService() {
  try {
    console.log('\nSending test message...');
    const response = await processChatMessage({
      message: 'Hello, how are you today?',
      userId: 'test-user',
      sessionId: 'test-session'
    });
    
    console.log('\nReceived response:');
    console.log(response);
  } catch (error) {
    console.error('\nError testing chat service:', error);
  }
}

// Run the test
testChatService();
