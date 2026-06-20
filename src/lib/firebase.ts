import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";

const firebaseConfig = {
  projectId: "mend-heartbreak-app",
  appId: "1:748285349716:web:f7190e867f6625bd3382c1",
  storageBucket: "mend-heartbreak-app.firebasestorage.app",
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: "mend-heartbreak-app.firebaseapp.com",
  messagingSenderId: "748285349716",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Ensures a user is always signed in (anonymous by default).
// Returns a promise resolving to the uid.
export function ensureAuth(): Promise<string> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub();
      if (user) {
        resolve(user.uid);
      } else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user.uid);
      }
    });
  });
}

// Subscribe to auth state changes
export function onUserChanged(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// Upgrade anonymous account to Google — preserves all data
export async function signInWithGoogle(): Promise<User> {
  const current = auth.currentUser;
  if (current?.isAnonymous) {
    // Link anonymous session to Google account so data is preserved
    try {
      const result = await linkWithPopup(current, googleProvider);
      return result.user;
    } catch (err: unknown) {
      // If Google account already exists, sign in directly
      if (
        err instanceof Error &&
        (err as { code?: string }).code === "auth/credential-already-in-use"
      ) {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      }
      throw err;
    }
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  // Re-establish anonymous session immediately after sign-out
  await signInAnonymously(auth);
}
