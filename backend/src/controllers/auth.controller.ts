import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../types/index.js';

const loginSchema = z.object({
  email: z.string().email('Notoʻgʻri email formati'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat boʻlishi kerak'),
});

export class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Email yoki parol notoʻgʻri' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email yoki parol notoʻgʻri' });
    }

    const secret = process.env.JWT_SECRET || 'nasiyago_default_secret';
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    });
  }

  static async getMe(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: 'Avtorizatsiyadan oʻtilmagan' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
    }

    res.json(user);
  }
}
