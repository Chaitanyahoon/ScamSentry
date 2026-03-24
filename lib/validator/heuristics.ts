export const MALICIOUS_URL_DICTIONARIES = {
  sketchyTLDs: /\.(xyz|top|buzz|cn|ru|cc|pw|su|info|loan|club|work|gq|win|bid|tk|ml|ga|cf|gq|zip|ltd)$/i,
  urlShorteners: /^(https?:\/\/)?(bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|adf\.ly|shorte\.st|cutt\.ly|cli\.gs|v\.gd)\//i,
  spoofedBrands: /(paypal|apple|google|microsoft|amazon|netflix|meta|facebook|instagram|bankofamerica|chase|wellsfargo|binance|coinbase)-?(login|secure|verify|update|support|auth|billing|account)/i,
  suspiciousKeywords: /(free-iphone|hack|crack|cheats|generator|giveaway|claim-prize|free-money|verification-required|update-payment|urgent-action|account-suspended)/i,
  freeHosting: /\.(000webhostapp|herokuapp|vercel|netlify|onrender|pythonanywhere|duckdns|bounceme|no-ip|ngrok)\./i,
  ipAddressMask: /^(https?:\/\/)?((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}/i,
  punycode: /xn--/i,
};

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

  // 6. Spoofed Brands (Phishing)
  if (MALICIOUS_URL_DICTIONARIES.spoofedBrands.test(url)) {
    score += 90;
    flags.push("CRITICAL: URL structure mimics official brands using phishing keywords (e.g., login/verify).");
  }

  // 7. Suspicious General Keywords
  if (MALICIOUS_URL_DICTIONARIES.suspiciousKeywords.test(url)) {
    score += 30;
    flags.push("URL contains high-risk scam incentive or urgency terminology.");
  }

  // 8. Deep Parsing (Subdomains, HTTPS, Ports, Dashes)
  try {
    const domainObj = new URL(url.startsWith('http') ? url : `http://${url}`);
    
    // Check for HTTP instead of HTTPS (combined with a login intent, this is deadly)
    if (domainObj.protocol === "http:" && url.includes("login")) {
      score += 40;
      flags.push("High Risk: URL requests login credentials over an unencrypted HTTP connection.");
    }

    // Check for non-standard ports hiding services
    if (domainObj.port && !['80', '443'].includes(domainObj.port)) {
      score += 30;
      flags.push("Suspicious: URL points to a non-standard network port.");
    }

    // Exploded subdomains (e.g., login.secure.paypal.com.scam.net)
    const parts = domainObj.hostname.split('.');
    if (parts.length > 4) {
      score += 40;
      flags.push("Suspicious: Excessive subdomains commonly used to spoof legitimate root domains.");
    }

    // Dash-stuffing in the hostname (e.g., secure-login-account-update-amazon-billing.com)
    const dashCount = (domainObj.hostname.match(/-/g) || []).length;
    if (dashCount >= 3) {
      score += 35;
      flags.push("Suspicious: Hostname uses excessive hyphen-stuffing, a common SEO/phishing obfuscation tactic.");
    }
    
  } catch (e) {
    // Malformed URLs inherently carry risk
    score += 20;
    flags.push("Warning: Target URL failed to parse perfectly, possible obfuscation.");
  }

  return {
    score: Math.min(score, 100),
    flags,
  };
}
