import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  socket.on('connect', () => {
    console.log('✅ Connected to server');
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
    if (error.message.includes('Authentication')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket Event Listeners (set up listeners in your components)
export const socketEvents = {
  // Channel Events
  onChannelCreated: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:created', callback);
  },
  onChannelRenamed: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:renamed', callback);
  },
  onChannelMembersAdded: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:members-added', callback);
  },
  onChannelMemberRemoved: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:member-removed', callback);
  },
  onChannelMemberLeft: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:member-left', callback);
  },
  onChannelMemberRoleUpdated: (callback: (data: any) => void) => {
    if (socket) socket.on('channel:member-role-updated', callback);
  },

  // Message Events
  onMessageSent: (callback: (data: any) => void) => {
    if (socket) socket.on('message:sent', callback);
  },
  onMessageEdited: (callback: (data: any) => void) => {
    if (socket) socket.on('message:edited', callback);
  },
  onMessageDeleted: (callback: (data: any) => void) => {
    if (socket) socket.on('message:deleted', callback);
  },
  onMessageReactionAdded: (callback: (data: any) => void) => {
    if (socket) socket.on('message:reaction-added', callback);
  },
  onMessagesRead: (callback: (data: any) => void) => {
    if (socket) socket.on('messages:read', callback);
  },

  // User Events
  onUserStatus: (callback: (data: any) => void) => {
    if (socket) socket.on('user:status', callback);
  },
  onUserOnline: (callback: (data: any) => void) => {
    if (socket) socket.on('user:online', callback);
  },
  onUserOffline: (callback: (data: any) => void) => {
    if (socket) socket.on('user:offline', callback);
  }
};

// Socket actions
export const socketActions = {
  sendMessage(channelId: string, content: string, replyTo?: string) {
    if (!socket) return null;
    
    const tempId = Date.now();
    socket.emit('message:send', {
      channelId,
      content,
      type: 'text',
      replyTo,
      tempId
    });
    
    return tempId;
  },

  sendTypingStart(channelId: string) {
    socket?.emit('message:typing', { channelId, isTyping: true });
  },

  sendTypingStop(channelId: string) {
    socket?.emit('message:typing', { channelId, isTyping: false });
  },

  joinChannel(channelId: string) {
    socket?.emit('channel:join', { channelId });
  },

  leaveChannel(channelId: string) {
    socket?.emit('channel:leave', { channelId });
  },

  // New socket actions based on backend broadcasts
  editMessage(channelId: string, messageId: string, content: string) {
    socket?.emit('message:edit', { channelId, messageId, content });
  },

  deleteMessage(channelId: string, messageId: string) {
    socket?.emit('message:delete', { channelId, messageId });
  },

  reactToMessage(channelId: string, messageId: string, emoji: string) {
    socket?.emit('message:react', { channelId, messageId, emoji });
  },

  renameChannel(channelId: string, name: string) {
    socket?.emit('channel:rename', { channelId, name });
  },

  addMembers(channelId: string, userIds: string[]) {
    socket?.emit('channel:add-members', { channelId, userIds });
  },

  removeMember(channelId: string, memberId: string) {
    socket?.emit('channel:remove-member', { channelId, memberId });
  },

  updateMemberRole(channelId: string, memberId: string, role: string) {
    socket?.emit('channel:update-role', { channelId, memberId, role });
  },

  changeStatus(status: 'online' | 'offline' | 'away') {
    socket?.emit('user:status-change', { status });
  }
};