import pool from '../config/db.js';
import { processReceipt } from '../services/stockService.js';

const generateReceiptNumber = () => {
  return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createReceipt = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { warehouse_id, supplier_name, receipt_date, notes, items } = req.body;
    const receiptNumber = generateReceiptNumber();
    
    // Create receipt
    const receiptResult = await client.query(
      `INSERT INTO receipts (receipt_number, warehouse_id, supplier_name, receipt_date, notes, created_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') 
       RETURNING *`,
      [receiptNumber, warehouse_id, supplier_name || null, receipt_date || new Date(), notes || null, req.user.id]
    );
    
    const receipt = receiptResult.rows[0];
    
    // Create receipt items
    for (const item of items) {
      await client.query(
        `INSERT INTO receipt_items (receipt_id, product_id, location_id, quantity, unit_price) 
         VALUES ($1, $2, $3, $4, $5)`,
        [receipt.id, item.product_id, item.location_id, item.quantity, item.unit_price || null]
      );
    }
    
    await client.query('COMMIT');
    
    // Get full receipt with items
    const fullReceipt = await getReceiptById(receipt.id);
    
    res.status(201).json({ message: 'Receipt created', receipt: fullReceipt });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const validateReceipt = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Get receipt with items
    const receipt = await getReceiptById(id, client);
    
    if (!receipt) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    if (receipt.status === 'validated') {
      return res.status(400).json({ error: 'Receipt already validated' });
    }
    
    if (receipt.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot validate cancelled receipt' });
    }
    
    // Process stock update
    await processReceipt(id, receipt.items, req.user.id, client);
    
    // Update receipt status
    await client.query(
      `UPDATE receipts SET status = 'validated', validated_by = $1, validated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [req.user.id, id]
    );
    
    await client.query('COMMIT');
    
    const updatedReceipt = await getReceiptById(id);
    res.json({ message: 'Receipt validated', receipt: updatedReceipt });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getReceipts = async (req, res) => {
  try {
    const { status, warehouse_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT r.*, w.name as warehouse_name, 
             u1.full_name as created_by_name, u2.full_name as validated_by_name
      FROM receipts r
      JOIN warehouses w ON r.warehouse_id = w.id
      LEFT JOIN users u1 ON r.created_by = u1.id
      LEFT JOIN users u2 ON r.validated_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
    }
    
    if (warehouse_id) {
      paramCount++;
      query += ` AND r.warehouse_id = $${paramCount}`;
      params.push(warehouse_id);
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    // Get items for each receipt
    for (const receipt of result.rows) {
      const itemsResult = await pool.query(
        `SELECT ri.*, p.name as product_name, p.sku, l.name as location_name
         FROM receipt_items ri
         JOIN products p ON ri.product_id = p.id
         JOIN locations l ON ri.location_id = l.id
         WHERE ri.receipt_id = $1`,
        [receipt.id]
      );
      receipt.items = itemsResult.rows;
    }
    
    res.json({ receipts: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceiptById = async (id, client = null) => {
  const db = client || pool;
  
  const result = await db.query(
    `SELECT r.*, w.name as warehouse_name,
            u1.full_name as created_by_name, u2.full_name as validated_by_name
     FROM receipts r
     JOIN warehouses w ON r.warehouse_id = w.id
     LEFT JOIN users u1 ON r.created_by = u1.id
     LEFT JOIN users u2 ON r.validated_by = u2.id
     WHERE r.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const receipt = result.rows[0];
  
  const itemsResult = await db.query(
    `SELECT ri.*, p.name as product_name, p.sku, l.name as location_name
     FROM receipt_items ri
     JOIN products p ON ri.product_id = p.id
     JOIN locations l ON ri.location_id = l.id
     WHERE ri.receipt_id = $1`,
    [id]
  );
  
  receipt.items = itemsResult.rows;
  return receipt;
};

