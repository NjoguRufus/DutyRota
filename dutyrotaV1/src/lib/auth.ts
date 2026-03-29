import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, getSecondaryAuth } from "./firebase";

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
      case "auth/invalid-email":
        errorMessage = "Please enter a valid email address.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled. Contact your administrator.";
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

async function createAuthUserWithProfile(
  email: string,
  password: string,
  name: string,
  role: UserRole
): Promise<{ uid: string } | { error: string }> {
  const trimmed = email.trim();
  try {
    const secondary = getSecondaryAuth();
    const cred = await createUserWithEmailAndPassword(secondary, trimmed, password);
    await createUserProfile(cred.user.uid, trimmed, name, role);
    await signOut(secondary);
    return { uid: cred.user.uid };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "auth/email-already-in-use") {
      return {
        error:
          "This email is already registered. Use another email or remove the old account in Firebase Console.",
      };
    }
    if (code === "auth/weak-password") {
      return { error: "Password is too weak. Use at least 6 characters." };
    }
    if (code === "auth/invalid-email") {
      return { error: "Invalid email address." };
    }
    console.error("createAuthUserWithProfile:", error);
    return {
      error:
        "Could not create account. Check Firebase Auth is enabled and Firestore rules allow bootstrap (see FIREBASE_SETUP).",
    };
  }
}

/**
 * Create a Firebase Auth user for staff (admin stays signed in on primary app).
 * Writes Firestore users/{uid} with role staff.
 */
export async function createStaffAuthAccount(
  email: string,
  password: string,
  name: string
): Promise<{ uid: string } | { error: string }> {
  return createAuthUserWithProfile(email, password, name, "staff");
}

/**
 * Create first / extra admin account from the login screen (secondary Auth + Firestore profile).
 * Remove the temporary UI in production; tighten Firestore rules after setup.
 */
export async function createAdminAuthAccount(
  email: string,
  password: string,
  name: string
): Promise<{ uid: string } | { error: string }> {
  return createAuthUserWithProfile(email, password, name, "admin");
}

/**
 * Send password reset email to a staff member (Firebase mode).
 */
export async function sendStaffPasswordResetEmail(email: string): Promise<{ ok: true } | { error: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { ok: true };
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code;
    if (code === "auth/user-not-found") {
      return { error: "No account found for this email." };
    }
    console.error("sendStaffPasswordResetEmail:", error);
    return { error: "Could not send reset email." };
  }
}

