"use client";

import { useState, useEffect } from "react";
import {
  Terminal,
  Shield,
  Share2,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface ThreatReport {
  id: string;
  title: string; // Domain or scam URL
  scamType: string;
  riskLevel: string;
  createdAt: string;
  flagCount?: number;
}

interface Node {
  id: string;
  label: string;
  type: "hub" | "domain";
  x: number;
  y: number;
  risk?: string;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  color: string;
}

interface ThreatNodeGraphProps {
  reports: ThreatReport[];
}

export default function ThreatNodeGraph({ reports }: ThreatNodeGraphProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    // Determine active domains to display
    const activeReports = reports.slice(0, 7); // Display up to 7 domains to keep layout clean

    // Default mock connections if the active reports are low or new
    const displayDomains =
      activeReports.length > 0
        ? activeReports.map((r) => ({
            id: r.id,
            name: r.title.replace(/https?:\/\//i, "").split("/")[0],
            risk: r.riskLevel,
          }))
        : [
            { id: "1", name: "chase-verify-secure.top", risk: "high" },
            { id: "2", name: "amazon-login-alert.buzz", risk: "high" },
            { id: "3", name: "netf1ix-auth-validate.xyz", risk: "high" },
            { id: "4", name: "paypal-billing-verify.cc", risk: "medium" },
            { id: "5", name: "steam-unlock-profile.work", risk: "medium" },
          ];

    // Establish Central Infrastructure Hubs
    const hubs: Node[] = [
      {
        id: "hub_ns",
        label: "NS_NAMESILO_CLUSTER",
        type: "hub",
        x: 180,
        y: 150,
        color: "#F59E0B",
      },
      {
        id: "hub_reg",
        label: "REG_PORKBUN_NETWORK",
        type: "hub",
        x: 380,
        y: 150,
        color: "#D4950A",
      },
    ];

    // Position domain nodes circularly
    const domainNodes: Node[] = displayDomains.map((dom, index) => {
      const angle = (index * 2 * Math.PI) / displayDomains.length;
      const radius = 100;
      // Calculate center based on overall SVG viewport (600 x 300)
      const centerX = 280;
      const centerY = 150;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let nodeColor = "#EF4444"; // Default red for high risk
      if (
        dom.risk?.toLowerCase() === "medium" ||
        dom.risk?.toLowerCase() === "suspicious"
      ) {
        nodeColor = "#F59E0B"; // Amber
      } else if (
        dom.risk?.toLowerCase() === "low" ||
        dom.risk?.toLowerCase() === "secure"
      ) {
        nodeColor = "#10B981"; // Green
      }

      return {
        id: dom.id,
        label: dom.name,
        type: "domain",
        x,
        y,
        risk: dom.risk || "high",
        color: nodeColor,
      };
    });

    // Establish linkages (Edges) between domain nodes and central hubs
    const newEdges: Edge[] = [];
    domainNodes.forEach((node, index) => {
      // Alternating linkages or connecting to hubs representing infrastructure sharing
      if (index % 2 === 0 || index === 0) {
        newEdges.push({
          source: node.id,
          target: "hub_ns",
          color: "rgba(245, 158, 11, 0.25)", // Glowing amber edge
        });
      }
      if (index % 2 !== 0 || index === 0) {
        newEdges.push({
          source: node.id,
          target: "hub_reg",
          color: "rgba(212, 149, 10, 0.25)",
        });
      }
    });

    setNodes([...hubs, ...domainNodes]);
    setEdges(newEdges);
  }, [reports]);

  return (
    <div className="bg-card border border-border relative overflow-hidden group p-6 h-full flex flex-col justify-between rounded-2xl shadow-sm">
      <div className="border-b border-border pb-4 mb-6 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
          <Share2 className="h-3.5 w-3.5" /> Infrastructure Correlation Map
        </h3>
        <span className="text-[10px] font-semibold text-muted-foreground/60">
          Force Graph Matrix
        </span>
      </div>

      <div className="relative flex-1 w-full bg-muted/40 border border-border p-4 h-[300px] flex items-center justify-center overflow-hidden rounded-xl">
        <svg viewBox="0 0 560 300" className="w-full h-full select-none">
          {/* Render Connections (Edges) */}
          {edges.map((edge, idx) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <line
                key={`edge-${idx}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={edge.color}
                strokeWidth={1.5}
                className="transition-all duration-300"
                strokeDasharray={
                  hoveredNode?.id === sourceNode.id ? "3 3" : "none"
                }
              />
            );
          })}

          {/* Render Nodes */}
          {nodes.map((node) => {
            const isHub = node.type === "hub";
            const radius = isHub ? 14 : 7;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-crosshair"
                onMouseEnter={() => {
                  setNodes((prev) =>
                    prev.map((n) => (n.id === node.id ? { ...n } : n)),
                  );
                  setHoveredNode(node);
                }}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Node outer glowing rings */}
                <circle
                  r={radius + (isHovered ? 8 : 4)}
                  fill="none"
                  stroke={node.color}
                  strokeOpacity={isHovered ? 0.45 : 0.15}
                  strokeWidth={1}
                  className={isHub ? "animate-pulse" : ""}
                />

                {/* Core node circle */}
                <circle
                  r={radius}
                  fill={isHub ? "#030712" : node.color}
                  stroke={node.color}
                  strokeWidth={2}
                />

                {/* Inner dot for hubs */}
                {isHub && (
                  <circle r={3} fill={node.color} className="animate-ping" />
                )}

                {/* Text Labels */}
                <text
                  y={isHub ? -20 : 18}
                  textAnchor="middle"
                  fill={isHovered ? "#ffffff" : "#a3a3a3"}
                  fontSize={9}
                  className="transition-colors duration-200 font-semibold"
                >
                  {isHub ? node.label : node.label.substring(0, 16)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Telemetry Tooltip HUD Card */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 right-4 bg-[#030712] border border-border p-3.5 rounded-xl text-xs text-foreground z-20 flex justify-between items-center shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {hoveredNode.type === "hub" ? (
                  <Activity className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                )}
                <span className="font-bold text-primary">
                  {hoveredNode.label}
                </span>
              </div>
              <span className="text-muted-foreground text-[10px]">
                {hoveredNode.type === "hub"
                  ? "Shared System Infrastructure Node"
                  : `Risk Level: ${hoveredNode.risk?.toUpperCase()} // Offshore Hosted`}
              </span>
            </div>
            <div className="text-right text-[9px] text-primary/70 font-mono">
              X: {Math.round(hoveredNode.x)}
              <br />
              Y: {Math.round(hoveredNode.y)}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-[10px] font-medium text-muted-foreground/60">
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-500" /> Critical Threats
        </span>
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Suspicious Links
        </span>
        <span className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Shared Hubs
        </span>
      </div>
    </div>
  );
}
