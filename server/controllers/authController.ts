
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../database/db.ts';
import { generateToken } from '../utils/jwt.ts';
import { emailService } from '../services/emailService.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export async function register(req: Request, res: Response) {
  try {
    const { fullName, email, phone, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, and password.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(fullName).trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userRes = await db.query(
      `INSERT INTO users
        (full_name, email, phone, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, phone, role, email_verified, created_at`,
      [
        normalizedName,
        normalizedEmail,
        phone ? String(phone).trim() : null,
        passwordHash,
        'customer',
        false,
      ]
    );

    const newUser = userRes.rows[0];

    // Create a verification token valid for 24 hours.
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      `INSERT INTO email_verification_tokens
        (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [newUser.id, verificationToken, expiresAt]
    );

    // Create the login token before attempting email delivery.
    const authToken = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Attempt to send the verification email.
    const emailResult = await emailService.sendVerificationEmail(
      newUser.email,
      newUser.full_name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error(
        '[Register] Verification email failed:',
        emailResult.error
      );

      return res.status(201).json({
        success: true,
        emailSent: false,
        message:
          'Your account was created, but the verification email could not be sent. Please use the resend verification option.',
        token: authToken,
        user: newUser,
      });
    }

    return res.status(201).json({
      success: true,
      emailSent: true,
      message:
        'Your account was created. Please check your email to verify your account.',
      token: authToken,
      user: newUser,
    });
  } catch (error: unknown) {
    console.error('[Register Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Verification token is missing or invalid.',
      });
    }

    const tokenRes = await db.query(
      `SELECT id, user_id, expires_at
       FROM email_verification_tokens
       WHERE token = $1`,
      [token]
    );

    if (!tokenRes.rowCount || tokenRes.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token or token has already been used.',
      });
    }

    const tokenRecord = tokenRes.rows[0];
    const expiresAt = new Date(tokenRecord.expires_at);

    if (expiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message:
          'Verification token has expired. Please request a new verification email.',
      });
    }

    await db.query(
      `UPDATE users
       SET email_verified = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [tokenRecord.user_id]
    );

    await db.query(
      'DELETE FROM email_verification_tokens WHERE id = $1',
      [tokenRecord.id]
    );

    const userRes = await db.query(
      `SELECT id, full_name, email, phone, role, email_verified
       FROM users
       WHERE id = $1`,
      [tokenRecord.user_id]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = userRes.rows[0];

    const authToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message:
        'Email verified successfully! Your KCity Mews account is now active.',
      token: authToken,
      user,
    });
  } catch (error: unknown) {
    console.error('[Verify Email Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error verifying email.',
    });
  }
}

export async function resendVerification(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await db.query(
      `SELECT id, full_name, email, email_verified
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    const user = userRes.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. You can log in.',
      });
    }

    // Generate a new token valid for 24 hours.
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Replace the old token only after preparing the new one.
    await db.query(
      'DELETE FROM email_verification_tokens WHERE user_id = $1',
      [user.id]
    );

    await db.query(
      `INSERT INTO email_verification_tokens
        (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, verificationToken, expiresAt]
    );

    const emailResult = await emailService.sendVerificationEmail(
      user.email,
      user.full_name,
      verificationToken
    );

    if (!emailResult.success) {
      console.error(
        '[Resend Verification] Email sending failed:',
        emailResult.error
      );

      return res.status(502).json({
        success: false,
        message:
          'We could not send your verification email. Please try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      emailSent: true,
      message:
        'Verification email submitted successfully. Please check your inbox and spam folder.',
    });
  } catch (error: unknown) {
    console.error('[Resend Verification Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification email.',
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const userRes = await db.query(
      `SELECT id, full_name, email, phone, password_hash, role, email_verified
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      email_verified: user.email_verified,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizedUser,
    });
  } catch (error: unknown) {
    console.error('[Login Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  try {
    const userRes = await db.query(
      `SELECT id, full_name, email, phone, role, email_verified, created_at
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      user: userRes.rows[0],
    });
  } catch (error: unknown) {
    console.error('[GetMe Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile.',
    });
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  try {
    const { full_name, phone } = req.body;

    if (
      typeof full_name !== 'string' ||
      full_name.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    const userRes = await db.query(
      `UPDATE users
       SET full_name = $1,
           phone = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, full_name, email, phone, role, email_verified`,
      [
        full_name.trim(),
        phone ? String(phone).trim() : null,
        req.user.userId,
      ]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: userRes.rows[0],
    });
  } catch (error: unknown) {
    console.error('[Update Profile Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update user profile.',
    });
  }
}

export async function changePassword(
  req: AuthenticatedRequest,
  res: Response
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const userRes = await db.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const user = userRes.rows[0];
    const matches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!matches) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [newHash, req.user.userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: unknown) {
    console.error('[Change Password Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please enter your email address.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userRes = await db.query(
      `SELECT id, full_name, email
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    // Do not disclose whether an account exists.
    if (!userRes.rowCount || userRes.rowCount === 0) {
      return res.status(200).json({
        success: true,
        message:
          'If an account with that email exists, password reset instructions will be sent.',
      });
    }

    const user = userRes.rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [user.id]
    );

    await db.query(
      `INSERT INTO password_reset_tokens
        (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      user.full_name,
      resetToken
    );

    if (!emailResult.success) {
      console.error(
        '[Forgot Password] Email sending failed:',
        emailResult.error
      );

      return res.status(502).json({
        success: false,
        message:
          'We could not send the password reset email. Please try again later.',
      });
    }

    return res.status(200).json({
      success: true,
      message:
        'If an account with that email exists, password reset instructions will be sent.',
    });
  } catch (error: unknown) {
    console.error('[Forgot Password Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error processing request.',
    });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const tokenRes = await db.query(
      `SELECT id, user_id, expires_at
       FROM password_reset_tokens
       WHERE token = $1`,
      [token]
    );

    if (!tokenRes.rowCount || tokenRes.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or already used password reset link.',
      });
    }

    const record = tokenRes.rows[0];

    if (new Date(record.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link has expired.',
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users
       SET password_hash = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [hash, record.user_id]
    );

    await db.query(
      'DELETE FROM password_reset_tokens WHERE id = $1',
      [record.id]
    );

    return res.status(200).json({
      success: true,
      message:
        'Your password has been updated successfully. You can now log in.',
    });
  } catch (error: unknown) {
    console.error('[Reset Password Error]:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error resetting password.',
    });
  }
}
