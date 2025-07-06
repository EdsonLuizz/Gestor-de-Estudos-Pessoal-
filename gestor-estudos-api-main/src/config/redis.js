import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  username: process.env.REDIS_USER || 'default',
  password: process.env.REDIS_PASS || undefined,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient.connect().catch(console.error);

export default redisClient;
