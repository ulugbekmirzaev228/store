import { Router } from 'express';
import { InstallmentController } from '../controllers/installment.controller.js';

const router = Router();

router.get('/plans', InstallmentController.getPlans);
router.post('/calculate', InstallmentController.calculate);

export default router;
