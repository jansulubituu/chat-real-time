import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Realtime Chat',
  description: 'Create an account to start chatting',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
