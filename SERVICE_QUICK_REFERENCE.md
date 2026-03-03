# Quick Service Reference Card

## 🔐 Auth Service

```typescript
import { 
    registerUser, 
    loginUser, 
    getUserById, 
    updateUserStatus, 
    updateUserProfile, 
    logoutUser 
} from '@/services/auth.service';

// Register new user
await registerUser({ username: 'john', email: 'john@example.com', password: 'pass123' });
// Returns: { user: {...}, token: 'jwt...' }

// Login user
await loginUser({ email: 'john@example.com', password: 'pass123' });
// Returns: { user: {...}, token: 'jwt...' }

// Get user profile
await getUserById(userId);
// Returns: User document (no password)

// Update status
await updateUserStatus(userId, 'online');
// Returns: Updated user

// Update profile
await updateUserProfile(userId, { username: 'jane', avatar: 'url...' });
// Returns: Updated user

// Logout
await logoutUser(userId);
// Returns: User with status='offline'
```

---

## 💬 Channel Service

```typescript
import {
    createChannel,
    getUserChannels,
    getChannelById,
    renameChannel,
    addMembersToChannel,
    removeMemberFromChannel,
    leaveChannel,
    getChannelMembers,
    updateMemberRole,
    searchChannels
} from '@/services/channel.service';

// Create channel (direct, group, channel)
await createChannel(userId, {
    name: 'dev-team',
    type: 'group',
    userIds: ['user2', 'user3']
});

// Get all user's channels
await getUserChannels(userId);

// Get single channel
await getChannelById(channelId, userId);

// Rename (admin only)
await renameChannel(channelId, userId, 'new-name');

// Add members
await addMembersToChannel(channelId, userId, ['user4', 'user5']);

// Remove member
await removeMemberFromChannel(channelId, userId, 'user4');

// Leave channel
await leaveChannel(channelId, userId);

// Get members
await getChannelMembers(channelId, userId);

// Update role (admin only)
await updateMemberRole(channelId, userId, 'user2', 'admin');

// Search channels
await searchChannels(userId, 'dev');
```

---

## 💌 Message Service

```typescript
import {
    sendMessage,
    getMessages,
    markMessagesAsRead,
    deleteMessage,
    editMessage,
    reactToMessage,
    getMessageStats,
    searchMessages
} from '@/services/message.service';

// Send message
await sendMessage(channelId, userId, {
    content: 'Hello team!',
    replyTo: parentMessageId,
    attachments: [{ url: '...', type: 'image' }]
});

// Get messages (with pagination)
await getMessages(channelId, userId, {
    limit: 50,
    before: 100,  // messages before this ID
    skip: 0
});

// Mark as read
await markMessagesAsRead(channelId, userId, lastMessageId);

// Delete message
await deleteMessage(messageId, userId);

// Edit message
await editMessage(messageId, userId, 'Edited content');

// React with emoji
await reactToMessage(messageId, userId, '👍');

// Get stats
await getMessageStats(channelId);
// Returns: { totalMessages: 542, messagesByType: [...] }

// Search messages
await searchMessages(channelId, userId, 'hello');
```

---

## ⚡ Error Handling

All services throw **AppError** on failure:

```typescript
try {
    await sendMessage(channelId, userId, payload);
} catch (error) {
    if (error instanceof AppError) {
        console.error(`[${error.statusCode}] ${error.message}`);
        // Handle specific error
    } else {
        console.error('Unexpected error:', error);
    }
}
```

