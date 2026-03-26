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

  // 3. DNS Resolution
  try {
    const addresses = await resolve4(domain);
    if (!addresses || addresses.length === 0) {
      throw new Error("No addresses");
    }
  } catch(e) {
    flags.push(`DNS validation failed. Domain ${domain} has no valid IPv4 records (Offline or Fake).`);
    score += 40;
  }

  // 4. RDAP Domain Age Lookup
  try {
    // We will extract the root domain since RDAP query for full subdomains usually fails
    // e.g., for secure.login.paypal.com.scam.net we want scam.net
    const parts = domain.split(/[.]/);
    const rootDomain = parts.length > 1 ? parts.slice(-2).join('.') : domain;

    // We use rdap.org as a generic bootstrap server
    // Added an AbortSignal to timeout quickly and not stall the validator
    const rdapRes = await fetch(`https://rdap.org/domain/${rootDomain}`, {
      method: "GET",
      headers: { "Accept": "application/rdap+json" },
      signal: AbortSignal.timeout(4000)
    });

    if (rdapRes.ok) {
      const rdapData = await rdapRes.json();
      const events = rdapData.events || [];
      const registrationEvent = events.find((e: any) => e.eventAction === "registration");
      
      if (registrationEvent && registrationEvent.eventDate) {
        const creationDate = new Date(registrationEvent.eventDate);
        const MathNodeJS = Math; // Avoid collision if any
        const ageInDays = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (ageInDays < 30) {
           score += 65;
           flags.push(`CRITICAL: Domain is extremely new (${MathNodeJS.floor(ageInDays)} days old). High probability of being a burner phishing domain.`);
        } else if (ageInDays < 90) {
           score += 35;
           flags.push(`Suspicious: Domain is relatively new (${MathNodeJS.floor(ageInDays)} days old). Proceed with caution.`);
        } else {
           // Older domains carry inherent trust. Deduct risk score.
           score -= 10;
        }
      }
    }
  } catch (e) {
    // RDAP failed (domain extension not supported or timeout), fail silently
    // We do not push a flag here because many obscure foreign TLDs don't support RDAP well
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    flags,
    analyzedDomains: [domain]
  };
}
