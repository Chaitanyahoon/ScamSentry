"use client";

import { useEffect, useState, useRef } from "react";
import { useReports } from "@/contexts/reports-context";

function useCountUp(end: number, duration: number = 1600) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTime: number | null = null;
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, hasAnimated]);

  return { count, ref };
}

export function Stats() {
  const { reports } = useReports();

  const threatsTotal = 42891 + reports.length;
  const coverage = 99.8;
  const syncs = 24;

  const stats = [
    {
      label: "Neural Detections",
      value: threatsTotal,
      sub: "Global Intel Count",
      symbol: "+",
    },
    {
      label: "Community Intel",
      value: reports.length,
      sub: "Verified Submissions",
      symbol: "",
    },
    {
      label: "Platform Uptime",
      value: coverage,
      sub: "Forensic Availability",
      symbol: "%",
    },
    {
      label: "Daily Feed Syncs",
      value: syncs,
      sub: "OSINT Updates",
      symbol: "",
    },
  ];

  return (
    <section className="relative py-20 bg-background border-y border-border overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-cyber" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const { count, ref } = useCountUp(stat.value);
            return (
              <div
                key={stat.label}
                ref={ref}
                className="glass-card p-6 rounded-2xl flex flex-col justify-between h-40"
              >
                <div>
                  <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    {stat.label}
                  </dt>
                  <dd className="mt-4 text-3xl font-bold tracking-tight text-foreground flex items-baseline gap-1">
                    {count.toLocaleString()}
                    {stat.symbol && (
                      <span className="text-primary text-lg font-semibold">
                        {stat.symbol}
                      </span>
                    )}
                  </dd>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Live Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">
              Global Watch Active
            </span>
          </div>
          <span className="hidden sm:inline text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-semibold uppercase tracking-wider">
              Forensic Integrity Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
