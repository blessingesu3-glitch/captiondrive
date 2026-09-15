// Instagram publishing goes through Meta's Graph API using a Facebook Page
// that has an Instagram Business or Creator account linked to it — there is
// no direct "Instagram API" separate from this. See:
// https://developers.facebook.com/docs/instagram-platform/instagram-content-publishing

const GRAPH_VERSION = 'v21.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} in environment.`);
  return value;
}

export function getMetaAppId(): string {
  return requireEnv('META_APP_ID');
}

async function graphGet(path: string, params: Record<string, string>) {
  const url = `${GRAPH_BASE}${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Graph API GET ${path} failed (${res.status})`);
  }
  return data;
}

async function graphPost(path: string, params: Record<string, string>) {
  const url = `${GRAPH_BASE}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Graph API POST ${path} failed (${res.status})`);
  }
  return data;
}

/** Step 1 of OAuth: exchange the authorization code Facebook redirected back
 * with for a short-lived user access token. */
export async function exchangeCodeForUserToken(code: string, redirectUri: string): Promise<string> {
  const data = await graphGet('/oauth/access_token', {
    client_id: getMetaAppId(),
    client_secret: requireEnv('META_APP_SECRET'),
    redirect_uri: redirectUri,
    code,
  });
  return data.access_token;
}

/** Step 2: exchange the short-lived token for a long-lived one (~60 days). */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<string> {
  const data = await graphGet('/oauth/access_token', {
    grant_type: 'fb_exchange_token',
    client_id: getMetaAppId(),
    client_secret: requireEnv('META_APP_SECRET'),
    fb_exchange_token: shortLivedToken,
  });
  return data.access_token;
}

export interface DiscoveredInstagramAccount {
  pageId: string;
  pageName: string;
  pageAccessToken: string;
  igUserId: string;
  igUsername: string;
}

/** Step 3: find which of the user's Facebook Pages has an Instagram
 * Business/Creator account linked, and return everything needed to publish
 * to it. Returns null if none of the user's pages have Instagram linked. */
export async function discoverInstagramAccount(longLivedUserToken: string): Promise<DiscoveredInstagramAccount | null> {
  const pagesRes = await graphGet('/me/accounts', {
    access_token: longLivedUserToken,
    fields: 'id,name,access_token',
  });

  for (const page of pagesRes.data || []) {
    try {
      const igRes = await graphGet(`/${page.id}`, {
        access_token: page.access_token,
        fields: 'instagram_business_account',
      });
      const igUserId = igRes.instagram_business_account?.id;
      if (!igUserId) continue;

      const igProfile = await graphGet(`/${igUserId}`, {
        access_token: page.access_token,
        fields: 'username',
      });

      return {
        pageId: page.id,
        pageName: page.name,
        pageAccessToken: page.access_token,
        igUserId,
        igUsername: igProfile.username,
      };
    } catch {
      // This page doesn't have Instagram linked or the lookup failed —
      // keep checking the rest of the user's pages.
      continue;
    }
  }

  return null;
}

export interface PublishResult {
  igMediaId: string;
  postUrl: string;
}

/** Publishes a single image to Instagram. imageUrl must be publicly
 * fetchable by Meta's servers (no auth header support) — our Drive
 * thumbnail proxy and imported-media URLs both qualify. Video/Reels are not
 * supported by this function; that's a separate, more complex async flow. */
export async function publishImageToInstagram(
  igUserId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption: string
): Promise<PublishResult> {
  const container = await graphPost(`/${igUserId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: pageAccessToken,
  });

  const published = await graphPost(`/${igUserId}/media_publish`, {
    creation_id: container.id,
    access_token: pageAccessToken,
  });

  const permalinkRes = await graphGet(`/${published.id}`, {
    access_token: pageAccessToken,
    fields: 'permalink',
  });

  return { igMediaId: published.id, postUrl: permalinkRes.permalink };
}
