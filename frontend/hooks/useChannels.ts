'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocketContext } from '@/context/SocketContext';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { onNewMessage } = useSocketContext();

  useEffect(() => {
    loadChannels();
  }, []);

  // Update channel list when new messages arrive
  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      setChannels((prev) =>
        prev.map((channel) =>
          channel._id === message.channelId
            ? {
                ...channel,
                lastMessage: {
                  content: message.content,
                  senderId: message.senderId,
                  sentAt: message.createdAt,
                  autoId: message.autoId
                }
              }
            : channel
        )
      );
    });

    return unsubscribe;
  }, [onNewMessage]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const data = await api.getChannels();
      setChannels(data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (
    type: 'direct' | 'group',
    name: string,
    userIds: string[],
    description?: string
  ) => {
    try {
      const channel = await api.createChannel(type, name, userIds, description);
      setChannels((prev) => [...prev, channel]);
      return channel;
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  };

  return {
    channels,
    loading,
    loadChannels,
    createChannel
  };
};