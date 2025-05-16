'use client';

import React, { useState, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Conversation } from '@/lib/types';
import { ConversationItem } from './ConversationItem';
import { searchApi, messageApi } from '@/lib/api';
import { NewConversationModal } from './NewConversationModal';
import { useRouter } from 'next/navigation';

interface ConversationsListProps {
  onConversationSelect?: (conversation: Conversation) => void;
}

export const ConversationsList = ({ onConversationSelect }: ConversationsListProps) => {
  const { conversations, activeConversation, setActiveConversation, loading, createConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const router = useRouter();

  // Fetch last messages and unread counts for each conversation
  useEffect(() => {
    const fetchConversationExtras = async () => {
      if (!conversations.length) return;
      
      const messagesPromises = conversations.map(async (conversation) => {
        try {
          // Get the latest message (limit 1)
          const { messages } = await messageApi.getMessages(conversation._id, 1, 1);
          
          if (messages.length > 0) {
            // Store the latest message content for this conversation
            setLastMessages(prev => ({
              ...prev,
              [conversation._id]: messages[0].content
            }));
            
            // Check if the message is unread by the current user
            const unreadCount = messages.filter(
              msg => !msg.readBy.find(user => user._id === 'current-user-id') // Replace with actual user ID
            ).length;
            
            setUnreadCounts(prev => ({
              ...prev,
              [conversation._id]: unreadCount
            }));
          }
        } catch (error) {
          console.error(`Error fetching messages for conversation ${conversation._id}:`, error);
        }
      });
      
      await Promise.all(messagesPromises);
    };
    
    fetchConversationExtras();
  }, [conversations]);

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    console.log('Selecting conversation:', conversation._id);
    setActiveConversation(conversation);
    
    // Clear unread count when selecting a conversation
    setUnreadCounts(prev => ({
      ...prev,
      [conversation._id]: 0
    }));
    
    // Call the onConversationSelect callback for mobile view
    if (onConversationSelect) {
      onConversationSelect(conversation);
    }
    
    // Navigate to the conversation detail page
    router.push(`/chat/${conversation._id}`);
  };

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      // Search for users or conversations
      const results = await searchApi.searchConversations(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle creating a new conversation
  const handleCreateConversation = async (participantIds: string[], isGroup: boolean, name?: string, avatar?: File) => {
    try {
      const newConversation = await createConversation(participantIds, isGroup, name, avatar);
      handleSelectConversation(newConversation);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Get the list of conversations to display (either search results or all conversations)
  const displayedConversations = searchQuery.trim() !== '' ? searchResults : conversations;

  // Determine if there are no conversations to show
  const noConversations = !loading && displayedConversations.length === 0;
  const noSearchResults = searchQuery.trim() !== '' && !isSearching && searchResults.length === 0;

  return (
    <div className="h-full flex flex-col">
      {/* Search input */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              searchQuery && (
                <button
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : noConversations ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {noSearchResults 
              ? "No conversations found for this search"
              : "No conversations yet"}
          </div>
        ) : (
          displayedConversations.map(conversation => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              isActive={activeConversation?._id === conversation._id}
              onClick={() => handleSelectConversation(conversation)}
              lastMessage={lastMessages[conversation._id]}
              unreadCount={unreadCounts[conversation._id] || 0}
            />
          ))
        )}
      </div>

      {/* Create new conversation button */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          onClick={() => setShowNewConversationModal(true)}
        >
          New Conversation
        </button>
      </div>

      {/* New conversation modal */}
      <NewConversationModal
        isOpen={showNewConversationModal}
        onClose={() => setShowNewConversationModal(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  );
};

export default ConversationsList;
