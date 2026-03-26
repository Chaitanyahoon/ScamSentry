export const MALICIOUS_URL_DICTIONARIES = {
  sketchyTLDs: /\.(xyz|top|buzz|cn|ru|cc|pw|su|info|loan|club|work|gq|win|bid|tk|ml|ga|cf|gq|zip|ltd)$/i,
  urlShorteners: /^(https?:\/\/)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|shorte\.st|cutt\.ly|cli\.gs|v\.gd)\//i,
  spoofedBrands: /(paypal|apple|google|microsoft|amazon|netflix|meta|facebook|instagram|bankofamerica|chase|wellsfargo|binance|coinbase)-?(login|secure|verify|update|support|auth|billing|account)/i,
  suspiciousKeywords: /(free-iphone|hack|crack|cheats|generator|giveaway|claim-prize|free-money|verification-required|update-payment|urgent-action|account-suspended)/i,
  freeHosting: /\.(000webhostapp|herokuapp|vercel|netlify|onrender|pythonanywhere|duckdns|bounceme|no-ip|ngrok)\./i,
  ipAddressMask: /^(https?:\/\/)?((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/i,
  punycode: /xn--/i,
};

export const TARGET_BRANDS = [
  "paypal", "apple", "google", "microsoft", "amazon", "netflix", 
  "meta", "facebook", "instagram", "chase", "wellsfargo", "binance", "coinbase",
  "linkedin", "twitter", "whatsapp", "tiktok", "steam", "discord",
  "bankofamerica", "citi", "chasebank", "americanexpress", "capitalone"
];

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

function calculateEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const frequencies = Array.from(str).reduce((freq, char) => {
    freq[char] = (freq[char] || 0) + 1;
    return freq;
  }, {} as Record<string, number>);

  return Object.values(frequencies).reduce((sum, count) => {
    const p = count / len;
    return sum - p * Math.log2(p);
  }, 0);
}

export function analyzeHeuristics(inputUrl: string) {
  let score = 0;
  const flags: string[] = [];
  const url = inputUrl.trim().toLowerCase();

  // 1. IP Address Masking
  if (MALICIOUS_URL_DICTIONARIES.ipAddressMask.test(url)) {
    score += 80;
    flags.push("CRITICAL: URL uses a direct IP address (Masking the domain name).");
  }

  // 2. Punycode / Homograph Attack Detection
  if (MALICIOUS_URL_DICTIONARIES.punycode.test(url)) {
    score += 70;
    flags.push("CRITICAL: Punycode (xn--) detected. Likely a homograph attack spoofing a legitimate brand.");
  }

  // 3. Free Hosting / Dynamic DNS Abuse
  if (MALICIOUS_URL_DICTIONARIES.freeHosting.test(url)) {
    score += 45;
    flags.push("High Risk: Domain relies on free hosting or Dynamic DNS, commonly abused by burner phishing sites.");
  }

  // 4. Sketchy Top-Level Domains
  if (MALICIOUS_URL_DICTIONARIES.sketchyTLDs.test(url)) {
    score += 50;
    flags.push("High Risk: Domain belongs to a low-trust TLD highly correlated with spam and malware.");
  }

  // 5. Link Shorteners (Hiding the destination)
  if (MALICIOUS_URL_DICTIONARIES.urlShorteners.test(url)) {
    score += 40;
    flags.push("Suspicious: URL is hidden behind a URL shortener service.");
  }

  // 6. Spoofed Brands (Keyword Regex)
  if (MALICIOUS_URL_DICTIONARIES.spoofedBrands.test(url)) {
    score += 90;
    flags.push("CRITICAL: URL structure mimics official brands using phishing keywords (e.g., login/verify).");
  }

  // 7. Suspicious General Keywords
  if (MALICIOUS_URL_DICTIONARIES.suspiciousKeywords.test(url)) {
    score += 30;
    flags.push("Suspicious: URL contains high-risk scam incentive or urgency terminology.");
  }

  // 8. Deep Parsing (Subdomains, HTTPS, Ports, Dashes, Typosquatting, Entropy)
  try {
    const domainObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    
    if (domainObj.protocol === "http:" && url.includes("login")) {
      score += 40;
      flags.push("High Risk: URL requests login credentials over an unencrypted HTTP connection.");
    }

    if (domainObj.port && !['80', '443'].includes(domainObj.port)) {
      score += 30;
      flags.push("Suspicious: URL points to a non-standard network port.");
    }

    const parts = domainObj.hostname.split('.');
    if (parts.length > 4) {
      score += 40;
      flags.push("Suspicious: Excessive subdomains commonly used to spoof legitimate root domains.");
    }

    const dashCount = (domainObj.hostname.match(/-/g) || []).length;
    if (dashCount >= 3) {
      score += 35;
      flags.push("Suspicious: Hostname uses excessive hyphen-stuffing, a common SEO/phishing obfuscation tactic.");
    }

    // New: DGA / Entropy Check
    // We check the entropy of the hostname (excluding TLD)
    const hostnameWithoutTld = parts.length > 1 ? parts.slice(0, -1).join("") : domainObj.hostname;
    const entropy = calculateEntropy(hostnameWithoutTld);
    if (entropy > 4.0 && hostnameWithoutTld.length > 10) {
       score += 50;
       flags.push(`High Risk: Hostname has abnormally high entropy (${entropy.toFixed(2)}). Likely generated by a Domain Generation Algorithm (DGA).`);
    }

    // New: Levenshtein Typosquatting Check
    // We check against TARGET_BRANDS finding distance 1 or 2
    let isTyposquat = false;
    for (const part of parts) {
       if (part.length < 4) continue; // skip very short strings
       for (const brand of TARGET_BRANDS) {
         if (part === brand) {
            // Strict check: if it's the brand exactly, is it acting as a subdomain to a scam root domain?
            const rootDomainIndex = parts.length - 2;
            const currentPartIndex = parts.indexOf(part);
            if (currentPartIndex !== rootDomainIndex && parts.length >= 2) {
               score += 85;
               flags.push(`CRITICAL: Subdomain explicitly spoofing major brand '${brand}'.`);
               isTyposquat = true;
               break;
            }
         } else {
            const dist = levenshteinDistance(part, brand);
            // Catch things like paypa1 (dist 1) or appIe (dist 1)
            if (dist === 1 || (dist === 2 && part.length > 8)) {
               score += 75;
               flags.push(`CRITICAL: Typosquatting detected. '${part}' is a visually similar spoof of '${brand}'.`);
               isTyposquat = true;
               break;
            }
         }
       }
       if (isTyposquat) break;
    }
    
  } catch (e) {
    score += 20;
    flags.push("Warning: Target URL failed to parse perfectly, possible obfuscation.");
  }

  return {
    score: Math.min(score, 100),
    flags,
  };
}
