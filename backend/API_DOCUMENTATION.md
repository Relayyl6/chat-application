# Chat Application Backend - Complete API Documentation

## 🎯 Overview

Fully integrated chat backend built with Express.js, MongoDB, Redis, and Socket.IO. All components are connected and working together with proper middleware, validation, authentication, and real-time capabilities.

---

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Configure environment
# Create .env file with:
# - DATABASE_URL
# - REDIS_URL
# - JWT_SECRET
# - ALLOWED_ORIGINS

# Start server
npm run dev

# Server runs on port 3000 (or PORT env var)
# Base URL: http://localhost:3000/api
```

---

## 🔐 Authentication

### JWT Token
- **Type**: Bearer Token
- **Expiration**: 7 days
- **Format**: `Authorization: Bearer <token>`
- **Usage**: Required for all protected endpoints

### Token Generation
Tokens are automatically generated on registration and login, containing the user ID.

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "123abc...",
      "username": "john_doe",
      "email": "john@example.com",
      "status": "online",
      "createdAt": "2024-01-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation**:
- `username`: 3-20 characters, alphanumeric + dash/underscore
- `email`: Valid email format
- `password`: Min 6 chars, must contain uppercase + number

---

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Logged in successfully"
}
```

---

#### Get Current User
```http
GET /api/auth/current
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "123abc...",
      "username": "john_doe",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "status": "online"
    }
  },
  "message": "Current user retrieved"
}
```

---

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "john_doe_updated",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "user": { /* updated user */ } },
  "message": "Profile updated successfully"
}
```

---

#### Change Status
```http
PUT /api/auth/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "away"  // "online" | "offline" | "away"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "user": { /* updated user */ } },
  "message": "Status updated successfully"
}
```

---

### Channel Routes (`/api/channels`)

All channel routes require authentication.

#### Create Channel
```http
POST /api/channels
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "group",
  "name": "Development Team",
  "description": "Team for development discussions",
  "userIds": ["user_id_1", "user_id_2"],
  "avatar": "https://example.com/channel.jpg"
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "channel": {
      "_id": "channel_id",
      "type": "group",
      "name": "Development Team",
      "members": [ /* user objects */ ],
      "createdAt": "2024-01-15T10:00:00Z"
    }
  },
  "message": "Channel created successfully"
}
```

**Validation**:
- `name`: 3-50 characters (optional for direct messages)
- `type`: "direct" | "group" | "channel"
- `userIds`: Array of valid MongoDB ObjectIds
- `description`: Max 500 characters

**Socket.IO Event**: `channel:created`

---

#### Get All Channels
```http
GET /api/channels
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "channels": [ /* array of channel objects */ ],
    "count": 5
  },
  "message": "Channels retrieved successfully"
}
```

---

#### Get Single Channel
```http
GET /api/channels/:channelId
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "channel": { /* channel object */ }
  },
  "message": "Channel retrieved successfully"
}
```

---

#### Rename Channel
```http
POST /api/channels/:channelId/rename
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Channel Name"
}
```

**Requirements**: Must be channel admin

**Response (200)**:
```json
{
  "success": true,
  "data": { "channel": { /* updated channel */ } },
  "message": "Channel renamed successfully"
}
```

**Socket.IO Event**: `channel:renamed`

---

#### Add Members to Channel
```http
POST /api/channels/:channelId/add-members
Authorization: Bearer <token>
Content-Type: application/json

{
  "userIds": ["user_id_1", "user_id_2"]
}
```

**Requirements**: Must be channel admin

**Response (200)**:
```json
{
  "success": true,
  "data": { "channel": { /* updated channel */ } },
  "message": "Members added successfully"
}
```

**Socket.IO Event**: `channel:members-added`

---

#### Remove Member from Channel
```http
POST /api/channels/:channelId/:userId/remove-member
Authorization: Bearer <token>
```

**Requirements**: Must be channel admin (unless removing yourself)

**Response (200)**:
```json
{
  "success": true,
  "data": { "channel": { /* updated channel */ } },
  "message": "Member removed successfully"
}
```

**Socket.IO Event**: `channel:member-removed`

---

#### Leave Channel
```http
POST /api/channels/:channelId/leave
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": { /* result */ },
  "message": "Left channel successfully"
}
```

**Socket.IO Event**: `channel:member-left`

---

#### Get Channel Members
```http
GET /api/channels/:channelId/members
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "members": [ /* array of member objects with roles */ ],
    "count": 5
  },
  "message": "Members retrieved successfully"
}
```

---

#### Update Member Role
```http
PATCH /api/channels/:channelId/members/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "memberId": "user_id",
  "role": "admin"  // "admin" | "member"
}
```

**Requirements**: Must be channel creator

**Response (200)**:
```json
{
  "success": true,
  "data": { "channel": { /* updated channel */ } },
  "message": "Member role updated successfully"
}
```

**Socket.IO Event**: `channel:member-role-updated`

---

#### Search Channels
```http
GET /api/channels/search?q=development
Authorization: Bearer <token>
```

**Query Parameters**:
- `q` (required): Search query (1-100 chars)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "channels": [ /* matching channels */ ],
    "count": 3
  },
  "message": "Search completed successfully"
}
```

---

### Message Routes (`/api/messages`)

All message routes require authentication.

#### Send Message
```http
POST /api/messages/:channelId/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello team, how's the project going?",
  "replyTo": "message_id_optional",
  "attachments": []
}
```

**Response (201)**:
```json
{
  "success": true,
  "data": {
    "message": {
      "_id": "message_id",
      "channelId": "channel_id",
      "senderId": "user_id",
      "content": "Hello team...",
      "autoId": 42,
      "createdAt": "2024-01-15T10:00:00Z",
      "readBy": ["user_id"]
    }
  },
  "message": "Message sent successfully"
}
```

