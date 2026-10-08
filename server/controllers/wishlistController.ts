import { Response } from 'express';
import { db } from '../database/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const result = await db.query(
      `SELECT p.*
       FROM products p
       INNER JOIN wishlists w ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      wishlist: result.rows,
      productIds: result.rows.map((p) => p.id),
    });
  } catch (error: any) {
    console.error('[Get Wishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { productId } = req.params;
  const prodIdNum = parseInt(productId, 10);
  if (isNaN(prodIdNum)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  try {
    await db.query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.userId, prodIdNum]
    );

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      productId: prodIdNum,
    });
  } catch (error: any) {
    console.error('[Add to Wishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { productId } = req.params;
  const prodIdNum = parseInt(productId, 10);
  if (isNaN(prodIdNum)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }

  try {
    await db.query(
      `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2`,
      [req.user.userId, prodIdNum]
    );

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      productId: prodIdNum,
    });
  } catch (error: any) {
    console.error('[Remove from Wishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
}

export async function syncWishlist(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const { productIds } = req.body;
  if (!Array.isArray(productIds)) {
    return res.status(400).json({ success: false, message: 'productIds must be an array' });
  }

  try {
    for (const pid of productIds) {
      const pNum = parseInt(pid, 10);
      if (!isNaN(pNum)) {
        await db.query(
          `INSERT INTO wishlists (user_id, product_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, product_id) DO NOTHING`,
          [req.user.userId, pNum]
        );
      }
    }

    const result = await db.query(
      `SELECT p.*
       FROM products p
       INNER JOIN wishlists w ON p.id = w.product_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.userId]
    );

    return res.status(200).json({
      success: true,
      wishlist: result.rows,
      productIds: result.rows.map((p) => p.id),
    });
  } catch (error: any) {
    console.error('[Sync Wishlist Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to sync wishlist' });
  }
}
