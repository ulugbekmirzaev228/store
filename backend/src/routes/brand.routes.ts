import { Router } from 'express';
import { BrandController } from '../controllers/brand.controller.js';

const router = Router();

router.get('/', BrandController.getBrands);

export default router;
