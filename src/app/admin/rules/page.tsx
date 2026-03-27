'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, RefreshCw, Check, X, ChevronDown, ChevronUp, RotateCcw, ShieldCheck, Zap, Target } from 'lucide-react'
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
    <div className="min-h-screen bg-[#0C0A09] p-8 relative overflow-hidden">
      {/* Decorative Scanlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 shadow-[0_0_20px_rgba(255,191,0,0.5)] z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-10" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#1F1914] pb-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2rem]">
                LOGIC_CONTROL_SURFACE
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              Detection <span className="text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]">Protocols</span>
            </h1>
            <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest border-l-2 border-primary/50 pl-4 max-w-2xl">
              Configure heuristic weights and signal thresholds for the neural detection stack.
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all border bg-[#15110E] text-muted-foreground border-[#1F1914] hover:border-primary/50 flex items-center gap-2"
            >
              <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              RECALIBRATE
            </button>
            <button
              onClick={handleResetRules}
              disabled={saving || loading}
              className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all border bg-[#15110E] text-red-500/70 border-red-500/20 hover:border-red-500 flex items-center gap-2"
            >
              <RotateCcw className="w-3 h-3" />
              WIPE_DEFAULTS
            </button>
          </div>
        </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="bg-[#15110E] border border-[#1F1914] rounded-none p-1 h-auto flex-wrap sm:flex-nowrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="rounded-none px-6 py-2 font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black transition-all"
            >
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            {/* Category Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: "REGISTERED_RULES", value: rules.length, detail: "TOTAL_COUNT" },
                { label: "ACTIVE_SIGNALS", value: enabledRulesCount, detail: "LIVE_STREAMS", color: "text-green-500" },
                { label: "CUMULATIVE_WEIGHT", value: totalWeight, detail: "IMPACT_SUM" },
                { label: "AGGREGATE_ACCURACY", value: `${(rules.reduce((sum, r) => sum + (r.stats?.accuracy || 0), 0) / Math.max(rules.length, 1) * 100).toFixed(1)}%`, detail: "VALIDATION_CONF" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-[#15110E] border border-[#1F1914] p-6 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary/20 group-hover:border-primary transition-colors" />
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-2">{stat.label}</span>
                  <div className={`text-2xl font-mono font-bold ${stat.color || 'text-foreground'} mb-1`}>{stat.value}</div>
                  <div className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">{stat.detail}</div>
                </div>
              ))}
            </div>

            {/* Rules List */}
            {loading ? (
              <div className="text-center py-20 font-mono text-[10px] uppercase tracking-widest animate-pulse">SYNCHRONIZING_RULESET...</div>
            ) : rules.length === 0 ? (
              <div className="bg-[#15110E] border border-[#1F1914] py-12 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
                NO_PROTOCOLS_FOUND_IN_THIS_LAYER
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {rules.map((rule) => (
                  <div 
                    key={rule.id} 
                    className={`bg-[#15110E] border transition-all duration-300 relative group ${
                      expandedRules.has(rule.id!) ? 'border-primary/40 ring-1 ring-primary/10' : 'border-[#1F1914] hover:border-primary/20'
                    }`}
                  >
                    <div className="p-6">
                      {/* Rule Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => handleToggleRule(rule.id!, rule.enabled)}
                              disabled={saving}
                              className="data-[state=checked]:bg-primary"
                            />
                            <div className="space-y-1">
                              <h3 className="font-mono text-sm font-bold text-foreground uppercase tracking-widest">{rule.name}</h3>
                              <div className="flex gap-2">
                                <Badge className="rounded-none bg-[#0C0A09] border-[#1F1914] text-[9px] font-mono text-primary py-0">
                                  {rule.enabled ? 'ACTIVE' : 'OFFLINE'}
                                </Badge>
                                {rule.confidence && (
                                  <Badge className="rounded-none bg-[#0C0A09] border-[#1F1914] text-[9px] font-mono text-muted-foreground py-0 uppercase">
                                    CFD: {(rule.confidence * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground leading-relaxed uppercase pr-8">{rule.description}</p>
                        </div>
                        <button
                          onClick={() => toggleRuleExpanded(rule.id!)}
                          className="p-1 hover:bg-white/5 transition-colors border border-[#1F1914]"
                        >
                          {expandedRules.has(rule.id!) ? (
                            <ChevronUp className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>

                      {/* Weight Control */}
                      <div className="space-y-4 pt-4 border-t border-[#1F1914]">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">DETECTION_SENSITIVITY</label>
                          <span className="text-xs font-mono font-bold text-primary tracking-tighter">{rule.weight}/100</span>
                        </div>
                        <Slider
                          value={[rule.weight]}
                          onValueChange={(value) => handleWeightChange(rule.id!, value[0])}
                          max={100}
                          step={5}
                          disabled={saving || !rule.enabled}
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                      </div>

                      {/* Expanded Details */}
                      {expandedRules.has(rule.id!) && rule.stats && (
                        <div className="mt-6 pt-6 border-t border-[#1F1914] space-y-6">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Target className="h-3 w-3 text-primary" />
                              <h4 className="text-[10px] font-mono font-bold text-foreground uppercase tracking-widest">PERFORMANCE_SIGNATURE</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {/* Trigger Rate */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">TRIGGER_RATE</span>
                                  <span className="text-[9px] font-mono font-bold text-foreground uppercase tracking-widest">
                                    {(rule.stats.triggerRate * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={rule.stats.triggerRate * 100}
                                  className="h-1 bg-[#0C0A09] rounded-none [&>div]:bg-primary"
                                />
                              </div>

                              {/* Accuracy */}
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">PRECISION_INDEX</span>
                                  <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${getAccuracyColor(rule.stats.accuracy)}`}>
                                    {(rule.stats.accuracy * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <Progress
                                  value={rule.stats.accuracy * 100}
                                  className="h-1 bg-[#0C0A09] rounded-none [&>div]:bg-primary"
                                />
                              </div>

                              {/* Detection Count */}
                              <div className="bg-[#0C0A09] border border-[#1F1914] p-3 text-center">
                                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">TOTAL_MATCHES</span>
                                <p className="font-mono text-lg font-bold text-foreground tabular-nums">{rule.stats.triggered.toLocaleString()}</p>
                              </div>

                              {/* False Positive Rate */}
                              <div className="bg-[#0C0A09] border border-[#1F1914] p-3 text-center">
                                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">NOISE_ESTIMATE</span>
                                <p className={`font-mono text-lg font-bold tabular-nums ${getFalsePositiveColor(rule.falsePositiveRate || 0)}`}>
                                  {((rule.falsePositiveRate || 0) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Last Updated */}
                          {rule.lastUpdated && (
                            <div className="text-[9px] font-mono text-muted-foreground/30 uppercase tracking-[0.2rem] pt-2 border-t border-[#1F1914] text-right">
                              LAST_MODIFIED: {new Date(rule.lastUpdated).toISOString().replace('T', '_').split('.')[0]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Category Management Section */}
      <div className="bg-[#15110E] border border-[#1F1914] p-8 mt-12 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2rem]">BULK_LAYER_OVERRIDE</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#0C0A09] border border-[#1F1914] hover:border-primary/30 transition-all gap-4">
              <div className="space-y-1">
                <p className="font-mono text-xs font-bold text-foreground uppercase tracking-widest">{cat.label}</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">{cat.description}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => enableCategoryRules(cat.id, user?.uid || 'admin')}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-3 py-1 font-mono text-[9px] uppercase tracking-widest bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  ENABLE
                </button>
                <button
                  onClick={() => disableCategoryRules(cat.id, user?.uid || 'admin')}
                  disabled={saving}
                  className="flex-1 sm:flex-none px-3 py-1 font-mono text-[9px] uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  HALT
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
}


