import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

export const connectRedis = async () => {
  if (client) return client;

  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set');
  }

  client = createClient({ url: redisUrl }) as RedisClientType;

  client.on('error', (err) => console.error('Redis error:', err));

  await client.connect();
  console.log('✅ Connected to Redis');
  return client;
};

export const getRedisClient = (): RedisClientType => {
  if (!client) throw new Error('Redis not initialized. Call connectRedis() first.');
  return client;
};

export default getRedisClient;