'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Khởi tạo socket khi người dùng đã đăng nhập
      const socketInstance = initSocket();
      setSocket(socketInstance);

      // Lắng nghe sự kiện kết nối và ngắt kết nối
      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      socketInstance.on('connect', onConnect);
      socketInstance.on('disconnect', onDisconnect);
      
      // Kiểm tra trạng thái kết nối hiện tại
      setIsConnected(socketInstance.connected);

      return () => {
        // Cleanup các sự kiện khi component unmount
        socketInstance.off('connect', onConnect);
        socketInstance.off('disconnect', onDisconnect);
        
        // Ngắt kết nối socket
        disconnectSocket();
      };
    } else {
      // Ngắt kết nối socket khi không có người dùng đăng nhập
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
