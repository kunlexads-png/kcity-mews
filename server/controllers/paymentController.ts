import { Request, Response } from 'express';
import { db } from '../database/db.ts';
import { paystackService } from '../services/paystackService.ts';
import { emailService } from '../services/emailService.ts';

export async function initializePayment(req: Request, res: Response) {
  try {
    const { reference, orderId, email } = req.body;

    let orderQuery = '';
    let orderParams = [];

    if (reference) {
      orderQuery = 'SELECT * FROM orders WHERE payment_reference = $1';
      orderParams = [reference];
    } else if (orderId) {
      orderQuery = 'SELECT * FROM orders WHERE id = $1';
      orderParams = [orderId];
    } else {
      return res.status(400).json({ success: false, message: 'Reference or orderId is required.' });
    }

    const orderRes = await db.query(orderQuery, orderParams);
    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const order = orderRes.rows[0];

    const customerEmail = email || order.customer_email;
    const amount = Number(order.total_amount);

    const appUrl = (process.env.APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
    const callbackUrl = `${appUrl}/payment-success`;

    const paystackInit = await paystackService.initializeTransaction(
      customerEmail,
      amount,
      order.payment_reference,
      callbackUrl,
      {
        order_number: order.order_number,
        customer_name: order.customer_name,
        phone: order.phone,
      }
    );

    return res.status(200).json({
      success: true,
      data: paystackInit.data,
      publicKey: paystackService.getPublicKey(),
      isLiveConfigured: paystackService.isLiveConfigured(),
    });
  } catch (error: any) {
    console.error('[Payment Init Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to initialize payment: ' + error.message });
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ success: false, message: 'Payment reference is required.' });
    }

    const orderRes = await db.query('SELECT * FROM orders WHERE payment_reference = $1', [reference]);
    if (orderRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Order not found for reference: ' + reference });
    }

    const order = orderRes.rows[0];

    // Already marked as paid - return idempotent response
    if (order.payment_status === 'Paid') {
      const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      return res.status(200).json({
        success: true,
        message: 'Payment already verified.',
        order: {
          ...order,
          items: itemsRes.rows,
        },
      });
    }

    // Verify with Paystack server-side
    const verifyResult = await paystackService.verifyTransaction(reference, Number(order.total_amount));

    if (!verifyResult.status || verifyResult.data.status !== 'success') {
      await db.query("UPDATE orders SET payment_status = 'Failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [
        order.id,
      ]);

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed or was not completed.',
        status: verifyResult.data?.status || 'failed',
      });
    }

    // Success! Update Order and reduce inventory atomically
    await db.query(
      `UPDATE orders
       SET payment_status = 'Paid', order_status = 'Processing', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [order.id]
    );

    // Record in payments table
    await db.query(
      `INSERT INTO payments (user_id, order_id, reference, amount, currency, status, paid_at, gateway_response)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
       ON CONFLICT (reference) DO UPDATE
       SET status = 'successful', paid_at = CURRENT_TIMESTAMP`,
      [
        order.user_id,
        order.id,
        reference,
        order.total_amount,
        'NGN',
        'successful',
        JSON.stringify(verifyResult.data),
      ]
    );

    // Reduce product inventory
    const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
    for (const item of itemsRes.rows) {
      if (item.product_id) {
        await db.query(
          `UPDATE products
           SET stock_quantity = GREATEST(0, stock_quantity - $1),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }

    // Send order confirmation email
    emailService
  .sendOrderConfirmationEmail(order, itemsRes.rows)
  .catch((err: unknown) => {
    console.error('[Order Confirmation Email Error]:', err);
  });

    const updatedOrderRes = await db.query('SELECT * FROM orders WHERE id = $1', [order.id]);

    return res.status(200).json({
      success: true,
      message: 'Payment successfully verified!',
      order: {
        ...updatedOrderRes.rows[0],
        items: itemsRes.rows,
      },
    });
  } catch (error: any) {
    console.error('[Payment Verify Error]:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying payment.' });
  }
}

export async function handleWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const bodyStr = JSON.stringify(req.body);

    if (!signature || !paystackService.verifyWebhookSignature(bodyStr, signature)) {
      return res.status(401).send('Invalid webhook signature');
    }

    const event = req.body;
    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      console.log(`[Paystack Webhook] Charge succeeded for ref: ${reference}`);

      const orderRes = await db.query('SELECT * FROM orders WHERE payment_reference = $1', [reference]);
      if (orderRes.rowCount > 0 && orderRes.rows[0].payment_status !== 'Paid') {
        const order = orderRes.rows[0];
        await db.query(
          "UPDATE orders SET payment_status = 'Paid', order_status = 'Processing', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
          [order.id]
        );

        // Record payment
        await db.query(
          `INSERT INTO payments (user_id, order_id, reference, amount, currency, status, paid_at, gateway_response)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
           ON CONFLICT (reference) DO UPDATE SET status = 'successful'`,
          [order.user_id, order.id, reference, order.total_amount, 'NGN', 'successful', JSON.stringify(event.data)]
        );

        // Reduce stock
        const itemsRes = await db.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
        for (const item of itemsRes.rows) {
          if (item.product_id) {
            await db.query(
              'UPDATE products SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE id = $2',
              [item.quantity, item.product_id]
            );
          }
        }
      }
    }

    return res.status(200).send('Webhook acknowledged');
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return res.status(500).send('Server error');
  }
}
