import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.ts';

const router = Router();

router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', handleWebhook);

export default router;
