'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { conversationId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, activeConversation, setActiveConversation } = useChat();

  // Set active conversation from URL parameter
  useEffect(() => {
    if (!conversationId) return;
    
    // Check if we have conversations loaded
    if (conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        // Found the conversation, set it as active
        setActiveConversation(conversation);
      } else {
        // Conversation not found, redirect to main chat
        console.log('Conversation not found, redirecting to chat main page');
        router.replace('/chat');
      }
    } else {
      console.log('No conversations loaded yet, waiting for conversations data...');
    }
  }, [conversationId, conversations, setActiveConversation, router]);

  // Debug logs for conversation loading
  useEffect(() => {
    console.log('Current conversations:', conversations.length);
    console.log('Current conversationId param:', conversationId);
    console.log('Current activeConversation:', activeConversation?._id || 'null');
  }, [conversations, conversationId, activeConversation]);

  // Header component specific to conversation detail
  const ConversationHeader = () => {
    if (!activeConversation) return null;

    return (
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800">
        <button 
          onClick={() => router.push('/chat')}
          className="mr-3 text-blue-500 hover:text-blue-600 transition-colors"
          aria-label="Back to conversations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="flex-1 flex items-center">
          <div className="relative mr-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {activeConversation.type === 'direct' && activeConversation.participants.find(p => p._id !== user?._id)?.avatar ? (
                <img 
                  src={activeConversation.participants.find(p => p._id !== user?._id)?.avatar} 
                  alt="Avatar" 
                  className="h-full w-full object-cover"
                />
              ) : activeConversation.type === 'group' && activeConversation.avatar ? (
                <img 
                  src={activeConversation.avatar} 
                  alt={activeConversation.name || 'Group'} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                  {activeConversation.type === 'direct' 
                    ? activeConversation.participants.find(p => p._id !== user?._id)?.username?.[0]?.toUpperCase() || '?'
                    : (activeConversation.name?.[0] || 'G').toUpperCase()}
                </span>
              )}
            </div>
            {activeConversation.type === 'direct' && (
              <div 
                className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                  activeConversation.participants.find(p => p._id !== user?._id)?.status === 'online' 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`}
              />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 dark:text-white">
              {activeConversation.type === 'direct' 
                ? activeConversation.participants.find(p => p._id !== user?._id)?.username || 'Chat'
                : activeConversation.name || 'Group Chat'}
            </h2>
            {activeConversation.type === 'group' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeConversation.participants.length} participants
              </p>
            )}
            {activeConversation.type === 'direct' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeConversation.participants.find(p => p._id !== user?._id)?.status === 'online' 
                  ? 'Online' 
                  : 'Offline'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
