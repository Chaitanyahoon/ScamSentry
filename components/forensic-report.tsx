import { AlertTriangle, CheckSquare, ShieldOff, Cpu, Database, Fingerprint, Globe, ShieldCheck } from "lucide-react"

export function ForensicReport({ report, finalScore, riskLevel }: any) {
  const isHighRisk = finalScore <= 20;
  const isSuspicious = finalScore > 20 && finalScore <= 60;

  return (
    <div className="space-y-6 mt-8 animate-fade-in">
      <div className={`glass-card overflow-hidden border-t-2 ${isHighRisk ? 'border-t-destructive' : isSuspicious ? 'border-t-warning' : 'border-t-success'}`}>
        
        {/* Header Block */}
        <div className="p-5 sm:p-6 border-b border-border/50 bg-card/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold uppercase text-foreground flex items-center gap-3 tracking-widest drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            <Fingerprint className={`h-6 w-6 ${isHighRisk ? 'text-destructive drop-shadow-[0_0_8px_hsla(var(--destructive),0.8)]' : isSuspicious ? 'text-warning drop-shadow-[0_0_8px_hsla(var(--warning),0.8)]' : 'text-primary drop-shadow-[0_0_8px_hsla(var(--primary),0.8)]'}`} />
            DIAGNOSTIC_REPORT
          </h2>
          <div className={`px-5 py-2 font-bold tracking-widest uppercase border bg-background/50 flex items-center gap-2 
            ${isHighRisk ? 'text-destructive border-destructive/50 shadow-[0_0_15px_hsla(var(--destructive),0.2)]' : 
              isSuspicious ? 'text-warning border-warning/50 shadow-[0_0_15px_hsla(var(--warning),0.2)]' : 
              'text-primary border-primary/50 shadow-[0_0_15px_hsla(var(--primary),0.2)]'}`}>
            {isHighRisk ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            TRUST_SCORE: {finalScore}/100 
            <span className="ml-2 opacity-80 font-normal">[{riskLevel}]</span>
          </div>
        </div>
        
        <div className="p-5 sm:p-6 space-y-8">
          <LayerSection 
            title="L1 :: URL_HEURISTICS" 
            icon={<Cpu className="h-5 w-5" />}
            data={report.layer1_Heuristics} 
          />
          
          <LayerSection 
            title="L2 :: DOMAIN_DNS_FORENSICS" 
            icon={<Globe className="h-5 w-5" />}
            data={report.layer2_Forensics} 
          />

          <LayerSection 
            title="L3 :: GLOBAL_THREAT_INTEL" 
            icon={<ShieldOff className="h-5 w-5" />}
            data={report.layer3_ThreatIntel} 
          />

          <LayerSection 
            title="L4 :: INTERNAL_CROSSCHECK" 
            icon={<Database className="h-5 w-5" />}
            data={report.layer4_InternalGraph} 
          />

          <LayerSection 
            title="L5 :: AI_STRUCTURAL_SEMANTICS" 
            icon={<Fingerprint className="h-5 w-5" />}
            data={report.layer5_AI_Semantics} 
            isAi
          />
        </div>
      </div>
    </div>
  )
}

function LayerSection({ title, icon, data, isAi = false }: any) {
  const isSafe = data.score < 40;
  
  return (
    <div className="space-y-4 border-l-2 border-border/50 pl-5 py-1">
      <div className="flex items-center gap-4">
        <div className={`p-2 border bg-card shadow-[0_0_10px_rgba(0,0,0,0.5)] 
          ${isSafe ? 'text-primary border-primary/30' : 'text-destructive border-destructive/30 drop-shadow-[0_0_5px_hsla(var(--destructive),0.5)]'}`}>
          {icon}
        </div>
        <h3 className="text-base font-bold text-foreground tracking-widest uppercase flex-1">{title}</h3>
        {isAi && !data.aiActive && (
          <span className="text-xs bg-muted/50 text-muted-foreground px-2 py-1 font-bold border border-border uppercase tracking-widest">
            OFFLINE_BYPASS
          </span>
        )}
      </div>
      
      <div className="space-y-3 mt-2">
        {data.flags.length > 0 ? (
          data.flags.map((flag: string, i: number) => {
            const isCritical = flag.includes('CRITICAL') || flag.includes('⚠️');
            return (
              <div key={i} className={`flex gap-3 text-sm tracking-wide p-3 border bg-background/50 
                ${isCritical ? 'border-destructive/30 text-destructive' : 'border-warning/30 text-warning'}`}>
                <span className="mt-0.5 shrink-0">
                  {isCritical ? 
                    <AlertTriangle className="h-4 w-4 drop-shadow-[0_0_3px_currentColor]" /> :
                    <AlertTriangle className="h-4 w-4 drop-shadow-[0_0_3px_currentColor]" />
                  }
                </span>
                <span className="leading-relaxed">
                  {flag}
                </span>
              </div>
            )
          })
        ) : (
          <div className="flex gap-3 text-sm text-success bg-success/5 p-3 border border-success/20 font-medium tracking-wide">
            <CheckSquare className="h-4 w-4 mt-0.5 shrink-0 drop-shadow-[0_0_3px_currentColor]" />
            <span>&gt; SYNC_SUCCESS: ZERO_TRUST_MODULE_PASSED</span>
          </div>
        )}
      </div>
    </div>
  )
}
