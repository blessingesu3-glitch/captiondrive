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

export async function setCachedAnalysis(uid: string, fileId: string, analysis: any) {
  await usersCol().doc(uid).collection('mediaAnalysisCache').doc(fileId).set({
    analysis,
    cachedAt: new Date().toISOString(),
  });
}
