/**
 * ScamSentry Extension Popup Logic
 * 
 * Synchronizes with the background service worker to display 
 * real-time forensic data for the current active tab.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const mainUiEl = document.getElementById('main-ui');
  const urlEl = document.getElementById('current-url');
  const badgeEl = document.getElementById('risk-badge');
  const scoreBarEl = document.getElementById('score-bar');
  const scoreValEl = document.getElementById('score-val');
  const errorMsgEl = document.getElementById('error-message');
  
  const linksScannedEl = document.getElementById('links-scanned');
  const threatsBlockedEl = document.getElementById('threats-blocked');
  const dashboardBtn = document.getElementById('view-dashboard');

  // 1. Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    loadingEl.textContent = 'No active webpage detected.';
    return;
  }

  // Set URL preview (trim protocol)
  let displayUrl = tab.url;
  try {
    const parsed = new URL(tab.url);
    displayUrl = parsed.hostname + parsed.pathname;
    if (displayUrl.length > 35) {
      displayUrl = displayUrl.substring(0, 32) + '...';
    }
  } catch (e) {
    // fallback
  }
  urlEl.textContent = displayUrl;

  // 2. Request status from background worker
  chrome.runtime.sendMessage({ type: 'CHECK_URL', url: tab.url }, (result) => {
    loadingEl.style.display = 'none';
    mainUiEl.style.display = 'block';

    if (!result || result.status === 'error') {
      // Handle connection error / offline state gracefully
      badgeEl.textContent = 'Error';
      badgeEl.className = 'risk-badge error';
      
      scoreBarEl.style.width = '0%';
      scoreBarEl.style.backgroundColor = '#ef4444';
      scoreValEl.textContent = 'N/A';
      scoreValEl.style.color = '#ef4444';
      
      const errMsg = result ? result.message : 'Timeout or connection failure.';
      errorMsgEl.textContent = `Offline: Could not connect to ScamSentry Forensic Engine. Check your connection or configuration options.`;
      errorMsgEl.style.display = 'block';
      return;
    }

    // Success State
    errorMsgEl.style.display = 'none';
    const threatScore = result.score || 0;
    const isMalicious = result.status === 'malicious' || threatScore > 70;
    const isSuspicious = !isMalicious && (result.status === 'suspicious' || threatScore > 20);
    
    if (isMalicious) {
      badgeEl.textContent = 'Malicious';
      badgeEl.className = 'risk-badge malicious';
    } else if (isSuspicious) {
      badgeEl.textContent = 'Suspicious';
      badgeEl.className = 'risk-badge suspicious';
    } else {
      badgeEl.textContent = 'Safe';
      badgeEl.className = 'risk-badge safe';
    }
    
    // Update score display - display true Trust Score (100 - threat penalty)
    const trustScore = Math.max(0, 100 - threatScore);
    scoreBarEl.style.width = `${trustScore}%`;
    scoreValEl.textContent = `${trustScore}%`;
    
    if (isMalicious) {
      scoreBarEl.style.backgroundColor = '#ef4444';
      scoreValEl.style.color = '#ef4444';
    } else if (isSuspicious) {
      scoreBarEl.style.backgroundColor = '#f59e0b';
      scoreValEl.style.color = '#f59e0b';
    } else {
      scoreBarEl.style.backgroundColor = '#f97316'; // Brand orange
      scoreValEl.style.color = '#f97316';
    }
  });

  // 3. Load global stats from storage
  chrome.storage.local.get(['stats_links', 'stats_blocked'], (data) => {
    linksScannedEl.textContent = (data.stats_links || 0).toLocaleString();
    threatsBlockedEl.textContent = (data.stats_blocked || 0).toLocaleString();
  });

  // 4. Action handlers
  dashboardBtn.addEventListener('click', () => {
    chrome.storage.local.get('dashboard_url', (settings) => {
      const targetUrl = settings.dashboard_url || 'https://thecodecafe.vercel.app/dashboard';
      chrome.tabs.create({ url: targetUrl });
    });
  });
});
