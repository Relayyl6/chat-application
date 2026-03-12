import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  // NEXT_PUBLIC_API_URL must be your backend URL e.g. https://your-api.onrender.com
  // NOT the Next.js frontend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!backendUrl) {
    console.error('[Socket] NEXT_PUBLIC_API_URL is not set — socket will not connect');
  }

  socket = io(backendUrl || 'https://chat-app-backend-5rha.onrender.com', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    withCredentials: true,
    // Required for Render/Railway — they use long-polling before upgrading to websocket
    transports: ['polling', 'websocket'],
  });

  socket.on('connect', () => console.log('✅ Socket connected:', socket?.id));
  socket.on('disconnect', (reason) => console.log('❌ Socket disconnected:', reason));
  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error.message);
    if (error.message.includes('Authentication')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

export const socketEvents = {
  onChannelCreated: (cb: (data: any) => void) => { socket?.on('channel:created', cb) },
  onChannelRenamed: (cb: (data: any) => void) => { socket?.on('channel:renamed', cb) },
  onChannelMembersAdded: (cb: (data: any) => void) => { socket?.on('channel:members-added', cb) },
  onChannelMemberRemoved: (cb: (data: any) => void) => { socket?.on('channel:member-removed', cb) },
  onChannelMemberLeft: (cb: (data: any) => void) => { socket?.on('channel:member-left', cb) },
  onChannelMemberRoleUpdated: (cb: (data: any) => void) => { socket?.on('channel:member-role-updated', cb) },
  onMessageSent: (cb: (data: any) => void) => { socket?.on('message:sent', cb) },
  onMessageEdited: (cb: (data: any) => void) => { socket?.on('message:edited', cb) },
  onMessageDeleted: (cb: (data: any) => void) => { socket?.on('message:deleted', cb) },
  onMessageReactionAdded: (cb: (data: any) => void) => { socket?.on('message:reaction-added', cb) },
  onMessagesRead: (cb: (data: any) => void) => { socket?.on('messages:read', cb) },
  onUserStatus: (cb: (data: any) => void) => { socket?.on('user:status', cb) },
  onUserOnline: (cb: (data: any) => void) => { socket?.on('user:online', cb) },
  onUserOffline: (cb: (data: any) => void) => { socket?.on('user:offline', cb) },
  onTyping: (cb: (data: any) => void) => { socket?.on('user:typing', cb) },
};

export const socketActions = {
  sendMessage(channelId: string, content: string, attachments?: any[], replyTo?: string) {
    if (!socket?.connected) {
      console.warn('[Socket] Cannot send message — not connected');
      return null;
    }
    const tempId = Date.now();
    socket.emit('message:send', {
      channelId, content,
      type: attachments?.length ? 'file' : 'text',
      attachments: attachments || [],
      replyTo, tempId
    });
    return tempId;
  },
  sendTypingStart: (channelId: string) => socket?.emit('message:typing', { channelId, isTyping: true }),
  sendTypingStop: (channelId: string) => socket?.emit('message:typing', { channelId, isTyping: false }),
  joinChannel: (channelId: string) => socket?.emit('channel:join', { channelId }),
  leaveChannel: (channelId: string) => socket?.emit('channel:leave', { channelId }),
  editMessage: (channelId: string, messageId: string, content: string) =>
    socket?.emit('message:edit', { channelId, messageId, content }),
  deleteMessage: (channelId: string, messageId: string) =>
    socket?.emit('message:delete', { channelId, messageId }),
  reactToMessage: (channelId: string, messageId: string, emoji: string) =>
    socket?.emit('message:react', { channelId, messageId, emoji }),
  renameChannel: (channelId: string, name: string) =>
    socket?.emit('channel:rename', { channelId, name }),
  addMembers: (channelId: string, userIds: string[]) =>
    socket?.emit('channel:add-members', { channelId, userIds }),
  removeMember: (channelId: string, memberId: string) =>
    socket?.emit('channel:remove-member', { channelId, memberId }),
  updateMemberRole: (channelId: string, memberId: string, role: string) =>
    socket?.emit('channel:update-role', { channelId, memberId, role }),
  changeStatus: (status: 'online' | 'offline' | 'away') =>
    socket?.emit('user:status-change', { status }),
};