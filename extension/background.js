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
    
    // Note: In production, this would use a secure Extension Key
    const response = await fetch(`${API_BASE_URL}/verify?url=${encodeURIComponent(url)}`, {
      headers: {
        'x-api-key': 'ss_ext_public_v1'
      }
    });

    if (!response.ok) {
        // Fallback for dev/local or if verify is not available
        const fallbackResponse = await fetch(`${API_BASE_URL}/validate?url=${encodeURIComponent(url)}`);
        const data = await fallbackResponse.json();
        const result = {
            status: data.threatLevel > 0 ? 'malicious' : 'safe',
            score: data.threatLevel || 0,
            flags: data.diagnostics?.flags || []
        };
        
        // Cache result
        await chrome.storage.local.set({
            [cacheKey]: {
                timestamp: Date.now(),
                data: result
            }
        });
        
        return result;
    }

    const data = await response.json();
    
    // Cache result
    await chrome.storage.local.set({
      [cacheKey]: {
        timestamp: Date.now(),
        data: data
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
