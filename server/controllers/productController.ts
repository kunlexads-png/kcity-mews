import { Request, Response } from 'express';
import { db } from '../database/db.ts';

export async function getProducts(req: Request, res: Response) {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      size,
      featured,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit as string, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (category && typeof category === 'string' && category.toLowerCase() !== 'all') {
      conditions.push(`LOWER(category) = LOWER($${paramIndex})`);
      params.push(category);
      paramIndex++;
    }

    if (featured === 'true') {
      conditions.push(`featured = TRUE`);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`;
      conditions.push(
        `(LOWER(name) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex} OR LOWER(color) LIKE $${paramIndex} OR LOWER(category) LIKE $${paramIndex})`
      );
      params.push(term);
      paramIndex++;
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      conditions.push(`price >= $${paramIndex}`);
      params.push(Number(minPrice));
      paramIndex++;
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      conditions.push(`price <= $${paramIndex}`);
      params.push(Number(maxPrice));
      paramIndex++;
    }

    if (size && typeof size === 'string' && size.trim().length > 0) {
      const sizePattern = `%${size.trim()}%`;
      conditions.push(`size LIKE $${paramIndex}`);
      params.push(sizePattern);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Sorting
    let orderBy = 'created_at DESC';
    if (sort === 'price-asc') {
      orderBy = 'price ASC';
    } else if (sort === 'price-desc') {
      orderBy = 'price DESC';
    } else if (sort === 'popular') {
      orderBy = 'featured DESC, stock_quantity DESC';
    } else if (sort === 'newest') {
      orderBy = 'created_at DESC';
    }

    // Count query
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const countRes = await db.query(countSql, params);
    const totalCount = parseInt(countRes.rows[0].total, 10);

    // Data query
    const dataSql = `
      SELECT id, name, description, category, price, stock_quantity, size, color,
             image_url, additional_images, featured, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataParams = [...params, limitNum, offset];
    const dataRes = await db.query(dataSql, dataParams);

    return res.status(200).json({
      success: true,
      products: dataRes.rows,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum) || 1,
      },
    });
  } catch (error: any) {
    console.error('[Get Products Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const prodRes = await db.query('SELECT * FROM products WHERE id = $1', [id]);

    if (prodRes.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const product = prodRes.rows[0];

    // Fetch any auxiliary images
    const imagesRes = await db.query(
      'SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY id ASC',
      [id]
    );

    let gallery: string[] = [];
    if (product.additional_images) {
      try {
        const parsed = typeof product.additional_images === 'string'
          ? JSON.parse(product.additional_images)
          : product.additional_images;
        if (Array.isArray(parsed)) gallery = parsed;
      } catch {
        gallery = [];
      }
    }

    const dbImageUrls = imagesRes.rows.map((r: any) => r.image_url);
    const combinedGallery = Array.from(new Set([product.image_url, ...gallery, ...dbImageUrls])).filter(Boolean);

    return res.status(200).json({
      success: true,
      product: {
        ...product,
        gallery: combinedGallery,
      },
    });
  } catch (error: any) {
    console.error('[Get Product Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
}

export async function createProduct(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      category,
      price,
      stock_quantity = 0,
      size,
      color,
      image_url,
      additional_images = [],
      featured = false,
    } = req.body;

    if (!name || !category || !price || !size || !color || !image_url) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, size, color, and image are required.',
      });
    }

    const validCategory = ['Shoes', 'T-Shirts'].includes(category) ? category : 'Shoes';
    const jsonAdditional = typeof additional_images === 'string'
      ? additional_images
      : JSON.stringify(additional_images);

    const resProd = await db.query(
      `INSERT INTO products (name, description, category, price, stock_quantity, size, color, image_url, additional_images, featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name.trim(),
        description || '',
        validCategory,
        Number(price),
        Math.max(0, parseInt(stock_quantity, 10)),
        size.trim(),
        color.trim(),
        image_url.trim(),
        jsonAdditional,
        Boolean(featured),
      ]
    );

    const newProd = resProd.rows[0];

    // Add main image to product_images table as well
    await db.query(
      `INSERT INTO product_images (product_id, image_url) VALUES ($1, $2)`,
      [newProd.id, newProd.image_url]
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProd,
    });
  } catch (error: any) {
    console.error('[Create Product Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category,
      price,
      stock_quantity,
      size,
      color,
      image_url,
      additional_images,
      featured,
    } = req.body;

    const existing = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const current = existing.rows[0];
    const jsonAdditional = additional_images !== undefined
      ? (typeof additional_images === 'string' ? additional_images : JSON.stringify(additional_images))
      : current.additional_images;

    const resUpdate = await db.query(
      `UPDATE products
       SET name = $1, description = $2, category = $3, price = $4, stock_quantity = $5,
           size = $6, color = $7, image_url = $8, additional_images = $9, featured = $10,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [
        name !== undefined ? name.trim() : current.name,
        description !== undefined ? description : current.description,
        category !== undefined ? category : current.category,
        price !== undefined ? Number(price) : current.price,
        stock_quantity !== undefined ? Math.max(0, parseInt(stock_quantity, 10)) : current.stock_quantity,
        size !== undefined ? size.trim() : current.size,
        color !== undefined ? color.trim() : current.color,
        image_url !== undefined ? image_url.trim() : current.image_url,
        jsonAdditional,
        featured !== undefined ? Boolean(featured) : current.featured,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product: resUpdate.rows[0],
    });
  } catch (error: any) {
    console.error('[Update Product Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await db.query('SELECT id, name FROM products WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    await db.query('DELETE FROM products WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: `Product "${existing.rows[0].name}" deleted successfully.`,
    });
  } catch (error: any) {
    console.error('[Delete Product Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
}
