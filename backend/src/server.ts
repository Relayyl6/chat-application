import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes.ts';
import { initializeSocket } from './socket/socket.manager.ts';
import { connectToDatabase } from './config/database.ts';
import { connectRedis } from './config/redis.ts';
import channelRouter from './routes/channel.routes.ts';
import messageRouter from './routes/message.routes.ts';
import { setupDNS } from './utils/dns-resolver.ts';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/channels', channelRouter);
app.use('/api/messages', messageRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, timestamp: new Date().toISOString() });
});

// Initialize Socket.IO and make it accessible in routes
const io = initializeSocket(httpServer);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;



const startServer = async () => {
  try {
    await connectToDatabase();
    await connectRedis();
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

setupDNS();
startServer();