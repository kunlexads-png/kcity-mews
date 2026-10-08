import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'kcity_mews_secret_jwt_key_2026_fashion_auth';
const JWT_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'customer' | 'admin';
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}
