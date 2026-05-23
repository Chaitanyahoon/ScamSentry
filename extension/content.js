/**
 * ScamSentry Content Script (Manifest v3)
 * 
 * Monitors the DOM for links and recruiter emails, querying forensic verification. 
 * Highlights suspicious links in "Forensic Amber" and injects inline trust shields.
 */

// Configuration
const SCAN_CLASSES = {
  PENDING: 'ss-scan-pending',
  SAFE: 'ss-scan-safe',
  SUSPICIOUS: 'ss-scan-suspicious',
  MALICIOUS: 'ss-scan-malicious'
};

const isGmail = window.location.hostname.includes('mail.google.com');
const isLinkedIn = window.location.hostname.includes('linkedin.com');

// Start scanning the initial page
scanLinks(document.body);
scanEmails(document.body);
if (isGmail) scanGmailSenders(document.body);
if (isLinkedIn) scanLinkedInRecruiter(document.body);

// Observe DOM changes for single-page applications or dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) { // Element node
        scanLinks(node);
        scanEmails(node);
        if (isGmail) scanGmailSenders(node);
        if (isLinkedIn) scanLinkedInRecruiter(node);
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
    
    // Skip internal links
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
  link.classList.remove(SCAN_CLASSES.PENDING, SCAN_CLASSES.SAFE);
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

/**
 * Scan for email addresses in text nodes
 */
function scanEmails(container) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  let node;
  const nodesToProcess = [];
  
  while (node = walker.nextNode()) {
    const parent = node.parentElement;
    if (parent && 
        !parent.classList.contains('ss-email-scanned') && 
        !['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'].includes(parent.tagName) &&
        emailRegex.test(node.nodeValue)) {
      nodesToProcess.push({ node, parent });
    }
  }

  nodesToProcess.forEach(({ node, parent }) => {
    parent.classList.add('ss-email-scanned');
    const text = node.nodeValue;
    const matches = text.match(emailRegex);
    if (!matches) return;
    
    matches.forEach(email => {
      chrome.runtime.sendMessage({ type: 'CHECK_URL', url: email }, (result) => {
        if (!result || result.status === 'error') return;
        
        if (result.status === 'malicious' || result.score > 70) {
          injectEmailBadge(parent, 'malicious', email, result);
        } else if (result.score > 20) {
          injectEmailBadge(parent, 'suspicious', email, result);
        } else {
          injectEmailBadge(parent, 'safe', email, result);
        }
      });
    });
  });
}

/**
 * Inject trust shield next to parsed email address elements
 */
