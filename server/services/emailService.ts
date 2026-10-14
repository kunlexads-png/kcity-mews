import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const frontendUrl =
  process.env.FRONTEND_URL || 'http://localhost:3000';

const sender =
  process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('[Email Service] RESEND_API_KEY is missing.');
      return {
        success: false,
        error: 'Email service is not configured.',
      };
    }

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[Email Service Error]:', error);
      return { success: false, error };
    }

    console.log('[Email Service] Email accepted by Resend:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email Service Exception]:', error);
    return { success: false, error };
  }
}

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  token: string
) {
  const verificationUrl =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  return sendEmail(
    email,
    'Verify your KCity Mews email address',
    `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
          <h1>Welcome to KCity Mews, ${escapeHtml(fullName)}!</h1>
          <p>Thank you for creating your KCity Mews account.</p>
          <p>Please verify your email address using the button below.</p>
          <p style="margin:30px 0">
            <a href="${verificationUrl}"
               style="background:#111827;color:white;padding:14px 24px;text-decoration:none;border-radius:6px">
              Verify My Email
            </a>
          </p>
          <p>This link expires in 24 hours.</p>
          <p>If you did not create this account, you can ignore this email.</p>
          <p>Best regards,<br><strong>KCity Mews Team</strong></p>
        </body>
      </html>
    `
  );
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  token: string
) {
  const resetUrl =
    `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

  return sendEmail(
    email,
    'Reset your KCity Mews password',
    `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
          <h1>Password Reset</h1>
          <p>Hello ${escapeHtml(fullName)},</p>
          <p>We received a request to reset your KCity Mews password.</p>
          <p style="margin:30px 0">
            <a href="${resetUrl}"
               style="background:#111827;color:white;padding:14px 24px;text-decoration:none;border-radius:6px">
              Reset My Password
            </a>
          </p>
          <p>This link expires in 1 hour.</p>
          <p>If you did not request a password reset, you can ignore this email.</p>
          <p>Best regards,<br><strong>KCity Mews Team</strong></p>
        </body>
      </html>
    `
  );
}

export async function sendOrderStatusUpdateEmail(
  order: any,
  status: string
) {
  const email = order?.email ?? order?.customer_email;
  const name = order?.full_name ?? order?.customer_name ?? 'Customer';
  const orderId = order?.id ?? order?.order_number ?? 'your order';

  if (!email) {
    console.error('[Order Status Email] Customer email is missing.');
    return {
      success: false,
      error: 'Customer email is missing.',
    };
  }

  return sendEmail(
    String(email),
    `KCity Mews order update: ${status}`,
    `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
          <h1>Order Status Update</h1>
          <p>Hello ${escapeHtml(String(name))},</p>
          <p>The status of your KCity Mews order
             <strong>${escapeHtml(String(orderId))}</strong> has been updated.</p>
          <p>New status: <strong>${escapeHtml(status)}</strong></p>
          <p>Thank you for shopping with KCity Mews.</p>
          <p>Best regards,<br><strong>KCity Mews Team</strong></p>
        </body>
      </html>
    `
  );
}

export async function sendOrderConfirmationEmail(
  order: any,
  items: any[]
) {
  const email = order?.email ?? order?.customer_email;
  const name = order?.full_name ?? order?.customer_name ?? 'Customer';
  const orderId = order?.id ?? order?.order_number ?? 'your order';

  if (!email) {
    console.error('[Order Confirmation Email] Customer email is missing.');
    return {
      success: false,
      error: 'Customer email is missing.',
    };
  }

  const itemRows = (Array.isArray(items) ? items : [])
    .map((item: any) => {
      const itemName =
        item?.product_name ?? item?.name ?? item?.title ?? 'Product';
      const quantity = item?.quantity ?? 1;

      return `<li>${escapeHtml(String(itemName))} — Quantity: ${escapeHtml(String(quantity))}</li>`;
    })
    .join('');

  return sendEmail(
    String(email),
    'Your KCity Mews order confirmation',
    `
      <!DOCTYPE html>
      <html>
        <body style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:30px">
          <h1>Order Confirmed!</h1>
          <p>Hello ${escapeHtml(String(name))},</p>
          <p>Thank you for shopping with KCity Mews. Your order
             <strong>${escapeHtml(String(orderId))}</strong> has been confirmed.</p>
          <h2>Order Items</h2>
          <ul>${itemRows || '<li>Your order items are being processed.</li>'}</ul>
          <p>We will notify you when your order status changes.</p>
          <p>Best regards,<br><strong>KCity Mews Team</strong></p>
        </body>
      </html>
    `
  );
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const replacements: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return replacements[character];
  });
}

export const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderStatusUpdateEmail,
  sendOrderConfirmationEmail,
};

export const devRecentEmails: any[] = [];
