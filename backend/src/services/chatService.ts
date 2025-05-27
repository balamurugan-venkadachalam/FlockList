// Rule applied: Use TypeScript for all code; prefer interfaces over types
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

// Rule applied: Use TypeScript for all code; prefer interfaces over types
interface ChatServiceOptions {
  apiKey: string;
  model: string;
  temperature?: number;
}

interface ChatRequest {
  message: string;
  userId: string;
  sessionId: string;
}

interface ChatResponse {
  message: string;
  sessionId: string;
}

// Rule applied: Use functional and declarative programming patterns; avoid classes
export function createChatService(options: ChatServiceOptions) {
  // Initialize the OpenAI client
  const openai = new OpenAI({
    apiKey: options.apiKey,
  });

  // Store conversation histories by session ID
  const sessionMessages = new Map<string, Array<ChatCompletionMessageParam>>(); 

  // System message template
  const systemMessage: ChatCompletionMessageParam = {
    role: "system",
    content: `You are TaskMaster's AI assistant, designed to help users with task management and organization.
    You can help with:
    - Creating and organizing tasks
    - Setting priorities and deadlines
    - Managing flocks (teams/groups)
    - Answering questions about the application
    
    Always be helpful, concise, and friendly. If you don't know something, admit it and suggest alternatives.
    Current date: ${new Date().toISOString().split('T')[0]}`
  };

  // Function to get or create a conversation history for a session
  const getSessionHistory = (sessionId: string): Array<ChatCompletionMessageParam> => {
    if (!sessionMessages.has(sessionId)) {
      sessionMessages.set(sessionId, [systemMessage]);
    }
    return sessionMessages.get(sessionId)!;
  };

  // Function to handle chat requests
  const handleChat = async ({
    message,
    userId,
    sessionId,
  }: ChatRequest): Promise<ChatResponse> => {
    try {
      // Get conversation history
      const messages = getSessionHistory(sessionId);
      
      // Add user message to history
      messages.push({ role: "user", content: message });
      
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: options.model || "gpt-3.5-turbo",
        messages: messages,
        temperature: options.temperature || 0.7,
      });

      // Get the assistant's response
      const responseMessage = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";
      
      // Add assistant response to history
      messages.push({ role: "assistant", content: responseMessage });
      
      // Update session history
      sessionMessages.set(sessionId, messages);

      return {
        message: responseMessage,
        sessionId,
      };
    } catch (error) {
      // Rule applied: Avoid try/catch blocks unless there's good reason to translate or handle error in that abstraction
      console.error("Chat service error:", error);
      throw new Error(`Failed to process chat message: ${(error as Error).message}`);
    }
  };

  // Function to clear a session's history
  const clearSession = (sessionId: string): void => {
    sessionMessages.delete(sessionId);
  };

  return {
    handleChat,
    clearSession,
  };
}

// Export types for use in other modules
export type { ChatRequest, ChatResponse, ChatServiceOptions };
