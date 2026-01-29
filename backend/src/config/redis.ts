import { createClient } from 'redis';
import { REDIS_URL } from './env.config.ts';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err: unknown) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;