'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onChannelCreated: (callback: (data: any) => void) => () => void;
  onChannelRenamed: (callback: (data: any) => void) => () => void;
  onChannelMembersAdded: (callback: (data: any) => void) => () => void;
  onChannelMemberRemoved: (callback: (data: any) => void) => () => void;
  onChannelMemberLeft: (callback: (data: any) => void) => () => void;
  onChannelMemberRoleUpdated: (callback: (data: any) => void) => () => void;
  onMessageSent: (callback: (data: any) => void) => () => void;
  onMessageEdited: (callback: (data: any) => void) => () => void;
  onMessageDeleted: (callback: (data: any) => void) => () => void;
  onMessageReactionAdded: (callback: (data: any) => void) => () => void;
  onMessagesRead: (callback: (data: any) => void) => () => void;
  onUserStatus: (callback: (data: any) => void) => () => void;
  onUserOnline: (callback: (data: any) => void) => () => void;
  onUserOffline: (callback: (data: any) => void) => () => void;
  onTyping: (callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocketContext must be used within SocketProvider');
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Try token on mount (page refresh case)
    const token = localStorage.getItem('token');
    if (token) {
      const s = connectSocket(token);
      setSocket(s);
      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));
    }

    // Also listen for login events that happen after mount
    const handleLogin = (e: CustomEvent) => {
      const s = connectSocket(e.detail.token);
      setSocket(s);
      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));
    };

    const handleLogout = () => {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
    };

    window.addEventListener('app:login', handleLogin as EventListener);
    window.addEventListener('app:logout', handleLogout);

    return () => {
      window.removeEventListener('app:login', handleLogin as EventListener);
      window.removeEventListener('app:logout', handleLogout);
      disconnectSocket();
    };
  }, []);

  // useCallback so consumers re-subscribe when socket changes
  const onChannelCreated = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:created', cb);
    return () => socket.off('channel:created', cb);
  }, [socket]);

  const onChannelRenamed = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:renamed', cb);
    return () => socket.off('channel:renamed', cb);
  }, [socket]);

  const onChannelMembersAdded = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:members-added', cb);
    return () => socket.off('channel:members-added', cb);
  }, [socket]);

  const onChannelMemberRemoved = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-removed', cb);
    return () => socket.off('channel:member-removed', cb);
  }, [socket]);

  const onChannelMemberLeft = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-left', cb);
    return () => socket.off('channel:member-left', cb);
  }, [socket]);

  const onChannelMemberRoleUpdated = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('channel:member-role-updated', cb);
    return () => socket.off('channel:member-role-updated', cb);
  }, [socket]);

  const onMessageSent = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:sent', cb);
    return () => socket.off('message:sent', cb);
  }, [socket]);

  const onMessageEdited = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:edited', cb);
    return () => socket.off('message:edited', cb);
  }, [socket]);

  const onMessageDeleted = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:deleted', cb);
    return () => socket.off('message:deleted', cb);
  }, [socket]);

  const onMessageReactionAdded = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('message:reaction-added', cb);
    return () => socket.off('message:reaction-added', cb);
  }, [socket]);

  const onMessagesRead = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('messages:read', cb);
    return () => socket.off('messages:read', cb);
  }, [socket]);

  const onUserStatus = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:status', cb);
    return () => socket.off('user:status', cb);
  }, [socket]);

  const onUserOnline = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:online', cb);
    return () => socket.off('user:online', cb);
  }, [socket]);

  const onUserOffline = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:offline', cb);
    return () => socket.off('user:offline', cb);
  }, [socket]);

  const onTyping = useCallback((cb: (data: any) => void) => {
    if (!socket) return () => {};
    socket.on('user:typing', cb);
    return () => socket.off('user:typing', cb);
  }, [socket]);

  return (
    <SocketContext.Provider value={{
      socket, isConnected,
      onChannelCreated, onChannelRenamed, onChannelMembersAdded,
      onChannelMemberRemoved, onChannelMemberLeft, onChannelMemberRoleUpdated,
      onMessageSent, onMessageEdited, onMessageDeleted,
      onMessageReactionAdded, onMessagesRead,
      onUserStatus, onUserOnline, onUserOffline, onTyping,
    }}>
      {children}
    </SocketContext.Provider>
  );
};