
<div align="center">
  <img src="public/logo.png" alt="ScamSentry Logo" width="120" height="120">
  <h1 align="center">ScamSentry</h1>
  <p align="center">
    <strong>Guardians of the Gig Economy</strong>
    <br />
    Protecting freelancers, freshers, and job seekers from fraud, one report at a time.
  </p>

  <p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>

---

## 🛡️ Project Overview

**ScamSentry** is an open-source, community-driven platform designed to combat the rising tide of employment fraud. With the gig economy booming, scammers have found new ways to exploit vulnerable job seekers. ScamSentry provides a safe, anonymous space to report fraudulent activities, visualize scam hotspots, and verify legitimate companies.

Our mission is simple: **Empower the community to protect itself.**

## ✨ Features

- **🔒 Anonymous Reporting**  
  Submit detailed scam reports without fear of retaliation. No sign-up required for reporting.

- **🗺️ Interactive Heatmap**  
  Visualize global scam trends and hotspots using our real-time Mapbox integration.

- **✅ Safe Companies Directory**  
  A curated, verified list of legitimate organizations to help you distinguish friend from foe.

- **👮 Admin Dashboard**  
  Robust moderation tools for admins to review, approve, or reject reports, ensuring data integrity.

- **📊 Smart Stats**  
  Real-time community impact metrics showing blocked scams and protected value.

- **📱 Mobile-First Design**  
  Fully responsive UI that looks beautiful on every device, from desktop monitors to mobile screens.

## 🛠️ Tech Stack

We use the latest modern web technologies to ensure speed, security, and scalability.

- **Frontend:** [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [Shadcn UI](https://ui.shadcn.com/)
- **Maps:** [Mapbox GL JS](https://www.mapbox.com/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Firestore, Authentication)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up ScamSentry locally.

### Prerequisites

- Node.js 18+ installed
- A Firebase Project
- A Mapbox Public Token

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chaitanyahoon/ScamSentry.git
   cd ScamSentry
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Mapbox
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456...
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456...
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XYZ...
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the App**
   Visit `http://localhost:3000` (or `3004` if 3000 is taken).

### Admin Setup
To access the Admin Dashboard:
1. Go to your Firebase Console -> Authentication.
2. Manually add a new user (email/password).
3. Use these credentials to log in at `/admin/login`.

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/NewFeature`)
3. Commit your Changes (`git commit -m 'Add some NewFeature'`)
4. Push to the Branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  Made with ❤️ for the Community
</div>
