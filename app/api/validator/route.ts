import { NextResponse } from 'next/server';
import { analyzeHeuristics } from '@/lib/validator/heuristics';
import { analyzeDomainForensics } from '@/lib/validator/forensics';
import { analyzeThreatIntel } from '@/lib/validator/threat-intel';
import { analyzeInternalGraph } from '@/lib/validator/internal-graph';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: "Valid string input is required" }, { status: 400 });
    }

    // Layer 1 operates synchronously and instantly
    const L1 = analyzeHeuristics(input);
    
    // Execute Layers 2, 4, and 3 concurrently (fast network checks without expensive AI)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];
    
    // Ensure ThreatIntel gets the extracted URLs or the raw input if it somehow didn't parse but passed as a string
    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls.length > 0 ? urls : [input])
    ]);

    // Aggregate Final Risk Score
    const combinedRisk = L1.score + L2.score + L3.score + L4.score;
    const rawRiskScore = Math.min(combinedRisk, 100);
    const finalScore = 100 - rawRiskScore; // Inverted: 100 = Safe, 0 = Critical
    
    let riskLevel = "Secure";
    // Slightly tweaked thresholds now that AI is gone and logic scales to 100 faster
    if (finalScore <= 30) riskLevel = "Critical Threat";
    else if (finalScore <= 70) riskLevel = "Suspicious";

    const forensicReport = {
      layer1_Heuristics: L1,
      layer2_Forensics: L2,
      layer3_ThreatIntel: L3,
      layer4_InternalGraph: L4,
      layer5_AI_Semantics: {
         score: 0,
         flags: ["Disabled: System upgraded to deterministic logic engine for instant validation without AI latency."],
         aiActive: false
      }
    };

    return NextResponse.json({
      success: true,
      finalScore,
      riskLevel,
      forensicReport
    });
  } catch (error) {
    console.error("Validator Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
