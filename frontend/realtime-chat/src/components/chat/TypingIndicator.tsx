'use client';

import React from 'react';
import { User } from '@/lib/types';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  typingUsers: User[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers }) => {
  if (typingUsers.length === 0) {
    return null;
  }

  let typingText = '';
  if (typingUsers.length === 1) {
    typingText = `${typingUsers[0].username} is typing...`;
  } else if (typingUsers.length === 2) {
    typingText = `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
  } else {
    typingText = `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center p-3 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm max-w-[80%] border border-gray-100 dark:border-gray-700"
    >
      <div className="flex space-x-1 mr-2">
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0, ease: "easeInOut" }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.2, ease: "easeInOut" }}
        />
        <motion.div
          className="w-2 h-2 bg-blue-500 rounded-full"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'loop', delay: 0.4, ease: "easeInOut" }}
        />
      </div>
      <span className="font-medium">{typingText}</span>
    </motion.div>
  );
};
