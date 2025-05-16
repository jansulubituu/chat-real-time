'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileForm from '@/components/profile/ProfileForm';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <ProfileForm />
      </div>
    </div>
  );
};

export default ProfilePage;
