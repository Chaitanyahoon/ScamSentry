/**
 * ScamSentry Global Incident & Compromise Scraper
 * 
 * Scrapes cybersecurity incident bulletins from leading news portals (BleepingComputer, TheHackerNews, KrebsOnSecurity RSS),
 * parses brand names under active exploit, and provisions temporary brand lockdown forensices.
 * 
 * 100% Offline-safe, zero-dependency regular-expression XML parser.
 */

import { getAdminDb } from "../firebase-admin";

const ADVISORY_FEEDS = [
  { url: "https://www.bleepingcomputer.com/feed/", name: "BleepingComputer" },
  { url: "https://feeds.feedburner.com/TheHackersNews", name: "The Hacker News" },
  { url: "https://krebsonsecurity.com/feed/", name: "Krebs on Security" }
];

const MONITORED_BRANDS = [
  "vercel",
  "github",
  "paypal",
  "paytm",
  "india",
  "amazon",
  "netflix",
  "google",
  "microsoft",
  "apple",
  "facebook",
  "phonepe",
  "sbi",
  "hdfc",
  "uber",
  "tesla",
  "openai",
  "linkedin",
  "twitter",
  "x.com",
  "whatsapp",
  "telegram",
  "discord"
];

export interface IncidentAlert {
  title: string;
  link: string;
  description: string;
  publishedAt: Date;
  source: string;
  isHighlight: boolean;
}

export async function scrapeCyberIncidents() {
  const stats = {
    processed: 0,
    lockdownsTriggered: 0,
    reportsGenerated: 0,
    errors: 0
  };

  try {
    let db;
    try {
      db = getAdminDb();
    } catch (e) {
      console.warn("[INCIDENT_SCRAPER] Graceful skip: Firebase Admin not configured.");
      return stats;
    }

    const activeLockdownsCol = db.collection("active_brand_lockdowns");
    const incidentsCol = db.collection("global_incidents");

    const cleanCdata = (str: string) => str.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();

    for (const feed of ADVISORY_FEEDS) {
      try {
        console.log(`[INCIDENT_SCRAPER] Fetching advisory feed: ${feed.name}...`);
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Mozilla/5.0 (ScamSentry-Advisory-Scraper/2.5)" },
          cache: "no-store"
        });

        if (!res.ok) {
          throw new Error(`Feed fetch returned status: ${res.status}`);
        }

        const xmlText = await res.text();

        // Parse items using zero-dependency Regex
        const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g) || [];

        console.log(`[INCIDENT_SCRAPER] Parsing ${itemMatches.length} advisory reports from ${feed.name}...`);

        for (const itemXml of itemMatches.slice(0, 20)) {
          const rawTitle = itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "";
          const rawLink = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
          const rawDesc = itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";
          const rawPubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";

          const title = cleanCdata(rawTitle);
          const link = cleanCdata(rawLink);
          const description = cleanCdata(rawDesc);
          const publishedAt = rawPubDate ? new Date(rawPubDate) : new Date();

          if (!title || !link) continue;

          const docId = Buffer.from(link).toString("base64").substring(0, 50).replace(/\+/g, "-").replace(/\//g, "_");

          const scanText = `${title} ${description}`.toLowerCase();

          const isHighlight = 
            scanText.includes("critical") || 
            scanText.includes("major") || 
            scanText.includes("zero-day") || 
            scanText.includes("zero day") || 
            scanText.includes("massive") || 
            scanText.includes("hacked") || 
            scanText.includes("compromised") ||
            scanText.includes("ransomware") ||
            scanText.includes("breach") ||
            scanText.includes("vulnerability") ||
            scanText.includes("exploit") ||
            scanText.includes("cve") ||
            scanText.includes("supply chain") ||
            scanText.includes("backdoor") ||
            scanText.includes("data leak") ||
            scanText.includes("phishing") ||
            scanText.includes("fraud") ||
            scanText.includes("vercel") || 
            scanText.includes("github") || 
            scanText.includes("paytm") || 
            scanText.includes("india") || 
            scanText.includes("microsoft");

          await incidentsCol.doc(docId).set({
            title,
            link,
            description: description.substring(0, 300) + "...",
            publishedAt,
            source: feed.name,
            isHighlight,
            createdAt: new Date()
          });

          stats.processed++;
          
          for (const brand of MONITORED_BRANDS) {
            const hasBrand = scanText.includes(brand);
            const isCompromised = 
              scanText.includes("hack") || 
              scanText.includes("breach") || 
              scanText.includes("phish") || 
              scanText.includes("scam") || 
              scanText.includes("spoof") || 
              scanText.includes("exploit") || 
              scanText.includes("leak") || 
              scanText.includes("compromise");

            if (hasBrand && isCompromised) {
              const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
              
              await activeLockdownsCol.doc(brand).set({
                brandName: brand,
                incidentTitle: title,
                incidentLink: link,
                reportedAt: publishedAt,
                expiresAt,
                isActive: true
              });

              console.log(`[INCIDENT_SCRAPER] 🚨 BRAND LOCKDOWN ACTIVE: '${brand.toUpperCase()}' due to incident: "${title}"`);
              stats.lockdownsTriggered++;
            }
          }
        }
      } catch (feedError) {
        console.error(`[INCIDENT_SCRAPER] Failed to process feed ${feed.name}:`, feedError);
        stats.errors++;
      }
    }

    const reportResult = await generateCommunityReportsFromIncidents();
    stats.reportsGenerated = reportResult.reportsGenerated;

    return stats;
  } catch (error) {
    console.error("[INCIDENT_SCRAPER] Scraping advisor crash:", error);
    stats.errors++;
    return stats;
  }
}

