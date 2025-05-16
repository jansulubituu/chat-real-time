import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, Conversation, CreateConversationRequest, Message, SendMessageRequest, GetMessagesResponse, User } from './types';
import { getLocalStorage, localStorageKeys } from './utils';
import * as dotenv from "dotenv";

dotenv.config();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request if available (client-side only)
api.interceptors.request.use(
  (config) => {
    const token = getLocalStorage(localStorageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },

  logout: async (): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/logout');
    return data;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const { data } = await api.get<AuthResponse>('/auth/profile');
    return data;
  },
};

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getUserById: async (userId: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${userId}`);
    return data;
  },

  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>('/users', profileData);
    return data;
  },
};

export const conversationApi = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>('/conversations');
    return data;
  },

  getConversationById: async (conversationId: string): Promise<Conversation> => {
    const { data } = await api.get<Conversation>(`/conversations/${conversationId}`);
    return data;
  },

  createConversation: async (conversationData: CreateConversationRequest | FormData): Promise<Conversation> => {
    const config = conversationData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : undefined;
    
    const { data } = await api.post<Conversation>('/conversations', conversationData, config);
    return data;
  },

  updateConversation: async (conversationId: string, name: string): Promise<Conversation> => {
    const { data } = await api.put<Conversation>(`/conversations/${conversationId}`, { name });
    return data;
  },

  addParticipants: async (conversationId: string, participants: string[]): Promise<Conversation> => {
    const { data } = await api.put<Conversation>(`/conversations/${conversationId}/participants`, { participants });
    return data;
  },

  removeParticipant: async (conversationId: string, userId: string): Promise<Conversation> => {
    const { data } = await api.delete<Conversation>(`/conversations/${conversationId}/participants/${userId}`);
    return data;
  },

  deleteConversation: async (conversationId: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/conversations/${conversationId}`);
    return data;
  },
};

export const messageApi = {
  getMessages: async (conversationId: string, page = 1, limit = 20): Promise<GetMessagesResponse> => {
    const { data } = await api.get<GetMessagesResponse>(
      `/messages/${conversationId}?page=${page}&limit=${limit}`
    );
    return data;
  },

  sendMessage: async (messageData: SendMessageRequest): Promise<Message> => {
    const { data } = await api.post<Message>('/messages', messageData);
    return data;
  },

  markMessagesAsRead: async (conversationId: string): Promise<{ message: string }> => {
    const { data } = await api.put<{ message: string }>(`/messages/${conversationId}/read`);
    return data;
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const { data } = await api.put<Message>(`/messages/${messageId}`, { content });
    return data;
  },

  deleteMessage: async (messageId: string): Promise<{ message: string }> => {
    const { data } = await api.delete<{ message: string }>(`/messages/${messageId}`);
    return data;
  },
};

export const searchApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await api.get<User[]>(`/search/users?query=${query}`);
    return data;
  },
  
  searchConversations: async (query: string): Promise<Conversation[]> => {
    const { data } = await api.get<Conversation[]>(`/search/conversations?query=${query}`);
    return data;
  },
};

export default api;
