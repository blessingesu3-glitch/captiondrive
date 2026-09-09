import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

// These are the *public* web config values (not secrets) — safe to ship in
// the client bundle. Firebase security comes from Firestore rules and
// backend ID-token verification, not from hiding this config.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signUpWithEmail(name: string, email: string, password: string): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred.user;
}

export async function signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle(): Promise<{ user: FirebaseUser; isNewUser: boolean }> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const additionalInfo = getAdditionalUserInfo(cred);
  return { user: cred.user, isNewUser: Boolean(additionalInfo?.isNewUser) };
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/** Current user's Firebase ID token, or null if signed out. Used to
 * authenticate every backend API call — see authedFetch in ./api.ts. */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
