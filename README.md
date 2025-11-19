# Scam Sentry 🛡️

**Scam Sentry** is an open, anonymous, and crowdsourced scam reporting platform designed to protect freelancers, freshers, and job seekers from fake hiring offers, portfolio theft, and fraud.

Built with **Next.js 15**, **React 19**, **Tailwind CSS**, **Mapbox**, and **Firebase**.

---

## 🚀 Features

- **Anonymous Reporting**: Submit scam reports without signing up.
- **Interactive Scam Map**: Visualize scam hotspots globally.
- **Advanced Search**: Filter scams by type, company, or keywords.
- **Safe Companies Directory**: A verified list of legitimate companies.
- **Trust Scoring**: AI-powered risk assessment for job offers.
- **Moderation Tools**: Community voting and admin dashboard for verification.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS, Shadcn UI
- **Map & Geo**: Mapbox GL JS, React Map GL
- **State Management**: React Context API
- **Backend**: Firebase (Firestore, Auth)
- **Deployment**: Vercel

---

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/scam-sentry.git
   cd scam-sentry
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your keys:

   ```env
   # Mapbox (Required for Map)
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

   # Firebase (Required for Database & Auth)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin dashboard & login
│   ├── map/              # Interactive map page
│   ├── report/           # Scam reporting form
│   ├── safe-companies/   # Safe companies directory
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   └── ...
├── contexts/             # React Context (Reports, Auth)
├── lib/                  # Utilities & Firebase config
│   └── firebase.ts       # Firebase initialization
└── public/               # Static assets
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 📞 Contact

Project Link: [https://github.com/yourusername/scam-sentry](https://github.com/Chaitanyahoon/scam-sentry)
