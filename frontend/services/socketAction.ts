//@ts-nocheck
import { getSocket } from './socket.ts';

// Send a message
export const sendMessage = (channelId, content, replyTo = null) => {
  const socket = getSocket();
  if (!socket) {
    console.error('Socket not connected');
    return null;
  }

  const tempId = Date.now(); // Temporary ID for optimistic updates

  socket.emit('message:send', {
    channelId,
    content,
    type: 'text',
    replyTo,
    tempId
  });

  return tempId; // Return for optimistic UI update
};

// Send typing indicator
let typingTimeout = null;

export const sendTypingStart = (channelId) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('message:typing', {
    channelId,
    isTyping: true
  });

  // Auto-stop typing after 3 seconds
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    sendTypingStop(channelId);
  }, 3000);
};

export const sendTypingStop = (channelId) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('message:typing', {
    channelId,
    isTyping: false
  });

  clearTimeout(typingTimeout);
};

// Join a channel room
export const joinChannel = (channelId) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('channel:join', {
    channelId
  });
};

// Leave a channel room
export const leaveChannel = (channelId) => {
  const socket = getSocket();
  if (!socket) return;

  socket.emit('channel:leave', {
    channelId
  });
};