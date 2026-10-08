import { Request, Response } from 'express';
import { db } from '../database/db.ts';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const [
      usersCountRes,
      productsCountRes,
      ordersCountRes,
      paidOrdersCountRes,
      pendingOrdersCountRes,
      revenueRes,
      lowStockRes,
      recentOrdersRes,
      bestSellersRes,
    ] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'"),
      db.query("SELECT COUNT(*) as count FROM products"),
      db.query("SELECT COUNT(*) as count FROM orders"),
      db.query("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'Paid'"),
      db.query("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'Pending'"),
      db.query("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'Paid'"),
      db.query("SELECT id, name, category, stock_quantity, price, image_url FROM products WHERE stock_quantity <= 5 ORDER BY stock_quantity ASC"),
      db.query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 6"),
      db.query(`
        SELECT p.id, p.name, p.category, p.price, p.image_url,
               COALESCE(SUM(oi.quantity), 0) as units_sold,
               COALESCE(SUM(oi.quantity * oi.price), 0) as total_sales
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        LEFT JOIN orders o ON oi.order_id = o.id AND o.payment_status = 'Paid'
        GROUP BY p.id
        ORDER BY units_sold DESC
        LIMIT 5
      `),
    ]);

    // Sample chart distribution for visualization
    const salesOverTime = [
      { name: 'Mon', revenue: 65000, orders: 2 },
      { name: 'Tue', revenue: 95000, orders: 3 },
      { name: 'Wed', revenue: 142000, orders: 4 },
      { name: 'Thu', revenue: 110000, orders: 3 },
      { name: 'Fri', revenue: 210000, orders: 6 },
      { name: 'Sat', revenue: 285000, orders: 8 },
      { name: 'Sun', revenue: 195000, orders: 5 },
    ];

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers: parseInt(usersCountRes.rows[0].count, 10),
        totalProducts: parseInt(productsCountRes.rows[0].count, 10),
        totalOrders: parseInt(ordersCountRes.rows[0].count, 10),
        paidOrders: parseInt(paidOrdersCountRes.rows[0].count, 10),
        pendingOrders: parseInt(pendingOrdersCountRes.rows[0].count, 10),
        totalRevenue: Number(revenueRes.rows[0].total),
        lowStockCount: lowStockRes.rowCount,
        lowStockProducts: lowStockRes.rows,
        recentOrders: recentOrdersRes.rows,
        bestSellers: bestSellersRes.rows,
        salesOverTime,
      },
    });
  } catch (error: any) {
    console.error('[Admin Dashboard Stats Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard metrics.' });
  }
}

export async function getCustomers(req: Request, res: Response) {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.email_verified, u.created_at,
             COUNT(o.id) as order_count,
             COALESCE(SUM(CASE WHEN o.payment_status = 'Paid' THEN o.total_amount ELSE 0 END), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
    `;
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim().length > 0) {
      query += ` AND (LOWER(u.full_name) LIKE $1 OR LOWER(u.email) LIKE $1 OR LOWER(u.phone) LIKE $1)`;
      params.push(`%${search.trim().toLowerCase()}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const customersRes = await db.query(query, params);

    return res.status(200).json({
      success: true,
      customers: customersRes.rows,
    });
  } catch (error: any) {
    console.error('[Admin Get Customers Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
}

export async function getPayments(req: Request, res: Response) {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT p.*, o.order_number, o.customer_name, o.customer_email
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
    `;
    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (status && status !== 'All') {
      conditions.push(`p.status = $${pIdx}`);
      params.push(status);
      pIdx++;
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(p.reference ILIKE $${pIdx} OR o.order_number ILIKE $${pIdx} OR o.customer_email ILIKE $${pIdx})`);
      params.push(`%${search.trim()}%`);
      pIdx++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT 50`;

    const paymentsRes = await db.query(query, params);

    return res.status(200).json({
      success: true,
      payments: paymentsRes.rows,
    });
  } catch (error: any) {
    console.error('[Admin Get Payments Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve payments.' });
  }
}

export async function getInventory(req: Request, res: Response) {
  try {
    const productsRes = await db.query(`
      SELECT id, name, category, price, stock_quantity, size, color, image_url,
             CASE
               WHEN stock_quantity = 0 THEN 'OUT_OF_STOCK'
               WHEN stock_quantity <= 5 THEN 'LOW_STOCK'
               ELSE 'IN_STOCK'
             END as stock_status
      FROM products
      ORDER BY stock_quantity ASC, name ASC
    `);

    return res.status(200).json({
      success: true,
      inventory: productsRes.rows,
    });
  } catch (error: any) {
    console.error('[Admin Get Inventory Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve inventory data.' });
  }
}

export async function updateStock(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || isNaN(Number(stock_quantity))) {
      return res.status(400).json({ success: false, message: 'Valid stock quantity is required.' });
    }

    const qty = Math.max(0, parseInt(stock_quantity, 10));

    const result = await db.query(
      'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock_quantity',
      [qty, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Stock updated to ${qty} for ${result.rows[0].name}.`,
      product: result.rows[0],
    });
  } catch (error: any) {
    console.error('[Update Stock Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update stock.' });
  }
}

export async function subscribeNewsletter(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });
    }

    await db.query(
      `INSERT INTO newsletter_subscribers (email) VALUES ($1)
       ON CONFLICT (email) DO NOTHING`,
      [email.trim().toLowerCase()]
    );

    return res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to KCity Mews updates & exclusive drops!',
    });
  } catch (error: any) {
    console.error('[Newsletter Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to subscribe.' });
  }
}
