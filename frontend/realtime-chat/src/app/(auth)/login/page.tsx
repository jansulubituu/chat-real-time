

import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Realtime Chat',
  description: 'Login to access your chat conversations',
};

export default function LoginPage() {
  return <LoginForm />;
}
