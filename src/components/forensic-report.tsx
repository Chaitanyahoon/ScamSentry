import {
  AlertTriangle,
  CheckSquare,
  ShieldOff,
  Cpu,
  Database,
  Fingerprint,
  Globe,
  ShieldCheck,
} from "lucide-react";

export function ForensicReport({ report, finalScore, riskLevel }: any) {
  const isHighRisk = finalScore <= 20;
  const isSuspicious = finalScore > 20 && finalScore <= 60;

  return (
    <div className="space-y-12 mt-8 animate-fade-in stagger-2">
      <div className="bg-[#15110E] border border-[#1F1914] shadow-2xl relative overflow-hidden group">
        {/* Subtle HUD scanlines on report */}
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(255,191,0,0.1)_1px,transparent_1px)] bg-[length:100%_4px]" />
        
        {/* Header Block - Technical Dossier Style */}
        <div className="relative z-10 bg-[#0C0A09] border-b border-[#1F1914] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Fingerprint className={`h-5 w-5 ${isHighRisk ? "text-destructive shadow-[0_0_10px_rgba(192,41,42,0.5)]" : "text-primary shadow-[0_0_10px_rgba(255,191,0,0.5)]"}`} />
              <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-foreground">
                INTELLIGENCE_DOSSIER_v2
              </h2>
            </div>
            <p className="text-[10px] font-mono text-muted-foreground/50 pl-8">SYSTEM_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 border font-mono text-xs font-bold flex items-center gap-3 
              ${isHighRisk ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-primary/40 bg-primary/5 text-primary"}`}>
              {isHighRisk ? <AlertTriangle className="h-4 w-4 animate-pulse" /> : <ShieldCheck className="h-4 w-4" />}
              SCORE: {finalScore}/100
              <span className="opacity-50 text-[9px] border-l border-current pl-3 uppercase">
                {riskLevel}_RISK
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-6 sm:p-10 space-y-12 bg-transparent">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <LayerSection
              title="URL_HEURISTICS"
              icon={<Cpu className="h-4 w-4" />}
              data={report.layer1_Heuristics}
            />

            <LayerSection
              title="DOMAIN_DNS_PEDIGREE"
              icon={<Globe className="h-4 w-4" />}
              data={report.layer2_Forensics}
            />

            <LayerSection
              title="GLOBAL_THREAT_INTEL"
              icon={<ShieldOff className="h-4 w-4" />}
              data={report.layer3_ThreatIntel}
            />

            <LayerSection
              title="COMMUNITY_DATA_GRAPH"
              icon={<Database className="h-4 w-4" />}
              data={report.layer4_InternalGraph}
            />
          </div>
        </div>
        
        {/* Footer Decorative Brackets */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] opacity-10" />
      </div>
    </div>
  );
}

function LayerSection({ title, icon, data, isAi = false }: any) {
  const isSafe = data.score < 40;

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center gap-4 border-b border-[#1F1914] pb-3">
        <div className={`p-2 border ${isSafe ? "border-primary/30 text-primary bg-primary/5" : "border-destructive/30 text-destructive bg-destructive/5"}`}>
          {icon}
        </div>
        <h3 className="text-[10px] font-mono font-bold tracking-[0.2em] text-foreground/80">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {data.flags.length > 0 ? (
          data.flags.map((flag: string, i: number) => {
            const cleanFlag = flag.replace("⚠️ ", "").replace("CRITICAL: ", "");
            const isCritical = flag.includes("CRITICAL") || flag.includes("⚠️");
            return (
              <div
                key={i}
                className={`group flex gap-4 text-[10px] font-mono p-4 border transition-all duration-300
                ${isCritical 
                  ? "border-destructive/30 bg-destructive/5 text-destructive shadow-[inset_0_0_15px_rgba(192,41,42,0.05)]" 
                  : "border-[#1F1914] bg-[#0C0A09]/50 text-muted-foreground hover:border-primary/30 hover:text-primary"}`}
              >
                <span className="mt-0.5 shrink-0 opacity-50">
                  {isCritical ? <AlertTriangle className="h-3 w-3" /> : <div className="h-1 w-1 bg-current" />}
                </span>
                <span className="leading-tight uppercase tracking-wider">{cleanFlag}</span>
              </div>
            );
          })
        ) : (
          <div className="flex gap-4 text-[10px] font-mono text-muted-foreground/40 p-4 border border-[#1F1914] bg-[#0C0A09]/30">
            <CheckSquare className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="uppercase tracking-widest">NO_ANOMALIES_DETECTED</span>
          </div>
        )}
      </div>
    </div>
  );
}
