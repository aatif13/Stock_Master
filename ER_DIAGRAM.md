# StockMaster Database ER Diagram

```mermaid
erDiagram
    users ||--o{ receipts : creates
    users ||--o{ deliveries : creates
    users ||--o{ transfers : creates
    users ||--o{ stock_adjustments : creates
    users ||--o{ stock_ledger : creates
    
    categories ||--o{ products : "has"
    
    warehouses ||--o{ locations : "contains"
    warehouses ||--o{ receipts : "receives"
    warehouses ||--o{ deliveries : "ships"
    warehouses ||--o{ transfers : "from/to"
    
    locations ||--o{ stock : "stores"
    locations ||--o{ receipt_items : "receives"
    locations ||--o{ delivery_items : "ships"
    locations ||--o{ transfer_items : "from/to"
    locations ||--o{ stock_adjustments : "adjusted"
    locations ||--o{ stock_ledger : "tracks"
    
    products ||--o{ stock : "has"
    products ||--o{ receipt_items : "received"
    products ||--o{ delivery_items : "delivered"
    products ||--o{ transfer_items : "transferred"
    products ||--o{ stock_adjustments : "adjusted"
    products ||--o{ stock_ledger : "tracked"
    
    receipts ||--o{ receipt_items : "contains"
    
    deliveries ||--o{ delivery_items : "contains"
    
    transfers ||--o{ transfer_items : "contains"
    
    users {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        boolean is_active
        string otp_code
        timestamp otp_expires_at
        timestamp created_at
        timestamp updated_at
    }
    
    categories {
        uuid id PK
        string name UK
        text description
        timestamp created_at
        timestamp updated_at
    }
    
    warehouses {
        uuid id PK
        string name UK
        text address
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    locations {
        uuid id PK
        uuid warehouse_id FK
        string name
        text description
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    products {
        uuid id PK
        string sku UK
        string name
        text description
        uuid category_id FK
        string unit
        integer reorder_level
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    stock {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        integer quantity
        timestamp updated_at
    }
    
    receipts {
        uuid id PK
        string receipt_number UK
        uuid warehouse_id FK
        string supplier_name
        date receipt_date
        string status
        text notes
        uuid created_by FK
        uuid validated_by FK
        timestamp validated_at
        timestamp created_at
        timestamp updated_at
    }
    
    receipt_items {
        uuid id PK
        uuid receipt_id FK
        uuid product_id FK
        uuid location_id FK
        integer quantity
        decimal unit_price
        timestamp created_at
    }
    
    deliveries {
        uuid id PK
        string delivery_number UK
        uuid warehouse_id FK
        string customer_name
        date delivery_date
        string status
        text notes
        uuid created_by FK
        uuid validated_by FK
        timestamp validated_at
        timestamp created_at
        timestamp updated_at
    }
    
    delivery_items {
        uuid id PK
        uuid delivery_id FK
        uuid product_id FK
        uuid location_id FK
        integer quantity
        decimal unit_price
        timestamp created_at
    }
    
    transfers {
        uuid id PK
        string transfer_number UK
        uuid from_warehouse_id FK
        uuid to_warehouse_id FK
        date transfer_date
        string status
        text notes
        uuid created_by FK
        uuid validated_by FK
        timestamp validated_at
        timestamp created_at
        timestamp updated_at
    }
    
    transfer_items {
        uuid id PK
        uuid transfer_id FK
        uuid product_id FK
        uuid from_location_id FK
        uuid to_location_id FK
        integer quantity
        timestamp created_at
    }
    
    stock_adjustments {
        uuid id PK
        string adjustment_number UK
        uuid product_id FK
        uuid location_id FK
        string adjustment_type
        integer quantity
        text reason
        uuid adjusted_by FK
        date adjustment_date
        timestamp created_at
    }
    
    stock_ledger {
        uuid id PK
        uuid product_id FK
        uuid location_id FK
        string movement_type
        string reference_type
        uuid reference_id
        integer quantity_change
        integer quantity_before
        integer quantity_after
        text notes
        uuid created_by FK
        timestamp created_at
    }
```

## Key Relationships

1. **Users** can create receipts, deliveries, transfers, and adjustments
2. **Products** belong to categories and have stock at multiple locations
3. **Warehouses** contain multiple locations
4. **Locations** store stock for products
5. **Receipts** increase stock when validated
6. **Deliveries** decrease stock when validated
7. **Transfers** move stock between locations
8. **Adjustments** correct stock levels
9. **Stock Ledger** maintains an audit trail of all movements

