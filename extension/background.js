/**
 * ScamSentry Background Service Worker (Manifest v3)
 * 
 * Handles real-time link verification requests from content scripts.
 * Implements local caching to reduce API load and improve latency.
 */

const DEFAULT_API_URL = 'https://scam-sentry.vercel.app/api/v1';
const CACHE_TTL = 3600 * 1000; // 1 hour

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CHECK_URL') {
    handleUrlCheck(request.url).then(sendResponse);
    return true; // Keep message channel open for async response
  }
});

async function handleUrlCheck(url) {
  try {
    // Retrieve dynamic API Base URL
    const settings = await chrome.storage.local.get('api_base_url');
    const apiBaseUrl = settings.api_base_url || DEFAULT_API_URL;

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

    const response = await fetch(`${apiBaseUrl}/verify?domain=${encodeURIComponent(domain)}`, {
      headers: {
        'x-api-key': 'ss_ext_public_v1'
      }
    });

    let result;

    if (!response.ok) {
        // Fallback: Perform a POST validate query
        console.log(`[ScamSentry] Fallback triggered to validate URL: ${url}`);
        const fallbackResponse = await fetch(`${apiBaseUrl}/validate`, {
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

// 4. Context Menu Integration
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scan-link-forensics",
    title: "Scan Link with ScamSentry",
    contexts: ["link"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "scan-link-forensics" && info.linkUrl) {
    handleUrlCheck(info.linkUrl).then((result) => {
      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_SCAN_RESULT",
        url: info.linkUrl,
        result: result
      });
    }).catch(err => {
      console.error('[ScamSentry] Context scan error:', err);
    });
  }
});

// Real-time Tab Navigation Interception & Alerting
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Trigger on URL change loading state
  if (changeInfo.url) {
    const url = changeInfo.url;
    // Ignore extension local files, system interfaces, and localhost checks
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || !url.startsWith('http') || url.includes('localhost') || url.includes('127.0.0.1')) {
      return;
    }
    
    chrome.storage.local.get(['settings_auto_block', 'settings_suspicious_warn', 'ss_bypass_whitelist', 'settings_notifications'], async (settings) => {
      const autoBlock = settings.settings_auto_block !== false; // Default: true
      if (!autoBlock) return;

      let domain = '';
      try {
        domain = new URL(url).hostname;
      } catch (e) {
        return;
      }

      // Check if domain is temporarily whitelisted by user
      const whitelist = settings.ss_bypass_whitelist || [];
      if (whitelist.includes(domain)) {
        console.log(`[ScamSentry] Domain whitelisted by user: ${domain}`);
        return;
      }

      const result = await handleUrlCheck(url);
      if (result && result.status !== 'error') {
        const score = result.score || 0;
        const isMalicious = result.status === 'malicious' || score > 70;
        const isSuspicious = result.status === 'suspicious' || (score > 20 && score <= 70);
        const warnSuspicious = settings.settings_suspicious_warn === true;

        const shouldBlock = isMalicious || (isSuspicious && warnSuspicious);

        if (shouldBlock) {
          console.warn(`[ScamSentry] Intercepted malicious website: ${url}`);
          
          // Redirect the tab to blocked page warning
          const blockedPageUrl = chrome.runtime.getURL(
            `blocked.html?url=${encodeURIComponent(url)}&flags=${encodeURIComponent((result.flags || []).join(','))}`
          );
          chrome.tabs.update(tabId, { url: blockedPageUrl });

          // Send system desktop notification alert
          const notifEnabled = settings.settings_notifications !== false; // Default: true
          if (notifEnabled) {
            chrome.notifications.create(`ss_notif_${Date.now()}`, {
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'ScamSentry Alert: Threat Blocked',
              message: `A threat was detected and blocked on domain: ${domain}`,
              priority: 2
            });
          }
        }
      }
    });
  }
});
