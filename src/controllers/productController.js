import pool from '../config/db.js';

export const createProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { sku, name, description, category_id, reorder_level, stock } = req.body;

    console.log('📦 Creating product with data:', { sku, name, category_id, reorder_level, stock });

    // Create product
    const productResult = await client.query(
      `INSERT INTO products (sku, name, description, category_id, reorder_level) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [sku, name, description || null, category_id || null, reorder_level || 0]
    );

    const product = productResult.rows[0];
    console.log('✅ Product created:', product.id);

    // Handle stock if provided
    if (stock && stock > 0) {
      console.log('📊 Adding stock:', stock);

      // Get the first available location
      const locationResult = await client.query(
        `SELECT l.id 
         FROM locations l
         JOIN warehouses w ON l.warehouse_id = w.id
         WHERE l.is_active = true AND w.is_active = true
         ORDER BY w.created_at, l.created_at
         LIMIT 1`
      );

      if (locationResult.rows.length === 0) {
        throw new Error('No active location available. Please create a warehouse and location first.');
      }

      const location_id = locationResult.rows[0].id;
      console.log('📍 Using location:', location_id);

      // Insert stock record
      await client.query(
        `INSERT INTO stock (product_id, location_id, quantity)
         VALUES ($1, $2, $3)`,
        [product.id, location_id, stock]
      );

      // Create stock ledger entry for audit trail
      await client.query(
        `INSERT INTO stock_ledger 
         (product_id, location_id, movement_type, reference_type, reference_id, 
          quantity_change, quantity_before, quantity_after, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          product.id,
          location_id,
          'adjustment',
          'initial_stock',
          product.id,
          stock,
          0,
          stock,
          'Initial stock during product creation',
          req.user?.id || null
        ]
      );

      console.log('✅ Stock added successfully');
    }

    await client.query('COMMIT');

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    await client.query('ROLLBACK');

    console.error('❌ Error creating product:', error.message);
    console.error('Error details:', error);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT SUM(quantity) FROM stock WHERE product_id = p.id) as total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (category_id) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(category_id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR sku ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    if (category_id) {
      countParamCount++;
      countQuery += ` AND category_id = $${countParamCount}`;
      countParams.push(category_id);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name 
       FROM products p 
       LEFT JOIN categories c ON p.category_id = c.id 
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get stock by location
    const stockResult = await pool.query(
      `SELECT s.*, l.name as location_name, l.warehouse_id, w.name as warehouse_name
       FROM stock s
       JOIN locations l ON s.location_id = l.id
       JOIN warehouses w ON l.warehouse_id = w.id
       WHERE s.product_id = $1
       ORDER BY w.name, l.name`,
      [id]
    );

    res.json({
      product: result.rows[0],
      stock: stockResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_id, reorder_level, is_active } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 0;

    if (name !== undefined) {
      updates.push(`name = $${++paramCount}`);
      params.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${++paramCount}`);
      params.push(description);
    }
    if (category_id !== undefined) {
      updates.push(`category_id = $${++paramCount}`);
      params.push(category_id);
    }
    if (reorder_level !== undefined) {
      updates.push(`reorder_level = $${++paramCount}`);
      params.push(reorder_level);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${++paramCount}`);
      params.push(is_active);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    const result = await pool.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${++paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product updated', product: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Cannot delete product with existing transactions' });
    }
    res.status(500).json({ error: error.message });
  }
};
