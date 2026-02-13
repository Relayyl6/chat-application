# Complete API Routes & Socket.IO Events Reference

## Table of Contents
1. [REST API Routes](#rest-api-routes)
2. [Socket.IO Events](#socketio-events)
3. [Data Flow Examples](#data-flow-examples)
4. [Error Handling](#error-handling)

---

# REST API ROUTES

## 1. AUTHENTICATION ROUTES

### POST `/api/auth/register`
**Purpose**: Create a new user account

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "username": "johndoe",        // 3-30 characters, unique
  "email": "john@example.com",  // valid email, unique
  "password": "password123"     // minimum 6 characters
}
```

**Success Response** (201):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "status": "offline"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- **400**: Validation error or user already exists
```json
{
  "error": "User already exists"
}
```

**Frontend Usage**:
```typescript
const register = async (username: string, email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Store token in localStorage/cookies
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

---

### POST `/api/auth/login`
**Purpose**: Authenticate existing user

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response** (200):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "status": "online"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- **401**: Invalid credentials
```json
{
  "error": "Invalid credentials"
}
```

**Frontend Usage**:
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Connect to Socket.IO after login
    connectSocket(data.token);
    
    return data;
  } else {
    throw new Error(data.error);
  }
};
```

---

## 2. CHANNEL ROUTES
**Note**: All channel routes require authentication. Include token in Authorization header.

### POST `/api/channels`
**Purpose**: Create a new channel (direct message or group chat)

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Request Body for Direct Message**:
```json
{
  "type": "direct",
  "userIds": ["507f1f77bcf86cd799439012"]  // One user ID for DM
}
```

**Request Body for Group Chat**:
```json
{
  "type": "group",
  "name": "Project Team",
  "userIds": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"],
  "description": "Discussion about the new project"  // Optional
}
```

**Success Response** (201):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Project Team",
  "type": "group",
  "avatar": null,
  "description": "Discussion about the new project",
  "users": [
    {
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": null,
        "status": "online"
      },
      "role": "admin",
      "joinedAt": "2025-01-26T10:30:00.000Z",
      "lastRead": 0,
      "unreadCount": 0
    },
    {
      "userId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "janedoe",
        "email": "jane@example.com",
        "avatar": "https://example.com/jane.jpg",
        "status": "online"
      },
      "role": "member",
      "joinedAt": "2025-01-26T10:30:00.000Z",
      "lastRead": 0,
      "unreadCount": 0
    }
  ],
  "messageAutoId": 0,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2025-01-26T10:30:00.000Z",
  "updatedAt": "2025-01-26T10:30:00.000Z"
}
```

**Error Responses**:
- **400**: Invalid data or direct message requires exactly one user
- **401**: Not authenticated

**Frontend Usage**:
```typescript
const createDirectMessage = async (recipientUserId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/channels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'direct',
      userIds: [recipientUserId]
    })
  });
  
  return await response.json();
};

const createGroupChat = async (name: string, userIds: string[], description?: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/channels', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      type: 'group',
      name,
      userIds,
      description
    })
  });
  
  return await response.json();
};
```

---

### GET `/api/channels`
**Purpose**: Get all channels the authenticated user is part of

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Query Parameters**: None

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "name": "Project Team",
    "type": "group",
    "avatar": null,
    "description": "Discussion about the new project",
    "users": [
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "avatar": null,
          "status": "online"
        },
        "role": "admin",
        "joinedAt": "2025-01-26T10:30:00.000Z",
        "lastRead": 5,
        "unreadCount": 3
      }
    ],
    "lastMessage": {
      "content": "Hey, how's the project going?",
      "senderId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "janedoe"
      },
      "sentAt": "2025-01-26T12:45:00.000Z",
      "autoId": 8
    },
    "messageAutoId": 8,
    "createdBy": "507f1f77bcf86cd799439011",
    "createdAt": "2025-01-26T10:30:00.000Z",
    "updatedAt": "2025-01-26T12:45:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "type": "direct",
    "users": [
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "johndoe",
          "avatar": null,
          "status": "online"
        },
        "role": "member",
        "lastRead": 10,
        "unreadCount": 0
      },
      {
        "userId": {
          "_id": "507f1f77bcf86cd799439013",
          "username": "bobsmith",
          "avatar": "https://example.com/bob.jpg",
          "status": "away"
        },
        "role": "member",
        "lastRead": 10,
        "unreadCount": 0
      }
    ],
    "lastMessage": {
      "content": "See you tomorrow!",
      "senderId": {
        "_id": "507f1f77bcf86cd799439013",
        "username": "bobsmith"
      },
      "sentAt": "2025-01-26T11:20:00.000Z",
      "autoId": 10
    },
    "messageAutoId": 10,
    "createdAt": "2025-01-25T09:00:00.000Z",
    "updatedAt": "2025-01-26T11:20:00.000Z"
  }
]
```

**Error Responses**:
- **401**: Not authenticated

**Frontend Usage**:
```typescript
const getChannels = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/api/channels', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const channels = await response.json();
  
  // Sort by last message time
  channels.sort((a, b) => {
    const timeA = a.lastMessage?.sentAt || a.updatedAt;
    const timeB = b.lastMessage?.sentAt || b.updatedAt;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });
  
  return channels;
};
```

---

### GET `/api/channels/:channelId`
**Purpose**: Get details of a specific channel

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**URL Parameters**:
- `channelId`: MongoDB ObjectId of the channel

**Success Response** (200):
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "name": "Project Team",
  "type": "group",
  "avatar": null,
  "description": "Discussion about the new project",
  "users": [
    {
      "userId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "john@example.com",
        "avatar": null,
        "status": "online"
      },
      "role": "admin",
      "joinedAt": "2025-01-26T10:30:00.000Z",
      "lastRead": 5,
      "unreadCount": 3
    }
  ],
  "messageAutoId": 8,
  "createdBy": "507f1f77bcf86cd799439011",
  "createdAt": "2025-01-26T10:30:00.000Z",
  "updatedAt": "2025-01-26T12:45:00.000Z"
}
```

