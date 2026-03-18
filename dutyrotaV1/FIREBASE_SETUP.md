# Firebase Setup Guide

## Overview

This project uses Firebase for:
- **Authentication**: Email/password login for admin and staff users
- **Firestore**: Database for storing user profiles (and later: employees, rotas, reports)

## Environment Variables

The Firebase configuration is stored in `.env` (not committed to git):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

Copy `.env.example` to `.env` and fill in your Firebase project values.

## Initial Setup

### Step 1: Create Users in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Users**
4. Click **Add user**
5. Create users with email/password:
   - Admin: `admin@capemedia.co.ke` / `admin123`
   - Staff: `staff@capemedia.co.ke` / `staff123`

### Step 2: Create User Profiles in Firestore

After creating users in Authentication, you need to create their profiles in Firestore.

1. Go to **Firestore Database** in Firebase Console
2. Create a collection called `users`
3. Add documents with the **user's UID** as the document ID:

**Admin User Document:**
```json
{
  "email": "admin@capemedia.co.ke",
  "name": "Admin User",
  "role": "admin",
  "createdAt": "2026-03-18T00:00:00.000Z"
}
```

**Staff User Document:**
```json
{
  "email": "staff@capemedia.co.ke",
  "name": "Anne Njoroge",
  "role": "staff",
  "createdAt": "2026-03-18T00:00:00.000Z"
}
```

### Step 3: Set Up Firestore Security Rules

**Option A: Deploy via Firebase CLI (Recommended)**

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project (if not already done):
   ```bash
   firebase init
   ```
   - Select Firestore and Hosting
   - Choose your existing project
   - Accept defaults for rules file location

4. Deploy the rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

The rules are defined in `firestore.rules` in the project root.

**Option B: Copy rules manually**

Go to **Firestore Database** > **Rules** in Firebase Console and paste the contents of `firestore.rules`.

### Security Rules Overview

The `firestore.rules` file defines:

| Collection | Admin | Staff | Public |
|------------|-------|-------|--------|
| `users` | Read/Write | Read own only | No access |
| `employees` | Full CRUD | Read only | No access |
| `rotas` | Full CRUD | Read own shifts | No access |
| `reports` | Full CRUD | No access | No access |
| `departments` | Full CRUD | Read only | No access |
| `settings` | Full CRUD | Read only | No access |

## Switching Between Mock and Firebase Mode

The application supports both mock data (for development) and real Firebase data (for production).

### Configuration File

All toggles are centralized in `src/lib/config.ts`:

```typescript
// Set to true for development (in-memory storage)
// Set to false to use Firebase Firestore
export const USE_MOCK_DATA = true;

// Set to true for development (localStorage-based auth)
// Set to false to use Firebase Authentication
export const USE_MOCK_AUTH = true;
```

### Development Mode (Default)

Both flags are `true` by default. Use these credentials:
- Admin: `admin@capemedia.co.ke` / `admin123`
- Staff: `staff@capemedia.co.ke` / `staff123`

### Production Mode (Firebase)

To switch to real Firebase:

1. Ensure Firebase users exist in Authentication
2. Ensure user profiles exist in Firestore `users` collection
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. Open `src/lib/config.ts`
5. Set both flags to `false`:
   ```typescript
   export const USE_MOCK_DATA = false;
   export const USE_MOCK_AUTH = false;
   ```
6. Rebuild and deploy

## File Structure

```
src/
├── lib/
│   ├── config.ts           # Central configuration (USE_MOCK_DATA, USE_MOCK_AUTH)
│   ├── firebase.ts         # Firebase initialization
│   ├── auth.ts             # Authentication functions
│   ├── mockData.ts         # Mock employee data store
│   ├── rotaData.ts         # Mock rota data store
│   ├── reportData.ts       # Mock report data store
│   ├── firebaseEmployees.ts # Firestore employee operations
│   ├── firebaseRotas.ts    # Firestore rota operations
│   └── firebaseReports.ts  # Firestore report operations
├── hooks/
│   ├── useAuth.tsx         # Auth context and hook
│   ├── useEmployees.ts     # Employee data hook (mock/Firebase)
│   ├── useRotas.ts         # Rota data hook (mock/Firebase)
│   └── useReports.ts       # Report data hook (mock/Firebase)
├── components/
│   └── guards/             # Route protection components
│       ├── AdminGuard.tsx
│       ├── StaffGuard.tsx
│       └── index.ts
```

## Troubleshooting

### "User profile not found" error
- Make sure the user exists in Firebase Authentication
- Make sure a document exists in `users` collection with the user's UID as the document ID

### "Network error" 
- Check your internet connection
- Verify Firebase config in `.env` is correct

### Login works but redirects back to login
- Check browser console for errors
- Verify Firestore rules allow reading user profiles

---

## Firebase Files in This Project

| File | Purpose |
|------|---------|
| `firebase.json` | Firebase project configuration |
| `firestore.rules` | Firestore security rules |
| `firestore.indexes.json` | Firestore composite indexes for queries |
| `.env` | Firebase config (API keys) - gitignored |
| `.env.example` | Template for .env file |

## Deploying to Firebase

### Deploy Everything
```bash
firebase deploy
```

### Deploy Only Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Indexes
```bash
firebase deploy --only firestore:indexes
```

### Deploy Only Hosting (Frontend)
```bash
npm run build
firebase deploy --only hosting
```

## Firestore Indexes

The `firestore.indexes.json` file defines composite indexes for efficient queries:

1. **Rotas by Employee + Date** - For fetching a staff member's schedule
2. **Rotas by Department + Date** - For department coverage reports
3. **Employees by Department + Name** - For sorted employee lists
