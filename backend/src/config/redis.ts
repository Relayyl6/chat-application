import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false
  }
});

client.on('error', (err) => console.error('Redis error:', err));

export const connectRedis = async () => {
  await client.connect();
  console.log('✅ Connected to Redis');
  return client;
};

export default client;