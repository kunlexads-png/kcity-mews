import bcrypt from 'bcryptjs';
import { db } from './db.ts';

export async function initializeDatabase() {
  console.log('[DB] Running database migrations...');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50),
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'customer',
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100) NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      size VARCHAR(100) NOT NULL,
      color VARCHAR(100) NOT NULL,
      image_url TEXT NOT NULL,
      additional_images JSONB DEFAULT '[]'::jsonb,
      featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      shipping_address TEXT NOT NULL,
      city VARCHAR(100),
      state VARCHAR(100),
      country VARCHAR(100) DEFAULT 'Nigeria',
      total_amount NUMERIC(12, 2) NOT NULL,
      delivery_fee NUMERIC(12, 2) NOT NULL DEFAULT 2500.00,
      payment_reference VARCHAR(255),
      payment_status VARCHAR(50) DEFAULT 'Pending',
      order_status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name VARCHAR(255) NOT NULL,
      quantity INTEGER NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      size VARCHAR(50) NOT NULL,
      color VARCHAR(50) NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      reference VARCHAR(255) UNIQUE NOT NULL,
      amount NUMERIC(12, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'NGN',
      status VARCHAR(50) DEFAULT 'pending',
      paid_at TIMESTAMP WITH TIME ZONE,
      gateway_response JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wishlists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id)
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(payment_reference);
    CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
    CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
  `);

  console.log('[DB] Tables and indexes created successfully.');

  // Seed default admin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@kcitymews.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminSecure2026!';

  const existingAdmin = await db.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
  if (existingAdmin.rowCount === 0) {
    console.log(`[DB] Seeding default admin user (${adminEmail})...`);
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['KCity Mews Admin', adminEmail, '+234 801 234 5678', passwordHash, 'admin', true]
    );
  }

  // Seed customer account for testing
  const customerEmail = 'customer@kcitymews.com';
  const existingCustomer = await db.query('SELECT * FROM users WHERE email = $1', [customerEmail]);
  if (existingCustomer.rowCount === 0) {
    const custHash = await bcrypt.hash('Customer2026!', 10);
    await db.query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['Demilade Adewale', customerEmail, '+234 812 345 6789', custHash, 'customer', true]
    );
  }

  // Seed demo products if empty
  const countRes = await db.query('SELECT COUNT(*) as count FROM products');
  const count = parseInt(countRes.rows[0].count, 10);
  if (count === 0) {
    console.log('[DB] Seeding KCity Mews premium shoes and t-shirts...');
    const demoProducts = [
      {
        name: 'KCity Air Vanguard Luxe',
        description: 'Engineered high-top sneaker crafted with premium matte full-grain calfskin leather and chrome lace eyelets. Features an ultra-responsive impact-cushioning rubber cupsole designed for urban streets.',
        category: 'Shoes',
        price: 48500,
        stock_quantity: 15,
        size: '40, 41, 42, 43, 44, 45',
        color: 'Triple Black / Chrome',
        image_url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80'
        ]),
        featured: true,
      },
      {
        name: 'Urban Runner Stealth Velocity',
        description: 'Lightweight aerodynamic running silhouette featuring reinforced technical mesh upper and neon accents. Built for fast movement and superior breathability in tropical heat.',
        category: 'Shoes',
        price: 38000,
        stock_quantity: 8,
        size: '39, 40, 41, 42, 43, 44',
        color: 'Phantom Grey / Neon',
        image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([
          'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=80'
        ]),
        featured: true,
      },
      {
        name: 'Retro Court Classic Low',
        description: 'Timeless vintage low-top silhouette with crisp optic white leather and emerald green heel tabs. Reinforced toe bumper and Ortholite insole for all-day comfort.',
        category: 'Shoes',
        price: 32500,
        stock_quantity: 2, // Low stock demo!
        size: '41, 42, 43, 44',
        color: 'Crisp White / Emerald Green',
        image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: false,
      },
      {
        name: 'Solar Drift Chunky Sole',
        description: 'Statement chunky-sole footwear sculptured with layered suede and vegan leather panels. Architectural profile with high-traction geometric tread.',
        category: 'Shoes',
        price: 45000,
        stock_quantity: 11,
        size: '40, 41, 42, 43, 44',
        color: 'Sand Beige / Cream',
        image_url: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: true,
      },
      {
        name: 'Monochrome Street Highs',
        description: 'Contemporary monochrome high-top sneakers with double-stitched leather panels and padded heel collar. The ultimate companion for baggy streetwear denim.',
        category: 'Shoes',
        price: 52000,
        stock_quantity: 14,
        size: '41, 42, 43, 44, 45',
        color: 'Black / Off-White',
        image_url: 'https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: false,
      },
      {
        name: 'KCity Boxy Heavyweight Tee',
        description: '280 GSM heavyweight combed Egyptian cotton with ribbed 1.25" crewneck collar. Boxy drop-shoulder cut designed to hold its structural drape wash after wash.',
        category: 'T-Shirts',
        price: 18500,
        stock_quantity: 25,
        size: 'S, M, L, XL, XXL',
        color: 'Onyx Black',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80'
        ]),
        featured: true,
      },
      {
        name: 'Step In Stand Out Signature Tee',
        description: 'Official KCity Mews anthem tee featuring tactile rubberized puff typography across back shoulders and subtle minimalist brand crest on left chest.',
        category: 'T-Shirts',
        price: 19500,
        stock_quantity: 18,
        size: 'S, M, L, XL, XXL',
        color: 'Vintage Washed Grey',
        image_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: true,
      },
      {
        name: 'Raw Minimalist Crest Tee',
        description: 'Ultra-clean staple tee made with 240 GSM organic cotton. Features micro-embroidered KCity insignia on chest. Pre-shrunk and silicon-washed for exceptional softness.',
        category: 'T-Shirts',
        price: 16000,
        stock_quantity: 3, // Low stock demo!
        size: 'S, M, L, XL',
        color: 'Chalk White',
        image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: false,
      },
      {
        name: 'Cyber Mews Oversized Graphic Tee',
        description: 'Vibrant neon silkscreen graphic tee inspired by nocturnal Lagos energy and cyberpunk fashion. Relaxed oversized silhouette with double-needle hem.',
        category: 'T-Shirts',
        price: 21000,
        stock_quantity: 14,
        size: 'M, L, XL, XXL',
        color: 'Midnight Navy',
        image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: true,
      },
      {
        name: 'Charcoal Acid Mineral Tee',
        description: 'Individually artisanal mineral-washed cotton tee with subtle distressing at edges. Every single tee has a unique mottled acid-wash pattern.',
        category: 'T-Shirts',
        price: 22500,
        stock_quantity: 9,
        size: 'S, M, L, XL',
        color: 'Charcoal Mineral Wash',
        image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80',
        additional_images: JSON.stringify([]),
        featured: false,
      }
    ];

    for (const prod of demoProducts) {
      const res = await db.query(
        `INSERT INTO products (name, description, category, price, stock_quantity, size, color, image_url, additional_images, featured)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [prod.name, prod.description, prod.category, prod.price, prod.stock_quantity, prod.size, prod.color, prod.image_url, prod.additional_images, prod.featured]
      );
      const prodId = res.rows[0].id;
      // Add product_images entry
      await db.query(
        `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
        [prodId, prod.image_url]
      );
    }
    console.log('[DB] Demo products seeded successfully.');
  }

  // Seed sample initial order for dashboard statistics realism
  const orderCountRes = await db.query('SELECT COUNT(*) as count FROM orders');
  if (parseInt(orderCountRes.rows[0].count, 10) === 0) {
    const custRes = await db.query('SELECT id, full_name, email, phone FROM users WHERE role = $1 LIMIT 1', ['customer']);
    if (custRes.rowCount > 0) {
      const cust = custRes.rows[0];
      const prodRes = await db.query('SELECT id, name, price, size, color, image_url FROM products LIMIT 2');
      if (prodRes.rowCount >= 2) {
        const p1 = prodRes.rows[0];
        const p2 = prodRes.rows[1];
        const total = Number(p1.price) + Number(p2.price) + 2500;
        const ref = 'KCM_SEED_REF_' + Date.now();
        const ordRes = await db.query(
          `INSERT INTO orders (order_number, user_id, customer_name, customer_email, phone, shipping_address, city, state, total_amount, delivery_fee, payment_reference, payment_status, order_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
          ['KCM-10001', cust.id, cust.full_name, cust.email, cust.phone, '14 Admiralty Way, Lekki Phase 1', 'Lekki', 'Lagos', total, 2500, ref, 'Paid', 'Processing']
        );
        const orderId = ordRes.rows[0].id;

        await db.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size, color, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [orderId, p1.id, p1.name, 1, p1.price, '42', p1.color, p1.image_url]
        );

        await db.query(
          `INSERT INTO order_items (order_id, product_id, product_name, quantity, price, size, color, image_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [orderId, p2.id, p2.name, 1, p2.price, 'L', p2.color, p2.image_url]
        );

        await db.query(
          `INSERT INTO payments (user_id, order_id, reference, amount, currency, status, paid_at, gateway_response)
           VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)`,
          [cust.id, orderId, ref, total, 'NGN', 'successful', JSON.stringify({ gateway_response: 'Successful Paystack Seed Transaction', channel: 'card' })]
        );
      }
    }
  }

  console.log('[DB] Database migration and initial data ready.');
}
