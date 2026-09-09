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
 * Safely parses a backend response as JSON and throws a clear error if
 * either the request failed or the response wasn't valid JSON (e.g. a
 * platform crash page). Without this, `await res.json()` on a non-JSON
 * error page throws a confusing "Unexpected token..." parse error instead
 * of something a user (or a caller's catch block) can actually act on.
 */
export async function parseJsonResponse(res: Response): Promise<any> {
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new Error(
      res.ok
        ? 'The server sent back something unexpected. Please try again.'
        : `Something went wrong (status ${res.status}). Please try again.`
    );
  }
  if (!res.ok || body?.error) {
    throw new Error(body?.error || `Request failed (status ${res.status}).`);
  }
  return body;
}

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
