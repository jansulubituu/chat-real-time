'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);
  const logoutConfirmRef = useRef<HTMLDivElement>(null);
  
  // Check if user is on chat page
  const isOnChatPage = pathname.includes('/chat');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutConfirmRef.current && 
        !logoutConfirmRef.current.contains(event.target as Node) &&
        logoutBtnRef.current &&
        !logoutBtnRef.current.contains(event.target as Node)
      ) {
        setShowLogoutConfirm(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="w-full py-6 px-4 sm:px-6 lg:px-8 sticky top-0 z-10 backdrop-blur-lg bg-white/70"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text"
            >
              Realtime Chat
            </motion.div>
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              {/* Only show the Go to Chat button if not already on chat page */}
              {!isOnChatPage && (
                <Link href="/chat">
                  <Button variant="outline" size="sm" className="transition-all hover:scale-105">
                    Go to Chat
                  </Button>
                </Link>
              )}
              <div className="relative">
                <button
                  ref={logoutBtnRef}
                  onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                  className="py-1.5 px-3 text-sm font-medium rounded-lg transition-colors bg-gray-200 text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
                
                {/* Compact logout confirmation */}
                {showLogoutConfirm && (
                  <div 
                    ref={logoutConfirmRef}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-3 text-sm">
                      <p className="font-medium text-gray-700">Sign out?</p>
                      <div className="flex mt-3 space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setShowLogoutConfirm(false)}
                          className="text-xs py-1 flex-1"
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleLogout}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs py-1 flex-1"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" size="sm" className="transition-all hover:scale-105">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="transition-all hover:scale-105">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
