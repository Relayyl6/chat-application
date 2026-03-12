"use client"

import { usePersistentState } from '@/hooks/usePersistentState';
import { initialPeople, normalizePeople } from '@/utils/names';
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import { SocketProvider } from './SocketContext';  // named export, not default
import { useChannels } from '@/hooks/useChannels';
import { useRouter } from 'next/navigation';

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextInner = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [messagesByChat, setMessagesByChat] = usePersistentState<Record<string, MessageProps[]>>("messagesByChat", {});
  const [aiChatMessage, setAiChatMessage] = useState<boolean>(false);
  const [people, setPeople] = usePersistentState<PeopleState>('people', normalizePeople(initialPeople));
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const { channels, channelsLoading, loadChannels, createChannel, renameChannel, searchChannels } = useChannels();

  const dmChannels = useMemo(() => channels.filter(c => c.type === 'direct'), [channels]);
  const groupChannels = useMemo(() => channels.filter(c => c.type !== 'direct'), [channels]);

  // On mount: load token/user from localStorage, redirect to LOGIN if missing
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        window.dispatchEvent(new CustomEvent('app:login', { detail: { token: savedToken } }));
      } catch {
        // Corrupt user data — clear and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/log-in');
      }
    } else {
      router.push('/log-in');  // was '/sign-up' — fixed
    }
  }, []);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    window.dispatchEvent(new CustomEvent('app:login', { detail: { token: newToken } }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.dispatchEvent(new CustomEvent('app:logout'));
    router.push('/log-in');
  };

  return (
    <AppContext.Provider value={{
      messagesByChat,
      setMessagesByChat,
      aiChatMessage,
      setAiChatMessage,
      people,
      setPeople,
      channels,
      dmChannels,
      groupChannels,
      channelsLoading,
      loadChannels,
      createChannel,
      renameChannel,
      searchChannels,
      activeChannelId,
      setActiveChannelId,
      token,
      user,
      login,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

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