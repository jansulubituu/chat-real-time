'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import AvatarUpload from './AvatarUpload';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { getLocalStorage } from '@/lib/utils';
import { localStorageKeys } from '@/lib/utils';
import { User } from '@/lib/types';
import * as dotenv from "dotenv";
dotenv.config();
interface ProfileFormData {
  username: string;
  email: string;
}

interface ImageUploadResponse {
  url: string;
  public_id?: string;
}

// Create a type that extends Partial<User> but explicitly allows avatar to be null
interface UserUpdateData extends Omit<Partial<User>, 'avatar'> {
  avatar?: string | null;
}

const ProfileForm: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      username: '',
      email: '',
    }
  });

  useEffect(() => {
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
    }
  }, [user, setValue]);

  const handleAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    } else {
      setAvatarPreview(null);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';
      const token = getLocalStorage(localStorageKeys.TOKEN);
      
      const response = await axios.post<ImageUploadResponse>(`${API_URL}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Return the image URL from the response
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Update profile with different cases
      let avatarUrl: string | null | undefined = undefined;
      
      // If there's an avatar to upload, upload it first to get the URL
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile);
      } else if (avatarPreview === null && user.avatar) {
        // If avatar was removed (preview is null but user had an avatar)
        avatarUrl = null; // Explicitly set to null to remove avatar
      }
      
      // Now update the profile with the avatar URL (if any)
      const updateData: UserUpdateData = {
        username: data.username,
        email: data.email !== user.email ? data.email : undefined,
        avatar: avatarUrl
      };
      
      await userApi.updateProfile(updateData as Partial<User>);
      
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 
                           axios.isAxiosError(error) && error.response?.data?.message ? 
                           error.response.data.message : 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto">
      <div className="mb-6">
        <AvatarUpload 
          onAvatarChange={handleAvatarChange}
          avatarPreview={avatarPreview}
        />
      </div>
      
      <div className="space-y-4">
        <Input
          label="Username"
          fullWidth
          {...register('username', { 
            required: 'Username is required',
            minLength: { value: 3, message: 'Username must be at least 3 characters' }
          })}
          error={errors.username?.message}
        />
        
        <Input
          label="Email"
          type="email"
          fullWidth
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
          error={errors.email?.message}
        />
        
        <div className="mt-6">
          <Button 
            type="submit" 
            fullWidth 
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ProfileForm;
