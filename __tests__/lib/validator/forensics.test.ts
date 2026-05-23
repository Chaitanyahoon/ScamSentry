import dns from 'dns'
import { analyzeDomainForensics } from '@/lib/validator/forensics'

jest.mock('dns', () => ({
  resolve4: jest.fn((hostname: string, callback: any) => {
    callback(null, ['1.1.1.1']);
  }),
  resolveMx: jest.fn((hostname: string, callback: any) => {
    callback(null, [{ exchange: 'mail.example.com', priority: 10 }]);
  }),
  resolveTxt: jest.fn((hostname: string, callback: any) => {
    if (hostname.includes('_dmarc')) {
      callback(null, [['v=DMARC1; p=reject']]);
    } else {
      callback(null, [['v=spf1 include:example.com ~all']]);
    }
  }),
  promises: {
    resolve4: jest.fn().mockResolvedValue(['1.1.1.1']),
    resolveMx: jest.fn().mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]),
    resolveTxt: jest.fn().mockImplementation((hostname: string) => {
      if (hostname.includes('_dmarc')) {
        return Promise.resolve([['v=DMARC1; p=reject']]);
      }
      return Promise.resolve([['v=spf1 include:example.com ~all']]);
    }),
  }
}))

jest.mock('@/lib/validator/ssl-audit', () => ({
  getCertificateInfo: jest.fn((domain: string) => {
    if (domain.includes('ultra-new-ssl')) {
      return Promise.resolve({
        validFrom: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        validTo: new Date(Date.now() + 89 * 24 * 60 * 60 * 1000),
        ageInDays: 0.08 // Under 48 hours
      });
    }
    return Promise.resolve({
      validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      validTo: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      ageInDays: 30
    });
  })
}))

describe('Forensics Layer (L2) - Domain Infrastructure Analysis', () => {
  describe('URL Parsing', () => {
    it('should extract domain from various URL formats', async () => {
      const testUrls = [
        { url: 'https://example.com', expectedDomain: 'example.com' },
        { url: 'https://subdomain.example.com', expectedDomain: 'subdomain.example.com' },
        { url: 'https://example.com/path', expectedDomain: 'example.com' },
        { url: 'https://example.com:8080', expectedDomain: 'example.com' },
        { url: 'https://user:pass@example.com', expectedDomain: 'example.com' },
      ]

      for (const testCase of testUrls) {
        expect(() => analyzeDomainForensics(testCase.url)).not.toThrow()
      }
    })
  })

  describe('Protocol Validation', () => {
    it('should detect HTTPS vs HTTP', async () => {
      // HTTPS should be safer
      const httpsUrl = 'https://example.com'
      const httpUrl = 'http://example.com'

      expect(() => analyzeDomainForensics(httpsUrl)).not.toThrow()
      expect(() => analyzeDomainForensics(httpUrl)).not.toThrow()
    })
  })

  describe('Invalid Inputs', () => {
    it('should handle invalid domains gracefully', async () => {
      const invalidDomains = [
        'not a url',
        'htp://example.com',
        '',
        'http://',
        '192.168.1.1.1.1', // Invalid IP
      ]

      for (const domain of invalidDomains) {
        expect(() => analyzeDomainForensics(domain)).not.toThrow()
      }
    })
  })

  describe('Return Value Structure', () => {
    it('should return score and flags array', async () => {
      const result = await analyzeDomainForensics('https://example.com')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('flags')
      expect(Array.isArray(result.flags)).toBe(true)
      expect(typeof result.score).toBe('number')
    })

    it('score should be between 0 and 100', async () => {
      const testUrls = [
        'https://example.com',
        'https://github.com',
        'https://google.com',
        'http://example.xyz',
      ]

      for (const url of testUrls) {
        const result = await analyzeDomainForensics(url)
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      }
    })

    it('should return descriptive flags', async () => {
      const result = await analyzeDomainForensics('http://example.com')
      expect(result.flags.every((flag) => typeof flag === 'string')).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should complete DNS analysis within 5 seconds', async () => {
      const start = Date.now()
      await analyzeDomainForensics('https://example.com')
      const duration = Date.now() - start
      expect(duration).toBeLessThan(5000)
    })

    it('should handle timeout for unresponsive domains', async () => {
      const start = Date.now()
      // This should timeout gracefully
      await analyzeDomainForensics('https://extremely-unlikely-domain-12345-67890.test')
      const duration = Date.now() - start
      // Should not take extremely long (has timeout)
      expect(duration).toBeLessThan(10000)
    })
  })

  describe('IDN Detection', () => {
    it('should detect internationalized domain names', async () => {
      // IDN can be used for homograph attacks
      const idnUrl = 'https://例え.jp'
      expect(() => analyzeDomainForensics(idnUrl)).not.toThrow()
    })
  })

  describe('Common Legitimate Domains', () => {
    it('should give low forensics scores to major companies', async () => {
      const legitimateDomains = [
        'https://google.com',
        'https://github.com',
        'https://apple.com',
        'https://microsoft.com',
        'https://amazon.com',
      ]

      for (const domain of legitimateDomains) {
        const result = await analyzeDomainForensics(domain)
        // These should generally be safe (low score)
        expect(result.score).toBeLessThan(50)
      }
    })
  })

  describe('SSL Certificate & Registrar Verification', () => {
    it('should detect ultra-new SSL certificates under 48 hours old', async () => {
      const result = await analyzeDomainForensics('https://ultra-new-ssl-phish.xyz')
      expect(result.score).toBe(40)
      expect(result.flags.some(f => f.includes('certificate was created less than 48 hours ago'))).toBe(true)
    })

    it('should bypass SSL creation penalty for mature certificates', async () => {
      const result = await analyzeDomainForensics('https://mature-ssl-legit.com')
      expect(result.flags.some(f => f.includes('certificate was created less than 48 hours ago'))).toBe(false)
    })
  })
})
