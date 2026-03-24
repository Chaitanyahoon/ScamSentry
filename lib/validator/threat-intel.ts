export async function analyzeThreatIntel(urls: string[]) {
  if (urls.length === 0) return { score: 0, flags: [] };

  let score = 0;
  const flags: string[] = [];

  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

  if (!apiKey) {
    flags.push("Threat Intel: Safe Browsing checks skipped (API Key not configured).");
    return { score: 0, flags };
  }

  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
  
  const payload = {
    client: {
      clientId: "scamsentry-validator",
      clientVersion: "1.0.0"
    },
    threatInfo: {
      threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: urls.map(url => ({ url }))
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      if (data.matches && data.matches.length > 0) {
        score += 100; // Instant critical failure
        const maliciousUrls = Array.from(new Set(data.matches.map((m: any) => m.threat.url)));
        flags.push(`CRITICAL: Google Safe Browsing flagged these URLs as malicious: ${maliciousUrls.join(", ")}`);
      } else {
        flags.push("Threat Intel: URLs cleared by Safe Browsing databases.");
      }
    } else {
      flags.push("Threat Intel: API responded with an error, skipping layer.");
    }
  } catch (e) {
    flags.push("Threat Intel: Failed to connect to verification servers.");
  }

  return { score: Math.min(score, 100), flags };
}
