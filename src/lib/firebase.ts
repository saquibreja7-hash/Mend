import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
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

// Upgrade anonymous account to Google — preserves all data.
// Uses redirect (not popup) so it works reliably on mobile/PWA.
// The page navigates away; auth state is resolved on return via handleRedirectResult.
export async function signInWithGoogle(): Promise<void> {
  const current = auth.currentUser;
  if (current?.isAnonymous) {
    await linkWithRedirect(current, googleProvider);
  } else {
    await signInWithRedirect(auth, googleProvider);
  }
}

// Call once on app mount to resolve any pending Google redirect.
// Handles the credential-already-in-use case (Google account linked to
// a different Firebase UID) by falling back to a direct sign-in redirect.
export async function handleRedirectResult(): Promise<void> {
  try {
    await getRedirectResult(auth);
    // onAuthStateChanged will fire automatically with the new user
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code === "auth/credential-already-in-use") {
      // Linked to a different account — sign in directly on next redirect
      await signInWithRedirect(auth, googleProvider);
    }
    // Other errors (network, cancelled) are silently ignored
  }
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
  // Re-establish anonymous session immediately after sign-out
  await signInAnonymously(auth);
}
