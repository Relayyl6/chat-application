# 🚀 Backend Quick Reference Card

## Essential Commands

```bash
# Install & Run
npm install
npm run dev              # Development
npm run build && npm start  # Production

# Check for errors
npm run type-check      # TypeScript errors (if configured)
```

---

## API Endpoints (Quick List)

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/current` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/status` - Change status

### Channels
- `POST /api/channels` - Create channel
- `GET /api/channels` - List channels
- `GET /api/channels/:id` - Get channel
- `POST /api/channels/:id/rename` - Rename
- `POST /api/channels/:id/add-members` - Add members
- `POST /api/channels/:id/:userId/remove-member` - Remove member
- `POST /api/channels/:id/leave` - Leave channel
- `GET /api/channels/:id/members` - List members
- `PATCH /api/channels/:id/members/role` - Update role
- `GET /api/channels/search?q=query` - Search

### Messages
- `GET /api/messages/:channelId` - List messages
- `POST /api/messages/:channelId/send` - Send message
- `POST /api/messages/:channelId/read` - Mark as read
- `PUT /api/messages/:messageId/edit` - Edit message
- `DELETE /api/messages/:messageId/delete` - Delete message
- `POST /api/messages/:messageId/react` - React with emoji
- `GET /api/messages/:channelId/search?q=query` - Search

---

## Authentication Header

```
Authorization: Bearer <JWT_TOKEN>
```

All protected endpoints require this header.

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { /* result */ },
  "message": "Success message"
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

---

## Adding New Endpoints

### Step 1: Create Validation Schema
File: `src/middleware/validation.middleware.ts`
```typescript
export const mySchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive()
});
```

### Step 2: Create Service Function
File: `src/services/my.service.ts`
```typescript
export const myServiceFunction = async (
  userId: string,
  data: any
): Promise<ResultType> => {
  try {
    // Business logic
    return result;
  } catch (error) {
    throw new AppError('Error message', statusCode);
  }
};
```

### Step 3: Create Controller Function
File: `src/controller/my.controller.ts`
```typescript
export const myController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await myServiceFunction(req.user._id, req.body);
    
    // Broadcast if needed
    const io = req.app.get('io');
    if (io) io.to('room').emit('event', { result });
    
    res.status(200).json({
      success: true,
      data: { result },
      message: "Success"
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 4: Add Route
File: `src/routes/my.routes.ts`
```typescript
router.post(
  '/endpoint',
  authMiddleware,
  validate(mySchema),
  myController
);
```

---

## Common Validation Schemas

### Email & Password
```typescript
email: z.string().email('Invalid email'),
password: z.string()
  .min(6, 'Min 6 chars')
  .regex(/[A-Z]/, 'Need uppercase')
  .regex(/[0-9]/, 'Need number')
```

### MongoDB ID
```typescript
id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
```

### Username
```typescript
username: z.string()
  .min(3, 'Min 3 chars')
  .max(20, 'Max 20 chars')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Alphanumeric + dash/underscore')
```

### String Content (Message)
```typescript
content: z.string()
  .min(1, 'Cannot be empty')
  .max(10000, 'Max 10000 chars')
  .refine(val => val.trim().length > 0, 'Cannot be whitespace only')
```

---

## Environment Variables

```env
# Database
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Cache
REDIS_URL=redis://user:pass@localhost:6379

# Authentication
JWT_SECRET=your-super-secret-key-min-32-chars-recommended

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Server
PORT=3000
NODE_ENV=development
```

---

## Error Handling Pattern

```typescript
try {
  // Your code
} catch (error) {
  // Always pass to next for error middleware
  return next(new AppError('User message', statusCode));
  // or
  return next(error);
}
```

---

## Socket.IO Patterns

### Emit to Channel
```typescript
const io = req.app.get('io');
io.to(`channel:${channelId}`).emit('event:name', data);
```

### Emit to User
```typescript
io.to(`user:${userId}`).emit('event:name', data);
```

### Emit to All Connected
```typescript
io.emit('event:name', data);
```

---

## Rate Limiting

**Default**: 30 requests per 60 seconds per IP

Response headers:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
```

Exceeded (429):
```json
{
  "success": false,
  "error": "Too many requests",
  "retryAfter": 45
}
```

---

## Middleware Order (Important!)

