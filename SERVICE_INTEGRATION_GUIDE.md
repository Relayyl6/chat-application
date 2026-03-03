# Service Integration Guide

This guide shows how to refactor existing controllers to use the new service layer.

---

## Example 1: Auth Controller Refactoring

### Before (Current - Business Logic in Controller)
```typescript
// auth.controller.ts
export const SignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = registerSchema.parse(req.body);

        const existingUser = await userModel.findOne({ $or: [{ email }, { username }]});

        if (existingUser) {
            return next(new AppError("User with given email or username already exists", 400));
        }

        const newUser = await userModel.create({ username, email, password });
        const token = await generateToken(newUser._id);
        await newUser.save();

        res.status(201).json({
            user: newUser,
            token
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            //@ts-ignore
          return res.status(400).json({ errors: (err as ZodError).errors });
        }
        next(new AppError("Server error while registering", 500));
    }
}
```

### After (Using Service)
```typescript
import { registerUser } from '../services/auth.service';

export const SignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { username, email, password } = registerSchema.parse(req.body);
        const result = await registerUser({ username, email, password });
        res.status(201).json(result);
    } catch (err) {
        if (err instanceof z.ZodError) {
            //@ts-ignore
            return res.status(400).json({ errors: (err as ZodError).errors });
        }
        next(err);
    }
}
```

**Benefits:**
- Controller is 50% smaller
- Business logic is testable
- Can reuse in websocket handlers
- Easier to maintain

---

## Example 2: Channel Controller Refactoring

### Before
```typescript
export const createChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, type, avatar, userIds, description } = createChannelSchema.parse(req.body);
        const currentUserId = req.user._id;

        if (type === 'direct') {
            if (userIds.length !== 1) {
                return next(new AppError("Direct channels must have exactly one other user", 400));
            }

            const existingChannel = await channelModel.findOne({
                type: 'direct',
                'members.userId': { $all: [currentUserId, userIds[0]], $size: 2 }
            }).populate('members.userId', 'username email avatar status');

            if (existingChannel) {
                return res.status(200).json({ channel: existingChannel });
            }
        }

        const channel = await channelModel.create({
            name : type === 'direct' ? null : name,
            type,
            avatar,
            description,
            createdBy: currentUserId,
            members: [
                {
                    userId: currentUserId,
                    role: 'admin'
                },
                ...userIds.map((id: any) => ({userId: id, role: "member"}))
            ]
        })

        const populatedChannel = await channelModel.findById(channel._id).populate('members.userId', 'username email avatar status')

        res.status(200).json({
            success: true,
            channel: populatedChannel
        })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            //@ts-ignore
            return res.status(400).json({ errors: error.errors });
        }
        next(new AppError("Server error while creating channel", 500));
    }
}
```

### After
```typescript
import { createChannel } from '../services/channel.service';

export const createChannel = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, type, avatar, userIds, description } = createChannelSchema.parse(req.body);
        const channel = await createChannel(req.user._id, { name, type, avatar, userIds, description });
        res.status(201).json({ success: true, channel });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            //@ts-ignore
            return res.status(400).json({ errors: error.errors });
        }
        next(error);
    }
}
```

**Changes:**
- Validation stays in controller (Zod)
- Business logic moves to service
- Error handling simplified
- More readable and maintainable

---

## Example 3: Message Controller Refactoring

### Before
```typescript
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { content, replyTo } = req.body;
    const senderId = req.user._id;

    const channel = await channelModel.findOne({
      _id: channelId,
      'members.userId': senderId
    });

    if (!channel) {
      return next(new AppError("Channel not found or access denied", 404));
    }

    const lastMessage = await messageModel
      .findOne({ channelId })
      .sort({ autoId: -1 })
      .select('autoId');

    const nextAutoId = lastMessage ? lastMessage.autoId + 1 : 1;

    const message = await messageModel.create({
      channelId,
      senderId,
      content,
      autoId: nextAutoId,
      replyTo: replyTo || null,
      readBy: [senderId]
    });

    await channelModel.updateOne(
      { _id: channelId },
      {
        $set: {
          lastMessageAt: {
            content,
            senderId,
            sentAt: Date.now(),
            autoId: nextAutoId 
          }
        }
      }
    );

    await channelModel.updateOne(
      { _id: channelId },
      {
        $inc: {
          'members.$[elem].unreadCount': 1
        }
      },
      {
        arrayFilters: [{ 'elem.userId': { $ne: senderId } }]
      }
    );

    const populatedMessage = await message.populate('senderId', 'username avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });

  } catch (error) {
    return next(new AppError("Server error while sending message", 500));
  }
};
```

