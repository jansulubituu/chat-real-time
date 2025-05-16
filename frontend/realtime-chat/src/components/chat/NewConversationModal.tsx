'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/lib/types';
import { searchApi } from '@/lib/api';

interface NewConversationModalProps {
  onClose: () => void;
  onCreateConversation: (participantIds: string[], isGroup: boolean, name?: string, avatar?: File) => Promise<void>;
  isOpen: boolean;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  onClose,
  onCreateConversation,
  isOpen
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [groupAvatar, setGroupAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Clear form on close with a small delay to avoid visual glitches
      const timeout = setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setIsGroup(false);
        setGroupName('');
        setError(null);
        setSearchError(null);
        setGroupAvatar(null);
        setAvatarPreview(null);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSearchError(null);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchApi.searchUsers(query);
      // Filter out current user and already selected users
      const filteredResults = results.filter(
        u => u._id !== user?._id && !selectedUsers.some(selected => selected._id === u._id)
      );
      
      if (filteredResults.length === 0 && query.trim() !== '') {
        setSearchError('No users found matching this search');
      }
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchError('Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (selectedUser: User) => {
    // If not a group chat, only allow selecting one user at a time
    if (!isGroup && selectedUsers.length > 0) {
      setSelectedUsers([selectedUser]);
    } else {
      setSelectedUsers(prev => [...prev, selectedUser]);
    }
    
    setSearchResults(prev => prev.filter(user => user._id !== selectedUser._id));
    setSearchQuery('');
    setError(null);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(user => user._id !== userId));
  };

  const toggleGroupMode = () => {
    // If switching from group to direct and multiple users are selected, keep only the first one
    if (isGroup && selectedUsers.length > 1) {
      setSelectedUsers([selectedUsers[0]]);
    }
    
    setIsGroup(!isGroup);
    setError(null);
    
    // Clear group-specific data when switching to direct
    if (isGroup) {
      setGroupName('');
      setGroupAvatar(null);
      setAvatarPreview(null);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    setGroupAvatar(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setError(null);
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeAvatar = () => {
    setGroupAvatar(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateConversation = async () => {
    // Validate inputs
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    
    if (isGroup && (!groupName || groupName.trim() === '')) {
      setError('Please enter a group name');
      return;
    }
    
    if (isGroup && selectedUsers.length < 2) {
      setError('Group conversations require at least 2 participants');
      return;
    }
    
    setError(null);
    setIsCreating(true);
    
    try {
      // Extract user IDs
      const participantIds = selectedUsers.map(user => user._id);
      await onCreateConversation(
        participantIds, 
        isGroup, 
        isGroup ? groupName : undefined, 
        isGroup ? groupAvatar || undefined : undefined
      );
      onClose();
    } catch (error: Error | unknown) {
      console.error('Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md animate-slideIn">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isGroup ? 'Create Group Conversation' : 'New Conversation'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          {/* Group toggle */}
          <div className="mb-4 flex items-center">
            <label htmlFor="groupToggle" className="mr-2 text-sm font-medium cursor-pointer">Create a group chat</label>
            <div 
              className="relative inline-block w-10 mr-2 align-middle select-none cursor-pointer"
              onClick={() => toggleGroupMode()}
            >
              <input 
                id="groupToggle" 
                type="checkbox" 
                className="sr-only"
                checked={isGroup}
                onChange={toggleGroupMode}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isGroup ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${isGroup ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-xs text-gray-500">{isGroup ? 'Enabled' : 'Disabled'}</span>
          </div>

          {/* Group specific inputs */}
          {isGroup && (
            <div className="mb-4 space-y-4">
              {/* Group name input */}
              <div>
                <label htmlFor="groupName" className="block text-sm font-medium mb-1">Group Name <span className="text-red-500">*</span></label>
              <input
                id="groupName"
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
              />
              </div>
              
              {/* Group avatar upload */}
              <div>
                <label className="block text-sm font-medium mb-1">Group Avatar</label>
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Group avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-col space-y-2">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                    </button>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User search */}
          <div className="mb-4">
            <label htmlFor="userSearch" className="block text-sm font-medium mb-1">
              {isGroup ? 'Add Participants' : 'Select User'} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="userSearch"
                type="text"
                className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search users by name or email..."
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            
            {/* Search error message */}
            {searchError && (
              <div className="mt-1 text-sm text-red-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                {searchError}
              </div>
            )}

            {/* Search results */}
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-md overflow-hidden max-h-40 overflow-y-auto dark:border-gray-600 animate-fadeIn">
                {searchResults.map(user => (
                  <div
                    key={user._id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => selectUser(user)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-3 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium">{user.username[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{user.username}</span>
                      {user.email && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      )}
                    </div>
                    {user.status === 'online' && (
                      <span className="ml-2 h-2.5 w-2.5 bg-green-500 rounded-full" title="Online"></span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                {selectedUsers.length} {selectedUsers.length === 1 ? 'User' : 'Users'} Selected
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center bg-blue-100 dark:bg-blue-900 px-3 py-1.5 rounded-full"
                  >
                    <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center mr-1.5 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium">{user.username[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <span className="text-sm text-blue-800 dark:text-blue-200">{user.username}</span>
                    <button
                      onClick={() => removeUser(user._id)}
                      className="ml-1.5 text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-300"
                      title="Remove user"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isGroup && selectedUsers.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Search and select a user to start a direct conversation.
            </p>
          )}
          
          {isGroup && selectedUsers.length < 2 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Group conversations require at least 2 participants.
            </p>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateConversation}
            disabled={
              selectedUsers.length === 0 || 
              (isGroup && !groupName) || 
              (isGroup && selectedUsers.length < 2) ||
              isCreating
            }
            className={`px-4 py-2 text-sm text-white rounded-md flex items-center transition-colors ${
              selectedUsers.length === 0 || 
              (isGroup && !groupName) || 
              (isGroup && selectedUsers.length < 2) ||
              isCreating
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isCreating && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewConversationModal; 