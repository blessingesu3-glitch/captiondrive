// Deliberately using the classic firebase-admin default-export API
// (admin.initializeApp / admin.auth() / admin.firestore()) rather than the
// newer subpath imports (firebase-admin/app, firebase-admin/auth,
// firebase-admin/firestore). Those subpaths rely on Node's package "exports"
// resolution, which some serverless bundlers (Vercel's own Node function
// builder among them, historically) don't fully support for firebase-admin's
// export map — causing every route in the module to fail at import time,
// not just the ones that touch Firebase. This form resolves via the
// package's plain "main" field instead, which is a much safer bet here.
import admin from 'firebase-admin';

type App = admin.app.App;
type Auth = admin.auth.Auth;
type Firestore = admin.firestore.Firestore;

/**
 * Firebase private keys get mangled in predictable ways when copy-pasted
 * through a JSON file into a single-line-oriented UI like Vercel's env var
 * form: literal `\n` sequences instead of real newlines, stray wrapping
 * quote marks carried over from the JSON string, or leading/trailing
 * whitespace. Node's crypto decoder fails with an opaque
 * "DECODER routines::unsupported" error for any of these — this function
 * defensively normalizes all of them rather than assuming one exact cause.
 */
function normalizePrivateKey(raw: string): string {
  let key = raw.trim();
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\n/g, '\n');
  return key;
}

function buildAdminApp(): App {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? normalizePrivateKey(rawPrivateKey) : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
      'and FIREBASE_PRIVATE_KEY in your environment.'
    );
  }

  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY does not look like a valid PEM key (missing BEGIN/END markers). ' +
      'Check that the full private_key value from the service account JSON was pasted, including ' +
      'both markers, without surrounding quotes.'
    );
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });
}

let cachedApp: App | null = null;
function getAdminApp(): App {
  if (!cachedApp) {
    cachedApp = admin.apps.length ? (admin.apps[0] as App) : buildAdminApp();
  }
  return cachedApp;
}

// Lazy behind a Proxy so a missing/broken credential only fails the specific
// request that needs Firebase, not the whole module (and therefore every
// route) at import/cold-start time.
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

export const adminAuth: Auth = lazy(() => getAdminApp().auth());
export const db: Firestore = lazy(() => getAdminApp().firestore());
