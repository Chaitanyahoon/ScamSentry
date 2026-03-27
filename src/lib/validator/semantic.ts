import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface SemanticAnalysisResult {
  score: number;
  flags: string[];
  explanation: string;
}

/**
 * Layer 5 (Semantic Intelligence)
 * Analyzes the intent and predatory language of a URL or message payload.
 * Only triggered for "Suspicious" scores (deterministic L1-L4 between 20-60).
 */
export async function analyzeSemanticIntent(payload: string): Promise<SemanticAnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    return { 
      score: 0, 
      flags: ["ERROR: GEMINI_API_KEY not set"],
      explanation: "AI analysis skipped: API key missing" 
    };
  }

  try {
    const prompt = `
      Analyze the following message or URL for predatory intent, employment scams, or phishing tactics.
      ScamSentry Context: We protect job seekers from "too good to be true" offers, fake recruiters, and data theft.
      
      Look for:
      - Urgency/Pressure tactics
      - Promise of unrealistic pay for low effort
      - Request for sensitive info (SSN, Bank, Telegram/WhatsApp redirect)
      - Unofficial/suspicious recruiter email patterns
      
      Input: "${payload}"
      
      Respond in JSON format:
      {
        "score": (number 0-100, where 100 is highly malicious/scam),
        "flags": (array of strings for specific indicators),
        "brief_reasoning": (short forensic summary)
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean JSON response (handle potential markdown formatting)
    const jsonStr = responseText.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    return {
      score: data.score || 0,
      flags: data.flags || [],
      explanation: data.brief_reasoning || "No reasoning provided"
    };
  } catch (error) {
    console.error("Semantic L5 Error:", error);
    return { 
      score: 0, 
      flags: ["L5_ANALYSIS_FAILED"], 
      explanation: error instanceof Error ? error.message : "Internal AI failure" 
    };
  }
}
