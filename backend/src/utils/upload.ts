import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { uploadToSupabaseStorage } from './supabase.js';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR) && !process.env.VERCEL) {
  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  } catch (_) {}
}

// Multer memory storage to allow Sharp conversion
const storage = multer.memoryStorage();

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllari (JPEG, PNG, WebP) yuklanishi mumkin!'));
    }
  },
}).single('image');

/**
 * Middleware to convert uploaded buffer to optimized WebP image and save to Supabase Storage or local disk
 */
export async function processToWebp(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return next();
  }

  try {
    const filename = `img_${Date.now()}_${Math.round(Math.random() * 1e6)}.webp`;

    // Process image with Sharp
    const webpBuffer = await sharp(req.file.buffer)
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    // 1. Try uploading to Supabase Storage if configured
    if (process.env.SUPABASE_URL) {
      try {
        const supabasePublicUrl = await uploadToSupabaseStorage(webpBuffer, filename, 'image/webp', 'images');
        if (supabasePublicUrl) {
          (req as any).processedImageUrl = supabasePublicUrl;
          return next();
        }
      } catch (supabaseErr) {
        console.error('Supabase upload failed, falling back to local/tmp storage:', supabaseErr);
      }
    }

    // 2. Fallback to disk / temporary storage
    const targetDir = process.env.VERCEL ? '/tmp' : UPLOADS_DIR;
    const outputPath = path.join(targetDir, filename);
    await fs.promises.writeFile(outputPath, webpBuffer);

    // Attach public URL path to request
    (req as any).processedImageUrl = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
}
