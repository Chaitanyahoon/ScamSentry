"use client";

import React, { useState, useEffect } from "react";
import {
  Trash2,
  RefreshCw,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ShieldCheck,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "@/lib/rules-management";
import { useAuth } from "@/contexts/auth-context";

const CATEGORIES = [
  {
    id: "heuristics",
    label: "Heuristics (L1)",
    description: "Pattern matching and keyword detection",
  },
  {
    id: "forensics",
    label: "Forensics (L2)",
    description: "DNS, RDAP, and domain analysis",
  },
  {
    id: "threatIntel",
    label: "Threat Intel (L3)",
    description: "External threat intelligence APIs",
  },
  {
    id: "internalGraph",
    label: "Internal Graph (L4)",
    description: "Community scam reports database",
  },
];

interface RuleWithStats extends DetectionRule {
  stats?: RuleStats | null;
}

export default function RulesManagementPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("heuristics");
  const [rules, setRules] = useState<RuleWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Load rules for the active category
  useEffect(() => {
    loadRules(activeCategory);
  }, [activeCategory]);

  const loadRules = async (category: string) => {
    setLoading(true);
    try {
      const categoryData = CATEGORIES.find((c) => c.id === category);
      const rulesData = categoryData
        ? await getRulesByCategory(categoryData.label)
        : [];

      // Fetch stats for each rule
      const rulesWithStats = await Promise.all(
        rulesData.map(async (rule) => ({
          ...rule,
          stats: await getRuleStats(rule.id || ""),
        })),
      );

      setRules(rulesWithStats);
    } catch (error) {
      console.error("Failed to load rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = async (ruleId: string, newWeight: number) => {
    setSaving(true);
    try {
      if (user?.uid) {
        await updateRuleWeight(ruleId, newWeight, user.uid);
        await logRuleChange(ruleId, "updated", user.uid, { weight: newWeight });
        await loadRules(activeCategory);
      }
    } catch (error) {
      console.error("Failed to update weight:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    setSaving(true);
    try {
      if (user?.uid) {
        await toggleRule(ruleId, !enabled, user.uid);
        await logRuleChange(ruleId, enabled ? "disabled" : "enabled", user.uid);
        await loadRules(activeCategory);
      }
    } catch (error) {
      console.error("Failed to toggle rule:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRules(activeCategory);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetRules = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all rules to defaults? This cannot be undone.",
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      if (user?.uid) {
        await resetRulesToDefaults(user.uid);
        await logRuleChange("all", "updated", user.uid, {
          action: "reset_to_defaults",
        });
        await loadRules(activeCategory);
      }
    } catch (error) {
      console.error("Failed to reset rules:", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleRuleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.9) return "text-green-600";
    if (accuracy >= 0.8) return "text-yellow-600";
    return "text-red-600";
  };

  const getFalsePositiveColor = (rate: number) => {
    if (rate < 0.05) return "text-green-600";
    if (rate < 0.1) return "text-yellow-600";
    return "text-red-600";
  };

  const getTriggerRateBar = (rate: number) => {
    if (rate < 0.2) return "bg-green-500";
    if (rate < 0.5) return "bg-yellow-500";
    return "bg-red-500";
  };

  const activeTab = CATEGORIES.find((c) => c.id === activeCategory);
  const enabledRulesCount = rules.filter((r) => r.enabled).length;
  const totalWeight = rules.reduce(
    (sum, r) => (r.enabled ? sum + (r.weight || 0) : sum),
    0,
  );

  return (
    <div className="min-h-screen bg-background p-8 relative overflow-hidden">
      {/* Decorative background grids and blurs */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-primary">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Logic Control Panel
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Detection{" "}
              <span className="text-primary">
                Protocols
              </span>
            </h1>
            <p className="text-sm text-muted-foreground border-l-2 border-primary/50 pl-4 max-w-2xl">
              Configure heuristic weights and signal thresholds for the security
              detection stack.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              variant="outline"
              className="text-xs font-semibold rounded-xl flex items-center gap-2 border-border bg-card"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Recalibrate
            </Button>
            <Button
              onClick={handleResetRules}
              disabled={saving || loading}
              variant="outline"
              className="text-xs font-semibold rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="bg-muted border border-border rounded-xl p-1 h-auto flex-wrap sm:flex-nowrap">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="rounded-lg px-6 py-2 text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
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
                  {
                    label: "Registered Rules",
                    value: rules.length,
                    detail: "Total rules count",
                  },
                  {
                    label: "Active Signals",
                    value: enabledRulesCount,
                    detail: "Enabled filters",
                    color: "text-green-500",
                  },
                  {
                    label: "Cumulative Weight",
                    value: totalWeight,
                    detail: "Total weight impact",
                  },
                  {
                    label: "Aggregate Accuracy",
                    value: `${((rules.reduce((sum, r) => sum + (r.stats?.accuracy || 0), 0) / Math.max(rules.length, 1)) * 100).toFixed(1)}%`,
                    detail: "Validation success",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-card border border-border p-6 rounded-2xl relative group overflow-hidden shadow-sm"
                  >
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                      {stat.label}
                    </span>
                    <div
                      className={`text-2xl font-bold ${stat.color || "text-foreground"} mb-1`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground/60">
                      {stat.detail}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rules List */}
              {loading ? (
                <div className="text-center py-20 text-xs font-semibold uppercase tracking-wider animate-pulse text-muted-foreground">
                  Synchronizing ruleset...
                </div>
              ) : rules.length === 0 ? (
                <div className="bg-card border border-border py-12 rounded-2xl text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider shadow-sm">
                  No protocols found in this layer
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`bg-card border transition-all duration-300 relative group rounded-2xl overflow-hidden shadow-sm ${
                        expandedRules.has(rule.id!)
                          ? "border-primary/40 ring-1 ring-primary/10"
                          : "border-border hover:border-primary/20"
                      }`}
                    >
                      <div className="p-6">
                        {/* Rule Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                              <Switch
                                checked={rule.enabled}
                                onCheckedChange={() =>
                                  handleToggleRule(rule.id!, rule.enabled)
                                }
                                disabled={saving}
                                className="data-[state=checked]:bg-primary"
                              />
                              <div className="space-y-1">
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                  {rule.name}
                                </h3>
                                <div className="flex gap-2">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] font-semibold py-0 rounded-full ${
                                      rule.enabled
                                        ? "bg-green-500/10 text-green-500 border-green-500/25"
                                        : "bg-muted text-muted-foreground border-border"
                                    }`}
                                  >
                                    {rule.enabled ? "Active" : "Offline"}
                                  </Badge>
                                  {rule.confidence && (
                                    <Badge
                                      variant="outline"
                                      className="bg-muted border-border text-[9px] font-semibold py-0 rounded-full text-muted-foreground uppercase"
                                    >
                                      Confidence: {(rule.confidence * 100).toFixed(0)}%
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed pr-8">
                              {rule.description}
                            </p>
                          </div>
                          <button
                            onClick={() => toggleRuleExpanded(rule.id!)}
                            className="p-1.5 hover:bg-muted/60 transition-colors border border-border rounded-lg"
                          >
                            {expandedRules.has(rule.id!) ? (
                              <ChevronUp className="w-4 h-4 text-primary" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>

                        {/* Weight Control */}
                        <div className="space-y-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Detection Sensitivity
                            </label>
                            <span className="text-xs font-bold text-primary">
                              {rule.weight}/100
                            </span>
                          </div>
                          <Slider
                            value={[rule.weight]}
                            onValueChange={(value) =>
                              handleWeightChange(rule.id!, value[0])
                            }
                            max={100}
                            step={5}
                            disabled={saving || !rule.enabled}
                            className="opacity-80 hover:opacity-100 transition-opacity"
                          />
                        </div>

                        {/* Expanded Details */}
                        {expandedRules.has(rule.id!) && rule.stats && (
                          <div className="mt-6 pt-6 border-t border-border space-y-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-primary" />
                                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                                  Performance Diagnostics
                                </h4>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Trigger Rate */}
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                      Trigger Rate
                                    </span>
                                    <span className="text-[10px] font-bold text-foreground">
                                      {(rule.stats.triggerRate * 100).toFixed(
                                        1,
                                      )}
                                      %
                                    </span>
                                  </div>
                                  <Progress
                                    value={rule.stats.triggerRate * 100}
                                    className="h-1.5 bg-muted rounded-full [&>div]:bg-primary"
                                  />
                                </div>

                                {/* Accuracy */}
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                      Precision Index
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold uppercase ${getAccuracyColor(rule.stats.accuracy)}`}
                                    >
                                      {(rule.stats.accuracy * 100).toFixed(1)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={rule.stats.accuracy * 100}
                                    className="h-1.5 bg-muted rounded-full [&>div]:bg-primary"
                                  />
                                </div>

                                {/* Detection Count */}
                                <div className="bg-muted/40 border border-border p-3 text-center rounded-xl">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Total Matches
                                  </span>
                                  <p className="text-base font-bold text-foreground tabular-nums">
                                    {rule.stats.triggered.toLocaleString()}
                                  </p>
                                </div>

                                {/* False Positive Rate */}
                                <div className="bg-muted/40 border border-border p-3 text-center rounded-xl">
                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                                    Noise Estimate
                                  </span>
                                  <p
                                    className={`text-base font-bold tabular-nums ${getFalsePositiveColor(rule.falsePositiveRate || 0)}`}
                                  >
                                    {(
                                      (rule.falsePositiveRate || 0) * 100
                                    ).toFixed(1)}
                                    %
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Last Updated */}
                            {rule.lastUpdated && (
                              <div className="text-[10px] text-muted-foreground/40 uppercase tracking-wider pt-2 border-t border-border text-right">
                                Last Modified:{" "}
                                {
                                  new Date(rule.lastUpdated)
                                    .toLocaleDateString()
                                }
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
        <div className="bg-card border border-border p-8 mt-12 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Bulk Layer Override
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/40 border border-border hover:border-primary/30 rounded-xl transition-all gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {cat.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {cat.description}
                  </p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() =>
                      enableCategoryRules(cat.id, user?.uid || "admin")
                    }
                    disabled={saving}
                    size="sm"
                    className="flex-1 sm:flex-none h-8 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Enable
                  </Button>
                  <Button
                    onClick={() =>
                      disableCategoryRules(cat.id, user?.uid || "admin")
                    }
                    disabled={saving}
                    size="sm"
                    className="flex-1 sm:flex-none h-8 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Halt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
