'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useSocketContext } from '@/context/SocketContext';

export const useChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(false);
  const { onMessageSent, onChannelCreated, onChannelRenamed } = useSocketContext();

  useEffect(() => {
    console.log('[useChannels] Component mounted, loading channels');
    loadChannels();
  }, []);

  const loadChannels = async () => {
    console.log('[useChannels] Starting loadChannels');
    setLoading(true);
    try {
      console.log('[useChannels] Fetching channels from API');
      const { channels, count } = await api.getChannels();
      console.log(`[useChannels] Loaded ${count} channels:`, channels);
      
      // If no channels, use dummy channels for testing
      if (count === 0) {
        console.log('[useChannels] No channels from API, using dummy channels');
        const dummyChannels: Channel[] = [
          {
            _id: 'ch_1',
            name: 'General',
            type: 'group',
            avatar: '🌍',
            description: 'General discussion channel',
            members: [
              {
                userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'admin',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              }
            ],
            lastMessageAt: {
              content: 'Welcome to the general channel!',
              senderId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              sendAt: new Date().toISOString(),
              autoId: 1
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
            members: [
              {
                userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 2
              }
            ],
            lastMessageAt: {
              content: 'This is a random message 😄',
              senderId: { _id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
              sendAt: new Date().toISOString(),
              autoId: 2
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
            members: [
              {
                userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              },
              {
                userId: { _id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
                role: 'member',
                joinedAt: new Date().toISOString(),
                lastRead: 0,
                unreadCount: 0
              }
            ],
            lastMessageAt: {
              content: 'Hey! How are you doing?',
              senderId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
              sendAt: new Date().toISOString(),
              autoId: 3
            },
            messageAutoId: 3,
            createdBy: 'user_1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setChannels(dummyChannels);
      } else {
        setChannels(channels);
      }
    } catch (error) {
      console.error('[useChannels] Failed to load channels:', error);
      // On error, set dummy channels so app isn't broken
      const dummyChannels: Channel[] = [
        {
          _id: 'ch_1',
          name: 'General',
          type: 'group',
          avatar: 'https://ui-avatars.com/api/?name=General&background=random&size=128',
          description: 'General discussion channel',
          members: [
            {
              _id: 'mem_1',
              userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online', avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=john_doe&size=128' },
              role: 'admin',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 0
            }
          ],
          lastMessageAt: {
            content: 'Welcome to the general channel!',
            senderId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
            sendAt: new Date().toISOString(),
            autoId: 1
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
          avatar: 'https://ui-avatars.com/api/?name=Random&background=random&size=128',
          description: 'Random fun discussions',
          members: [
            {
              _id: 'mem_2',
              userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online', avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=john_doe&size=128' },
              role: 'member',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 2
            },
            {
              _id: 'mem_3',
              userId: { _id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline', avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=jane_smith&size=128' },
              role: 'member',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 0
            }
          ],
          lastMessageAt: {
            content: 'This is a random message 😄',
            senderId: { _id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline' },
            sendAt: new Date().toISOString(),
            autoId: 5
          },
          messageAutoId: 5,
          createdBy: 'user_2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'ch_3',
          name: null,
          type: 'direct',
          avatar: null,
          description: null,
          members: [
            {
              _id: 'mem_4',
              userId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online', avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=john_doe&size=128' },
              role: 'admin',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 0
            },
            {
              _id: 'mem_5',
              userId: { _id: 'user_2', username: 'jane_smith', email: 'jane@example.com', status: 'offline', avatar: 'https://api.dicebear.com/9.x/adventurer/svg?seed=jane_smith&size=128' },
              role: 'member',
              joinedAt: new Date().toISOString(),
              lastRead: 0,
              unreadCount: 1
            }
          ],
          lastMessageAt: {
            content: 'Hey! How are you doing?',
            senderId: { _id: 'user_1', username: 'john_doe', email: 'john@example.com', status: 'online' },
            sendAt: new Date().toISOString(),
            autoId: 3
          },
          messageAutoId: 3,
          createdBy: 'user_1',
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
    channels: Array.isArray(channels) ? channels : [],
    channelsLoading: loading,
    loadChannels,
    createChannel,
    renameChannel,
    searchChannels
  };
};