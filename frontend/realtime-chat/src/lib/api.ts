import axios from 'axios';
import { AuthResponse, LoginCredentials, RegisterCredentials } from './types';
import { getLocalStorage, localStorageKeys } from './utils';

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

export default api;
