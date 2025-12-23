import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"
import { getAnalytics, Analytics, isSupported } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyD5QX4zZhA5foxWs_PTWGlXbAeXic5nBp4",
  authDomain: "chaitanya-scamsentry.firebaseapp.com",
  projectId: "chaitanya-scamsentry",
  storageBucket: "chaitanya-scamsentry.firebasestorage.app",
  messagingSenderId: "1009634174042",
  appId: "1:1009634174042:web:51679c50f954ef0f602463",
  measurementId: "G-9RJEH5QQLE"
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

