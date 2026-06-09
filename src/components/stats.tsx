"use client";

import { useEffect, useState, useRef } from "react";
import { useReports } from "@/contexts/reports-context";

interface StatItem {
  label: string;
  value: number;
  sub: string;
  symbol: string;
}

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

function StatCard({ stat }: { stat: StatItem }) {
  const { count, ref } = useCountUp(stat.value);

  return (
    <div
      ref={ref}
      className="group relative bg-[#090b11]/80 border border-white/[0.04] backdrop-blur-xl p-6 rounded-2xl flex flex-col justify-between h-40 transition-all duration-300 hover:border-primary/30 hover:translate-y-[-2px] hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)] overflow-hidden"
    >
      {/* Cyber Corner bracket ticks */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-white/[0.1] group-hover:border-primary/50 transition-colors pointer-events-none" />

      {/* Cyber Grid inside card */}
      <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none" />

      <div>
        <dt className="text-xs font-mono font-semibold text-muted-foreground/85 uppercase tracking-wider flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          {stat.label}
        </dt>
        <dd className="mt-4 text-3xl font-mono font-bold tracking-tight text-white group-hover:text-primary transition-colors duration-300 flex items-baseline gap-1">
          {count.toLocaleString()}
          {stat.symbol && (
            <span className="text-primary text-lg font-semibold font-sans">
              {stat.symbol}
            </span>
          )}
        </dd>
      </div>

      <div className="pt-4 border-t border-white/[0.06]">
        <p className="text-xs text-muted-foreground/60 font-medium group-hover:text-muted-foreground/80 transition-colors">
          {stat.sub}
        </p>
      </div>
    </div>
  );
}

export function Stats() {
  const { reports } = useReports();

  const threatsTotal = 42891 + reports.length;
  const coverage = 99.8;
  const syncs = 24;

  const stats: StatItem[] = [
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
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Global Live Indicators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-3.5 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">
              Global Watch Active
            </span>
          </div>
          <span className="hidden sm:inline text-white/[0.06]">|</span>
          <div className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.05] px-3.5 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono font-semibold uppercase tracking-wider text-[10px]">
              Forensic Integrity Verified
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
