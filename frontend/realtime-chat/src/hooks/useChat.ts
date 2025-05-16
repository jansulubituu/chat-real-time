'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { conversationApi, messageApi } from '@/lib/api';
import { Conversation, Message, SendMessageRequest, TypingEvent, MessagesReadEvent, UserStatusEvent, User, CreateConversationRequest } from '@/lib/types';

interface ChatHook {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  loadingMessages: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> list of userIds
  error: string | null;
  page: number;
  hasMore: boolean;
  
  // Actions
  setActiveConversation: (conversation: Conversation | null) => void;
  sendMessage: (message: SendMessageRequest) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  createConversation: (participantIds: string[], isGroup: boolean, name?: string, avatar?: File) => Promise<Conversation>;
}

export const useChat = (): ChatHook => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Lấy danh sách cuộc trò chuyện
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const conversationsData = await conversationApi.getConversations();
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Lấy tin nhắn khi chọn cuộc trò chuyện
  useEffect(() => {
    const fetchMessages = async () => {
      // Reset messages when no active conversation
      if (!activeConversation) {
        setMessages([]);
        console.log('No active conversation, messages reset to []');
        return;
      }

      console.log('Fetching messages for conversation:', activeConversation._id);
      try {
        setLoadingMessages(true);
        setPage(1); // Reset page to 1
        const { messages: fetchedMessages, pages } = await messageApi.getMessages(activeConversation._id, 1);
        console.log('Messages fetched:', fetchedMessages?.length || 0, 'messages');
        setMessages(fetchedMessages || []); // Ensure we always have an array even if no messages
        setTotalPages(pages);
        
        // Đánh dấu tin nhắn đã đọc
        await messageApi.markMessagesAsRead(activeConversation._id);
        
        // Tham gia vào phòng chat thông qua socket
        if (socket && isConnected) {
          socket.emit('join_conversation', { conversationId: activeConversation._id });
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError('Failed to load messages');
        // Ensure we reset the messages array even on error
        setMessages([]);
      } finally {
        // Always finish loading, even if there was an error
        setLoadingMessages(false);
        console.log('Loading messages complete');
      }
    };

    fetchMessages();
    
    // Rời phòng chat khi thay đổi cuộc trò chuyện
    return () => {
      if (socket && isConnected && activeConversation) {
        socket.emit('leave_conversation', { conversationId: activeConversation._id });
      }
    };
  }, [activeConversation, socket, isConnected]);

  // Xử lý nhận tin nhắn mới
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (newMessage: Message) => {
      // Thêm tin nhắn mới vào danh sách
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Tự động đánh dấu tin nhắn là đã đọc nếu đang trong cuộc trò chuyện đó
      if (activeConversation && newMessage.conversationId === activeConversation._id) {
        socket.emit('mark_read', { conversationId: newMessage.conversationId });
      }
      
      // Cập nhật conversation list để đặt cuộc trò chuyện có tin nhắn mới lên đầu
      setConversations(prevConversations => {
        const updatedConversations = [...prevConversations];
        const conversationIndex = updatedConversations.findIndex(
          c => c._id === newMessage.conversationId
        );
        
        if (conversationIndex !== -1) {
          const conversation = { ...updatedConversations[conversationIndex] };
          updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(conversation);
        }
        
        return updatedConversations;
      });
    };

    // Xử lý sự kiện typing
    const handleTyping = (data: TypingEvent) => {
      if (data.userId === user?._id) return; // Không hiển thị typing của chính mình
      
      setTypingUsers(prev => {
        const conversationTypers = prev[data.conversationId] || [];
        
        if (data.isTyping) {
          // Thêm user vào danh sách đang typing
          if (!conversationTypers.includes(data.userId)) {
            return {
              ...prev,
              [data.conversationId]: [...conversationTypers, data.userId]
            };
          }
        } else {
          // Xóa user khỏi danh sách đang typing
          return {
            ...prev,
            [data.conversationId]: conversationTypers.filter(id => id !== data.userId)
          };
        }
        
        return prev;
      });
    };

    // Xử lý sự kiện tin nhắn đã đọc
    const handleMessagesRead = (data: MessagesReadEvent) => {
      if (data.userId === user?._id) return; // Không cập nhật trạng thái đọc của chính mình
      
      setMessages(prevMessages => {
        return prevMessages.map(message => {
          // Nếu message id thuộc danh sách đã đọc, cập nhật readBy
          if (data.messageIds.includes(message._id)) {
            return {
              ...message,
              readBy: [...message.readBy, { _id: data.userId } as User]
            };
          }
          return message;
        });
      });
    };

    // Xử lý sự kiện thay đổi trạng thái user
    const handleUserStatusChange = (data: UserStatusEvent) => {
      setConversations(prevConversations => {
        return prevConversations.map(conversation => {
          // Cập nhật trạng thái online/offline của user trong mỗi cuộc trò chuyện
          const updatedParticipants = conversation.participants.map(participant => {
            if (participant._id === data.userId) {
              return {
                ...participant,
                status: data.status
              };
            }
            return participant;
          });
          
          return {
            ...conversation,
            participants: updatedParticipants
          };
        });
      });
    };

    // Đăng ký các sự kiện socket
    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_status_changed', handleUserStatusChange);

    return () => {
      // Hủy đăng ký các sự kiện khi component unmount
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_status_changed', handleUserStatusChange);
    };
  }, [socket, isConnected, activeConversation, user]);

  // Gửi tin nhắn
  const sendMessage = useCallback(async (messageData: SendMessageRequest) => {
    if (!socket || !isConnected) {
      throw new Error('Socket is not connected');
    }
    
    try {
      // Gửi tin nhắn thông qua socket
      socket.emit('send_message', messageData);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      throw error;
    }
  }, [socket, isConnected]);

  // Tải thêm tin nhắn cũ
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversation || page >= totalPages || loadingMessages) {
      return;
    }
    
    try {
      setLoadingMessages(true);
      const nextPage = page + 1;
      const { messages: olderMessages } = await messageApi.getMessages(activeConversation._id, nextPage);
      
      setMessages(prevMessages => [...olderMessages, ...prevMessages]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more messages:', error);
      setError('Failed to load more messages');
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversation, page, totalPages, loadingMessages]);

  // Đánh dấu tin nhắn đã đọc
  const markAsRead = useCallback(async (conversationId: string) => {
    if (!socket || !isConnected) {
      return;
    }
    
    try {
      socket.emit('mark_read', { conversationId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, isConnected]);

  // Báo hiệu đang nhập tin nhắn
  const startTyping = useCallback((conversationId: string) => {
    if (!socket || !isConnected) {
      return;
    }
    
    socket.emit('typing', { conversationId, isTyping: true });
  }, [socket, isConnected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (!socket || !isConnected) {
      return;
    }
    
    socket.emit('typing', { conversationId, isTyping: false });
  }, [socket, isConnected]);

  // Tạo cuộc trò chuyện mới
  const createConversation = useCallback(async (participantIds: string[], isGroup: boolean, name?: string, avatar?: File) => {
    // Validate inputs
    if (!participantIds.length) {
      setError('Participants list cannot be empty');
      throw new Error('Participants list cannot be empty');
    }
    
    if (isGroup && (!name || name.trim() === '')) {
      setError('Group name is required for group conversations');
      throw new Error('Group name is required for group conversations');
    }

    // For direct conversations, only allow one participant
    if (!isGroup && participantIds.length > 1) {
      setError('Direct conversations can only have one participant');
      throw new Error('Direct conversations can only have one participant');
    }

    try {
      // Create form data if we have an avatar
      let conversationData: CreateConversationRequest | FormData;
      
      if (avatar) {
        const formData = new FormData();
        formData.append('participants', JSON.stringify(participantIds));
        formData.append('type', isGroup ? 'group' : 'direct');
        if (isGroup && name) {
          formData.append('name', name);
        }
        formData.append('avatar', avatar);
        conversationData = formData;
      } else {
        conversationData = {
        participants: participantIds,
        type: isGroup ? 'group' as const : 'direct' as const,
        name: isGroup ? name : undefined
      };
      }
      
      const newConversation = await conversationApi.createConversation(conversationData);
      
      // Thêm cuộc trò chuyện mới vào danh sách
      setConversations(prev => {
        // Check if conversation already exists (by ID)
        const exists = prev.some(conv => conv._id === newConversation._id);
        if (exists) {
          return prev; // Don't duplicate conversation
        }
        return [newConversation, ...prev];
      });

      // Automatically join the new conversation room via socket
      if (socket && isConnected) {
        socket.emit('join_conversation', { conversationId: newConversation._id });
      }
      
      return newConversation;
    } catch (error: Error | unknown) {
      console.error('Error creating conversation:', error);
      setError(error instanceof Error ? error.message : 'Failed to create conversation');
      throw error;
    }
  }, [socket, isConnected]);

  // Add console log to track when activeConversation is set
  const setActiveConversationWithLog = useCallback((conversation: Conversation | null) => {
    console.log('Setting active conversation:', conversation?._id || 'null');
    setActiveConversation(conversation);
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    loading,
    loadingMessages,
    typingUsers,
    error,
    page,
    hasMore: page < totalPages,
    
    setActiveConversation: setActiveConversationWithLog,
    sendMessage,
    loadMoreMessages,
    markAsRead,
    startTyping,
    stopTyping,
    createConversation
  };
};
