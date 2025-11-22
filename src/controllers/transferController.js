import pool from '../config/db.js';
import { processTransfer } from '../services/stockService.js';

const generateTransferNumber = () => {
  return `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

export const createTransfer = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { from_warehouse_id, to_warehouse_id, transfer_date, notes, items } = req.body;
    const transferNumber = generateTransferNumber();
    
    // Create transfer
    const transferResult = await client.query(
      `INSERT INTO transfers (transfer_number, from_warehouse_id, to_warehouse_id, transfer_date, notes, created_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'draft') 
       RETURNING *`,
      [transferNumber, from_warehouse_id, to_warehouse_id, transfer_date || new Date(), notes || null, req.user.id]
    );
    
    const transfer = transferResult.rows[0];
    
    // Create transfer items
    for (const item of items) {
      await client.query(
        `INSERT INTO transfer_items (transfer_id, product_id, from_location_id, to_location_id, quantity) 
         VALUES ($1, $2, $3, $4, $5)`,
        [transfer.id, item.product_id, item.from_location_id, item.to_location_id, item.quantity]
      );
    }
    
    await client.query('COMMIT');
    
    const fullTransfer = await getTransferById(transfer.id);
    res.status(201).json({ message: 'Transfer created', transfer: fullTransfer });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const validateTransfer = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    const transfer = await getTransferById(id, client);
    
    if (!transfer) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    if (transfer.status === 'validated') {
      return res.status(400).json({ error: 'Transfer already validated' });
    }
    
    if (transfer.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot validate cancelled transfer' });
    }
    
    // Process stock update
    await processTransfer(id, transfer.items, req.user.id, client);
    
    // Update transfer status
    await client.query(
      `UPDATE transfers SET status = 'validated', validated_by = $1, validated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [req.user.id, id]
    );
    
    await client.query('COMMIT');
    
    const updatedTransfer = await getTransferById(id);
    res.json({ message: 'Transfer validated', transfer: updatedTransfer });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const getTransfers = async (req, res) => {
  try {
    const { status, warehouse_id, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT t.*, 
             w1.name as from_warehouse_name, w2.name as to_warehouse_name,
             u1.full_name as created_by_name, u2.full_name as validated_by_name
      FROM transfers t
      JOIN warehouses w1 ON t.from_warehouse_id = w1.id
      JOIN warehouses w2 ON t.to_warehouse_id = w2.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.validated_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }
    
    if (warehouse_id) {
      paramCount++;
      query += ` AND (t.from_warehouse_id = $${paramCount} OR t.to_warehouse_id = $${paramCount})`;
      params.push(warehouse_id);
    }
    
    query += ` ORDER BY t.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(query, params);
    
    for (const transfer of result.rows) {
      const itemsResult = await pool.query(
        `SELECT ti.*, p.name as product_name, p.sku,
                l1.name as from_location_name, l2.name as to_location_name
         FROM transfer_items ti
         JOIN products p ON ti.product_id = p.id
         JOIN locations l1 ON ti.from_location_id = l1.id
         JOIN locations l2 ON ti.to_location_id = l2.id
         WHERE ti.transfer_id = $1`,
        [transfer.id]
      );
      transfer.items = itemsResult.rows;
    }
    
    res.json({ transfers: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTransferById = async (id, client = null) => {
  const db = client || pool;
  
  const result = await db.query(
    `SELECT t.*, 
            w1.name as from_warehouse_name, w2.name as to_warehouse_name,
            u1.full_name as created_by_name, u2.full_name as validated_by_name
     FROM transfers t
     JOIN warehouses w1 ON t.from_warehouse_id = w1.id
     JOIN warehouses w2 ON t.to_warehouse_id = w2.id
     LEFT JOIN users u1 ON t.created_by = u1.id
     LEFT JOIN users u2 ON t.validated_by = u2.id
     WHERE t.id = $1`,
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const transfer = result.rows[0];
  
  const itemsResult = await db.query(
    `SELECT ti.*, p.name as product_name, p.sku,
            l1.name as from_location_name, l2.name as to_location_name
     FROM transfer_items ti
     JOIN products p ON ti.product_id = p.id
     JOIN locations l1 ON ti.from_location_id = l1.id
     JOIN locations l2 ON ti.to_location_id = l2.id
     WHERE ti.transfer_id = $1`,
    [id]
  );
  
  transfer.items = itemsResult.rows;
  return transfer;
};

