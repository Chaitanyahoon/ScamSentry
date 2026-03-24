export async function analyzeAIContent(input: string) {
  let score = 0;
  const flags: string[] = [];

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    flags.push("AI Semantic Analysis: Skipped (API Key not configured).");
    return { score: 0, flags, aiActive: false };
  }

  const aiPromise = async () => {
    const prompt = `You are a cybersecurity URL analyst. Analyze the following URL structure for signs of phishing, spoofing, or malicious intent.
    Look for:
    1. Look-alike domains (e.g. paypa1.com, g00gle.com, amaz0n-support.com)
    2. Weird subdomain structures (e.g. login.secure-account.web.com)
    3. Suspicious paths attempting to spoof legitimate files.
    4. Random strings of characters indicating procedurally generated spam domains.
    
    Respond strictly in JSON format:
    {
      "riskScore": (Number between 0-100),
      "flags": ["array", "of", "detected", "anomalies", "or", "reasons"]
    }
    
    URL to analyze:
    "${input}"`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) throw new Error("Empty response");
      
      const result = JSON.parse(responseText);
      return {
        score: Number(result.riskScore) || 0,
        flags: result.flags || [],
        aiActive: true
      };
    } catch (e) {
      throw new Error("AI Generation failed");
    }
  };

  const timeoutPromise = new Promise<{ score: number, flags: string[], aiActive: boolean }>((_, reject) => {
    setTimeout(() => {
      reject(new Error("AI Timeout"));
    }, 3000); 
  });

  try {
    const result = await Promise.race([aiPromise(), timeoutPromise]);
    const prefixedFlags = result.flags.map((f: string) => `AI Analysis: ${f}`);
    return { ...result, flags: prefixedFlags };
  } catch (error) {
    flags.push("⚠️ AI Engine Offline or Timed Out.");
    return { score: 0, flags, aiActive: false }; 
  }
}
