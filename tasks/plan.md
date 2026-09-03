# Final Production Architecture Plan: Scalable Two-Tier System

## Overview
Keep the dedicated FastAPI + PostgreSQL + Redis backend on Render for heavy cybersecurity scans, deep database queries, and scaling, while running the Next.js 16 frontend on Vercel with an in-memory circuit breaker and resilient fallbacks.

## System Responsibilities
1. **Next.js on Vercel**: Delivers instant page loads, renders responsive UI & 3D globe, and wraps backend calls in a 3.5s timeout + 45s circuit breaker to eliminate the '00' blank state.
2. **FastAPI on Render**: Runs deep forensic scans (TLS socket probes, multi-record DNS, WHOIS, Google Safe Browsing), brand lockdown enforcement, and PostgreSQL storage.
3. **Firebase**: Powers real-time community scam reporting and file evidence uploads.

## Status of Fixes
- [x] Backend CORS pinned to production domains (`backend/app/main.py`, `render.yaml`)
- [x] Lightweight `/health?lightweight=true` endpoint
- [x] In-memory circuit breaker & 3.5s timeout in Next.js API routes (`threats/recent`, `validator`, `scraper/trigger`, `brand-lockdowns`)
- [x] Auto-revalidation on dashboard and cyber news hub
- [x] Safe client mutations in `reports-context.tsx`
- [x] GitHub Actions workflows scoped to `main` branch with concurrency cancellation
- [x] Native `vercel.json` crons configured
- [x] All 169 unit tests and Next.js production build passing
