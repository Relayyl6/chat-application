import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response } from 'express';
import { createServer } from 'http';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import authRouter from './routes/auth.routes';
import { initializeSocket } from './socket/socket.manager';
import { connectToDatabase } from './config/database';
import { connectRedis } from './config/redis';
import channelRouter from './routes/channel.routes';
import messageRouter from './routes/message.routes';
import { setupDNS } from './utils/dns-resolver';
import { startHealthCheckJob } from './cron/cron';
import { REDIS_URL, API_URL, ALLOWED_ORIGINS, PORT, NODE_ENV } from './config/env.config';
import errorMiddleware from './middleware/error.middleware';
import { sanitizeInputs, rateLimitByUser, validateRequestSize } from './middleware/validation.middleware';
import { swaggerSpec } from './config/swagger';

const app = express();
const httpServer = createServer(app);

// Middleware - Order matters!
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Security and validation middleware
app.use(validateRequestSize(10)); // Limit request size (10MB)
app.use(sanitizeInputs); // XSS prevention and input sanitization
app.use(rateLimitByUser(30, 60000)); // Rate limiting per user (30 req/min)

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

app.get('/api-docs/swagger.json', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/channels', channelRouter);
app.use('/api/messages', messageRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'Backend is up and running',
    environment: NODE_ENV,
    apiUrl: API_URL,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware (must be registered after all routes)
app.use(errorMiddleware);

// Initialize Socket.IO and make it accessible in routes
const io = initializeSocket(httpServer);
app.set('io', io);

// Start server

const startServer = async () => {
  try {
    await connectToDatabase();
    await connectRedis();
    startHealthCheckJob();

    httpServer.listen(PORT, () => {
      console.log(`\n✅ Server running on port ${PORT}`);
      console.log(`📍 API Base URL: ${API_URL}/api`);
      console.log(`📚 API Documentation: ${API_URL}/api-docs`);
      console.log(`🔌 WebSocket enabled via Socket.IO`);
      console.log(`🌍 Environment: ${NODE_ENV}`);
      console.log(`🔐 CORS Origins: ${ALLOWED_ORIGINS.join(', ')}`);
      console.log('\n✨ Ready to accept connections!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

setupDNS();
startServer();