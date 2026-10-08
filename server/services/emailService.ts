import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const frontendUrl =
  process.env.FRONTEND_URL || 'http://localhost:3000';

export async function sendVerificationEmail(
  email: string,
  fullName: string,
  token: string
) {
  try {
    const verificationUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Verify your KCity Mews email address',

      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px; margin: 0;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">

              <h1 style="color: #333;">
                Welcome to KCity Mews, ${fullName}!
              </h1>

              <p>
                Thank you for creating your KCity Mews account.
              </p>

              <p>
                Please verify your email address by clicking the button below.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a
                  href="${verificationUrl}"
                  style="
                    background: #111827;
                    color: white;
                    padding: 14px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                  "
                >
                  Verify My Email
                </a>
              </div>

              <p>
                This verification link will expire in 24 hours.
              </p>

              <p>
                If you did not create this account, you can safely ignore this email.
              </p>

              <br>

              <p>
                Best regards,<br>
                <strong>KCity Mews Team</strong>
              </p>

            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Email Service Error]:', error);

      return {
        success: false,
        error,
      };
    }

    console.log('[Email Service] Verification email sent:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[Email Service Exception]:', error);

    return {
      success: false,
      error,
    };
  }
}

export async function sendPasswordResetEmail(
  email: string,
  fullName: string,
  token: string
) {
  try {
    const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject: 'Reset your KCity Mews password',

      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 30px; margin: 0;">
            <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 10px;">

              <h1 style="color: #333;">
                Password Reset
              </h1>

              <p>
                Hello ${fullName},
              </p>

              <p>
                We received a request to reset your KCity Mews password.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a
                  href="${resetUrl}"
                  style="
                    background: #111827;
                    color: white;
                    padding: 14px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                  "
                >
                  Reset My Password
                </a>
              </div>

              <p>
                This link will expire in 1 hour.
              </p>

              <p>
                If you did not request a password reset, you can safely ignore this email.
              </p>

              <br>

              <p>
                Best regards,<br>
                <strong>KCity Mews Team</strong>
              </p>

            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Password Reset Email Error]:', error);

      return {
        success: false,
        error,
      };
    }

    console.log('[Email Service] Password reset email sent:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[Password Reset Email Exception]:', error);

    return {
      success: false,
      error,
    };
  }
}

export const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
export const devRecentEmails: any[] = [];