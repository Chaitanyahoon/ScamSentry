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
        { status: 400 }
      );
    }

    const input = body.input.trim();
    
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
    const combinedRisk = Math.min(L1.score + L2.score + L3.score + L4.score, 100);
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
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Forensic API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
