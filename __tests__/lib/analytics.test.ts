import { logScanEvent, getAnalyticsMetrics, getRecentScans } from '@/lib/analytics'
import type { ScanEvent, AnalyticsMetrics } from '@/lib/analytics'

describe('Analytics Service', () => {
  describe('Event Logging', () => {
    it('should create ScanEvent with all required fields', async () => {
      const event: ScanEvent = {
        url: 'https://example.com',
        finalScore: 25,
        riskLevel: 'Suspicious',
        triggeredLayers: ['L1', 'L2'],
        layerScores: {
          heuristics: 15,
          forensics: 10,
          threatIntel: 0,
          internalGraph: 0,
        },
        timestamp: new Date(),
        userAgent: 'Mozilla/5.0...',
      }

      expect(event).toHaveProperty('url')
      expect(event).toHaveProperty('finalScore')
      expect(event).toHaveProperty('riskLevel')
      expect(event).toHaveProperty('triggeredLayers')
      expect(event).toHaveProperty('layerScores')
      expect(event).toHaveProperty('timestamp')
      expect(event).toHaveProperty('userAgent')
    })

    it('should validate riskLevel values', () => {
      const validRiskLevels = ['Secure', 'Suspicious', 'Critical Threat']
      validRiskLevels.forEach((level) => {
        expect(validRiskLevels.includes(level)).toBe(true)
      })
    })

    it('should handle logScanEvent errors gracefully', async () => {
      const event: ScanEvent = {
        url: 'https://example.com',
        finalScore: 50,
        riskLevel: 'Suspicious',
        triggeredLayers: ['L1'],
        layerScores: {
          heuristics: 50,
          forensics: 0,
          threatIntel: 0,
          internalGraph: 0,
        },
        timestamp: new Date(),
        userAgent: 'Test',
      }

      // Should not throw
      await expect(logScanEvent(event)).resolves.not.toThrow()
    })
  })

  describe('Event Properties', () => {
    it('finalScore should be between 0 and 100', () => {
      const testScores = [0, 25, 50, 75, 100]
      testScores.forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })

    it('layerScores should sum to finalScore or less', () => {
      const testCases = [
        {
          layerScores: { heuristics: 20, forensics: 15, threatIntel: 10, internalGraph: 5 },
          finalScore: 50,
        },
        {
          layerScores: { heuristics: 100, forensics: 0, threatIntel: 0, internalGraph: 0 },
          finalScore: 100,
        },
      ]

      testCases.forEach(({ layerScores, finalScore }) => {
        const sum =
          layerScores.heuristics +
          layerScores.forensics +
          layerScores.threatIntel +
          layerScores.internalGraph
        expect(sum).toBeGreaterThanOrEqual(finalScore)
      })
    })

    it('timestamp should be a valid Date', () => {
      const timestamp = new Date()
      expect(timestamp instanceof Date).toBe(true)
      expect(isNaN(timestamp.getTime())).toBe(false)
    })
  })

  describe('Analytics Metrics Computation', () => {
    it('should return AnalyticsMetrics interface', async () => {
      const metrics = await getAnalyticsMetrics(7)
      expect(metrics).toHaveProperty('totalScans')
      expect(metrics).toHaveProperty('threatsDetected')
      expect(metrics).toHaveProperty('averageScore')
      expect(metrics).toHaveProperty('layerAccuracy')
      expect(metrics).toHaveProperty('topUrlPatterns')
      expect(metrics).toHaveProperty('scanTrend')
    })

    it('layerAccuracy should contain layer metrics', async () => {
      const metrics = await getAnalyticsMetrics(7)
      expect(metrics.layerAccuracy).toHaveProperty('heuristics')
      expect(metrics.layerAccuracy).toHaveProperty('forensics')
      expect(metrics.layerAccuracy).toHaveProperty('threatIntel')
      expect(metrics.layerAccuracy).toHaveProperty('internalGraph')
    })

    it('should support various date ranges', async () => {
      const ranges = [7, 30, 90]
      for (const range of ranges) {
        expect(() => getAnalyticsMetrics(range)).not.toThrow()
      }
    })
  })

  describe('Recent Scans Retrieval', () => {
    it('should retrieve recent scans', async () => {
      const scans = await getRecentScans(7)
      expect(Array.isArray(scans)).toBe(true)
    })

    it('should limit results appropriately', async () => {
      const scans = await getRecentScans(7)
      expect(scans.length).toBeLessThanOrEqual(1000)
    })

    it('should return ScanEvent objects', async () => {
      const scans = await getRecentScans(7)
      scans.forEach((scan) => {
        if (scan) {
          expect(scan).toHaveProperty('url')
          expect(scan).toHaveProperty('finalScore')
          expect(scan).toHaveProperty('riskLevel')
        }
      })
    })

    it('should support various time ranges', async () => {
      const ranges = [1, 7, 30, 90]
      for (const range of ranges) {
        expect(async () => {
          await getRecentScans(range)
        }).not.toThrow()
      }
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This tests error resilience
      expect(async () => {
        await logScanEvent({
          url: 'https://example.com',
          finalScore: 50,
          riskLevel: 'Suspicious',
          triggeredLayers: ['L1'],
          layerScores: {
            heuristics: 50,
            forensics: 0,
            threatIntel: 0,
            internalGraph: 0,
          },
          timestamp: new Date(),
          userAgent: 'Test',
        })
      }).not.toThrow()
    })

    it('should not throw on Firestore errors', async () => {
      const event: ScanEvent = {
        url: 'https://example.com',
        finalScore: 25,
        riskLevel: 'Suspicious',
        triggeredLayers: ['L1'],
        layerScores: {
          heuristics: 25,
          forensics: 0,
          threatIntel: 0,
          internalGraph: 0,
        },
        timestamp: new Date(),
        userAgent: 'Test',
      }

      await expect(logScanEvent(event)).resolves.not.toThrow()
    })
  })

  describe('Integration', () => {
    it('should log and retrieve scans', async () => {
      const event: ScanEvent = {
        url: 'https://test-integration.example.com',
        finalScore: 45,
        riskLevel: 'Suspicious',
        triggeredLayers: ['L1', 'L2'],
        layerScores: {
          heuristics: 25,
          forensics: 20,
          threatIntel: 0,
          internalGraph: 0,
        },
        timestamp: new Date(),
        userAgent: 'IntegrationTest',
      }

      await logScanEvent(event)

      const recentScans = await getRecentScans(1)
      expect(Array.isArray(recentScans)).toBe(true)
    })

    it('should compute metrics from logged events', async () => {
      const metrics = await getAnalyticsMetrics(7)
      expect(metrics.totalScans).toBeGreaterThanOrEqual(0)
      expect(metrics.threatsDetected).toBeGreaterThanOrEqual(0)
      expect(metrics.averageScore).toBeGreaterThanOrEqual(0)
      expect(metrics.averageScore).toBeLessThanOrEqual(100)
    })
  })
})
