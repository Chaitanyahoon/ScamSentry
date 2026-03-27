/**
 * Tests for Rule Management System
 * 
 * Tests coverage:
 * - Creating and updating rules
 * - Enabling/disabling rules
 * - Weight adjustment validation
 * - Getting rules by category
 * - Performance metrics tracking
 * - Audit logging
 */

import {
  getAllRules,
  getRulesByCategory,
  createRule,
  updateRule,
  toggleRule,
  updateRuleWeight,
  deleteRule,
  getRuleStats,
  logRuleChange,
  resetRulesToDefaults,
} from '@/lib/rules-management'

// Mock Firebase - must be done before importing
jest.mock('@/lib/firebase', () => ({
  db: {},
}))

jest.mock('firebase/firestore', () => {
  const mockTimestampImpl = {
    now: jest.fn(() => ({
      toDate: () => new Date(),
      toMillis: () => Date.now(),
    })),
    fromDate: jest.fn((date) => ({
      toDate: () => date,
      toMillis: () => date.getTime(),
    })),
  }
  
  return {
    collection: jest.fn(() => ({})),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    doc: jest.fn(() => ({ ref: 'mock-doc-ref' })),
    Timestamp: mockTimestampImpl,
  }
})

const mockRules = [
  {
    id: 'rule-1',
    name: 'Typosquatting Detection',
    category: 'heuristics',
    description: 'Detects common brand misspellings',
    enabled: true,
    weight: 50,
    confidence: 0.92,
    falsePositiveRate: 0.021,
    detectionCount: 2451,
    lastUpdated: new Date(),
    createdBy: 'test-user',
  },
  {
    id: 'rule-2',
    name: 'Credential Harvesting',
    category: 'heuristics',
    description: 'Detects credential harvesting attempts',
    enabled: true,
    weight: 55,
    confidence: 0.88,
    falsePositiveRate: 0.031,
    detectionCount: 1823,
    lastUpdated: new Date(),
    createdBy: 'test-user',
  },
  {
    id: 'rule-3',
    name: 'DNS Analysis',
    category: 'forensics',
    description: 'Analyzes DNS resolution behavior',
    enabled: true,
    weight: 50,
    confidence: 0.85,
    falsePositiveRate: 0.015,
    detectionCount: 3421,
    lastUpdated: new Date(),
    createdBy: 'test-user',
  },
]

const mockStats = {
  ruleId: 'rule-1',
  totalScans: 7000,
  triggered: 2451,
  triggerRate: 0.35,
  falsePositives: 51,
  accuracy: 0.979,
}

