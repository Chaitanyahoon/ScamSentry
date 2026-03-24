import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);

export async function analyzeDomainForensics(inputUrl: string) {
  let score = 0;
  const flags: string[] = [];

  let urlObj;
  try {
    urlObj = new URL(inputUrl.startsWith('http') ? inputUrl : `http://${inputUrl}`);
  } catch (e) {
    return { score: 100, flags: ["CRITICAL: Invalid URL structure."] };
  }

  const domain = urlObj.hostname;

  // 1. Encryption Check
  if (urlObj.protocol === "http:") {
    score += 40;
    flags.push(`Insecure Protocol: URL uses unencrypted HTTP connections.`);
  }

  // 2. IDN Homograph Attack Check (e.g. åpple.com)
  if (/[^\x00-\x7F]/.test(domain)) {
    score += 95;
    flags.push(`CRITICAL: Domain ${domain} contains non-ASCII characters (Possible IDN Homograph Phishing Attack).`);
  }

  // 3. DNS Resolution (Does the site actually exist on the internet?)
  try {
    const addresses = await resolve4(domain);
    if (!addresses || addresses.length === 0) {
      throw new Error("No addresses");
    }
  } catch(e) {
    // If it can't resolve, it's highly suspicious or a broken link, but not necessarily a "scam".
    // Phishing sites often go down quickly.
    flags.push(`DNS validation failed. Domain ${domain} has no valid IPv4 records (Offline or Fake).`);
    score += 40;
  }

  return {
    score: Math.min(score, 100),
    flags,
    analyzedDomains: [domain]
  };
}
