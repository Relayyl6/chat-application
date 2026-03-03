'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  // Channel Events
  onChannelCreated: (callback: (data: any) => void) => () => void;
  onChannelRenamed: (callback: (data: any) => void) => () => void;
  onChannelMembersAdded: (callback: (data: any) => void) => () => void;
  onChannelMemberRemoved: (callback: (data: any) => void) => () => void;
  onChannelMemberLeft: (callback: (data: any) => void) => () => void;
  onChannelMemberRoleUpdated: (callback: (data: any) => void) => () => void;
  // Message Events
  onMessageSent: (callback: (data: any) => void) => () => void;
  onMessageEdited: (callback: (data: any) => void) => () => void;
  onMessageDeleted: (callback: (data: any) => void) => () => void;
  onMessageReactionAdded: (callback: (data: any) => void) => () => void;
  onMessagesRead: (callback: (data: any) => void) => () => void;
  // User Events
  onUserStatus: (callback: (data: any) => void) => () => void;
  onUserOnline: (callback: (data: any) => void) => () => void;
  onUserOffline: (callback: (data: any) => void) => () => void;
  // Typing
  onTyping: (callback: (data: any) => void) => () => void;
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

  // Channel Events
  const onChannelCreated = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:created', callback);
    return () => socket.off('channel:created', callback);
  };

  const onChannelRenamed = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:renamed', callback);
    return () => socket.off('channel:renamed', callback);
  };

  const onChannelMembersAdded = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:members-added', callback);
    return () => socket.off('channel:members-added', callback);
  };

  const onChannelMemberRemoved = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-removed', callback);
    return () => socket.off('channel:member-removed', callback);
  };

  const onChannelMemberLeft = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-left', callback);
    return () => socket.off('channel:member-left', callback);
  };

  const onChannelMemberRoleUpdated = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-role-updated', callback);
    return () => socket.off('channel:member-role-updated', callback);
  };

  // Message Events
  const onMessageSent = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:sent', callback);
    return () => socket.off('message:sent', callback);
  };

  const onMessageEdited = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:edited', callback);
    return () => socket.off('message:edited', callback);
  };

  const onMessageDeleted = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:deleted', callback);
    return () => socket.off('message:deleted', callback);
  };

  const onMessageReactionAdded = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:reaction-added', callback);
    return () => socket.off('message:reaction-added', callback);
  };

  const onMessagesRead = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('messages:read', callback);
    return () => socket.off('messages:read', callback);
  };

  // User Events
  const onUserStatus = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:status', callback);
    return () => socket.off('user:status', callback);
  };

  const onUserOnline = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:online', callback);
    return () => socket.off('user:online', callback);
  };

  const onUserOffline = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:offline', callback);
    return () => socket.off('user:offline', callback);
  };

  // Typing Events
  const onTyping = (callback: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:typing', callback);
    return () => socket.off('user:typing', callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onChannelCreated,
        onChannelRenamed,
        onChannelMembersAdded,
        onChannelMemberRemoved,
        onChannelMemberLeft,
        onChannelMemberRoleUpdated,
        onMessageSent,
        onMessageEdited,
        onMessageDeleted,
        onMessageReactionAdded,
        onMessagesRead,
        onUserStatus,
        onUserOnline,
        onUserOffline,
        onTyping
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};