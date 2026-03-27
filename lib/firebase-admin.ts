import * as admin from 'firebase-admin'

let adminApp: admin.app.App | null = null

/**
 * Initialize Firebase Admin SDK
 * Uses service account from environment variable FIREBASE_SERVICE_ACCOUNT_KEY
 */
export function initializeFirebaseAdmin(): admin.app.App {
  if (adminApp) {
    return adminApp
  }

  // Check if we're in a Node.js environment
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK should only be used on the server side')
  }

  // Get service account from environment variable
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
      'Please configure your Firebase service account credentials.'
    )
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountKey)

    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    })

    return adminApp
  } catch (error) {
    throw new Error(`Failed to initialize Firebase Admin SDK: ${error}`)
  }
}

/**
 * Get the Firebase Admin Auth instance
 */
export function getAdminAuth(): admin.auth.Auth {
  const app = initializeFirebaseAdmin()
  return admin.auth(app)
}

/**
 * Get the Firebase Admin Firestore instance
 */
export function getAdminDb(): admin.firestore.Firestore {
  const app = initializeFirebaseAdmin()
  return admin.firestore(app)
}

export default admin
