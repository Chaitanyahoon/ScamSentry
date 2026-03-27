/**
 * Admin Rate Limiting Tests
 * 
 * Tests for admin API rate limiting functionality
 */

import {
  checkAdminReadLimit,
  checkAdminWriteLimit,
  checkAdminDeleteLimit,
  formatRateLimitError,
  adminRateLimitConfig,
} from '@/lib/admin-rate-limit'

describe('Admin Rate Limiting', () => {
  describe('Rate Limit Configuration', () => {
    it('should have correct read limit config', () => {
      expect(adminRateLimitConfig.read.requestsPerHour).toBe(100)
      expect(adminRateLimitConfig.read.description).toContain('Read')
    })

    it('should have correct write limit config', () => {
      expect(adminRateLimitConfig.write.requestsPerHour).toBe(50)
      expect(adminRateLimitConfig.write.description).toContain('Write')
    })

    it('should have correct delete limit config', () => {
      expect(adminRateLimitConfig.delete.requestsPerHour).toBe(20)
      expect(adminRateLimitConfig.delete.description).toContain('Delete')
    })

    it('should have correct batch limit config', () => {
      expect(adminRateLimitConfig.batch.requestsPerHour).toBe(30)
      expect(adminRateLimitConfig.batch.description).toContain('Batch')
    })
  })

  describe('formatRateLimitError', () => {
    it('should format error without reset time', () => {
      const message = formatRateLimitError()
      expect(message).toContain('Rate limit exceeded')
    })

    it('should format error with reset time in future', () => {
      const futureTime = Date.now() + 5 * 60 * 1000 // 5 minutes from now
      const message = formatRateLimitError(futureTime)
      expect(message).toContain('Rate limit exceeded')
      expect(message).toContain('try again')
    })

    it('should format error with reset time in past', () => {
      const pastTime = Date.now() - 1000
      const message = formatRateLimitError(pastTime)
      expect(message).toContain('Rate limit exceeded')
    })
  })

  describe('Admin Read Limit', () => {
    it('should allow first read request', async () => {
      const result = await checkAdminReadLimit('test-user-1')
      expect(result.success).toBe(true)
    })
  })

  describe('Admin Write Limit', () => {
    it('should allow first write request', async () => {
      const result = await checkAdminWriteLimit('test-user-2')
      expect(result.success).toBe(true)
    })
  })

  describe('Admin Delete Limit', () => {
    it('should allow first delete request', async () => {
      const result = await checkAdminDeleteLimit('test-user-3')
      expect(result.success).toBe(true)
    })
  })
})
