import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { products: { where: { isPublished: true } } },
        },
      },
    });

    res.json(categories);
  }
}
