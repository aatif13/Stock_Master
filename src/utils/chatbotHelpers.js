import pool from '../config/db.js';

/**
 * Search products using natural language query
 */
export const searchProducts = async (query) => {
    try {
        const searchTerm = `%${query.toLowerCase()}%`;

        const result = await pool.query(
            `SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.stock_quantity,
        p.unit_price,
        p.reorder_level,
        p.description
      FROM products p
      WHERE 
        LOWER(p.product_name) LIKE $1 
        OR LOWER(p.category) LIKE $1 
        OR LOWER(p.description) LIKE $1
      ORDER BY p.product_name
      LIMIT 10`,
            [searchTerm]
        );

        return result.rows;
    } catch (error) {
        console.error('Product search error:', error);
        return [];
    }
};

/**
 * Get low stock products
 */
export const getLowStockProducts = async () => {
    try {
        const result = await pool.query(
            `SELECT 
        product_id,
        product_name,
        category,
        stock_quantity,
        reorder_level,
        unit_price
      FROM products
      WHERE stock_quantity <= reorder_level
      ORDER BY stock_quantity ASC
      LIMIT 20`
        );

        return result.rows;
    } catch (error) {
        console.error('Low stock query error:', error);
        return [];
    }
};

/**
 * Get specific product stock
 */
