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
    activeLockdowns: 0,
    totalThreats: 42891,
    ingestedBulletins: 0,
    engineUptime: "99.98%",
  });

  useEffect(() => {
    // Fetch live statistics to populate HUD cards
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/threats/recent");
        if (res.ok) {
          const data = await res.json();
          setStats((prev) => ({
            ...prev,
            activeLockdowns: data.lockdowns?.length || 0,
            ingestedBulletins: data.incidents?.length || 0,
          }));
        }
      } catch (e) {
        console.error("Failed to sync dashboard stats", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F1914] pb-6">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="h-6 w-6 text-primary animate-pulse" />
            WORKSPACE <span className="text-primary">OVERVIEW</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enterprise developer overwatch and live global cyber threat
            telemetry console.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#0C0A09] border border-[#1F1914] px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <Server className="h-3.5 w-3.5 text-primary" />
          SECURE SHIELD CORE V2.5
        </div>
      </div>

      {/* Telemetry Stats Cards (HUD Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="COMPROMISED BRANDS"
          value={stats.activeLockdowns}
          sub="Active Mimicry Locks"
          icon={Lock}
          color={
            stats.activeLockdowns > 0
              ? "text-red-500 animate-pulse"
              : "text-primary"
          }
        />
        <StatsCard
          label="OSINT BLOCKLIST"
          value={stats.totalThreats.toLocaleString()}
          sub="Synchronized Domain Hashes"
          icon={ShieldAlert}
          color="text-primary"
        />
        <StatsCard
          label="INGESTED BULLETINS"
          value={stats.ingestedBulletins}
          sub="Cyber Advisories In Cache"
          icon={FileCode}
          color="text-emerald-500"
        />
        <StatsCard
          label="FORENSIC UPTIME"
          value={stats.engineUptime}
          sub="Continuous Sentinel Operation"
          icon={Cpu}
          color="text-primary"
        />
      </div>

      {/* Core Intelligence Hub */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-widest">
            LIVE OVERWATCH CONTROLLER
          </h3>
        </div>
        <CyberNewsHub />
      </div>
    </div>
  );
}

function StatsCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0C0A09] border border-[#1F1914] p-5 rounded-none space-y-3 hover:border-primary/30 transition-all duration-300 relative group">
      {/* Sharp border accent decor */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-muted-foreground/20 group-hover:border-primary/50 transition-colors" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-muted-foreground/20 group-hover:border-primary/50 transition-colors" />

      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground px-2 py-0.5 bg-[#15110E] border border-[#1F1914]">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-foreground font-mono tracking-tight">
          {value}
        </h4>
        <p className="text-[9px] text-muted-foreground/60 uppercase tracking-tighter mt-1">
          {sub}
        </p>
      </div>
    </div>
  );
}
