# 🔐 ScamSentry | Forensic Threat Intelligence

<div align="center">
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
    <strong>A high-performance forensic platform designed to neutralize industrial-scale employment fraud and sketchy URLs completely offline ($0 API cost, because cloud bills are the real threat).</strong>
  </p>

  <br />
  
  <!-- Centered and Resized Skeleton Banging Shield Meme -->
  <img src="skeleton.gif" alt="ScamSentry Shield Defense (Skeleton Banging Shield Meme)" width="480" style="border: 2px solid #1F1914; border-radius: 12px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55);">
  <br />
  <sub><i>Live footage of our L1 Heuristics holding the firewall against "careers-apple@gmail.com" recruiters.</i></sub>
</div>

---

## 🏛️ Platform Overview

**ScamSentry** is a high-performance open-source forensic intelligence platform designed to intercept, dissect, and humiliate malicious phishing URL networks and fraudulent recruiter profiles. 

In a world where developers are constantly told to "just throw an expensive LLM at it", we did the financially responsible thing: **we uninstalled the AI**. By purging heavy Gemini libraries, ScamSentry runs a completely offline, **4-Layer Deterministic Pipeline** that processes checks with sub-millisecond latencies and a grand total of **$0.00 in monthly API bills**.

The interface is styled entirely under the custom **"Forensic Amber"** design system—inspired by legacy amber CRT monitors and professional intelligence workstations (Shodan, Maltego)—blending retro hacker aesthetics with smooth, modern responsive physics.

---

## ⚙️ Core Architecture & Analysis Pipeline

Every URL/Email submitted goes through a gauntlet of verification layers, engineered to keep your parent's retirement fund safe:

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
*   **Visual Spoofing (Homoglyphs)**: Decodes Punycode strings (`xn--`) and checks if someone is trying to sneak `paypa1.com` past your filters.
*   **Recruiter Email Auditing**: Instantly flags Gmail accounts claiming to be official brand representatives (`careers-google@gmail.com`). (Adds `+75` threat score because Google recruiters rarely use free webmail accounts to hire senior architects).
*   **Path Entropy Obstruction**: Measures character randomness to flag DGA (Domain Generation Algorithms) and obfuscated Base64 pathways.

### 🌐 Layer 2: Infrastructure Forensics (L2)
*   **Mail Exchange (MX) Subdomain Fallback**: Legitimate companies don't delegate subdomains on burner cloud hosts to send corporate emails. If a subdomain has no MX records (e.g., `scam-sentry.vercel.app`), the resolver recursively checks the root domain (`vercel.app`), clearing legitimate hosts while keeping the scanner highly suspicious of arbitrary hacker landing zones.
*   **Fast-Flux Detection**: Flags domains resolving to excessive distinct IPs, indicating botnet proxy distributions.
*   **RDAP Registry Check**: Audits domain age to instantly warn if a site is younger than a carton of milk (under 15 days).

### 🛡️ Layer 3: Global Threat Intelligence (L3)
*   Queries standard Google Safe Browsing databases locally, failing silently if API keys are unconfigured, so your local dev workstation doesn't crash when you're offline.

### 📊 Layer 4: Trust Ledger Database (L4)
*   Queries active community-submitted scam archives on Firestore, because nothing is more deterministic than community spite.

---

## 💻 Tech Stack & Design System

*   **Framework**: Next.js 16 (App Router / Turbopack), React 19, TypeScript
*   **Styling**: Pure CSS Custom Variables (`#15110E` Burnt Amber / `#0C0A09` Deep Carbon), Tailwind CSS
*   **Data Tier**: Firebase (Auth, Firestore DB), Upstash Redis (Distributed Rate Limiting, because we can't afford actors DDOSing our free database tier)
*   **Data Visualizations**: Time-series `AreaChart` and distribution `PieChart` styled in terminal-amber via `recharts`
*   **Test Suite**: 9 Jest Suites, **164 passing tests** to guarantee the pipeline remains rock solid.

---

## 📁 Repository Folder Structure

The repository is structured as a clean monorepo:

*   📂 **[src/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/src)**: Next.js Frontend Application
    *   📂 **[app/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/src/app)**: Web page routes, layout templates, and API endpoints (e.g. validator, community, reports).
    *   📂 **[components/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/src/components)**: Cyberpunk-themed widgets (Forensic Globe, Threat Node Graph, Recharts logs panels).
    *   📂 **[lib/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/src/lib)**: Shared utility modules (Firebase admin client, rate-limit profiles, webhooks).
*   📂 **[backend/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/backend)**: High-Performance FastAPI Scanner Server (Python 3.13)
    *   📂 **[app/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/backend/app)**: Core Python logic including database models, routers, and layers L1–L4 engines.
    *   📂 **[tests/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/backend/tests)**: Comprehensive Python pytest suites.
*   📂 **[extension/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/extension)**: Real-time Chrome Interception Extension (Manifest v3)
    *   📄 **[background.js](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/extension/background.js)**: Async service worker listening to tab transitions and triggering blocks.
    *   📄 **[blocked.html](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/extension/blocked.html)**: Interactive block page warning users away from detected threats.
*   📂 **[__tests__/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/__tests__)**: Jest Frontend automated tests folder.
*   📂 **[scripts/](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/scripts)**: Batch scanning command line tools ([cli.ts](file:///c:/Users/patil/OneDrive/Desktop/scam-sentry/ScamSentry/scripts/cli.ts)).

---

## ⚙️ Environment Setup & Installations

### 💻 1. Next.js Frontend Setup
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

### 🐍 2. FastAPI Backend Setup
1. **Navigate to the Backend directory & Create Virtualenv**
   ```bash
   cd backend
   python -m venv .venv
   ```
2. **Activate the Environment**
   * **Windows (PowerShell)**:
     ```powershell
     .\.venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```
3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Run Server**
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   # API docs accessible at http://127.0.0.1:8000/docs
   ```

### 🔌 3. Chrome Extension Installation
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Toggle **"Developer mode"** in the top-right corner to **ON**.
3. Click the **"Load unpacked"** button in the top-left.
4. Select the **`extension`** folder from this repository.
5. The ScamSentry Shield badge will appear in your extensions list, ready to protect your web navigation!

---

## 🛠️ Developer Utility Commands

*   **Execute Full Verification Tests**
    *   **Frontend**: `npm run test`
    *   **Backend**: `.\.venv\Scripts\pytest` (from `/backend` folder)
*   **Trigger Next.js Production Compilation**
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
  <sub>Managed by the ScamSentry Research Labs · Engineered with ❤️ and a complete lack of venture capital funding</sub>
</div>
