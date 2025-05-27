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
import { Paper, Fab, Zoom, IconButton, Tooltip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useChat } from '@/context/ChatContext';
import {
  sendChatMessage,
  clearChatSession,
  loadFormattedChatHistory
} from '@/services/chatService';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

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

  // Rule applied: Implement Material UI for styling
  return (
    <>
      <Zoom in={!isOpen}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
          }}
          onClick={toggleChat}
          aria-label="Open chat"
        >
          <ChatIcon />
        </Fab>
      </Zoom>

      <Zoom in={isOpen}>
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 350,
            height: 500,
            zIndex: 1000,
            overflow: 'hidden',
            borderRadius: 2,
          }}
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
                  <Tooltip title="Clear chat history">
                    <IconButton 
                      onClick={handleClearChat}
                      size="small"
                      sx={{ mr: 1 }}
                      disabled={isLoading}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Close chat">
                    <IconButton
                      onClick={toggleChat}
                      size="small"
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
                  <div className="error-message" style={{ padding: '10px', color: 'red', fontSize: '12px' }}>
                    {errorMessage}
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
        </Paper>
      </Zoom>
    </>
  );
}
