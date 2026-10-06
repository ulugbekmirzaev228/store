import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, UserPayload, UserRole } from '../types/index.js';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi (Token mavjud emas)' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'nasiyago_default_secret';
    const decoded = jwt.verify(token, secret) as UserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Yaroqsiz yoki muddati oʻtgan token' });
  }
}

export function authorize(roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Avtorizatsiya talab qilinadi' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Ushbu amalni bajarish uchun ruxsat yetarli emas' });
    }

    next();
  };
}
