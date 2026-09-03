# ScamSentry Production Deployment & Environment Guide

This guide details the exact production setup for ScamSentry across **Vercel** (Next.js Frontend) and **Render** (FastAPI Backend + PostgreSQL + Redis).

---

## 1. Vercel Dashboard Environment Variables (Frontend)

Configure these variables in your **Vercel Project Dashboard** under `Settings > Environment Variables`:

| Variable Name | Environment | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `BACKEND_API_URL` | Production, Preview | URL to your live Render backend web service | `https://scamsentry-backend-j7a8.onrender.com` |
| `API_SECRET_KEY` | Production, Preview | Shared secret key for authenticating admin / scraper calls | (Must match `API_SECRET_KEY` in Render) |
| `CRON_SECRET` | Production | Secret key protecting scheduled cron routes | Generate any secure string (e.g. `scamsentry-cron-secure-key`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Production, Preview | Firebase Web API Key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Production, Preview | Firebase Authentication Domain | `<project-id>.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Production, Preview | Firebase Project ID | `<project-id>` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Production, Preview | Firebase Cloud Storage Bucket | `<project-id>.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Production, Preview | Firebase Cloud Messaging Sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Production, Preview | Firebase Web App ID | `1:123456789012:web:...` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Production | Full Firebase Admin Service Account JSON string | `{"type":"service_account","project_id":"...","private_key":"..."}` |

> [!NOTE]
> If Firebase credentials are not yet configured or provided, the frontend will automatically run in **Crash-Proof Demo Mode**: serving curated initial mock reports and caching client interactions locally without throwing console errors or blank pages.

---

## 2. Render Dashboard Environment Variables (Backend)

In your **Render Dashboard** under `scamsentry-backend > Environment`:

| Variable Name | Description | Value |
| :--- | :--- | :--- |
| `ENVIRONMENT` | Runtime environment | `production` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend domains | `https://scam-sentry.vercel.app,https://scamsentry.vercel.app` |
| `API_SECRET_KEY` | Shared secret key for backend routes | Matches `API_SECRET_KEY` in Vercel |
| `DATABASE_URL` | Connection string to PostgreSQL database | Provided automatically by Render PostgreSQL Blueprint |
| `REDIS_URL` | Connection string to Redis instance | Provided automatically by Render Key-Value Blueprint |
| `GOOGLE_SAFE_BROWSING_API_KEY` | Google Safe Browsing API v4 Key (Layer 3) | (Optional) |
| `GEMINI_API_KEY` | Google Gemini API Key for threat synthesis | (Optional) |

---

## 3. How Cold-Start & Inactivity Sleep is Handled

On Render's Free Tier, services spin down after 15 minutes of inactivity. When a cold start occurs (~45-50s):

1. **Next.js Fast-Fail Circuit Breaker**:
   - The Next.js API route aborts backend connection attempts after 3.5s (`AbortSignal.timeout(3500)`).
   - If a timeout occurs, an in-memory circuit breaker opens for 45s so subsequent page views return immediately in **0ms** without hanging.
2. **Deterministic Static Terminal Fallback**:
   - The API immediately serves verified baseline OSINT threat feeds and brand lockdowns with `{ backendStatus: "waking_up" }`.
   - The user sees real, meaningful security data immediately—**never an empty `00` or broken page**.
3. **Automatic Client Re-validation**:
   - The dashboard displays a subtle indicator (`Engine Container Warming Up (~45s)`) and automatically schedules a background poll after 15 seconds.
   - Once Render finishes booting, live data seamlessly replaces fallback data without requiring a page refresh.

---

## 4. Conserving GitHub Actions Monthly Quota

GitHub Free accounts have **2,000 Actions minutes/month**. To prevent running out of quota:

1. **Branch Filtering**:
   - Workflows in `.github/workflows/frontend-ci.yml` and `backend-ci.yml` are configured to run **only** on:
     - Pull requests targeting `main`
     - Commits pushed to `main`
   - Feature branches will no longer consume CI runner minutes on every commit.
2. **Concurrency Cancellation**:
   - `concurrency` with `cancel-in-progress: true` is enabled on non-main branches. Pushing rapid commits cancels intermediate builds automatically.
3. **Scheduled Feeds via Vercel Crons**:
   - Scheduled tasks are handled via [vercel.json](file:///c:/Users/patil/OneDrive/Desktop/scamsentry/vercel.json) using native Vercel Cron jobs, consuming **0** GitHub Actions minutes.
