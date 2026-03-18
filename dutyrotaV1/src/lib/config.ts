/**
 * Application Configuration
 * 
 * Toggle between mock data and Firebase for development/production
 * 
 * INSTRUCTIONS:
 * - Keep both flags `true` during development without Firebase
 * - Set both to `false` when ready to use the real Firebase backend
 * - Make sure Firebase users are created in Firebase Console before switching
 */

/**
 * Set to `true` to use mock data (local in-memory storage)
 * Set to `false` to use Firebase Firestore
 */
export const USE_MOCK_DATA = true;

/**
 * Set to `true` to use mock auth (localStorage-based)
 * Set to `false` to use Firebase Authentication
 */
export const USE_MOCK_AUTH = true;
