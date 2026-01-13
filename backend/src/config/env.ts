import { config } from 'dotenv';
import processs from 'process'

config({ path: `.env.${process.env.NODE_ENV}.local` });

export const {
    PORT,
    NODE_ENV,
    MONGODB_URI,
    REDIS_URL,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    ALLOWED_ORIGINS
} = process.env