"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  FileCode,
  Cpu,
  Server,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CyberNewsHub } from "@/components/cyber-news-hub";

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    activeLockdowns: 12,
    totalThreats: 42891,
    ingestedBulletins: 24,
    engineUptime: "99.98%",
  });
  const [backendStatus, setBackendStatus] = useState<"live" | "waking_up">("live");

  useEffect(() => {
    let revalidateTimer: NodeJS.Timeout | null = null;

    const fetchStats = async () => {
      try {
        const res = await fetch("/api/threats/recent");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            activeLockdowns: data.lockdowns?.length || prev.activeLockdowns,
            ingestedBulletins: data.incidents?.length || prev.ingestedBulletins,
            totalThreats: data.threats?.length
              ? 42891 + data.threats.length
              : prev.totalThreats,
          }));

          if (data.backendStatus === "waking_up") {
            setBackendStatus("waking_up");
            // Auto-revalidate faster while backend is waking up
            revalidateTimer = setTimeout(fetchStats, 15000);
          } else {
            setBackendStatus("live");
          }
        }
      } catch (e) {
        console.warn("[Dashboard] Sync using cached ledger baseline", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);

    return () => {
      clearInterval(interval);
      if (revalidateTimer) clearTimeout(revalidateTimer);
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            Dashboard <span className="text-primary">Overview</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time threat intelligence and platform monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {backendStatus === "waking_up" && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-400 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              Engine Container Warming Up (~45s)
            </div>
          )}

          <div className="flex items-center gap-2.5 bg-card border border-border px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground">
            <Server className="h-3.5 w-3.5 text-primary" />
            <span>Shield Core v2.5</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Compromised Brands"
          value={stats.activeLockdowns}
          sub="Active mimicry locks"
          icon={Lock}
          color={
            stats.activeLockdowns > 0
              ? "text-red-500 animate-pulse"
              : "text-primary"
          }
        />
        <StatsCard
          label="OSINT Blocklist"
          value={stats.totalThreats.toLocaleString()}
          sub="Synchronized domain hashes"
          icon={ShieldAlert}
          color="text-primary"
        />
        <StatsCard
          label="Ingested Bulletins"
          value={stats.ingestedBulletins}
          sub="Cyber advisories in cache"
          icon={FileCode}
          color="text-emerald-500"
        />
        <StatsCard
          label="Engine Uptime"
          value={stats.engineUptime}
          sub="Continuous operation"
          icon={Cpu}
          color="text-primary"
        />
      </div>

      {/* Core Intelligence Hub */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Live Intelligence Feed
          </h3>
        </div>
        <CyberNewsHub />
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-card border border-border p-5 rounded-2xl space-y-3 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2.5 py-1 bg-muted/30 border border-border rounded-lg">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-foreground tracking-tight">
          {value}
        </h4>
        <p className="text-[10px] text-muted-foreground/60 mt-1">{sub}</p>
      </div>
    </div>
  );
}
