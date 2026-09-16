import { db } from './firebaseAdmin.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

export const PLAN_LIMITS: Record<'free' | 'creator' | 'pro', number> = {
  free: 20,
  creator: 200,
  pro: 500,
};

export interface UserDoc {
  name: string;
  email: string;
  avatar: string;
  isDriveConnected: boolean;
  connectedDriveEmail?: string;
  // Short-lived Google OAuth access token (typically ~1hr), not a refresh
  // token. The client re-requests a new one via Google Identity Services
  // when this expires — see /api/drive/sync in server.ts.
  driveAccessToken?: string;
  driveTokenObtainedAt?: string;
  plan: 'free' | 'creator' | 'pro';
  captionsGenerated: number;
  billingCycleReset: string;
  brandVoiceProfile?: any;
  favoriteIds: string[];
  instagramConnection?: InstagramConnection;
}

export interface InstagramConnection {
  pageId: string;
  pageName: string;
  igUserId: string;
  igUsername: string;
  // Long-lived Page access token derived from a long-lived user token — in
  // practice these don't expire as long as the user doesn't revoke access,
  // but Meta doesn't formally guarantee that, so connectedAt is kept to
  // support a future "reconnect if older than N days" prompt.
  pageAccessToken: string;
  connectedAt: string;
}

export interface SocialPostDoc {
  platform: 'Instagram' | 'LinkedIn' | 'X' | 'Facebook';
  mediaUrl: string;
  mediaFilename?: string;
  accountHandle?: string;
  caption: string;
  tone?: string;
  status: 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduledFor?: string;
  publishedAt?: string;
  igMediaId?: string;
  postUrl?: string;
  error?: string;
  createdAt: string;
}

/** The frontend's SocialPost type (src/types.ts) predates this Instagram
 * work and uses snake_case field names — this maps our Firestore doc shape
 * to match it, rather than changing either side to match the other. */
export function toFrontendSocialPost(id: string, doc: SocialPostDoc) {
  return {
    id,
    media_filename: doc.mediaFilename || '',
    media_thumbnail: doc.mediaUrl,
    platform: doc.platform,
    account_handle: doc.accountHandle || '',
    caption_text: doc.caption,
    status: doc.status === 'scheduled' ? 'approved' : doc.status,
    user_approved: true,
    published_at: doc.publishedAt,
    scheduled_for: doc.scheduledFor,
    post_url: doc.postUrl,
  };
}

function usersCol() {
  return db.collection('users');
}

/**
 * Every request from an authenticated client hits this first. Firestore
 * doesn't have "insert if missing" as a single call, so we read, and only
 * write a fresh doc on genuine first sight of this uid.
 */
export async function getOrCreateUser(uid: string, email: string, name?: string, avatar?: string): Promise<UserDoc> {
  const ref = usersCol().doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    return snap.data() as UserDoc;
  }

  const newUser: UserDoc = {
    name: name || email.split('@')[0],
    email,
    avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
    isDriveConnected: false,
    plan: 'free',
    captionsGenerated: 0,
    billingCycleReset: new Date(Date.now() + 30 * 86400000).toISOString(),
    favoriteIds: [],
  };

  await ref.set(newUser);
  return newUser;
}

export async function getUser(uid: string): Promise<UserDoc | null> {
  const snap = await usersCol().doc(uid).get();
  return snap.exists ? (snap.data() as UserDoc) : null;
}

export async function updateUser(uid: string, patch: Partial<UserDoc>): Promise<void> {
  await usersCol().doc(uid).set(patch, { merge: true });
}

export function getUserUsage(user: UserDoc) {
  const plan = user.plan || 'free';
  return {
    plan,
    captionsGenerated: user.captionsGenerated || 0,
    limit: PLAN_LIMITS[plan] || 20,
    billingCycleReset: user.billingCycleReset,
  };
}

export async function incrementCaptionsGenerated(uid: string): Promise<void> {
  await usersCol().doc(uid).update({
    captionsGenerated: FieldValue.increment(1),
  });
}

// ---- Favorites ----
// Stored as an array on the user doc — fine at MVP scale (dozens/hundreds of
// favorites per user). Move to a subcollection if a user's favorite count
// starts running into the thousands.
export async function toggleFavorite(uid: string, mediaId: string): Promise<string[]> {
  const ref = usersCol().doc(uid);
  const snap = await ref.get();
  const current: string[] = (snap.data()?.favoriteIds as string[]) || [];
  const next = current.includes(mediaId)
    ? current.filter((id) => id !== mediaId)
    : [...current, mediaId];
  await ref.update({ favoriteIds: next });
  return next;
}

