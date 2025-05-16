'use client';

import { io, Socket } from 'socket.io-client';
import { getLocalStorage, localStorageKeys } from './utils';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8082';

let socket: Socket | null = null;

// Khởi tạo kết nối socket
export const initSocket = (): Socket => {
  if (socket) return socket;

  const token = getLocalStorage(localStorageKeys.TOKEN);
  
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    auth: {
      token
    }
  });

  // Xử lý các sự kiện socket
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

// Đóng kết nối socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Lấy instance hiện tại của socket
export const getSocket = (): Socket | null => {
  return socket;
};

// Kiểm tra trạng thái kết nối
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// Cập nhật token xác thực
export const updateSocketAuth = (token: string): void => {
  if (socket) {
    socket.auth = { token };
    // Kết nối lại để áp dụng token mới
    socket.disconnect().connect();
  }
};

export default {
  initSocket,
  disconnectSocket,
  getSocket,
  isSocketConnected,
  updateSocketAuth
};
