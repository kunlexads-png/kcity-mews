import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.ts';
import { db } from '../database/db.ts';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & {
    full_name?: string;
    email_verified?: boolean;
    phone?: string;
  };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token. Please log in again.' });
  }

  try {
    const userRes = await db.query(
      'SELECT id, full_name, email, phone, role, email_verified FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({ success: false, message: 'User account no longer exists.' });
    }

    const dbUser = userRes.rows[0];
    req.user = {
      userId: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      full_name: dbUser.full_name,
      phone: dbUser.phone,
      email_verified: dbUser.email_verified,
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({ success: false, message: 'Authentication validation error.' });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Login required.' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }

  next();
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (decoded) {
    try {
      const userRes = await db.query(
        'SELECT id, full_name, email, phone, role, email_verified FROM users WHERE id = $1',
        [decoded.userId]
      );
      if (userRes.rowCount > 0) {
        const dbUser = userRes.rows[0];
        req.user = {
          userId: dbUser.id,
          email: dbUser.email,
          role: dbUser.role,
          full_name: dbUser.full_name,
          phone: dbUser.phone,
          email_verified: dbUser.email_verified,
        };
      }
    } catch {
      // Ignore in optional auth
    }
  }

  next();
}
