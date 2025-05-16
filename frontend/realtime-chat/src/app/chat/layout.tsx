'use client';

import React from 'react';
import { redirect } from 'next/navigation';
import { SocketProvider } from '@/context/SocketContext';
import { useAuth } from '@/hooks/useAuth';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/login');
    return null;
  }

  return (
    <SocketProvider>
      <main className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="container mx-auto h-full max-w-screen-xl px-2 py-2 sm:px-4 sm:py-4">
          <div className="flex h-full flex-col rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
            {children}
          </div>
        </div>
      </main>
    </SocketProvider>
  );
} 