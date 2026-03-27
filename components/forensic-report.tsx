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
    <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div
        className={`bg-card border-t-4 ${isHighRisk ? "border-t-destructive" : isSuspicious ? "border-t-warning" : "border-t-success"} border-l border-r border-b border-border shadow-sm`}
      >
        {/* Header Block */}
        <div className="p-5 sm:p-6 border-b border-border bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-3">
            <Fingerprint
              className={`h-6 w-6 ${isHighRisk ? "text-destructive" : isSuspicious ? "text-warning" : "text-primary"}`}
            />
            Diagnostic Report
          </h2>
          <div
            className={`px-4 py-1.5 font-semibold text-sm border flex items-center gap-2 
            ${
              isHighRisk
                ? "text-destructive border-destructive/30 bg-destructive/10"
                : isSuspicious
                  ? "text-warning border-warning/30 bg-warning/10"
                  : "text-primary border-primary/30 bg-primary/10"
            }`}
          >
            {isHighRisk ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            Trust Score: {finalScore}/100
            <span className="ml-2 opacity-80 font-normal capitalize">
              ({riskLevel})
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6 bg-background/30">
          <LayerSection
            title="URL Heuristics"
            icon={<Cpu className="h-5 w-5" />}
            data={report.layer1_Heuristics}
          />

          <LayerSection
            title="Domain & DNS Records"
            icon={<Globe className="h-5 w-5" />}
            data={report.layer2_Forensics}
          />

          <LayerSection
            title="Global Threat Intel"
            icon={<ShieldOff className="h-5 w-5" />}
            data={report.layer3_ThreatIntel}
          />

          <LayerSection
            title="Community Database"
            icon={<Database className="h-5 w-5" />}
            data={report.layer4_InternalGraph}
          />
        </div>
      </div>
    </div>
  );
}

function LayerSection({ title, icon, data, isAi = false }: any) {
  const isSafe = data.score < 40;

  return (
    <div className="space-y-3 pl-4 border-l-2 border-border py-1">
      <div className="flex items-center gap-3">
        <div
          className={`p-1.5 rounded-sm 
          ${isSafe ? "text-primary bg-primary/10" : "text-destructive bg-destructive/10"}`}
        >
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-foreground flex-1">
          {title}
        </h3>
        {isAi && !data.aiActive && (
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
            Offline
          </span>
        )}
      </div>

      <div className="space-y-2 mt-2">
        {data.flags.length > 0 ? (
          data.flags.map((flag: string, i: number) => {
            // Remove fake emoji indicators like ⚠️
            const cleanFlag = flag.replace("⚠️ ", "").replace("CRITICAL: ", "");
            const isCritical = flag.includes("CRITICAL") || flag.includes("⚠️");
            return (
              <div
                key={i}
                className={`flex gap-3 text-sm p-3 border 
                ${isCritical ? "border-destructive/20 bg-destructive/5 text-destructive font-medium" : "border-warning/20 bg-warning/5 text-muted-foreground"}`}
              >
                <span className="mt-0.5 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </span>
                <span className="leading-relaxed">{cleanFlag}</span>
              </div>
            );
          })
        ) : (
          <div className="flex gap-3 text-sm text-muted-foreground p-3 border border-border bg-card">
            <CheckSquare className="h-4 w-4 mt-0.5 shrink-0 text-success" />
            <span>No anomalies detected.</span>
          </div>
        )}
      </div>
    </div>
  );
}
