# Plan: Fix Extension Integration Bugs in ScamSentry

## Goal
Fix three critical API integration and javascript reference errors inside the ScamSentry Chrome extension (`extension/background.js` and `extension/popup.js`) to allow seamless threat-intelligence synchronization with the Next.js API endpoints.

---

## 🛠️ Required Code Modifications

### 1. `extension/background.js`
*   **Fix domain extraction**: Extract `hostname` from the tab's full URL before calling the primary `/verify` endpoint, as it strictly expects `?domain=...`.
*   **Correct success path mapping**: Define the server response mapping cleanly. Change the undefined `result` variable reference to utilize the fetched `data` payload.
*   **Update fallback connection to POST**: Change the fallback `fetch` request to use a `POST` method with headers `Content-Type: application/json` and body `JSON.stringify({ payload: url })` to perfectly align with `/api/v1/validate` requirements.
*   **Proper threat rating calculations**: Map `100 - trustScore` for the threat index to support proper display indicators.

### 2. `extension/popup.js`
*   **Fix Trust Score percentage representation**: Correct the display value calculations so that the progress bar and percentage display true Trust Score (`100 - threatScore`) rather than showing the inverse threat rating.

---

## 🚦 Verification Checklist

### Local Validation
- [ ] No undefined variables in `background.js`
- [ ] Tab URL parsed into hostname correctly
- [ ] GET `/verify?domain=...` tested and returning successful response
- [ ] POST `/validate` with `{ payload: ... }` tested and returning successful response
- [ ] Extension popups rendering verified trust percentages

### Build Check
- [ ] `npm run lint` executes successfully in root

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Date: 2026-05-23