describe('Rule Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllRules', () => {
    it('should fetch all enabled rules', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: mockRules.map((rule) => ({
          id: rule.id,
          data: () => ({ ...rule, lastUpdated: { toDate: () => rule.lastUpdated } }),
        })),
      })

      const rules = await getAllRules()
      expect(rules.length).toBe(3)
      expect(rules[0].name).toBe('Typosquatting Detection')
    })

    it('should handle fetch errors gracefully', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockRejectedValueOnce(new Error('Firestore error'))

      const rules = await getAllRules()
      expect(rules).toEqual([])
    })
  })

  describe('getRulesByCategory', () => {
    it('should fetch rules by category', async () => {
      const { getDocs } = require('firebase/firestore')
      const heuristicRules = mockRules.filter((r) => r.category === 'heuristics')
      getDocs.mockResolvedValueOnce({
        docs: heuristicRules.map((rule) => ({
          id: rule.id,
          data: () => ({ ...rule, lastUpdated: { toDate: () => rule.lastUpdated } }),
        })),
      })

      const rules = await getRulesByCategory('heuristics')
      expect(rules.length).toBe(2)
      expect(rules.every((r) => r.category === 'heuristics')).toBe(true)
    })

    it('should return empty array if no rules found', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({ docs: [] })

      const rules = await getRulesByCategory('nonexistent')
      expect(rules).toEqual([])
    })
  })

  describe('createRule', () => {
    it('should create a new rule', async () => {
      const { addDoc } = require('firebase/firestore')
      const mockRef = { id: 'new-rule-123' }
      addDoc.mockResolvedValueOnce(mockRef)

      const newRule = {
        name: 'New Rule',
        category: 'heuristics' as const,
        description: 'A new detection rule',
        enabled: true,
        weight: 50,
        confidence: 0.8,
        falsePositiveRate: 0.05,
        createdBy: 'user-123',
      }

      const ruleId = await createRule(newRule as any, 'user-123')
      expect(ruleId).toBe('new-rule-123')
    })

    it('should include creation metadata', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValueOnce({ id: 'rule-new' })

      const newRule = {
        name: 'Test Rule',
        category: 'heuristics' as const,
        description: 'Test',
        enabled: true,
        weight: 50,
        confidence: 0.8,
        falsePositiveRate: 0.05,
        createdBy: 'user-123',
      }

      await createRule(newRule as any, 'user-123')

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          name: 'Test Rule',
          createdBy: 'user-123',
          detectionCount: 0,
        })
      )
    })
  })

  describe('updateRuleWeight', () => {
    it('should update rule weight', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValueOnce(undefined)

      await updateRuleWeight('rule-1', 75, 'user-123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ weight: 75 })
      )
    })

    it('should reject invalid weights', async () => {
      await expect(updateRuleWeight('rule-1', -10, 'user-123')).rejects.toThrow()
      await expect(updateRuleWeight('rule-1', 150, 'user-123')).rejects.toThrow()
    })

    it('should accept boundary weights', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValueOnce(undefined)

      await updateRuleWeight('rule-1', 0, 'user-123')
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ weight: 0 })
      )

      await updateRuleWeight('rule-1', 100, 'user-123')
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ weight: 100 })
      )
    })
  })

  describe('toggleRule', () => {
    it('should enable a disabled rule', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValueOnce(undefined)

      await toggleRule('rule-1', true, 'user-123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: true })
      )
    })

    it('should disable an enabled rule', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValueOnce(undefined)

      await toggleRule('rule-1', false, 'user-123')

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ enabled: false })
      )
    })
  })

  describe('getRuleStats', () => {
    it('should fetch rule statistics', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [{ data: () => mockStats }],
      })

      const stats = await getRuleStats('rule-1')
      expect(stats).toBeDefined()
      expect(stats?.triggerRate).toBeCloseTo(0.35, 2)
      expect(stats?.accuracy).toBeCloseTo(0.979, 2)
    })

    it('should calculate accuracy correctly', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              ruleId: 'rule-1',
              totalScans: 100,
              triggered: 30,
              falsePositives: 3, // 3/30 = 0.9 accuracy
            }),
          },
        ],
      })

      const stats = await getRuleStats('rule-1')
      expect(stats?.accuracy).toBe(0.9)
    })

    it('should return null if no stats found', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({ docs: [] })

      const stats = await getRuleStats('nonexistent')
      expect(stats).toBeNull()
    })

    it('should handle edge case of no triggered detections', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: [
          {
            data: () => ({
              ruleId: 'rule-1',
              totalScans: 100,
              triggered: 0,
              falsePositives: 0,
            }),
          },
        ],
      })

      const stats = await getRuleStats('rule-1')
      expect(stats?.accuracy).toBe(0) // No detections, assume 0 accuracy
    })
  })

  describe('deleteRule', () => {
    it('should delete a rule', async () => {
      const { deleteDoc } = require('firebase/firestore')
      deleteDoc.mockResolvedValueOnce(undefined)

      await deleteRule('rule-1')
      expect(deleteDoc).toHaveBeenCalled()
    })
  })

  describe('logRuleChange', () => {
    it('should create audit log entry', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValueOnce({ id: 'log-1' })

      await logRuleChange('rule-1', 'updated', 'user-123', { weight: 75 })

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ruleId: 'rule-1',
          action: 'updated',
          userId: 'user-123',
          details: { weight: 75 },
        })
      )
    })

    it('should handle logging errors gracefully', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockRejectedValueOnce(new Error('Logging failed'))

      // Should not throw
      await logRuleChange('rule-1', 'updated', 'user-123')
    })

    it('should support all action types', async () => {
      const { addDoc } = require('firebase/firestore')
      addDoc.mockResolvedValue({ id: 'log-entry' })

      const actions = ['created', 'updated', 'deleted', 'enabled', 'disabled'] as const

      for (const action of actions) {
        await logRuleChange('rule-1', action, 'user-123')
        expect(addDoc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ action })
        )
      }
    })
  })

  describe('resetRulesToDefaults', () => {
    it('should reset all rules to default weight and enabled state', async () => {
      const { getDocs, updateDoc } = require('firebase/firestore')
      getDocs.mockResolvedValueOnce({
        docs: mockRules.map((rule) => ({
          id: rule.id,
          data: () => ({ ...rule, lastUpdated: { toDate: () => rule.lastUpdated } }),
        })),
      })

      updateDoc.mockResolvedValue(undefined)

      await resetRulesToDefaults('user-123')

      // Should be called 3 times (one per rule)
      expect(updateDoc).toHaveBeenCalledTimes(3)
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ weight: 50, enabled: true })
      )
    })
  })

  describe('Rule Weight Calculation', () => {
    it('should handle normalized weights correctly', () => {
      const enabledRules = mockRules.slice(0, 2)
      const totalWeight = enabledRules.reduce((sum, r) => sum + r.weight, 0)
      expect(totalWeight).toBe(105)
      
      const normalizedWeights = enabledRules.map((r) => (r.weight / totalWeight) * 100)
      expect(normalizedWeights[0]).toBeCloseTo(47.6, 1)
      expect(normalizedWeights[1]).toBeCloseTo(52.4, 1)
      expect(normalizedWeights.reduce((a, b) => a + b)).toBeCloseTo(100, 0)
    })
  })

  describe('Performance Metric Calculations', () => {
    it('should calculate trigger rate from statistics', () => {
      const triggerRate = mockStats.triggered / mockStats.totalScans
      expect(triggerRate).toBeCloseTo(0.35, 2)
    })

    it('should identify accuracy trends', () => {
      const accuracies = mockRules.map((r) => r.confidence)
      const avgAccuracy = accuracies.reduce((a, b) => a + b) / accuracies.length
      expect(avgAccuracy).toBeCloseTo(0.883, 2)
    })

    it('should flag high false positive rates', () => {
      const highFPRules = mockRules.filter((r) => r.falsePositiveRate > 0.03)
      expect(highFPRules.length).toBe(1)
      expect(highFPRules[0].name).toBe('Credential Harvesting')
    })
  })

  describe('Error Handling', () => {
    it('should handle network failures gracefully', async () => {
      const { getDocs } = require('firebase/firestore')
      getDocs.mockRejectedValueOnce(new Error('Network error'))

      const rules = await getAllRules()
      expect(rules).toEqual([])
    })

    it('should handle Firestore permission errors', async () => {
      const { getDocs } = require('firebase/firestore')
      const permissionError = new Error('Permission denied')
      getDocs.mockRejectedValueOnce(permissionError)

      const rules = await getAllRules()
      expect(rules).toEqual([])
    })
  })

  describe('Batch Operations', () => {
    it('should handle multiple rule updates efficiently', async () => {
      const { updateDoc } = require('firebase/firestore')
      updateDoc.mockResolvedValue(undefined)

      const updates = Promise.all([
        updateRuleWeight('rule-1', 60, 'user-123'),
        updateRuleWeight('rule-2', 70, 'user-123'),
        updateRuleWeight('rule-3', 55, 'user-123'),
      ])

      await expect(updates).resolves.toBeDefined()
      expect(updateDoc).toHaveBeenCalledTimes(3)
    })
  })
})
