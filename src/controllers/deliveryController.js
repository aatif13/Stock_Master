import pool from '../config/db.js';
import { processDelivery } from '../services/stockService.js';

const generateDeliveryNumber = () => {
  return `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createDelivery = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { warehouse_id, customer_name, delivery_date, notes, items } = req.body;
    const deliveryNumber = generateDeliveryNumber();
    
    // Create delivery
    const deliveryResult = await client.query(
      `INSERT INTO deliveries (delivery_number, warehouse_id, customer_name, delivery_date, notes, created_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') 
       RETURNING *`,
      [deliveryNumber, warehouse_id, customer_name || null, delivery_date || new Date(), notes || null, req.user.id]
    );
    
    const delivery = deliveryResult.rows[0];
    
    // Create delivery items
    for (const item of items) {
      await client.query(
        `INSERT INTO delivery_items (delivery_id, product_id, location_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4, $5)`,
        [delivery.id, item.product_id, item.location_id, item.quantity, item.unit_price || null]
      );
    }
    
    await client.query('COMMIT');
    
    const fullDelivery = await getDeliveryById(delivery.id);
    res.status(201).json({ message: 'Delivery created', delivery: fullDelivery });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const validateDelivery = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    const delivery = await getDeliveryById(id, client);
    
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    
    if (delivery.status === 'validated') {
      return res.status(400).json({ error: 'Delivery already validated' });
    }
    
    if (delivery.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot validate cancelled delivery' });
    }
    
    // Process stock update
    await processDelivery(id, delivery.items, req.user.id, client);
    
    // Update delivery status
    await client.query(
      `UPDATE deliveries SET status = 'validated', validated_by = $1, validated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [req.user.id, id]
    );
    
    await client.query('COMMIT');
    
    const updatedDelivery = await getDeliveryById(id);
    res.json({ message: 'Delivery validated', delivery: updatedDelivery });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getDeliveries = async (req, res) => {
  try {
    const { status, warehouse_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT d.*, w.name as warehouse_name,
             u1.full_name as created_by_name, u2.full_name as validated_by_name
      FROM deliveries d
      JOIN warehouses w ON d.warehouse_id = w.id
      LEFT JOIN users u1 ON d.created_by = u1.id
      LEFT JOIN users u2 ON d.validated_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
    }
    
    if (warehouse_id) {
      paramCount++;
      query += ` AND d.warehouse_id = $${paramCount}`;
      params.push(warehouse_id);
    }
    
    query += ` ORDER BY d.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    for (const delivery of result.rows) {
      const itemsResult = await pool.query(
        `SELECT di.*, p.name as product_name, p.sku, l.name as location_name
         FROM delivery_items di
         JOIN products p ON di.product_id = p.id
         JOIN locations l ON di.location_id = l.id
         WHERE di.delivery_id = $1`,
        [delivery.id]
      );
      delivery.items = itemsResult.rows;
    }
    
    res.json({ deliveries: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDeliveryById = async (id, client = null) => {
  const db = client || pool;
  
  const result = await db.query(
    `SELECT d.*, w.name as warehouse_name,
            u1.full_name as created_by_name, u2.full_name as validated_by_name
     FROM deliveries d
     JOIN warehouses w ON d.warehouse_id = w.id
     LEFT JOIN users u1 ON d.created_by = u1.id
     LEFT JOIN users u2 ON d.validated_by = u2.id
     WHERE d.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const delivery = result.rows[0];
  
  const itemsResult = await db.query(
    `SELECT di.*, p.name as product_name, p.sku, l.name as location_name
     FROM delivery_items di
     JOIN products p ON di.product_id = p.id
     JOIN locations l ON di.location_id = l.id
     WHERE di.delivery_id = $1`,
    [id]
  );
  
  delivery.items = itemsResult.rows;
  return delivery;
};

