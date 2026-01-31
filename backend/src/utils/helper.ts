import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.config.ts';

const secretKey = process.env.JWT_SECRET || 'your_secret_key'; // Use .env in production

export const generateToken = (userId: any) => {
  return jwt.sign(
    { userId },
    secretKey,
    { expiresIn: '7d' }
  );
};