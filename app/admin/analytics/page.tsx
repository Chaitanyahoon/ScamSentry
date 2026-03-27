"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsMetrics, ScanEvent, getAnalyticsMetrics, getRecentScans } from "@/lib/analytics";
import { AlertTriangle, CheckCircle, TrendingUp, Activity } from "lucide-react";

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [metricsData, scansData] = await Promise.all([
        getAnalyticsMetrics(days),
        getRecentScans(days),
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
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Scan metrics and performance insights</p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setDays(7)}
              className={`px-4 py-2 rounded ${
                days === 7 ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              7 days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-4 py-2 rounded ${
                days === 30 ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              30 days
            </button>
            <button
              onClick={() => setDays(90)}
              className={`px-4 py-2 rounded ${
                days === 90 ? "bg-primary text-primary-foreground" : "bg-card border border-border"
              }`}
            >
              90 days
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalScans}</div>
              <p className="text-xs text-muted-foreground">in {days} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{metrics.threatsDetected}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalScans > 0
                  ? ((metrics.threatsDetected / metrics.totalScans) * 100).toFixed(1)
                  : 0}
                % of scans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageScore.toFixed(1)}/100</div>
              <p className="text-xs text-muted-foreground">Trust score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">False Positives</CardTitle>
              <CheckCircle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.falsePositiveEstimate}</div>
              <p className="text-xs text-muted-foreground">Estimated</p>
            </CardContent>
          </Card>
        </div>

        {/* Layer Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle>Layer Accuracy</CardTitle>
            <CardDescription>% of scans where each layer triggered</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Accuracy %",
                    Heuristics: metrics.layerAccuracy.heuristics,
                    Forensics: metrics.layerAccuracy.forensics,
                    "Threat Intel": metrics.layerAccuracy.threatIntel,
                    "Internal Graph": metrics.layerAccuracy.internalGraph,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Heuristics" fill="#3b82f6" />
                <Bar dataKey="Forensics" fill="#10b981" />
                <Bar dataKey="Threat Intel" fill="#f59e0b" />
                <Bar dataKey="Internal Graph" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scan Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Scan Trend</CardTitle>
            <CardDescription>Daily scan volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.scanTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top URL Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Top URL Patterns</CardTitle>
            <CardDescription>Most frequently scanned domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.topUrlPatterns.map((item) => (
                <div key={item.pattern} className="flex justify-between items-center p-3 bg-card/50 border border-border rounded">
                  <span className="font-mono text-sm">{item.pattern}</span>
                  <span className="font-bold text-primary">{item.count} scans</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
            <CardDescription>Latest {Math.min(recentScans.length, 10)} scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentScans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className={`flex justify-between items-start p-3 border rounded text-sm ${
                    scan.riskLevel === "Critical Threat"
                      ? "border-destructive/30 bg-destructive/5"
                      : scan.riskLevel === "Suspicious"
                      ? "border-warning/30 bg-warning/5"
                      : "border-success/30 bg-success/5"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <p className="font-mono truncate">{scan.url}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{scan.finalScore}/100</p>
                    <p
                      className={`text-xs font-semibold ${
                        scan.riskLevel === "Critical Threat"
                          ? "text-destructive"
                          : scan.riskLevel === "Suspicious"
                          ? "text-warning"
                          : "text-success"
                      }`}
                    >
                      {scan.riskLevel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
