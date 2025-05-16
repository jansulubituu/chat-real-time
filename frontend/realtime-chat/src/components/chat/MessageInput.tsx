'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendMessageRequest } from '@/lib/types';
import { motion } from 'framer-motion';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (message: SendMessageRequest) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  isLoadingSend?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  conversationId,
  onSendMessage,
  onTyping,
  isLoadingSend = false
}) => {
  const [message, setMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Theo dõi trạng thái typing và thông báo cho server
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Clear timeout cũ nếu có
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Tạo timeout mới để dừng typing sau 1.5s
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);
    
    // Cleanup function
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping, onTyping]);
  
  // Auto resize cho textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoadingSend) {
      return;
    }
    
    const messageData: SendMessageRequest = {
      conversationId,
      content: message.trim(),
    };
    
    try {
      await onSendMessage(messageData);
      setMessage('');
      
      // Reset trạng thái typing
      setIsTyping(false);
      onTyping(false);
      
      // Focus lại vào input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Xử lý phím Enter để gửi tin nhắn, Shift+Enter để xuống dòng
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t py-2 px-4 bg-white">
      <div className="relative flex items-center">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow resize-none min-h-[40px] max-h-[120px] px-4 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          rows={1}
          disabled={isLoadingSend}
        />
        
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="submit"
          className="absolute right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!message.trim() || isLoadingSend}
        >
          {isLoadingSend ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
      </div>
    </form>
  );
};
