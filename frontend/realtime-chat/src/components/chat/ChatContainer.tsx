'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { ConversationsList } from './ConversationsList';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { SendMessageRequest, User } from '@/lib/types';

const ChatContainer = () => {
  const { 
    activeConversation, 
    messages, 
    sendMessage, 
    markAsRead, 
    startTyping, 
    stopTyping,
    typingUsers,
    loadMoreMessages,
    hasMore,
    loadingMessages
  } = useChat();
  
  const { user } = useAuth();
  const [isMobileView, setIsMobileView] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Effect to handle resize and detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Effect to handle marking messages as read when opening a conversation
  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation._id);
    }
  }, [activeConversation, markAsRead]);
  
  // Handle selecting a conversation on mobile
  const handleConversationSelect = () => {
    if (isMobileView) {
      setShowConversations(false);
    }
  };
  
  // Handle loading more messages
  const handleLoadMore = useCallback(async () => {
    if (loadingMore) return;
    
    setLoadingMore(true);
    try {
      await loadMoreMessages();
    } finally {
      setLoadingMore(false);
    }
  }, [loadMoreMessages, loadingMore]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (messageData: SendMessageRequest) => {
    if (!activeConversation) return;
    
    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [activeConversation, sendMessage]);
  
  // Transform string IDs to User objects for typing indicator
  const getTypingUsers = useCallback(() => {
    if (!activeConversation || !typingUsers[activeConversation._id]) return [];
    
    return typingUsers[activeConversation._id].map(userId => {
      // Create a minimal user object from the ID
      return {
        _id: userId,
        username: 'User', // Ideally you'd have a way to get usernames from IDs
        avatar: '',
        status: 'online'
      } as User;
    });
  }, [activeConversation, typingUsers]);
  
  // Handle typing events
  const handleTyping = useCallback((isTyping: boolean) => {
    if (!activeConversation) return;
    
    if (isTyping) {
      startTyping(activeConversation._id);
    } else {
      stopTyping(activeConversation._id);
    }
  }, [activeConversation, startTyping, stopTyping]);
  
  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Please log in to access chat</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full">
      {/* Conversations sidebar (hidden on mobile when viewing a chat) */}
      {(!isMobileView || showConversations) && (
        <div className="w-full md:w-80 lg:w-96 h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ConversationsList onConversationSelect={handleConversationSelect} />
        </div>
      )}
      
      {/* Chat area */}
      {(!isMobileView || !showConversations) && (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-800">
          {/* Chat header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800 sticky top-0 z-10 shadow-sm">
            {isMobileView && (
              <button 
                className="mr-3 text-blue-500 hover:text-blue-600 transition-colors"
                onClick={() => setShowConversations(true)}
                aria-label="Back to conversations"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            
            {activeConversation && (
              <div className="flex-1 flex items-center">
                <div className="relative mr-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {activeConversation.type === 'direct' && activeConversation.participants.find(p => p._id !== user._id)?.avatar ? (
                      <img 
                        src={activeConversation.participants.find(p => p._id !== user._id)?.avatar} 
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
                          ? activeConversation.participants.find(p => p._id !== user._id)?.username?.[0]?.toUpperCase() || '?'
                          : (activeConversation.name?.[0] || 'G').toUpperCase()}
                      </span>
                    )}
                  </div>
                  {activeConversation.type === 'direct' && (
                    <div 
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                        activeConversation.participants.find(p => p._id !== user._id)?.status === 'online' 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}
                    />
                  )}
                </div>
                <div className="truncate">
                  <h2 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {activeConversation.type === 'direct' 
                      ? activeConversation.participants.find(p => p._id !== user._id)?.username || 'Chat'
                      : activeConversation.name || 'Group Chat'}
                  </h2>
                  {activeConversation.type === 'group' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activeConversation.participants.length} participants
                    </p>
                  )}
                  {activeConversation.type === 'direct' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activeConversation.participants.find(p => p._id !== user._id)?.status === 'online' 
                        ? 'Online' 
                        : 'Offline'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {activeConversation ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
                <MessageList 
                  messages={messages} 
                  currentUser={user}
                  typingUsers={getTypingUsers()}
                  hasMore={hasMore}
                  loadingMessages={loadingMessages}
                  loadingMore={loadingMore}
                  onLoadMore={handleLoadMore}
                />
              </div>
              
              {/* Message input */}
              <div className="bg-white dark:bg-gray-800">
                <MessageInput 
                  conversationId={activeConversation._id}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
              <div className="text-center max-w-md p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md">
                <div className="mb-4 text-blue-500 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Select a conversation to start chatting
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Choose an existing conversation from the sidebar or create a new one to begin messaging.
                </p>
                <button 
                  onClick={() => document.querySelector('.w-full.py-2.bg-blue-500')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  New Conversation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
