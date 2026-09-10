import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from './firebaseAdmin.js';

// Augment Express's Request type so req.uid / req.userEmail are typed
// everywhere they're used, instead of casting `req as any` at every call site.
declare global {
  namespace Express {
    interface Request {
      uid?: string;
      userEmail?: string;
      userName?: string;
      userPicture?: string;
    }
  }
}

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * On success, attaches uid/email/name/picture to req and calls next().
 * On failure, responds 401 and does not call next().
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer (.+)$/);

  if (!match) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(match[1]);
    req.uid = decoded.uid;
    req.userEmail = decoded.email;
    req.userName = decoded.name;
    req.userPicture = decoded.picture;
    next();
  } catch (err) {
    console.warn('Failed to verify Firebase ID token:', err);
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}
