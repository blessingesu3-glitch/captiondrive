// LinkedIn publishing via the modern Posts API (self-serve "Share on
// LinkedIn" product, w_member_social scope — personal profile posting only;
// company pages need the separate w_organization_social scope, which is
// gated behind LinkedIn's partner approval process).
// https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
// https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api

const LINKEDIN_API_VERSION = '202509'; // LinkedIn-Version header, YYYYMM format
const LINKEDIN_API_BASE = 'https://api.linkedin.com';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment.`);
  return value;
}

export function getLinkedInClientId(): string {
  return requireEnv('LINKEDIN_CLIENT_ID');
}

async function apiRequest(path: string, options: RequestInit & { accessToken: string }) {
  const { accessToken, ...init } = options;
  const res = await fetch(`${LINKEDIN_API_BASE}${path}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'LinkedIn-Version': LINKEDIN_API_VERSION,
      'X-Restli-Protocol-Version': '2.0.0',
      ...(init.headers || {}),
    },
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;
  if (!res.ok) {
    throw new Error(data?.message || `LinkedIn API ${path} failed (${res.status})`);
  }
  return { data, headers: res.headers };
}

export interface LinkedInTokenResult {
  accessToken: string;
  expiresInSeconds: number;
}

/** Exchanges the authorization code LinkedIn redirected back with for an
 * access token. Unlike Meta, there is no long-lived-token exchange step --
 * this token is already the one used for API calls, valid ~60 days. There
 * is no refresh token on the self-serve product, so when it expires the
 * user reconnects the same way as the first time. */
export async function exchangeCodeForAccessToken(code: string, redirectUri: string): Promise<LinkedInTokenResult> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: getLinkedInClientId(),
      client_secret: requireEnv('LINKEDIN_CLIENT_SECRET'),
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error_description || data?.error || `LinkedIn token exchange failed (${res.status})`);
  }
  return { accessToken: data.access_token, expiresInSeconds: data.expires_in };
}

export interface LinkedInProfile {
  memberId: string; // OIDC "sub" -- used as urn:li:person:{memberId}
  name: string;
  pictureUrl?: string;
}

export async function getUserInfo(accessToken: string): Promise<LinkedInProfile> {
  const { data } = await apiRequest('/v2/userinfo', { method: 'GET', accessToken });
  return { memberId: data.sub, name: data.name, pictureUrl: data.picture };
}

export interface PublishResult {
  postUrn: string;
  postUrl: string;
}

/** Publishes a text-only post to the authenticated member's own feed. */
export async function publishTextPost(memberId: string, accessToken: string, text: string): Promise<PublishResult> {
  const authorUrn = `urn:li:person:${memberId}`;
  const { headers } = await apiRequest('/rest/posts', {
    method: 'POST',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  const postUrn = headers.get('x-restli-id') || '';
  return { postUrn, postUrl: postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : 'https://www.linkedin.com/feed/' };
}

/** Publishes an image post: registers an upload, PUTs the image bytes to
 * the URL LinkedIn returns, then creates the post referencing that image
 * asset. imageBuffer/mimeType come from our own server fetching the image
 * (e.g. from Google Drive) -- LinkedIn's upload endpoint doesn't accept a
 * remote URL directly the way Meta's does. */
export async function publishImagePost(
  memberId: string,
  accessToken: string,
  imageBuffer: Buffer,
  text: string
): Promise<PublishResult> {
  const authorUrn = `urn:li:person:${memberId}`;

  const { data: initData } = await apiRequest('/rest/images?action=initializeUpload', {
    method: 'POST',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
  });
  const uploadUrl: string = initData.value.uploadUrl;
  const imageUrn: string = initData.value.image;

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: imageBuffer,
  });
  if (!uploadRes.ok) {
    throw new Error(`LinkedIn image upload failed (${uploadRes.status})`);
  }

  const { headers } = await apiRequest('/rest/posts', {
    method: 'POST',
    accessToken,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      author: authorUrn,
      commentary: text,
      visibility: 'PUBLIC',
      distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
      content: { media: { id: imageUrn } },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  });
  const postUrn = headers.get('x-restli-id') || '';
  return { postUrn, postUrl: postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : 'https://www.linkedin.com/feed/' };
}
