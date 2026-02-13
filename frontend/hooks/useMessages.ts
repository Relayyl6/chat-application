'use client';

import { useEffect, useState } from 'react';
import { useSocketContext } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { socketActions } from '@/lib/socket';

export const useMessages = (channelId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { onNewMessage } = useSocketContext();

  // Load messages when channel changes
  useEffect(() => {
    if (!channelId) return;

    const loadMessages = async () => {
      setLoading(true);
      try {
        const msgs = await api.getMessages(channelId);
        setMessages(msgs);
        
        // Mark as read
        if (msgs.length > 0) {
          await api.markMessagesAsRead(channelId, msgs[msgs.length - 1].autoId);
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [channelId]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!channelId) return;

    const unsubscribe = onNewMessage((message) => {
      if (message.channelId === channelId) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if viewing this channel
        api.markMessagesAsRead(channelId, message.autoId);
      }
    });

    return unsubscribe;
  }, [channelId, onNewMessage]);

  const sendMessage = (content: string, replyTo?: string) => {
    if (!channelId) return;

    const tempId = Date.now();
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Optimistic update
    const optimisticMessage: Message = {
      _id: '',
      channelId,
      senderId: currentUser,
      content,
      type: 'text',
      autoId: 0,
      readBy: [currentUser.id],
      deliveredTo: [currentUser.id],
      createdAt: Date.now().toISOString(),
      updatedAt: Date.now().toISOString(),
      status: 'sending',
      tempId
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send via socket
    socketActions.sendMessage(channelId, content, replyTo);
  };

  const loadMoreMessages = async () => {
    if (!channelId || messages.length === 0) return;

    try {
      const oldestMessage = messages[0];
      const olderMessages = await api.getMessages(channelId, oldestMessage.autoId, 50);
      
      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    loadMoreMessages
  };
};