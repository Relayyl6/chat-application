'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocketContext } from '@/context/SocketContext';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { onMessageSent } = useSocketContext();

  useEffect(() => {
    loadChannels();
  }, []);

  // FIX 3: update lastMessageAt in sidebar preview whenever a new message arrives
  useEffect(() => {
    const unsub = onMessageSent((message: any) => {
      setChannels(prev =>
        prev.map(ch =>
          ch._id === message.channelId
            ? {
                ...ch,
                lastMessageAt: {
                  content: message.content,
                  senderId: message.senderId,
                  sendAt: message.createdAt,
                  autoId: message.autoId,
                },
              }
            : ch
        )
      );
    });
    return unsub;
  }, [onMessageSent]);

  const loadChannels = async () => {
    setLoading(true);
    try {
      const { channels, count } = await api.getChannels();
      setChannels(count > 0 ? channels : []);
    } catch (error) {
      console.error('[useChannels] Failed to load channels:', error);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async (
    type: 'direct' | 'group',
    name: string,
    userIds: string[],
    description?: string,
    avatar?: string
  ) => {
    const channel = await api.createChannel(type, name, userIds, description, avatar);
    setChannels(prev => {
      const alreadyExists = prev.some(ch => ch._id === channel._id);
      if (alreadyExists) return prev;
      return [...prev, channel];
    });
    return channel;
  };

  const renameChannel = async (channelId: string, name: string) => {
    const channel = await api.renameChannel(channelId, name);
    setChannels(prev => prev.map(ch => ch._id === channelId ? { ...ch, name } : ch));
    return channel;
  };

  const searchChannels = async (query: string) => {
    return await api.searchChannels(query);
  };

  return {
    channels: Array.isArray(channels) ? channels : [],
    channelsLoading: loading,
    loadChannels,
    createChannel,
    renameChannel,
    searchChannels,
  };
};