function injectEmailBadge(parent, type, email, data) {
  if (parent.querySelector(`.ss-email-badge[data-email="${email}"]`)) return;
  
  const badge = document.createElement('span');
  badge.className = `ss-email-badge ss-badge-${type}`;
  badge.setAttribute('data-email', email);
  badge.style.display = 'inline-flex';
  badge.style.alignItems = 'center';
  badge.style.marginLeft = '6px';
  badge.style.cursor = 'help';
  
  const tooltipText = `ScamSentry Verification: ${type.toUpperCase()} recruiter audit (${data.score}% risk). ${data.flags && data.flags.length > 0 ? data.flags.join(', ') : 'Verified clean infrastructure.'}`;
  badge.title = tooltipText;

  let iconColor = '#10B981'; // Green
  let iconGlow = 'rgba(16, 185, 129, 0.4)';
  let shieldPath = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";

  if (type === 'malicious') {
    iconColor = '#EF4444'; // Red
    iconGlow = 'rgba(239, 68, 68, 0.4)';
  } else if (type === 'suspicious') {
    iconColor = '#F59E0B'; // Amber
    iconGlow = 'rgba(245, 158, 11, 0.4)';
  }

  badge.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 2px ${iconGlow})">
      <path d="${shieldPath}"></path>
    </svg>
  `;
  
  parent.appendChild(badge);
}

// 3. Message Listener for Context Menu Scan Result Overlay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_SCAN_RESULT') {
    showScanResultOverlay(message.url, message.result);
  }
});

/**
 * Renders a premium, Forensic Amber styled terminal popup overlay card
 */
function showScanResultOverlay(url, result) {
  const existing = document.getElementById('ss-scan-overlay-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'ss-scan-overlay-root';
  
  const isThreat = result.status === 'malicious' || result.score > 70;
  const isSuspicious = result.score > 20 && result.score <= 70;
  
  let headerColor = '#EF4444'; // Red
  let headerTitle = 'CRITICAL_THREAT_DETECTED';
  let borderGlow = 'rgba(239, 68, 68, 0.35)';

  if (!isThreat && !isSuspicious) {
    headerColor = '#10B981'; // Green
    headerTitle = 'SECURE_NODE_CLEARED';
    borderGlow = 'rgba(16, 185, 129, 0.35)';
  } else if (isSuspicious) {
    headerColor = '#F59E0B'; // Amber
    headerTitle = 'ELEVATED_RISK_WARNING';
    borderGlow = 'rgba(245, 158, 11, 0.35)';
  }

  root.innerHTML = `
    <div style="position: fixed; top: 30px; right: 30px; z-index: 10000000; width: 340px; background-color: #0C0A09; border: 1.5px solid ${headerColor}; padding: 20px; font-family: monospace; color: #E8DBC8; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px ${borderGlow}; border-radius: 4px; font-size: 11px; line-height: 1.4;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1F1914; padding-bottom: 8px; margin-bottom: 12px;">
        <span style="color: ${headerColor}; font-weight: bold; letter-spacing: 0.1em;">[ ${headerTitle} ]</span>
        <button id="ss-overlay-close-btn" style="background: none; border: none; color: #E8DBC8; cursor: pointer; font-size: 16px; font-family: monospace; line-height: 1;">&times;</button>
      </div>
      <div style="margin-bottom: 12px; word-break: break-all;">
        <span style="color: #8C5A1A;">TARGET_URI:</span> ${url}<br/>
        <span style="color: #8C5A1A;">TRUST_SCORE:</span> <span style="font-weight: bold; color: ${headerColor};">${100 - result.score}/100</span><br/>
        <span style="color: #8C5A1A;">RISK_FACTOR:</span> ${result.score}%
      </div>
      <div style="border-top: 1px solid #1F1914; padding-top: 10px;">
        <span style="color: #8C5A1A; font-weight: bold;">FORENSIC_SIGNALS:</span>
        <ul style="margin: 6px 0 0 0; padding-left: 16px; list-style-type: square; color: #E8DBC8; opacity: 0.85; word-wrap: break-word;">
          ${result.flags && result.flags.length > 0 
            ? result.flags.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join('') 
            : `<li style="color: #10B981;">No suspicious forensic anomalies captured.</li>`
          }
        </ul>
      </div>
      <div style="margin-top: 14px; text-align: right; font-size: 8px; color: #8C5A1A; letter-spacing: 0.05em; border-top: 1px solid #1F1914; padding-top: 6px;">
        SCAMSENTRY COMPLIANCE LABS
      </div>
    </div>
  `;

  document.body.appendChild(root);

  document.getElementById('ss-overlay-close-btn').addEventListener('click', () => {
    root.remove();
  });

  // Auto-remove after 12 seconds
  setTimeout(() => {
    if (root.parentElement) root.remove();
  }, 12000);
}

/**
 * Hook sender email details inside Gmail
 */
function scanGmailSenders(container) {
  const senders = container.querySelectorAll('.gD, span[email], a[href^="mailto:"]');
  
  senders.forEach(sender => {
    if (sender.classList.contains('ss-gmail-scanned')) return;
    sender.classList.add('ss-gmail-scanned');
    
    let email = sender.getAttribute('email') || sender.getAttribute('data-hovercard-id') || sender.innerText || "";
    if (sender.href && sender.href.startsWith("mailto:")) {
      email = sender.href.replace("mailto:", "");
    }
    
    const emailMatch = email.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (!emailMatch) return;
    
    const validEmail = emailMatch[0];
    
    chrome.runtime.sendMessage({ type: 'CHECK_URL', url: validEmail }, (result) => {
      if (!result || result.status === 'error') return;
      injectTrustShieldBadge(sender, result);
    });
  });
}

/**
 * Scan messaging and connection panels on LinkedIn for Recruiter profiles
 */
function scanLinkedInRecruiter(container) {
  const candidateRecruiterNames = container.querySelectorAll('.msg-conversation-card__participant-name, .pv-text-details__left-panel h1, .artdeco-entity-lockup__title');
  
  candidateRecruiterNames.forEach(elem => {
    if (elem.classList.contains('ss-li-scanned')) return;
    elem.classList.add('ss-li-scanned');
    
    const pageText = document.body.innerText.toLowerCase();
    const hasRecruiterKeyword = pageText.includes('recruiter') || pageText.includes('talent acquisition') || pageText.includes('hr manager') || pageText.includes('hiring manager');
    
    if (!hasRecruiterKeyword) return;
    
    const companyLinks = document.querySelectorAll('a[href*="/company/"]');
    let companyDomain = "linkedin.company";
    if (companyLinks.length > 0) {
      const match = companyLinks[0].href.match(/\/company\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        companyDomain = match[1] + ".com";
      }
    }
    
    chrome.runtime.sendMessage({ type: 'CHECK_URL', url: companyDomain }, (result) => {
      if (!result || result.status === 'error') return;
      injectTrustShieldBadge(elem, result);
    });
  });
}

/**
 * Standardized inline SVG badge rendering for Gmail and LinkedIn integration
 */
function injectTrustShieldBadge(element, result) {
  if (element.querySelector('.ss-platform-shield')) return;

  const isThreat = result.status === 'malicious' || result.score > 70;
  const isSuspicious = result.score > 20 && result.score <= 70;
  
  let type = "safe";
  let iconColor = '#10B981';
  let iconGlow = 'rgba(16, 185, 129, 0.4)';
  if (isThreat) {
    type = "malicious";
    iconColor = '#EF4444';
    iconGlow = 'rgba(239, 68, 68, 0.4)';
  } else if (isSuspicious) {
    type = "suspicious";
    iconColor = '#F59E0B';
    iconGlow = 'rgba(245, 158, 11, 0.4)';
  }
  
  const shield = document.createElement('span');
  shield.className = `ss-platform-shield ss-shield-${type}`;
  shield.style.display = 'inline-flex';
  shield.style.alignItems = 'center';
  shield.style.marginLeft = '8px';
  shield.style.verticalAlign = 'middle';
  shield.style.cursor = 'help';
  
  const tooltipText = `ScamSentry: ${type.toUpperCase()} Recruiter Node (${result.score}% risk).\n${result.flags && result.flags.length > 0 ? result.flags.join(', ') : 'Infrastructure verified secure.'}`;
  shield.title = tooltipText;
  
  const shieldPath = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";
  
  shield.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 3px ${iconGlow})">
      <path d="${shieldPath}"></path>
    </svg>
  `;
  
  element.appendChild(shield);
}
