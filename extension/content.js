/**
 * ScamSentry Content Script (Manifest v3)
 * 
 * Monitors the DOM for links and requests forensic verification. 
 * Highlights suspicious links in "Forensic Amber" using CSS classes.
 */

// Configuration
const SCAN_CLASSES = {
  PENDING: 'ss-scan-pending',
  SAFE: 'ss-scan-safe',
  SUSPICIOUS: 'ss-scan-suspicious',
  MALICIOUS: 'ss-scan-malicious'
};

// Start scanning the initial page
scanLinks(document.body);

// Observe DOM changes for single-page applications or dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        scanLinks(node);
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });

/**
 * Scan all links within a specific element
 */
function scanLinks(container) {
  const links = container.querySelectorAll('a:not(.ss-scanned)');
  
  links.forEach(link => {
    const url = link.href;
    if (!url || !url.startsWith('http')) return;
    
    // Skip internal links (optional logic)
    if (url.includes(window.location.hostname)) return;

    link.classList.add('ss-scanned', SCAN_CLASSES.PENDING);
    
    // Request forensic check from background service worker
    chrome.runtime.sendMessage({ type: 'CHECK_URL', url }, (result) => {
      if (!result || result.status === 'error') return;
      
      link.classList.remove(SCAN_CLASSES.PENDING);
      
      if (result.status === 'malicious' || result.score > 70) {
        applyThreatStyle(link, 'malicious', result);
      } else if (result.score > 20) {
        applyThreatStyle(link, 'suspicious', result);
      } else {
        link.classList.add(SCAN_CLASSES.SAFE);
      }
    });
  });
}

/**
 * Apply visual threat highlights to the link
 */
function applyThreatStyle(link, type, data) {
  link.classList.add(type === 'malicious' ? SCAN_CLASSES.MALICIOUS : SCAN_CLASSES.SUSPICIOUS);
  
  // Inject "Amber Shield" icon
  const badge = document.createElement('span');
  badge.className = `ss-threat-shield ss-shield-${type}`;
  badge.title = `ScamSentry Forensic Alert: ${data.status.toUpperCase()} (${data.score}% risk)`;
  
  // Minimalist Forensic Icon (Amber dot with glow)
  badge.innerHTML = `
    <span class="ss-dot"></span>
    <span class="ss-pulse"></span>
  `;
  
  link.prepend(badge);
}
