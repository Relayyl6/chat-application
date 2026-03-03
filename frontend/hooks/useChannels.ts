'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocketContext } from '@/context/SocketContext';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { onMessageSent, onChannelCreated, onChannelRenamed, onChannelMembersAdded, onChannelMemberRemoved } = useSocketContext();

  useEffect(() => {
    console.log('[useChannels] Component mounted, loading channels');
    loadChannels();
  }, []);

  // Update channel list when new messages arrive
  useEffect(() => {
    console.log('[useChannels] Setting up socket listeners');

    const unsubscribeMessage = onMessageSent((message) => {
      console.log('[useChannels] onMessageSent event received:', message);
      setChannels((prev) => {
        const updated = prev.map((channel) =>
          channel._id === message.channelId
            ? {
                ...channel,
                lastMessage: {
                  content: message.content,
                  senderId: message.senderId,
                  sentAt: message.createdAt,
                  _id: message._id
                }
              }
            : channel
        );
        const channelUpdated = updated.find(ch => ch._id === message.channelId);
        console.log(`[useChannels] Updated channel ${message.channelId} with last message`, channelUpdated?.lastMessage);
        return updated;
      });
    });

    const unsubscribeChannelCreated = onChannelCreated((channel) => {
      console.log('[useChannels] onChannelCreated event received:', channel);
      setChannels((prev) => {
        const updated = [...prev, channel];
        console.log(`[useChannels] New channel added, total channels: ${updated.length}`);
        return updated;
      });
    });

    const unsubscribeChannelRenamed = onChannelRenamed((data) => {
      console.log('[useChannels] onChannelRenamed event received:', data);
      setChannels((prev) => {
        const updated = prev.map((ch) =>
          ch._id === data.channelId ? { ...ch, name: data.name } : ch
        );
        console.log(`[useChannels] Channel ${data.channelId} renamed to "${data.name}"`);
        return updated;
      });
    });

    return () => {
      console.log('[useChannels] Cleaning up socket listeners');
      unsubscribeMessage();
      unsubscribeChannelCreated();
      unsubscribeChannelRenamed();
    };
  }, [onMessageSent, onChannelCreated, onChannelRenamed]);

  const loadChannels = async () => {
    console.log('[useChannels] Starting loadChannels');
    setLoading(true);
    try {
      console.log('[useChannels] Fetching channels from API');
      const data = await api.getChannels();
      console.log(`[useChannels] Loaded ${data.length} channels:`, data);
      
      // If no channels, use dummy channels for testing
      if (data.length === 0) {
        console.log('[useChannels] No channels from API, using dummy channels');
        const dummyChannels: Channel[] = [
          {
            _id: 'ch_1',
            name: 'General',
            type: 'group',
            avatar: '🌍',
            description: 'General discussion channel',
            users: [
              {
                userId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'admin',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              }
            ],
            lastMessage: {
              content: 'Welcome to the general channel!',
              senderId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              sentAt: new Date().toISOString(),
              _id: 'msg_1'
            },
            messageAutoId: 1,
            createdBy: 'user_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'ch_2',
            name: 'Random',
            type: 'group',
            avatar: '🎲',
            description: 'Random fun discussions',
            users: [
              {
                userId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 2
              }
            ],
            lastMessage: {
              content: 'This is a random message 😄',
              senderId: { id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
              sentAt: new Date().toISOString(),
              _id: 'msg_2'
            },
            messageAutoId: 5,
            createdBy: 'user_2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            _id: 'ch_3',
            name: 'John Doe',
            type: 'direct',
            users: [
              {
                userId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              },
              {
                userId: { id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              }
            ],
            lastMessage: {
              content: 'Hey! How are you doing?',
              senderId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              sentAt: new Date().toISOString(),
              _id: 'msg_3'
            },
            messageAutoId: 3,
            createdBy: 'user_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setChannels(dummyChannels);
      } else {
        setChannels(data);
      }
    } catch (error) {
      console.error('[useChannels] Failed to load channels:', error);
      // On error, set dummy channels so app isn't broken
      const dummyChannels: Channel[] = [
        {
          _id: 'ch_1',
          name: 'General',
          type: 'group',
          avatar: '🌍',
          description: 'General discussion channel',
          users: [
            {
              userId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              role: 'admin',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 0
            }
          ],
          lastMessage: {
            content: 'Welcome to the general channel!',
            senderId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
            sentAt: new Date().toISOString(),
            _id: 'msg_1'
          },
          messageAutoId: 1,
          createdBy: 'user_1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'ch_2',
          name: 'Random',
          type: 'group',
          avatar: '🎲',
          description: 'Random fun discussions',
          users: [
            {
              userId: { id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              role: 'member',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 2
            }
          ],
          lastMessage: {
            content: 'This is a random message 😄',
            senderId: { id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
            sentAt: new Date().toISOString(),
            _id: 'msg_2'
          },
          messageAutoId: 5,
          createdBy: 'user_2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setChannels(dummyChannels);
    } finally {
      setLoading(false);
      console.log('[useChannels] loadChannels completed');
    }
  };

  const createChannel = async (
    type: 'direct' | 'group',
    name: string,
    userIds: string[],
    description?: string,
    avatar?: string
  ) => {
    console.log('[useChannels] Creating channel:', { type, name, userIds, description });
    try {
      const channel = await api.createChannel(type, name, userIds, description, avatar);
      console.log('[useChannels] Channel created successfully:', channel);
      setChannels((prev) => {
        const updated = [...prev, channel];
        console.log(`[useChannels] Total channels after creation: ${updated.length}`);
        return updated;
      });
      return channel;
    } catch (error) {
      console.error('[useChannels] Failed to create channel:', error);
      throw error;
    }
  };

  const renameChannel = async (channelId: string, name: string) => {
    console.log(`[useChannels] Renaming channel ${channelId} to "${name}"`);
    try {
      const channel = await api.renameChannel(channelId, name);
      console.log('[useChannels] Channel renamed successfully:', channel);
      setChannels((prev) =>
        prev.map((ch) => (ch._id === channelId ? { ...ch, name } : ch))
      );
      return channel;
    } catch (error) {
      console.error('[useChannels] Failed to rename channel:', error);
      throw error;
    }
  };

  const searchChannels = async (query: string) => {
    console.log(`[useChannels] Searching channels for query: "${query}"`);
    try {
      const results = await api.searchChannels(query);
      console.log(`[useChannels] Search returned ${results.length} results`);
      return results;
    } catch (error) {
      console.error('[useChannels] Failed to search channels:', error);
      throw error;
    }
  };

  return {
    channels,
    loading,
    loadChannels,
    createChannel,
    renameChannel,
    searchChannels
  };
};