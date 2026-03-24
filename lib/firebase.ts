import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"
import { getAnalytics, Analytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "REDACTED_FILTER_BRANCH",
  authDomain: "REDACTED_FILTER_BRANCH",
  projectId: "REDACTED_FILTER_BRANCH",
  storageBucket: "REDACTED_FILTER_BRANCH",
  messagingSenderId: "REDACTED_FILTER_BRANCH",
  appId: "1:REDACTED_FILTER_BRANCH:web:51679c50f954ef0f602463",
  measurementId: "REDACTED_FILTER_BRANCH"
};

// Initialize Firebase
let app: FirebaseApp
let auth: Auth
let db: Firestore
let storage: FirebaseStorage
let analytics: Analytics | null = null

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

auth = getAuth(app)
db = getFirestore(app)
storage = getStorage(app)

// Initialize Analytics only on client side
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app)
    }
  })
}

export { app, auth, db, storage, analytics }