### After
```typescript
import { sendMessage } from '../services/message.service';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { channelId } = req.params;
    const { content, replyTo } = req.body;
    const message = await sendMessage(channelId, req.user._id, { content, replyTo });
    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};
```

**Impact:**
- Controller reduced from 60+ lines to 10 lines
- All complexity isolated in service
- Single responsibility maintained
- Much easier to read and test

---

## WebSocket Integration Example

Services enable easy reuse in WebSocket handlers:

```typescript
// socket/handlers/message.handler.ts
import { sendMessage, markMessagesAsRead } from '../services/message.service';

export const messageHandler = (socket: AuthSocket, io: Server) => {
    socket.on('send_message', async (data: { channelId, content, replyTo }) => {
        try {
            const message = await sendMessage(data.channelId, socket.userId, {
                content: data.content,
                replyTo: data.replyTo
            });

            // Broadcast to channel
            io.to(data.channelId).emit('new_message', message);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('mark_read', async (data: { channelId, messageAutoId }) => {
        try {
            await markMessagesAsRead(data.channelId, socket.userId, data.messageAutoId);
            io.to(data.channelId).emit('messages_read', { userId: socket.userId });
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });
};
```

---

## Testing Example

Services are testable in isolation:

```typescript
// tests/services/message.service.test.ts
import { sendMessage, markMessagesAsRead } from '../services/message.service';
import messageModel from '../models/Message';
import channelModel from '../models/Channel';

jest.mock('../models/Message');
jest.mock('../models/Channel');

describe('Message Service', () => {
    describe('sendMessage', () => {
        it('should send a message successfully', async () => {
            const mockMessage = {
                _id: '123',
                content: 'Hello',
                senderId: 'user1'
            };

            messageModel.create.mockResolvedValue(mockMessage);
            channelModel.findOne.mockResolvedValue({ _id: 'channel1' });

            const result = await sendMessage('channel1', 'user1', { content: 'Hello' });

            expect(result).toBeDefined();
            expect(messageModel.create).toHaveBeenCalled();
        });

        it('should throw error if user not in channel', async () => {
            channelModel.findOne.mockResolvedValue(null);

            await expect(
                sendMessage('channel1', 'user1', { content: 'Hello' })
            ).rejects.toThrow('Channel not found');
        });
    });
});
```

---

## Migration Checklist

- [ ] Update auth.controller.ts to use auth.service
- [ ] Update channel.controller.ts to use channel.service
- [ ] Update message.controller.ts to use message.service
- [ ] Update WebSocket handlers to use services
- [ ] Add unit tests for all service functions
- [ ] Test error scenarios
- [ ] Verify backwards compatibility with frontend
- [ ] Update API documentation

---

## Performance Considerations

**Caching Opportunities:**
```typescript
// Cache user channels (5 min TTL)
export const getUserChannels = async (userId: string, useCache = true) => {
    const cacheKey = `user:${userId}:channels`;
    const cached = await redis.get(cacheKey);
    
    if (cached && useCache) return JSON.parse(cached);
    
    const channels = await channelModel.find({ 'members.userId': userId });
    await redis.setex(cacheKey, 300, JSON.stringify(channels));
    
    return channels;
};
```

**Batch Operations:**
```typescript
// Bulk mark messages as read
export const markMultipleMessagesAsRead = async (
    channelId: string,
    userId: string,
    messageIds: string[]
) => {
    return messageModel.updateMany(
        { _id: { $in: messageIds }, channelId },
        { $addToSet: { readBy: userId } }
    );
};
```