// ---- Caption history (subcollection: users/{uid}/captionHistory) ----
export async function listCaptionHistory(uid: string) {
  const snap = await usersCol().doc(uid).collection('captionHistory').orderBy('created_at', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addCaptionHistoryItem(uid: string, item: Record<string, any>) {
  const created_at = new Date().toISOString();
  const ref = await usersCol().doc(uid).collection('captionHistory').add({ ...item, created_at });
  return { id: ref.id, ...item, created_at };
}

export async function deleteCaptionHistoryItem(uid: string, id: string) {
  await usersCol().doc(uid).collection('captionHistory').doc(id).delete();
}

// ---- Imported/custom media (subcollection: users/{uid}/importedMedia) ----
export async function listImportedMedia(uid: string) {
  const snap = await usersCol().doc(uid).collection('importedMedia').orderBy('uploaded_at', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addImportedMedia(uid: string, media: Record<string, any>) {
  const uploaded_at = new Date().toISOString();
  const ref = await usersCol().doc(uid).collection('importedMedia').add({ ...media, uploaded_at });
  return { id: ref.id, ...media, uploaded_at };
}

// ---- Media analysis cache (subcollection: users/{uid}/mediaAnalysisCache) ----
// Scoped per-user rather than globally: two users could otherwise collide on
// a cache key derived from a Drive file id, leaking one user's private media
// analysis to another.
export async function getCachedAnalysis(uid: string, fileId: string) {
  const snap = await usersCol().doc(uid).collection('mediaAnalysisCache').doc(fileId).get();
  return snap.exists ? snap.data()?.analysis : null;
}

// ---- OAuth state bridging (top-level collection: oauthStates) ----
// Facebook's OAuth redirect is a plain GET request with no way to attach our
// Firebase ID token, so we can't use requireAuth on the callback route. This
// bridges the gap: connect-url stores {uid, createdAt} under a random state
// token before redirecting to Facebook, and the callback looks the uid up
// from the state Facebook hands back, then deletes it (single use).
export async function createOAuthState(uid: string, platform: string): Promise<string> {
  const state = `${platform}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await db.collection('oauthStates').doc(state).set({ uid, platform, createdAt: new Date().toISOString() });
  return state;
}

export async function consumeOAuthState(state: string): Promise<{ uid: string; platform: string } | null> {
  const ref = db.collection('oauthStates').doc(state);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data() as { uid: string; platform: string; createdAt: string };
  await ref.delete();
  // Reject states older than 10 minutes — an abandoned OAuth attempt
  // shouldn't stay valid indefinitely.
  if (Date.now() - new Date(data.createdAt).getTime() > 10 * 60 * 1000) return null;
  return { uid: data.uid, platform: data.platform };
}

// ---- Instagram connection (stored on the user doc) ----
export async function setInstagramConnection(uid: string, connection: InstagramConnection) {
  await updateUser(uid, { instagramConnection: connection });
}

export async function clearInstagramConnection(uid: string) {
  await usersCol().doc(uid).update({ instagramConnection: FieldValue.delete() });
}

// ---- Social posts (subcollection: users/{uid}/socialPosts) ----
export async function listSocialPosts(uid: string) {
  const snap = await usersCol().doc(uid).collection('socialPosts').orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => toFrontendSocialPost(d.id, d.data() as SocialPostDoc));
}

/** Raw (non-frontend-mapped) published Instagram posts, for the analytics
 * endpoint to fetch per-post insights against. Capped at `limit` most
 * recent to bound how many Graph API calls a single analytics page load
 * makes. Deliberately doesn't use orderBy in the query -- combined with the
 * two equality filters that would require another manual composite index
 * (same situation as the scheduled-posts cron query) -- sorts in memory
 * instead, which is fine at this data volume. */
export async function listPublishedInstagramPosts(uid: string, limit = 15) {
  const snap = await usersCol()
    .doc(uid)
    .collection('socialPosts')
    .where('platform', '==', 'Instagram')
    .where('status', '==', 'published')
    .get();
  const posts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as SocialPostDoc) }));
  posts.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return posts.slice(0, limit);
}

export async function countSocialPosts(uid: string): Promise<number> {
  const snap = await usersCol().doc(uid).collection('socialPosts').count().get();
  return snap.data().count;
}

export async function countSocialPostsByStatus(uid: string, status: SocialPostDoc['status']): Promise<number> {
  const snap = await usersCol().doc(uid).collection('socialPosts').where('status', '==', status).count().get();
  return snap.data().count;
}

export async function countCaptionHistory(uid: string): Promise<number> {
  const snap = await usersCol().doc(uid).collection('captionHistory').count().get();
  return snap.data().count;
}

export async function addSocialPost(uid: string, post: Omit<SocialPostDoc, 'createdAt'>) {
  const createdAt = new Date().toISOString();
  const ref = await usersCol().doc(uid).collection('socialPosts').add({ ...post, createdAt });
  return toFrontendSocialPost(ref.id, { ...post, createdAt } as SocialPostDoc);
}

export async function updateSocialPost(uid: string, postId: string, patch: Partial<SocialPostDoc>) {
  await usersCol().doc(uid).collection('socialPosts').doc(postId).set(patch, { merge: true });
}

// Used by the cron endpoint — scans every user's socialPosts subcollection
// for ones due to publish. Firestore collection group queries let us do
// this without iterating every user doc first.
export async function listDueScheduledPosts(nowIso: string) {
  const snap = await db
    .collectionGroup('socialPosts')
    .where('status', '==', 'scheduled')
    .where('scheduledFor', '<=', nowIso)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    uid: d.ref.parent.parent!.id,
    ...(d.data() as SocialPostDoc),
  }));
}

export async function setCachedAnalysis(uid: string, fileId: string, analysis: any) {
  await usersCol().doc(uid).collection('mediaAnalysisCache').doc(fileId).set({
    analysis,
    cachedAt: new Date().toISOString(),
  });
}
