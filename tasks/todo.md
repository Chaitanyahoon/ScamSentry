# Deployment & Verification Checklist: ScamSentry

- [x] **Code Fixes & Build Verification**
  - [x] Backend CORS pinned to production domains & lightweight `/health`
  - [x] Circuit breaker & 3.5s timeout on Next.js API routes (eliminating 504s & '00' bug)
  - [x] Terminal static fallback dataset embedded
  - [x] Safe client mutations in `reports-context.tsx`
  - [x] Direct browser calls in `safe-companies` routed through internal proxy
  - [x] GitHub Actions workflows scoped to `main` with concurrency cancellation
  - [x] Next.js production build (`npm run build`) passed
  - [x] Jest test suite (11/11 suites, 169/169 tests) passed

- [ ] **Deployment Steps (User Action)**
  - [ ] Commit and push code to GitHub: `git add . && git commit -m "feat: production readiness and circuit breaker" && git push origin main`
  - [ ] Verify Render environment variables (`CORS_ALLOWED_ORIGINS`, `API_SECRET_KEY`)
  - [ ] Verify Vercel environment variables (`BACKEND_API_URL`, `API_SECRET_KEY`, Firebase keys)

- [ ] **Live Smoke Tests**
  - [ ] Visit `https://scamsentry-backend-j7a8.onrender.com/health?lightweight=true` -> HTTP 200 `{"status":"ok"}`
  - [ ] Visit `https://scam-sentry.vercel.app/dashboard` -> Stats populated, ticker active, no `00`
  - [ ] Test URL validation on `/validator`
