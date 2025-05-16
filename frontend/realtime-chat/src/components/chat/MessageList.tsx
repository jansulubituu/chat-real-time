'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // Initial scroll to bottom when component mounts
  useEffect(() => {
    if (messages.length > 0 && !initialLoadComplete && !loadingMessages) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        setInitialLoadComplete(true);
      }, 100);
    }
  }, [messages.length, loadingMessages, initialLoadComplete]);

  // Scroll to bottom only for new messages and only when appropriate
  useEffect(() => {
    // Only execute this effect when we have messages and when the messages array changes
    if (messages.length === 0 || prevMessagesLengthRef.current === messages.length) return;
    
    // If this is the first load of messages, update the ref but don't scroll
    if (prevMessagesLengthRef.current === 0) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }
    
    // Only scroll if we have new messages (more than before)
    if (messages.length > prevMessagesLengthRef.current) {
      // Get the most recent message
      const lastMessage = messages[messages.length - 1];
      const isCurrentUserMessage = lastMessage.sender._id === currentUser._id;
      
      // Only auto-scroll if user is already at the bottom or if it's their own message
      const isAtBottom = isUserAtBottom();
      
      if (isCurrentUserMessage || isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    
    // Update the reference to the current message length
    prevMessagesLengthRef.current = messages.length;
  }, [messages.length, currentUser._id]);

  // Check if user is near the bottom of the scroll container
  const isUserAtBottom = useCallback(() => {
    if (!containerRef.current) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;
    
    // Consider "at bottom" if within 100px of the bottom
    return scrollPosition < 100;
  }, []);

  // Kiểm tra vị trí cuộn để hiển thị nút cuộn lên
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      
      // Hiển thị nút cuộn lên khi không ở đầu trang
      setShowScrollToTop(scrollTop > 200);
      
      // Nếu cuộn gần đến đầu và có thêm tin nhắn cũ hơn
      if (scrollTop < 50 && hasMore && !loadingMore) {
        onLoadMore();
      }
    }
  }, [hasMore, loadingMore, onLoadMore]);

  // Cuộn lên đầu
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, []);

  // Cuộn xuống cuối
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Group consecutive messages from the same sender
  const groupedMessages = messages.reduce<{ messages: Message[], senderId: string | null }[]>((groups, message) => {
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && lastGroup.senderId === message.sender._id) {
      // Add to current group if same sender
      lastGroup.messages.push(message);
    } else {
      // Create new group
      groups.push({
        senderId: message.sender._id,
        messages: [message],
      });
    }
    
    return groups;
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Nút cuộn lên đầu - cố định ở góc trên bên phải */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 30,
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <span style={{ marginRight: '4px' }}>⬆️</span> Lên đầu
        </button>
      )}

      {/* Container chính cho tin nhắn */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: '100%',
          overflowY: 'scroll', // Luôn hiển thị thanh cuộn
          padding: '16px',
          backgroundColor: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          overscrollBehavior: 'contain'
        }}
      >
        {loadingMessages ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid #3b82f6', 
              borderTopColor: 'transparent', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#6b7280'
          }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              backgroundColor: '#f3f4f6', 
              marginBottom: '16px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '4px' }}>Chưa có tin nhắn nào</h3>
            <p style={{ fontSize: '0.875rem' }}>Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn</p>
          </div>
        ) : (
          <>
            {/* Nút tải thêm tin nhắn cũ */}
            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
                <button
                  onClick={() => {
                    onLoadMore();
                  }}
                  disabled={loadingMore}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '9999px',
                    padding: '8px 16px',
                    fontSize: '0.875rem',
                    color: '#1f2937',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {loadingMore ? (
                    <>
                      <div style={{ 
                        width: '16px', 
                        height: '16px', 
                        border: '2px solid #3b82f6', 
                        borderTopColor: 'transparent', 
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    'Tải tin nhắn cũ hơn'
                  )}
                </button>
              </div>
            )}

            {/* Thông báo hướng dẫn cuộn */}
            <div style={{
              textAlign: 'center',
              padding: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              <p>Sử dụng con lăn chuột hoặc kéo màn hình để xem tin nhắn cũ hơn</p>
            </div>
            
            {/* Nhóm tin nhắn */}
            {groupedMessages.map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '4px',
                position: 'relative' 
              }}>
                {group.messages.map((message, messageIndex) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    currentUser={currentUser}
                    showAvatar={messageIndex === 0}
                    isLast={messageIndex === group.messages.length - 1 && groupIndex === groupedMessages.length - 1}
                  />
                ))}
              </div>
            ))}
            
            {/* Typing indicator */}
            {typingUsers.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <TypingIndicator typingUsers={typingUsers} />
              </div>
            )}

            {/* Nút cuộn xuống */}
            {!isUserAtBottom() && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: 'fixed',
                  bottom: '80px',
                  right: '16px',
                  zIndex: 30,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  border: 'none',
                  cursor: 'pointer'
                }}
                aria-label="Cuộn xuống"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            )}
            
            {/* Element to scroll to */}
            <div ref={messagesEndRef} data-scroll-anchor style={{ height: '8px' }}></div>
          </>
        )}
      </div>

      {/* Style cho animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
