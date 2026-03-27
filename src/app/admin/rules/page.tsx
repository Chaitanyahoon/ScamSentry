'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getAllRules,
  getRulesByCategory,
  updateRuleWeight,
  toggleRule,
  getRuleStats,
  logRuleChange,
  disableCategoryRules,
  enableCategoryRules,
  resetRulesToDefaults,
  DetectionRule,
  RuleStats,
} from '@/lib/rules-management'
import { useAuth } from '@/contexts/auth-context'

const CATEGORIES = [
  { id: 'heuristics', label: 'Heuristics (L1)', description: 'Pattern matching and keyword detection' },
  { id: 'forensics', label: 'Forensics (L2)', description: 'DNS, RDAP, and domain analysis' },
  { id: 'threatIntel', label: 'Threat Intel (L3)', description: 'External threat intelligence APIs' },
  { id: 'internalGraph', label: 'Internal Graph (L4)', description: 'Community scam reports database' },
]

interface RuleWithStats extends DetectionRule {
  stats?: RuleStats | null
}

export default function RulesManagementPage() {
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('heuristics')
  const [rules, setRules] = useState<RuleWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Load rules for the active category
  useEffect(() => {
    loadRules(activeCategory)
  }, [activeCategory])

  const loadRules = async (category: string) => {
    setLoading(true)
    try {
      const categoryData = CATEGORIES.find((c) => c.id === category)
      const rulesData = categoryData ? await getRulesByCategory(categoryData.label) : []

      // Fetch stats for each rule
      const rulesWithStats = await Promise.all(
        rulesData.map(async (rule) => ({
          ...rule,
          stats: await getRuleStats(rule.id || ''),
        }))
      )

      setRules(rulesWithStats)
    } catch (error) {
      console.error('Failed to load rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWeightChange = async (ruleId: string, newWeight: number) => {
    setSaving(true)
    try {
      if (user?.uid) {
        await updateRuleWeight(ruleId, newWeight, user.uid)
        await logRuleChange(ruleId, 'updated', user.uid, { weight: newWeight })
        await loadRules(activeCategory)
      }
    } catch (error) {
      console.error('Failed to update weight:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    setSaving(true)
    try {
      if (user?.uid) {
        await toggleRule(ruleId, !enabled, user.uid)
        await logRuleChange(ruleId, enabled ? 'disabled' : 'enabled', user.uid)
        await loadRules(activeCategory)
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await loadRules(activeCategory)
    } finally {
      setRefreshing(false)
    }
  }

  const handleResetRules = async () => {
    if (!confirm('Are you sure you want to reset all rules to defaults? This cannot be undone.')) {
      return
    }

    setSaving(true)
    try {
      if (user?.uid) {
        await resetRulesToDefaults(user.uid)
        await logRuleChange('all', 'updated', user.uid, { action: 'reset_to_defaults' })
        await loadRules(activeCategory)
      }
    } catch (error) {
      console.error('Failed to reset rules:', error)
    } finally {
      setSaving(false)
    }
  }

  const toggleRuleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId)
    } else {
      newExpanded.add(ruleId)
    }
    setExpandedRules(newExpanded)
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return 'text-green-600'
    if (accuracy >= 0.8) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFalsePositiveColor = (rate: number) => {
    if (rate < 0.05) return 'text-green-600'
    if (rate < 0.1) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTriggerRateBar = (rate: number) => {
    if (rate < 0.2) return 'bg-green-500'
    if (rate < 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const activeTab = CATEGORIES.find((c) => c.id === activeCategory)
  const enabledRulesCount = rules.filter((r) => r.enabled).length
  const totalWeight = rules.reduce((sum, r) => (r.enabled ? sum + (r.weight || 0) : sum), 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rule Management</h1>
          <p className="text-gray-500 mt-1">Configure detection rules and adjust sensitivity</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={handleResetRules}
            disabled={saving || loading}
          >
            <RotateCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            {/* Category Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{rules.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Enabled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{enabledRulesCount}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Weight</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalWeight}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Avg Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(
                      rules.reduce((sum, r) => sum + (r.stats?.accuracy || 0), 0) / Math.max(rules.length, 1)
                    ).toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rules List */}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading rules...</div>
            ) : rules.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  No rules configured for this layer yet
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {rules.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      {/* Rule Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => handleToggleRule(rule.id!, rule.enabled)}
                              disabled={saving}
                            />
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge variant={rule.enabled ? 'default' : 'outline'}>
                              {rule.enabled ? 'Enabled' : 'Disabled'}
                            </Badge>
                            {rule.confidence && (
                              <Badge variant="secondary">
                                {(rule.confidence * 100).toFixed(0)}% confidence
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRuleExpanded(rule.id!)}
                        >
                          {expandedRules.has(rule.id!) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Weight Control */}
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Detection Weight</label>
                          <span className="text-sm font-semibold">{rule.weight}/100</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[rule.weight]}
                            onValueChange={(value) => handleWeightChange(rule.id!, value[0])}
                            max={100}
                            step={5}
                            disabled={saving || !rule.enabled}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {expandedRules.has(rule.id!) && rule.stats && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <div>
                            <h4 className="font-medium text-sm mb-3">Performance Metrics</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Trigger Rate */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-600">Trigger Rate</span>
                                  <span className="text-xs font-semibold">
                                    {(rule.stats.triggerRate * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={rule.stats.triggerRate * 100}
                                  className="h-2"
                                />
                              </div>

                              {/* Accuracy */}
                              <div>
                                <div className="flex justify-between mb-1">
                                  <span className="text-xs text-gray-600">Accuracy</span>
                                  <span className={`text-xs font-semibold ${getAccuracyColor(rule.stats.accuracy)}`}>
                                    {(rule.stats.accuracy * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={rule.stats.accuracy * 100}
                                  className="h-2"
                                />
                              </div>

                              {/* Detection Count */}
                              <div className="text-xs">
                                <span className="text-gray-600">Times Triggered</span>
                                <p className="font-semibold mt-1">{rule.stats.triggered.toLocaleString()}</p>
                              </div>

                              {/* False Positive Rate */}
                              <div className="text-xs">
                                <span className="text-gray-600">False Positives</span>
                                <p className={`font-semibold mt-1 ${getFalsePositiveColor(rule.falsePositiveRate || 0)}`}>
                                  {((rule.falsePositiveRate || 0) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Last Updated */}
                          {rule.lastUpdated && (
                            <div className="text-xs text-gray-500 pt-2 border-t">
                              Last updated: {new Date(rule.lastUpdated).toLocaleString()}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Category Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Layer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="flex items-start justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">{cat.label}</p>
                  <p className="text-sm text-gray-600">{cat.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enableCategoryRules(cat.id, user?.uid || 'admin')}
                    disabled={saving}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => disableCategoryRules(cat.id, user?.uid || 'admin')}
                    disabled={saving}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Disable All
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Import missing icon
function RotateCw(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M23 4v6h-6"></path>
      <path d="M20.49 15a9 9 0 1 1-2-8.83"></path>
    </svg>
  )
}
