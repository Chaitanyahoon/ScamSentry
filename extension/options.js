/**
 * ScamSentry Options Page Logic
 *
 * Manages configuration variables and protection settings
 * stored in chrome.storage.local.
 */

document.addEventListener("DOMContentLoaded", () => {
  const apiUrlInput = document.getElementById("api-url");
  const dashboardUrlInput = document.getElementById("dashboard-url");
  const autoBlockCheckbox = document.getElementById("auto-block");
  const suspiciousWarnCheckbox = document.getElementById("suspicious-warn");
  const notificationsCheckbox = document.getElementById("notifications");

  const saveBtn = document.getElementById("save-btn");
  const resetBtn = document.getElementById("reset-btn");
  const statusEl = document.getElementById("status");

  // Load current values
  chrome.storage.local.get(
    [
      "api_base_url",
      "dashboard_url",
      "settings_auto_block",
      "settings_suspicious_warn",
      "settings_notifications",
    ],
    (settings) => {
      apiUrlInput.value = settings.api_base_url || "";
      dashboardUrlInput.value = settings.dashboard_url || "";
      autoBlockCheckbox.checked = settings.settings_auto_block !== false; // Default: true
      suspiciousWarnCheckbox.checked =
        settings.settings_suspicious_warn === true; // Default: false
      notificationsCheckbox.checked = settings.settings_notifications !== false; // Default: true
    },
  );

  // Save handler
  saveBtn.addEventListener("click", () => {
    const apiUrl = apiUrlInput.value.trim();
    const dashboardUrl = dashboardUrlInput.value.trim();

    // Input Validation
    if (apiUrl && !isValidUrl(apiUrl)) {
      showStatus(
        "Invalid API Base URL format. Must start with http:// or https://",
        "error",
      );
      return;
    }

    if (dashboardUrl && !isValidUrl(dashboardUrl)) {
      showStatus(
        "Invalid Dashboard URL format. Must start with http:// or https://",
        "error",
      );
      return;
    }

    chrome.storage.local.set(
      {
        api_base_url: apiUrl,
        dashboard_url: dashboardUrl,
        settings_auto_block: autoBlockCheckbox.checked,
        settings_suspicious_warn: suspiciousWarnCheckbox.checked,
        settings_notifications: notificationsCheckbox.checked,
      },
      () => {
        showStatus("Configuration saved successfully.", "success");
      },
    );
  });

  // Reset handler
  resetBtn.addEventListener("click", () => {
    chrome.storage.local.remove(
      [
        "api_base_url",
        "dashboard_url",
        "settings_auto_block",
        "settings_suspicious_warn",
        "settings_notifications",
        "ss_bypass_whitelist",
      ],
      () => {
        apiUrlInput.value = "";
        dashboardUrlInput.value = "";
        autoBlockCheckbox.checked = true;
        suspiciousWarnCheckbox.checked = false;
        notificationsCheckbox.checked = true;
        showStatus("Settings reset to default production values.", "success");
      },
    );
  });

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `status-msg ${type}`;

    // Hide status after 3.5 seconds
    setTimeout(() => {
      statusEl.className = "status-msg";
      statusEl.textContent = "";
    }, 3500);
  }
});
