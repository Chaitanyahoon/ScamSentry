"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  ShieldAlert,
  TerminalSquare,
  LayoutDashboard,
} from "lucide-react";
import {
  getAnalyticsMetrics,
  ScanEvent,
  getRecentScans,
  type AnalyticsMetrics,
} from "@/lib/analytics";

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [metricsData, scansData] = await Promise.all([
        getAnalyticsMetrics(undefined, days),
        getRecentScans(undefined, days),
      ]);
      setMetrics(metricsData);
      setRecentScans(scansData);
      setLoading(false);
    };

    fetchData();
  }, [days]);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  if (!metrics) {
    return <div className="text-center py-12">No data available</div>;
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 z-0 bg-grid-cyber opacity-[0.05]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-4 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 text-primary">
            <Activity className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Analytics Dashboard
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            System Intelligence{" "}
            <span className="text-primary">
              Metrics
            </span>
          </h1>
          <p className="text-sm text-muted-foreground border-l-2 border-primary/50 pl-4 max-w-xl">
            Real-time scan telemetry and system performance diagnostics.
          </p>

          <div className="flex gap-2 mt-6">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  days === d
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Scans",
              value: metrics.totalScans,
              icon: Activity,
              detail: `Last ${days} days`,
              color: "text-primary",
            },
            {
              label: "Threats Deflected",
              value: metrics.threatsDetected,
              icon: AlertTriangle,
              detail: `${metrics.totalScans > 0 ? ((metrics.threatsDetected / metrics.totalScans) * 100).toFixed(1) : 0}% of scans`,
              color: "text-red-500",
            },
            {
              label: "Average Trust Score",
              value: `${metrics.averageScore.toFixed(1)}/100`,
              icon: TrendingUp,
              detail: "System wide",
              color: "text-primary",
            },
            {
              label: "Est. False Positives",
              value: metrics.falsePositiveEstimate,
              icon: CheckCircle,
              detail: "Heuristic engine",
              color: "text-orange-500",
            },
          ].map((kpi, idx) => (
            <div
              key={idx}
              className="bg-card border border-border p-6 rounded-2xl relative group overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <kpi.icon className={`h-4.5 w-4.5 ${kpi.color} opacity-75`} />
              </div>
              <div
                className={`text-3xl font-bold ${kpi.color} mb-1 tracking-tight`}
              >
                {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              </div>
              <div className="text-xs text-muted-foreground/60">
                {kpi.detail}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Layer Accuracy */}
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <TerminalSquare className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Detection Layer Diagnostics
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Telemetry",
                    Heuristics: metrics.layerAccuracy.heuristics,
                    Forensics: metrics.layerAccuracy.forensics,
                    "Threat Intel": metrics.layerAccuracy.threatIntel,
                    "Internal Graph": metrics.layerAccuracy.internalGraph,
                  },
                ]}
                margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#030712",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{
                    fontSize: "11px",
                    textTransform: "capitalize",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "20px",
                  }}
                />
                <Bar
                  dataKey="Heuristics"
                  fill="#f97316"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="Forensics" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="Threat Intel"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Internal Graph"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scan Trend */}
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Scan Volume Trajectory
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={metrics.scanTrend}
                margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#888888"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#030712",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                  itemStyle={{
                    fontSize: "11px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#f97316",
                    stroke: "#030712",
                    strokeWidth: 2,
                  }}
                />
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top URL Patterns */}
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Recurring Threat Vectors
              </h2>
            </div>
            <div className="space-y-3">
              {metrics.topUrlPatterns.map((item: any, idx: number) => (
                <div
                  key={item.pattern}
                  className="flex justify-between items-center p-4 bg-muted/40 border border-border hover:border-primary/30 rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground/40">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-sm text-foreground">
                      {item.pattern}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-primary">
                    {item.count} scans
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-card border border-border p-8 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-4.5 w-4.5 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                Live Telemetry Log
              </h2>
            </div>
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
              {recentScans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className={`flex justify-between items-start p-4 border relative group transition-all rounded-xl hover:bg-muted/30 ${
                    scan.riskLevel === "Critical Threat"
                      ? "border-red-500/20 bg-red-500/5"
                      : scan.riskLevel === "Suspicious"
                        ? "border-orange-500/20 bg-orange-500/5"
                        : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-lg ${
                      scan.riskLevel === "Critical Threat"
                        ? "bg-red-500"
                        : scan.riskLevel === "Suspicious"
                          ? "bg-orange-500"
                          : "bg-primary"
                    }`}
                  />

                  <div className="space-y-1 flex-1 min-w-0 pr-4 pl-2">
                    <p className="font-mono text-xs text-foreground truncate">
                      {scan.url.replace(/^https?:\/\//, "")}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-xs text-foreground tracking-tighter">
                      {scan.finalScore}/100
                    </p>
                    <p
                      className={`text-[10px] font-bold uppercase ${
                        scan.riskLevel === "Critical Threat"
                          ? "text-red-500"
                          : scan.riskLevel === "Suspicious"
                            ? "text-orange-500"
                            : "text-primary"
                      }`}
                    >
                      {scan.riskLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
