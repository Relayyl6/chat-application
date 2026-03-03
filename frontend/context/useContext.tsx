"use client"

import { usePersistentState } from '@/hooks/usePersistentState';
import { initialPeople, normalizePeople } from '@/utils/names';
import React, { createContext, useState, useContext, useEffect } from 'react'
import { SocketProvider, useSocketContext } from './SocketContext';
import { api } from '@/lib/api';
import { useChannels } from '@/hooks/useChannels';

export const AppContext = createContext<AppContextType | undefined>(undefined);

// Inner provider — sits inside SocketProvider so it can consume socket context
const AppContextInner = ({ children }: { children: React.ReactNode }) => {
  const [messagesByChat, setMessagesByChat] = usePersistentState<Record<string, MessageProps[]>>("messagesByChat", {});
  const [aiChatMessage, setAiChatMessage] = useState<boolean>(false);
  const [people, setPeople] = usePersistentState<PeopleState>('people', normalizePeople(initialPeople));

  // --- Channel state using the hook ---
  const { channels, loading: channelsLoading } = useChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  return (
    <AppContext.Provider value={{
      messagesByChat,
      setMessagesByChat,
      aiChatMessage,
      setAiChatMessage,
      people,
      setPeople,
      channels,
      setChannels: () => {}, // No-op since useChannels manages its own state
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