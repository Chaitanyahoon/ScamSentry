/**
 * ScamSentry Block Page Controller
 *
 * Extracts threat info from search queries, coordinates back-to-safety actions,
 * and maintains the temporary local domain bypass whitelist.
 */

document.addEventListener("DOMContentLoaded", () => {
  const urlEl = document.getElementById("blocked-url");
  const listEl = document.getElementById("indicators-list");
  const proceedBtn = document.getElementById("proceed-btn");
  const safetyBtn = document.getElementById("safety-btn");

  // 1. Parse query parameters
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get("url") || "unknown-url.com";
  const rawFlags = params.get("flags") || "";

  // Extract domain name
  let targetDomain = targetUrl;
  try {
    const parsed = new URL(
      targetUrl.startsWith("http") ? targetUrl : `http://${targetUrl}`,
    );
    targetDomain = parsed.hostname;
  } catch (e) {
    // fallback
  }

  urlEl.textContent = targetUrl;

  // 2. Generate indicators list
  listEl.innerHTML = "";
  if (rawFlags) {
    const flags = rawFlags.split(",");
    flags.forEach((flag) => {
      const li = document.createElement("li");
      li.textContent = formatFlagName(flag);
      listEl.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent =
      "High-risk threat indicators match security ledger database";
    listEl.appendChild(li);
  }

  // 3. Safety navigation
  safetyBtn.addEventListener("click", () => {
    // Try to navigate back, or go to google
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
      // Fallback redirection
      setTimeout(() => {
        window.location.href = "https://google.com";
      }, 300);
    }
  });

  // 4. Bypass/Proceed navigation
  proceedBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "WARNING: Proceeding to this page is highly discouraged. Your credentials, accounts, or payment credentials may be compromised. Are you sure you want to proceed?",
    );
    if (!confirmed) return;

    // Add domain to local bypass whitelist
    chrome.storage.local.get("ss_bypass_whitelist", (data) => {
      const whitelist = data.ss_bypass_whitelist || [];
      if (!whitelist.includes(targetDomain)) {
        whitelist.push(targetDomain);
      }

      chrome.storage.local.set({ ss_bypass_whitelist: whitelist }, () => {
        // Redirect back to the blocked URL
        const destination = targetUrl.startsWith("http")
          ? targetUrl
          : `https://${targetUrl}`;
        window.location.href = destination;
      });
    });
  });

  // Helper to format flag names
  function formatFlagName(flag) {
    // Convert camelCase or snake_case to readable text
    let formatted = flag
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();

    // Capitalize first letter
    formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

    // Add context to common rules
    if (formatted.toLowerCase().includes("homoglyph")) {
      return `${formatted} (Visual/lookalike character spoofing)`;
    }
    if (formatted.toLowerCase().includes("http scheme")) {
      return `${formatted} (Insecure/unencrypted connection protocol)`;
    }
    if (formatted.toLowerCase().includes("double extension")) {
      return `${formatted} (Suspicious dual extension, e.g. .pdf.exe)`;
    }
    if (formatted.toLowerCase().includes("low reputation")) {
      return `${formatted} (Registered through a registrar associated with phishing abuse)`;
    }
    if (formatted.toLowerCase().includes("no mx")) {
      return `${formatted} (Domain has no mail exchange records configured)`;
    }
    return formatted;
  }
});
