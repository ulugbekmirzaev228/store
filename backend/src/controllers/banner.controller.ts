import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export class BannerController {
  static async getBanners(req: Request, res: Response) {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(banners);
  }
}
