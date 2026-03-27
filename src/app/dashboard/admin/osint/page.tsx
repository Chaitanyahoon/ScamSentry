"use client";

import { useState, useEffect } from "react";
import { 
  Database, 
  RefreshCcw, 
  ShieldAlert, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Search,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OSINTThreat {
  domain: string;
  source: string;
  type: string;
  firstSeen: string;
  lastSync: string;
  status: 'active' | 'expired';
}

interface SyncStats {
  processed: number;
  added: number;
  skipped: number;
  errors: number;
}

export default function OSINTPage() {
  const [threats, setThreats] = useState<OSINTThreat[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncStats | null>(null);

  // Fetch initial threats (Note: In a real Next.js app, this might be a Server Action)
  useEffect(() => {
    fetchThreats();
  }, []);

  const fetchThreats = async () => {
    try {
      const response = await fetch('/api/admin/sync/osint', { method: 'GET' });
      // Note: We need a GET route to fetch threats. I'll implement it or use a default mock for UI design.
      // For now, I'll mock the data if the API is restricted to POST.
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/admin/sync/osint', { 
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}` // Placeholder for auth logic
        }
      });
      const data = await response.json();
      if (data.success) {
        setSyncResult(data.stats);
        // Refresh table after successful sync
        fetchThreats();
      }
    } catch (e) {
      console.error("Sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* OSINT Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-mono font-bold text-foreground flex items-center gap-3">
            <Database className="h-6 w-6 text-primary" />
            OSINT <span className="text-primary">INTELLIGENCE</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global threat feed synchronization and blocklist forensics.
          </p>
        </div>
        
        <Button 
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary hover:bg-primary/90 text-background font-bold tracking-tight shadow-[0_0_20px_rgba(255,191,0,0.2)]"
        >
          {syncing ? (
            <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="mr-2 h-4 w-4" />
          )}
          {syncing ? "SYNCHRONIZING..." : "SYNCHRONIZE NOW"}
        </Button>
      </div>

      {/* Sync Status Feedback */}
      {syncResult && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <div className="flex-1 text-sm text-emerald-200">
            <span className="font-bold">Intelligence Sync Complete:</span> Processed {syncResult.processed} domains, identified <span className="text-emerald-400 font-mono">{syncResult.added} new threats</span>.
          </div>
          <Button variant="ghost" size="sm" onClick={() => setSyncResult(null)} className="text-emerald-500 hover:text-emerald-400">Dismiss</Button>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Active Threats" 
          value="42,891" 
          sub="Global Blocklist Total"
          icon={ShieldAlert}
          color="text-primary"
        />
        <StatsCard 
          label="Live Feeds" 
          value="2" 
          sub="PhishTank, OpenPhish"
          icon={Globe}
          color="text-primary"
        />
        <StatsCard 
          label="Deduplication" 
          value="98.4%" 
          sub="Efficiency Rate"
          icon={CheckCircle2}
          color="text-emerald-500"
        />
        <StatsCard 
          label="Last Sync" 
          value="14m ago" 
          sub="Automatic Update"
          icon={Timer}
          color="text-muted-foreground"
        />
      </div>

      {/* Threat Intel Table */}
      <div className="bg-[#0C0A09] border border-[#1F1914] rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#1F1914] flex items-center justify-between">
          <h3 className="font-mono text-sm font-bold flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            LATEST OSINT DOSSIERS
          </h3>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            Real-time Feed
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#15110E] text-muted-foreground text-[10px] uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Domain Hash</th>
                <th className="px-6 py-4 font-bold">Source Feed</th>
                <th className="px-6 py-4 font-bold">Classification</th>
                <th className="px-6 py-4 font-bold">First Seen</th>
                <th className="px-6 py-4 font-bold">Forensic Status</th>
                <th className="px-6 py-4 font-bold"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1914]">
              {/* Sample Row */}
              {[...Array(6)].map((_, i) => (
                <tr key={i} className="hover:bg-[#15110E]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-foreground font-medium">paypa1-security-login.xyz</span>
                      <span className="text-[10px] text-muted-foreground font-mono">ID: 0x4f...{i}d2</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {i % 2 === 0 ? "PhishTank" : "OpenPhish"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">credential-theft</td>
                  <td className="px-6 py-4 text-muted-foreground font-mono">2026-03-27</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                      <span className="text-red-400 font-bold text-[10px] uppercase">Blocked</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, sub, icon: Icon, color }: any) {
  return (
    <div className="bg-[#0C0A09] border border-[#1F1914] p-5 rounded-xl space-y-3 hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 py-1 bg-[#15110E] rounded">
          {label}
        </span>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div>
        <h4 className="text-2xl font-bold text-foreground font-mono">{value}</h4>
        <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{sub}</p>
      </div>
    </div>
  );
}
