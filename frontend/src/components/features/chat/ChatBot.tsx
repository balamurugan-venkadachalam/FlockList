import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '@/types/chat';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import { MessageSquare, X, Trash2, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import {
  sendChatMessage,
  clearChatSession,
  loadFormattedChatHistory
} from '@/services/chatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { Button } from '@/components/ui/shadcn/button';
import { Card } from '@/components/ui/shadcn/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/shadcn/tooltip';
import { Alert, AlertDescription } from '@/components/ui/shadcn/alert';
import { cn } from '@/lib/utils';

// Rule applied: Use functional and declarative programming patterns; avoid classes
export function ChatBot() {
  // Rule applied: Use descriptive variable names with auxiliary verbs
  const { messages, isOpen, addMessage, toggleChat, clearMessages } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load chat history when component mounts
  useEffect(() => {
    // Only attempt to load history if we have a session ID and no messages loaded yet
    const sessionId = localStorage.getItem('chatSessionId');
    if (sessionId && messages.length === 0 && !isInitialized) {
      const loadHistory = async () => {
        try {
          setIsLoading(true);
          const historyMessages = await loadFormattedChatHistory();
          
          // Add all messages to the chat context
          historyMessages.forEach(msg => {
            addMessage(msg.message, msg.sender as 'user' | 'bot');
          });
          
          setIsInitialized(true);
        } catch (error) {
          console.error('Failed to load chat history:', error);
          // Don't show error to user, just silently fail
        } finally {
          setIsLoading(false);
        }
      };
      
      loadHistory();
    } else {
      setIsInitialized(true);
    }
  }, [addMessage, messages.length, isInitialized]);

  // Rule applied: Use "function" keyword for pure functions
  const handleSend = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message to the UI immediately
    addMessage(message, 'user');
    setIsLoading(true);
    setHasError(false);

    try {
      // Use the chat service to send the message
      const response = await sendChatMessage(message);
      
      // Add bot response to the UI
      if (response.message) {
        addMessage(response.message, 'bot');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setHasError(true);
      setErrorMessage(typeof error === 'string' ? error : 'Failed to communicate with the assistant');
      addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    } finally {
      setIsLoading(false);
    }
  }, [addMessage]);

  // Clear chat history
  const handleClearChat = useCallback(async () => {
    try {
      setIsLoading(true);
      // Use the chat service to clear the session
      await clearChatSession();
      
      // Clear messages in the UI
      clearMessages();
    } catch (error) {
      console.error('Clear chat error:', error);
      setHasError(true);
      setErrorMessage(typeof error === 'string' ? error : 'Failed to clear chat history');
    } finally {
      setIsLoading(false);
    }
  }, [clearMessages]);

  // Rule applied: Implement Shadcn UI for styling
  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 transition-all duration-300 ease-in-out">
          <Button
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            onClick={toggleChat}
            aria-label="Open chat"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      )}

      {isOpen && (
        <Card
          className={cn(
            "fixed bottom-5 right-5 w-[350px] h-[500px] z-50 overflow-hidden rounded-lg shadow-lg",
            "transition-all duration-300 ease-in-out"
          )}
        >
          <MainContainer>
            <ChatContainer>
              <ConversationHeader>
                <Avatar src="/bot-avatar.png" name="AI Assistant" />
                <ConversationHeader.Content 
                  userName="AI Assistant"
                  info="Always here to help"
                />
                <ConversationHeader.Actions>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleClearChat}
                          disabled={isLoading}
                          className="h-8 w-8 mr-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear chat history</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={toggleChat}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Close chat</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </ConversationHeader.Actions>
              </ConversationHeader>
              
              <MessageList typingIndicator={isLoading ? <TypingIndicator content="AI Assistant is typing" /> : null}>
                {messages.length === 0 && isInitialized && (
                  <Message
                    model={{
                      message: "Hello! How can I help you today?",
                      sentTime: "just now",
                      sender: "bot",
                      direction: "incoming",
                      position: "single"
                    }}
                  />
                )}
                {messages.map((msg: ChatMessage, i: number) => (
                  <Message
                    key={i}
                    model={{
                      message: msg.message,
                      sentTime: msg.sentTime,
                      sender: msg.sender,
                      direction: msg.direction,
                      position: "single"
                    }}
                  />
                ))}
                {hasError && (
                  <div className="p-3">
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </MessageList>
              
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
                attachButton={false}
                disabled={isLoading}
              />
            </ChatContainer>
          </MainContainer>
        </Card>
      )}
    </>
  );
}
