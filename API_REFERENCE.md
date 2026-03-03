# Swagger API Documentation - Quick Reference

## 📚 API Overview

**Base URL:** `http://localhost:3000/api`  
**Documentation:** `http://localhost:3000/api-docs`  
**Authentication:** Bearer Token (JWT)

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Response:** 201 Created
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "token": "string"
}
```

### POST /auth/login
Authenticate user
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:** 200 OK
```json
{
  "token": "string",
  "user": { "_id", "username", "email", "status" }
}
```

### GET /auth/current
Get current user (Protected)
**Headers:** `Authorization: Bearer <token>`  
**Response:** 200 OK
```json
{
  "_id": "string",
  "username": "string",
  "email": "string",
  "status": "online|offline|away",
  "avatar": "string"
}
```

### PUT /auth/profile
Update user profile (Protected)
```json
{
  "username": "string",
  "avatar": "string"
}
```
**Response:** 200 OK - Updated user object

### PUT /auth/status
Update user status (Protected)
```json
{
  "status": "online|offline|away"
}
```
**Response:** 200 OK - Updated status

---

## 💬 Channel Endpoints

### GET /channels
List all channels (Protected)
**Query:** `?skip=0&limit=10`  
**Response:** 200 OK - Array of channels

### POST /channels
Create new channel (Protected)
```json
{
  "type": "direct|group",
  "name": "string",
  "userIds": ["string"],
  "description": "string",
  "avatar": "string"
}
```
**Response:** 201 Created - Channel object

### GET /channels/search
Search channels (Protected)
**Query:** `?query=searchterm&skip=0&limit=10`  
**Response:** 200 OK - Matching channels

### GET /channels/{id}
Get channel details (Protected)
**Response:** 200 OK - Channel object with members

### POST /channels/{id}/rename
Rename channel (Protected)
```json
{
  "name": "string"
}
```
**Response:** 200 OK - Updated channel

### POST /channels/{id}/add-members
Add members to channel (Protected)
```json
{
  "userIds": ["string"]
}
```
**Response:** 200 OK - Updated members list

### POST /channels/{id}/{userId}/remove-member
Remove member from channel (Protected)  
**Response:** 200 OK - Updated members

### POST /channels/{id}/leave
Leave channel (Protected)  
**Response:** 200 OK - Confirmation

### GET /channels/{id}/members
Get channel members (Protected)  
**Response:** 200 OK - Array of member objects

### PATCH /channels/{id}/members/role
Update member role (Protected)
```json
{
  "memberId": "string",
  "role": "admin|moderator|member"
}
```
**Response:** 200 OK - Updated member

---

## 💌 Message Endpoints

### GET /messages/{channelId}
Get messages (Protected)
**Query:** `?page=1&limit=50`  
**Response:** 200 OK - Array of messages

### POST /messages/{channelId}/send
Send message (Protected)
```json
{
  "content": "string",
  "attachments": ["string"],
  "replyTo": "string"
}
```
**Response:** 201 Created - Message object

### POST /messages/{channelId}/read
Mark messages as read (Protected)  
**Response:** 200 OK - Confirmation

### PUT /messages/{channelId}/{messageId}/edit
Edit message (Protected)
```json
{
  "content": "string"
}
```
**Response:** 200 OK - Updated message

### DELETE /messages/{channelId}/{messageId}/delete
Delete message (Protected)  
**Response:** 200 OK - Confirmation

### POST /messages/{channelId}/{messageId}/react
React to message (Protected)
```json
{
  "emoji": "string"
}
```
**Response:** 200 OK - Updated reactions

### GET /messages/{channelId}/search
Search messages (Protected)
**Query:** `?query=searchterm&page=1&limit=50`  
**Response:** 200 OK - Matching messages

---

## 🔌 WebSocket Events

### Client → Server (Emit)

**socket.emit('join-channel', channelId)**
- Join channel room for real-time updates

**socket.emit('send-message', { channelId, content, attachments?, replyTo? })**
- Send message to channel

**socket.emit('edit-message', { channelId, messageId, content })**
- Edit message in channel

**socket.emit('delete-message', { channelId, messageId })**
- Delete message from channel

**socket.emit('react-message', { channelId, messageId, emoji })**
- Add reaction to message

**socket.emit('user-typing', { channelId, isTyping })**
- Notify channel of typing status

**socket.emit('change-status', status)**
- Update online status (online|offline|away)

---

### Server → Client (Listen)

**'connection'**
- Socket connection established

**'message:sent'**
- New message received
```json
{
  "_id": "string",
  "channelId": "string",
  "content": "string",
  "senderId": { "id": "string", "username": "string" },
  "createdAt": "ISO-8601",
  "reactions": []
}
```

**'message:edited'**
- Message content updated
```json
{
  "channelId": "string",
  "messageId": "string",
  "content": "string",
  "updatedAt": "ISO-8601"
}
```

**'message:deleted'**
- Message removed from channel
```json
{
  "channelId": "string",
  "messageId": "string"
}
```

**'message:reaction-added'**
- User reacted to message
```json
{
  "channelId": "string",
  "messageId": "string",
  "emoji": "string",
  "reactions": []
}
```

**'messages:read'**
- Messages marked as read
```json
{
  "channelId": "string",
  "messageId": "string",
  "readBy": ["string"]
}
```

**'channel:created'**
- New channel created
```json
{
  "_id": "string",
  "name": "string",
  "type": "direct|group",
  "users": []
}
```

**'channel:renamed'**
- Channel name changed
```json
{
  "channelId": "string",
  "name": "string"
}
```

**'channel:members-added'**
- Users added to channel
```json
{
  "channelId": "string",
  "userIds": ["string"]
}
```

**'channel:member-removed'**
- User removed from channel
```json
{
  "channelId": "string",
  "userId": "string"
}
```

**'channel:member-left'**
- User left channel
```json
{
  "channelId": "string",
  "userId": "string"
}
```

**'channel:member-role-updated'**
- Member role changed
```json
{
  "channelId": "string",
  "memberId": "string",
  "role": "admin|moderator|member"
}
```

**'user:status'**
- User status changed
```json
{
  "userId": "string",
  "status": "online|offline|away"
}
```

**'user:online'**
- User came online
```json
{
  "userId": "string"
}
```

**'user:offline'**
- User went offline
```json
{
  "userId": "string"
}
```

**'user:typing'**
- User is typing
```json
{
  "channelId": "string",
  "userId": "string",
  "isTyping": boolean
}
```

---

## 🔑 Authorization Header

All protected endpoints require:
```
Authorization: Bearer <jwt_token>
```

Token obtained from:
- POST /auth/register
- POST /auth/login

---

## 📊 Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - No permission |
| 404 | Not Found - Resource doesn't exist |
| 500 | Server Error - Internal server error |

---

## 🧪 Testing with Swagger UI

1. Navigate to: **http://localhost:3000/api-docs**
2. Click on any endpoint to expand
3. Click "Try it out" button
4. For protected endpoints:
   - Click "Authorize" at top of page
   - Paste JWT token from login response
5. Fill in request parameters
6. Click "Execute"
7. View response

---

## 📝 Example Workflow

### 1. Register User
```bash
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