```typescript
app.use(cors());                    // 1. CORS
app.use(express.json());            // 2. Parse JSON
app.use(validateRequestSize());     // 3. Size limit
app.use(sanitizeInputs);            // 4. Sanitize
app.use(rateLimitByUser());         // 5. Rate limit
app.use('/api/auth', authRouter);   // 6. Routes
// ... other routes
app.use(errorMiddleware);           // 7. Error handler (LAST!)
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Pass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass123"
  }'
```

### Protected Endpoint (with token)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/auth/current
```

### Create Channel
```bash
curl -X POST http://localhost:3000/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "group",
    "name": "My Channel",
    "userIds": ["USER_ID_1", "USER_ID_2"]
  }'
```

---

## Database Model Quick Lookup

### User
```typescript
{ _id, username, email, password, avatar, status, createdAt }
```

### Channel
```typescript
{ _id, type, name, members, lastMessageAt, createdBy, createdAt }
```

### Message
```typescript
{ _id, channelId, senderId, content, autoId, readBy, reactions, createdAt }
```

---

## Service Functions Reference

### Auth Service
- `registerUser({ username, email, password })`
- `loginUser({ email, password })`
- `getUserById(userId)`
- `updateUserStatus(userId, status)`
- `updateUserProfile(userId, { username, avatar })`
- `logoutUser(userId)`

### Channel Service
- `createChannel(userId, data)`
- `getUserChannels(userId)`
- `getChannelById(channelId, userId)`
- `renameChannel(channelId, userId, newName)`
- `addMembersToChannel(channelId, userId, userIds)`
- `removeMemberFromChannel(channelId, userId, memberId)`
- `leaveChannel(channelId, userId)`
- `getChannelMembers(channelId, userId)`
- `updateMemberRole(channelId, userId, memberId, role)`
- `searchChannels(userId, query)`

### Message Service
- `sendMessage(channelId, userId, { content, attachments, replyTo })`
- `getMessages(channelId, userId, { page, limit })`
- `markMessagesAsRead(channelId, userId)`
- `deleteMessage(channelId, messageId, userId)`
- `editMessage(channelId, messageId, userId, content)`
- `reactToMessage(channelId, messageId, userId, emoji)`
- `getMessageStats(channelId, userId)`
- `searchMessages(channelId, userId, query, options)`

---

## TypeScript Types

### AuthRequest
```typescript
interface AuthRequest extends Request {
  user: {
    _id: string;
    username: string;
    email: string;
    status: 'online' | 'offline' | 'away';
  };
}
```

### AppError
```typescript
throw new AppError('User message', statusCode);
```

---

## Debugging Tips

1. **Check JWT Token**: Use [jwt.io](https://jwt.io) to decode
2. **Check Validation**: Add console.log after validate() middleware
3. **Database Issues**: Check MongoDB connection in .env
4. **Redis Issues**: Verify Redis is running and URL is correct
5. **Socket.IO Issues**: Check browser console for connection errors
6. **Rate Limiting**: Check X-RateLimit headers in response

---

## File Locations

```
src/
├── routes/        → Add new routes here
├── controller/    → Add new controllers here
├── services/      → Add new services here
├── middleware/    → validation.middleware.ts (add schemas)
├── models/        → Database schemas
├── utils/         → Helper functions
├── config/        → Configuration
└── server.ts      → Main file
```

---

## Checklist Before Deployment

- [ ] All env variables set
- [ ] Database credentials secure
- [ ] Redis running and accessible
- [ ] JWT_SECRET is random and long
- [ ] ALLOWED_ORIGINS updated for production
- [ ] Error logging configured
- [ ] Database backups scheduled
- [ ] SSL certificate valid
- [ ] Rate limiting thresholds appropriate
- [ ] All endpoints tested

---

## Support Files

📖 **Full Documentation**:
- `API_DOCUMENTATION.md` - Complete API reference
- `INTEGRATION_COMPLETE.md` - Architecture overview
- `BACKEND_REFERENCE_GUIDE.md` - Development guide
- `COMPLETION_SUMMARY.md` - What was accomplished

🔍 **Security**:
- `VULNERABILITY_REPORT.md` - Security audit results
- `FIXES_APPLIED.md` - Detailed fix implementations

✨ Ready to build! 🚀

