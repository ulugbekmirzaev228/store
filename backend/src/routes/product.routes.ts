import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/featured/hits-and-new', ProductController.getFeatured);
router.get('/search/suggestions', ProductController.getSearchSuggestions);
router.get('/:slug', ProductController.getProductBySlug);

export default router;