**Common Errors:**
- 400: Bad request (validation failed)
- 401: Unauthorized (not authenticated)
- 403: Forbidden (no permission)
- 404: Not found (resource doesn't exist)
- 500: Server error

---

## 🔄 Common Workflows

### User Registration Flow
```typescript
// 1. Validate input (controller)
const { username, email, password } = registerSchema.parse(req.body);

// 2. Register (service)
const { user, token } = await registerUser({ username, email, password });

// 3. Return response (controller)
res.status(201).json({ user, token });
```

### Create Group Chat
```typescript
// 1. Create channel
const channel = await createChannel(userId, {
    name: 'Project Managers',
    type: 'group',
    userIds: ['user2', 'user3', 'user4']
});

// 2. Send welcome message
await sendMessage(channel._id, userId, {
    content: 'Welcome to the group!'
});

// 3. Broadcast via WebSocket
io.to(channel._id).emit('channel_created', channel);
```

### Send & Mark as Read
```typescript
// 1. Send message
const message = await sendMessage(channelId, userId, { content: 'Hi!' });

// 2. Broadcast message
io.to(channelId).emit('new_message', message);

// 3. Mark as read
await markMessagesAsRead(channelId, recipientId, message.autoId);

// 4. Notify read status
io.to(channelId).emit('messages_read', { userId: recipientId });
```

### Search & Reply
```typescript
// 1. Search messages
const results = await searchMessages(channelId, userId, 'bug fix');

// 2. Reply to found message
const reply = await sendMessage(channelId, userId, {
    content: 'I found a solution',
    replyTo: results[0]._id
});

// 3. Show in UI with context
console.log(reply.replyTo); // Original message
```

---

## 📊 Data Structures

### User Response
```typescript
{
    _id: ObjectId,
    username: string,
    email: string,
    avatar: string,
    status: 'online' | 'offline' | 'away',
    lastSeen: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### Channel Response
```typescript
{
    _id: ObjectId,
    name: string | null,  // null for direct
    type: 'direct' | 'group' | 'channel',
    avatar: string,
    description: string,
    members: [{
        userId: { ...userDoc },
        role: 'admin' | 'member',
        joinedAt: Date,
        lastRead: number,
        unreadCount: number
    }],
    lastMessageAt: {
        content: string,
        senderId: ObjectId,
        sendAt: Date,
        autoId: number
    },
    createdBy: ObjectId,
    createdAt: Date,
    updatedAt: Date
}
```

### Message Response
```typescript
{
    _id: ObjectId,
    channelId: ObjectId,
    senderId: { ...userDoc },
    content: string,
    type: 'text' | 'image' | 'file' | 'system',
    autoId: number,
    readBy: [ObjectId],
    deliveredTo: [ObjectId],
    replyTo: { ...messageDoc } | null,
    attachments: [{ url, type, name, size }],
    createdAt: Date,
    updatedAt: Date
}
```

---

## 🧪 Testing Template

```typescript
import { sendMessage } from '@/services/message.service';
import messageModel from '@/models/Message';

jest.mock('@/models/Message');

describe('Message Service', () => {
    it('should send message successfully', async () => {
        messageModel.create.mockResolvedValue({ _id: '1', content: 'Hi' });
        
        const result = await sendMessage('ch1', 'user1', { content: 'Hi' });
        
        expect(result).toBeDefined();
        expect(messageModel.create).toHaveBeenCalled();
    });

    it('should throw if channel not found', async () => {
        jest.spyOn(channelModel, 'findOne').mockResolvedValue(null);
        
        await expect(
            sendMessage('ch1', 'user1', { content: 'Hi' })
        ).rejects.toThrow('Channel not found');
    });
});
```

---

## 🚀 Performance Tips

- Use pagination for messages: `{ limit: 50, skip: 0 }`
- Cache user channels: 5-min TTL
- Index searches: Use MongoDB text search
- Batch updates: `updateMany()` instead of multiple updates
- Lazy-load members: Only populate when needed

---

## 📦 Import Statement

```typescript
// Auth
import { registerUser, loginUser, getUserById } from '@/services/auth.service';

// Channels
import { createChannel, getUserChannels, addMembersToChannel } from '@/services/channel.service';

// Messages
import { sendMessage, getMessages, markMessagesAsRead } from '@/services/message.service';
```

---

All services return either:
- ✅ **Success:** Resolved Promise with data
- ❌ **Failure:** Rejected Promise with AppError

Keep it simple, keep it tested! 🎉
