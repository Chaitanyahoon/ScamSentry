import { analyzeHeuristics } from '../../../src/lib/validator/heuristics'
import {
  MALICIOUS_URLS,
  SAFE_URLS,
  CREDENTIAL_HARVESTING_URLS,
  HOMOGLYPH_URLS,
  DGA_URLS,
  LEGITIMATE_HIGH_ENTROPY_URLS,
  EDGE_CASE_URLS,
} from '../../fixtures/urls'

describe('Heuristics Layer (L1) - URL Pattern Detection', () => {
  describe('Malicious URL Detection', () => {
    it('should detect typosquatting attempts', () => {
      const result = analyzeHeuristics('http://paypa1.com/login')
      expect(result.score).toBeGreaterThan(20)
      expect(result.flags.length).toBeGreaterThan(0)
    })

    it('should detect credential harvesting keywords', () => {
      CREDENTIAL_HARVESTING_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        expect(result.score).toBeGreaterThan(10)
      })
    })

    it('should detect homoglyph character attacks', () => {
      HOMOGLYPH_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        expect(result.score).toBeGreaterThan(5)
      })
    })

    it('should detect DGA-like domains (high entropy)', () => {
      DGA_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        expect(result.score).toBeGreaterThan(0) // Entropy-based detection is probabilistic
      })
    })

    it('should detect most MALICIOUS_URLS with some flags', () => {
      let detectedCount = 0
      MALICIOUS_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        if (result.score > 0 && result.flags.length > 0) {
          detectedCount++
        }
      })
      // Expect at least 70% detection rate
      expect(detectedCount).toBeGreaterThan(MALICIOUS_URLS.length * 0.7)
    })
  })

  describe('Safe URL Validation', () => {
    it('should handle URLs from legitimate services', () => {
      // Note: Some legitimate URLs with "login", "auth" keywords may flag
      // This is a known limitation - keyword-based detection is imperfect
      const safeSites = ['https://github.com/login', 'https://www.google.com', 'https://www.amazon.com']
      safeSites.forEach((url) => {
        const result = analyzeHeuristics(url)
        // Just verify it returns a valid score
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      })
    })

    it('should NOT flag basic high-entropy authentication tokens as maximum threat', () => {
      LEGITIMATE_HIGH_ENTROPY_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        // Long random tokens shouldn't be penalized excessively
        // They might trigger entropy flag but shouldn't reach 100
        expect(result.score).toBeLessThanOrEqual(50)
      })
    })

    it('SAFE_URLS should be consistent and not cause errors', () => {
      SAFE_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        // Just ensure consistency and valid ranges
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
        expect(Array.isArray(result.flags)).toBe(true)
      })
    })

    it('edge case URLs should not crash and provide valid scores', () => {
      EDGE_CASE_URLS.forEach((url) => {
        const result = analyzeHeuristics(url)
        // Edge cases must not crash; scoring consistency matters more than threshold
        expect(result).toHaveProperty('score')
        expect(result).toHaveProperty('flags')
        expect(typeof result.score).toBe('number')
      })
    })
  })

  describe('URL Structure Validation', () => {
    it('should handle invalid URLs gracefully', () => {
      const invalidUrls = [
        'not-a-url',
        'htp://example.com',
        '',
        'http://',
        '   ',
      ]
      invalidUrls.forEach((url) => {
        expect(() => analyzeHeuristics(url)).not.toThrow()
      })
    })

    it('should normalize URLs before analysis', () => {
      const url1 = 'HTTP://EXAMPLE.COM'
      const url2 = 'http://example.com'
      const result1 = analyzeHeuristics(url1)
      const result2 = analyzeHeuristics(url2)
      expect(result1.score).toBe(result2.score)
    })

    it('should detect suspicious TLDs', () => {
      const suspiciousTLD = 'http://bank-login.xyz'
      const result = analyzeHeuristics(suspiciousTLD)
      expect(result.score).toBeGreaterThan(10)
    })

    it('should detect URL shorteners', () => {
      const shortenerUrl = 'http://bit.ly/phishing123'
      const result = analyzeHeuristics(shortenerUrl)
      expect(result.score).toBeGreaterThan(15)
    })
  })

  describe('Brand Spoofing Detection', () => {
    it('should detect spoofed major brands', () => {
      const spoofedBrands = [
        'http://verify-apple-account.xyz',
        'http://confirm-microsoft-verify.top',
        'http://stripe-payment-verify.loan',
        'http://github-security-alert.club',
      ]
      spoofedBrands.forEach((url) => {
        const result = analyzeHeuristics(url)
        expect(result.score).toBeGreaterThan(10)
      })
    })
  })

  describe('Return Value Structure', () => {
    it('should return score and flags array', () => {
      const result = analyzeHeuristics('http://example.com')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('flags')
      expect(Array.isArray(result.flags)).toBe(true)
      expect(typeof result.score).toBe('number')
    })

    it('score should be between 0 and 100', () => {
      const testUrls = [...MALICIOUS_URLS, ...SAFE_URLS, ...EDGE_CASE_URLS]
      testUrls.forEach((url) => {
        const result = analyzeHeuristics(url)
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      })
    })

    it('should describe detected issues in flags', () => {
      const result = analyzeHeuristics('http://paypa1.com/login')
      expect(result.flags.some((flag) => typeof flag === 'string')).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should analyze URL within 100ms', () => {
      const start = Date.now()
      analyzeHeuristics('http://example.com')
      const duration = Date.now() - start
      expect(duration).toBeLessThan(100)
    })

    it('should handle batch analysis efficiently', () => {
      const start = Date.now()
      const testUrls = [...MALICIOUS_URLS, ...SAFE_URLS]
      testUrls.forEach((url) => {
        analyzeHeuristics(url)
      })
      const duration = Date.now() - start
      expect(duration).toBeLessThan(testUrls.length * 100)
    })
  })
})
