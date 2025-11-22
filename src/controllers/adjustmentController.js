import pool from '../config/db.js';
import { processAdjustment } from '../services/stockService.js';

const generateAdjustmentNumber = () => {
  return `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createAdjustment = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { product_id, location_id, adjustment_type, quantity, reason, adjustment_date } = req.body;
    const adjustmentNumber = generateAdjustmentNumber();
    
    // Create adjustment
    const adjustmentResult = await client.query(
      `INSERT INTO stock_adjustments 
       (adjustment_number, product_id, location_id, adjustment_type, quantity, reason, adjusted_by, adjustment_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        adjustmentNumber,
        product_id,
        location_id,
        adjustment_type,
        quantity,
        reason,
        req.user.id,
        adjustment_date || new Date(),
      ]
    );
    
    const adjustment = adjustmentResult.rows[0];
    
    // Process stock update
    await processAdjustment(adjustment.id, adjustment, req.user.id, client);
    
    await client.query('COMMIT');
    
    // Get full adjustment with product and location details
    const fullAdjustment = await getAdjustmentById(adjustment.id);
    res.status(201).json({ message: 'Adjustment created', adjustment: fullAdjustment });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getAdjustments = async (req, res) => {
  try {
    const { product_id, location_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT a.*, 
             p.name as product_name, p.sku,
             l.name as location_name, w.name as warehouse_name,
             u.full_name as adjusted_by_name
      FROM stock_adjustments a
      JOIN products p ON a.product_id = p.id
      JOIN locations l ON a.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN users u ON a.adjusted_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (product_id) {
      paramCount++;
      query += ` AND a.product_id = $${paramCount}`;
      params.push(product_id);
    }
    
    if (location_id) {
      paramCount++;
      query += ` AND a.location_id = $${paramCount}`;
      params.push(location_id);
    }
    
    query += ` ORDER BY a.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    res.json({ adjustments: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdjustmentById = async (id) => {
  const result = await pool.query(
    `SELECT a.*, 
            p.name as product_name, p.sku,
            l.name as location_name, w.name as warehouse_name,
            u.full_name as adjusted_by_name
     FROM stock_adjustments a
     JOIN products p ON a.product_id = p.id
     JOIN locations l ON a.location_id = l.id
     JOIN warehouses w ON l.warehouse_id = w.id
     LEFT JOIN users u ON a.adjusted_by = u.id
     WHERE a.id = $1`,
    [id]
  );
  
  return result.rows[0] || null;
};

