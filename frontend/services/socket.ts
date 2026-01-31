import { io } from 'socket.io-client';

let socket: any = null;
let isConnected: boolean = false;

// Initialize socket connection
export const connectSocket = (token: string) => {
  if (socket) {
    console.log('Socket already connected');
    return socket;
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
    transports: ["websocket"]
  });

  // Connection events
  socket.on('connect', () => {
    console.log('✅ Connected to server');
    isConnected = true;
  });

  socket.on('disconnect', (reason: any) => {
    console.log('❌ Disconnected:', reason);
    isConnected = false;
  });

  socket.on('connect_error', (error: any) => {
    console.error('Connection error:', error.message);
    
    // If token expired, redirect to login
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      localStorage.clear();
      window.location.href = '/login';
    }
  });

  return socket;
};

// Get the socket instance
export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call connectSocket() first');
  }
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    isConnected = false;
  }
};

// Check if socket is connected
export const isSocketConnected = () => {
  return isConnected && socket?.connected;
};