**Validation**:
- `content`: 1-10000 characters, cannot be whitespace-only

**Socket.IO Event**: `message:sent`

---

#### Get Messages
```http
GET /api/messages/:channelId?page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "messages": [ /* array of messages */ ],
    "total": 150,
    "page": 1,
    "pages": 3
  },
  "message": "Messages retrieved successfully"
}
```

---

#### Mark Messages as Read
```http
POST /api/messages/:channelId/read
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": { /* result */ },
  "message": "Messages marked as read"
}
```

**Socket.IO Event**: `messages:read`

---

#### Edit Message
```http
PUT /api/messages/:channelId/:messageId/edit
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated message content"
}
```

**Requirements**: Must be message sender, within 15 minutes of creation

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": { /* updated message */ } },
  "message": "Message edited successfully"
}
```

**Socket.IO Event**: `message:edited`

---

#### Delete Message
```http
DELETE /api/messages/:channelId/:messageId/delete
Authorization: Bearer <token>
```

**Requirements**: Must be message sender

**Response (200)**:
```json
{
  "success": true,
  "data": { /* result */ },
  "message": "Message deleted successfully"
}
```

**Socket.IO Event**: `message:deleted`

---

#### React to Message
```http
POST /api/messages/:channelId/:messageId/react
Authorization: Bearer <token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

**Response (200)**:
```json
{
  "success": true,
  "data": { "message": { /* message with reactions */ } },
  "message": "Reaction added successfully"
}
```

**Socket.IO Event**: `message:reaction-added`

---

#### Search Messages
```http
GET /api/messages/:channelId/search?q=deployment&page=1&limit=50
Authorization: Bearer <token>
```

**Query Parameters**:
- `q` (required): Search query
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "messages": [ /* matching messages */ ],
    "total": 5,
    "page": 1
  },
  "message": "Search completed successfully"
}
```

---

## 🚀 WebSocket Events (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Subscribing to Events
```javascript
// Channel events
socket.on('channel:created', (data) => { /* ... */ });
socket.on('channel:renamed', (data) => { /* ... */ });
socket.on('channel:members-added', (data) => { /* ... */ });
socket.on('channel:member-removed', (data) => { /* ... */ });
socket.on('channel:member-left', (data) => { /* ... */ });
socket.on('channel:member-role-updated', (data) => { /* ... */ });

// Message events
socket.on('message:sent', (data) => { /* ... */ });
socket.on('message:edited', (data) => { /* ... */ });
socket.on('message:deleted', (data) => { /* ... */ });
socket.on('message:reaction-added', (data) => { /* ... */ });
socket.on('messages:read', (data) => { /* ... */ });

// User events
socket.on('user:status', (data) => { /* ... */ });
socket.on('user:online', (data) => { /* ... */ });
socket.on('user:offline', (data) => { /* ... */ });
```

---

## 🛡️ Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | GET request completed |
| 201 | Created | Channel/message created |
| 400 | Bad Request | Validation failed |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

---

## 🔒 Security Features

### Middleware Stack
1. **CORS** - Specific origins only
2. **Request Size Limit** - 10MB max
3. **Input Sanitization** - XSS prevention
4. **Rate Limiting** - 30 requests per minute per user
5. **Authentication** - JWT validation
6. **Validation** - Zod schema checking

### Data Protection
- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens expire in 7 days
- MongoDB ObjectID validation
- HTML tag removal
- SQL injection prevention via Mongoose

---

## 📊 Rate Limiting

**Default**: 30 requests per 60 seconds per user IP

Response headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
```

Error (429):
```json
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## 🧪 Testing Examples

### Using cURL

**Register**:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Create Channel** (with token):
```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "group",
    "name": "Dev Team",
    "userIds": ["user_id_1", "user_id_2"]
  }'
```

---

## 📝 Database Models

### User
```typescript
{
  _id: ObjectId
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  avatar?: string
  status: 'online' | 'offline' | 'away'
  createdAt: Date
  updatedAt: Date
}
```

### Channel
```typescript
{
  _id: ObjectId
  type: 'direct' | 'group' | 'channel'
  name?: string
  description?: string
  avatar?: string
  members: [{
    userId: ObjectId (ref: User)
    role: 'admin' | 'member'
    joinedAt: Date
    unreadCount: number
    lastRead: Date
  }]
  lastMessageAt?: {
    content: string
    senderId: ObjectId
    sentAt: Date
  }
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
}
```

### Message
```typescript
{
  _id: ObjectId
  channelId: ObjectId (ref: Channel)
  senderId: ObjectId (ref: User)
  content: string
  autoId: number (per-channel increment)
  type: 'text' | 'image' | 'file' | 'system'
  attachments?: [{
    url: string
    type: string
    name: string
    size: number
  }]
  replyTo?: ObjectId (ref: Message)
  readBy: ObjectId[] (users who read)
  reactions?: [{
    emoji: string
    users: ObjectId[]
  }]
  isDeleted: boolean
  deletedAt?: Date
  editedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

---

## 🚀 Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Use HTTPS in production (update CORS)
- [ ] Configure MongoDB with authentication
- [ ] Setup Redis with password authentication
- [ ] Enable SSL for Socket.IO
- [ ] Configure rate limiting with Redis adapter
- [ ] Setup proper error logging
- [ ] Enable request compression
- [ ] Configure CDN for file uploads
- [ ] Setup database backups
- [ ] Monitor server performance
- [ ] Setup alerting for errors

---

## 📚 Additional Resources

- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Redis**: https://redis.io/docs
- **Socket.IO**: https://socket.io/docs
- **Zod Validation**: https://zod.dev
- **JWT**: https://jwt.io

