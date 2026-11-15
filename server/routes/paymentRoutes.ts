
import { Router } from 'express';
import {
  initializePayment,
  verifyPayment,
  handleWebhook,
} from '../controllers/paymentController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

// Only authenticated users can initialize a payment
router.post('/initialize', authenticate, initializePayment);

// Keep verification available for the Paystack return flow
router.get('/verify/:reference', verifyPayment);

// Paystack server-to-server webhook
router.post('/webhook', handleWebhook);

export default router;
