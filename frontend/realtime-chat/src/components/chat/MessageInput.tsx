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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Track typing status and notify server
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }
    
    // Clear old timeout if exists
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Create new timeout to stop typing after 1.5s
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
  
  // Auto resize for textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
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
      
      // Reset typing status
      setIsTyping(false);
      onTyping(false);
      
      // Focus back on input
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.style.height = 'auto';
      }

      // Only scroll to bottom once after sending a message
      // Use requestAnimationFrame to ensure DOM updates have completed
      requestAnimationFrame(() => {
        const messagesEndRef = document.querySelector('[data-scroll-anchor]');
        if (messagesEndRef) {
          messagesEndRef.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Here you would handle the file upload
    console.log('File selected:', file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle emoji selection
  const handleEmojiClick = () => {
    setShowEmojiPicker(prev => !prev);
  };
  
  const insertEmoji = (emoji: string) => {
    setMessage(prev => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Define some common emojis
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🤔', '😍', '👏', '😭', '🙏', '🥰', '😘', '💕'];
  
  // Handle Enter key to send message, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t py-3 px-4 bg-white dark:bg-gray-800">
      <div className="relative flex items-center">
        {/* Attachment button */}
        <div className="absolute left-3 flex space-x-2">
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover:scale-110 transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.48-8.48l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path>
            </svg>
          </button>
          
          {/* Emoji button */}
          <button 
            type="button" 
            onClick={handleEmojiClick}
            className="text-gray-400 hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors hover:scale-110 transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
              <line x1="9" y1="9" x2="9.01" y2="9"></line>
              <line x1="15" y1="9" x2="15.01" y2="9"></line>
            </svg>
          </button>
        </div>
        
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,audio/*,video/*,application/pdf"
        />
        
        {/* Emoji picker */}
        {showEmojiPicker && (
          <motion.div 
            ref={emojiPickerRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg z-10"
          >
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Message input */}
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-grow resize-none min-h-[40px] max-h-[120px] pl-20 pr-14 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all scrollbar-hidden"
          rows={1}
          disabled={isLoadingSend}
        />
        
        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
          type="submit"
          className="absolute right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
          disabled={!message.trim() || isLoadingSend}
        >
          {isLoadingSend ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </motion.button>
      </div>
    </form>
  );
};
