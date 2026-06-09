"use client";

import { TerminalSquare, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Privacy Policy Manifest page.
 * Styled in "Forensic Amber" terminal layout.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0C0A09] text-[#E8DBC8] py-20 px-4 sm:px-6 relative overflow-hidden font-mono">
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] pointer-events-none" />
      <div className="max-w-2xl mx-auto space-y-8 relative z-10 border border-[#1F1914] bg-[#15110E] p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.55)]">
        {/* Corner HUD accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 [clip-path:polygon(100%_0,0_0,100%_100%)] pointer-events-none" />

        <div className="flex items-center gap-4 border-b border-[#1F1914] pb-6">
          <TerminalSquare className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold tracking-widest text-foreground uppercase">
              PRIVACY_MANIFEST.TXT
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
              Data Sovereignty & Threat Intelligence Compliance
            </p>
          </div>
        </div>

        <div className="space-y-6 text-xs leading-relaxed text-muted-foreground">
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> 1. ZERO DATA HARVESTING
            </h2>
            <p>
              ScamSentry operates on a deterministic, zero-trust framework. We
              do NOT log, store, or monitor any personal user details. Link
              forensic scanning is performed on-the-fly and processed completely
              locally.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> 2. SCANNING LOGS
            </h2>
            <p>
              In order to update threat hotspot maps, anonymous URL metadata
              (the scanned domain and its compiled threat classification) is
              logged on our database. IPs and browser signatures are hashed
              client-side prior to transit and are completely undecipherable.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" /> 3. COOKIES & TRACKING
            </h2>
            <p>
              This workstation utilizes zero advertising cookies, zero
              analytical trackers, and zero third-party telemetry integrations.
            </p>
          </section>
        </div>

        <div className="border-t border-[#1F1914] pt-6 flex justify-between items-center">
          <span className="text-[8px] text-muted-foreground/30 uppercase tracking-widest">
            STATUS: SECURE_ENVIRONMENT
          </span>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="font-bold uppercase text-[9px] tracking-widest border-primary/20 hover:bg-primary/10"
            >
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Return to Terminal
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
