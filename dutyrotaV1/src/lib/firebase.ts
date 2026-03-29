import { initializeApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

const SECONDARY_APP_NAME = "DutyRotaStaffSignup";

/**
 * Secondary Firebase Auth instance so admins can create staff accounts
 * with createUserWithEmailAndPassword without signing out the admin session.
 */
export function getSecondaryAuth(): Auth {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const secondaryApp = existing ?? initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  return getAuth(secondaryApp);
}

// Initialize Analytics only in browser environment (not during SSR)
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export default app;
