/**
 * ScamSentry Options Page Logic
 * 
 * Manages configuration variables (API Base URL, Dashboard URL)
 * stored in chrome.storage.local.
 */

document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('api-url');
  const dashboardUrlInput = document.getElementById('dashboard-url');
  const saveBtn = document.getElementById('save-btn');
  const resetBtn = document.getElementById('reset-btn');
  const statusEl = document.getElementById('status');

  // Default Fallbacks
  const DEFAULT_API_URL = 'https://scamsentry.vercel.app/api/v1';
  const DEFAULT_DASHBOARD_URL = 'https://scamsentry.vercel.app/dashboard';

  // Load current values
  chrome.storage.local.get(['api_base_url', 'dashboard_url'], (settings) => {
    apiUrlInput.value = settings.api_base_url || '';
    dashboardUrlInput.value = settings.dashboard_url || '';
  });

  // Save handler
  saveBtn.addEventListener('click', () => {
    const apiUrl = apiUrlInput.value.trim();
    const dashboardUrl = dashboardUrlInput.value.trim();

    // Input Validation
    if (apiUrl && !isValidUrl(apiUrl)) {
      showStatus('Invalid API Base URL format. Must start with http:// or https://', 'error');
      return;
    }

    if (dashboardUrl && !isValidUrl(dashboardUrl)) {
      showStatus('Invalid Dashboard URL format. Must start with http:// or https://', 'error');
      return;
    }

    chrome.storage.local.set({
      api_base_url: apiUrl,
      dashboard_url: dashboardUrl
    }, () => {
      showStatus('Configuration saved successfully.', 'success');
    });
  });

  // Reset handler
  resetBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['api_base_url', 'dashboard_url'], () => {
      apiUrlInput.value = '';
      dashboardUrlInput.value = '';
      showStatus('Settings reset to default production values.', 'success');
    });
  });

  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className = `status-msg ${type}`;
    
    // Hide status after 3.5 seconds
    setTimeout(() => {
      statusEl.className = 'status-msg';
      statusEl.textContent = '';
    }, 3500);
  }
});
