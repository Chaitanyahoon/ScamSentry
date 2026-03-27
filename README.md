# 🔐 ScamSentry | Forensic Threat Intelligence

<div align="center">
  <img src="public/logo.png" alt="ScamSentry Logo" width="160">
  <br />
  <h3>Deterministic URL Threat Detection & Forensic Analysis</h3>
  <p>
    <strong>High-Trust Open Source Intelligence (OSINT) for the Modern Web</strong>
  </p>
</div>

---

## 🏛️ Project Overview

**ScamSentry** is a high-performance forensic platform designed to combat industrial-scale employment fraud and malicious URL campaigns. Transitioning from generic AI-based detection to a **deterministic, 4-layer heuristic engine**, ScamSentry provides military-grade trust signals for job seekers, freshers, and enterprise partners.

The platform has been redesigned with the **"Forensic Amber"** design system—inspired by professional OSINT workstation aesthetics (Maltego, Shodan)—to emphasize accuracy, transparency, and data-driven trust.

## 🚀 Key Features

### 🧠 4-Layer Deterministic Engine (Non-AI)
Unlike broad AI models, ScamSentry uses a multi-layered verifiable analysis pipeline:
1. **L1: Heuristics** — Real-time pattern matching for known scam indicators.
2. **L2: DNS Forensics** — Deep analysis of domain age, registrar reputation, and SSL validity.
3. **L3: Threat Intel** — Direct synchronization with global OSINT blocklists (Google Safe Browsing, etc.).
4. **L4: Internal Ledger** — Cross-referencing against our community-verified scam database.

### 📊 Professional Batch Scanner (CLI)
A robust command-line tool for security researchers and B2B partners to scan thousands of URLs in seconds with automated reporting in JSON, CSV, or HTML.

### 🗺️ Global Threat Hotspots
Real-time visualization of scam campaign origins and targets using **MapLibre GL**, focused on high-complaint regions.

### 🛡️ Enterprise-Grade Architecture
- **Rate-Limiting**: Powered by **Upstash Redis** for distributed production scaling.
- **Admin Workspace**: Secure moderation portal for database integrity.
- **Micro-Verifications**: Deterministic "Safe Company" whitelist.

## 🛠️ Tech Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Design**: "Forensic Amber" custom CSS tokens, Tailwind CSS, Shadcn UI
- **Data**: Firebase (Firestore, Auth), Upstash (Redis / Rate Limiting)
- **Maps**: MapLibre GL JS
- **Testing**: Jest + React Testing Library (150+ deterministic tests)

## 📁 Installation & Setup

1. **Clone & Install**
   ```bash
   git clone https://github.com/Chaitanyahoon/ScamSentry.git
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env.local` and populate:
   - `GEMINI_API_KEY` (Layer 5 Semantic Context)
   - `GOOGLE_SAFE_BROWSING_API_KEY`
   - `FIREBASE_*` (Database & Auth)
   - `UPSTASH_REDIS_*` (Rate Limiting)

3. **Run Development**
   ```bash
   npm run dev
   ```

4. **Run CLI Scanner**
   ```bash
   npm run scan urls.txt --format html --output report.html
   ```

## 📜 License
MIT License. Created with ❤️ for the global job-seeking community.

---
<div align="center">
  <strong>Built for Accuracy. Designed for Trust.</strong>
</div>
