"use client";

import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Privacy Policy page.
 * Styled to match the modern dashboard design system.
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10 space-y-8">
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-lg">
          <div className="flex items-center gap-4 border-b border-border pb-6 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Privacy Policy
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Data Sovereignty & Threat Intelligence Compliance
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                1. Zero Data Harvesting
              </h2>
              <p>
                ScamSentry operates on a deterministic, zero-trust framework. We
                do NOT log, store, or monitor any personal user details. Link
                forensic scanning is performed on-the-fly and processed completely
                locally.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                2. Scanning Logs
              </h2>
              <p>
                In order to update threat hotspot maps, anonymous URL metadata
                (the scanned domain and its compiled threat classification) is
                logged on our database. IPs and browser signatures are hashed
                client-side prior to transit and are completely undecipherable.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                3. Cookies & Tracking
              </h2>
              <p>
                This platform utilizes zero advertising cookies, zero
                analytical trackers, and zero third-party telemetry integrations.
              </p>
            </section>
          </div>

          <div className="border-t border-border pt-6 mt-8 flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground/40 font-medium">
              Last updated: June 2025
            </span>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold border-primary/20 hover:bg-primary/10 rounded-xl"
              >
                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
