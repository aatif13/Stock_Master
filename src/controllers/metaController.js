import pool from '../config/db.js';

export const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWarehouses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM warehouses WHERE is_active = true ORDER BY name');
    res.json({ warehouses: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLocations = async (req, res) => {
  try {
    const { warehouse_id } = req.query;
    
    let query = `
      SELECT l.*, w.name as warehouse_name
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE l.is_active = true
    `;
    const params = [];
    
    if (warehouse_id) {
      query += ' AND l.warehouse_id = $1';
      params.push(warehouse_id);
    }
    
    query += ' ORDER BY w.name, l.name';
    
    const result = await pool.query(query, params);
    res.json({ locations: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

