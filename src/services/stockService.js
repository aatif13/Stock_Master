import pool from '../config/db.js';

// Get current stock for a product at a location
export const getStock = async (productId, locationId) => {
  const result = await pool.query(
    'SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2',
    [productId, locationId]
  );
  return result.rows[0]?.quantity || 0;
};

// Update stock quantity
export const updateStock = async (productId, locationId, quantityChange, client = null) => {
  const db = client || pool;
  
  // Get current quantity
  const currentResult = await db.query(
    'SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2',
    [productId, locationId]
  );
  
  const currentQuantity = currentResult.rows[0]?.quantity || 0;
  const newQuantity = currentQuantity + quantityChange;
  
  if (newQuantity < 0) {
    throw new Error('Insufficient stock');
  }
  
  // Upsert stock
  await db.query(
    `INSERT INTO stock (product_id, location_id, quantity) 
     VALUES ($1, $2, $3) 
     ON CONFLICT (product_id, location_id) 
     DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP`,
    [productId, locationId, newQuantity]
  );
  
  return { before: currentQuantity, after: newQuantity };
};

// Add ledger entry
export const addLedgerEntry = async (
  productId,
  locationId,
  movementType,
  referenceType,
  referenceId,
  quantityChange,
  quantityBefore,
  quantityAfter,
  userId,
  notes = null,
  client = null
) => {
  const db = client || pool;
  
  await db.query(
    `INSERT INTO stock_ledger 
     (product_id, location_id, movement_type, reference_type, reference_id, 
      quantity_change, quantity_before, quantity_after, notes, created_by) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      productId,
      locationId,
      movementType,
      referenceType,
      referenceId,
      quantityChange,
      quantityBefore,
      quantityAfter,
      notes,
      userId,
    ]
  );
};

// Process receipt items (increase stock)
export const processReceipt = async (receiptId, items, userId, client) => {
  for (const item of items) {
    const { before, after } = await updateStock(
      item.product_id,
      item.location_id,
      item.quantity,
      client
    );
    
    await addLedgerEntry(
      item.product_id,
      item.location_id,
      'receipt',
      'receipt',
      receiptId,
      item.quantity,
      before,
      after,
      userId,
      `Receipt ${receiptId}`,
      client
    );
  }
};

// Process delivery items (decrease stock)
export const processDelivery = async (deliveryId, items, userId, client) => {
  for (const item of items) {
    // Check stock availability first
    const currentStock = await getStock(item.product_id, item.location_id);
    if (currentStock < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product_id} at location ${item.location_id}`
      );
    }
    
    const { before, after } = await updateStock(
      item.product_id,
      item.location_id,
      -item.quantity,
      client
    );
    
    await addLedgerEntry(
      item.product_id,
      item.location_id,
      'delivery',
      'delivery',
      deliveryId,
      -item.quantity,
      before,
      after,
      userId,
      `Delivery ${deliveryId}`,
      client
    );
  }
};

// Process transfer items (move stock)
export const processTransfer = async (transferId, items, userId, client) => {
  for (const item of items) {
    // Check stock availability at source
    const currentStock = await getStock(item.product_id, item.from_location_id);
    if (currentStock < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${item.product_id} at source location`
      );
    }
    
    // Decrease from source
    const { before: beforeFrom, after: afterFrom } = await updateStock(
      item.product_id,
      item.from_location_id,
      -item.quantity,
      client
    );
    
    await addLedgerEntry(
      item.product_id,
      item.from_location_id,
      'transfer_out',
      'transfer',
      transferId,
      -item.quantity,
      beforeFrom,
      afterFrom,
      userId,
      `Transfer out ${transferId}`,
      client
    );
    
    // Increase at destination
    const { before: beforeTo, after: afterTo } = await updateStock(
      item.product_id,
      item.to_location_id,
      item.quantity,
      client
    );
    
    await addLedgerEntry(
      item.product_id,
      item.to_location_id,
      'transfer_in',
      'transfer',
      transferId,
      item.quantity,
      beforeTo,
      afterTo,
      userId,
      `Transfer in ${transferId}`,
      client
    );
  }
};

// Process adjustment
export const processAdjustment = async (adjustmentId, adjustment, userId, client) => {
  const quantityChange =
    adjustment.adjustment_type === 'increase'
      ? adjustment.quantity
      : -adjustment.quantity;
  
  const { before, after } = await updateStock(
    adjustment.product_id,
    adjustment.location_id,
    quantityChange,
    client
  );
  
  await addLedgerEntry(
    adjustment.product_id,
    adjustment.location_id,
    'adjustment',
    'stock_adjustment',
    adjustmentId,
    quantityChange,
    before,
    after,
    userId,
    adjustment.reason,
    client
  );
};

