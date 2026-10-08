import { Router } from 'express';
import {
  getDashboardStats,
  getCustomers,
  getPayments,
  getInventory,
  updateStock,
  subscribeNewsletter,
} from '../controllers/adminController.ts';
import { authenticate, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Public newsletter route
router.post('/newsletter', subscribeNewsletter);

// Protected Admin routes
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);
router.get('/customers', authenticate, requireAdmin, getCustomers);
router.get('/payments', authenticate, requireAdmin, getPayments);
router.get('/inventory', authenticate, requireAdmin, getInventory);
router.put('/inventory/:id', authenticate, requireAdmin, updateStock);

export default router;
