import { Request, Response } from 'express';
import { z } from 'zod';
import { InstallmentService } from '../services/installment.service.js';

const calculateSchema = z.object({
  price: z.number().positive('Narx musbat son boʻlishi kerak'),
  termMonths: z.number().int().refine(val => [3, 6, 9, 12, 18, 24].includes(val), {
    message: 'Nasiya muddati 3, 6, 9 yoki 12 oy boʻlishi kerak',
  }),
  downPaymentAmount: z.number().min(0).optional(),
  downPaymentPercent: z.number().min(0).max(70).optional(),
  customMarkupPercent: z.number().min(0).optional(),
});

export class InstallmentController {
  static async getPlans(req: Request, res: Response) {
    const plans = await InstallmentService.getPlans();
    res.json(plans);
  }

  static async calculate(req: Request, res: Response) {
    const data = calculateSchema.parse(req.body);
    const result = await InstallmentService.calculate(data);
    res.json(result);
  }
}
