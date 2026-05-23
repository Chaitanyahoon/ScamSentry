/**
 * ScamSentry Background Service Worker (Manifest v3)
 * 
 * Handles real-time link verification requests from content scripts.
 * Implements local caching to reduce API load and improve latency.
 */

const API_BASE_URL = 'https://scamsentry.vercel.app/api/v1';
const CACHE_TTL = 3600 * 1000; // 1 hour

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_URL') {
    handleUrlCheck(request.url).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleUrlCheck(url) {
  try {
    // 1. Check local cache
    const cacheKey = `ss_cache_${btoa(url).substring(0, 32)}`;
    const cached = await chrome.storage.local.get(cacheKey);
    
    if (cached[cacheKey] && Date.now() - cached[cacheKey].timestamp < CACHE_TTL) {
      console.log(`[ScamSentry] Cache hit for: ${url}`);
      return cached[cacheKey].data;
    }

    // 2. Fetch from Forensic Engine
    console.log(`[ScamSentry] Scanning link: ${url}`);
    
    // Extract domain from url for verify parameter
    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url; // Fallback
    }

    const response = await fetch(`${API_BASE_URL}/verify?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'x-api-key': 'ss_ext_public_v1'
      }
    });

    let result;

    if (!response.ok) {
        // Fallback: Perform a POST validate query
        console.log(`[ScamSentry] Fallback triggered to validate URL: ${url}`);
        const fallbackResponse = await fetch(`${API_BASE_URL}/validate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'ss_ext_public_v1'
            },
            body: JSON.stringify({ payload: url })
        });
        
        if (!fallbackResponse.ok) {
            throw new Error(`Fallback validation failed with status ${fallbackResponse.status}`);
        }

        const serverData = await fallbackResponse.json();
        const serverResult = serverData.data || {};
        const trustScore = serverResult.trustScore !== undefined ? serverResult.trustScore : 100;
        const threatScore = 100 - trustScore;
        const isMalicious = serverResult.isBlacklisted || threatScore > 70;
        
        result = {
            status: isMalicious ? 'malicious' : 'safe',
            score: threatScore,
            flags: serverResult.details || []
        };
    } else {
        const serverData = await response.json();
        const serverResult = serverData.data || {};
        const trustScore = serverResult.trustScore !== undefined ? serverResult.trustScore : 100;
        const threatScore = 100 - trustScore;
        const forensicSignals = serverResult.forensicSignals || {};
        const isMalicious = threatScore > 70 || forensicSignals.isSuspiciousRegistrar;
        
        result = {
            status: isMalicious ? 'malicious' : 'safe',
            score: threatScore,
            flags: Object.entries(forensicSignals)
                         .filter(([_, active]) => active)
                         .map(([signal]) => signal)
        };
    }

    // Cache result
    await chrome.storage.local.set({
      [cacheKey]: {
        timestamp: Date.now(),
        data: result
      }
    });

    // 3. Update Aggregate Stats (Local)
    await updateStats(result);

    return result;
  } catch (error) {
    console.error('[ScamSentry] Link scan error:', error);
    return { status: 'error', message: error.message };
  }
}

async function updateStats(result) {
  try {
    const isMalicious = result.status === 'malicious' || result.score > 70;
    const stats = await chrome.storage.local.get(['stats_links', 'stats_blocked']);
    
    await chrome.storage.local.set({
      stats_links: (stats.stats_links || 0) + 1,
      stats_blocked: (stats.stats_blocked || 0) + (isMalicious ? 1 : 0)
    });
  } catch (e) {
    console.error('[ScamSentry] Stats update error:', e);
  }
}
