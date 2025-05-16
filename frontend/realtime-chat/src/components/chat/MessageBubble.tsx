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
      transition={{ duration: 0.2 }}
      className={`flex w-full mb-2 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      style={{ paddingLeft: isCurrentUser ? '0' : '44px', paddingRight: isCurrentUser ? '44px' : '0' }}
    >
      {!isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 absolute left-2 mt-1" style={{ width: '32px' }}>
          {message.sender.avatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
              <Image
                src={message.sender.avatar}
                alt={message.sender.username}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-sm font-medium text-white shadow-sm border-2 border-white dark:border-gray-800">
              {message.sender.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`} style={{ maxWidth: '75%' }}>
        {!isCurrentUser && showAvatar && (
          <span className="text-xs text-gray-500 mb-1 font-medium px-1">{message.sender.username}</span>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg text-sm shadow-sm ${
            isCurrentUser
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-700'
          }`}
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
            whiteSpace: 'pre-wrap'
          }}
        >
          {renderMessageContent(message)}
        </div>
        
        <div className="flex items-center mt-1 text-xs text-gray-500 px-1">
          <span>{formattedTime}</span>
          
          {isCurrentUser && isLast && (
            <span className="ml-2">
              {isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 7l-8 8-4-4" />
                  <path d="M9 15l-4-4" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 7l-8 8-4-4" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
      
      {isCurrentUser && showAvatar && (
        <div className="flex-shrink-0 absolute right-2 mt-1" style={{ width: '32px' }}>
          {currentUser.avatar ? (
            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm">
              <Image
                src={currentUser.avatar}
                alt={currentUser.username}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-sm font-medium text-white shadow-sm border-2 border-white dark:border-gray-800">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

const renderMessageContent = (message: Message) => {
  switch (message.contentType) {
    case 'text':
      return <p style={{ margin: 0 }}>{message.content}</p>;
    
    case 'image':
      return (
        <div className="relative">
          <div className="relative rounded-md overflow-hidden" style={{ maxWidth: '240px', maxHeight: '320px' }}>
            <Image 
              src={message.fileUrl || ''} 
              alt="Image message" 
              width={240} 
              height={240} 
              className="object-contain rounded-md hover:opacity-95 transition-opacity cursor-pointer"
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      );
    
    case 'file':
      return (
        <a 
          href={message.fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="flex items-center hover:underline text-blue-600 dark:text-blue-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {message.content || 'Download file'}
          </span>
        </a>
      );
    
    default:
      return <p style={{ margin: 0 }}>{message.content}</p>;
  }
};
