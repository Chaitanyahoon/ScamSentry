import { NextResponse } from "next/server";
import { analyzeHeuristics } from "@/lib/validator/heuristics";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeThreatIntel } from "@/lib/validator/threat-intel";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";

export const dynamic = "force-dynamic";

let lastScanFailureTime = 0;
const SCAN_CIRCUIT_COOLDOWN_MS = 45 * 1000;

/**
 * POST /api/validator
 * UI-Facing Forensic Scan Endpoint.
 * Executes threat validation via FastAPI backend or fast local pipeline.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || !body.input || typeof body.input !== "string") {
      return NextResponse.json(
        { error: "Invalid request payload. Expected { 'input': 'string' }" },
        { status: 400 },
      );
    }

    const input = body.input.trim();
    const isCircuitOpen =
      Date.now() - lastScanFailureTime < SCAN_CIRCUIT_COOLDOWN_MS;

    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

    if (backendUrl && !isCircuitOpen) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      try {
        let targetUrl = input;
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `http://${targetUrl}`;
        }

        const backendResponse = await fetch(`${backendUrl}/api/v1/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: targetUrl }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (backendResponse.ok) {
          const data = await backendResponse.json();

          const L1 = data.layer_results?.find(
            (lr: any) => lr.layer === "L1",
          ) || { score_contribution: 0, details: {} };
          const L2 = data.layer_results?.find(
            (lr: any) => lr.layer === "L2",
          ) || { score_contribution: 0, details: {} };
          const L3 = data.layer_results?.find(
            (lr: any) => lr.layer === "L3",
          ) || { score_contribution: 0, details: {} };
          const L4 = data.layer_results?.find(
            (lr: any) => lr.layer === "L4",
          ) || { score_contribution: 0, details: {} };

          const finalScore = 100 - (data.risk_score || 0);

          let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
          if (data.risk_level === "dangerous") riskLevel = "Critical Threat";
          else if (data.risk_level === "suspicious") riskLevel = "Suspicious";

          const l1Flags = L1.details?.triggered_rules || [];
          const l2Flags = L2.details?.triggered_checks || [];

          const l3Flags: string[] = [];
          if (L3.details?.matches && Array.isArray(L3.details.matches)) {
            L3.details.matches.forEach((m: any) => {
              l3Flags.push(
                `CRITICAL: Google Safe Browsing flagged threat: ${m.threat_type} on ${m.platform}`,
              );
            });
          } else if (L3.details?.error) {
            l3Flags.push(
              `Warning: Threat Intel check skipped: ${L3.details.error}`,
            );
          }

          const l4Flags: string[] = [];
          if (L4.details?.match) {
            const m = L4.details.match;
            const verifiedLabel = m.verified ? "Verified" : "Unverified";
            l4Flags.push(
              `CRITICAL: Internal Graph Match: ${verifiedLabel} ${m.threat_type} (${m.confidence}% conf)`,
            );
          }

          return NextResponse.json(
            {
              success: true,
              engine: "backend-cloud",
              finalScore,
              riskLevel,
              forensicReport: {
                layer1_Heuristics: {
                  score: L1.score_contribution,
                  flags: l1Flags,
                },
                layer2_Forensics: {
                  score: L2.score_contribution,
                  flags: l2Flags,
                },
                layer3_ThreatIntel: {
                  score: L3.score_contribution,
                  flags: l3Flags,
                },
                layer4_InternalGraph: {
                  score: L4.score_contribution,
                  flags: l4Flags,
                },
              },
            },
            { status: 200 },
          );
        } else {
          lastScanFailureTime = Date.now();
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        lastScanFailureTime = Date.now();
        console.warn(
          `[API:Validator] Backend scan unavailable (${err.name || "Error"}), executing fast local pipeline.`,
        );
      }
    }

    // ── FALLBACK: Execute Fast Local Next.js Validation Pipeline ──
    const L1 = analyzeHeuristics(input);

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];

    // Run external forensics with a 2500ms safety timeout budget
    let L2 = { score: 0, flags: [] as string[] };
    let L4 = { score: 0, flags: [] as string[] };
    let L3 = { score: 0, flags: [] as string[] };

    try {
      const forensicsPromise = Promise.all([
        analyzeDomainForensics(input).catch(() => ({ score: 0, flags: [] })),
        analyzeInternalGraph(input).catch(() => ({ score: 0, flags: [] })),
        analyzeThreatIntel(urls).catch(() => ({ score: 0, flags: [] })),
      ]);

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 2500),
      );

      const result = await Promise.race([forensicsPromise, timeoutPromise]);
      if (result) {
        [L2, L4, L3] = result;
      } else {
        L2.flags.push("Notice: Domain network lookup reached safe timeout threshold");
      }
    } catch (e) {
      console.warn("[API:Validator] Local auxiliary check failed gracefully:", e);
    }

    const combinedRisk = Math.min(
      L1.score + L2.score + L3.score + L4.score,
      100,
    );
    const finalScore = 100 - combinedRisk;

    let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
    if (finalScore <= 30) riskLevel = "Critical Threat";
    else if (finalScore <= 70) riskLevel = "Suspicious";

    return NextResponse.json(
      {
        success: true,
        engine: "local-heuristic",
        finalScore,
        riskLevel,
        forensicReport: {
          layer1_Heuristics: { score: L1.score, flags: L1.flags },
          layer2_Forensics: { score: L2.score, flags: L2.flags },
          layer3_ThreatIntel: { score: L3.score, flags: L3.flags },
          layer4_InternalGraph: { score: L4.score, flags: L4.flags },
        },
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Forensic API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}
