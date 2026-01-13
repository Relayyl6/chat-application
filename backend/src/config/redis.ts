import { createClient } from 'redis';
import { REDIS_URL } from './env.ts';

const redisClient = createClient({
  url: REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Connected'));

export const connectRedis = async () => {
  await redisClient.connect();
};

export default redisClient;