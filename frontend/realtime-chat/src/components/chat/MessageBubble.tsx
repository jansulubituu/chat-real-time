'use client';

import React from 'react';
import Image from 'next/image';
import { Message, User } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: Message;
  currentUser: User;
  showAvatar?: boolean;
  isLast?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  currentUser,
  showAvatar = true,
  isLast = false
}) => {
  const isCurrentUser = message.sender._id === currentUser._id;
  const formattedTime = formatDate(message.createdAt);
  const isRead = message.readBy.some(user => user._id !== currentUser._id && user._id !== message.sender._id);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 mr-2">
          {message.sender.avatar ? (
            <Image
              src={message.sender.avatar}
              alt={message.sender.username}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-700">
              {message.sender.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {!isCurrentUser && showAvatar && (
          <span className="text-xs text-gray-500 mb-1">{message.sender.username}</span>
        )}
        
        <div
          className={`px-3 py-2 rounded-lg break-words text-sm ${
            isCurrentUser
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-100 text-gray-800 rounded-bl-none'
          }`}
        >
          {renderMessageContent(message)}
        </div>
        
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{formattedTime}</span>
          
          {isCurrentUser && isLast && (
            <span className="ml-2">
              {isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const renderMessageContent = (message: Message) => {
  switch (message.contentType) {
    case 'text':
      return <p>{message.content}</p>;
    
    case 'image':
      return (
        <div className="relative">
          <Image 
            src={message.fileUrl || ''} 
            alt="Image message" 
            width={200} 
            height={200} 
            className="rounded-md max-w-full object-cover cursor-pointer"
          />
        </div>
      );
    
    case 'file':
      return (
        <a 
          href={message.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center hover:underline text-blue-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
          </svg>
          {message.content || 'Download file'}
        </a>
      );
    
    default:
      return <p>{message.content}</p>;
  }
};
