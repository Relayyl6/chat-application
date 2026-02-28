"use client"

import { usePersistentState } from '@/hooks/usePersistentState';
import { initialPeople, normalizePeople } from '@/utils/names';
import React, { createContext, useState, useContext, useEffect } from 'react'
import { SocketProvider, useSocketContext } from './SocketContext';
import { api } from '@/lib/api';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Inner provider — sits inside SocketProvider so it can consume socket context
const AppContextInner = ({ children }: { children: React.ReactNode }) => {
  const [messagesByChat, setMessagesByChat] = usePersistentState<Record<string, MessageProps[]>>("messagesByChat", {});
  const [aiChatMessage, setAiChatMessage] = useState<boolean>(false);
  const [people, setPeople] = usePersistentState<PeopleState>('people', normalizePeople(initialPeople));

  // --- Channel state ---
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const { onNewMessage } = useSocketContext();

  // Load channels on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return; // Not logged in yet — skip silently

    const loadChannels = async () => {
      setChannelsLoading(true);
      try {
        const data = await api.getChannels();
        setChannels(data);
      } catch (error) {
        console.error('Failed to load channels:', error);
      } finally {
        setChannelsLoading(false);
      }
    };

    loadChannels();
  }, []);

  // Keep channel lastMessage preview in sync with incoming socket messages
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
                  autoId: message.autoId,
                },
              }
            : channel
        )
      );
    });

    return unsubscribe;
  }, [onNewMessage]);

  return (
    <AppContext.Provider value={{
      messagesByChat,
      setMessagesByChat,
      aiChatMessage,
      setAiChatMessage,
      people,
      setPeople,
      channels,
      setChannels,
      channelsLoading,
      activeChannelId,
      setActiveChannelId,
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Outer provider — wraps SocketProvider so the inner can safely use useSocketContext
export const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SocketProvider>
      <AppContextInner>
        {children}
      </AppContextInner>
    </SocketProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a ContextProvider');
  }
  return context;
};

export default ContextProvider;