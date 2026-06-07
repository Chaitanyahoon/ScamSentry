import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Gracefully handles missing env vars during local dev so the app doesn't crash.
// In production (Vercel), these MUST be set in Environment Variables.
const hasRedisConfig =
  !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redisClient = hasRedisConfig ? Redis.fromEnv() : null;

// -- Free Tier Limiter: 5 requests per 60 seconds --
export const freeTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, '60 s'),
      prefix: 'scamsentry:free',
    })
  : null;

// -- Pro Tier Limiter: 60 requests per 60 seconds --
export const proTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix: 'scamsentry:pro',
    })
  : null;

// -- Enterprise Tier Limiter: 300 requests per 60 seconds --
export const enterpriseTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(300, '60 s'),
      prefix: 'scamsentry:enterprise',
    })
  : null;
