export const MALICIOUS_URL_DICTIONARIES = {
  sketchyTLDs:
    /\.(xyz|top|buzz|cn|ru|cc|pw|su|info|loan|club|work|gq|win|bid|tk|ml|ga|cf|zip|ltd|review|hair|racing|science|online|site|space|store|download|stream|webcam|accountant|date|men|monster)$/i,
  urlShorteners:
    /^(https?:\/\/)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|shorte\.st|cutt\.ly|cli\.gs|v\.gd|bitly|short\.link|shor\.by|tiny\.cc|link\.to|qr\.link)\//i,
  spoofedBrands:
    /(paypal|apple|google|microsoft|amazon|netflix|meta|facebook|instagram|bankofamerica|chase|wellsfargo|binance|coinbase|stripe|twitch|adobe|dropbox|uber|airbnb|spotify)-?(login|secure|verify|update|support|auth|billing|account|confirm|validate|check)/i,
  suspiciousKeywords:
    /(free-iphone|hack|crack|cheats|generator|giveaway|claim-prize|free-money|verification-required|update-payment|urgent-action|account-suspended|confirm-identity|unusual-activity|click-here|act-now|limited-time|verify-account|unlock-account|suspicious-activity|click-link|validate-card|re-enter-password)/i,
  freeHosting:
    /\.(000webhostapp|herokuapp|vercel|netlify|onrender|pythonanywhere|duckdns|bounceme|no-ip|ngrok|replit|github\.io|pages|surge\.sh|netlify\.app|vercel\.app)\./i,
  ipAddressMask: /^(https?:\/\/)?((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/i,
  punycode: /xn--/i,
  suspiciousPaths:
    /\/(login|secure|verify|update|account|reset|authenticate|oauth|checkout|billing|support|admin|panel|confirm|validate|check|confirm-identity|unusual-activity|re-enter|re-verify|security|alert)\b/i,
  embeddedRedirect: /@|%40|\/(?:goto|redirect|info|download|click|action|callback|confirm|validate)\//i,
  credentialHarvesting: /password|passwd|pwd|secret|token|key|credential|auth|login|username|email/i,
  numberReplace: /0=o|1=i|3=e|5=s|7=t|8=b|9=g/i,
  homoglyphPatterns: /[il1][il1]{1,}|[o0]{1,}o[o0]{1,}|[rn]{2,}/i,
};

export const TARGET_BRANDS = [
  "paypal",
  "apple",
  "google",
  "microsoft",
  "amazon",
  "netflix",
  "meta",
  "facebook",
  "instagram",
  "chase",
  "wellsfargo",
  "binance",
  "coinbase",
  "linkedin",
  "twitter",
  "whatsapp",
  "tiktok",
  "steam",
  "discord",
  "bankofamerica",
  "citi",
  "chasebank",
  "americanexpress",
  "capitalone",
  "stripe",
  "twitch",
  "adobe",
  "dropbox",
  "uber",
  "airbnb",
  "spotify",
  "slack",
  "github",
  "gitlab",
];

function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0),
  );
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }
  return matrix[a.length][b.length];
}

