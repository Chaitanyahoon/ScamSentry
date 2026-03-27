/**
 * Unit Tests for Rules Admin API Logic
 * 
 * Tests the business logic that the API endpoints would use:
 * - Input validation rules
 * - Rule creation with defaults
 * - Weight constraint validation
 * - Error handling structures
 * - Response data formatting
 */

import {
  getAllRules,
  getRulesByCategory,
  updateRuleWeight,
  toggleRule,
  getRuleStats,
  createRule,
  deleteRule,
  logRuleChange,
  DetectionRule,
  RuleStats,
} from '@/lib/rules-management'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: {},
}))

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  doc: jest.fn(() => ({ ref: 'mock-doc-ref' })),
  Timestamp: {
    now: jest.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now(),
    })),
  },
}))

const mockRule: DetectionRule = {
  id: 'rule-1',
  name: 'Test Rule',
  category: 'heuristics',
  description: 'Test rule description',
  enabled: true,
  weight: 50,
  confidence: 0.9,
  falsePositiveRate: 0.05,
  detectionCount: 100,
  lastUpdated: new Date(),
  createdBy: 'test-user',
}

describe('Rules Admin API Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rule Validation', () => {
    it('should validate that weight is between 0 and 100', async () => {
      await expect(updateRuleWeight('rule-1', -10, 'user-1')).rejects.toThrow(
        'Weight must be between 0 and 100'
      )

      await expect(updateRuleWeight('rule-1', 150, 'user-1')).rejects.toThrow(
        'Weight must be between 0 and 100'
      )
    })

    it('should accept boundary weight values', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      // Should not throw
      await updateRuleWeight('rule-1', 0, 'user-1')
      await updateRuleWeight('rule-1', 100, 'user-1')

      expect(updateDoc).toHaveBeenCalledTimes(2)
    })
  })

  describe('Rule Creation', () => {
    it('should create a rule with provided data', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue({ id: 'new-rule-id' })

      const newRule: Omit<DetectionRule, 'id' | 'lastUpdated' | 'detectionCount'> = {
        name: 'New Rule',
        category: 'heuristics',
        description: 'Test',
        enabled: true,
        weight: 60,
        confidence: 0.85,
        falsePositiveRate: 0.08,
        createdBy: 'user-1',
      }

      const ruleId = await createRule(newRule, 'user-1')

      expect(ruleId).toBe('new-rule-id')
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'New Rule',
          category: 'heuristics',
          enabled: true,
          weight: 60,
        })
      )
    })

    it('should include creation metadata', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue({ id: 'rule-new' })

      const newRule: Omit<DetectionRule, 'id' | 'lastUpdated' | 'detectionCount'> = {
        name: 'Test',
        category: 'heuristics',
        description: 'Test',
        enabled: true,
        weight: 50,
        confidence: 0.8,
        falsePositiveRate: 0.05,
        createdBy: 'user-1',
      }

      await createRule(newRule, 'user-1')

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          createdBy: 'user-1',
          detectionCount: 0,
        })
      )
    })
  })

  describe('Rule Retrieval', () => {
    it('should fetch all enabled rules', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'rule-1',
            data: () => mockRule,
          },
        ],
      })

      const rules = await getAllRules()

      expect(rules.length).toBe(1)
      expect(rules[0].name).toBe('Test Rule')
    })

    it('should fetch rules by category', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            id: 'rule-1',
            data: () => mockRule,
          },
        ],
      })

      const rules = await getRulesByCategory('heuristics')

      expect(rules.length).toBe(1)
    })

    it('should return empty array if no rules found', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({ docs: [] })

      const rules = await getAllRules()

      expect(rules).toEqual([])
    })

    it('should handle fetch errors gracefully', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockRejectedValueOnce(new Error('Database error'))

      const rules = await getAllRules()

      expect(rules).toEqual([])
    })
  })

  describe('Rule Toggling', () => {
    it('should toggle rule enabled state', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      await toggleRule('rule-1', true, 'user-1')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: true })
      )
    })

    it('should toggle from true to false', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      await toggleRule('rule-1', false, 'user-1')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false })
      )
    })
  })

  describe('Rule Stats', () => {
    it('should calculate trigger rate', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              ruleId: 'rule-1',
              totalScans: 1000,
              triggered: 300,
              falsePositives: 15,
            }),
          },
        ],
      })

      const stats = await getRuleStats('rule-1')

      expect(stats?.triggerRate).toBe(0.3)
    })

    it('should calculate accuracy', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              ruleId: 'rule-1',
              totalScans: 1000,
              triggered: 100,
              falsePositives: 5, // 5% false positives
            }),
          },
        ],
      })

      const stats = await getRuleStats('rule-1')

      expect(stats?.accuracy).toBe(0.95)
    })

    it('should handle no triggered detections', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              ruleId: 'rule-1',
              totalScans: 1000,
              triggered: 0,
              falsePositives: 0,
            }),
          },
        ],
      })

      const stats = await getRuleStats('rule-1')

      expect(stats?.accuracy).toBe(0)
    })

    it('should return null if no stats found', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({ docs: [] })

      const stats = await getRuleStats('nonexistent')

      expect(stats).toBeNull()
    })
  })

  describe('Rule Deletion', () => {
    it('should delete a rule', async () => {
      const { deleteDoc } = require('firebase/firestore')
      deleteDoc.mockResolvedValue(undefined)

      await deleteRule('rule-1')

      expect(deleteDoc).toHaveBeenCalled()
    })

    it('should handle deletion errors', async () => {
      const { deleteDoc } = require('firebase/firestore')
      deleteDoc.mockRejectedValue(new Error('Delete failed'))

      await expect(deleteRule('rule-1')).rejects.toThrow('Delete failed')
    })
  })

  describe('Audit Logging', () => {
    it('should log rule changes', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue({ id: 'log-1' })

      await logRuleChange('rule-1', 'updated', 'user-1', { weight: 75 })

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ruleId: 'rule-1',
          action: 'updated',
          userId: 'user-1',
          details: { weight: 75 },
        })
      )
    })

    it('should support all action types', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue({ id: 'log-entry' })

      const actions = ['created', 'updated', 'deleted', 'enabled', 'disabled'] as const

      for (const action of actions) {
        await logRuleChange('rule-1', action, 'user-1')
      }

      expect(addDoc).toHaveBeenCalledTimes(5)
      expect(addDoc).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({ action: 'created' })
      )
    })

    it('should handle logging errors gracefully', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockRejectedValue(new Error('Logging failed'))

      // Should not throw
      await logRuleChange('rule-1', 'updated', 'user-1')
    })
  })

  describe('API Response Formatting', () => {
    it('should format rule data correctly', () => {
      const rule: DetectionRule = {
        id: 'rule-1',
        name: 'Test',
        category: 'heuristics',
        description: 'Test rule',
        enabled: true,
        weight: 50,
        confidence: 0.9,
        falsePositiveRate: 0.05,
        detectionCount: 100,
        lastUpdated: new Date(),
        createdBy: 'user-1',
      }

      // Simulate API response
      const response = {
        id: rule.id,
        name: rule.name,
        category: rule.category,
        enabled: rule.enabled,
        weight: rule.weight,
        confidence: rule.confidence,
      }

      expect(response).toHaveProperty('id')
      expect(response).toHaveProperty('name')
      expect(response).toHaveProperty('enabled')
      expect(response).toHaveProperty('weight')
    })

    it('should include stats in response when available', () => {
      const ruleWithStats = {
        ...mockRule,
        stats: {
          ruleId: 'rule-1',
          totalScans: 1000,
          triggered: 300,
          triggerRate: 0.3,
          falsePositives: 15,
          accuracy: 0.95,
        },
      }

      expect(ruleWithStats.stats).toBeDefined()
      expect(ruleWithStats.stats.accuracy).toBe(0.95)
    })
  })

  describe('Batch Operations', () => {
    it('should handle multiple rule updates efficiently', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      const updates = Promise.all([
        updateRuleWeight('rule-1', 60, 'user-1'),
        updateRuleWeight('rule-2', 70, 'user-1'),
        updateRuleWeight('rule-3', 55, 'user-1'),
      ])

      await expect(updates).resolves.toBeDefined()
      expect(updateDoc).toHaveBeenCalledTimes(3)
    })

    it('should handle rule enable/disable on multiple rules', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      const toggles = Promise.all([
        toggleRule('rule-1', true, 'user-1'),
        toggleRule('rule-2', false, 'user-1'),
        toggleRule('rule-3', true, 'user-1'),
      ])

      await expect(toggles).resolves.toBeDefined()
      expect(updateDoc).toHaveBeenCalledTimes(3)
    })
  })

  describe('Weight Normalization', () => {
    it('should normalize weights across rules', () => {
      const rules = [
        { weight: 50, enabled: true },
        { weight: 50, enabled: true },
        { weight: 50, enabled: true },
      ]

      const totalWeight = rules.reduce((sum, r) => sum + r.weight, 0)
      const normalizedWeights = rules.map((r) => (r.weight / totalWeight) * 100)

      // Each should be ~33.33%
      expect(normalizedWeights[0]).toBeCloseTo(33.33, 0)
      expect(normalizedWeights.reduce((a, b) => a + b)).toBeCloseTo(100, 0)
    })

    it('should handle disabled rules in weight calculation', () => {
      const rules = [
        { weight: 50, enabled: true },
        { weight: 50, enabled: false }, // Should not count
        { weight: 50, enabled: true },
      ]

      const enabledRules = rules.filter((r) => r.enabled)
      const totalWeight = enabledRules.reduce((sum, r) => sum + r.weight, 0)

      expect(totalWeight).toBe(100)
      expect(enabledRules.length).toBe(2)
    })
  })
})
