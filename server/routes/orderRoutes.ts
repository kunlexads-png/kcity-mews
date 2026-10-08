import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderByIdOrRef,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.ts';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Checkout creates order
router.post('/', optionalAuth, createOrder);

// Customer gets own orders
router.get('/my-orders', authenticate, getCustomerOrders);

// View specific order by ID or order number or ref
router.get('/lookup/:identifier', getOrderByIdOrRef);

// Admin order routes
router.get('/', authenticate, requireAdmin, getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