**Error Responses**:
- **401**: Not authenticated
- **404**: Channel not found or user not a member

**Frontend Usage**:
```typescript
const getChannelDetails = async (channelId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/channels/${channelId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error('Channel not found');
  }
};
```

---

## 3. MESSAGE ROUTES

### GET `/api/messages/:channelId`
**Purpose**: Get message history for a channel (with pagination)

**Headers**:
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**URL Parameters**:
- `channelId`: MongoDB ObjectId of the channel

**Query Parameters**:
- `before` (optional): AutoId of message to fetch messages before (for pagination)
- `limit` (optional): Number of messages to fetch (default: 50, max: 100)

**Example URLs**:
- Initial load: `/api/messages/507f1f77bcf86cd799439014?limit=50`
- Load older: `/api/messages/507f1f77bcf86cd799439014?before=100&limit=50`

**Success Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439020",
    "channelId": "507f1f77bcf86cd799439014",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "avatar": null
    },
    "content": "Hello everyone!",
    "type": "text",
    "autoId": 1,
    "readBy": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "deliveredTo": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "replyTo": null,
    "attachments": [],
    "createdAt": "2025-01-26T10:35:00.000Z",
    "updatedAt": "2025-01-26T10:35:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439021",
    "channelId": "507f1f77bcf86cd799439014",
    "senderId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "janedoe",
      "avatar": "https://example.com/jane.jpg"
    },
    "content": "Hi John!",
    "type": "text",
    "autoId": 2,
    "readBy": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "deliveredTo": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    "replyTo": {
      "_id": "507f1f77bcf86cd799439020",
      "content": "Hello everyone!",
      "senderId": "507f1f77bcf86cd799439011",
      "autoId": 1
    },
    "attachments": [],
    "createdAt": "2025-01-26T10:36:00.000Z",
    "updatedAt": "2025-01-26T10:36:00.000Z"
  }
]
```

**Error Responses**:
- **401**: Not authenticated
- **500**: Server error

**Frontend Usage**:
```typescript
const getMessages = async (channelId: string, before?: number, limit = 50) => {
  const token = localStorage.getItem('token');
  
  let url = `http://localhost:3000/api/messages/${channelId}?limit=${limit}`;
  if (before) {
    url += `&before=${before}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Usage for infinite scroll
const loadMoreMessages = async (channelId: string, oldestMessageAutoId: number) => {
  const olderMessages = await getMessages(channelId, oldestMessageAutoId, 50);
  return olderMessages;
};
```

---

### POST `/api/messages/:channelId/read`
**Purpose**: Mark messages as read up to a specific message

**Headers**:
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**URL Parameters**:
- `channelId`: MongoDB ObjectId of the channel

**Request Body**:
```json
{
  "messageAutoId": 10  // AutoId of the last message read
}
```

**Success Response** (200):
```json
{
  "success": true
}
```

**Error Responses**:
- **401**: Not authenticated
- **500**: Server error

**Frontend Usage**:
```typescript
const markMessagesAsRead = async (channelId: string, lastMessageAutoId: number) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`http://localhost:3000/api/messages/${channelId}/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      messageAutoId: lastMessageAutoId
    })
  });
  
  return await response.json();
};

