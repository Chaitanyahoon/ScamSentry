import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Gracefully handles missing env vars during local dev so the app doesn't crash.
// In production (Vercel), these MUST be set in Environment Variables.
const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// -- Free Tier Limiter: 5 requests per 60 seconds per IP --
export const freeTierLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'scamsentry:free',
    })
  : null; // null → falls back to in-memory map in the route handler

// -- Enterprise Tier Limiter: 300 requests per 60 seconds per API key --
export const enterpriseLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(300, '60 s'),
      prefix: 'scamsentry:enterprise',
    })
  : null;
