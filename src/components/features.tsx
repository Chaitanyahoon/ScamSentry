"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Features() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const capabilities = [
    {
      step: "01",
      title: "Static heuristics",
      detail:
        "Pattern-matches against known phishing signatures — punycode homographs, dash-stuffing, IP masking, burner-hosting abuse, and 60+ sketchy TLDs. Catches 90% of threats instantly, zero API calls.",
    },
    {
      step: "02",
      title: "DNS forensics",
      detail:
        "Resolves the target domain and inspects its MX, A, and NS records for anomalies like recently registered nameservers or missing reverse-DNS.",
    },
    {
      step: "03",
      title: "Threat-intel crosscheck",
      detail:
        "Queries Google Safe Browsing in real-time for known malware, social engineering, and unwanted software flags.",
    },
    {
      step: "04",
      title: "Community ledger",
      detail:
        "Cross-references against our Firestore database of 2,400+ freelancer-verified scam reports submitted by the community.",
    },
  ];

  return (
    <section className="relative py-20 sm:py-28 bg-background border-b border-border">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Section header — editorial style, not a badge */}
          <div
            className={cn("mb-14", mounted ? "animate-fade-in" : "opacity-0")}
          >
            <p className="text-xs font-mono text-primary tracking-wider mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight leading-tight">
              Four layers of analysis.
              <br />
              <span className="text-muted-foreground font-normal">
                One trust score.
              </span>
            </h2>
          </div>

          {/* Vertical stack — not a grid. Each layer is a row. */}
          <div className="space-y-0">
            {capabilities.map((item, index) => (
              <div
                key={item.step}
                className={cn(
                  "group flex gap-6 py-6 border-b border-border last:border-b-0 transition-colors hover:bg-card/50",
                  mounted ? `animate-fade-in` : "opacity-0",
                )}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Step number */}
                <span className="text-xs font-mono text-primary pt-1 shrink-0 w-6 text-right tabular-nums">
                  {item.step}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground mb-1 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.detail}
                  </p>
                  {item.note && (
                    <p className="mt-2 text-xs text-primary/80 font-mono">
                      ↳ {item.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
