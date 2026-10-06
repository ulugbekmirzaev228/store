import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'nasiyago_super_secure_jwt_secret_key_tashkent_2026_998';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export function verifyAdminToken(req: NextRequest, allowedRoles: string[] = ['ADMIN', 'MANAGER', 'OPERATOR']): AuthUser | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return null;
    }
    return decoded;
  } catch (err) {
    return null;
  }
}
