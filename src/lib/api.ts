import { getIdToken } from './firebase';

/**
 * fetch() wrapper that attaches the current Firebase ID token as a Bearer
 * header. Use this for every call to our own /api/* routes — plain fetch()
 * will get a 401 from requireAuth on the backend.
 */
export async function authedFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = await getIdToken();
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

declare const google: any;

/**
 * Requests a short-lived Google Drive read-only access token via Google
 * Identity Services (already loaded in index.html). This is separate from
 * Firebase Auth login — a user can sign in with email/password and still
 * connect Drive this way, or sign in with Google and connect Drive
 * separately (Firebase's Google sign-in does not itself grant Drive scope).
 */
export function requestDriveAccessToken(clientId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts?.oauth2) {
      reject(new Error('Google Identity Services failed to load. Check your connection and try again.'));
      return;
    }

    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
      callback: (tokenResponse: any) => {
        if (tokenResponse?.access_token) {
          resolve(tokenResponse.access_token);
        } else {
          reject(new Error('Google did not return a Drive access token.'));
        }
      },
      error_callback: (err: any) => reject(err),
    });
    client.requestAccessToken();
  });
}
