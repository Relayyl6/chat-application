# Backend Architecture Overview

## 📁 Complete Backend Structure

```
backend/
├── src/
│   ├── server.ts                    # Express app entry point
│   ├── config/
│   │   ├── database.ts              # MongoDB connection
│   │   ├── env.config.ts            # Environment variables
│   │   ├── redis.ts                 # Redis connection
│   │   └── socket.ts                # Socket.IO config (if exists)
│   │
│   ├── models/
│   │   ├── User.ts                  # User schema + methods
│   │   ├── Channel.ts               # Channel schema
│   │   └── Message.ts               # Message schema
│   │
│   ├── controller/
│   │   ├── auth.controller.ts       # HTTP handlers for auth
│   │   ├── channel.controller.ts    # HTTP handlers for channels
│   │   └── message.controller.ts    # HTTP handlers for messages
│   │
│   ├── services/                    # ✨ NEW - Business Logic Layer
│   │   ├── auth.service.ts          # Auth business logic (6 functions)
│   │   ├── channel.service.ts       # Channel logic (10 functions)
│   │   └── message.service.ts       # Message logic (8 functions)
│   │
│   ├── routes/
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   ├── channel.routes.ts        # Channel endpoints
│   │   └── message.routes.ts        # Message endpoints
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT verification (FIXED)
│   │   ├── error.middleware.ts      # Global error handler (FIXED)
│   │   └── validation.middleware.ts # Request validation
│   │
│   ├── socket/
│   │   ├── socket.manager.ts        # Socket.IO initialization (FIXED)
│   │   ├── socket.authmidleware.ts  # Socket auth
│   │   ├── socket.connection.ts     # Connection handler
│   │   └── handlers/                # Socket event handlers
│   │
│   ├── cron/
│   │   └── cron.ts                  # Scheduled jobs
│   │
│   ├── types/
│   │   ├── index.ts                 # TypeScript interfaces
│   │   └── jsonwebtoken.d.ts        # JWT types
│   │
│   └── utils/
│       ├── AppError.ts              # Custom error class
│       ├── dns-resolver.ts          # DNS configuration
│       ├── helper.ts                # Utility functions
│       ├── lib.ts                   # Library utilities
│       └── logger.ts                # Logging setup
│
├── docker-compose.yml               # Docker services
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
└── .env.local                       # Environment variables (not in repo)
```

---

## 🔄 Data Flow Architecture

### Request Flow (HTTP)
```
Client Request
    ↓
Express Router (routes/)
    ↓
Controller (controller/)
    ↓
Service (services/) ← All business logic here
    ↓
Model (models/)
    ↓
MongoDB Database
```

### Real-time Flow (WebSocket)
```
Socket.IO Client
    ↓
Socket Handler (socket/handlers/)
    ↓
Service (services/) ← Reuses same services!
    ↓
Model (models/)
    ↓
MongoDB Database
    ↓
Broadcast to clients via Socket.IO
```

---

## 📚 Layer Responsibilities

### Presentation Layer (Routes/Controllers)
- ✅ Receive HTTP requests
- ✅ Validate input with Zod
- ✅ Parse request parameters
- ✅ Send HTTP responses
- ✅ Status codes and headers

### Business Logic Layer (Services) ← WHERE THE WORK HAPPENS
- ✅ Validate business rules
- ✅ Check permissions
- ✅ Perform calculations
- ✅ Call multiple models if needed
- ✅ Manage transactions
- ✅ Handle errors consistently

### Data Access Layer (Models)
- ✅ MongoDB schema definitions
- ✅ Database queries
- ✅ Indexes
- ✅ Pre/post hooks
- ✅ Schema validation

---

## 🔧 Key Components

### Auth Service (6 Functions)
```
registerUser() → Creates account
loginUser() → Authenticates user
getUserById() → Retrieves profile
updateUserStatus() → Changes online/offline
updateUserProfile() → Updates info
logoutUser() → Logs out
```

### Channel Service (10 Functions)
```
createChannel() → New channel
getUserChannels() → List channels
getChannelById() → Get details
renameChannel() → Rename (admin)
addMembersToChannel() → Add users
removeMemberFromChannel() → Remove user
leaveChannel() → User leaves
getChannelMembers() → List members
updateMemberRole() → Change role
searchChannels() → Search
```

### Message Service (8 Functions)
```
sendMessage() → Send message
getMessages() → Fetch messages
markMessagesAsRead() → Mark read
deleteMessage() → Delete
editMessage() → Edit
reactToMessage() → Add emoji
getMessageStats() → Stats
searchMessages() → Search
```

---

## 🔐 Security Layers

### Authentication
```
Client sends JWT in Authorization header
    ↓
authMiddleware verifies token (FIXED: correct parsing)
    ↓
req.user populated with user data
    ↓
Services verify user permissions
```

### Authorization
```
Service checks if user has permission
    ├─ Is user in channel?
    ├─ Is user admin?
    ├─ Is user sender?
    ├─ Is user creator?
    └─ Throw AppError if denied
```

### CORS
```
Frontend sends cross-origin request
    ↓
Express checks allowed origins (FIXED: proper config)
    ↓
Socket.IO also validates CORS (FIXED: proper config)
    ↓
Request allowed/denied
```

---

## 💾 Database Schema

### Users Collection
```typescript
{
    _id: ObjectId,
    username: string (unique),
    email: string (unique),
    password: string (hashed),
    avatar: string (auto-generated URL),
    status: 'online' | 'offline' | 'away',
    lastSeen: Date,
    createdAt: Date,
    updatedAt: Date
}
```