function calculateEntropy(str: string): number {
  if (!str) return 0;
  const len = str.length;
  const frequencies = Array.from(str).reduce(
    (freq, char) => {
      freq[char] = (freq[char] || 0) + 1;
      return freq;
    },
    {} as Record<string, number>,
  );

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
    flags.push(
      "CRITICAL: URL uses a direct IP address (Masking the domain name).",
    );
  }

  // 2. Punycode / Homograph Attack Detection
  if (MALICIOUS_URL_DICTIONARIES.punycode.test(url)) {
    score += 70;
    flags.push(
      "CRITICAL: Punycode (xn--) detected. Likely a homograph attack spoofing a legitimate brand.",
    );
  }

  // 3. Free Hosting / Dynamic DNS Abuse
  if (MALICIOUS_URL_DICTIONARIES.freeHosting.test(url)) {
    score += 45;
    flags.push(
      "High Risk: Domain relies on free hosting or Dynamic DNS, commonly abused by burner phishing sites.",
    );
  }

  // 4. Sketchy Top-Level Domains
  if (MALICIOUS_URL_DICTIONARIES.sketchyTLDs.test(url)) {
    score += 50;
    flags.push(
      "High Risk: Domain belongs to a low-trust TLD highly correlated with spam and malware.",
    );
  }

  // 5. Link Shorteners (Hiding the destination)
  if (MALICIOUS_URL_DICTIONARIES.urlShorteners.test(url)) {
    score += 40;
    flags.push("Suspicious: URL is hidden behind a URL shortener service.");
  }

  // 6. Spoofed Brands (Keyword Regex)
  if (MALICIOUS_URL_DICTIONARIES.spoofedBrands.test(url)) {
    score += 90;
    flags.push(
      "CRITICAL: URL structure mimics official brands using phishing keywords (e.g., login/verify).",
    );
  }

  // 7. Suspicious General Keywords
  if (MALICIOUS_URL_DICTIONARIES.suspiciousKeywords.test(url)) {
    score += 30;
    flags.push(
      "Suspicious: URL contains high-risk scam incentive or urgency terminology.",
    );
  }

    // 8. Deep Parsing (Subdomains, HTTPS, Ports, Dashes, Typosquatting, Entropy)
    try {
      const domainObj = new URL(url.startsWith("http") ? url : `http://${url}`);

      if (domainObj.protocol === "http:" && url.includes("login")) {
        score += 40;
        flags.push(
          "High Risk: URL requests login credentials over an unencrypted HTTP connection."
        );
      }

      if (domainObj.port && !["80", "443"].includes(domainObj.port)) {
        score += 30;
        flags.push("Suspicious: URL points to a non-standard network port.");
      }

      const parts = domainObj.hostname.split(".");
      if (parts.length > 4) {
        score += 40;
        flags.push(
          "Suspicious: Excessive subdomains commonly used to spoof legitimate root domains."
        );
      }

      // Detect `google.com.example.com` style deliveries that abuse brand subdomain
      if (
        parts.length > 2 &&
        TARGET_BRANDS.some((b) =>
          domainObj.hostname.match(new RegExp(`(^|\\.)${b}\\.`, "i"))
        )
      ) {
        score += 90;
        flags.push(
          "CRITICAL: Suspicious subdomain includes a major brand name as an embedded component."
        );
      }

      const dashCount = (domainObj.hostname.match(/-/g) || []).length;
      if (dashCount >= 3) {
        score += 35;
        flags.push(
          "Suspicious: Hostname uses excessive hyphen-stuffing, a common SEO/phishing obfuscation tactic."
        );
      }

      // NEW: Path & Query Entropy Analysis
      const fullPath = domainObj.pathname + domainObj.search;
      if (fullPath.length > 30) {
        const pathEntropy = calculateEntropy(fullPath);
        // Standard tokens like JWT/State frequently hit 4.5+. 
        // We increase threshold to 5.2 to catch extreme obfuscation/DGA/Base64 masking.
        if (pathEntropy > 5.2) {
          score += 40;
          flags.push(
            `High Risk: URL path/query has extreme entropy (${pathEntropy.toFixed(2)}). Heavy obfuscation marker.`
          );
        }
      }

      // Path-based anomalies
      if (
        MALICIOUS_URL_DICTIONARIES.suspiciousPaths.test(
          domainObj.pathname + domainObj.search
        )
      ) {
        score += 35;
        flags.push(
          "Suspicious: URL path/query includes known phishing trigger words."
        );
      }

      if (MALICIOUS_URL_DICTIONARIES.embeddedRedirect.test(domainObj.href)) {
        score += 30;
        flags.push(
          "Suspicious: URL contains embedded redirect or tracking markers."
        );
      }

      if (domainObj.pathname.length > 80 || domainObj.search.length > 80) {
        score += 20;
        flags.push(
          "Suspicious: URL path or query is unusually long, indicating hidden nested redirects."
        );
      }

      // Credential harvesting detection
      if (
        MALICIOUS_URL_DICTIONARIES.credentialHarvesting.test(
          domainObj.pathname + domainObj.search
        )
      ) {
        score += 25;
        flags.push(
          "Suspicious: URL contains credential-related keywords (password, token, auth)."
        );
      }

      // Homoglyph character confusion detection
      if (MALICIOUS_URL_DICTIONARIES.homoglyphPatterns.test(domainObj.hostname)) {
        score += 45;
        flags.push(
          "High Risk: Hostname uses character homoglyphs (visually similar characters) to spoof legitimate domains."
        );
      }

      // Query string parameter suspicion check
      const queryParams = domainObj.searchParams;
      let suspiciousParamCount = 0;
      for (const [key, value] of queryParams.entries()) {
        if (
          /redirect|callback|return|url|link|goto|redir|next|back|continue/i.test(
            key
          )
        ) {
          suspiciousParamCount++;
        }
        if (value && value.length > 100) {
          suspiciousParamCount++;
        }
      }
      if (suspiciousParamCount >= 2) {
        score += 40;
        flags.push(
          `High Risk: URL contains ${suspiciousParamCount} suspicious redirect/callback parameters.`
        );
      }

      // DGA / Entropy Check
      const hostnameWithoutTld =
        parts.length > 1 ? parts.slice(0, -1).join("") : domainObj.hostname;
      const entropy = calculateEntropy(hostnameWithoutTld);
      if (entropy > 4.0 && hostnameWithoutTld.length > 10) {
        score += 50;
        flags.push(
          `High Risk: Hostname has abnormally high entropy (${entropy.toFixed(2)}). Likely generated by a Domain Generation Algorithm (DGA).`
        );
      }

      // NEW: Enhanced Levenshtein Typosquatting Check
      let isTyposquat = false;
      for (const part of parts) {
        if (part.length < 4) continue;
        for (const brand of TARGET_BRANDS) {
          if (part === brand) {
            const rootDomainIndex = parts.length - 2;
            const currentPartIndex = parts.indexOf(part);
            if (currentPartIndex !== rootDomainIndex && parts.length >= 2) {
              score += 85;
              flags.push(
                `CRITICAL: Subdomain explicitly spoofing major brand '${brand}'.`
              );
              isTyposquat = true;
              break;
            }
          } else {
            const dist = levenshteinDistance(part, brand);
            // Catch lookalikes: dist 1 is critical, dist 2 is high-suspicion for long names
            if (dist === 1 || (dist === 2 && part.length > 8)) {
              score += 80;
              flags.push(
                `CRITICAL: Advanced Typosquatting detected. '${part}' visually mimics '${brand}'.`
              );
              isTyposquat = true;
              break;
            }
          }
        }
        if (isTyposquat) break;
      }
    } catch (e) {
      score += 20;
      flags.push(
        "Warning: Target URL failed to parse perfectly, possible obfuscation."
      );
    }

  return {
    score: Math.min(score, 100),
    flags,
  };
}
