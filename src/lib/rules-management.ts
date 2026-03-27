/**
 * Rule Management Service
 * 
 * Manages heuristic detection rules configuration stored in Firestore.
 * Allows enabling/disabling rules, adjusting weights, and tracking performance.
 */

import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, Timestamp } from 'firebase/firestore'
import { db } from './firebase'

export interface DetectionRule {
  id?: string
  name: string
  category: 'heuristics' | 'forensics' | 'threatIntel' | 'internalGraph'
  pattern?: string
  description: string
  enabled: boolean
  weight: number // 0-100, contribution to layer score
  confidence: number // 0-1, accuracy estimation
  falsePositiveRate: number // 0-1
  detectionCount: number
  lastUpdated: Date
  createdBy: string
}

export interface RuleStats {
  ruleId: string
  totalScans: number
  triggered: number
  triggerRate: number
  falsePositives: number
  accuracy: number
}

export interface RuleConfig {
  id?: string
  layerName: string
  enabled: boolean
  rules: DetectionRule[]
  totalWeight: number
  lastModified: Date
  modifiedBy: string
}

/**
 * Get all active detection rules
 */
export async function getAllRules(): Promise<DetectionRule[]> {
  try {
    const q = query(collection(db, 'detection_rules'), where('enabled', '==', true))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: (doc.data().lastUpdated as any)?.toDate?.() || new Date(),
    })) as DetectionRule[]
  } catch (error) {
    console.error('Failed to fetch rules:', error)
    return []
  }
}

/**
 * Get rules by category
 */
export async function getRulesByCategory(category: string): Promise<DetectionRule[]> {
  try {
    const q = query(
      collection(db, 'detection_rules'),
      where('category', '==', category),
      where('enabled', '==', true)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      lastUpdated: (doc.data().lastUpdated as any)?.toDate?.() || new Date(),
    })) as DetectionRule[]
  } catch (error) {
    console.error(`Failed to fetch rules for ${category}:`, error)
    return []
  }
}

/**
 * Create a new detection rule
 */
export async function createRule(rule: Omit<DetectionRule, 'id' | 'lastUpdated' | 'detectionCount'>, userId: string): Promise<string> {
  try {
    const newRule = {
      ...rule,
      detectionCount: 0,
      lastUpdated: Timestamp.now(),
      createdBy: userId,
    }
    const docRef = await addDoc(collection(db, 'detection_rules'), newRule)
    return docRef.id
  } catch (error) {
    console.error('Failed to create rule:', error)
    throw error
  }
}

/**
 * Update an existing rule
 */
export async function updateRule(ruleId: string, updates: Partial<DetectionRule>, userId: string): Promise<void> {
  try {
    const ruleRef = doc(db, 'detection_rules', ruleId)
    await updateDoc(ruleRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
      modifiedBy: userId,
    })
  } catch (error) {
    console.error('Failed to update rule:', error)
    throw error
  }
}

/**
 * Toggle rule enabled/disabled
 */
export async function toggleRule(ruleId: string, enabled: boolean, userId: string): Promise<void> {
  try {
    await updateRule(ruleId, { enabled }, userId)
  } catch (error) {
    console.error('Failed to toggle rule:', error)
    throw error
  }
}

/**
 * Update rule weight (0-100)
 */
export async function updateRuleWeight(ruleId: string, weight: number, userId: string): Promise<void> {
  if (weight < 0 || weight > 100) {
    throw new Error('Weight must be between 0 and 100')
  }
  try {
    await updateRule(ruleId, { weight }, userId)
  } catch (error) {
    console.error('Failed to update rule weight:', error)
    throw error
  }
}

/**
 * Delete a rule
 */
export async function deleteRule(ruleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'detection_rules', ruleId))
  } catch (error) {
    console.error('Failed to delete rule:', error)
    throw error
  }
}

/**
 * Get rule performance statistics
 */
export async function getRuleStats(ruleId: string): Promise<RuleStats | null> {
  try {
    const statsQuery = query(collection(db, 'rule_stats'), where('ruleId', '==', ruleId))
    const snapshot = await getDocs(statsQuery)
    
    if (snapshot.empty) {
      return null
    }

    const data = snapshot.docs[0].data()
    const triggered = data.triggered || 0
    const totalScans = data.totalScans || 1
    const falsePositives = data.falsePositives || 0
    const triggerRate = triggered / Math.max(totalScans, 1)
    // If rule never triggered, accuracy is 0 (rule not useful for detection)
    const accuracy = triggered === 0 ? 0 : 1 - (falsePositives / triggered)

    return {
      ruleId,
      totalScans,
      triggered,
      triggerRate,
      falsePositives,
      accuracy: Math.max(0, accuracy),
    }
  } catch (error) {
    console.error('Failed to fetch rule stats:', error)
    return null
  }
}

/**
 * Enable all rules in a category
 */
export async function enableCategoryRules(category: string, userId: string): Promise<void> {
  try {
    const rules = await getRulesByCategory(category)
    const promises = rules.map((rule) => updateRule(rule.id!, { enabled: true }, userId))
    await Promise.all(promises)
  } catch (error) {
    console.error(`Failed to enable rules for ${category}:`, error)
    throw error
  }
}

/**
 * Disable all rules in a category
 */
export async function disableCategoryRules(category: string, userId: string): Promise<void> {
  try {
    const rules = await getRulesByCategory(category)
    const promises = rules.map((rule) => updateRule(rule.id!, { enabled: false }, userId))
    await Promise.all(promises)
  } catch (error) {
    console.error(`Failed to disable rules for ${category}:`, error)
    throw error
  }
}

/**
 * Reset all rules to default configuration
 */
export async function resetRulesToDefaults(userId: string): Promise<void> {
  try {
    const allRules = await getAllRules()
    const promises = allRules.map((rule) =>
      updateRule(rule.id!, {
        weight: 50, // Default weight
        enabled: true,
      }, userId)
    )
    await Promise.all(promises)
  } catch (error) {
    console.error('Failed to reset rules:', error)
    throw error
  }
}

/**
 * Get layer configuration
 */
export async function getLayerConfig(layerName: string): Promise<RuleConfig | null> {
  try {
    const configQuery = query(
      collection(db, 'layer_configs'),
      where('layerName', '==', layerName)
    )
    const snapshot = await getDocs(configQuery)
    
    if (snapshot.empty) {
      return null
    }

    const data = snapshot.docs[0].data()
    const rules = await getRulesByCategory(layerName)
    
    return {
      id: snapshot.docs[0].id,
      layerName,
      enabled: data.enabled || true,
      rules,
      totalWeight: rules.reduce((sum, r) => sum + (r.weight || 0), 0),
      lastModified: (data.lastModified as any)?.toDate?.() || new Date(),
      modifiedBy: data.modifiedBy || 'system',
    }
  } catch (error) {
    console.error(`Failed to fetch ${layerName} config:`, error)
    return null
  }
}

/**
 * Create audit log for rule changes
 */
export async function logRuleChange(
  ruleId: string,
  action: 'created' | 'updated' | 'deleted' | 'enabled' | 'disabled',
  userId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    await addDoc(collection(db, 'rule_audit_log'), {
      ruleId,
      action,
      userId,
      timestamp: Timestamp.now(),
      details: details || {},
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
