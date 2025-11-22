import pool from '../config/db.js';

export const getKPIs = async (req, res) => {
  try {
    // Total products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products WHERE is_active = true');
    const totalProducts = parseInt(productsResult.rows[0].count);
    
    // Total stock value (sum of all stock quantities)
    const stockResult = await pool.query('SELECT SUM(quantity) as total FROM stock');
    const totalStock = parseInt(stockResult.rows[0].total || 0);
    
    // Low stock items (below reorder level)
    const lowStockResult = await pool.query(
      `SELECT COUNT(DISTINCT s.product_id) as count
       FROM stock s
       JOIN products p ON s.product_id = p.id
       WHERE s.quantity <= p.reorder_level AND p.is_active = true`
    );
    const lowStockItems = parseInt(lowStockResult.rows[0].count);
    
    // Pending receipts
    const pendingReceiptsResult = await pool.query(
      "SELECT COUNT(*) as count FROM receipts WHERE status = 'draft'"
    );
    const pendingReceipts = parseInt(pendingReceiptsResult.rows[0].count);
    
    // Pending deliveries
    const pendingDeliveriesResult = await pool.query(
      "SELECT COUNT(*) as count FROM deliveries WHERE status = 'draft'"
    );
    const pendingDeliveries = parseInt(pendingDeliveriesResult.rows[0].count);
    
    // Recent movements (last 30 days)
    const recentMovementsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM stock_ledger 
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'`
    );
    const recentMovements = parseInt(recentMovementsResult.rows[0].count);
    
    // Stock by category
    const stockByCategoryResult = await pool.query(
      `SELECT c.name as category, COALESCE(SUM(s.quantity), 0) as total_stock
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       LEFT JOIN stock s ON p.id = s.product_id
       GROUP BY c.id, c.name
       ORDER BY total_stock DESC
       LIMIT 10`
    );
    
    // Recent transactions
    const recentTransactionsResult = await pool.query(
      `SELECT 
         'receipt' as type, receipt_number as number, created_at, status
       FROM receipts
       UNION ALL
       SELECT 
         'delivery' as type, delivery_number as number, created_at, status
       FROM deliveries
       UNION ALL
       SELECT 
         'transfer' as type, transfer_number as number, created_at, status
       FROM transfers
       ORDER BY created_at DESC
       LIMIT 10`
    );
    
    // Stock movements chart data (last 7 days)
    const movementsChartResult = await pool.query(
      `SELECT 
         DATE(created_at) as date,
         movement_type,
         SUM(ABS(quantity_change)) as total_movement
       FROM stock_ledger
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at), movement_type
       ORDER BY date, movement_type`
    );
    
    res.json({
      kpis: {
        totalProducts,
        totalStock,
        lowStockItems,
        pendingReceipts,
        pendingDeliveries,
        recentMovements,
      },
      stockByCategory: stockByCategoryResult.rows,
      recentTransactions: recentTransactionsResult.rows,
      movementsChart: movementsChartResult.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

