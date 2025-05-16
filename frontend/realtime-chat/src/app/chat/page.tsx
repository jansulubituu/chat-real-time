'use client';

import React from 'react';
import ChatContainer from '@/components/chat/ChatContainer';

export default function ChatPage() {
  return (
    <main className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto h-full max-w-screen-xl px-2 py-2 sm:px-4 sm:py-4">
        <div className="flex h-full flex-col rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          {/* Chat page header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Messages</h1>
              <div className="flex space-x-2">
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat container */}
          <div className="flex-1 overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </div>
    </main>
  );
} 