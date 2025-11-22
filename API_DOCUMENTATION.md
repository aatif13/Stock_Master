# StockMaster API Documentation

Base URL: `http://localhost:5000/api`

All endpoints require authentication except `/auth/*` endpoints.

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

## Products

### Create Product
```http
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "sku": "PROD-001",
  "name": "Product Name",
  "description": "Product description",
  "category_id": "uuid",
  "unit": "pcs",
  "reorder_level": 10
}
```

### Get Products
```http
GET /products?search=keyword&category_id=uuid&page=1&limit=50
Authorization: Bearer {token}
```

### Get Product
```http
GET /products/:id
Authorization: Bearer {token}
```

### Update Product
```http
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "reorder_level": 20
}
```

### Delete Product
```http
DELETE /products/:id
Authorization: Bearer {token}
```

## Receipts

### Create Receipt
```http
POST /receipts
Authorization: Bearer {token}
Content-Type: application/json

{
  "warehouse_id": "uuid",
  "supplier_name": "Supplier Name",
  "receipt_date": "2024-01-01",
  "notes": "Notes",
  "items": [
    {
      "product_id": "uuid",
      "location_id": "uuid",
      "quantity": 10,
      "unit_price": 100.00
    }
  ]
}
```

### Validate Receipt
```http
PUT /receipts/:id/validate
Authorization: Bearer {token}
```

### Get Receipts
```http
GET /receipts?status=draft&warehouse_id=uuid&page=1&limit=50
Authorization: Bearer {token}
```

## Deliveries

### Create Delivery
```http
POST /deliveries
Authorization: Bearer {token}
Content-Type: application/json

{
  "warehouse_id": "uuid",
  "customer_name": "Customer Name",
  "delivery_date": "2024-01-01",
  "notes": "Notes",
  "items": [
    {
      "product_id": "uuid",
      "location_id": "uuid",
      "quantity": 5,
      "unit_price": 100.00
    }
  ]
}
```

### Validate Delivery
```http
PUT /deliveries/:id/validate
Authorization: Bearer {token}
```

### Get Deliveries
```http
GET /deliveries?status=draft&warehouse_id=uuid&page=1&limit=50
Authorization: Bearer {token}
```

## Transfers

### Create Transfer
```http
POST /transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "from_warehouse_id": "uuid",
  "to_warehouse_id": "uuid",
  "transfer_date": "2024-01-01",
  "notes": "Notes",
  "items": [
    {
      "product_id": "uuid",
      "from_location_id": "uuid",
      "to_location_id": "uuid",
      "quantity": 5
    }
  ]
}
```

### Validate Transfer
```http
PUT /transfers/:id/validate
Authorization: Bearer {token}
```

### Get Transfers
```http
GET /transfers?status=draft&warehouse_id=uuid&page=1&limit=50
Authorization: Bearer {token}
```

## Adjustments

### Create Adjustment
```http
POST /adjustments
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": "uuid",
  "location_id": "uuid",
  "adjustment_type": "increase",
  "quantity": 10,
  "reason": "Stock correction",
  "adjustment_date": "2024-01-01"
}
```

### Get Adjustments
```http
GET /adjustments?product_id=uuid&location_id=uuid&page=1&limit=50
Authorization: Bearer {token}
```

## Dashboard

### Get KPIs
```http
GET /dashboard/kpis
Authorization: Bearer {token}

Response:
{
  "kpis": {
    "totalProducts": 100,
    "totalStock": 5000,
    "lowStockItems": 5,
    "pendingReceipts": 3,
    "pendingDeliveries": 2,
    "recentMovements": 50
  },
  "stockByCategory": [...],
  "recentTransactions": [...],
  "movementsChart": [...]
}
```

## Ledger

### Get Ledger
```http
GET /ledger?product_id=uuid&location_id=uuid&movement_type=receipt&page=1&limit=100
Authorization: Bearer {token}
```

## Meta Data

### Get Categories
```http
GET /meta/categories
Authorization: Bearer {token}
```

### Get Warehouses
```http
GET /meta/warehouses
Authorization: Bearer {token}
```

### Get Locations
```http
GET /meta/locations?warehouse_id=uuid
Authorization: Bearer {token}
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": ["Additional error details"]
}
```

Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

