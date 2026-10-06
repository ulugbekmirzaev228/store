import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export class BrandController {
  static async getBrands(req: Request, res: Response) {
    const brands = await prisma.brand.findMany({
      orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });

    res.json(brands);
  }
}
