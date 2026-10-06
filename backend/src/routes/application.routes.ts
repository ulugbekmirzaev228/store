import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller.js';

const router = Router();

router.post('/', ApplicationController.submitApplication);
router.get('/status', ApplicationController.getStatus);

export default router;
