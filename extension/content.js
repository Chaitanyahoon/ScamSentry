/**
 * ScamSentry Content Script (Manifest v3)
 *
 * Monitors the DOM for links and recruiter emails, querying forensic verification.
 * Highlights suspicious links in "Forensic Amber" and injects inline trust shields.
 */

// Configuration
const SCAN_CLASSES = {
  PENDING: "ss-scan-pending",
  SAFE: "ss-scan-safe",
  SUSPICIOUS: "ss-scan-suspicious",
  MALICIOUS: "ss-scan-malicious",
};

const isGmail = window.location.hostname.includes("mail.google.com");
const isLinkedIn = window.location.hostname.includes("linkedin.com");

// Start scanning the initial page
scanLinks(document.body);
scanEmails(document.body);
if (isGmail) scanGmailSenders(document.body);
if (isLinkedIn) scanLinkedInRecruiter(document.body);

// Observe DOM changes for single-page applications or dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // Element node
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
  const links = container.querySelectorAll("a:not(.ss-scanned)");

  links.forEach((link) => {
    const url = link.href;
    if (!url || !url.startsWith("http")) return;

    // Skip internal links
    if (url.includes(window.location.hostname)) return;

    link.classList.add("ss-scanned", SCAN_CLASSES.PENDING);

    // Request forensic check from background service worker
    chrome.runtime.sendMessage({ type: "CHECK_URL", url }, (result) => {
      if (!result || result.status === "error") return;

      link.classList.remove(SCAN_CLASSES.PENDING);

      if (result.status === "malicious" || result.score > 70) {
        applyThreatStyle(link, "malicious", result);
      } else if (result.score > 20) {
        applyThreatStyle(link, "suspicious", result);
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
  link.classList.add(
    type === "malicious" ? SCAN_CLASSES.MALICIOUS : SCAN_CLASSES.SUSPICIOUS,
  );

  // Inject "Amber Shield" icon
  const badge = document.createElement("span");
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

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  );
  let node;
  const nodesToProcess = [];

  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (
      parent &&
      !parent.classList.contains("ss-email-scanned") &&
      !["SCRIPT", "STYLE", "INPUT", "TEXTAREA"].includes(parent.tagName) &&
      emailRegex.test(node.nodeValue)
    ) {
      nodesToProcess.push({ node, parent });
    }
  }

  nodesToProcess.forEach(({ node, parent }) => {
    parent.classList.add("ss-email-scanned");
    const text = node.nodeValue;
    const matches = text.match(emailRegex);
    if (!matches) return;

    matches.forEach((email) => {
      chrome.runtime.sendMessage(
        { type: "CHECK_URL", url: email },
        (result) => {
          if (!result || result.status === "error") return;

          if (result.status === "malicious" || result.score > 70) {
            injectEmailBadge(parent, "malicious", email, result);
          } else if (result.score > 20) {
            injectEmailBadge(parent, "suspicious", email, result);
          } else {
            injectEmailBadge(parent, "safe", email, result);
          }
        },
      );
    });
  });
}

/**
 * Inject trust shield next to parsed email address elements
 */
function injectEmailBadge(parent, type, email, data) {
  if (parent.querySelector(`.ss-email-badge[data-email="${email}"]`)) return;

  const badge = document.createElement("span");
  badge.className = `ss-email-badge ss-badge-${type}`;
  badge.setAttribute("data-email", email);
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.marginLeft = "6px";
  badge.style.cursor = "help";

  const tooltipText = `ScamSentry Verification: ${type.toUpperCase()} recruiter audit (${data.score}% risk). ${data.flags && data.flags.length > 0 ? data.flags.join(", ") : "Verified clean infrastructure."}`;
  badge.title = tooltipText;

  let iconColor = "#10B981"; // Green
  let iconGlow = "rgba(16, 185, 129, 0.4)";
  let shieldPath = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";

  if (type === "malicious") {
    iconColor = "#EF4444"; // Red
    iconGlow = "rgba(239, 68, 68, 0.4)";
  } else if (type === "suspicious") {
    iconColor = "#f97316"; // Orange brand
    iconGlow = "rgba(249, 115, 22, 0.4)";
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
  if (message.type === "SHOW_SCAN_RESULT") {
    showScanResultOverlay(message.url, message.result);
  }
});

/**
 * Renders a modern dashboard-styled scan result overlay card
 */
function showScanResultOverlay(url, result) {
  const existing = document.getElementById("ss-scan-overlay-root");
  if (existing) existing.remove();

  const root = document.createElement("div");
  root.id = "ss-scan-overlay-root";

  const isThreat = result.status === "malicious" || result.score > 70;
  const isSuspicious = result.score > 20 && result.score <= 70;

  let accentColor = "#ef4444";
  let badgeLabel = "Malicious";
  let badgeBg = "rgba(239, 68, 68, 0.1)";
  let badgeBorder = "rgba(239, 68, 68, 0.3)";
  let borderGlow = "rgba(239, 68, 68, 0.2)";

  if (!isThreat && !isSuspicious) {
    accentColor = "#10b981";
    badgeLabel = "Safe";
    badgeBg = "rgba(16, 185, 129, 0.1)";
    badgeBorder = "rgba(16, 185, 129, 0.3)";
    borderGlow = "rgba(16, 185, 129, 0.2)";
  } else if (isSuspicious) {
    accentColor = "#f59e0b";
    badgeLabel = "Suspicious";
    badgeBg = "rgba(245, 158, 11, 0.1)";
    badgeBorder = "rgba(245, 158, 11, 0.3)";
    borderGlow = "rgba(245, 158, 11, 0.2)";
  }

  const trustScore = Math.max(0, 100 - result.score);

  root.innerHTML = `
    <div style="position: fixed; top: 24px; right: 24px; z-index: 10000000; width: 340px; background-color: #09090b; border: 1px solid #27272a; padding: 0; font-family: 'Inter', -apple-system, sans-serif; color: #f4f4f5; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${borderGlow}; border-radius: 16px; font-size: 12px; line-height: 1.5; overflow: hidden; animation: ss-overlay-in 0.3s ease;">
      <style>@keyframes ss-overlay-in { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }</style>
      <div style="padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.3); padding: 4px; border-radius: 6px;">
            <div style="width: 12px; height: 12px; background: #f97316; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);"></div>
          </div>
          <span style="font-size: 12px; font-weight: 700; color: #f4f4f5;">ScamSentry Shield</span>
        </div>
        <button id="ss-overlay-close-btn" style="background: none; border: none; color: #a1a1aa; cursor: pointer; font-size: 18px; line-height: 1; padding: 0; transition: color 0.2s;">&times;</button>
      </div>
      <div style="padding: 16px 18px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 10px; font-weight: 600; color: #a1a1aa;">Page Reputation</span>
          <span style="font-size: 9px; padding: 2px 8px; border-radius: 9999px; font-weight: 700; text-transform: uppercase; background: ${badgeBg}; color: ${accentColor}; border: 1px solid ${badgeBorder};">${badgeLabel}</span>
        </div>
        <div style="font-size: 11px; word-break: break-all; color: #f4f4f5; font-weight: 500; margin-bottom: 12px; line-height: 1.4;">${url}</div>
        <div style="height: 6px; background: #27272a; border-radius: 9999px; overflow: hidden; margin-bottom: 6px;">
          <div style="height: 100%; width: ${trustScore}%; background: ${accentColor}; border-radius: 9999px; transition: width 0.8s ease;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #a1a1aa; font-weight: 500; margin-bottom: 14px;">
          <span>Trust Score</span>
          <span style="color: ${accentColor}; font-weight: 700;">${trustScore}%</span>
        </div>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid #27272a; border-radius: 10px; padding: 12px;">
          <div style="font-size: 10px; font-weight: 600; color: #a1a1aa; margin-bottom: 8px;">Forensic Signals</div>
          <ul style="margin: 0; padding-left: 16px; list-style-type: disc; font-size: 11px; color: #f4f4f5; opacity: 0.85;">
            ${
              result.flags && result.flags.length > 0
                ? result.flags
                    .map((f) => `<li style="margin-bottom: 4px;">${f}</li>`)
                    .join("")
                : `<li style="color: #10b981;">No suspicious signals detected.</li>`
            }
          </ul>
        </div>
      </div>
      <div style="padding: 10px 18px; text-align: right; font-size: 9px; color: #a1a1aa; border-top: 1px solid #27272a; font-weight: 500;">ScamSentry Shield v1.0</div>
    </div>
  `;

  document.body.appendChild(root);

  document
    .getElementById("ss-overlay-close-btn")
    .addEventListener("click", () => {
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
  const senders = container.querySelectorAll(
    '.gD, span[email], a[href^="mailto:"]',
  );

  senders.forEach((sender) => {
    if (sender.classList.contains("ss-gmail-scanned")) return;
    sender.classList.add("ss-gmail-scanned");

    let email =
      sender.getAttribute("email") ||
      sender.getAttribute("data-hovercard-id") ||
      sender.innerText ||
      "";
    if (sender.href && sender.href.startsWith("mailto:")) {
      email = sender.href.replace("mailto:", "");
    }

    const emailMatch = email.match(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
    );
    if (!emailMatch) return;

    const validEmail = emailMatch[0];

    chrome.runtime.sendMessage(
      { type: "CHECK_URL", url: validEmail },
      (result) => {
        if (!result || result.status === "error") return;
        injectTrustShieldBadge(sender, result);
      },
    );
  });
}

/**
 * Scan messaging and connection panels on LinkedIn for Recruiter profiles
 */
function scanLinkedInRecruiter(container) {
  const candidateRecruiterNames = container.querySelectorAll(
    ".msg-conversation-card__participant-name, .pv-text-details__left-panel h1, .artdeco-entity-lockup__title",
  );

  candidateRecruiterNames.forEach((elem) => {
    if (elem.classList.contains("ss-li-scanned")) return;
    elem.classList.add("ss-li-scanned");

    const pageText = document.body.innerText.toLowerCase();
    const hasRecruiterKeyword =
      pageText.includes("recruiter") ||
      pageText.includes("talent acquisition") ||
      pageText.includes("hr manager") ||
      pageText.includes("hiring manager");

    if (!hasRecruiterKeyword) return;

    const companyLinks = document.querySelectorAll('a[href*="/company/"]');
    let companyDomain = "linkedin.company";
    if (companyLinks.length > 0) {
      const match = companyLinks[0].href.match(/\/company\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        companyDomain = match[1] + ".com";
      }
    }

    chrome.runtime.sendMessage(
      { type: "CHECK_URL", url: companyDomain },
      (result) => {
        if (!result || result.status === "error") return;
        injectTrustShieldBadge(elem, result);
      },
    );
  });
}

/**
 * Standardized inline SVG badge rendering for Gmail and LinkedIn integration
 */
function injectTrustShieldBadge(element, result) {
  if (element.querySelector(".ss-platform-shield")) return;

  const isThreat = result.status === "malicious" || result.score > 70;
  const isSuspicious = result.score > 20 && result.score <= 70;

  let type = "safe";
  let iconColor = "#10B981";
  let iconGlow = "rgba(16, 185, 129, 0.4)";
  if (isThreat) {
    type = "malicious";
    iconColor = "#EF4444";
    iconGlow = "rgba(239, 68, 68, 0.4)";
  } else if (isSuspicious) {
    type = "suspicious";
    iconColor = "#f97316";
    iconGlow = "rgba(249, 115, 22, 0.4)";
  }

  const shield = document.createElement("span");
  shield.className = `ss-platform-shield ss-shield-${type}`;
  shield.style.display = "inline-flex";
  shield.style.alignItems = "center";
  shield.style.marginLeft = "8px";
  shield.style.verticalAlign = "middle";
  shield.style.cursor = "help";

  const tooltipText = `ScamSentry: ${type.toUpperCase()} Recruiter Node (${result.score}% risk).\n${result.flags && result.flags.length > 0 ? result.flags.join(", ") : "Infrastructure verified secure."}`;
  shield.title = tooltipText;

  const shieldPath = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";

  shield.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 3px ${iconGlow})">
      <path d="${shieldPath}"></path>
    </svg>
  `;

  element.appendChild(shield);
}
