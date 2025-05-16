'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutBtnRef = useRef<HTMLButtonElement>(null);
  const logoutConfirmRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Check if user is on chat page
  const isOnChatPage = pathname.includes('/chat');
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle logout confirmation dropdown
      if (
        logoutConfirmRef.current && 
        !logoutConfirmRef.current.contains(event.target as Node) &&
        logoutBtnRef.current &&
        !logoutBtnRef.current.contains(event.target as Node)
      ) {
        setShowLogoutConfirm(false);
      }
      
      // Handle user menu dropdown
      if (
        userMenuRef.current && 
        !userMenuRef.current.contains(event.target as Node) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
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
      console.log("Logout successfully");
      router.refresh();
     
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const navigateToProfile = () => {
    setShowUserMenu(false);
    router.push('/profile');
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
              
              {/* User Avatar with Dropdown */}
              <div className="relative">
                <div 
                  ref={avatarRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                >
                  {user.avatar ? (
                    <Image 
                      src={user.avatar} 
                      alt={user.username}
                      width={40} 
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-lg font-medium text-gray-600">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                
                {/* User Menu Dropdown */}
                {showUserMenu && (
                  <div
                    ref={userMenuRef}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-100 overflow-hidden"
                  >
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={navigateToProfile}
                        className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setShowLogoutConfirm(true);
                        }}
                        className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Logout Confirmation */}
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
