import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

// Reads credentials from three separate env vars rather than one JSON blob —
// this avoids newline-escaping issues that are common when pasting a private
// key into Vercel's env var UI.
function buildAdminApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel (and most dashboards) store multi-line values with literal \n
  // sequences instead of real newlines, so this needs to be unescaped.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
      'and FIREBASE_PRIVATE_KEY in your environment.'
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

let cachedApp: App | null = null;
function getAdminApp(): App {
  if (!cachedApp) {
    cachedApp = getApps().length ? getApps()[0] : buildAdminApp();
  }
  return cachedApp;
}

// adminAuth/db are lazily initialized behind a Proxy rather than at module
// load. If Firebase credentials are missing, this means the server still
// boots and serves everything that doesn't touch Firebase (landing page,
// static assets, health checks) — only the specific request that hits
// requireAuth or Firestore fails, with a clear error, instead of the whole
// process crashing on startup and taking every route down with it.
function lazy<T extends object>(factory: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      if (!instance) instance = factory();
      const value = Reflect.get(instance as object, prop, receiver);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const db: Firestore = lazy(() => getFirestore(getAdminApp()));
