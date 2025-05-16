'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useChat } from '@/hooks/useChat';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { SendMessageRequest } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [errorTimeout, setErrorTimeout] = useState(false);
  
  const { 
    activeConversation, 
    conversations,
    setActiveConversation,
    messages, 
    sendMessage, 
    loadMoreMessages, 
    hasMore, 
    loadingMessages,
    startTyping,
    stopTyping,
    typingUsers
  } = useChat();

  // Force set active conversation from URL parameter if it exists in conversations
  useEffect(() => {
    if (conversationId && conversations.length > 0 && !activeConversation) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        console.log('Force setting activeConversation from page component:', conversationId);
        setActiveConversation(conversation);
      }
    }
  }, [conversationId, conversations, activeConversation, setActiveConversation]);

  // Listen for activeConversation changes
  useEffect(() => {
    console.log('activeConversation changed:', activeConversation?._id || 'null');
    // Reset initialLoadDone when activeConversation changes to ensure proper loading state
    if (activeConversation) {
      setInitialLoadDone(false);
    }
  }, [activeConversation]);

  // Improved logic for tracking when loading is complete
  useEffect(() => {
    console.log('Loading state changed:');
    console.log('- activeConversation:', activeConversation?._id || 'null');
    console.log('- loadingMessages:', loadingMessages);
    console.log('- messages length:', messages.length);
    console.log('- initialLoadDone:', initialLoadDone);
    console.log('- conversationId param:', conversationId);
    
    // Only set initialLoadDone when:
    // 1. We have the active conversation AND messages loading is finished
    // OR
    // 2. Message loading is finished for at least 3 seconds (with any conversation state)
    if (!initialLoadDone && activeConversation && !loadingMessages) {
      console.log('Setting initialLoadDone to true - we have active conversation and messages loaded');
      setInitialLoadDone(true);
    }
  }, [activeConversation, conversationId, loadingMessages, messages.length, initialLoadDone]);

  // Set up error timeout - only show error if conversation still null after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrorTimeout(true);
    }, 2500);
    
    // If we get an active conversation, clear the error timer
    if (activeConversation) {
      setErrorTimeout(false);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [activeConversation]);

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
    if (loadingMessages || isLoading) return;
    setIsLoading(true);
    try {
      await loadMoreMessages();
    } finally {
      setIsLoading(false);
    }
  };

  // Trường hợp chưa đăng nhập
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Nếu đã load xong mà không có activeConversation, hiển thị thông báo
  // Chỉ hiển thị lỗi sau khi đã đợi đủ thời gian cho activeConversation được thiết lập

  if (initialLoadDone && !activeConversation && errorTimeout) {
    console.log('activeConversation', activeConversation);
    console.log('initialLoadDone', initialLoadDone);
    console.log('errorTimeout', errorTimeout);
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center p-4">
            <div className="mb-4 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không tìm thấy cuộc trò chuyện</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Cuộc trò chuyện này không tồn tại hoặc bạn không có quyền truy cập.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị spinner khi đang load ban đầu hoặc khi không có activeConversation
  if (!initialLoadDone || !activeConversation) {
    console.log('Showing loading spinner because:');
    console.log('- initialLoadDone:', initialLoadDone);
    console.log('- activeConversation present:', !!activeConversation);
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-b-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <MessageList 
          messages={messages} 
          currentUser={user}
          typingUsers={getTypingUsers()}
          hasMore={hasMore}
          loadingMessages={loadingMessages}
          loadingMore={isLoading}
          onLoadMore={handleLoadMore}
        />
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <MessageInput 
          conversationId={activeConversation?._id || ''}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          isLoadingSend={isLoading}
        />
      </div>
    </div>
  );
}

