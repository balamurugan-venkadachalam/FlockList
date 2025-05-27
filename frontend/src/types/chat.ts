export interface ChatMessage {
  message: string;
  sentTime: string;
  sender: 'user' | 'bot';
  direction: 'incoming' | 'outgoing';
}

export interface ChatResponse {
  success: boolean;
  message: string;
  error?: string;
}
