import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Gracefully handles missing env vars during local dev so the app doesn't crash.
// In production (Vercel), these MUST be set in Environment Variables.
const hasRedisConfig = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redisClient = hasRedisConfig ? Redis.fromEnv() : null;

class InMemoryLimiter {
  private hits: Map<string, { count: number; resetTime: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowSec: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSec * 1000;
  }

  async limit(identifier: string): Promise<{ success: boolean }> {
    const now = Date.now();
    const record = this.hits.get(identifier);
    if (!record || now > record.resetTime) {
      this.hits.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { success: true };
    }
    if (record.count >= this.maxRequests) {
      return { success: false };
    }
    record.count++;
    return { success: true };
  }
}

// -- Free Tier Limiter: 5 requests per 60 seconds --
export const freeTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "scamsentry:free",
    })
  : new InMemoryLimiter(5, 60);

// -- Pro Tier Limiter: 60 requests per 60 seconds --
export const proTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      prefix: "scamsentry:pro",
    })
  : new InMemoryLimiter(60, 60);

// -- Enterprise Tier Limiter: 300 requests per 60 seconds --
export const enterpriseTierLimiter = redisClient
  ? new Ratelimit({
      redis: redisClient,
      limiter: Ratelimit.slidingWindow(300, "60 s"),
      prefix: "scamsentry:enterprise",
    })
  : new InMemoryLimiter(300, 60);
