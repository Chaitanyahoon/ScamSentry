import { 
  ShieldAlert, 
  Globe, 
  Fingerprint, 
  Network, 
  FileText, 
  ChevronLeft,
  ExternalLink,
  Info,
  Layers,
  Calendar,
  Lock,
  Server
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getThreatDossier } from "@/lib/services/osint-sync";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { cn } from "@/lib/utils";

export default async function DossierPage({ params }: { params: { id: string } }) {
  const domain = params.id.replace(/_/g, ".");
  const dossier = await getThreatDossier(domain);
  const forensics = await analyzeDomainForensics(domain);

  if (!dossier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-red-500/10 p-4 rounded-full border border-red-500/20">
          <ShieldAlert className="h-10 w-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Dossier Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            The requested domain could not be found in the Forensic intelligence database.
          </p>
        </div>
        <Link href="/dashboard/admin/osint">
          <Button variant="outline">Return to OSINT Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/admin/osint" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase tracking-widest">Back to Intelligence Feed</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="font-mono text-[10px] tracking-widest uppercase">
            <FileText className="mr-2 h-4 w-4" /> Export JSON
          </Button>
          <Button size="sm" className="bg-primary text-background font-bold font-mono text-[10px] tracking-widest uppercase px-6">
            <Lock className="mr-2 h-4 w-4" /> CLASSIFIED REPORT
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-6">
            <div className="bg-primary/10 p-5 rounded-2xl border border-primary/20 shadow-[0_0_30px_rgba(255,191,0,0.1)]">
              <Fingerprint className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-mono font-bold tracking-tight text-foreground">{domain}</h1>
                <span className={cn(
                  "px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter border",
                  forensics.score > 80 ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-primary/10 text-primary border-primary/20"
                )}>
                  Risk Score: {forensics.score}/100
                </span>
              </div>
              <p className="text-muted-foreground font-mono text-xs flex items-center gap-2">
                <Globe className="h-3 w-3" /> Targeted Entity: {dossier.type || "Generic Phishing"}
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase bg-[#15110E] px-2 py-1 rounded border border-[#1F1914]">
                  <Layers className="h-3 w-3" /> Hash: 0x{forensics.fingerprint?.hash}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase bg-[#15110E] px-2 py-1 rounded border border-[#1F1914]">
                  <Calendar className="h-3 w-3" /> First Seen: {dossier.firstSeen?.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Forensic Narrative */}
          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#1F1914] bg-[#15110E]/50 flex items-center gap-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest">Forensic Narrative</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detection Vectors</h4>
                  <ul className="space-y-4">
                    {forensics.flags.map((flag, i) => (
                      <li key={i} className="flex gap-4 items-start p-3 bg-red-500/5 border border-red-500/10 rounded-lg group hover:bg-red-500/10 transition-colors">
                        <div className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-xs text-red-200/80 leading-relaxed">{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Infrastructure Profile</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-[#15110E] border border-[#1F1914] rounded-xl flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                          <Server className="h-4 w-4 text-primary opacity-60" />
                          <div>
                            <p className="text-[9px] text-muted-foreground uppercase font-mono">Registrar</p>
                            <p className="text-xs font-bold text-foreground truncate">{forensics.infrastructure?.registrar || "REDACTED"}</p>
                          </div>
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="p-4 bg-[#15110E] border border-[#1F1914] rounded-xl space-y-2 group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-primary opacity-60" />
                          <p className="text-[9px] text-muted-foreground uppercase font-mono">Nameservers</p>
                        </div>
                        <div className="space-y-1 pl-7">
                          {forensics.infrastructure?.nameservers?.map(ns => (
                            <p key={ns} className="text-xs font-mono text-foreground/80">{ns}</p>
                          )) || <p className="text-xs text-muted-foreground font-mono italic">No data available</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-6">
          <div className="bg-[#0C0A09] border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5">
              <Network className="h-24 w-24 text-primary rotate-12" />
            </div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-primary mb-4">Neural Cluster ID</h3>
            <div className="space-y-4 relative z-10">
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[9px] text-muted-foreground uppercase mb-1">Fingerprint SHA-256</p>
                <p className="text-xs font-mono font-bold text-primary break-all">{forensics.fingerprint?.hash}</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Our AI cluster engine has identified this infrastructure as part of a recurring campaign. Shared traits discovered in structural DNA and NS rotation patterns.
              </p>
              <Button variant="ghost" className="w-full text-xs text-primary hover:text-primary hover:bg-primary/10 justify-between">
                Explore Cluster Network
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </div>

          <div className="bg-[#0C0A09] border border-[#1F1914] rounded-2xl p-6">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-foreground mb-4">OSINT Feed Origin</h3>
            <div className="flex items-center gap-4 p-4 bg-[#15110E] border border-[#1F1914] rounded-xl">
              <div className="bg-primary/10 p-2 rounded border border-primary/20">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{dossier.source}</p>
                <p className="text-[9px] text-muted-foreground uppercase">Reporting Authority</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
