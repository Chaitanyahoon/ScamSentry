import { useState, useCallback, useEffect } from 'react'
import { DetectionRule, RuleStats } from '@/lib/rules-management'

interface UseRulesReturn {
  rules: (DetectionRule & { stats?: RuleStats | null })[]
  loading: boolean
  error: string | null
  updateWeight: (ruleId: string, weight: number) => Promise<void>
  toggleRule: (ruleId: string, enabled: boolean) => Promise<void>
  refreshRules: () => Promise<void>
  getRulesByCategory: (category: string) => (DetectionRule & { stats?: RuleStats | null })[]
}

/**
 * Hook for managing and displaying detection rules
 * Handles loading, state management, and updates
 */
export function useRules(category?: string): UseRulesReturn {
  const [rules, setRules] = useState<(DetectionRule & { stats?: RuleStats | null })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = new URL('/api/admin/rules', window.location.origin)
      if (category) {
        url.searchParams.append('category', category)
      }

      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.statusText}`)
      }

      const data = await response.json()
      setRules(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      console.error('Failed to fetch rules:', err)
    } finally {
      setLoading(false)
    }
  }, [category])

  const updateWeight = useCallback(
    async (ruleId: string, weight: number) => {
      if (weight < 0 || weight > 100) {
        throw new Error('Weight must be between 0 and 100')
      }

      try {
        const response = await fetch(`/api/admin/rules?id=${ruleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update weight: ${response.statusText}`)
        }

        // Update local state
        setRules((prevRules) =>
          prevRules.map((rule) =>
            rule.id === ruleId ? { ...rule, weight } : rule
          )
        )
      } catch (err) {
        console.error('Failed to update rule weight:', err)
        throw err
      }
    },
    []
  )

  const toggleRule = useCallback(async (ruleId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/rules?id=${ruleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle rule: ${response.statusText}`)
      }

      // Update local state
      setRules((prevRules) =>
        prevRules.map((rule) =>
          rule.id === ruleId ? { ...rule, enabled } : rule
        )
      )
    } catch (err) {
      console.error('Failed to toggle rule:', err)
      throw err
    }
  }, [])

  const refreshRules = useCallback(() => fetchRules(), [fetchRules])

  const getRulesByCategory = useCallback(
    (cat: string) => rules.filter((r) => r.category === cat),
    [rules]
  )

  // Fetch rules on mount and when category changes
  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  return {
    rules,
    loading,
    error,
    updateWeight,
    toggleRule,
    refreshRules,
    getRulesByCategory,
  }
}
