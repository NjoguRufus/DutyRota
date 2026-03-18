import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "admin" | "staff";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

// Cache for current user data
let currentUser: AppUser | null = null;
let authStateListeners: ((user: AppUser | null) => void)[] = [];

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: AppUser | null) => void): () => void {
  authStateListeners.push(callback);
  
  // Immediately call with current state
  callback(currentUser);
  
  // Return unsubscribe function
  return () => {
    authStateListeners = authStateListeners.filter((cb) => cb !== callback);
  };
}

/**
 * Notify all listeners of auth state change
 */
function notifyListeners(user: AppUser | null) {
  currentUser = user;
  authStateListeners.forEach((callback) => callback(user));
}

/**
 * Initialize Firebase auth state listener
 * Call this once when app starts
 */
export function initAuthListener(): () => void {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in, fetch their profile from Firestore
      const userProfile = await getUserProfile(firebaseUser.uid);
      if (userProfile) {
        notifyListeners(userProfile);
      } else {
        // User exists in Auth but not in Firestore - sign them out
        await signOut(auth);
        notifyListeners(null);
      }
    } else {
      notifyListeners(null);
    }
  });

  return unsubscribe;
}

/**
 * Get user profile from Firestore
 */
async function getUserProfile(uid: string): Promise<AppUser | null> {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        uid,
        email: data.email,
        name: data.name,
        role: data.role as UserRole,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Login with email and password
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AppUser; error?: string }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userProfile = await getUserProfile(userCredential.user.uid);

    if (!userProfile) {
      await signOut(auth);
      return { success: false, error: "User profile not found. Please contact admin." };
    }

    notifyListeners(userProfile);
    return { success: true, user: userProfile };
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    let errorMessage = "Login failed. Please try again.";

    switch (firebaseError.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        errorMessage = "Invalid email or password.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
      case "auth/network-request-failed":
        errorMessage = "Network error. Please check your connection.";
        break;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await signOut(auth);
    notifyListeners(null);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}

/**
 * Get currently logged in user (synchronous - from cache)
 */
export function getLoggedInUser(): AppUser | null {
  return currentUser;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return currentUser?.role === "admin";
}

/**
 * Check if user is staff
 */
export function isStaff(): boolean {
  return currentUser?.role === "staff";
}

// ============================================================
// SEED DATA FUNCTIONS - Use these to set up initial users
// Run these once from browser console or a setup script
// ============================================================

/**
 * Create a user profile in Firestore
 * Note: You need to first create the user in Firebase Auth Console
 * Then call this to create their profile with role
 */
export async function createUserProfile(
  uid: string,
  email: string,
  name: string,
  role: UserRole
): Promise<void> {
  await setDoc(doc(db, "users", uid), {
    email,
    name,
    role,
    createdAt: new Date().toISOString(),
  });
}

// ============================================================
// LEGACY MOCK AUTH - Keep for fallback/testing
// ============================================================

const MOCK_USERS = [
  { email: "admin@capemedia.co.ke", password: "admin123", role: "admin" as const, name: "Admin User" },
  { email: "staff@capemedia.co.ke", password: "staff123", role: "staff" as const, name: "Anne Njoroge" },
];

/**
 * Mock login for local testing without Firebase
 */
export function mockLogin(
  email: string,
  password: string
): { success: boolean; user?: AppUser; error?: string } {
  const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!found) {
    return { success: false, error: "Invalid email or password" };
  }
  const user: AppUser = {
    uid: `mock-${found.email}`,
    email: found.email,
    role: found.role,
    name: found.name,
  };
  localStorage.setItem("auth_user", JSON.stringify(user));
  notifyListeners(user);
  return { success: true, user };
}

/**
 * Mock logout for local testing
 */
export function mockLogout(): void {
  localStorage.removeItem("auth_user");
  notifyListeners(null);
}

/**
 * Initialize mock auth from localStorage (for page refresh)
 */
export function initMockAuth(): void {
  const stored = localStorage.getItem("auth_user");
  if (stored) {
    try {
      const user = JSON.parse(stored) as AppUser;
      notifyListeners(user);
    } catch {
      localStorage.removeItem("auth_user");
    }
  }
}
