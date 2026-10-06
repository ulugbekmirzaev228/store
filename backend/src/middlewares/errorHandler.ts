import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('API Error:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Maʼlumotlar toʻliq yoki toʻgʻri kiritilmadi',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  const status = err.status || 500;
  const message = err.message || 'Serverda ichki xatolik yuz berdi';

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
