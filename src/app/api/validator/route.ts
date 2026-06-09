import { NextResponse } from "next/server";
import { analyzeHeuristics } from "@/lib/validator/heuristics";
import { analyzeDomainForensics } from "@/lib/validator/forensics";
import { analyzeThreatIntel } from "@/lib/validator/threat-intel";
import { analyzeInternalGraph } from "@/lib/validator/internal-graph";

/**
 * POST /api/validator
 * UI-Facing Forensic Scan Endpoint.
 * Executes the 4-layer threat validation pipeline offline/locally.
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

    // Attempt to query the FastAPI backend if BACKEND_API_URL or NEXT_PUBLIC_API_URL is configured
    const backendUrl =
      process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;
    if (backendUrl) {
      try {
        // Ensure URL starts with a valid scheme for Pydantic HttpUrl validation
        let targetUrl = input;
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `http://${targetUrl}`;
        }

        console.log(
          `Proxying scan request for: "${targetUrl}" to FastAPI backend: ${backendUrl}`,
        );
        const backendResponse = await fetch(`${backendUrl}/api/v1/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (backendResponse.ok) {
          const data = await backendResponse.json();

          // Map backend response (ScanResponse) back to the frontend format
          const L1 = data.layer_results.find(
            (lr: any) => lr.layer === "L1",
          ) || { score_contribution: 0, details: {} };
          const L2 = data.layer_results.find(
            (lr: any) => lr.layer === "L2",
          ) || { score_contribution: 0, details: {} };
          const L3 = data.layer_results.find(
            (lr: any) => lr.layer === "L3",
          ) || { score_contribution: 0, details: {} };
          const L4 = data.layer_results.find(
            (lr: any) => lr.layer === "L4",
          ) || { score_contribution: 0, details: {} };

          const finalScore = 100 - data.risk_score;

          let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
          if (data.risk_level === "dangerous") riskLevel = "Critical Threat";
          else if (data.risk_level === "suspicious") riskLevel = "Suspicious";

          // Map details to visual flags matching frontend component structure
          const l1Flags = L1.details.triggered_rules || [];
          const l2Flags = L2.details.triggered_checks || [];

          const l3Flags: string[] = [];
          if (L3.details.matches && Array.isArray(L3.details.matches)) {
            L3.details.matches.forEach((m: any) => {
              l3Flags.push(
                `CRITICAL: Google Safe Browsing flagged threat: ${m.threat_type} on ${m.platform}`,
              );
            });
          } else if (L3.details.error) {
            l3Flags.push(
              `Warning: Threat Intel check skipped/failed: ${L3.details.error}`,
            );
          }

          const l4Flags: string[] = [];
          if (L4.details.match) {
            const m = L4.details.match;
            const verifiedLabel = m.verified ? "Verified" : "Unverified";
            l4Flags.push(
              `CRITICAL: Internal Graph Ledger Match: ${verifiedLabel} ${m.threat_type} (confidence: ${m.confidence}%)`,
            );
          }

          return NextResponse.json(
            {
              success: true,
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
          const errText = await backendResponse.text();
          console.warn(
            `Backend responded with error status ${backendResponse.status}: ${errText}. Falling back to local analysis.`,
          );
        }
      } catch (err) {
        console.error(
          "Error connecting to backend. Falling back to local analysis:",
          err,
        );
      }
    }

    // ── FALLBACK: Execute Local Next.js Threat Validation Pipeline ──

    // 1. Execute L1 Heuristics
    const L1 = analyzeHeuristics(input);

    // Extract nested URLs if scanning text body
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];

    // 2. Parallel execution of L2 DNS Forensics, L3 Threat Intel, and L4 Internal Trust Ledger
    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls),
    ]);

    // 3. Score aggregation
    const combinedRisk = Math.min(
      L1.score + L2.score + L3.score + L4.score,
      100,
    );
    const finalScore = 100 - combinedRisk;

    // 4. Map risk thresholds (inverse: high score is secure, low score is threat)
    let riskLevel: "Secure" | "Suspicious" | "Critical Threat" = "Secure";
    if (finalScore <= 30) riskLevel = "Critical Threat";
    else if (finalScore <= 70) riskLevel = "Suspicious";

    return NextResponse.json(
      {
        success: true,
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
