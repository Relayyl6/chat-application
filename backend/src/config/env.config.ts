import { config } from 'dotenv';

config({ path: `.env.local` });

// API Configuration
export const API_URL = process.env.API_URL || 'http://localhost:3000';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

// Server Configuration
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;

// Database
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chat_app';
export const DB_NAME = process.env.DB_NAME || 'chat_app';

// Redis
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// JWT
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// CORS Origins
const originsEnv = process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001';
export const ALLOWED_ORIGINS = originsEnv.split(',').map(origin => origin.trim());

// Validation
if (!JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET is not defined - using default for development only');
}