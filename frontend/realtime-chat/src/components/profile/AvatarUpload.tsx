'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface AvatarUploadProps {
  onAvatarChange: (file: File | null) => void;
  avatarPreview: string | null;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ 
  onAvatarChange, 
  avatarPreview 
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    onAvatarChange(file);
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 relative">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {avatarPreview ? (
            <Image 
              src={avatarPreview} 
              alt="Avatar preview" 
              width={96} 
              height={96} 
              className="object-cover w-full h-full"
            />
          ) : user?.avatar ? (
            <Image 
              src={user.avatar} 
              alt="Current avatar" 
              width={96} 
              height={96} 
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-3xl text-gray-400">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleClick}
        >
          Upload Image
        </Button>
        
        {(avatarPreview || user?.avatar) && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleRemoveAvatar}
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            Remove
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AvatarUpload;
