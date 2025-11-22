import pool from '../src/config/db.js';
import bcrypt from 'bcryptjs';

async function seedData() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding database...');

    // Seed users
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    const userResult = await client.query(
      `INSERT INTO users (email, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@stockmaster.com', hashedPassword, 'Admin User', 'admin']
    );

    const userId = userResult.rows[0]?.id || (await client.query('SELECT id FROM users WHERE email = $1', ['admin@stockmaster.com'])).rows[0].id;

    // Seed categories
    const categories = [
      { name: 'Electronics', description: 'Electronic products and components' },
      { name: 'Clothing', description: 'Apparel and textiles' },
      { name: 'Food & Beverages', description: 'Food items and drinks' },
      { name: 'Office Supplies', description: 'Office equipment and supplies' },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (name, description) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO NOTHING`,
        [cat.name, cat.description]
      );
    }

    // Seed warehouses
    const warehouses = [
      { name: 'Main Warehouse', address: '123 Main St, City' },
      { name: 'Secondary Warehouse', address: '456 Oak Ave, City' },
    ];

    const warehouseIds = [];
    for (const wh of warehouses) {
      const result = await client.query(
        `INSERT INTO warehouses (name, address) 
         VALUES ($1, $2) 
         ON CONFLICT (name) DO NOTHING
         RETURNING id`,
        [wh.name, wh.address]
      );
      if (result.rows[0]) {
        warehouseIds.push(result.rows[0].id);
      } else {
        const existing = await client.query('SELECT id FROM warehouses WHERE name = $1', [wh.name]);
        warehouseIds.push(existing.rows[0].id);
      }
    }

    // Seed locations
    const locations = [
      { warehouse_id: warehouseIds[0], name: 'A1', description: 'Section A, Shelf 1' },
      { warehouse_id: warehouseIds[0], name: 'A2', description: 'Section A, Shelf 2' },
      { warehouse_id: warehouseIds[1], name: 'B1', description: 'Section B, Shelf 1' },
    ];

    const locationIds = [];
    for (const loc of locations) {
      const result = await client.query(
        `INSERT INTO locations (warehouse_id, name, description) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (warehouse_id, name) DO NOTHING
         RETURNING id`,
        [loc.warehouse_id, loc.name, loc.description]
      );
      if (result.rows[0]) {
        locationIds.push(result.rows[0].id);
      } else {
        const existing = await client.query(
          'SELECT id FROM locations WHERE warehouse_id = $1 AND name = $2',
          [loc.warehouse_id, loc.name]
        );
        locationIds.push(existing.rows[0].id);
      }
    }

    // Seed products
    const categoryResult = await client.query('SELECT id FROM categories WHERE name = $1', ['Electronics']);
    const categoryId = categoryResult.rows[0]?.id;

    const products = [
      { sku: 'PROD-001', name: 'Laptop Computer', category_id: categoryId, reorder_level: 10 },
      { sku: 'PROD-002', name: 'Wireless Mouse', category_id: categoryId, reorder_level: 50 },
      { sku: 'PROD-003', name: 'USB Cable', category_id: categoryId, reorder_level: 100 },
    ];

    const productIds = [];
    for (const prod of products) {
      const result = await client.query(
        `INSERT INTO products (sku, name, description, category_id, reorder_level) 
         VALUES ($1, $2, $3, $4, $5) 
         ON CONFLICT (sku) DO NOTHING
         RETURNING id`,
        [prod.sku, prod.name, `Sample ${prod.name}`, prod.category_id, prod.reorder_level]
      );
      if (result.rows[0]) {
        productIds.push(result.rows[0].id);
      } else {
        const existing = await client.query('SELECT id FROM products WHERE sku = $1', [prod.sku]);
        productIds.push(existing.rows[0].id);
      }
    }

    // Seed initial stock
    for (let i = 0; i < productIds.length; i++) {
      await client.query(
        `INSERT INTO stock (product_id, location_id, quantity) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (product_id, location_id) 
         DO UPDATE SET quantity = stock.quantity + $3`,
        [productIds[i], locationIds[0], 100 + (i * 10)]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed data created successfully!');
    console.log('📧 Default login: admin@stockmaster.com / Admin123!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedData();

