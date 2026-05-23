# Plan: Make ScamSentry 100% Free, Add Email Scanning & Interactive Analytics

We are upgrading ScamSentry to be entirely free to run. This includes completely removing the Google Gemini SDK dependency, adding deep local recruiter email verification to Layer 1 heuristics, limiting OSINT feed database writes to a strict 500-item free-tier threshold, and implementing live, interactive Recharts telemetries on the Admin Overwatch Dashboard.

---

## 🛠️ Proposed Engineering Changes

### 1. Strip Gemini AI Layer (Phase 1)
*   **Remove npm dependencies**: Uninstall `@google/genai` and `@google/generative-ai` from `package.json`.
*   **Remove L5 references**: Purge all Layer 5 (Semantic L5) integrations from `/api/v1/validate/route.ts` and dynamic threat fingerprinting modules.
*   **Purge files**: Delete `src/lib/validator/semantic.ts`.

### 2. Deep Local Recruiter Email Heuristics (Phase 2)
*   **Email Heuristics Dictionary**: Create `EMAIL_PATTERN_DICTIONARY` inside `src/lib/validator/heuristics.ts` to detect public email domain abuses (e.g. Gmail/Yahoo recruiter mails representing corporate whitelists).
*   **Levenshtein Typosquat checking**: Validate email sender domains against brand lookalikes directly inside local L1 Heuristics.

### 3. OSINT 500-Item Cap (Phase 3)
*   **Firestore Daily Limits Safeguard**: Constrain OpenPhish and PhishTank synchronization limits in `osint-sync.ts` to exactly 250 records per feed (500 total).
*   **Firebase Mock-Graceful Fallbacks**: Log errors gracefully instead of throwing core crashes if Firebase Admin service accounts are missing in local dev.

### 4. Recharts Interactive Dashboard (Phase 4)
*   **Admin Telemetry Upgrades**: Replace static bars in `src/components/admin-dashboard-client.tsx` with dynamic **AreaChart** (time-series scans over time) and **PieChart** (scam vector distributions) leveraging real data from the reports context.

---

## 🚦 Verification Checklist

### Automated Checks
- [ ] Run Jest unit tests to verify heuristics and database limits
- [ ] Execute `npm run build` to verify clean typescript compilation

### Manual Checks
- [ ] Inspect the Telemetry tab on the Admin Dashboard to verify Recharts interactivity
- [ ] Submit fraudulent email payloads (e.g. `careers-amazon@gmail.com`) to confirm local L1 flagging

---

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success (Next.js Turbopack compiled successfully in 27.4s)
- Date: 2026-05-23