// Call this when user views a channel
const onChannelOpened = async (channelId: string, latestMessageAutoId: number) => {
  await markMessagesAsRead(channelId, latestMessageAutoId);
};
```

---

# SOCKET.IO EVENTS

## Connection Setup

**Frontend Connection**:
```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket;

const connectSocket = (token: string) => {
  socket = io('http://localhost:3000', {
    auth: {
      token: token
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });
  
  // Set up event listeners
  setupSocketListeners();
};

const setupSocketListeners = () => {
  socket.on('connect', () => {
    console.log('Connected to server');
  });
  
  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
  });
};
```

---

## Emitting Events (Frontend → Backend)

### 1. `message:send`
**Purpose**: Send a new message to a channel

**Emit From Frontend**:
```typescript
socket.emit('message:send', {
  channelId: '507f1f77bcf86cd799439014',
  content: 'Hello, how are you?',
  type: 'text',  // 'text' | 'image' | 'file' | 'system'
  replyTo: '507f1f77bcf86cd799439020',  // Optional: ObjectId of message being replied to
  tempId: Date.now()  // Temporary ID for optimistic UI updates
});
```

**What Backend Does**:
1. Validates user is member of channel
2. Creates message in database with auto-incrementing autoId
3. Updates channel's lastMessage
4. Increments unread count for other users
5. Emits `message:new` to all channel members
6. Sends `message:sent` confirmation back to sender

**Frontend Implementation**:
```typescript
const sendMessage = (channelId: string, content: string, replyTo?: string) => {
  const tempId = Date.now();
  
  // Optimistic UI update
  addMessageToUI({
    tempId,
    channelId,
    content,
    senderId: getCurrentUser(),
    type: 'text',
    status: 'sending',
    createdAt: Date.now()
  });
  
  socket.emit('message:send', {
    channelId,
    content,
    type: 'text',
    replyTo,
    tempId
  });
};
```

---

### 2. `message:typing`
**Purpose**: Notify other users when someone is typing

**Emit From Frontend**:
```typescript
socket.emit('message:typing', {
  channelId: '507f1f77bcf86cd799439014',
  isTyping: true  // or false when stopped typing
});
```

**What Backend Does**:
- Broadcasts typing status to all other users in the channel
- Emits `user:typing` event

**Frontend Implementation**:
```typescript
let typingTimeout: NodeJS.Timeout;

