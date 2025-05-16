'use client';

import React from 'react';
import { Header } from './Header';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Only hide header on auth pages (login/register)
  const isAuthPage = pathname.includes('/login') || pathname.includes('/register');
  
  // Show header on all pages except auth pages
  const showHeader = !isAuthPage;
  
  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
};

export default ClientLayout; 