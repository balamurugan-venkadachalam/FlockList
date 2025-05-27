import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '@/types/chat';

// Rule applied: Use TypeScript for all code; prefer interfaces over types
interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  addMessage: (message: string, sender: 'user' | 'bot') => void;
  toggleChat: () => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Rule applied: Use functional and declarative programming patterns; avoid classes
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load messages from localStorage on initial render
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Failed to load chat messages from localStorage:', error);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save chat messages to localStorage:', error);
    }
  }, [messages]);

  // Add a new message to the chat
  const addMessage = useCallback((message: string, sender: 'user' | 'bot') => {
    const newMessage: ChatMessage = {
      message,
      sentTime: new Date().toLocaleTimeString(),
      sender,
      direction: sender === 'user' ? 'outgoing' : 'incoming',
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  // Toggle chat visibility
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    // Also clear from localStorage
    localStorage.removeItem('chatMessages');
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isOpen, addMessage, toggleChat, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
