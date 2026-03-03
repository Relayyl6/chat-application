// @ts-nocheck
import { getSocket } from './socket.js';

// Global event handlers storage
const eventHandlers = {
  onMessageSent: [],
  onMessageEdited: [],
  onMessageDeleted: [],
  onMessageReactionAdded: [],
  onMessagesRead: [],
  onTyping: [],
  onUserStatus: [],
  onUserOnline: [],
  onUserOffline: [],
  onChannelCreated: [],
  onChannelRenamed: [],
  onChannelMembersAdded: [],
  onChannelMemberRemoved: [],
  onChannelMemberLeft: [],
  onChannelMemberRoleUpdated: []
};

// Setup all socket event listeners
export const setupSocketListeners = () => {
  const socket = getSocket();
  if (!socket) return;

  // ===== MESSAGE EVENTS =====
  
  socket.on('message:sent', (message: any) => {
    console.log('📩 New message:', message);
    eventHandlers.onMessageSent.forEach(handler => handler(message));
  });

  socket.on('message:edited', (data: any) => {
    console.log('✏️ Message edited:', data);
    eventHandlers.onMessageEdited.forEach(handler => handler(data));
  });

  socket.on('message:deleted', (data: any) => {
    console.log('🗑️ Message deleted:', data);
    eventHandlers.onMessageDeleted.forEach(handler => handler(data));
  });

  socket.on('message:reaction-added', (data: any) => {
    console.log('👍 Reaction added:', data);
    eventHandlers.onMessageReactionAdded.forEach(handler => handler(data));
  });

  socket.on('messages:read', (data: any) => {
    console.log('✅ Messages read:', data);
    eventHandlers.onMessagesRead.forEach(handler => handler(data));
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

  socket.on('user:online', (data) => {
    console.log('🟢 User online:', data);
    eventHandlers.onUserOnline.forEach(handler => handler(data));
  });

  socket.on('user:offline', (data) => {
    console.log('⚫ User offline:', data);
    eventHandlers.onUserOffline.forEach(handler => handler(data));
  });

  // ===== CHANNEL EVENTS =====
  
  socket.on('channel:created', (data) => {
    console.log('🆕 Channel created:', data);
    eventHandlers.onChannelCreated.forEach(handler => handler(data));
  });

  socket.on('channel:renamed', (data) => {
    console.log('📝 Channel renamed:', data);
    eventHandlers.onChannelRenamed.forEach(handler => handler(data));
  });

  socket.on('channel:members-added', (data) => {
    console.log('➕ Members added:', data);
    eventHandlers.onChannelMembersAdded.forEach(handler => handler(data));
  });

  socket.on('channel:member-removed', (data) => {
    console.log('➖ Member removed:', data);
    eventHandlers.onChannelMemberRemoved.forEach(handler => handler(data));
  });

  socket.on('channel:member-left', (data) => {
    console.log('👋 Member left:', data);
    eventHandlers.onChannelMemberLeft.forEach(handler => handler(data));
  });

  socket.on('channel:member-role-updated', (data) => {
    console.log('⚙️ Member role updated:', data);
    eventHandlers.onChannelMemberRoleUpdated.forEach(handler => handler(data));
  });

  // ===== ERROR EVENTS =====
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
    alert(error.message || 'An error occurred');
  });
};


// Register event handlers - New API
export const onMessageSent = (handler) => {
  eventHandlers.onMessageSent.push(handler);
  return () => {
    eventHandlers.onMessageSent = eventHandlers.onMessageSent.filter(h => h !== handler);
  };
};

export const onMessageEdited = (handler) => {
  eventHandlers.onMessageEdited.push(handler);
  return () => {
    eventHandlers.onMessageEdited = eventHandlers.onMessageEdited.filter(h => h !== handler);
  };
};

export const onMessageDeleted = (handler) => {
  eventHandlers.onMessageDeleted.push(handler);
  return () => {
    eventHandlers.onMessageDeleted = eventHandlers.onMessageDeleted.filter(h => h !== handler);
  };
};

export const onMessageReactionAdded = (handler) => {
  eventHandlers.onMessageReactionAdded.push(handler);
  return () => {
    eventHandlers.onMessageReactionAdded = eventHandlers.onMessageReactionAdded.filter(h => h !== handler);
  };
};

export const onMessagesRead = (handler) => {
  eventHandlers.onMessagesRead.push(handler);
  return () => {
    eventHandlers.onMessagesRead = eventHandlers.onMessagesRead.filter(h => h !== handler);
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

export const onUserOnline = (handler) => {
  eventHandlers.onUserOnline.push(handler);
  return () => {
    eventHandlers.onUserOnline = eventHandlers.onUserOnline.filter(h => h !== handler);
  };
};

export const onUserOffline = (handler) => {
  eventHandlers.onUserOffline.push(handler);
  return () => {
    eventHandlers.onUserOffline = eventHandlers.onUserOffline.filter(h => h !== handler);
  };
};

export const onChannelCreated = (handler) => {
  eventHandlers.onChannelCreated.push(handler);
  return () => {
    eventHandlers.onChannelCreated = eventHandlers.onChannelCreated.filter(h => h !== handler);
  };
};

export const onChannelRenamed = (handler) => {
  eventHandlers.onChannelRenamed.push(handler);
  return () => {
    eventHandlers.onChannelRenamed = eventHandlers.onChannelRenamed.filter(h => h !== handler);
  };
};

export const onChannelMembersAdded = (handler) => {
  eventHandlers.onChannelMembersAdded.push(handler);
  return () => {
    eventHandlers.onChannelMembersAdded = eventHandlers.onChannelMembersAdded.filter(h => h !== handler);
  };
};

export const onChannelMemberRemoved = (handler) => {
  eventHandlers.onChannelMemberRemoved.push(handler);
  return () => {
    eventHandlers.onChannelMemberRemoved = eventHandlers.onChannelMemberRemoved.filter(h => h !== handler);
  };
};

export const onChannelMemberLeft = (handler) => {
  eventHandlers.onChannelMemberLeft.push(handler);
  return () => {
    eventHandlers.onChannelMemberLeft = eventHandlers.onChannelMemberLeft.filter(h => h !== handler);
  };
};

export const onChannelMemberRoleUpdated = (handler) => {
  eventHandlers.onChannelMemberRoleUpdated.push(handler);
  return () => {
    eventHandlers.onChannelMemberRoleUpdated = eventHandlers.onChannelMemberRoleUpdated.filter(h => h !== handler);
  };
};