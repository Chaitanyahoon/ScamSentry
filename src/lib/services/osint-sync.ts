/**
 * ScamSentry OSINT Synchronization Service
 * 
 * Ingests public threat intelligence from multiple sources:
 * - PhishTank (JSON)
 * - OpenPhish (Text)
 * 
 * Implements deduplication and batch-processing to optimize Firestore usage.
 */

import { getAdminDb } from '../firebase-admin';

const PHISHTANK_URL = 'http://data.phishtank.com/data/online-valid.json';
const OPENPHISH_URL = 'https://openphish.com/feed.txt';

export interface OSINTThreat {
  domain: string;
  source: string;
  type: string;
  firstSeen: Date;
  lastSync: Date;
  status: 'active' | 'expired';
}

export async function syncOSINTFeeds() {
  const stats = {
    processed: 0,
    added: 0,
    skipped: 0,
    errors: 0
  };

  try {
    const db = getAdminDb();
    const threatFeedCol = db.collection('threat_intel_feeds');

    // 1. Fetch OpenPhish (Community Text Feed)
    console.log('[OSINT] Syncing OpenPhish...');
    try {
      const openPhishRes = await fetch(OPENPHISH_URL);
      const openPhishText = await openPhishRes.text();
      const openPhishDomains = openPhishText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(url => {
          try {
            return new URL(url.startsWith('http') ? url : `http://${url}`).hostname;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as string[];

      for (const domain of new Set(openPhishDomains)) {
        const result = await processDomain(domain, 'OpenPhish', threatFeedCol);
        if (result === 'added') stats.added++;
        else if (result === 'skipped') stats.skipped++;
        stats.processed++;
      }
    } catch (e) {
      console.error('[OSINT] OpenPhish Sync Error:', e);
      stats.errors++;
    }

    // 2. Fetch PhishTank (JSON)
    console.log('[OSINT] Syncing PhishTank...');
    try {
      // Note: PhishTank often requires a User-Agent or API key for high frequency
      const phishTankRes = await fetch(PHISHTANK_URL, {
        headers: { 'User-Agent': 'phishtank/scamsentry' }
      });
      const phishTankData = await phishTankRes.json();
      
      const phishTankDomains = phishTankData.map((item: any) => {
        try {
          return new URL(item.url).hostname;
        } catch {
          return null;
        }
      }).filter(Boolean) as string[];

      for (const domain of new Set(phishTankDomains)) {
        const result = await processDomain(domain, 'PhishTank', threatFeedCol);
        if (result === 'added') stats.added++;
        else if (result === 'skipped') stats.skipped++;
        stats.processed++;
      }
    } catch (e) {
      console.error('[OSINT] PhishTank Sync Error:', e);
      stats.errors++;
    }

    return stats;
  } catch (error) {
    console.error('[OSINT] Global Sync Failure:', error);
    throw error;
  }
}

async function processDomain(domain: string, source: string, col: FirebaseFirestore.CollectionReference): Promise<'added' | 'skipped' | 'error'> {
  try {
    const docId = domain.replace(/\./g, '_'); // Firestore friendly ID
    const docRef = col.doc(docId);
    const existing = await docRef.get();

    if (existing.exists) {
      // Update last sync time
      await docRef.update({
        lastSync: new Date()
      });
      return 'skipped';
    }

    // New threat identified
    await docRef.set({
      domain,
      source,
      type: 'phish',
      firstSeen: new Date(),
      lastSync: new Date(),
      status: 'active'
    });

    return 'added';
  } catch (e) {
    return 'error';
  }
}

/**
 * Fetch the latest 50 threats from the OSINT database
 */
export async function getRecentThreats(limit: number = 50): Promise<OSINTThreat[]> {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection('threat_intel_feeds')
      .orderBy('firstSeen', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      firstSeen: doc.data().firstSeen.toDate(),
      lastSync: doc.data().lastSync.toDate()
    })) as OSINTThreat[];
  } catch (error) {
    console.error('[OSINT] Failed to fetch threats:', error);
    return [];
  }
}

/**
 * Fetch a single threat's full forensic dossier
 */
export async function getThreatDossier(domainOrId: string): Promise<OSINTThreat | null> {
  try {
    const db = getAdminDb();
    const docId = domainOrId.replace(/\./g, "_");
    const doc = await db.collection('threat_intel_feeds').doc(docId).get();

    if (!doc.exists) return null;

    const data = doc.data();
    return {
      ...data,
      firstSeen: data?.firstSeen?.toDate(),
      lastSync: data?.lastSync?.toDate()
    } as OSINTThreat;
  } catch (error) {
    console.error('[OSINT] Failed to fetch dossier:', error);
    return null;
  }
}
