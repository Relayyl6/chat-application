"use client"

import { usePersistentState } from '@/hooks/usePersistentState';
import { initialPeople, normalizePeople } from '@/utils/names';
import React, { createContext, useState, useContext, useEffect } from 'react'
import { SocketProvider } from './SocketContext';
import { api } from '@/lib/api';
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

  const { channels, loading: channelsLoading } = useChannels();
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  // On mount: load token/user from localStorage, redirect to /log-in if missing
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      window.dispatchEvent(new CustomEvent('app:login', { detail: { token: savedToken } }));
    } else {
      router.push('/sign-up');
    }
  }, []);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
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
      setChannels: () => {},
      channelsLoading,
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