"use client"

import { usePersistentState } from '@/hooks/usePersistentState';
import { initialPeople, normalizePeople } from '@/utils/names';
import React, { createContext, useState, useContext } from 'react'

// Create context with undefined as default
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const ContextProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    // Use lazy initialization to load from localStorage
    const [messagesByChat, setMessagesByChat] = usePersistentState<Record<string, MessageProps[]>>("messagesByChat", {});

    const [ aiChatMessage, setAiChatMessage ] = useState<boolean>(false); // would eventualy be in the contextapi to indicate whether its an AI chat

    const [people, setPeople] = usePersistentState<PeopleState>('people', normalizePeople(initialPeople))

    return (
      <AppContext.Provider value={{
          messagesByChat,
          setMessagesByChat,
          aiChatMessage,
          setAiChatMessage,
          people,
          setPeople
      }}>
          {children}
      </AppContext.Provider>
    )
}

// Custom hook for using the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within a ContextProvider');
  }
  return context;
}

export default ContextProvider