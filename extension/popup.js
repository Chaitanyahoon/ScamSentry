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
  
  const linksScannedEl = document.getElementById('links-scanned');
  const threatsBlockedEl = document.getElementById('threats-blocked');
  const dashboardBtn = document.getElementById('view-dashboard');

  // 1. Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) {
    loadingEl.textContent = 'No active page detected.';
    return;
  }

  const currentUrl = new URL(tab.url);
  urlEl.textContent = currentUrl.hostname + currentUrl.pathname;

  // 2. Request status from background
  chrome.runtime.sendMessage({ type: 'CHECK_URL', url: tab.url }, (result) => {
    loadingEl.style.display = 'none';
    mainUiEl.style.display = 'block';

    if (result && result.status !== 'error') {
      const isMalicious = result.status === 'malicious' || result.score > 70;
      
      badgeEl.textContent = isMalicious ? 'Malicious' : 'Safe';
      badgeEl.className = `risk-badge ${isMalicious ? 'malicious' : 'safe'}`;
      
      // Update score display
      const score = result.score || 0;
      scoreBarEl.style.width = `${score}%`;
      scoreValEl.textContent = `${score}%`;
      
      if (isMalicious) {
        scoreBarEl.style.backgroundColor = '#FF4D4D';
        scoreValEl.style.color = '#FF4D4D';
      }
    }
  });

  // 3. Load global stats from storage
  chrome.storage.local.get(['stats_links', 'stats_blocked'], (data) => {
    linksScannedEl.textContent = (data.stats_links || 0).toLocaleString();
    threatsBlockedEl.textContent = (data.stats_blocked || 0).toLocaleString();
  });

  // 4. Action handlers
  dashboardBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://scamsentry.vercel.app/dashboard' });
  });
});
