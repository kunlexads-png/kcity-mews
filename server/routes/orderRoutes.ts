
import { Router } from 'express';
import {
  createOrder,
  getCustomerOrders,
  getOrderByIdOrRef,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.ts';
import { authenticate, requireAdmin } from '../middleware/auth.ts';

const router = Router();

// Only authenticated customers can create orders
router.post('/', authenticate, createOrder);

// Customer gets their own orders
router.get('/my-orders', authenticate, getCustomerOrders);

// View specific order by ID, order number or reference
router.get('/lookup/:identifier', getOrderByIdOrRef);

// Admin order routes
router.get('/', authenticate, requireAdmin, getAllOrders);
router.put('/:id/status', authenticate, requireAdmin, updateOrderStatus);

export default router;
