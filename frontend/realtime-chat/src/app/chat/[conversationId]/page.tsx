'use client';

import React, { useState } from 'react';
import { useChat } from '@/hooks/useChat';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { SendMessageRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function ConversationPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    loadMoreMessages, 
    hasMore, 
    loadingMessages,
    startTyping,
    stopTyping,
    typingUsers
  } = useChat();

  // Handle sending message
  const handleSendMessage = async (messageData: SendMessageRequest) => {
    setIsLoading(true);
    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle typing events
  const handleTyping = (isTyping: boolean) => {
    if (!activeConversation) return;
    
    if (isTyping) {
      startTyping(activeConversation._id);
    } else {
      stopTyping(activeConversation._id);
    }
  };

  // Get typing users for the current conversation
  const getTypingUsers = () => {
    if (!activeConversation || !typingUsers[activeConversation._id]) return [];
    
    return typingUsers[activeConversation._id].map(userId => {
      const participant = activeConversation.participants.find(p => p._id === userId);
      return participant || { 
        _id: userId, 
        username: 'User', 
        email: '', 
        status: 'online' as const
      };
    });
  };

  // Handle loading more messages
  const handleLoadMore = async () => {
    if (loadingMessages) return;
    setIsLoading(true);
    try {
      await loadMoreMessages();
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {activeConversation ? (
          <MessageList 
            messages={messages} 
            currentUser={user}
            typingUsers={getTypingUsers()}
            hasMore={hasMore}
            loadingMessages={loadingMessages}
            loadingMore={isLoading}
            onLoadMore={handleLoadMore}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {activeConversation ? (
          <MessageInput 
            conversationId={activeConversation._id}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            isLoadingSend={isLoading}
          />
        ) : (
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        )}
      </div>
    </div>
  );
}
