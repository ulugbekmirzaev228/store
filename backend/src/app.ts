import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import brandRoutes from './routes/brand.routes.js';
import installmentRoutes from './routes/installment.routes.js';
import applicationRoutes from './routes/application.routes.js';
import branchRoutes from './routes/branch.routes.js';
import bannerRoutes from './routes/banner.routes.js';
import settingRoutes from './routes/setting.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded media
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    brand: 'NasiyaGo Electronics',
    location: 'Tashkent, Uzbekistan',
    timestamp: new Date().toISOString(),
  });
});

// Mount Public REST APIs
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/installment', installmentRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/settings', settingRoutes);

// Mount Admin REST APIs
app.use('/api/v1/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server (skip if running in serverless environment like Vercel)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 NasiyaGo Backend REST API listening on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;
