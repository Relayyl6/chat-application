"use client"

import React, { createContext, useState, useContext, useEffect } from 'react'

// Define the shape of your context
interface AppContextType {
  messagesByChat: Record<string, MessageProps[]>;
  setMessagesByChat: React.Dispatch<React.SetStateAction<Record<string, MessageProps[]>>>;
}

// Create context with undefined as default
export const AppContext = createContext<AppContextType | undefined>(undefined);

export const ContextProvider = ({
    children
}: {
    children: React.ReactNode
}) => {
    // Use lazy initialization to load from localStorage
    const [messagesByChat, setMessagesByChat] = useState<Record<string, MessageProps[]>>(() => {
      // Only access localStorage on client side
      if (typeof window === 'undefined') return {};
      
      try {
        const stored = localStorage.getItem("messagesByChat");
        return stored ? JSON.parse(stored) : {};
      } catch (error) {
        console.error("Failed to parse stored messages:", error);
        return {};
      }
    });

    // Save to localStorage whenever messagesByChat changes
    useEffect(() => {
      try {
        localStorage.setItem("messagesByChat", JSON.stringify(messagesByChat));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
      }
    }, [messagesByChat]);

    return (
      <AppContext.Provider value={{
          messagesByChat,
          setMessagesByChat
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