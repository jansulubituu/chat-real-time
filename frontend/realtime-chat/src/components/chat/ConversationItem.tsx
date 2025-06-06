'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Conversation } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
  isActive: boolean;
  lastMessage?: string;
  unreadCount?: number;
}

export const ConversationItem = ({
  conversation,
  onClick,
  isActive,
  lastMessage,
  unreadCount = 0
}: ConversationItemProps) => {
  const { user } = useAuth();
  
  // Get other participant for direct chats, or group name for group chats
  const displayInfo = useMemo(() => {
    if (conversation.type === 'direct') {
      const otherUser = conversation.participants.find(p => p._id !== user?._id);
      return {
        name: otherUser?.username || 'Unknown User',
        avatar: otherUser?.avatar,
        status: otherUser?.status || 'offline',
        initial: otherUser?.username?.[0]?.toUpperCase() || 'U'
      };
    } else {
      // For group conversations
      return {
        name: conversation.name || 'Group Chat',
        avatar: conversation.avatar, // Using the group's avatar if it exists
        status: 'group',
        initial: (conversation.name?.[0] || 'G').toUpperCase(),
        participantsCount: conversation.participants.length,
        // Get up to 3 participants for the group avatar grid
        participants: conversation.participants.slice(0, 3)
      };
    }
  }, [conversation, user]);

  // Format the conversation timestamp
  const formattedTime = useMemo(() => {
    if (!conversation.updatedAt) return '';
    
    const date = new Date(conversation.updatedAt);
    const now = new Date();
    
    // If today, show time. If this year, show month/day. Otherwise show full date.
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    } else if (date.getFullYear() === now.getFullYear()) {
      return format(date, 'MMM d');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  }, [conversation.updatedAt]);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`
        flex items-center p-3 gap-3 rounded-lg cursor-pointer transition-all duration-200
        ${isActive 
          ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 pl-2 shadow-sm" 
          : "hover:bg-gray-100 dark:hover:bg-gray-800/70"}
      `}
      onClick={onClick}
    >
      {/* Avatar for direct chat or group chat */}
      <div className="relative flex-shrink-0">
        {conversation.type === 'direct' ? (
          // Direct chat avatar
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden shadow-sm border border-white dark:border-gray-700"
          >
            {displayInfo.avatar ? (
              <img src={displayInfo.avatar} alt={displayInfo.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                {displayInfo.initial}
              </span>
            )}
          </motion.div>
        ) : (
          // Group chat avatar
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="h-12 w-12 relative rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-900 flex items-center justify-center overflow-hidden shadow-sm border border-white dark:border-gray-700"
          >
            {displayInfo.avatar ? (
              // Use the group avatar if available
              <img src={displayInfo.avatar} alt={displayInfo.name} className="w-full h-full object-cover" />
            ) : (
              // If no group avatar, show a grid of participant avatars or initials
              <div className="w-full h-full flex flex-wrap">
                {displayInfo.participants?.map((participant, index) => (
                  <div 
                    key={participant._id} 
                    className={`
                      ${displayInfo.participants?.length === 1 ? 'w-full h-full' : ''}
                      ${displayInfo.participants?.length === 2 ? 'w-1/2 h-full' : ''}
                      ${displayInfo.participants?.length >= 3 ? 'w-1/2 h-1/2' : ''}
                      ${index === 0 && displayInfo.participants?.length === 3 ? 'w-full h-1/2' : ''}
                      flex items-center justify-center bg-gray-300 dark:bg-gray-600
                    `}
                  >
                    {participant.avatar ? (
                      <img src={participant.avatar} alt={participant.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        {participant.username?.[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Online status indicator for direct chats */}
        {conversation.type === 'direct' && (
          <motion.div 
            animate={displayInfo.status === 'online' ? { scale: [1, 1.15, 1] } : {}}
            transition={{ repeat: displayInfo.status === 'online' ? Infinity : 0, repeatDelay: 3 }}
            className={`
              absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900
              ${displayInfo.status === 'online' ? "bg-green-500" : "bg-gray-300"}
            `}
          />
        )}
        
        {/* Group indicator for group chats */}
        {conversation.type === 'group' && (
          <div className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white dark:border-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
        )}
      </div>
      
      {/* Conversation info */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={`font-medium truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {displayInfo.name}
            {conversation.type === 'group' && (
              <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">({displayInfo.participantsCount})</span>
            )}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{formattedTime}</span>
        </div>
        <div className="flex justify-between items-center mt-0.5">
          <p className={`text-sm truncate ${
            unreadCount > 0 
              ? 'text-gray-800 dark:text-gray-200 font-medium'
              : 'text-gray-500 dark:text-gray-400'
          }`}>
            {lastMessage || 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              className="ml-2 bg-blue-500 text-white rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center text-xs font-medium flex-shrink-0 shadow-sm"
            >
              {unreadCount}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConversationItem;
