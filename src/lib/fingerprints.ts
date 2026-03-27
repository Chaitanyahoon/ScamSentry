import { createHash } from "crypto";

export interface ForensicFingerprint {
  hash: string;
  components: string[];
  severity: "low" | "medium" | "high";
}

/**
 * Forensic Fingerprinting
 * Generates a unique "Threat Signature" based on structural and behavioral indicators.
 * Used for tracking campaign clusters across different URLs.
 */
export function generateThreatFingerprint(
  url: string,
  flags: string[],
  scores: Record<string, number>,
  infrastructure?: { nameservers?: string[], registrar?: string }
): ForensicFingerprint {
  const components: string[] = [];

  // 1. Structural Fingerprint (normalized flags)
  const sortedFlags = [...new Set(flags)].sort();
  components.push(`flags:${sortedFlags.join(",")}`);

  // 2. Entropy / Pattern Fingerprint
  try {
    const domain = new URL(url).hostname;
    const entropy = calculateEntropy(domain);
    components.push(`entropy:${entropy.toFixed(2)}`);
  } catch {
    components.push("entropy:invalid-url");
  }

  // 3. Infrastructure Fingerprint (NEW: Cluster tracking)
  if (infrastructure?.nameservers && infrastructure.nameservers.length > 0) {
    const sortedNS = [...new Set(infrastructure.nameservers)].sort();
    components.push(`ns:${sortedNS.join(",")}`);
  }
  if (infrastructure?.registrar) {
    components.push(`registrar:${infrastructure.registrar}`);
  }

  // 4. Score Profile (coarse-grained for clustering)
  const profile = Object.entries(scores)
    .map(([key, val]) => `${key[0]}${Math.floor(val / 10)}`)
    .join("");
  components.push(`profile:${profile}`);

  // Generate Hash
  const hash = createHash("sha256")
    .update(components.join("|"))
    .digest("hex")
    .substring(0, 16);

  // Calculate Severity
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const severity = totalScore > 70 ? "high" : totalScore > 30 ? "medium" : "low";

  return { hash, components, severity };
}

function calculateEntropy(str: string): number {
  const len = str.length;
  if (len === 0) return 0;
  
  const freqs: Record<string, number> = {};
  for (const char of str) {
    freqs[char] = (freqs[char] || 0) + 1;
  }
  
  return Object.values(freqs).reduce((sum, f) => {
    const p = f / len;
    return sum - p * Math.log2(p);
  }, 0);
}
