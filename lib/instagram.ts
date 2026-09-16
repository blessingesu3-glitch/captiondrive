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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Instagram processes an uploaded image asynchronously after container
 * creation — publishing before it's finished fails with "Media ID is not
 * available". This polls the container's status_code until it's FINISHED
 * (or ERROR / timeout), which is the documented pattern for this API. */
async function waitForContainerReady(containerId: string, accessToken: string, timeoutMs = 30000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await graphGet(`/${containerId}`, {
      access_token: accessToken,
      fields: 'status_code',
    });
    if (status.status_code === 'FINISHED') return;
    if (status.status_code === 'ERROR') {
      throw new Error('Instagram failed to process the image. Check that it meets Instagram\'s size/aspect-ratio requirements.');
    }
    await sleep(1500);
  }
  throw new Error('Timed out waiting for Instagram to finish processing the image.');
}

export interface PublishResult {
  igMediaId: string;
  postUrl: string;
}

/** Publishes a single image to Instagram. imageUrl must be publicly
 * fetchable by Meta's servers (no auth header support), and should be a
 * full-resolution image — Google Drive's small thumbnailLink crop can fail
 * Instagram's minimum resolution/aspect-ratio requirements. Video/Reels are
 * not supported by this function; that's a separate, more complex async
 * flow. */
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

  await waitForContainerReady(container.id, pageAccessToken);

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

// ---------------------------------------------------------------------------
// Insights (requires the instagram_manage_insights permission in addition to
// the scopes requested for publishing — an account connected before this was
// added will need to reconnect to grant it).
// ---------------------------------------------------------------------------

export interface AccountProfile {
  followersCount: number;
  mediaCount: number;
}

export async function getAccountProfile(igUserId: string, accessToken: string): Promise<AccountProfile> {
  const data = await graphGet(`/${igUserId}`, {
    access_token: accessToken,
    fields: 'followers_count,media_count',
  });
  return { followersCount: data.followers_count || 0, mediaCount: data.media_count || 0 };
}

/** Sums a daily time-series `reach` metric between two dates (inclusive).
 * Reach is a "time_series" metric type in the current Instagram Insights
 * API — each call returns one value per day in the range, which we sum for
 * a period total. Returns 0 (rather than throwing) on any failure, since a
 * single broken metric shouldn't take down the whole analytics page. */
export async function getAccountReach(igUserId: string, accessToken: string, since: Date, until: Date): Promise<number> {
  try {
    const data = await graphGet(`/${igUserId}/insights`, {
      access_token: accessToken,
      metric: 'reach',
      period: 'day',
      since: String(Math.floor(since.getTime() / 1000)),
      until: String(Math.floor(until.getTime() / 1000)),
    });
    const series = data.data?.[0]?.values || [];
    return series.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  } catch (err) {
    console.warn('Failed to fetch account reach insights:', err);
    return 0;
  }
}

export interface MediaInsights {
  reach: number;
  likes: number;
  comments: number;
  saved: number;
  shares: number;
  totalInteractions: number;
}

/** Per-post insights. Returns all-zero on failure (e.g. a post too old for
 * Meta's insights retention window) rather than throwing, so one bad post
 * doesn't break the whole analytics aggregation. */
export async function getMediaInsights(igMediaId: string, accessToken: string): Promise<MediaInsights> {
  const empty: MediaInsights = { reach: 0, likes: 0, comments: 0, saved: 0, shares: 0, totalInteractions: 0 };
  try {
    const data = await graphGet(`/${igMediaId}/insights`, {
      access_token: accessToken,
      metric: 'reach,likes,comments,saved,shares,total_interactions',
    });
    const byName: Record<string, number> = {};
    for (const m of data.data || []) {
      byName[m.name] = m.values?.[0]?.value ?? m.total_value?.value ?? 0;
    }
    return {
      reach: byName.reach || 0,
      likes: byName.likes || 0,
      comments: byName.comments || 0,
      saved: byName.saved || 0,
      shares: byName.shares || 0,
      totalInteractions: byName.total_interactions || 0,
    };
  } catch (err) {
    console.warn(`Failed to fetch media insights for ${igMediaId}:`, err);
    return empty;
  }
}

