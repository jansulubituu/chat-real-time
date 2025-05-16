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
    <div className="flex items-center px-4 py-2 text-xs text-gray-500">
      <div className="flex space-x-1 mr-2">
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.2 }}
        />
        <motion.div
          className="w-1.5 h-1.5 bg-gray-400 rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.4 }}
        />
      </div>
      <span>{typingText}</span>
    </div>
  );
};
