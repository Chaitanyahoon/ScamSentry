/**
 * Admin API Rate Limiting
 * 
 * Implements strict rate limiting for sensitive admin operations
 * - Per-user based on authenticated admin UID
 * - Different limits for different operation types
 * - Prevents abuse of administrative privileges
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasRedisConfig =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN

// === Admin Operation Rate Limiters ===

/**
 * Read Operations: Higher limit (viewing rules, analytics, etc.)
 * 100 requests per hour per admin user
 */
export const adminReadLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, '1 h'),
      prefix: 'scamsentry:admin:read',
    })
  : null

/**
 * Write Operations: Medium limit (creating, updating rules)
 * 50 requests per hour per admin user
 */
export const adminWriteLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(50, '1 h'),
      prefix: 'scamsentry:admin:write',
    })
  : null

/**
 * Delete Operations: Strictest limit (sensitive operations)
 * 20 requests per hour per admin user
 */
export const adminDeleteLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'scamsentry:admin:delete',
    })
  : null

/**
 * Batch Operations: Moderate limit (batch enable/disable)
 * 30 requests per hour per admin user
 */
export const adminBatchLimiter = hasRedisConfig
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      prefix: 'scamsentry:admin:batch',
    })
  : null

// === In-Memory Fallback for Local Development ===

interface LocalRateLimitData {
  count: number
  resetTime: number
}

const localReadLimitMap = new Map<string, LocalRateLimitData>()
const localWriteLimitMap = new Map<string, LocalRateLimitData>()
const localDeleteLimitMap = new Map<string, LocalRateLimitData>()
const localBatchLimitMap = new Map<string, LocalRateLimitData>()

const LOCAL_READ_LIMIT = 100
const LOCAL_WRITE_LIMIT = 50
const LOCAL_DELETE_LIMIT = 20
const LOCAL_BATCH_LIMIT = 30
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

/**
 * Check admin read operation rate limit
 * Returns { success: true } if within limit, { success: false, resetTime } if exceeded
 */
export async function checkAdminReadLimit(
  adminUid: string
): Promise<{ success: boolean; resetTime?: number }> {
  if (adminReadLimiter) {
    const result = await adminReadLimiter.limit(adminUid)
    return {
      success: result.success,
      resetTime: result.reset,
    }
  }

  // Local dev fallback
  const now = Date.now()
  const key = `read:${adminUid}`
  const data = localReadLimitMap.get(key)

  if (!data || now > data.resetTime) {
    localReadLimitMap.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { success: true }
  }

  if (data.count >= LOCAL_READ_LIMIT) {
    return {
      success: false,
      resetTime: data.resetTime,
    }
  }

  data.count++
  return { success: true }
}

/**
 * Check admin write operation rate limit (POST, PUT with non-delete operations)
 * Returns { success: true } if within limit, { success: false, resetTime } if exceeded
 */
export async function checkAdminWriteLimit(
  adminUid: string
): Promise<{ success: boolean; resetTime?: number }> {
  if (adminWriteLimiter) {
    const result = await adminWriteLimiter.limit(adminUid)
    return {
      success: result.success,
      resetTime: result.reset,
    }
  }

  // Local dev fallback
  const now = Date.now()
  const key = `write:${adminUid}`
  const data = localWriteLimitMap.get(key)

  if (!data || now > data.resetTime) {
    localWriteLimitMap.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { success: true }
  }

  if (data.count >= LOCAL_WRITE_LIMIT) {
    return {
      success: false,
      resetTime: data.resetTime,
    }
  }

  data.count++
  return { success: true }
}

/**
 * Check admin delete operation rate limit (strictest)
 * Returns { success: true } if within limit, { success: false, resetTime } if exceeded
 */
export async function checkAdminDeleteLimit(
  adminUid: string
): Promise<{ success: boolean; resetTime?: number }> {
  if (adminDeleteLimiter) {
    const result = await adminDeleteLimiter.limit(adminUid)
    return {
      success: result.success,
      resetTime: result.reset,
    }
  }

  // Local dev fallback
  const now = Date.now()
  const key = `delete:${adminUid}`
  const data = localDeleteLimitMap.get(key)

  if (!data || now > data.resetTime) {
    localDeleteLimitMap.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { success: true }
  }

  if (data.count >= LOCAL_DELETE_LIMIT) {
    return {
      success: false,
      resetTime: data.resetTime,
    }
  }

  data.count++
  return { success: true }
}

/**
 * Check admin batch operation rate limit
 * Returns { success: true } if within limit, { success: false, resetTime } if exceeded
 */
export async function checkAdminBatchLimit(
  adminUid: string
): Promise<{ success: boolean; resetTime?: number }> {
  if (adminBatchLimiter) {
    const result = await adminBatchLimiter.limit(adminUid)
    return {
      success: result.success,
      resetTime: result.reset,
    }
  }

  // Local dev fallback
  const now = Date.now()
  const key = `batch:${adminUid}`
  const data = localBatchLimitMap.get(key)

  if (!data || now > data.resetTime) {
    localBatchLimitMap.set(key, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return { success: true }
  }

  if (data.count >= LOCAL_BATCH_LIMIT) {
    return {
      success: false,
      resetTime: data.resetTime,
    }
  }

  data.count++
  return { success: true }
}

/**
 * Format rate limit error response
 */
export function formatRateLimitError(resetTime?: number): string {
  if (!resetTime) {
    return 'Rate limit exceeded. Please try again later.'
  }

  const now = Date.now()
  const secondsUntilReset = Math.ceil((resetTime - now) / 1000)

  if (secondsUntilReset <= 0) {
    return 'Rate limit exceeded. Please try again.'
  }

  const minutes = Math.ceil(secondsUntilReset / 60)
  return `Rate limit exceeded. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`
}

/**
 * Rate limit configuration for reference
 */
export const adminRateLimitConfig = {
  read: {
    requestsPerHour: 100,
    description: 'Read operations (viewing rules, analytics)',
  },
  write: {
    requestsPerHour: 50,
    description: 'Write operations (creating, updating rules)',
  },
  delete: {
    requestsPerHour: 20,
    description: 'Delete operations (removing rules)',
  },
  batch: {
    requestsPerHour: 30,
    description: 'Batch operations (enable/disable multiple rules)',
  },
}
