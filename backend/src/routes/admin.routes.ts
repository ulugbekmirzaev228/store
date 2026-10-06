import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { uploadSingle, processToWebp } from '../utils/upload.js';

const router = Router();

// Require JWT for all admin routes
router.use(authenticate);

// 1. Dashboard analytics
router.get('/dashboard/stats', authorize(['ADMIN', 'MANAGER', 'OPERATOR']), AdminController.getDashboardStats);

// 2. Applications
router.get('/applications', authorize(['ADMIN', 'MANAGER', 'OPERATOR']), AdminController.getApplications);
router.patch('/applications/:id', authorize(['ADMIN', 'MANAGER', 'OPERATOR']), AdminController.updateApplication);
router.get('/applications/export/excel', authorize(['ADMIN', 'MANAGER']), AdminController.exportApplicationsToExcel);

// 3. Products CRUD
router.get('/products', authorize(['ADMIN', 'MANAGER', 'OPERATOR']), AdminController.getProducts);
router.post('/products', authorize(['ADMIN', 'MANAGER']), AdminController.createProduct);
router.put('/products/:id', authorize(['ADMIN', 'MANAGER']), AdminController.updateProduct);
router.delete('/products/:id', authorize(['ADMIN']), AdminController.deleteProduct);

// 4. Installment plans
router.get('/installment-plans', authorize(['ADMIN', 'MANAGER']), AdminController.getInstallmentPlans);
router.put('/installment-plans/:id', authorize(['ADMIN']), AdminController.updateInstallmentPlan);

// 5. Banners CRUD
router.get('/banners', authorize(['ADMIN', 'MANAGER']), AdminController.getBanners);
router.post('/banners', authorize(['ADMIN']), AdminController.createBanner);
router.delete('/banners/:id', authorize(['ADMIN']), AdminController.deleteBanner);

// 6. Branches CRUD
router.get('/branches', authorize(['ADMIN', 'MANAGER']), AdminController.getBranches);
router.post('/branches', authorize(['ADMIN']), AdminController.createBranch);
router.put('/branches/:id', authorize(['ADMIN']), AdminController.updateBranch);
router.delete('/branches/:id', authorize(['ADMIN']), AdminController.deleteBranch);

// 7. Users management
router.get('/users', authorize(['ADMIN']), AdminController.getUsers);

// 8. Image upload
router.post('/upload', authorize(['ADMIN', 'MANAGER']), uploadSingle, processToWebp, AdminController.uploadImage);

// 9. System settings
router.get('/settings', authorize(['ADMIN', 'MANAGER']), AdminController.getSettings);
router.put('/settings', authorize(['ADMIN']), AdminController.updateSettings);

export default router;