/**
 * Auto-generate community reports from highlighted incidents (last 24h)
 */
export async function generateCommunityReportsFromIncidents(): Promise<{ reportsGenerated: number }> {
  let reportsGenerated = 0;

  try {
    const db = getAdminDb();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Query on isHighlight only to avoid needing a composite index
    const highlightSnap = await db.collection("global_incidents")
      .where("isHighlight", "==", true)
      .get();

    if (highlightSnap.empty) {
      return { reportsGenerated };
    }

    const reportsCol = db.collection("scam_reports");

    for (const doc of highlightSnap.docs) {
      const incident = doc.data();

      // Filter by createdAt in-memory
      const createdAt = incident.createdAt ? (typeof incident.createdAt.toDate === "function" ? incident.createdAt.toDate() : new Date(incident.createdAt)) : null;
      if (!createdAt || createdAt < cutoff) continue;

      const osintTitle = `OSINT: ${incident.title}`;

      const existing = await reportsCol
        .where("title", "==", osintTitle)
        .limit(1)
        .get();

      if (!existing.empty) continue;

      await reportsCol.add({
        title: osintTitle,
        company: "OSINT Threat Feed",
        scam_type: "Cybersecurity Advisory",
        industry: "Cybersecurity",
        location: "Global",
        city: "Global",
        state: "INT",
        country: "WWW",
        lat: null,
        lng: null,
        description: incident.description,
        tags: ["osint", "automated-feed", "advisory"],
        anonymous: true,
        email: null,
        risk_level: "high",
        created_at: new Date(),
        helpful_votes: 0,
        flag_count: 0,
        views: 0,
        trust_score: 0,
        status: "approved",
        evidence_urls: [incident.link]
      });

      reportsGenerated++;
    }
  } catch (e) {
    console.error("[INCIDENT_SCRAPER] Failed to generate community reports:", e);
  }

  return { reportsGenerated };
}

/**
 * Fetch the currently locked down brands from Firestore
 */
export async function getActiveBrandLockdowns(): Promise<string[]> {
  try {
    const db = getAdminDb();
    const now = new Date();
    const snapshot = await db.collection("active_brand_lockdowns")
      .where("expiresAt", ">", now)
      .where("isActive", "==", true)
      .get();

    return snapshot.docs.map(doc => doc.data().brandName) as string[];
  } catch (e) {
    console.error("[INCIDENT_SCRAPER] Failed to query brand lockdowns:", e);
    return [];
  }
}

/**
 * Fetch recent global incidents to display
 */
export async function getRecentIncidents(limit: number = 30): Promise<IncidentAlert[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("global_incidents")
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      let publishedAt: Date;
      if (data.publishedAt) {
        if (typeof data.publishedAt.toDate === "function") {
          publishedAt = data.publishedAt.toDate();
        } else {
          publishedAt = new Date(data.publishedAt);
        }
      } else {
        publishedAt = new Date();
      }
      return {
        title: data.title,
        link: data.link,
        description: data.description,
        publishedAt,
        source: data.source,
        isHighlight: data.isHighlight || false
      };
    }) as IncidentAlert[];
  } catch (e) {
    console.error("[INCIDENT_SCRAPER] Failed to fetch incidents:", e);
    return [];
  }
}
