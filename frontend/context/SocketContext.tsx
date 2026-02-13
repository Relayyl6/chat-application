'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: { channelId: string; userId: string; isTyping: boolean }) => void) => () => void;
  onUserStatus: (callback: (data: { userId: string; status: string }) => void) => () => void;
  onMembersAdded: (callback: (data: any) => void) => () => void;
  onMemberRemoved: (callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect socket on mount
    const token = localStorage.getItem('token');
    if (token) {
      const newSocket = connectSocket(token);
      setSocket(newSocket);

      newSocket.on('connect', () => setIsConnected(true));
      newSocket.on('disconnect', () => setIsConnected(false));
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  const onNewMessage = (callback: (message: Message) => void) => {
    if (!socket) return () => {};
    
    socket.on('message:new', callback);
    return () => {
      socket.off('message:new', callback);
    };
  };

  const onTyping = (callback: (data: { channelId: string; userId: string; isTyping: boolean }) => void) => {
    if (!socket) return () => {};
    
    socket.on('user:typing', callback);
    return () => {
      socket.off('user:typing', callback);
    };
  };

  const onUserStatus = (callback: (data: { userId: string; status: string }) => void) => {
    if (!socket) return () => {};
    
    socket.on('user:status', callback);
    return () => {
      socket.off('user:status', callback);
    };
  };

  const onMembersAdded = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    
    socket.on('channel:members:added', callback);
    return () => {
      socket.off('channel:members:added', callback);
    };
  };

  const onMemberRemoved = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    
    socket.on('channel:member:removed', callback);
    return () => {
      socket.off('channel:member:removed', callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onNewMessage,
        onTyping,
        onUserStatus,
        onMembersAdded,
        onMemberRemoved
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};