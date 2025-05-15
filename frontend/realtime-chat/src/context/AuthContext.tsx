'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '@/lib/types';
import { authApi } from '@/lib/api';
import { getLocalStorage, setLocalStorage, removeLocalStorage, localStorageKeys } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = getLocalStorage(localStorageKeys.TOKEN);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Authentication error:', error);
        removeLocalStorage(localStorageKeys.TOKEN);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login user
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.login(credentials);
      setUser(data);
      setLocalStorage(localStorageKeys.TOKEN, data.token);
      router.push('/chat');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register user
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authApi.register(credentials);
      setUser(data);
      setLocalStorage(localStorageKeys.TOKEN, data.token);
      router.push('/chat');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeLocalStorage(localStorageKeys.TOKEN);
      setUser(null);
      setIsLoading(false);
      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