export const getProductStock = async (productName) => {
    try {
        const result = await pool.query(
            `SELECT product_name, stock_quantity, unit_price 
             FROM products 
             WHERE LOWER(product_name) LIKE $1`,
            [`%${productName.toLowerCase()}%`]
        );
        return result.rows;
    } catch (error) {
        console.error('Get product stock error:', error);
        return [];
    }
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = async () => {
    try {
        const result = await pool.query(
            `SELECT product_name, category, reorder_level 
             FROM products 
             WHERE stock_quantity = 0 
             ORDER BY product_name`
        );
        return result.rows;
    } catch (error) {
        console.error('Get out of stock error:', error);
        return [];
    }
};

/**
 * Get product reorder level
 */
export const getProductReorderLevel = async (productName) => {
    try {
        const result = await pool.query(
            `SELECT product_name, stock_quantity, reorder_level 
             FROM products 
             WHERE LOWER(product_name) LIKE $1`,
            [`%${productName.toLowerCase()}%`]
        );
        return result.rows;
    } catch (error) {
        console.error('Get reorder level error:', error);
        return [];
    }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (category) => {
    try {
        const result = await pool.query(
            `SELECT product_name, stock_quantity, unit_price 
             FROM products 
             WHERE LOWER(category) LIKE $1 
             LIMIT 20`,
            [`%${category.toLowerCase()}%`]
        );
        return result.rows;
    } catch (error) {
        console.error('Get category products error:', error);
        return [];
    }
};

/**
 * Get today's stock summary
 */
export const getTodayStockSummary = async () => {
    try {
        const [totalStock, totalValue, lowStock] = await Promise.all([
            pool.query('SELECT SUM(stock_quantity) as total FROM products'),
            pool.query('SELECT SUM(stock_quantity * unit_price) as value FROM products'),
            pool.query('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= reorder_level')
        ]);

        return {
            totalItems: totalStock.rows[0].total || 0,
            totalValue: totalValue.rows[0].value || 0,
            lowStockCount: lowStock.rows[0].count || 0
        };
    } catch (error) {
        console.error('Get today summary error:', error);
        return null;
    }
};

/**
 * Get dashboard summary
 */
export const getDashboardSummary = async () => {
    try {
        const [productsResult, lowStockResult, recentMovesResult] = await Promise.all([
            pool.query('SELECT COUNT(*) as total FROM products'),
            pool.query('SELECT COUNT(*) as total FROM products WHERE stock_quantity <= reorder_level'),
            pool.query(`
        SELECT COUNT(*) as total 
        FROM stock_ledger 
        WHERE created_at >= NOW() - INTERVAL '7 days'
      `),
        ]);

        return {
            totalProducts: parseInt(productsResult.rows[0].total),
            lowStockItems: parseInt(lowStockResult.rows[0].total),
            recentMoves: parseInt(recentMovesResult.rows[0].total),
        };
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return {
            totalProducts: 0,
            lowStockItems: 0,
            recentMoves: 0,
        };
    }
};

/**
 * Get module explanations
 */
export const getModuleExplanation = (module) => {
    const explanations = {
        receipts: {
            title: 'Receipts Module',
            description: 'The Receipts module is used to record incoming inventory from suppliers or vendors. When you receive stock, you create a receipt entry which automatically increases your product quantities.',
            features: [
                'Record incoming stock from suppliers',
                'Automatically update product quantities',
                'Track receipt dates and reference numbers',
                'View receipt history and details',
            ],
            usage: 'Navigate to Receipts → Create New Receipt → Select products and enter quantities → Submit',
        },
        deliveries: {
            title: 'Deliveries Module',
            description: 'The Deliveries module manages outgoing inventory to customers or other locations. Creating a delivery reduces your stock quantities and creates a record of the transaction.',
            features: [
                'Process outgoing stock to customers',
                'Automatically decrease product quantities',
                'Track delivery dates and destinations',
                'Maintain delivery history',
            ],
            usage: 'Navigate to Deliveries → Create New Delivery → Select products and quantities → Submit',
        },
        transfers: {
            title: 'Transfers Module',
            description: 'The Transfers module handles moving inventory between different locations or warehouses. This is useful for multi-location businesses.',
            features: [
                'Move stock between locations',
                'Track source and destination',
                'Maintain transfer history',
                'Monitor inter-location movements',
            ],
            usage: 'Navigate to Transfers → Create New Transfer → Select source/destination and products → Submit',
        },
        adjustments: {
            title: 'Adjustments Module',
            description: 'The Adjustments module is used to correct inventory discrepancies, record damaged goods, or make manual stock corrections. This helps maintain accurate inventory counts.',
            features: [
                'Correct inventory discrepancies',
                'Record damaged or lost items',
                'Manual stock adjustments',
                'Track adjustment reasons',
            ],
            usage: 'Navigate to Adjustments → Create New Adjustment → Select products and enter corrections → Provide reason → Submit',
        },
        products: {
            title: 'Products Module',
            description: 'The Products module is your master inventory catalog. Here you manage all product information, pricing, stock levels, and categories.',
            features: [
                'Add and edit products',
                'Set pricing and reorder levels',
                'Categorize products',
                'View current stock quantities',
            ],
            usage: 'Navigate to Products → Create New Product → Fill in details → Submit',
        },
        dashboard: {
            title: 'Dashboard',
            description: 'The Dashboard provides a comprehensive overview of your inventory system with key metrics, charts, and quick insights.',
            features: [
                'View total products and stock value',
                'Monitor low stock alerts',
                'Track recent inventory movements',
                'Visualize trends with charts',
            ],
            usage: 'The Dashboard is your home screen with real-time inventory insights',
        },
        history: {
            title: 'History/Ledger Module',
            description: 'The History module shows a complete audit trail of all inventory movements including receipts, deliveries, transfers, and adjustments.',
            features: [
                'Complete movement history',
                'Filter by date, product, or type',
                'Audit trail for compliance',
                'Track all stock changes',
            ],
            usage: 'Navigate to History → Use filters to find specific movements',
        },
    };

    return explanations[module.toLowerCase()] || null;
};

/**
 * Build system prompt for AI
 */
export const buildSystemPrompt = () => {
    return `You are an AI assistant for StockMaster, an inventory management system. Your role is to help users understand and navigate the system.

Key Modules:
- Products: Master inventory catalog
- Receipts: Incoming stock from suppliers
- Deliveries: Outgoing stock to customers
- Transfers: Moving stock between locations
- Adjustments: Correcting inventory discrepancies
- Dashboard: Overview and analytics
- History: Complete movement audit trail

Guidelines:
1. Be helpful, concise, and professional
2. Provide specific guidance when asked about modules
3. When users ask about products, search the database and provide relevant results
4. Alert users about low stock items when relevant
5. Explain inventory concepts in simple terms
6. Guide users through workflows step-by-step
7. Always be encouraging and supportive

Remember: You have access to real-time inventory data and can help with specific product queries.`;
};

/**
 * Detect user intent from message
 */
export const detectIntent = (message) => {
    const lowerMessage = message.toLowerCase();

    // Product search intent
    if (
        lowerMessage.includes('show') ||
        lowerMessage.includes('find') ||
        lowerMessage.includes('search') ||
        lowerMessage.includes('list') ||
        lowerMessage.includes('product')
    ) {
        return 'product_search';
    }

    // Low stock intent
    if (
        lowerMessage.includes('low stock') ||
        lowerMessage.includes('running low') ||
        lowerMessage.includes('reorder') ||
        lowerMessage.includes('stock alert')
    ) {
        return 'low_stock';
    }

    // Module explanation intent
    if (
        lowerMessage.includes('what is') ||
        lowerMessage.includes('explain') ||
        lowerMessage.includes('how do i') ||
        lowerMessage.includes('how to')
    ) {
        const modules = ['receipt', 'delivery', 'transfer', 'adjustment', 'product', 'dashboard', 'history'];
        for (const module of modules) {
            if (lowerMessage.includes(module)) {
                return { type: 'module_explanation', module };
            }
        }
    }

    // Dashboard/summary intent
    if (
        lowerMessage.includes('dashboard') ||
        lowerMessage.includes('summary') ||
        lowerMessage.includes('overview') ||
        lowerMessage.includes('stats')
    ) {
        return 'dashboard_summary';
    }

    // General conversation
    return 'general';
};
