# KCity Mews — "Step In. Stand Out."

A modern, responsive, full-stack Nigerian streetwear fashion e-commerce platform specializing in premium **Shoes and Heavyweight T-Shirts**, powered by Node.js, Express, PostgreSQL, JWT Authentication, and Paystack Payment Gateway.

---

## 1. Project Overview

**KCity Mews** is an e-commerce platform crafted with a minimalist streetwear aesthetic. Built with separation of concerns between client and server, the application delivers:

- **Storefront**: High-resolution sneaker & apparel discovery, category filtering, search, interactive sizing, stock limiting, shopping cart, and wishlist.
- **Paystack Payment Integration**: Secure Nigerian Naira (₦) checkout supporting Cards, Bank Transfers, and USSD with server-side transaction verification and tamper protection.
- **Customer Account**: Profile management, multi-step email verification, order history tracking, and password reset workflows.
- **Admin Command Center**: Role-gated dashboard (`role = 'admin'`), real-time revenue and sales velocity analytics, inventory depletion warnings, multi-image product management, customer CRM, and order fulfillment updates with automated transactional email triggers.

---

## 2. Technology Stack

### Frontend (Client-Side)
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7 (`react-router-dom`)
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend (Server-Side)
- **Runtime**: Node.js v22 (ES Modules)
- **Server Framework**: Express.js with TypeScript (`tsx`)
- **Database**: PostgreSQL (native `pg` pool + embedded PGlite for local/in-container environments)
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing
- **Payments**: Paystack API (Server-side initialization & verification, webhook HMAC SHA512 signature validation)
- **Email Service**: Nodemailer (HTML branded transactional templates & developer preview drawer)
- **File Uploads**: Multer (secured image uploads to `/uploads`)

---

## 3. Project Structure

```text
├── server/
│   ├── controllers/
│   │   ├── adminController.ts      # Dashboard metrics, customers CRM, inventory
│   │   ├── authController.ts       # Register, verify email, login, reset password
│   │   ├── orderController.ts      # Checkout, order creation, fulfillment status
│   │   ├── paymentController.ts    # Paystack init, verify, webhooks
│   │   └── productController.ts    # Product catalog, filter, multer image uploads
│   ├── database/
│   │   ├── db.ts                   # Unified PostgreSQL client wrapper
│   │   └── init.ts                 # DDL migration scripts & realistic seed data
│   ├── middleware/
│   │   └── auth.ts                 # Bearer JWT validator & requireAdmin guard
│   ├── routes/
│   │   ├── adminRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── devRoutes.ts
│   │   ├── orderRoutes.ts
│   │   ├── paymentRoutes.ts
│   │   └── productRoutes.ts
│   ├── services/
│   │   ├── emailService.ts         # Transactional email dispatcher & memory log
│   │   └── paystackService.ts      # Paystack transaction API client
│   └── utils/
│       └── jwt.ts                  # JWT token signer and verifier
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── DevEmailDrawer.tsx  # Floating dev inbox previewer
│   │   │   └── ProductCard.tsx     # Card with size chips, stock alerts & wishlist
│   │   ├── layout/
│   │   │   ├── Footer.tsx          # Brand footer, newsletter form, service info
│   │   │   └── Navbar.tsx          # Responsive navigation, search, cart/wishlist
│   │   └── paystack/
│   │       └── PaystackPaymentModal.tsx # Paystack modal with Card, Transfer & OTP
│   ├── context/
│   │   ├── AuthContext.tsx         # User session, login/logout, profile
│   │   ├── CartContext.tsx         # Bag state, subtotal, ₦2,500 delivery calculation
│   │   ├── ToastContext.tsx        # Toast notifications
│   │   └── WishlistContext.tsx     # Customer saved items
│   ├── pages/
│   │   ├── admin/                  # Protected Admin dashboard routes
│   │   ├── auth/                   # Login, Register, Verify Email, Forgot Password
│   │   ├── customer/               # Account profile, order tracking, wishlist
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PaymentSuccessPage.tsx
│   │   └── ShopPage.tsx
│   ├── services/
│   │   └── api.ts                  # Centralized API fetch wrapper with Bearer tokens
│   ├── types/
│   │   └── index.ts                # TypeScript domain models
│   ├── App.tsx                     # Route hierarchy
│   ├── index.css                   # Tailwind imports & typography
│   └── main.tsx                    # Client entry
├── server.ts                       # Full-Stack Express entry point & Vite middleware
├── package.json
└── tsconfig.json
```

---

## 4. Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Paystack Configuration
PAYSTACK_PUBLIC_KEY=pk_test_sample_paystack_key
PAYSTACK_SECRET_KEY=sk_test_sample_paystack_key
PAYSTACK_WEBHOOK_SECRET=

# Email Service (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM="KCity Mews <orders@kcitymews.com>"

# Default Admin Credentials
ADMIN_DEFAULT_EMAIL=admin@kcitymews.com
ADMIN_DEFAULT_PASSWORD=AdminSecure2026!
```

---

## 5. Local Installation & Development

### 1. Install dependencies
```bash
npm install
```

### 2. Start the full-stack server
```bash
npm run dev
```

The application runs on `http://localhost:3000`. The server runs Express with Vite middleware, providing hot client reloading and direct API endpoints under `/api/*`.

---

## 6. Default Seed Accounts

The database migrations seed initial demo accounts upon first startup:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@kcitymews.com` | `AdminSecure2026!` | `admin` |
| **Customer** | `customer@kcitymews.com` | `Customer2026!` | `customer` |

---

## 7. Paystack Payment Flow

1. **Checkout**: The customer fills out delivery address in `/checkout` and clicks **"Pay with Paystack"**.
2. **Order Creation**: The backend creates an order record in PostgreSQL with status `Pending` and generates a cryptographically random reference `KCM_REF_...`.
3. **Initialization**: Server initializes the Paystack payment session via `POST /api/payments/initialize`.
4. **Payment**: The customer completes authentication via Card, Bank Transfer, or USSD.
5. **Server Verification**: The client sends the reference to `GET /api/payments/verify/:reference`.
6. **Fulfillment**: The server queries Paystack API, validates the exact amount paid against order total, flags the order as `Paid` / `Processing`, decrements product inventory atomically, dispatches a confirmation email, and redirects to `/payment-success`.

---

## 8. Deployment Preparation

### Deployment to Render (Backend / Full-Stack)
1. Push your repository to GitHub.
2. In Render, create a new **Web Service**.
3. Set **Build Command**:
   ```bash
   npm install && npm run build
   ```
4. Set **Start Command**:
   ```bash
   npm start
   ```
5. Set environment variables: `DATABASE_URL` (provision Render PostgreSQL), `JWT_SECRET`, `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`.
6. Set `NODE_ENV=production`.

### Deployment to Vercel (Frontend SPA)
If deploying frontend separately:
- Set Root Directory to client.
- Set Build Command to `npm run build` and Output Directory to `dist`.
- Set `VITE_API_URL` to your deployed backend API URL (e.g. `https://kcity-mews-api.onrender.com/api`).
