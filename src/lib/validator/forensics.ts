import dns from "dns";
import { promisify } from "util";

const resolve4 = promisify(dns.resolve4);

export async function analyzeDomainForensics(inputUrl: string) {
  let score = 0;
  const flags: string[] = [];

  let urlObj;
  try {
    urlObj = new URL(
      inputUrl.startsWith("http") ? inputUrl : `http://${inputUrl}`,
    );
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
    flags.push(
      `CRITICAL: Domain ${domain} contains non-ASCII characters (Possible IDN Homograph Phishing Attack).`,
    );
  }

  // 3. DNS & Mail Pedigree (MX Record)
  try {
    const addresses = await resolve4(domain);
    if (!addresses || addresses.length === 0) {
      throw new Error("No addresses");
    }

    // Detect fast-flux networks
    const uniqueIps = Array.from(new Set(addresses));
    if (uniqueIps.length > 3) {
      score += 30;
      flags.push(
        `Suspicious: Domain resolves to ${uniqueIps.length} distinct IPs. Possible fast-flux botnet distribution.`
      );
    }

    if (domain.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      score += 80;
      flags.push(
        "CRITICAL: Domain is a raw IP address (No hostname). Extreme risk marker."
      );
    }

    // NEW: Mail Exchange (MX) Record Check
    const resolveMx = promisify(dns.resolveMx);
    const mxRecords = await resolveMx(domain).catch(() => []);
    if (mxRecords.length === 0 && !domain.includes("local")) {
      score += 35;
      flags.push(
        "High Risk: Domain has no Mail Exchange (MX) records. Legitimate business domains rarely skip mail setup."
      );
    } else {
      // Deduct minor risk if professional mail setup exists
      score -= 5;
    }
  } catch (e) {
    flags.push(
      `Forensic Alert: Domain ${domain} failed basic DNS connectivity (Offline or Ghost domain).`
    );
    score += 30;
  }

  // 4. RDAP & Registrar Pedigree
  try {
    // We will extract the root domain since RDAP query for full subdomains usually fails
    // e.g., for secure.login.paypal.com.scam.net we want scam.net
    const parts = domain.split(/[.]/);
    const rootDomain = parts.length > 1 ? parts.slice(-2).join(".") : domain;

    // We use rdap.org as a generic bootstrap server
    // Added an AbortSignal to timeout quickly and not stall the validator
    const rdapRes = await fetch(`https://rdap.org/domain/${rootDomain}`, {
      method: "GET",
      headers: { Accept: "application/rdap+json" },
      signal: AbortSignal.timeout(4000),
    });

    if (rdapRes.ok) {
      const rdapData = await rdapRes.json();
      
      // NEW: Nameserver Reputation Audit
      const nameServers = (rdapData.nameservers || []).map((ns: any) => ns.ldhName || "");
      const suspiciousNS = ["freenom", "freehost", "burner", "disposable"];
      if (nameServers.some((ns: string) => suspiciousNS.some(s => ns.toLowerCase().includes(s)))) {
        score += 40;
        flags.push("High Risk: Domain uses nameservers linked to disposable or high-abuse hosting.");
      }

      const events = rdapData.events || [];
      const registrationEvent = events.find(
        (e: any) => e.eventAction === "registration"
      );

      if (registrationEvent && registrationEvent.eventDate) {
        const creationDate = new Date(registrationEvent.eventDate);
        const ageInDays = (Date.now() - creationDate.getTime()) / (1000 * 60 * 60 * 24);

        if (ageInDays < 15) {
          score += 75;
          flags.push(`CRITICAL: Domain is ultra-new (${Math.floor(ageInDays)} days). High-confidence burner domain signature.`);
        } else if (ageInDays < 60) {
          score += 45;
          flags.push(`High Risk: Domain is very new (${Math.floor(ageInDays)} days). Potential seasonal phishing campaign.`);
        } else {
          score -= 15;
        }
      }
    }
  } catch (e) {
    // Fail silently on RDAP timeout
    // We do not push a flag here because many obscure foreign TLDs don't support RDAP well
  }

  return {
    score: Math.min(Math.max(score, 0), 100),
    flags,
    analyzedDomains: [domain],
  };
}
