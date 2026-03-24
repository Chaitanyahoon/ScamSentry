import { NextResponse } from 'next/server';
import { analyzeHeuristics } from '@/lib/validator/heuristics';
import { analyzeDomainForensics } from '@/lib/validator/forensics';
import { analyzeThreatIntel } from '@/lib/validator/threat-intel';
import { analyzeInternalGraph } from '@/lib/validator/internal-graph';
import { analyzeAIContent } from '@/lib/validator/ai-semantics';

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
    
    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls)
    ]);

    // Calculate preliminary risk score before deciding to call Gemini
    const preliminaryRisk = L1.score + L2.score + L3.score + L4.score;

    // Layer 5 (Gemini API) Optimization:
    // Only query if the URL hasn't already breached the "Critical Threat" threshold (80+ penalty = 20 score)
    let L5 = { score: 0, flags: ["System Bypassed: Threat already verified deterministically."], aiActive: false };
    if (preliminaryRisk < 80) {
      try {
        L5 = await analyzeAIContent(input);
      } catch (e) {
        console.error("Gemini invocation failed, continuing without semantics", e);
      }
    }

    // Aggregate Final Risk Score
    const combinedRisk = preliminaryRisk + L5.score;
    const rawRiskScore = Math.min(combinedRisk, 100);
    const finalScore = 100 - rawRiskScore; // Inverted: 100 = Safe, 0 = Critical
    
    let riskLevel = "Secure";
    if (finalScore <= 20) riskLevel = "Critical Threat";
    else if (finalScore <= 60) riskLevel = "Suspicious";

    const forensicReport = {
      layer1_Heuristics: L1,
      layer2_Forensics: L2,
      layer3_ThreatIntel: L3,
      layer4_InternalGraph: L4,
      layer5_AI_Semantics: L5
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
