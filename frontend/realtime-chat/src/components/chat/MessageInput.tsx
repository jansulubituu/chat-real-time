'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendMessageRequest } from '@/lib/types';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getLocalStorage, localStorageKeys } from '@/lib/utils';
import { toast } from 'react-hot-toast';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
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
    
    if ((!message.trim() && !selectedFile) || isLoadingSend || isUploading) {
      return;
    }
    
    try {
      if (selectedFile) {
        await sendFileMessage();
      } else {
        const messageData: SendMessageRequest = {
          conversationId,
          content: message.trim(),
          contentType: 'text'
        };
        
        await onSendMessage(messageData);
      }
      
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
      toast.error('Failed to send message. Please try again.');
    }
  };
  
  // Upload file to the server
  const uploadFile = async (file: File): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';
    const token = getLocalStorage(localStorageKeys.TOKEN);
    
    const formData = new FormData();
    
    // Based on the API format, use a single endpoint for both image and file uploads
    const endpoint = '/upload/file';
    
    // Add the file to the FormData with key 'file' (as shown in the Postman screenshot)
    formData.append('file', file, file.name);
    
    try {
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('File upload response:', response.data);
      
      // The response contains url, filename, originalname, extension, mimeType, contentType
      return response.data.url;
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  };
  
  // Send file message
  const sendFileMessage = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      
      // Upload the file first
      const fileUrl = await uploadFile(selectedFile);
      
      // Then send the message with the file URL
      // Determine content type based on the file's mime type
      let contentType: 'image' | 'file' = 'file';
      if (selectedFile.type.startsWith('image/')) {
        contentType = 'image';
      }
      
      const messageData: SendMessageRequest = {
        conversationId,
        content: selectedFile.name,
        contentType,
        fileUrl
      };
      
      await onSendMessage(messageData);
      
      // Clean up
      resetFileSelection();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle file attachment
  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    
    setSelectedFile(file);
    
    // Create a preview URL for images
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviewUrl(previewUrl);
    }
  };
  
  // Reset file selection
  const resetFileSelection = () => {
    setSelectedFile(null);
    setFilePreviewUrl(null);
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
  
  // Get file size in readable format
  const getFileSize = (size: number): string => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t py-3 px-4 bg-white dark:bg-gray-800">
      {/* Compact File Preview */}
      {selectedFile && (
        <div className="mb-2 px-2">
          <div className="flex items-center p-2 bg-blue-50 dark:bg-gray-700 rounded-lg shadow-sm border border-blue-100 dark:border-gray-600 relative">
            {filePreviewUrl && selectedFile.type.startsWith('image/') ? (
              <div className="mr-3 relative h-14 w-14 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 bg-white">
                <img 
                  src={filePreviewUrl} 
                  alt="Preview" 
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mr-3 flex items-center justify-center h-14 w-14 rounded-md bg-blue-100 dark:bg-gray-600 text-blue-500 dark:text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{getFileSize(selectedFile.size)}</p>
            </div>
            
            <button 
              type="button"
              onClick={resetFileSelection}
              className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
              title="Remove file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="relative flex items-center">
        {/* Attachment button */}
        <div className="absolute left-3 flex space-x-2">
          <button
            type="button"
            onClick={handleAttachmentClick}
            className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hover:scale-110 transform"
            disabled={isLoadingSend || isUploading}
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
            disabled={isLoadingSend || isUploading}
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
          accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          disabled={isLoadingSend || isUploading}
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
          placeholder={selectedFile ? "Add a message..." : "Type a message..."}
          className="flex-grow resize-none min-h-[40px] max-h-[120px] pl-20 pr-14 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 transition-all scrollbar-hidden"
          rows={1}
          disabled={isLoadingSend || isUploading}
        />
        
        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05, backgroundColor: '#2563eb' }}
          type="submit"
          className="absolute right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm"
          disabled={(!message.trim() && !selectedFile) || isLoadingSend || isUploading}
        >
          {isLoadingSend || isUploading ? (
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
