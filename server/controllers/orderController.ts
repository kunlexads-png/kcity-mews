import { Request, Response } from 'express';
import { db } from '../database/db.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { emailService } from '../services/emailService.ts';

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const {
      fullName,
      email,
      phone,
      shippingAddress,
      city,
      state,
      country = 'Nigeria',
      items,
    } = req.body;

    if (!fullName || !email || !phone || !shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer details, shipping address, and at least one item.',
      });
    }

    const userId = req.user ? req.user.userId : null;

    // Validate product stock and prices
    const validatedItems: any[] = [];
    let itemsSubtotal = 0;

    for (const item of items) {
      const prodRes = await db.query(
        'SELECT id, name, price, stock_quantity, color, image_url FROM products WHERE id = $1',
        [item.productId]
      );

      if (prodRes.rowCount === 0) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found.`,
        });
      }

      const product = prodRes.rows[0];
      const requestedQty = Math.max(1, parseInt(item.quantity, 10) || 1);

      if (product.stock_quantity < requestedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock_quantity}, requested: ${requestedQty}.`,
        });
      }

      const price = Number(product.price);
      itemsSubtotal += price * requestedQty;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: requestedQty,
        size: item.size || 'Standard',
        color: item.color || product.color,
        imageUrl: item.imageUrl || product.image_url,
      });
    }

    const deliveryFee = 2500; // ₦2,500 standard delivery
    const totalAmount = itemsSubtotal + deliveryFee;

    const orderNumber = `KCM-${Math.floor(100000 + Math.random() * 900000)}`;
    const paymentReference = `KCM_REF_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Create Order in DB
    const orderRes = await db.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, phone,
        shipping_address, city, state, country, total_amount, delivery_fee,
        payment_reference, payment_status, order_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        orderNumber,
        userId,
        fullName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        shippingAddress.trim(),
        city ? city.trim() : null,
        state ? state.trim() : null,
        country ? country.trim() : 'Nigeria',
        totalAmount,
        deliveryFee,
        paymentReference,
        'Pending',
        'Pending',
      ]
    );

    const order = orderRes.rows[0];

    // Insert order items
    for (const item of validatedItems) {
      await db.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size, color, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [order.id, item.productId, item.name, item.quantity, item.price, item.size, item.color, item.imageUrl]
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully. Ready for payment.',
      order: {
        ...order,
        items: validatedItems,
      },
      paymentReference,
      totalAmount,
    });
  } catch (error: any) {
    console.error('[Create Order Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create order.' });
  }
}

export async function getCustomerOrders(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const ordersRes = await db.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.userId]
    );

    const orders = [];
    for (const ord of ordersRes.rows) {
      const itemsRes = await db.query(
        `SELECT * FROM order_items WHERE order_id = $1`,
        [ord.id]
      );
      orders.push({
        ...ord,
        items: itemsRes.rows,
      });
    }

    return res.status(200).json({ success: true, orders });
  } catch (error: any) {
    console.error('[Get Customer Orders Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
  }
}

export async function getOrderByIdOrRef(req: Request, res: Response) {
  try {
    const { identifier } = req.params;

    const orderRes = await db.query(
      `SELECT * FROM orders WHERE order_number = $1 OR payment_reference = $1 OR id::text = $1`,
      [identifier]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];
    const itemsRes = await db.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [order.id]
    );

    return res.status(200).json({
      success: true,
      order: {
        ...order,
        items: itemsRes.rows,
      },
    });
  } catch (error: any) {
    console.error('[Get Order Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
}

export async function getAllOrders(req: Request, res: Response) {
  try {
    const { status, search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (status && status !== 'All') {
      conditions.push(`order_status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        `(LOWER(order_number) LIKE $${pIdx} OR LOWER(customer_name) LIKE $${pIdx} OR LOWER(customer_email) LIKE $${pIdx} OR LOWER(payment_reference) LIKE $${pIdx})`
      );
      params.push(term);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) as total FROM orders ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].total, 10);

    const ordersRes = await db.query(
      `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`,
      [...params, limitNum, offset]
    );

    const fullOrders = [];
    for (const ord of ordersRes.rows) {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [ord.id]);
      fullOrders.push({
        ...ord,
        items: itemsRes.rows,
      });
    }

    return res.status(200).json({
      success: true,
      orders: fullOrders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('[Admin Orders Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
}

export async function updateOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(', ')}` });
    }

    const orderRes = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    await db.query(
      'UPDATE orders SET order_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );

    // Send customer update notification email
    emailService.sendOrderStatusUpdateEmail(order, status).catch(console.error);

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
    });
  } catch (error: any) {
    console.error('[Update Order Status Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}
