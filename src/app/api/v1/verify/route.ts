import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { analyzeHeuristics } from '@/lib/validator/heuristics';
import { analyzeDomainForensics } from '@/lib/validator/forensics';
import { analyzeThreatIntel } from '@/lib/validator/threat-intel';
import { analyzeInternalGraph } from '@/lib/validator/internal-graph';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // 1. Authenticate API Key
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
       return NextResponse.json({ error: "Missing or invalid Authorization header. Expected 'Bearer ss_live_...'." }, { status: 401 });
    }
    const apiKey = authHeader.split('Bearer ')[1].trim();

    // Verify key in Firestore
    const keysRef = collection(db, "api_keys");
    const q = query(keysRef, where("key", "==", apiKey), where("status", "==", "active"));
    const keySnapshot = await getDocs(q);

    if (keySnapshot.empty) {
       return NextResponse.json({ error: "Invalid or revoked API key." }, { status: 401 });
    }
    
    const keyDoc = keySnapshot.docs[0];
    const keyData = keyDoc.data();

    // Rate Limiting (Hard Cap)
    const planLimit = keyData.planLimit || 1000;
    const usageCount = keyData.usageCount || 0;
    if (usageCount >= planLimit) {
       return NextResponse.json({ error: `API plan quota exceeded. Limit is ${planLimit} requests.` }, { status: 429 });
    }

    // 2. Parse Input URL
    const body = await req.json();
    const input = body.url;
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: "Valid 'url' string is required in the JSON body." }, { status: 400 });
    }

    // 3. Execution Engine
    const L1 = analyzeHeuristics(input);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = input.match(urlRegex) || [];
    
    const [L2, L4, L3] = await Promise.all([
      analyzeDomainForensics(input),
      analyzeInternalGraph(input),
      analyzeThreatIntel(urls.length > 0 ? urls : [input])
    ]);

    const combinedRisk = L1.score + L2.score + L3.score + L4.score;
    const rawRiskScore = Math.min(combinedRisk, 100);
    const finalScore = 100 - rawRiskScore;
    
    let riskLevel = "Secure";
    if (finalScore <= 30) riskLevel = "Critical Threat";
    else if (finalScore <= 70) riskLevel = "Suspicious";

    const forensicReport = {
      layer1_Heuristics: L1,
      layer2_Forensics: L2,
      layer3_ThreatIntel: L3,
      layer4_InternalGraph: L4
    };

    // 4. Increment Usage Asynchronously
    // We update the doc without awaiting to return the response slightly faster to client
    updateDoc(doc(db, "api_keys", keyDoc.id), {
       usageCount: increment(1),
       lastUsedAt: new Date().toISOString()
    }).catch(e => console.error("Failed to increment API usage:", e));

    // 5. Return JSON Payload
    return NextResponse.json({
      success: true,
      data: {
         target_url: input,
         finalScore,
         riskLevel,
         forensicReport
      }
    });

  } catch (error: any) {
    console.error("Public API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