### Channels Collection
```typescript
{
    _id: ObjectId,
    name: string | null,  // null for direct messages
    type: 'direct' | 'group' | 'channel',
    avatar: string,
    description: string,
    members: [{
        userId: ObjectId (ref User),
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
    createdBy: ObjectId (ref User),
    createdAt: Date,
    updatedAt: Date
}

Indexes:
- members.userId
- type + members.userId
```

### Messages Collection
```typescript
{
    _id: ObjectId,
    channelId: ObjectId (ref Channel),
    senderId: ObjectId (ref User),
    content: string,
    type: 'text' | 'image' | 'file' | 'system',
    autoId: number (auto-incremented per channel),
    readBy: [ObjectId (ref User)],
    deliveredTo: [ObjectId (ref User)],
    replyTo: ObjectId (ref Message) | null,
    attachments: [{
        url: string,
        type: string,
        name: string,
        size: number
    }],
    createdAt: Date,
    updatedAt: Date
}

Indexes:
- channelId + autoId
- channelId + createdAt
```

---

## 🔄 Common Operations

### Sending a Message (Complete Flow)
```
1. Client sends message via REST or WebSocket
2. Controller receives request
3. Controller validates with Zod
4. Controller calls service.sendMessage()
5. Service checks if user in channel (AppError if not)
6. Service generates next autoId
7. Service creates message in MongoDB
8. Service updates channel last message
9. Service increments unread count for others
10. Service returns populated message
11. Controller sends response (or broadcasts via socket)
12. Frontend receives and displays message
```

### Loading Message History
```
1. Client requests: /api/messages/:channelId?limit=50&before=100
2. Controller extracts params
3. Controller calls service.getMessages()
4. Service verifies user is in channel
5. Service builds MongoDB query
6. Service executes with pagination
7. Service populates sender and reply data
8. Service reverses array (oldest→newest)
9. Service returns messages
10. Controller responds to client
11. Frontend renders conversation
```

### Marking Messages as Read
```
1. Client calls markAsRead(channelId, lastMessageId)
2. Via WebSocket or REST
3. Service updates channel member lastRead
4. Service resets unreadCount to 0
5. Service adds user to readBy on all messages
6. Service broadcasts update via socket
7. All clients in channel receive notification
```

---

## 🚀 Performance Optimizations

### Database Level
- ✅ Indexed queries for fast lookups
- ✅ Selective field population (avoid large docs)
- ✅ Pagination to limit data transfer
- ✅ Message autoId (smaller than UUID)
- ✅ Compound indexes for complex queries

### Application Level
- ✅ Service layer prevents duplicate logic
- ✅ Redis for caching potential
- ✅ Socket.IO clustering ready (Redis adapter)
- ✅ Unread count tracking (avoids recounting)
- ✅ Last message caching (no full query)

### Frontend Level
- ✅ Messages loaded in chunks
- ✅ Pagination prevents loading all messages
- ✅ Real-time updates via socket (no polling)
- ✅ Unread badges cached
- ✅ User status broadcast (not individual queries)

---

## 🧪 Testing Strategy

### Unit Tests (Services)
```
Test each service function independently
Mock database calls
Verify business logic
Test error scenarios
```

### Integration Tests (Controllers)
```
Test full HTTP request/response
Verify middleware chain
Check error responses
Validate response format
```

### End-to-End Tests (Full Flow)
```
User registration → login → create channel → send message
Verify data in database
Check WebSocket broadcasts
Validate frontend updates
```

---

## 🔧 Configuration

### Environment Variables (.env.local)
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://user:pass@cluster...
REDIS_URL=redis://:password@host:port
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
ALLOWED_ORIGINS=http://localhost:3001,https://yourdomain.com
HEALTH_CHECK_URL=http://localhost:5000/api/health
```

### Node Modules
```
Core: express, http, cors
Database: mongoose, redis
Auth: jsonwebtoken, bcryptjs
Validation: zod
Real-time: socket.io, @socket.io/redis-adapter
Utilities: dotenv, axios, node-cron
Dev: nodemon, ts-node, typescript
```

---

## ✅ Current Status

### Fixed Issues
- [x] Removed hardcoded database credentials
- [x] Fixed JWT token extraction bug
- [x] Registered error middleware globally
- [x] Fixed CORS configuration
- [x] Added Redis error handlers
- [x] Removed unused imports
- [x] Fixed typos

### Implemented Services
- [x] Auth service (6 functions)
- [x] Channel service (10 functions)
- [x] Message service (8 functions)
- [x] Type-safe with TypeScript
- [x] Comprehensive error handling
- [x] Permission validation
- [x] JSDoc documentation

### Ready for Integration
- [x] Controllers can be refactored to use services
- [x] WebSocket handlers can use services
- [x] Unit tests can be written
- [x] Caching can be added
- [x] Rate limiting can be implemented

---

## 📊 Code Statistics

| Component | Files | Functions | LOC |
|-----------|-------|-----------|-----|
| Routes | 3 | 15+ | 50+ |
| Controllers | 3 | 20+ | 300+ |
| Services | 3 | 24 | 600+ |
| Models | 3 | - | 100+ |
| Middleware | 3 | 3 | 100+ |
| Socket | 3 | 5+ | 100+ |
| Utils | 5 | 10+ | 150+ |
| **Total** | **23** | **70+** | **1000+** |

---

## 🎯 Next Priorities

1. **Refactor Controllers** to use services
2. **Add Unit Tests** for services
3. **Update WebSocket** handlers to use services
4. **Add Caching** layer
5. **Implement Rate Limiting**
6. **Add Audit Logging**
7. **Performance Testing**
8. **Production Deployment**

Your chat backend is now well-structured, secure, and ready to scale! 🚀