### 2. Login
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "securepass123"
}
# Returns: { token: "...", user: {...} }
```

### 3. Create Channel
```bash
POST /channels
Authorization: Bearer <token>
{
  "type": "group",
  "name": "Project Discussion",
  "userIds": ["user_id_1", "user_id_2"],
  "description": "Discuss project details"
}
```

### 4. Send Message
```bash
POST /messages/{channelId}/send
Authorization: Bearer <token>
{
  "content": "Great project update!",
  "attachments": [],
  "replyTo": null
}
```

### 5. Search Messages
```bash
GET /messages/{channelId}/search?query=update&page=1&limit=50
Authorization: Bearer <token>
```

### 6. React to Message
```bash
POST /messages/{channelId}/{messageId}/react
Authorization: Bearer <token>
{
  "emoji": "👍"
}
```

---

## 🎯 Common Use Cases

### Send Message with Mention
```bash
POST /messages/{channelId}/send
{
  "content": "@john_doe Check this out"
}
```

### Create Private Channel
```bash
POST /channels
{
  "type": "direct",
  "name": "Private Chat",
  "userIds": ["other_user_id"]
}
```

### Update User Availability
```bash
PUT /auth/status
{
  "status": "away"
}
```

### Search All Channels
```bash
GET /channels/search?query=meeting
```

---

## 📌 Important Notes

1. **Token Expiration** - Tokens may expire, re-login when necessary
2. **Channel Types** - "direct" for 1-on-1, "group" for multiple users
3. **Pagination** - Default limit is 10, max is 100
4. **Real-time Updates** - Socket.IO required for live updates
5. **Reactions** - Use emoji strings (e.g., "👍", "❤️")
6. **Search** - Case-insensitive, searches message content

---

## 🔗 Frontend Integration

All endpoints are already integrated in frontend:

- **lib/api.ts** - HTTP API calls
- **lib/socket.ts** - WebSocket event handlers  
- **hooks/useMessages.ts** - Message operations
- **hooks/useChannels.ts** - Channel operations
- **SocketContext.tsx** - Socket event listeners

---

**Last Updated:** March 2, 2026  
**API Version:** 1.0  
**Status:** Production Ready
