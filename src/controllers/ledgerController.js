import pool from '../config/db.js';

export const getLedger = async (req, res) => {
  try {
    const { product_id, location_id, movement_type, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT l.*,
             p.name as product_name, p.sku,
             loc.name as location_name, w.name as warehouse_name,
             u.full_name as created_by_name
      FROM stock_ledger l
      JOIN products p ON l.product_id = p.id
      JOIN locations loc ON l.location_id = loc.id
      JOIN warehouses w ON loc.warehouse_id = w.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (product_id) {
      paramCount++;
      query += ` AND l.product_id = $${paramCount}`;
      params.push(product_id);
    }
    
    if (location_id) {
      paramCount++;
      query += ` AND l.location_id = $${paramCount}`;
      params.push(location_id);
    }
    
    if (movement_type) {
      paramCount++;
      query += ` AND l.movement_type = $${paramCount}`;
      params.push(movement_type);
    }
    
    query += ` ORDER BY l.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM stock_ledger WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;
    
    if (product_id) {
      countParamCount++;
      countQuery += ` AND product_id = $${countParamCount}`;
      countParams.push(product_id);
    }
    
    if (location_id) {
      countParamCount++;
      countQuery += ` AND location_id = $${countParamCount}`;
      countParams.push(location_id);
    }
    
    if (movement_type) {
      countParamCount++;
      countQuery += ` AND movement_type = $${countParamCount}`;
      countParams.push(movement_type);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      ledger: result.rows,
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