const onInputChange = (channelId: string, text: string) => {
  // Send typing started
  socket.emit('message:typing', { channelId, isTyping: true });
  
  // Clear previous timeout
  clearTimeout(typingTimeout);
  
  // Send typing stopped after 3 seconds of inactivity
  typingTimeout = setTimeout(() => {
    socket.emit('message:typing', { channelId, isTyping: false });
  }, 3000);
};

const onInputBlur = (channelId: string) => {
  socket.emit('message:typing', { channelId, isTyping: false });
  clearTimeout(typingTimeout);
};
```

---

### 3. `channel:join`
**Purpose**: Join a channel room to receive real-time updates

**Emit From Frontend**:
```typescript
socket.emit('channel:join', {
  channelId: '507f1f77bcf86cd799439014'
});
```

**What Backend Does**:
- Adds socket to the channel's room
- User will now receive all events for that channel

**Frontend Implementation**:
```typescript
const joinChannel = (channelId: string) => {
  socket.emit('channel:join', { channelId });
};

// Call when user opens/navigates to a channel
const onChannelSelected = (channelId: string) => {
  joinChannel(channelId);
  loadMessages(channelId);
};
```

---

## Listening to Events (Backend → Frontend)

### 1. `message:new`
**Purpose**: Receive new messages in real-time

**Listen On Frontend**:
```typescript
socket.on('message:new', (message) => {
  console.log('New message received:', message);
  
  // Message object structure:
  const messageData = {
    _id: message._id,
    channelId: message.channelId,
    senderId: {
      _id: message.senderId._id,
      username: message.senderId.username,
      avatar: message.senderId.avatar
    },
    content: message.content,
    type: message.type,
    autoId: message.autoId,
    readBy: message.readBy,
    deliveredTo: message.deliveredTo,
    replyTo: message.replyTo,  // Populated if replying
    attachments: message.attachments,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt
  };
  
  // Add to UI
  addMessageToChannel(message.channelId, messageData);
  
  // Update channel list (move to top, update last message)
  updateChannelInList(message.channelId, {
    lastMessage: {
      content: message.content,
      senderId: message.senderId,
      sentAt: message.createdAt,
      autoId: message.autoId
    }
  });
  
  // Show notification if not in channel
  if (currentChannelId !== message.channelId) {
    showNotification(message);
    incrementUnreadCount(message.channelId);
  } else {
    // Mark as read if viewing the channel
    markMessagesAsRead(message.channelId, message.autoId);
  }
});
```

---

### 2. `message:sent`
**Purpose**: Confirmation that your message was sent successfully

**Listen On Frontend**:
```typescript
socket.on('message:sent', (data) => {
  const { tempId, message } = data;
  
  // Replace optimistic message with real message from server
  replaceTempMessage(tempId, message);
  
  console.log('Message sent successfully:', message);
});
```

**Frontend Implementation**:
```typescript
const replaceTempMessage = (tempId: number, realMessage: any) => {
  // Find the temporary message in UI
  const tempMessage = findMessageByTempId(tempId);
  
  if (tempMessage) {
    // Update with real data from server
    tempMessage._id = realMessage._id;
    tempMessage.autoId = realMessage.autoId;
    tempMessage.status = 'sent';
    tempMessage.createdAt = realMessage.createdAt;
    
    // Re-render UI
    updateMessageInUI(tempMessage);
  }
};
```

---

### 3. `user:typing`
**Purpose**: Know when other users are typing

**Listen On Frontend**:
```typescript
socket.on('user:typing', (data) => {
  const { channelId, userId, isTyping } = data;
  
  if (isTyping) {
    // Show "User is typing..." indicator
    addTypingIndicator(channelId, userId);
  } else {
    // Remove typing indicator
    removeTypingIndicator(channelId, userId);
  }
});
```

**Frontend Implementation**:
```typescript
const typingUsers = new Map<string, Set<string>>(); // channelId -> Set of userIds

