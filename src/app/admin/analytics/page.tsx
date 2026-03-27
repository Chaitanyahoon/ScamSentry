"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from "recharts";
import { Activity, AlertTriangle, TrendingUp, CheckCircle, ShieldAlert, TerminalSquare, LayoutDashboard } from "lucide-react";

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
    <div className="min-h-screen bg-[#0C0A09] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Scanlines */}
      <div className="absolute inset-x-0 top-0 h-px bg-primary/20 shadow-[0_0_20px_rgba(255,191,0,0.5)] z-0" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="space-y-4 border-b border-[#1F1914] pb-8">
          <div className="inline-flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-[0.2rem]">
              ANALYTICS_TERMINAL_V2.19
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Intelligence <span className="text-primary drop-shadow-[0_0_10px_rgba(255,191,0,0.3)]">Metrics</span>
          </h1>
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest border-l-2 border-primary/50 pl-4">
            Real-time scan telemetry and system performance signatures.
          </p>
          
          <div className="flex gap-2 mt-6">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1 font-mono text-[10px] uppercase tracking-widest transition-all border ${
                  days === d 
                    ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(255,191,0,0.3)]" 
                    : "bg-[#15110E] text-muted-foreground border-[#1F1914] hover:border-primary/50"
                }`}
              >
                T-[{d}D]
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "TOTAL_SCANS", value: metrics.totalScans, icon: Activity, detail: `IN_${days}D`, color: "text-primary" },
            { label: "THREATS_DETECTED", value: metrics.threatsDetected, icon: AlertTriangle, detail: `${metrics.totalScans > 0 ? ((metrics.threatsDetected / metrics.totalScans) * 100).toFixed(1) : 0}%_OF_SCANS`, color: "text-red-500" },
            { label: "AVG_TRUST_SCORE", value: `${metrics.averageScore.toFixed(1)}/100`, icon: TrendingUp, detail: "SYSTEM_WIDE", color: "text-primary" },
            { label: "EST_FALSE_POSITIVES", value: metrics.falsePositiveEstimate, icon: CheckCircle, detail: "HEURISTIC_SIG", color: "text-orange-500" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-[#15110E] border border-[#1F1914] p-6 relative group overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
               {/* HUD Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/20 group-hover:border-primary transition-colors" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/20 group-hover:border-primary transition-colors" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</span>
                <kpi.icon className={`h-4 w-4 ${kpi.color} opacity-70`} />
              </div>
              <div className={`text-3xl font-mono font-bold ${kpi.color} mb-1 tracking-tighter`}>{kpi.value}</div>
              <div className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">{kpi.detail}</div>
              
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(255,191,0,0.03)_50%,transparent_100%)] bg-[size:100%_4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Layer Accuracy */}
          <div className="bg-[#15110E] border border-[#1F1914] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <TerminalSquare className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2rem]">LAYER_DIAGNOSTICS</h2>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "TELEMETRY",
                    Heuristics: metrics.layerAccuracy.heuristics,
                    Forensics: metrics.layerAccuracy.forensics,
                    "Threat Intel": metrics.layerAccuracy.threatIntel,
                    "Internal Graph": metrics.layerAccuracy.internalGraph,
                  },
                ]}
                margin={{ top: 20, right: 30, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1914" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0C0A09', border: '1px solid #1F1914', borderRadius: '0' }}
                  itemStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  cursor={{ fill: '#1F1914' }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Bar dataKey="Heuristics" fill="#FFBF00" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Forensics" fill="#0EA5E9" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Threat Intel" fill="#F97316" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Internal Graph" fill="#EF4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Scan Trend */}
          <div className="bg-[#15110E] border border-[#1F1914] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2rem]">VOLUME_TRAJECTORY</h2>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.scanTrend} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F1914" vertical={false} />
                <XAxis dataKey="date" stroke="#525252" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} fontFamily="monospace" axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0C0A09', border: '1px solid #1F1914', borderRadius: '0' }}
                   itemStyle={{ fontSize: '10px', fontFamily: 'monospace', textTransform: 'uppercase' }}
                />
                <Line type="monotone" dataKey="count" stroke="#FFBF00" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#FFBF00', stroke: '#0C0A09', strokeWidth: 2 }} />
                {/* Area under line */}
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFBF00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FFBF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top URL Patterns */}
          <div className="bg-[#15110E] border border-[#1F1914] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2rem]">RECURRING_VECTORS</h2>
            </div>
            <div className="space-y-3">
              {metrics.topUrlPatterns.map((item, idx) => (
                <div key={item.pattern} className="flex justify-between items-center p-4 bg-[#0C0A09] border border-[#1F1914] hover:border-primary/30 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground/30">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="font-mono text-xs text-foreground uppercase tracking-widest">{item.pattern}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-primary group-hover:drop-shadow-[0_0_5px_rgba(255,191,0,0.5)] transition-all">{item.count} SCANS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-[#15110E] border border-[#1F1914] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-mono font-bold text-foreground uppercase tracking-[0.2rem]">LIVE_TELEMETRY_LOG</h2>
            </div>
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
              {recentScans.slice(0, 10).map((scan) => (
                <div
                  key={scan.id}
                  className={`flex justify-between items-start p-4 border relative group transition-all hover:bg-white/5 ${
                    scan.riskLevel === "Critical Threat"
                      ? "border-red-500/20 bg-red-500/5"
                      : scan.riskLevel === "Suspicious"
                      ? "border-orange-500/20 bg-orange-500/5"
                      : "border-primary/20 bg-primary/5"
                  }`}
                >
                  {/* Pulse indicator for very recent scans */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    scan.riskLevel === "Critical Threat" ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                    scan.riskLevel === "Suspicious" ? "bg-orange-500" : "bg-primary"
                  }`} />
                  
                  <div className="space-y-1 flex-1 min-w-0 pr-4">
                    <p className="font-mono text-xs text-foreground truncate uppercase tracking-widest">{scan.url.replace(/^https?:\/\//, '')}</p>
                    <p className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">
                      {new Date(scan.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-xs text-foreground tracking-tighter">{scan.finalScore}/100</p>
                    <p
                      className={`text-[9px] font-mono font-bold uppercase tracking-widest ${
                        scan.riskLevel === "Critical Threat"
                          ? "text-red-500"
                          : scan.riskLevel === "Suspicious"
                          ? "text-orange-500"
                          : "text-primary"
                      }`}
                    >
                      {scan.riskLevel.replace(' ', '_')}
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
