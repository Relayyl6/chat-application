// @ts-nocheck
import { getSocket } from './socket.js';

// Global event handlers storage
const eventHandlers = {
  onNewMessage: [],
  onTyping: [],
  onUserStatus: [],
  onMembersAdded: [],
  onMemberRemoved: [],
  onChannelAdded: [],
  onChannelRemoved: []
};

// Setup all socket event listeners
export const setupSocketListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  // ===== MESSAGE EVENTS =====
  
  socket.on('message:new', (message: any) => {
    console.log('📩 New message:', message);
    
    // Call all registered handlers
    eventHandlers.onNewMessage.forEach(handler => handler(message));
  });

  socket.on('message:sent', ({ tempId, message }: ) => {
    console.log('✅ Message sent confirmation:', tempId);
    
    // Update the optimistic message with real data
    window.dispatchEvent(new CustomEvent('message-sent', { 
      detail: { tempId, message } 
    }));
  });

  // ===== TYPING EVENTS =====
  
  socket.on('user:typing', (data) => {
    console.log('⌨️ User typing:', data);
    eventHandlers.onTyping.forEach(handler => handler(data));
  });

  // ===== USER STATUS EVENTS =====
  
  socket.on('user:status', (data) => {
    console.log('👤 User status changed:', data);
    eventHandlers.onUserStatus.forEach(handler => handler(data));
  });

  // ===== CHANNEL MEMBER EVENTS =====
  
  socket.on('channel:members:added', (data) => {
    console.log('➕ Members added:', data);
    eventHandlers.onMembersAdded.forEach(handler => handler(data));
  });

  socket.on('channel:member:removed', (data) => {
    console.log('➖ Member removed:', data);
    eventHandlers.onMemberRemoved.forEach(handler => handler(data));
  });

  socket.on('channel:added', (data) => {
    console.log('🆕 You were added to channel:', data);
    eventHandlers.onChannelAdded.forEach(handler => handler(data));
  });

  socket.on('channel:removed', (data) => {
    console.log('🗑️ You were removed from channel:', data);
    eventHandlers.onChannelRemoved.forEach(handler => handler(data));
  });

  // ===== ERROR EVENTS =====
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
    alert(error.message || 'An error occurred');
  });
};


// Register event handlers
export const onNewMessage = (handler) => {
  eventHandlers.onNewMessage.push(handler);
  // Return cleanup function
  return () => {
    eventHandlers.onNewMessage = eventHandlers.onNewMessage.filter(h => h !== handler);
  };
};

export const onTyping = (handler) => {
  eventHandlers.onTyping.push(handler);
  return () => {
    eventHandlers.onTyping = eventHandlers.onTyping.filter(h => h !== handler);
  };
};

export const onUserStatus = (handler) => {
  eventHandlers.onUserStatus.push(handler);
  return () => {
    eventHandlers.onUserStatus = eventHandlers.onUserStatus.filter(h => h !== handler);
  };
};

export const onMembersAdded = (handler) => {
  eventHandlers.onMembersAdded.push(handler);
  return () => {
    eventHandlers.onMembersAdded = eventHandlers.onMembersAdded.filter(h => h !== handler);
  };
};

export const onMemberRemoved = (handler) => {
  eventHandlers.onMemberRemoved.push(handler);
  return () => {
    eventHandlers.onMemberRemoved = eventHandlers.onMemberRemoved.filter(h => h !== handler);
  };
};

export const onChannelAdded = (handler) => {
  eventHandlers.onChannelAdded.push(handler);
  return () => {
    eventHandlers.onChannelAdded = eventHandlers.onChannelAdded.filter(h => h !== handler);
  };
};

export const onChannelRemoved = (handler) => {
  eventHandlers.onChannelRemoved.push(handler);
  return () => {
    eventHandlers.onChannelRemoved = eventHandlers.onChannelRemoved.filter(h => h !== handler);
  };
};