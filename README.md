# 🔐 ScamSentry | Forensic Threat Intelligence

<div align="center">
  <img src="public/logo.png" alt="ScamSentry Logo" width="110">
  <br />
  <p align="center">
    <a href="https://github.com/Chaitanyahoon/ScamSentry/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-B45309.svg?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License">
    </a>
    <a href="https://scam-sentry.vercel.app/">
      <img src="https://img.shields.io/badge/Live-Deployment-F59E0B.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Deployment">
    </a>
    <a href="https://github.com/Chaitanyahoon/ScamSentry/actions">
      <img src="https://img.shields.io/badge/Tests-162%20Passing-10B981.svg?style=for-the-badge&logo=jest&logoColor=white" alt="Tests passing">
    </a>
  </p>
  
  <h3>Zero-Trust URL Forensics & Offline Threat Analysis</h3>
  
  <p>
    <strong>A high-performance forensic platform designed to neutralize industrial-scale employment fraud and phishing campaigns completely locally ($0 API overhead).</strong>
  </p>

  <br />
  
  <!-- Demonstration Frame -->
  <img src="skeleton.gif" alt="ScamSentry Telemetry Terminal Demo" width="900" style="border: 2px solid #1F1914; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.65);">
</div>

---

## 🏛️ Platform Overview

**ScamSentry** is a high-performance open-source forensic intelligence platform designed to intercept, dissect, and catalog malicious phishing URL networks and fraudulent recruiter profiles. Engineered to run completely offline without reliance on costly or unpredictable paid AI APIs, the core validator engine is built around a **4-Layer Deterministic Pipeline** that processes checks with sub-millisecond latencies.

The interface is styled entirely under the custom **"Forensic Amber"** design system—inspired by legacy amber CRT monitors and professional intelligence workstations (Shodan, Maltego, ShrewSoft)—blending retro command line aesthetics with smooth, modern responsive physics.

---

## ⚙️ Core Architecture & Analysis Pipeline

Unlike generic security scanners, ScamSentry inspects target vectors across four distinct, offline-first verification layers:

```
[Target URL/Email]
        │
        ├── L1: Heuristics  ──► [Punycode, Homoglyph Lookalikes, Brand Spoofs]
        │
        ├── L2: DNS Core    ──► [IP Resolve, Fast-Flux, Subdomain MX Fallbacks]
        │
        ├── L3: Threat Intel ─► [Global Safe Browsing Integrations]
        │
        └── L4: Ledger DB   ──► [P2P Cross-Reference Logs]
```

### 🔍 Layer 1: Heuristics (L1)
*   **Visual Spoofing (Homoglyphs)**: Decodes Punycode strings (`xn--`) and normalizes Cyrillic/Greek character mappings to detect visual mimicry (e.g., matching lookalike letters in `paypa1.com` against the official `paypal` signature).
*   **Recruiter Email Auditing**: Intercepts public/free email addresses claiming corporate representation (e.g., `hr-amazon@gmail.com`) and automatically applies critical warnings.
*   **Path Entropy Obstruction**: Computes character entropy counts on long paths to detect Base64 obfuscations and Domain Generation Algorithm (DGA) signatures.

### 🌐 Layer 2: Infrastructure Forensics (L2)
*   **Mail Exchange (MX) Fallback**: Queries records recursively on subdomains (e.g., resolving `scam-sentry.vercel.app` via `vercel.app` parent authority) to clear legitimate cloud subdomains while maintaining alerts for burner hosts.
*   **Fast-Flux Detection**: Counts unique IP assignments per hostname to identify decentralized hosting botnets.
*   **RDAP Registry Check**: Audits registrar creation dates to immediately flag ultra-new burner domains (under 15 days old).

### 🛡️ Layer 3: Global Threat Intelligence (L3)
*   Checks processed URLs against standard Google Safe Browsing databases locally, bypassing processing arrays if API configurations are skipped.

### 📊 Layer 4: Trust Ledger Database (L4)
*   Queries active community-submitted scam archives on Firestore to alert when the searched domain aligns with existing threat footprints.

---

## 💻 Tech Stack & Design System

*   **Framework**: Next.js 16 (App Router / Turbopack), React 19, TypeScript
*   **Styling**: Pure CSS Custom Variables (`#15110E` Burnt Amber / `#0C0A09` Deep Carbon), Tailwind CSS, Lucide icons
*   **Data Tier**: Firebase (Auth, Firestore DB), Upstash Redis (Distributed Rate Limiting)
*   **Data Visualizations**: Responsive interactive time-series `AreaChart` and distribution `PieChart` styled in terminal-amber via `recharts`
*   **Test Suite**: 9 Jest Suites, **162 passing tests** covering spoofing distance formulas, email captures, and limits protection.

---

## 📁 Environment Setup

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/Chaitanyahoon/ScamSentry.git
   cd ScamSentry
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   # API Keys (Optional but recommended for Layer 3 check)
   GOOGLE_SAFE_BROWSING_API_KEY="your-google-safe-browsing-key"

   # Firebase Client Config (Admin Oversight & Reports database)
   NEXT_PUBLIC_FIREBASE_API_KEY="firebase-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="scam-sentry.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="scam-sentry"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="scam-sentry.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="app-id"

   # Upstash Redis Credentials (API Rate-Limiting Protection)
   UPSTASH_REDIS_REST_URL="https://your-upstash-redis.upstash.io"
   UPSTASH_REDIS_REST_TOKEN="your-rest-token"
   ```

3. **Spin Up Local Workstation**
   ```bash
   npm run dev
   # Workstation accessible at http://localhost:3000
   ```

---

## 🛠️ Developer Utility Commands

*   **Execute Full Verification Tests**
    ```bash
    npm run test
    ```
*   **Trigger Next.js Turbopack Production Compilation**
    ```bash
    npm run build
    ```
*   **Initiate Command Line Batch Scanner**
    ```bash
    # Scan raw URL listings inside a text file
    npm run scan urls.txt --format html --output report.html
    ```

---

<div align="center">
  <sub>Managed by the ScamSentry Research Labs · Engineered for a Safer Web</sub>
</div>
