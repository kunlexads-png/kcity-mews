import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist,
} from '../controllers/wishlistController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.get('/', authenticate, getWishlist);
router.post('/sync', authenticate, syncWishlist);
router.post('/:productId', authenticate, addToWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);

export default router;