const addTypingIndicator = (channelId: string, userId: string) => {
  if (!typingUsers.has(channelId)) {
    typingUsers.set(channelId, new Set());
  }
  
  typingUsers.get(channelId)!.add(userId);
  updateTypingIndicatorUI(channelId);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    removeTypingIndicator(channelId, userId);
  }, 5000);
};

const removeTypingIndicator = (channelId: string, userId: string) => {
  if (typingUsers.has(channelId)) {
    typingUsers.get(channelId)!.delete(userId);
    updateTypingIndicatorUI(channelId);
  }
};

const updateTypingIndicatorUI = (channelId: string) => {
  const users = typingUsers.get(channelId) || new Set();
  
  if (users.size === 0) {
    hideTypingIndicator(channelId);
  } else if (users.size === 1) {
    showTypingIndicator(channelId, `${getUserName(users.values().next().value)} is typing...`);
  } else if (users.size === 2) {
    const names = Array.from(users).map(getUserName);
    showTypingIndicator(channelId, `${names[0]} and ${names[1]} are typing...`);
  } else {
    showTypingIndicator(channelId, `${users.size} people are typing...`);
  }
};
```

---

### 4. `user:status`
**Purpose**: Know when users come online/offline

**Listen On Frontend**:
```typescript
socket.on('user:status', (data) => {
  const { userId, status } = data;  // status: 'online' | 'offline' | 'away'
  
  // Update user status in UI
  updateUserStatus(userId, status);
  
  // Update in channel member lists
  updateChannelMemberStatus(userId, status);
});
```

**Frontend Implementation**:
```typescript
const updateUserStatus = (userId: string, status: string) => {
  // Update in user cache
  if (userCache.has(userId)) {
    userCache.get(userId).status = status;
  }
  
  // Update all instances in UI
  document.querySelectorAll(`[data-user-id="${userId}"]`).forEach(el => {
    el.setAttribute('data-status', status);
    
    // Update status indicator
    const indicator = el.querySelector('.status-indicator');
    if (indicator) {
      indicator.className = `status-indicator status-${status}`;
    }
  });
};
```

---

### 5. `error`
**Purpose**: Handle Socket.IO errors

**Listen On Frontend**:
```typescript
socket.on('error', (error) => {
  console.error('Socket error:', error);
  
  // Show error to user
  showErrorNotification(error.message);
  
  // Handle specific errors
  if (error.message === 'Channel not found') {
    // Redirect user or show specific error
  }
});
```

---

# DATA FLOW EXAMPLES

## Example 1: Sending a Message (Complete Flow)

### Step 1: User types and sends message
```typescript
// Frontend
const handleSendMessage = (channelId: string, content: string) => {
  const tempId = Date.now();
  const currentUser = JSON.parse(localStorage.getItem('user')!);
  
  // 1. Optimistic UI update
  const optimisticMessage = {
    tempId,
    _id: null,  // Will be set when server responds
    channelId,
    senderId: currentUser,
    content,
    type: 'text',
    autoId: null,
    readBy: [currentUser.id],
    deliveredTo: [currentUser.id],
    status: 'sending',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  addMessageToUI(channelId, optimisticMessage);
  
  // 2. Emit to server via Socket.IO
  socket.emit('message:send', {
    channelId,
    content,
    type: 'text',
    tempId
  });
};
```

### Step 2: Backend processes message
```typescript
// Backend (messageHandler.ts)
// - Validates channel membership
// - Increments channel's messageAutoId
// - Creates message in database
// - Updates channel's lastMessage
// - Increments unread count for other users
```

### Step 3: Backend broadcasts to all channel members
```typescript
// Backend emits to channel room
io.to(`channel:${channelId}`).emit('message:new', message);

// Backend sends confirmation to sender
socket.emit('message:sent', { tempId, message });
```

### Step 4: Frontend receives and updates
```typescript
// Frontend - All members receive