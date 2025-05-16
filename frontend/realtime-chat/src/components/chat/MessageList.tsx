'use client';

import React, { useRef, useEffect } from 'react';
import { Message, User } from '@/lib/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  typingUsers: User[];
  hasMore: boolean;
  loadingMessages: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  typingUsers,
  hasMore,
  loadingMessages,
  loadingMore,
  onLoadMore,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  
  // Cuộn xuống dưới cùng khi có tin nhắn mới hoặc lần đầu tiên tải tin nhắn
  useEffect(() => {
    if (messages.length > 0 && messages.length !== prevMessagesLengthRef.current) {
      if (prevMessagesLengthRef.current === 0 || messages.length > prevMessagesLengthRef.current) {
        // Chỉ cuộn khi tin nhắn mới được thêm vào hoặc lần đầu tiên tải
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      prevMessagesLengthRef.current = messages.length;
    }
  }, [messages.length]);
  
  // Xử lý scroll lên để tải thêm tin nhắn cũ hơn
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      
      // Nếu người dùng đã cuộn gần đến đầu và có thêm tin nhắn để tải
      if (scrollTop < 50 && hasMore && !loadingMore) {
        onLoadMore();
      }
    }
  };
  
  // Nhóm các tin nhắn liên tiếp từ cùng một người gửi
  const groupedMessages = messages.reduce<{ messages: Message[], senderId: string | null }[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.senderId === message.sender._id) {
      // Thêm vào nhóm hiện tại nếu cùng người gửi
      lastGroup.messages.push(message);
    } else {
      // Tạo nhóm mới
      groups.push({
        senderId: message.sender._id,
        messages: [message],
      });
    }
    
    return groups;
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      onScroll={handleScroll}
    >
      {loadingMessages ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">No messages yet</h3>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      ) : (
        <>
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center my-4">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 text-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-800 dark:text-gray-200 transition-colors disabled:opacity-50 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                {loadingMore ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load older messages'
                )}
              </button>
            </div>
          )}
          
          {/* Messages groups */}
          <div className="space-y-6">
            {groupedMessages.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-1">
                {group.messages.map((message, messageIndex) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    currentUser={currentUser}
                    showAvatar={messageIndex === 0} // Chỉ hiển thị avatar ở tin nhắn đầu tiên của nhóm
                    isLast={messageIndex === group.messages.length - 1 && groupIndex === groupedMessages.length - 1} // Đánh dấu tin nhắn cuối cùng
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Typing indicator */}
          {typingUsers.length > 0 && (
            <div className="mt-2">
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}
          
          {/* Element to scroll to */}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};
