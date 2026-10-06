import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export class BranchController {
  static async getBranches(req: Request, res: Response) {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
    });
    res.json(branches);
  }
}
