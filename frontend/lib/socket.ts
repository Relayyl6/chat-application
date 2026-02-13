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
  }
};