export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Conversation types
export interface Conversation {
  _id: string;
  name?: string;
  type: 'direct' | 'group';
  participants: User[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  name?: string;
  participants: string[];
  type: 'direct' | 'group';
}

// Message types
export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  contentType: 'text' | 'image' | 'file';
  fileUrl?: string;
  readBy: User[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  contentType?: 'text' | 'image' | 'file';
  fileUrl?: string;
}

export interface GetMessagesResponse {
  messages: Message[];
  page: number;
  pages: number;
  totalMessages: number;
}

// Typing event
export interface TypingEvent {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

// Message read event
export interface MessagesReadEvent {
  conversationId: string;
  userId: string;
  messageIds: string[];
}

// User status event
export interface UserStatusEvent {
  userId: string;
  status: 'online' | 'offline';
}
